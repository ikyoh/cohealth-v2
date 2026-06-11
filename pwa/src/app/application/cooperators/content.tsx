"use client"

import ContentSkeleton from "@/components/content-skeleton"
import NoDataFound from "@/components/no-data-found"
import TableSortingHead from "@/components/table-sorting-head"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useInfiniteScroll from "@/hooks/useInfiniteScroll"
import { UserInterface } from "@/utils/types.utils"
import { Mail, MapPin, Phone } from "lucide-react"

const cooperatorRoles = {
  ROLE_NURSE: "Infirmier",
  ROLE_PHYSIO: "Physiothérapeute",
} as const

export default function Content() {
  const {
    datas = [],
    totalItems,
    lastElementRef,
    isLoading,
    isFetching,
  } = useInfiniteScroll({ entity: "cooperators" })

  if (isLoading) {
    return <ContentSkeleton />
  }

  if (totalItems === 0) {
    return (
      <NoDataFound
        title="Aucun collaborateur trouvé"
        description="Seuls les infirmiers et physiothérapeutes actifs sont affichés."
      />
    )
  }

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>
          Collaborateurs
          <Badge variant="outline">{totalItems}</Badge>
        </CardTitle>
        <CardDescription>
          Annuaire des infirmiers et physiothérapeutes disponibles pour les
          coopérations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Liste des collaborateurs disponibles.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableSortingHead sortingTerm="name">Nom</TableSortingHead>
              <TableSortingHead sortingTerm="profession">
                Profession
              </TableSortingHead>
              <TableSortingHead sortingTerm="organization">
                Organisation
              </TableSortingHead>
              <TableHead>Coordonnées</TableHead>
              <TableSortingHead sortingTerm="city">Localité</TableSortingHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(datas as UserInterface[]).map((cooperator, index) => (
              <CooperatorRow
                key={cooperator.uuid || cooperator["@id"]}
                cooperator={cooperator}
                rowRef={index === datas.length - 1 ? lastElementRef : undefined}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-center">
        <Spinner show={isFetching} size="small" />
      </CardFooter>
    </Card>
  )
}

function CooperatorRow({
  cooperator,
  rowRef,
}: {
  cooperator: UserInterface
  rowRef?: (node: HTMLTableRowElement) => void
}) {
  const visibleRoles = cooperator.roles.filter(
    (role): role is keyof typeof cooperatorRoles => role in cooperatorRoles,
  )

  return (
    <TableRow ref={rowRef}>
      <TableCell>
        <div className="font-medium">
          {cooperator.firstname} {cooperator.lastname}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {visibleRoles.map((role) => (
            <Badge key={role} variant="info">
              {cooperatorRoles[role]}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>{cooperator.organizationName || "Non renseignée"}</TableCell>
      <TableCell>
        <div className="text-muted-foreground space-y-1 text-sm">
          {cooperator.email && (
            <div className="flex items-center gap-2">
              <Mail className="size-3.5" />
              <span>{cooperator.email}</span>
            </div>
          )}
          {(cooperator.mobile || cooperator.phone) && (
            <div className="flex items-center gap-2">
              <Phone className="size-3.5" />
              <span>{cooperator.mobile || cooperator.phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <MapPin className="size-3.5" />
          <span>{cooperator.city || "Non renseignée"}</span>
        </div>
      </TableCell>
    </TableRow>
  )
}
