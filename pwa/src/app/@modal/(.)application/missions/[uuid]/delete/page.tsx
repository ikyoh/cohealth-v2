"use client";

import DeleteConfirmation from "@/components/delete-confirmation";
import { Modal } from "@/components/modal";

export default function DeleteCategoryModalPage() {


  return (
    <Modal
      title="Catégorie"
      description="Supprimer cette catégorie ?"
    >
      <DeleteConfirmation />
    </Modal>
  );
}
