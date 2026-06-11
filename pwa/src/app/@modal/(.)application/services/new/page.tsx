"use client";
import Form from "@/app/application/services/form";
import Modal from "@/components/modal";

export default function NewCategorieModalPage() {

  return (
    <Modal
      title="Prestation"
      description="Créer une nouvelle prestation"
    >
      <Form />
    </Modal>
  );
}
