"use client";

import Form from "@/app/application/principals/form";
import Modal from "@/components/modal";
import { usePathname } from "next/navigation";

export default function EditCategoryModalPage() {

  const pathname = usePathname();
  const iri = pathname.replace('/application', '');

  return (
    <Modal
      title="Mandant"
      description="Modifier le mandant"
    >
      <Form iri={iri as string | undefined} />
    </Modal>
  );
}
