"use client"
import { BadgeStatus } from "@/components/badge-status";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetIRI, usePatchQuery } from "@/hooks/useQuery";
import { MissionStatus } from "@/utils/types.utils";
import { statusClasses } from "@/utils/utils";
import { BriefcaseMedical, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const getIri = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "@id" in value) {
    return String(value["@id"]);
  }

  return "";
}

export default function MissionActions({ iri, isCompact = false, isActions = true }: { iri: string, isCompact?: boolean, isActions?: boolean }) {

  const router = useRouter();

  const { mutate, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();
  const { data, isLoading, error, isSuccess } = useGetIRI(iri ? iri : "");
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetIRI("/current_user");
  const isMissionOwner = getIri(data?.owner) === currentUser?.iri;

  const handleChangeStatus = (status: string) => {
    mutate({ iri: iri, status: status });
  };

  if (isLoading || isCurrentUserLoading) return <Skeleton className="h-[36px] w-28" />;

  const currentStatus = (data?.status || "A_FAIRE") as keyof typeof MissionStatus;

  if (!isMissionOwner) {
    return (
      <div className={`ml-auto flex h-9 items-center gap-2 rounded-md border-2 px-3 text-sm ${statusClasses[currentStatus]}`}>
        {!isCompact && (
          <>
            <BriefcaseMedical className="h-4 w-4" />
            <span>Mission</span>
            <span>|</span>
          </>
        )}
        <BadgeStatus status={currentStatus} label={MissionStatus[currentStatus]} />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`ml-auto px-2! border-2 ${statusClasses[currentStatus]}`}>
          {!isCompact && <>
            <BriefcaseMedical className="h-12 w-12" />
            Mission
            <span>|</span>
          </>}
          {MissionStatus[currentStatus]}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isActions && <>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/application/${data["@id"]}`, { scroll: false }) }}>
            Editer la mission
          </DropdownMenuItem>
          {isMissionOwner && (
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/application${getIri(data?.patient)}`, { scroll: false }) }}>
              Editer le patient
            </DropdownMenuItem>
          )}
        </>}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Statut de la mission</DropdownMenuLabel>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('EN_COURS') }}>
          <BadgeStatus status="EN_COURS" />
          En cours
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('ARCHIVE') }}>
          <BadgeStatus status="ARCHIVE" />
          Archivé
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('FACTURE') }}>
          <BadgeStatus status="FACTURE" />
          Facturé
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('ANNULE') }}>
          <BadgeStatus status="ANNULE" />
          Annulé
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
