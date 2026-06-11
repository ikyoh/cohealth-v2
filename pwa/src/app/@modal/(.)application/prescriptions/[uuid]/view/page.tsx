"use client"

import PDFDocument from "@/app/application/prescriptions/[uuid]/view/pdfOpas";
import PdfModal from "@/components/pdf-modal";
import { useGetIRI } from "@/hooks/useQuery";
import { PDFViewer } from '@react-pdf/renderer';
import { useParams } from "next/navigation";

export default function ViewPdfModalPage() {

  const params = useParams<{ uuid: string }>()
  const iri = params.uuid ? `/prescriptions/${params.uuid}` : ""
  const { data: prescription, isLoading } = useGetIRI(iri);

  return (
    <PdfModal
      title="Assurance"
    >
      <PDFViewer style={{ width: '100%', height: '90vh' }}>
        <PDFDocument missionIRI={iri} prescription={prescription} isLoading={isLoading} />
      </PDFViewer>
    </PdfModal>
  );
}



