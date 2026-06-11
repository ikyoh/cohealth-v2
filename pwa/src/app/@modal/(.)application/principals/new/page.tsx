"use client";
import Form from "@/app/application/principals/form";
import Modal from "@/components/modal";

export default function NewInsuranceModalPage() {

  return (
    <Modal
      title="Mandant"
      description="Créer un nouveau mandant"
    >
      <Form />
    </Modal>
  );
}
