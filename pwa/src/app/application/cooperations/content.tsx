"use client";

import { BadgeStatus } from "@/components/badge-status";
import NoDataFound from "@/components/no-data-found";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useGetIRI } from "@/hooks/useQuery";
import dayjs from "@/utils/dayjs.config";
import {
  MissionInterface,
  MissionStatus,
  PatientInterface,
  UserInterface,
} from "@/utils/types.utils";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

const getIri = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "@id" in value) {
    return String(value["@id"]);
  }

  return "";
};

export default function Content() {
  const {
    datas,
    totalItems,
    lastElementRef,
    isLoading,
    isFetching,
  } = useInfiniteScroll({
    entity: "missions",
    filters: "userOwnership=not-owned",
  });

  if (!isLoading && totalItems === 0) {
    return (
      <NoDataFound
        title="Aucune coopération"
        description="Les missions qui vous sont partagées apparaîtront ici."
      />
    );
  }

  if (isLoading) return <Spinner />;

  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle className="flex items-center gap-2">
          Liste des coopérations
          <Badge variant="outline">{totalItems}</Badge>
        </CardTitle>
        <CardDescription>
          Missions partagées par d’autres propriétaires, disponibles en
          consultation uniquement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Liste des missions partagées.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Référent</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Consulter</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datas?.map((mission: MissionInterface) => (
              <CooperationRow
                key={mission["@id"]}
                mission={mission}
                lastElementRef={lastElementRef}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-center">
        <Spinner show={isFetching} size="small" />
      </CardFooter>
    </Card>
  );
}

function CooperationRow({
  mission,
  lastElementRef,
}: {
  mission: MissionInterface;
  lastElementRef: (node: HTMLTableRowElement) => void;
}) {
  const router = useRouter();
  const patientIri = getIri(mission.patient);
  const ownerIri = getIri(mission.owner);
  const embeddedPatient =
    typeof mission.patient === "object" ? mission.patient : undefined;
  const embeddedOwner =
    typeof mission.owner === "object" ? mission.owner : undefined;
  const { data: fetchedPatient, isLoading: isPatientLoading } =
    useGetIRI(embeddedPatient ? "" : patientIri);
  const { data: fetchedOwner, isLoading: isOwnerLoading } = useGetIRI(
    embeddedOwner ? "" : ownerIri,
  );
  const patient = (embeddedPatient ?? fetchedPatient) as
    | PatientInterface
    | undefined;
  const owner = (embeddedOwner ?? fetchedOwner) as UserInterface | undefined;
  const status = String(
    mission.status || "A_FAIRE",
  ) as keyof typeof MissionStatus;
  const openMission = () =>
    router.push(`/application/missions/${mission.uuid}/view`, {
      scroll: false,
    });

  if (isPatientLoading || isOwnerLoading) {
    return (
      <TableRow>
        <TableCell colSpan={8}>
          <Skeleton className="h-[52px] w-full" />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow
      ref={lastElementRef}
      className="cursor-pointer"
      onClick={openMission}
    >
      <TableCell className="font-medium">{mission.id}</TableCell>
      <TableCell>
        <span className="uppercase">{patient?.lastname}</span>{" "}
        {patient?.firstname}
      </TableCell>
      <TableCell>
        {owner?.firstname} {owner?.lastname}
      </TableCell>
      <TableCell>{dayjs(mission.beginDate).format("dddd DD/MM/YY")}</TableCell>
      <TableCell>{dayjs(mission.endDate).format("dddd DD/MM/YY")}</TableCell>
      <TableCell>
        {mission.duration} {mission.duration > 1 ? "jours" : "jour"}
      </TableCell>
      <TableCell>
        <BadgeStatus status={status} label={MissionStatus[status]} />
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Consulter la mission"
              onClick={(event) => {
                event.stopPropagation();
                openMission();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Consulter</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
