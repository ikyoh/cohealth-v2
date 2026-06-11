"use client";
import Form from "@/app/application/insurances/form";
import Modal from "@/components/modal";

export default function NewInsuranceModalPage() {

  return (
    <Modal
      title="Assurance"
      description="Créer une nouvelle assurance"
    >
      <Form />
    </Modal>
  );
}
