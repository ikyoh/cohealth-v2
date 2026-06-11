'use client';

import FormPageContainer from "@/components/form-container";
import { usePathname } from "next/navigation";
import Form from "../form";

export default function EditUserPage() {
  const pathname = usePathname()
  const iri = pathname.replace('/application', '');

  return (
    <FormPageContainer
      title="Utilisateur"
      description="Modifier cet utilisateur"
    >
      <Form iri={iri as string | undefined} />
    </FormPageContainer>
  )
}
