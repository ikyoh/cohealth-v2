"use client";

import Form from "@/app/application/users/form";
import Modal from "@/components/modal";

export default function NewUserModalPage() {
  return (
    <Modal
      title="Utilisateur"
      description="Créer un nouvel utilisateur"
    >
      <Form />
    </Modal>
  );
}
