"use client"

import NoContentFound from "@/components/no-content-found";
import NoDataFound from "@/components/no-data-found";
import TableSortingHead from "@/components/table-sorting-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PrescriptionInterface } from "@/utils/types.utils";
import dayjs from "dayjs";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import OpasActions from "../missions/opas-actions";

const getIri = (value: string | { "@id"?: string } | null | undefined) => (
  typeof value === "string" ? value : value?.["@id"] || ""
);

const Content = () => {

  const { datas, totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({ entity: "prescriptions" });
  const { data, isLoading: isLoadingCount, error } = useGetIRI("/count/prescriptions");

  if (!isLoadingCount && data.count === 0)
    return <NoContentFound link="/application/prescriptions/new" title="Aucune prescription enregistrée" description="Vos prescriptions" />

  if (!isLoading && totalItems === 0)
    return <NoDataFound title="Aucune prescription trouvé" description="Veuillez affiner votre recherche" />

  return (

    <Card>
      <CardHeader className="px-7">
        <CardTitle>Liste des prescriptions</CardTitle>
        <CardDescription>
          {(isLoading || isLoadingCount) || (data.count === totalItems) ?
            "Gérer ici tous les prescriptions."
            : totalItems === 1 ?
              "Résultats de la recherche : " + totalItems + " prescription trouvée." :
              "Résultats de la recherche : " + totalItems + " prescriptions trouvées."}
        </CardDescription>

      </CardHeader>
      <CardContent>
        {isLoading || isLoadingCount ?
          <Spinner />
          :
          <Table>
            <TableCaption>Liste des patients.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableSortingHead sortingTerm="id">#</TableSortingHead>
                <TableSortingHead sortingTerm="title">Catégorie</TableSortingHead>
                <TableSortingHead sortingTerm="title">Patient</TableSortingHead>
                <TableSortingHead sortingTerm="family">Date de création</TableSortingHead>
                <TableSortingHead sortingTerm="category">Emis par</TableSortingHead>
                <TableSortingHead sortingTerm="category">Statut</TableSortingHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datas?.map((data: any) => (
                <Row key={crypto.randomUUID()} data={data} lastElementRef={lastElementRef} />
              ))}
            </TableBody>
          </Table>}
      </CardContent>
      <CardFooter className="justify-center">
        <Spinner show={!isLoading && isFetching} size="small" />
      </CardFooter>
    </Card>
  );
}

const Row = ({ data, lastElementRef }: {
  data: PrescriptionInterface, lastElementRef: (node: HTMLTableRowElement) => void
}) => {

  console.log('data', data)
  const router = useRouter()
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams!);

  const { data: ownerData, isLoading: isLoadingOwners } = useGetIRI(getIri(data.owner));
  const { data: patientData, isLoading: isLoadingPatients } = useGetIRI(getIri(data.patient));

  const isLoading = isLoadingOwners || isLoadingPatients

  if (isLoading) return (
    <TableRow ref={lastElementRef}>
      <TableCell colSpan={7}>
        <Skeleton className="h-[36px] w-full" />
      </TableCell>
    </TableRow>
  )

  return (
    <TableRow ref={lastElementRef}>
      <TableCell className="font-medium">{data.id}</TableCell>
      <TableCell>
        {data.category}
      </TableCell>
      <TableCell>
        {patientData ? patientData.firstname + " " + patientData.lastname : "Aucun patient"}
      </TableCell>
      <TableCell>
        {dayjs(data.createdDate).format('DD/MM/YYYY')}
      </TableCell>
      <TableCell>
        {data.owner && ownerData ? ownerData.firstname + " " + ownerData.lastname : "Aucun propriétaire"}
      </TableCell>
      <TableCell>
        <OpasActions opasIRI={data["@id"]} isCompact isActions={false} />
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
            <DropdownMenuItem onClick={() => router.push(`/application/${data["@id"]}/view?onepage=true`, { scroll: false })}>
              OPAS simplifié
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/application/${data["@id"]}/view`, { scroll: false })}>
              OPAS détaillé
            </DropdownMenuItem>
            {data.planned ? (
              <DropdownMenuItem disabled>
                Planification effectuée
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => router.push(`/application/${data["@id"]}/planify?date=${dayjs(data.beginDate).format('YYYY-MM-DD')}`, { scroll: false })}>
                Planifier
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </ TableRow >
  )
}

export default Content;
