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
import { Cantons, PrincipalCategories, PrincipalInterface } from "@/utils/types.utils";
import { Mail, MoreHorizontal, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const Content = () => {

	const { datas, totalItems, lastElementRef, isLoading, isFetching } = useInfiniteScroll({ entity: "principals" });
	const { data, isLoading: isLoadingCount, error } = useGetIRI("/count/principals");
	const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetIRI("/current_user");

	if (!isLoadingCount && data.count === 0)
		return <NoContentFound link="/application/principals/new" title="Aucun mandant enregistré" description="Créer vos mandants" buttonLabel="Ajouter un mandant" />

	if (!isLoading && totalItems === 0)
		return <NoDataFound title="Aucun mandant trouvé" description="Veuillez affiner votre recherche" />

	return (

		<Card>
			<CardHeader className="px-7">
				<CardTitle>Liste des mandants</CardTitle>
				<CardDescription>
					{(isLoading || isLoadingCount) || (data.count === totalItems) ?
						"Gérer ici toutes les mandants."
						: totalItems === 1 ?
							"Résultats de la recherche : " + totalItems + " mandant trouvé." :
							"Résultats de la recherche : " + totalItems + " mandants trouvés."}
				</CardDescription>

			</CardHeader>
			<CardContent>
				{isLoading || isLoadingCount || isLoadingCurrentUser ?
					<Spinner />
					:
					<Table>
						<TableCaption>Liste des mandants.</TableCaption>
						<TableHeader>
							<TableRow>
								<TableSortingHead sortingTerm="id">#</TableSortingHead>
								<TableSortingHead sortingTerm="title">Nom</TableSortingHead>
								<TableSortingHead sortingTerm="category">Catégorie</TableSortingHead>
								<TableSortingHead sortingTerm="family">Infos complémentaires</TableSortingHead>
								<TableSortingHead sortingTerm="category">Canton</TableSortingHead>
								<TableHead>Coordonnées</TableHead>
								<TableSortingHead sortingTerm="category">N° GLN</TableSortingHead>
								<TableHead className="w-12">
									<span className="sr-only">Actions</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{datas?.map((data: any) => (
								<Row key={crypto.randomUUID()} data={data} currentUser={currentUser} lastElementRef={lastElementRef} />
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

const Row = ({ data, currentUser, lastElementRef }: {
	data: PrincipalInterface,
	currentUser: { principal?: string | null },
	lastElementRef: (node: HTMLTableRowElement) => void
}) => {

	const router = useRouter()
	const searchParams = useSearchParams();
	const params = new URLSearchParams(searchParams!);
	const canEdit = !data.user || currentUser?.principal === data["@id"];

	return (
		<TableRow ref={lastElementRef}>
			<TableCell className="font-medium">{data.id}</TableCell>
			<TableCell>
				{data.name}
			</TableCell>
			<TableCell className="max-w-[20ch] truncate">
				{PrincipalCategories[data.category]}
			</TableCell>
			<TableCell>
				{data.furtherInformations || "..."}
			</TableCell>
			<TableCell>
				{Cantons[data.canton]}
			</TableCell>
			<TableCell>
				<ContactDetails principal={data} />
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
						<DropdownMenuItem onClick={() => router.push(`/application/principals/${data.uuid}/view`)}>
							Consulter
						</DropdownMenuItem>
						{canEdit && (
						<DropdownMenuItem onClick={() => router.push(`/application/${data["@id"]}?${params.toString()}`, { scroll: false })}>
							Éditer
						</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</ TableRow >
	)
}

const ContactDetails = ({ principal }: { principal: PrincipalInterface }) => {
	if (!principal.phone && !principal.email) {
		return <span className="text-muted-foreground">...</span>
	}

	return (
		<div className="text-muted-foreground space-y-1 text-sm">
			{principal.email && (
				<a
					href={`mailto:${principal.email}`}
					className="flex items-center gap-2 hover:text-foreground"
				>
					<Mail className="size-3.5 shrink-0" />
					<span>{principal.email}</span>
				</a>
			)}
			{principal.phone && (
				<a
					href={`tel:${principal.phone}`}
					className="flex items-center gap-2 hover:text-foreground"
				>
					<Phone className="size-3.5 shrink-0" />
					<span>{principal.phone}</span>
				</a>
			)}
		</div>
	)
}

export default Content;
