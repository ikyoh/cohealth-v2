"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetCollection } from "@/hooks/useQuery"
import { CircleX, Users } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

type Cooperator = {
  "@id": string
  uuid: string
  firstname?: string
  lastname?: string
  organizationName?: string
}

const getInitials = (cooperator: Cooperator) =>
  [cooperator.firstname, cooperator.lastname]
    .filter(Boolean)
    .map(value => value?.charAt(0).toUpperCase())
    .join("")

export function CooperatorFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedCooperators = searchParams.getAll("cooperator")
  const { data, isLoading } = useGetCollection({
    entity: "cooperators",
    searchParams: "shared=true&itemsPerPage=100",
  })

  const cooperators = useMemo<Cooperator[]>(
    () => data?.member || [],
    [data],
  )

  const updateSelection = (uuid: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    const nextSelection = new Set(params.getAll("cooperator"))

    if (checked) {
      nextSelection.add(uuid)
    } else {
      nextSelection.delete(uuid)
    }

    params.delete("cooperator")
    nextSelection.forEach(value => params.append("cooperator", value))

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const clearSelection = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("cooperator")

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium">Coopérateurs</h2>
          <p className="text-muted-foreground text-xs">
            Missions partagées
          </p>
        </div>
        {selectedCooperators.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={clearSelection}
          >
            <CircleX />
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : cooperators.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
          <Users className="mx-auto mb-2 size-5" />
          Aucune mission partagée avec un coopérateur.
        </div>
      ) : (
        <div className="space-y-1">
          {cooperators.map(cooperator => {
            const fullName = [cooperator.firstname, cooperator.lastname]
              .filter(Boolean)
              .join(" ")
            const checked = selectedCooperators.includes(cooperator.uuid)

            return (
              <label
                key={cooperator.uuid}
                className="hover:bg-sidebar-accent flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={value =>
                    updateSelection(cooperator.uuid, value === true)
                  }
                  aria-label={`Filtrer les événements de ${fullName}`}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {fullName || "Coopérateur"}
                  </span>
                  {cooperator.organizationName && (
                    <span className="text-muted-foreground block truncate text-xs">
                      {cooperator.organizationName}
                    </span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </section>
  )
}
