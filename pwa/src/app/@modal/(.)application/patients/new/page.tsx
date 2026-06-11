"use client";
import Form from "@/app/application/patients/form";
import Modal from "@/components/modal";

export default function NewPatientModalPage() {

  return (
    <Modal
      title="Patient"
      description="Créer un nouveau patient"
    >
      <Form />
    </Modal>
  );
}
