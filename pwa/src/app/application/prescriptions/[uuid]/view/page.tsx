"use client"
import PageContent from "@/components/page-content";
import { useCombinedQueries, useGetIRI } from "@/hooks/useQuery";
import { PDFViewer } from '@react-pdf/renderer';
import { useParams } from "next/navigation";
import PdfOpas from "./pdfOpas";

export default function ViewPrescriptionPage() {

  const params = useParams<{ uuid: string }>()
  const iri = params.uuid ? `/prescriptions/${params.uuid}` : ""
  const { data: prescription, isLoading } = useGetIRI(iri);
  const { data: mission, isLoading: isLoadingMission } = useGetIRI(prescription ? prescription.mission : "");
  const { data: owner, isLoading: isLoadingOwner } = useGetIRI(prescription ? prescription.owner : "");
  const { data: patient, isLoading: isLoadingPatient } = useGetIRI(prescription ? prescription.patient : "");
  const { data: principal, isLoading: isLoadingPrincipal } = useGetIRI(mission ? mission.principal : "");
  const { data: insurance, isLoading: isLoadingInsurance } = useGetIRI(mission ? mission.insurance : "");
  const { data: cooperators, isLoading: isLoadingCooperators } = useCombinedQueries(mission ? mission.owners : [])

  console.log('prescription', prescription)
  console.log('mission', mission)
  console.log('owner', owner)
  console.log('patient', patient)
  console.log('principal', principal)
  console.log('insurance', insurance)
  console.log('cooperators', cooperators)

  if (isLoading || isLoadingMission || isLoadingPatient || isLoadingPrincipal || isLoadingOwner || isLoadingInsurance || isLoadingCooperators) {
    return (
      <PageContent title="Prescription">
        Chargement…
      </PageContent>
    );
  }

  return (
    <PageContent title="Prescription">
      <PDFViewer style={{ width: '100%', height: '90vh' }}>
        <PdfOpas mission={mission} prescription={prescription} owner={owner} patient={patient} principal={principal} insurance={insurance} cooperators={cooperators} />
      </PDFViewer>
    </PageContent>
  );
}
