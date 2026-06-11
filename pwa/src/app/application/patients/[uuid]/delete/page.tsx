'use client';
import DeleteConfirmation from "@/components/delete-confirmation";
import FormContainer from "@/components/form-container";
import { usePathname } from "next/navigation";

export default function DeleteCategoryPage() {

    const pathname = usePathname()

    return (
        <FormContainer
            title="Catégorie"
            description="Confirmer la suppression ?">
            <DeleteConfirmation />
        </FormContainer>
    )


}
