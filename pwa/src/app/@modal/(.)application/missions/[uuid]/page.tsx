"use client";

import Form from "@/app/application/missions/form";
import Modal from "@/components/modal";

export default function EditMissionModalPage() {

  return (
    <Modal
      title="Mission"
      description="Modifier cette mission"
    >
      <Form />
    </Modal>
  );
}
