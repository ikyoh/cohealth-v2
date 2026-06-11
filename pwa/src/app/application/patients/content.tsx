"use client"

import NoContentFound from "@/components/no-content-found";
import NoDataFound from "@/components/no-data-found";
import TableSortingHead from "@/components/table-sorting-head";
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
import { PatientInterface } from "@/utils/types.utils";
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const Content = () => {

	const { datas, totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({ entity: "patients" });
	const { data, isLoading: isLoadingCount, error } = useGetIRI("/count/patients");

	if (!isLoadingCount && data.count === 0)
		return <NoContentFound link="/application/patients/new" title="Aucun patient enregistré" description="Créer vos patients" buttonLabel="Ajouter un patient" />

	if (!isLoading && totalItems === 0)
		return <NoDataFound title="Aucun patient trouvé" description="Veuillez affiner votre recherche" />

	return (

		<Card>
			<CardHeader className="px-7">
				<CardTitle>Liste des patients</CardTitle>
				<CardDescription>
					{(isLoading || isLoadingCount) || (data.count === totalItems) ?
						"Gérer ici tous les patients."
						: totalItems === 1 ?
							"Résultats de la recherche : " + totalItems + " patient trouvé." :
							"Résultats de la recherche : " + totalItems + " patients trouvés."}
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
								<TableSortingHead sortingTerm="title">Patient</TableSortingHead>
								<TableSortingHead sortingTerm="family">Médecin</TableSortingHead>
								<TableSortingHead sortingTerm="category">Assurance</TableSortingHead>
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
	data: PatientInterface, lastElementRef: (node: HTMLTableRowElement) => void
}) => {

	const router = useRouter()
	const searchParams = useSearchParams();
	const params = new URLSearchParams(searchParams!);

	return (
		<TableRow ref={lastElementRef}>
			<TableCell className="font-medium">{data.id}</TableCell>
			<TableCell className="space-x-2">
				{data.gender === "MALE" ? "Mr" : "Mme"}
				{" "}
				<span className="uppercase">
					{data.lastname}
				</span>
				{" "}
				{data.firstname}
			</TableCell>
			<TableCell>
				{data.principalName ? data.principalName : "..."}
			</TableCell>
			<TableCell>
				{data.insuranceName ? data.insuranceName : "..."}
			</TableCell>
			<TableCell>
				...
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

export default Content;