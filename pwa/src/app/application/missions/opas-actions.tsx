'use client'
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
import dayjs from "@/utils/dayjs.config";
import { PrescriptionStatus } from "@/utils/types.utils";
import { statusClasses } from "@/utils/utils";
import { ChevronDown, ClipboardList } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function OpasActions({ missionUUID, opasIRI, isCompact = false, isActions = true, readOnly = false }: { missionUUID?: string, opasIRI?: string, isCompact?: boolean, isActions?: boolean, readOnly?: boolean }) {

  const params = useParams()
  const uuid = params.uuid
  const router = useRouter();
  console.log('uuid', uuid)

  const { data, isLoading } = useGetIRI(opasIRI ? opasIRI : "");
  const { mutate, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();
  const currentStatus = String(
    data?.status || "A_FAIRE",
  ) as keyof typeof PrescriptionStatus;

  const handleChangeStatus = (status: string) => {
    mutate({ iri: data["@id"], status: status });
  };

  if (isLoading) return <Skeleton className="h-[36px] w-28" />;

  if (readOnly) {
    return (
      <div className={`ml-auto flex h-9 items-center gap-2 rounded-md border-2 px-3 text-sm ${statusClasses[currentStatus]}`}>
        {!isCompact && (
          <>
            <ClipboardList className="h-4 w-4" />
            <span>OPAS</span>
            <span>|</span>
          </>
        )}
        {data ? (
          <BadgeStatus
            status={currentStatus}
            label={PrescriptionStatus[currentStatus]}
          />
        ) : (
          <span>Aucun</span>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`ml-auto px-2! border-2 ${statusClasses[currentStatus]}`}>
          {!isCompact &&
            <>
              <ClipboardList />
              OPAS
              <span>|</span>
            </>
          }
          {PrescriptionStatus[currentStatus]}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {isActions && (
          <>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {!data && missionUUID ?
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/application/prescriptions/new?mission=${missionUUID}`, { scroll: false }); }}>
                Créer l'OPAS
              </DropdownMenuItem> :
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/application/${opasIRI}`, { scroll: false }); }}>
                Modifier l'OPAS
              </DropdownMenuItem>
            }
          </>
        )}
        {data &&
          <>
            {isActions &&
              <>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/application/${opasIRI}/view?onepage=true`, { scroll: false }) }}>
                  OPAS simplifié
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/application/${opasIRI}/view`, { scroll: false }) }}>
                  OPAS détaillé
                </DropdownMenuItem>
                {data.planned ? (
                  <DropdownMenuItem disabled>
                    Planification effectuée
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/application/${opasIRI}/planify?date=${dayjs(data.beginDate).format('YYYY-MM-DD')}`, { scroll: false }) }}>
                    Planifier
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            }
            <DropdownMenuLabel>Statut de l'OPAS</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('BROUILLON') }}>
              <BadgeStatus status="BROUILLON" />
              Brouillon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('ENVOYE_AU_MEDECIN') }}>
              <BadgeStatus status="ENVOYE_AU_MEDECIN" />
              Envoyé au médecin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('VALIDE_PAR_LE_MEDECIN') }}>
              <BadgeStatus status="VALIDE_PAR_LE_MEDECIN" />
              Validé par le médecin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('ENVOYE_A_L_ASSURANCE') }}>
              <BadgeStatus status="ENVOYE_A_L_ASSURANCE" />
              Envoyé à l'assurance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeStatus('CONTESTE_PAR_L_ASSURANCE') }}>
              <BadgeStatus status="CONTESTE_PAR_L_ASSURANCE" />
              Contesté par l'assurance
            </DropdownMenuItem>
          </>
        }
      </DropdownMenuContent>
    </DropdownMenu >
  );
}
