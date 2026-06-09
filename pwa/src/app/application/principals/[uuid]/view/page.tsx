"use client"

import BackButton from "@/components/back-button";
import PageContent from "@/components/page-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useGetIRI } from "@/hooks/useQuery";
import { Cantons, PrincipalCategories, PrincipalInterface } from "@/utils/types.utils";
import { Building2, IdCard, Mail, MapPin, Pencil, Phone, Smartphone } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PrincipalViewPage() {
	const { uuid } = useParams<{ uuid: string }>();
	const router = useRouter();
	const iri = uuid ? `/principals/${uuid}` : "";
	const { data, isLoading, error } = useGetIRI(iri);
	const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetIRI("/current_user");

	if (isLoading || isLoadingCurrentUser) {
		return (
			<PageContent title="Mandant">
				<div className="flex min-h-64 items-center justify-center">
					<Spinner />
				</div>
			</PageContent>
		)
	}

	if (error || !data) {
		return (
			<PageContent title="Mandant" actions={<BackButton />}>
				<Card>
					<CardContent className="py-8 text-center text-muted-foreground">
						La fiche du mandant n’a pas pu être chargée.
					</CardContent>
				</Card>
			</PageContent>
		)
	}

	const principal = data as PrincipalInterface;
	const canEdit = !principal.user || currentUser?.principal === principal["@id"];

	const Actions = () => (
		<>
			{canEdit && (
				<Button onClick={() => router.push(`/application/principals/${principal.uuid}`)}>
					<Pencil />
					Modifier
				</Button>
			)}
			<BackButton />
		</>
	)

	return (
		<PageContent title={principal.name} actions={<Actions />}>
			<div className="grid gap-4 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Building2 className="size-5" />
							Informations
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Field label="Nom" value={principal.name} />
						<Field label="Catégorie" value={PrincipalCategories[principal.category]} />
						<Field label="Informations complémentaires" value={principal.furtherInformations} />
						<div>
							<p className="text-xs font-bold text-muted-foreground">Statut</p>
							<Badge variant={principal.isActive ? "default" : "outline"}>
								{principal.isActive ? "Actif" : "Inactif"}
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="size-5" />
							Coordonnées
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="text-xs font-bold text-muted-foreground">Adresse</p>
							<p>{principal.address || "..."}</p>
							{principal.additionalAddress && <p>{principal.additionalAddress}</p>}
							<p>
								{principal.npa || "..."} {principal.city || ""}
							</p>
							<p>{principal.canton ? Cantons[principal.canton] : "..."}</p>
						</div>
						<ContactLink icon={<Mail />} href={principal.email ? `mailto:${principal.email}` : undefined} label="Email" value={principal.email} />
						<ContactLink icon={<Phone />} href={principal.phone ? `tel:${principal.phone}` : undefined} label="Téléphone" value={principal.phone} />
						<ContactLink icon={<Smartphone />} href={principal.mobile ? `tel:${principal.mobile}` : undefined} label="Mobile" value={principal.mobile} />
						<ContactLink icon={<Phone />} href={principal.fax ? `tel:${principal.fax}` : undefined} label="Fax" value={principal.fax} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<IdCard className="size-5" />
							Identifiants professionnels
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Field label="N° RCC" value={principal.rcc} />
						<Field label="N° GLN" value={principal.gln} />
					</CardContent>
				</Card>
			</div>
		</PageContent>
	)
}

const Field = ({ label, value }: { label: string, value?: string | null }) => (
	<div>
		<p className="text-xs font-bold text-muted-foreground">{label}</p>
		<p>{value || "..."}</p>
	</div>
)

const ContactLink = ({
	icon,
	href,
	label,
	value,
}: {
	icon: React.ReactElement,
	href?: string,
	label: string,
	value?: string | null,
}) => (
	<div>
		<p className="text-xs font-bold text-muted-foreground">{label}</p>
		{href && value ? (
			<a href={href} className="inline-flex items-center gap-2 hover:text-primary">
				<span className="[&>svg]:size-4">{icon}</span>
				{value}
			</a>
		) : (
			<p>...</p>
		)}
	</div>
)
