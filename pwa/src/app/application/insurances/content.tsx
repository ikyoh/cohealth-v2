"use client"

import ContentSkeleton from "@/components/content-skeleton";
import NoContentFound from "@/components/no-content-found";
import NoDataFound from "@/components/no-data-found";
import TableSortingHead from "@/components/table-sorting-head";
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
import { useGetIRI } from "@/hooks/useQuery";
import { InsuranceInterface } from "@/utils/types.utils";
import { Globe, Mail, MoreHorizontal, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const Content = () => {


  const { datas, totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({ entity: "insurances" });
  const { data, isLoading: isLoadingCount, error } = useGetIRI("/count/insurances");

  if (isLoading || isLoadingCount) return <ContentSkeleton />

  if (!isLoadingCount && data.count === 0)
    return <NoContentFound link="/application/insurances/new" title="Aucune assurance enregistrée" description="Créer vos assurances" buttonLabel="Ajouter une assurance" />

  if (!isLoading && totalItems === 0)
    return <NoDataFound title="Aucune assurance trouvée" description="Veuillez affiner votre recherche" />

  return (

    <Card>
      <CardHeader className="px-7">
        <CardTitle>Liste des assurances
          <Badge variant="outline">{data.count}</Badge>
        </CardTitle>
        <CardDescription>
          {(isLoading || isLoadingCount) || (data.count === totalItems) ?
            "Gérer ici toutes les assurances."
            : totalItems === 1 ?
              "Résultats de la recherche : " + totalItems + " service trouvé." :
              "Résultats de la recherche : " + totalItems + " services trouvés."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Liste des assurances.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableSortingHead sortingTerm="id">#</TableSortingHead>
              <TableSortingHead sortingTerm="name">Intitulé</TableSortingHead>
              <TableSortingHead sortingTerm="family">Groupe</TableSortingHead>
              <TableSortingHead sortingTerm="category">Catégorie</TableSortingHead>
              <TableHead>Coordonnées</TableHead>
              <TableSortingHead sortingTerm="gln">N° GLN</TableSortingHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas?.map((data: InsuranceInterface) => (
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
  data: InsuranceInterface, lastElementRef: (node: HTMLTableRowElement) => void
}) => {

  const router = useRouter()
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams!);

  return (
    <TableRow ref={lastElementRef}>
      <TableCell>{data.id}</TableCell>
      <TableCell>
        {data.name}
      </TableCell>
      <TableCell>
        {data.organization || "..."}
      </TableCell>
      <TableCell>
        {data.category}
      </TableCell>
      <TableCell>
        <ContactDetails insurance={data} />
      </TableCell>
      <TableCell>
        {data.gln}
      </TableCell>
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
    </ TableRow >
  )
}

const ContactDetails = ({ insurance }: { insurance: InsuranceInterface }) => {
  const hasContact = insurance.phone || insurance.email || insurance.website;

  if (!hasContact) {
    return <span className="text-muted-foreground">...</span>
  }

  const website = insurance.website?.startsWith("http")
    ? insurance.website
    : insurance.website
      ? `https://${insurance.website}`
      : undefined

  return (
    <div className="text-muted-foreground space-y-1 text-sm">
      {insurance.email && (
        <a
          href={`mailto:${insurance.email}`}
          className="flex items-center gap-2 hover:text-foreground"
        >
          <Mail className="size-3.5 shrink-0" />
          <span>{insurance.email}</span>
        </a>
      )}
      {insurance.phone && (
        <a
          href={`tel:${insurance.phone}`}
          className="flex items-center gap-2 hover:text-foreground"
        >
          <Phone className="size-3.5 shrink-0" />
          <span>{insurance.phone}</span>
        </a>
      )}
      {insurance.website && website && (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-foreground"
        >
          <Globe className="size-3.5 shrink-0" />
          <span>{insurance.website}</span>
        </a>
      )}
    </div>
  )
}

export default Content;
