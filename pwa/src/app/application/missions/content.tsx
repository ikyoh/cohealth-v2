"use client"

import NoContentFound from "@/components/no-content-found";
import NoDataFound from "@/components/no-data-found";
import TableSortingHead from "@/components/table-sorting-head";
import { Badge } from "@/components/ui/badge";
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
import dayjs from "@/utils/dayjs.config";
import { MissionInterface } from "@/utils/types.utils";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import MissionActions from "./mission-actions";
import OpasActions from "./opas-actions";

const Content = () => {

  const { datas, totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({
    entity: "missions",
    filters: "userOwnership=owned",
  });
  const { data, isLoading: isLoadingCount, error } = useGetIRI("/count/missions");

  if (!isLoadingCount && data.count === 0)
    return <NoContentFound link="/application/missions/new" title="Aucune mission enregistrée" description="Créer vos missions" buttonLabel="Ajouter une mission" />

  if (!isLoading && totalItems === 0)
    return <NoDataFound title="Aucune mission trouvée" description="Veuillez affiner votre recherche" />


  if (isLoading || isLoadingCount) return <Spinner />

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Liste des missions
          <Badge variant={"outline"}>{data.count}</Badge>
        </CardTitle>
        <CardDescription>
          {(isLoading || isLoadingCount) || (data.count === totalItems) ?
            "Gérer ici toutes les missions."
            : totalItems === 1 ?
              "Résultats de la recherche : " + totalItems + " mission trouvée." :
              "Résultats de la recherche : " + totalItems + " missions trouvées."}
        </CardDescription>

      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Liste des missions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableSortingHead sortingTerm="id">#</TableSortingHead>
              <TableSortingHead sortingTerm="title">Patient</TableSortingHead>
              <TableSortingHead sortingTerm="family">Début</TableSortingHead>
              <TableSortingHead sortingTerm="category">Fin</TableSortingHead>
              <TableSortingHead sortingTerm="category">Durée</TableSortingHead>
              <TableSortingHead sortingTerm="category">OPAS</TableSortingHead>
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
        </Table>
      </CardContent>
      <CardFooter className="justify-center">
        <Spinner show={!isLoading && isFetching} size="small" />
      </CardFooter>
    </Card>
  );
}

const Row = ({ data, lastElementRef }: {
  data: MissionInterface, lastElementRef: (node: HTMLTableRowElement) => void
}) => {

  const router = useRouter()
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams!);

  const { data: patient, isLoading: isLoadingCount, error } = useGetIRI(data.patient as string);
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetIRI("/current_user");
  const ownerIri = typeof data.owner === "string" ? data.owner : data.owner?.["@id"];
  const isMissionOwner = ownerIri === currentUser?.iri;

  if (isLoadingCount || isLoadingCurrentUser) return <TableRow><TableCell colSpan={8}><Skeleton className="w-full h-[52px]" /></TableCell></TableRow>
  return (
    <TableRow
      ref={lastElementRef}
      onClick={() => router.push(`/application/missions/${data.uuid}/view`, { scroll: false })}
      className="cursor-pointer"
    >
      <TableCell className="font-medium">{data.id}</TableCell>
      <TableCell className="space-x-2">
        {patient.gender === "MALE" ? "Mr" : "Mme"}
        {" "}
        <span className="uppercase">
          {patient.lastname}
        </span>
        {" "}
        {patient.firstname}
      </TableCell>
      <TableCell>
        {dayjs(data.beginDate).format('dddd DD/MM/YY')}
      </TableCell>
      <TableCell>
        {dayjs(data.endDate).format('dddd DD/MM/YY')}
      </TableCell>
      <TableCell>
        {data.duration} {data.duration > 1 ? "jours" : "jour"}
      </TableCell>
      <TableCell>
        <OpasActions missionUUID={data.uuid} opasIRI={data.opas} isCompact readOnly={!isMissionOwner} />
      </TableCell>
      <TableCell>
        <MissionActions iri={data["@id"]} isCompact isActions={false} />
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
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/application/missions/${data.uuid}/view`, { scroll: false });
              }}>
              Consulter
            </DropdownMenuItem>
            {isMissionOwner && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/application/missions/${data.uuid}`, { scroll: false });
                }}>
                Editer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </ TableRow >
  )
}

export default Content;
