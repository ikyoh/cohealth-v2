"use client";

import Form from "@/app/application/users/form";
import Modal from "@/components/modal";
import { usePathname } from "next/navigation";

export default function EditUserModalPage() {
  const pathname = usePathname();
  const iri = pathname.replace('/application', '');

  return (
    <Modal
      title="Utilisateur"
      description="Modifier cet utilisateur"
    >
      <Form iri={iri as string | undefined} />
    </Modal>
  );
}
