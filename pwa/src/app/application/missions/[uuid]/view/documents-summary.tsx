"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetCollection } from "@/hooks/useQuery"
import { request } from "@/utils/axios.utils"
import { Download, FileText } from "lucide-react"
import { useState } from "react"

type MissionDocument = {
  uuid: string
  title: string
  originalName: string
  contentUrl: string
}

const getErrorMessage = (error: any) =>
  error?.response?.data?.detail
  || "Le téléchargement a échoué. Veuillez réessayer."

export default function DocumentsSummary({
  missionIri,
}: {
  missionIri: string
}) {
  const searchParams = new URLSearchParams({ mission: missionIri })
  const { data, isLoading } = useGetCollection({
    entity: "mission_documents",
    searchParams: searchParams.toString(),
  })
  const [downloadingUuid, setDownloadingUuid] = useState("")
  const [error, setError] = useState("")

  const documents: MissionDocument[] = data?.member || []

  const handleDownload = async (document: MissionDocument) => {
    setDownloadingUuid(document.uuid)
    setError("")

    try {
      const blob = await request({
        url: document.contentUrl,
        method: "get",
        data: undefined,
        responseType: "blob",
      })
      const objectUrl = URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = objectUrl
      link.download = document.originalName
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch (downloadError) {
      setError(getErrorMessage(downloadError))
    } finally {
      setDownloadingUuid("")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Aucun document pour cette mission.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      <ul className="divide-y">
        {documents.map(document => (
          <li
            key={document.uuid}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <FileText className="text-muted-foreground size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{document.title}</p>
              <p className="text-muted-foreground truncate text-xs">
                {document.originalName}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={`Télécharger ${document.title}`}
              loading={downloadingUuid === document.uuid}
              onClick={() => handleDownload(document)}
            >
              <Download />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
