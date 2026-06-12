'use client';
import ViewWeek from "@/app/application/events/view-week";
import Avatars from "@/components/avatars";
import BackButton from "@/components/back-button";
import PageContent from "@/components/page-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCombinedQueries, useGetIRI } from "@/hooks/useQuery";
import dayjs from '@/utils/dayjs.config';
import { Cantons, InsuranceCategory, PrincipalCategories } from "@/utils/types.utils";
import { BriefcaseMedical, FileText, HeartPulse } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import MissionActions from "../../mission-actions";
import OpasActions from "../../opas-actions";
import DocumentsSummary from "./documents-summary";
import DocumentsTab from "./documents-tab";
import ObservationsTab from "./observations-tab";
import BillingTab from "./billing-tab";

const getIri = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "@id" in value) {
    return String(value["@id"]);
  }

  return "";
};

export default function MissionPage() {

  const { uuid } = useParams();
  const searchParams = useSearchParams();
  const iri = `/missions/${uuid}`;
  const defaultTab = searchParams.get("tab") || "informations";

  const { data, isLoading, error, isSuccess: isGetSuccess } = useGetIRI(iri ? iri : "");
  const { data: patient, isLoading: isLoadingPatient, error: errorPatient, isSuccess: isGetSuccessPatient } = useGetIRI(data ? data.patient : "");
  const { data: principal, isLoading: isLoadingPrincipal, error: errorPrincipal, isSuccess: isGetSuccessPrincipal } = useGetIRI(data ? data.principal : "");
  const { data: insurance, isLoading: isLoadingInsurance, error: errorInsurance, isSuccess: isGetSuccessInsurance } = useGetIRI(data ? data.insurance : "");
  const { data: owners = [], isLoading: isLoadingOwners } = useCombinedQueries(data?.owners ?? []);
  const { data: owner, isLoading: isLoadingOwner } = useGetIRI(getIri(data?.owner));
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useGetIRI("/current_user");
  const isMissionOwner = getIri(data?.owner) === currentUser?.iri;

  const allLoading = isLoading || isLoadingPatient || isLoadingPrincipal || isLoadingInsurance || isLoadingOwners || isLoadingOwner || isLoadingCurrentUser
  const allError = error || errorPatient || errorPrincipal || errorInsurance
  const allSuccess = isGetSuccess && isGetSuccessPatient && isGetSuccessPrincipal && isGetSuccessInsurance

  console.log("owners", owners)

  const Actions = () => {
    return (
      <>
        <Avatars iris={data?.owners} />
        <OpasActions missionUUID={data?.uuid} opasIRI={data?.opas} readOnly={!isMissionOwner} />
        <MissionActions iri={iri} />
        <BackButton />
      </>

    )
  }

  if (allLoading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner />
    </div>)
  return (
    <PageContent title="Mission" actions={<Actions />}>
      <Tabs defaultValue={defaultTab}>
        <TabsList className="bg-primary">
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="observations">Observations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="facturation">Facturation</TabsTrigger>
        </TabsList >
        <TabsContent value="informations">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseMedical />
                  Synthèse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-bold">
                  Du {dayjs(data.beginDate).format('dddd DD/MM/YYYY')} au {dayjs(data.endDate).format('dddd DD/MM/YYYY')} ({data.duration} {data.duration > 1 ? 'jours' : 'jour'})
                </p>
                <div>
                  <p className="text-muted-foreground text-xs font-bold">
                    Description de la mission
                  </p>
                  <p>{data.description}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold">
                    Mandant
                  </p>
                  <p>
                    {principal.name}
                  </p>
                  <p className="text-xs">
                    {PrincipalCategories[principal.category]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold">
                    Assurance
                  </p>
                  <p>
                    {insurance.name}
                  </p>
                  <p className="text-xs">
                    {InsuranceCategory[insurance.category]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold flex items-center gap-1">
                    {isMissionOwner ? "Collaborateurs" : "Référent"}
                  </p>
                  {!isMissionOwner ? (
                    <p>{owner?.firstname} {owner?.lastname}</p>
                  ) : owners.length > 0 ? (
                    <ul className="space-y-1">
                      {owners.map((owner) => (
                        <li key={owner.id}>{owner.firstname} {owner.lastname}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucun collaborateur</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-bold">
                  {patient.gender === "male" ? "Monsieur" : "Madame"} {patient.firstname} {patient.lastname}    ({dayjs().diff(patient.birthDate, "years")}{" "}ans)
                </p>
                <div>
                  <p className="text-muted-foreground text-xs font-bold">
                    Infos {patient.gender === "male" ? "assuré" : "assurée"}
                  </p>
                  <p>
                    {patient.gender === "male" ? "Né" : "Née"} le : {dayjs(patient.birthDate).format('DD/MM/YYYY')}
                  </p>
                  <p>
                    Numéro d'{patient.gender === "male" ? "assuré" : "assurée"} : {patient.insuranceNumber}
                  </p>
                  <p>
                    Numéro AVS : {patient.avsNumber}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold">
                    Coordonnées
                  </p>
                  <p>
                    Adresse : {patient.address} {patient.additionalAddress && `<br /> ${patient.additionalAddress}`}
                  </p>
                  <p>
                    Ville : {patient.city}
                  </p>
                  <p>
                    Canton : {Cantons[patient.canton]}
                  </p>
                  {patient.mobile && <p>Mobile : {patient.mobile}</p>}
                  {patient.phone && <p>Téléphone : {patient.phone}</p>}
                  {patient.email && <p>Email : {patient.email}</p>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentsSummary missionIri={iri} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="planning">
          <ViewWeek mission={iri} />
        </TabsContent>
        <TabsContent value="observations">
          <ObservationsTab missionIri={iri} canManage={isMissionOwner} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab missionIri={iri} canManage={isMissionOwner} />
        </TabsContent>
        <TabsContent value="facturation">
          <BillingTab missionIri={iri} owner={owner} cooperators={owners} />
        </TabsContent>
      </Tabs >

    </PageContent >
  )

}
