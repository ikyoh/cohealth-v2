"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetCollection, useGetIRI } from "@/hooks/useQuery"
import dayjs from "@/utils/dayjs.config"
import { CalendarRange, ReceiptText } from "lucide-react"
import { useMemo, useState } from "react"

const CATEGORIES = ["A", "B", "C", "N"] as const

type Category = typeof CATEGORIES[number]
type CategoryTotals = Record<Category, number>

type UserReference = {
  "@id"?: string
  iri?: string
}

type EventService = {
  category?: string
  duration?: number
  cooperator?: UserReference | string
}

type EventOccurrence = {
  date?: string
  services?: EventService[]
}

type BillingEvent = {
  beginDate?: string
  owner?: UserReference | string
  services?: EventService[]
  recurrentEvents?: string | null
}

type MonthlySummary = {
  key: string
  label: string
  categories: CategoryTotals
}

const getDefaultStartDate = () =>
  dayjs().startOf("month").subtract(11, "month").format("YYYY-MM-DD")

const getDefaultEndDate = () => dayjs().format("YYYY-MM-DD")

const emptyCategories = (): CategoryTotals => ({
  A: 0,
  B: 0,
  C: 0,
  N: 0,
})

const getIri = (value?: UserReference | string | null) => {
  if (typeof value === "string") return value
  return value?.["@id"] || value?.iri || ""
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes} min`
  if (remainingMinutes === 0) return `${hours} h`

  return `${hours} h ${remainingMinutes} min`
}

const createMonths = (startDate: string, endDate: string): MonthlySummary[] => {
  const firstMonth = dayjs(startDate).startOf("month")
  const lastMonth = dayjs(endDate).startOf("month")
  const monthCount = lastMonth.diff(firstMonth, "month") + 1

  if (monthCount <= 0) return []

  return Array.from({ length: monthCount }, (_, index) => {
    const month = lastMonth.subtract(index, "month")

    return {
      key: month.format("YYYY-MM"),
      label: month.format("MMMM YYYY"),
      categories: emptyCategories(),
    }
  })
}

const getOccurrences = (event: BillingEvent): EventOccurrence[] => {
  if (!event.recurrentEvents) {
    return event.beginDate
      ? [{ date: event.beginDate, services: event.services || [] }]
      : []
  }

  try {
    const occurrences = JSON.parse(event.recurrentEvents)

    if (!Array.isArray(occurrences)) return []

    return occurrences.map(occurrence => ({
      date: occurrence.date,
      services: Array.isArray(occurrence.services)
        ? occurrence.services
        : event.services || [],
    }))
  } catch {
    return []
  }
}

export default function BillingContent() {
  const [startDate, setStartDate] = useState(getDefaultStartDate)
  const [endDate, setEndDate] = useState(getDefaultEndDate)
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetIRI("/current_user")
  const { data: events, isLoading: isLoadingEvents } = useGetCollection({
    entity: "events",
    searchParams: "pagination=false",
  })
  const hasInvalidRange = !startDate || !endDate || dayjs(endDate).isBefore(dayjs(startDate), "day")

  const months = useMemo(() => {
    if (hasInvalidRange) return []

    const result = createMonths(startDate, endDate)
    const currentUserIri = currentUser?.iri

    if (!currentUserIri) return result

    const rangeStart = dayjs(startDate).startOf("day")
    const rangeEnd = dayjs(endDate).endOf("day")
    const now = dayjs()
    const effectiveEnd = rangeEnd.isAfter(now) ? now : rangeEnd

    for (const event of (events?.member || []) as BillingEvent[]) {
      const eventOwnerIri = getIri(event.owner)

      for (const occurrence of getOccurrences(event)) {
        const occurrenceDate = dayjs(occurrence.date)

        if (
          !occurrenceDate.isValid()
          || occurrenceDate.isBefore(rangeStart)
          || occurrenceDate.isAfter(effectiveEnd)
        ) {
          continue
        }

        const month = result.find(item => item.key === occurrenceDate.format("YYYY-MM"))

        if (!month) continue

        for (const service of occurrence.services || []) {
          const category = service.category?.toUpperCase() as Category

          if (!CATEGORIES.includes(category)) continue

          const cooperatorIri = getIri(service.cooperator)
          const performedByCurrentUser = cooperatorIri === currentUserIri
            || (!cooperatorIri && eventOwnerIri === currentUserIri)

          if (performedByCurrentUser) {
            month.categories[category] += Number(service.duration || 0)
          }
        }
      }
    }

    return result
  }, [
    currentUser?.iri,
    endDate,
    events?.member,
    hasInvalidRange,
    startDate,
  ])

  if (isLoadingCurrentUser || isLoadingEvents) {
    return <Skeleton className="h-96 w-full" />
  }

  const totals = months.reduce((result, month) => {
    CATEGORIES.forEach(category => {
      result[category] += month.categories[category]
    })

    return result
  }, emptyCategories())
  const grandTotal = CATEGORIES.reduce(
    (duration, category) => duration + totals[category],
    0,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="size-5" />
            Période
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-52 space-y-2">
              <Label htmlFor="billing-start-date">Date de début</Label>
              <Input
                id="billing-start-date"
                type="date"
                value={startDate}
                max={endDate}
                onChange={event => setStartDate(event.target.value)}
              />
            </div>
            <div className="min-w-52 space-y-2">
              <Label htmlFor="billing-end-date">Date de fin</Label>
              <Input
                id="billing-end-date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={event => setEndDate(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStartDate(getDefaultStartDate())
                setEndDate(getDefaultEndDate())
              }}
            >
              12 derniers mois
            </Button>
          </div>
          {hasInvalidRange && (
            <p className="text-destructive mt-3 text-sm">
              La date de fin doit être postérieure ou égale à la date de début.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ReceiptText className="size-5" />
            Activité facturable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mois</TableHead>
                {CATEGORIES.map(category => (
                  <TableHead key={category} className="text-right">
                    Catégorie {category}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map(month => {
                const total = CATEGORIES.reduce(
                  (duration, category) => duration + month.categories[category],
                  0,
                )

                return (
                  <TableRow key={month.key}>
                    <TableCell className="font-medium capitalize">{month.label}</TableCell>
                    {CATEGORIES.map(category => (
                      <TableCell key={category} className="text-right">
                        {formatDuration(month.categories[category])}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-medium">
                      {formatDuration(total)}
                    </TableCell>
                  </TableRow>
                )
              })}
              {!hasInvalidRange && months.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    Aucun résultat pour cette période.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {!hasInvalidRange && months.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>Total période</TableCell>
                  {CATEGORIES.map(category => (
                    <TableCell key={category} className="text-right">
                      {formatDuration(totals[category])}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">{formatDuration(grandTotal)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
