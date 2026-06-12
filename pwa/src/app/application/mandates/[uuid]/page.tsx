"use client"

import BackButton from "@/components/back-button"
import PageContent from "@/components/page-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useGetCollection, useGetIRI } from "@/hooks/useQuery"
import { request } from "@/utils/axios.utils"
import dayjs from "@/utils/dayjs.config"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useState } from "react"

const categoryLabels: Record<string, string> = {
  NURSING: "Soins infirmiers",
  PHYSIOTHERAPY: "Physiothérapie",
  MEDICAL_EQUIPMENT: "Médicaments et matériel médical",
  PERSONAL_ASSISTANCE: "Aide à la personne",
}

const statusLabels: Record<string, string> = {
  EDITED: "Édité",
  ASSIGNED: "Attribué",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  CANCELLED: "Annulé",
}

const getIri = (value: any) => typeof value === "string" ? value : value?.["@id"] || value?.iri

export default function MandateGroupPage() {
  const { uuid } = useParams()
  const iri = `/mandate_groups/${uuid}`
  const queryClient = useQueryClient()
  const { data, isLoading } = useGetIRI(iri)
  const { data: currentUser } = useGetIRI("/current_user")
  const { data: cooperators } = useGetCollection({
    entity: "cooperators",
    searchParams: "itemsPerPage=100",
  })
  const [savingUuid, setSavingUuid] = useState("")
  const [assignments, setAssignments] = useState<Record<string, string>>({})

  if (isLoading || !data) return <Spinner />

  const updateStatus = async (mandate: any, status: string) => {
    setSavingUuid(mandate.uuid)
    try {
      await request({
        url: mandate["@id"] || `/mandates/${mandate.uuid}`,
        method: "patch",
        data: { status },
      })
      await queryClient.invalidateQueries({ queryKey: [iri] })
    } finally {
      setSavingUuid("")
    }
  }

  const assignMandate = async (mandate: any) => {
    const assignedTo = assignments[mandate.uuid]

    if (!assignedTo) return

    setSavingUuid(mandate.uuid)
    try {
      await request({
        url: mandate["@id"] || `/mandates/${mandate.uuid}`,
        method: "patch",
        data: { assignedTo },
      })
      await queryClient.invalidateQueries({ queryKey: [iri] })
    } finally {
      setSavingUuid("")
    }
  }

  const isCoordinator = currentUser?.roles?.includes("ROLE_COORDINATOR") ?? false

  return (
    <PageContent title="Dossier de mandats" actions={<BackButton />}>
      <Card>
        <CardHeader>
          <CardTitle>
            {[data.patient?.firstname, data.patient?.lastname].filter(Boolean).join(" ")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          {data.patient?.birthDate && <div><strong>Naissance :</strong> {dayjs(data.patient.birthDate).format("DD/MM/YYYY")}</div>}
          {data.patient?.phone && <div><strong>Téléphone :</strong> {data.patient.phone}</div>}
          {data.patient?.city && <div><strong>Ville :</strong> {data.patient.city}</div>}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {(data.mandates || []).map((mandate: any) => {
          const assignedIri = getIri(mandate.assignedTo)
          const canRespond = assignedIri === currentUser?.iri
          const assignedCooperator = (cooperators?.member || []).find(
            (cooperator: any) => cooperator["@id"] === assignedIri,
          )

          return (
            <Card key={mandate.uuid}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  {categoryLabels[mandate.category] || mandate.category}
                  <Badge variant="outline">{statusLabels[mandate.status] || mandate.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>{mandate.description}</p>
                <p className="text-muted-foreground text-sm">
                  Début souhaité : {dayjs(mandate.beginDate).format("DD/MM/YYYY")}
                </p>
                {assignedCooperator && (
                  <p className="text-sm">
                    Attribué à {[assignedCooperator.firstname, assignedCooperator.lastname].filter(Boolean).join(" ")}
                  </p>
                )}
                {isCoordinator && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">Professionnel attribué</label>
                      <Select
                        value={assignments[mandate.uuid] || assignedIri || ""}
                        onValueChange={value => setAssignments(current => ({
                          ...current,
                          [mandate.uuid]: value,
                        }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choisir un professionnel" />
                        </SelectTrigger>
                        <SelectContent>
                          {(cooperators?.member || []).map((cooperator: any) => (
                            <SelectItem key={cooperator["@id"]} value={cooperator["@id"]}>
                              {[cooperator.firstname, cooperator.lastname].filter(Boolean).join(" ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      loading={savingUuid === mandate.uuid}
                      disabled={
                        !assignments[mandate.uuid]
                        || assignments[mandate.uuid] === assignedIri
                      }
                      onClick={() => assignMandate(mandate)}
                    >
                      Attribuer
                    </Button>
                  </div>
                )}
                {canRespond && mandate.status === "ASSIGNED" && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      loading={savingUuid === mandate.uuid}
                      onClick={() => updateStatus(mandate, "ACCEPTED")}
                    >
                      Accepter
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      loading={savingUuid === mandate.uuid}
                      onClick={() => updateStatus(mandate, "REJECTED")}
                    >
                      Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageContent>
  )
}
