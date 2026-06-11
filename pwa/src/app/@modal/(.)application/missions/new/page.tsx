"use client";
import Form from "@/app/application/missions/form";
import Modal from "@/components/modal";

export default function NewMissionModalPage() {

  return (
    <Modal
      title="Mission"
      description="Créer une nouvelle mission"
    >
      <Form />
    </Modal>
  );
}
