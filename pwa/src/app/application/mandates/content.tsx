"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetCollection, useGetIRI } from "@/hooks/useQuery"
import dayjs from "@/utils/dayjs.config"
import { useRouter } from "next/navigation"

const statusLabels: Record<string, string> = {
  EDITED: "Édité",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
}

export default function MandatesContent() {
  const router = useRouter()
  const { data, isLoading } = useGetCollection({
    entity: "mandate_groups",
    searchParams: "order[createdAt]=DESC",
  })
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetIRI("/current_user")

  if (isLoading || isLoadingCurrentUser) return <Spinner />

  const groups = data?.member || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Dossiers de mandats
          <Badge variant="outline">{data?.totalItems || groups.length}</Badge>
        </CardTitle>
        <CardDescription>
          {currentUser?.roles?.includes("ROLE_PRINCIPAL")
            ? "Mandats transmis au coordinateur."
            : currentUser?.roles?.includes("ROLE_COORDINATOR")
              ? "Mandats reçus des mandants, à attribuer aux professionnels."
              : "Mandats qui vous sont attribués."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Mandats</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group: any) => (
              <TableRow
                key={group.uuid}
                className="cursor-pointer"
                onClick={() => router.push(`/application/mandates/${group.uuid}`)}
              >
                <TableCell className="font-medium">
                  {[group.patient?.firstname, group.patient?.lastname].filter(Boolean).join(" ")}
                </TableCell>
                <TableCell>{dayjs(group.createdAt).format("DD/MM/YYYY")}</TableCell>
                <TableCell>{group.mandates?.length || 0}</TableCell>
                <TableCell>
                  <Badge variant="outline">{statusLabels[group.status] || group.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                  Aucun mandat disponible.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
