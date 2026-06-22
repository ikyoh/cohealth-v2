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
import { MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type ServiceRow = {
	id: number;
	"@id": string;
	name: string;
	family: string;
	category: string;
	actNumber: number;
	opas: string;
	duration: number;
};

const Content = () => {

	const { datas, totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({ entity: "services" });
	const { data, isLoading: isLoadingCount, error } = useGetIRI("/count/services");

	if (!isLoadingCount && data.count === 0)
		return <NoContentFound link="/application/services/new" title="Aucun emplacement enregistré" description="Créer vos prestations" buttonLabel="Ajouter une prestation" />

	if (!isLoading && totalItems === 0)
		return <NoDataFound title="Aucune prestation trouvée" description="Veuillez affiner votre recherche" />

	return (

		<Card>
			<CardHeader className="px-7">
				<CardTitle>Liste des prestations</CardTitle>
				<CardDescription>
					{(isLoading || isLoadingCount) || (data.count === totalItems) ?
						"Gérer ici toutes les prestations."
						: totalItems === 1 ?
							"Résultats de la recherche : " + totalItems + " prestation trouvée." :
							"Résultats de la recherche : " + totalItems + " prestations trouvées."}
				</CardDescription>

			</CardHeader>
			<CardContent>
				{isLoading || isLoadingCount ?
					<Spinner />
					:
					<Table>
						<TableCaption>Liste des prestations.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableSortingHead sortingTerm="id">#</TableSortingHead>
								<TableSortingHead sortingTerm="title">Intitulé</TableSortingHead>
								<TableSortingHead sortingTerm="family">Famille</TableSortingHead>
								<TableSortingHead sortingTerm="category">Catégorie</TableSortingHead>
								<TableSortingHead sortingTerm="category">N° d'acte</TableSortingHead>
								<TableSortingHead sortingTerm="category">OPAS</TableSortingHead>
								<TableSortingHead sortingTerm="category">Durée (min)</TableSortingHead>

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
	data: ServiceRow, lastElementRef: (node: HTMLTableRowElement) => void
}) => {

	const router = useRouter()
	const searchParams = useSearchParams();
	const params = new URLSearchParams(searchParams!);

	return (
		<TableRow ref={lastElementRef}>
			<TableCell className="font-medium">{data.id}</TableCell>
			<TableCell>
				{data.name}
			</TableCell>
			<TableCell>
				{data.family}
			</TableCell>
			<TableCell>
				{data.category}
			</TableCell>
			<TableCell>
				{data.actNumber}
			</TableCell>
			<TableCell>
				{data.opas}
			</TableCell>
			<TableCell>
				{data.duration}
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
