"use client";

import Form from "@/app/application/services/form";
import Modal from "@/components/modal";
import { usePathname } from "next/navigation";

export default function EditCategoryModalPage() {

  const pathname = usePathname();
  const iri = pathname.replace('/application', '');

  return (
    <Modal
      title="Prestation"
      description="Modifier cette prestation"
    >
      <Form iri={iri as string | undefined} />
    </Modal>
  );
}
