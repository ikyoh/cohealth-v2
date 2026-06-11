"use client";

import Form from "@/app/application/insurances/form";
import Modal from "@/components/modal";
import { usePathname } from "next/navigation";

export default function EditCategoryModalPage() {

  const pathname = usePathname();
  const iri = pathname.replace('/application', '');

  return (
    <Modal
      title="Assurance"
      description="Modifier cette assurance"
    >
      <Form iri={iri as string | undefined} />
    </Modal>
  );
}
