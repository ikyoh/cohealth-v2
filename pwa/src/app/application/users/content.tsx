"use client"

import ContentSkeleton from "@/components/content-skeleton";
import NoContentFound from "@/components/no-content-found";
import NoDataFound from "@/components/no-data-found";
import TableSortingHead from "@/components/table-sorting-head";
import { roles as roleLabels } from "@/utils/arrays";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { UserInterface } from "@/utils/types.utils";
import dayjs from "@/utils/dayjs.config";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const Content = () => {
  const { datas, totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({ entity: "users" });
  const searchParams = useSearchParams();
  const hasActiveFilters = searchParams.toString().length > 0;

  if (isLoading) return <ContentSkeleton />

  if (!isLoading && totalItems === 0) {
    return hasActiveFilters
      ? <NoDataFound title="Aucun utilisateur trouvé" description="Veuillez affiner votre recherche" />
      : <NoContentFound link="/application/users/new" title="Aucun utilisateur enregistré" description="Créer vos utilisateurs" buttonLabel="Ajouter un utilisateur" />
  }

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Liste des utilisateurs
          <Badge variant="outline">{totalItems}</Badge>
        </CardTitle>
        <CardDescription>
          {totalItems === 1
            ? "Résultats : 1 utilisateur."
            : `Gérer ici les ${totalItems} utilisateurs.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Liste des utilisateurs.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableSortingHead sortingTerm="id">#</TableSortingHead>
              <TableSortingHead sortingTerm="lastname">Nom</TableSortingHead>
              <TableSortingHead sortingTerm="firstname">Prénom</TableSortingHead>
              <TableSortingHead sortingTerm="email">Email</TableSortingHead>
              <TableSortingHead sortingTerm="organizationName">Organisation</TableSortingHead>
              <TableHead>Rôles</TableHead>
              <TableSortingHead sortingTerm="isActive">Statut</TableSortingHead>
              <TableSortingHead sortingTerm="createdAt">Créé le</TableSortingHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas?.map((data: UserInterface) => (
              <Row key={data.uuid || data["@id"]} data={data} lastElementRef={lastElementRef} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-center">
        <Spinner show={!isLoading && isFetching} size="small" />
      </CardFooter>
    </Card>
  );
}

const Row = ({ data, lastElementRef }: {
  data: UserInterface, lastElementRef: (node: HTMLTableRowElement) => void
}) => {
  const router = useRouter()
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams!);
  const roles = data.roles?.filter((role) => role !== "ROLE_USER") || [];

  return (
    <TableRow ref={lastElementRef}>
      <TableCell>{data.id || "..."}</TableCell>
      <TableCell>{data.lastname || "..."}</TableCell>
      <TableCell>{data.firstname}</TableCell>
      <TableCell>{data.email}</TableCell>
      <TableCell>{data.organizationName || "..."}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {roles.length > 0 ? roles.map((role) => (
            <Badge key={role} variant="outline">
              {roleLabels[role as keyof typeof roleLabels] || role}
            </Badge>
          )) : "..."}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={data.isActive && data.isApproved ? "default" : "outline"}>
          {data.isActive && data.isApproved ? "Actif" : "Inactif"}
        </Badge>
      </TableCell>
      <TableCell>{data.createdAt ? dayjs(data.createdAt).format("DD/MM/YYYY") : "..."}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-haspopup="true"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/application/${data["@id"]}?${params.toString()}`, { scroll: false })}>
              Éditer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default Content;
