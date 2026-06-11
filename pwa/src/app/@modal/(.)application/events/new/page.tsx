"use client";
import Form from "@/app/application/events/form";
import Modal from "@/components/modal";

export default function NewEventModalPage() {

  return (
    <Modal
      title="Événement"
      description="Créer un nouvel événement"
    >
      <Form />
    </Modal>
  );
}
