"use client"
import BackButton from "@/components/back-button";
import PageContent from "@/components/page-content";
import { Spinner } from "@/components/ui/spinner";
import { useCombinedQueries, useGetIRI } from "@/hooks/useQuery";
import { PDFViewer } from '@react-pdf/renderer';
import { useParams, useSearchParams } from "next/navigation";
import PdfOpas from "./pdfOpas";

export default function ViewPrescriptionPage() {

  const params = useParams<{ uuid: string }>()
  const searchParams = useSearchParams()
  const isOnePage = searchParams.get("onepage") === "true"
  const iri = params.uuid ? `/prescriptions/${params.uuid}` : ""
  const { data: prescription, isLoading } = useGetIRI(iri);
  const { data: mission, isLoading: isLoadingMission } = useGetIRI(prescription ? prescription.mission : "");
  const { data: owner, isLoading: isLoadingOwner } = useGetIRI(prescription ? prescription.owner : "");
  const { data: patient, isLoading: isLoadingPatient } = useGetIRI(prescription ? prescription.patient : "");
  const { data: principal, isLoading: isLoadingPrincipal } = useGetIRI(mission ? mission.principal : "");
  const { data: insurance, isLoading: isLoadingInsurance } = useGetIRI(mission ? mission.insurance : "");
  const { data: cooperators, isLoading: isLoadingCooperators } = useCombinedQueries(mission ? mission.owners : [])


  if (isLoading || isLoadingMission || isLoadingPatient || isLoadingPrincipal || isLoadingOwner || isLoadingInsurance || isLoadingCooperators) {
    return (
      <PageContent title="Prescription" actions={<BackButton />}>
        <Spinner />
      </PageContent>
    );
  }

  return (
    <PageContent title="Prescription" actions={<BackButton />}>
      <PDFViewer style={{ width: '100%', height: '90vh' }}>
        <PdfOpas mission={mission} prescription={prescription} owner={owner} patient={patient} principal={principal} insurance={insurance} cooperators={cooperators} isOnePage={isOnePage} />
      </PDFViewer>
    </PageContent>
  );
}
