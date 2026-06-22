"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetCollection } from "@/hooks/useQuery"
import { Clock3, UserRound, UsersRound } from "lucide-react"
import { useMemo } from "react"
import type { ReactNode } from "react"

const CATEGORIES = ["A", "B", "C", "N"] as const

type Category = typeof CATEGORIES[number]

type UserSummary = {
  iri: string
  name: string
  role: "referent" | "cooperator"
  categories: Record<Category, number>
}

type BillingUser = {
  "@id"?: string
  iri?: string
  firstname?: string
  lastname?: string
}

type EventService = {
  category?: string
  duration?: number
  cooperator?: BillingUser | string
}

type MissionEvent = {
  owner?: BillingUser | string
  services?: EventService[]
  recurrentEvents?: string | null
}

const emptyCategories = (): Record<Category, number> => ({
  A: 0,
  B: 0,
  C: 0,
  N: 0,
})

const getIri = (value?: BillingUser | string | null) => {
  if (typeof value === "string") return value
  return value?.["@id"] || value?.iri || ""
}

const getName = (user?: BillingUser | null, fallback = "Intervenant") =>
  [user?.firstname, user?.lastname].filter(Boolean).join(" ") || fallback

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes} min`
  if (remainingMinutes === 0) return `${hours} h`

  return `${hours} h ${remainingMinutes} min`
}

const getEventOccurrences = (event: MissionEvent): EventService[][] => {
  if (!event.recurrentEvents) {
    return [event.services || []]
  }

  try {
    const occurrences = JSON.parse(event.recurrentEvents)

    if (!Array.isArray(occurrences)) return []

    return occurrences.map(occurrence =>
      Array.isArray(occurrence.services) ? occurrence.services : event.services || []
    )
  } catch {
    return []
  }
}

export default function BillingTab({
  missionIri,
  owner,
  cooperators,
}: {
  missionIri: string
  owner?: BillingUser
  cooperators: BillingUser[]
}) {
  const searchParams = new URLSearchParams({
    mission: missionIri,
    pagination: "false",
  })
  const { data, isLoading } = useGetCollection({
    entity: "events",
    searchParams: searchParams.toString(),
  })

  const summaries = useMemo(() => {
    const ownerIri = getIri(owner)
    const users = new Map<string, UserSummary>()

    if (ownerIri) {
      users.set(ownerIri, {
        iri: ownerIri,
        name: getName(owner, "Référent"),
        role: "referent",
        categories: emptyCategories(),
      })
    }

    cooperators.forEach(cooperator => {
      const iri = getIri(cooperator)

      if (iri && !users.has(iri)) {
        users.set(iri, {
          iri,
          name: getName(cooperator, "Coopérateur"),
          role: "cooperator",
          categories: emptyCategories(),
        })
      }
    })

    for (const event of (data?.member || []) as MissionEvent[]) {
      const eventOwnerIri = getIri(event.owner) || ownerIri

      for (const services of getEventOccurrences(event)) {
        for (const service of services) {
          const category = service.category?.toUpperCase() as Category

          if (!CATEGORIES.includes(category)) continue

          const serviceCooperator = typeof service.cooperator === "object"
            ? service.cooperator
            : null
          const participantIri = getIri(service.cooperator) || eventOwnerIri

          if (!participantIri) continue

          if (!users.has(participantIri)) {
            users.set(participantIri, {
              iri: participantIri,
              name: getName(serviceCooperator, "Coopérateur"),
              role: participantIri === ownerIri ? "referent" : "cooperator",
              categories: emptyCategories(),
            })
          }

          users.get(participantIri)!.categories[category] += Number(service.duration || 0)
        }
      }
    }

    const all = Array.from(users.values())

    return {
      owner: all.find(summary => summary.role === "referent"),
      cooperators: all
        .filter(summary => summary.role === "cooperator")
        .sort((first, second) => first.name.localeCompare(second.name, "fr")),
    }
  }, [cooperators, data?.member, owner])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BillingSection
        title="Référent"
        icon={<UserRound className="size-5" />}
        summaries={summaries.owner ? [summaries.owner] : []}
        emptyMessage="Aucun temps n’est attribué au référent."
      />
      <BillingSection
        title="Coopérateurs"
        icon={<UsersRound className="size-5" />}
        summaries={summaries.cooperators}
        emptyMessage="Aucun coopérateur n’est associé à cette mission."
      />
    </div>
  )
}

function BillingSection({
  title,
  icon,
  summaries,
  emptyMessage,
}: {
  title: string
  icon: ReactNode
  summaries: UserSummary[]
  emptyMessage: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          <Badge variant="outline">{summaries.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {summaries.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intervenant</TableHead>
                {CATEGORIES.map(category => (
                  <TableHead key={category} className="text-right">
                    Catégorie {category}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map(summary => {
                const total = CATEGORIES.reduce(
                  (duration, category) => duration + summary.categories[category],
                  0,
                )

                return (
                  <TableRow key={summary.iri}>
                    <TableCell className="font-medium">{summary.name}</TableCell>
                    {CATEGORIES.map(category => (
                      <TableCell key={category} className="text-right">
                        <DurationValue minutes={summary.categories[category]} />
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold">
                      <DurationValue minutes={total} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function DurationValue({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex items-center justify-end gap-1">
      <Clock3 className="text-muted-foreground size-3.5" />
      <span>{formatDuration(minutes)}</span>
      <span className="text-muted-foreground text-xs">({minutes} min)</span>
    </span>
  )
}
