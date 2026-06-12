"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useDeleteIRI, useGetCollection, usePostQuery } from "@/hooks/useQuery"
import { request } from "@/utils/axios.utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import dayjs from "@/utils/dayjs.config"
import {
  Download,
  File,
  FileImage,
  FilePenLine,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Trash2,
} from "lucide-react"
import { useEffect, useState } from "react"

type MissionDocument = {
  "@id": string
  uuid: string
  title: string
  description?: string | null
  originalName: string
  mimeType?: string | null
  fileSize?: number | null
  contentUrl: string
  createdAt: string
  updatedAt: string
}

type DocumentFormState = {
  title: string
  description: string
  file: File | null
}

const emptyForm: DocumentFormState = {
  title: "",
  description: "",
  file: null,
}

const acceptedTypes = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".txt",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
].join(",")

const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`

  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

const getDocumentIcon = (mimeType?: string | null) => {
  if (mimeType?.startsWith("image/")) return FileImage
  if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) {
    return FileSpreadsheet
  }
  if (mimeType?.includes("pdf") || mimeType?.includes("word")) return FileText

  return File
}

const getErrorMessage = (error: any) =>
  error?.response?.data?.detail
  || error?.response?.data?.violations?.[0]?.message
  || "L’opération a échoué. Veuillez réessayer."

export default function DocumentsTab({
  missionIri,
  canManage,
}: {
  missionIri: string
  canManage: boolean
}) {
  const queryClient = useQueryClient()
  const searchParams = new URLSearchParams({ mission: missionIri })
  const { data, isLoading } = useGetCollection({
    entity: "mission_documents",
    searchParams: searchParams.toString(),
  })
  const { mutateAsync: createDocument, isPending: isCreating } =
    usePostQuery("mission_documents")
  const { mutateAsync: deleteDocument, isPending: isDeleting } = useDeleteIRI()
  const { mutateAsync: updateDocument, isPending: isUpdating } = useMutation({
    mutationFn: ({
      iri,
      formData,
    }: {
      iri: string
      formData: FormData
    }) => request({
      url: iri,
      method: "patch",
      data: formData,
    }),
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDocument, setEditingDocument] =
    useState<MissionDocument | null>(null)
  const [form, setForm] = useState<DocumentFormState>(emptyForm)
  const [error, setError] = useState("")
  const [downloadingUuid, setDownloadingUuid] = useState("")

  const documents: MissionDocument[] = data?.member || []
  const isSaving = isCreating || isUpdating

  useEffect(() => {
    if (!dialogOpen) {
      setEditingDocument(null)
      setForm(emptyForm)
      setError("")
    }
  }, [dialogOpen])

  const openCreateDialog = () => {
    setEditingDocument(null)
    setForm(emptyForm)
    setError("")
    setDialogOpen(true)
  }

  const openEditDialog = (document: MissionDocument) => {
    setEditingDocument(document)
    setForm({
      title: document.title,
      description: document.description || "",
      file: null,
    })
    setError("")
    setDialogOpen(true)
  }

  const refreshDocuments = () =>
    queryClient.invalidateQueries({ queryKey: ["mission_documents"] })

  const saveDocument = async () => {
    setError("")

    if (!form.title.trim()) {
      setError("Le titre est obligatoire.")
      return
    }

    if (!editingDocument && !form.file) {
      setError("Sélectionnez un fichier.")
      return
    }

    const formData = new FormData()
    formData.append("title", JSON.stringify(form.title.trim()))
    formData.append("description", JSON.stringify(form.description.trim()))

    if (!editingDocument) {
      formData.append("mission", JSON.stringify(missionIri))
    }

    if (form.file) {
      formData.append("file", form.file)
    }

    try {
      if (editingDocument) {
        await updateDocument({
          iri: editingDocument["@id"],
          formData,
        })
      } else {
        await createDocument(formData)
      }

      await refreshDocuments()
      setDialogOpen(false)
    } catch (uploadError) {
      setError(getErrorMessage(uploadError))
    }
  }

  const handleDelete = async (document: MissionDocument) => {
    if (!window.confirm(`Supprimer le document « ${document.title} » ?`)) {
      return
    }

    try {
      await deleteDocument(document["@id"])
      await refreshDocuments()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError))
    }
  }

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
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Documents de la mission</h2>
          <p className="text-muted-foreground text-sm">
            {canManage
              ? "Ajoutez et gérez les documents partagés avec les coopérateurs."
              : "Consultez les documents mis à disposition par le propriétaire."}
          </p>
        </div>
        {canManage && (
          <Button type="button" onClick={openCreateDialog}>
            <FilePlus2 />
            Ajouter un document
          </Button>
        )}
      </div>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {error}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <FileText className="mb-3 size-8" />
          <p className="font-medium">Aucun document</p>
          <p className="mt-1 text-sm">
            {canManage
              ? "Ajoutez le premier document de cette mission."
              : "Le propriétaire n’a partagé aucun document."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {documents.map(document => {
            const Icon = getDocumentIcon(document.mimeType)

            return (
              <article
                key={document.uuid}
                className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{document.title}</h3>
                  <p className="text-muted-foreground truncate text-sm">
                    {document.originalName}
                    {document.fileSize
                      ? ` · ${formatFileSize(document.fileSize)}`
                      : ""}
                  </p>
                  {document.description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {document.description}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 text-xs">
                    Mis à jour le {dayjs(document.updatedAt).format("DD/MM/YYYY à HH:mm")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={downloadingUuid === document.uuid}
                    onClick={() => handleDownload(document)}
                  >
                    <Download />
                    Télécharger
                  </Button>
                  {canManage && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Modifier ${document.title}`}
                        onClick={() => openEditDialog(document)}
                      >
                        <FilePenLine />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label={`Supprimer ${document.title}`}
                        disabled={isDeleting}
                        onClick={() => handleDelete(document)}
                      >
                        <Trash2 />
                      </Button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Modifier le document" : "Ajouter un document"}
            </DialogTitle>
            <DialogDescription>
              Les coopérateurs associés à la mission pourront le télécharger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-title">Titre</Label>
              <Input
                id="document-title"
                value={form.title}
                maxLength={255}
                onChange={event =>
                  setForm(current => ({ ...current, title: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-description">Description</Label>
              <Textarea
                id="document-description"
                value={form.description}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-file">
                {editingDocument ? "Remplacer le fichier" : "Fichier"}
              </Label>
              <Input
                id="document-file"
                type="file"
                accept={acceptedTypes}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    file: event.target.files?.[0] || null,
                  }))
                }
              />
              <p className="text-muted-foreground text-xs">
                PDF, image, texte, Word ou Excel. Taille maximale : 15 Mo.
              </p>
            </div>
            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="cancel"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={saveDocument}
              loading={isSaving}
              disabled={isSaving}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
