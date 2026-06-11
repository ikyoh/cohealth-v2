"use client";

import Form from "@/app/application/patients/form";
import Modal from "@/components/modal";

export default function EditPatientModalPage() {

  return (
    <Modal
      title="Patient"
      description="Modifier le patient"
    >
      <Form />
    </Modal>
  );
}
