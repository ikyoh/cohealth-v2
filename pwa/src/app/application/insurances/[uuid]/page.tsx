'use client';
import FormPageContainer from "@/components/form-container";
import { usePathname } from "next/navigation";
import Form from "../form";

export default function EditItemPage() {

  const pathname = usePathname()
  const iri = pathname.replace('/application', '');


  return (
    <FormPageContainer
      title="Assurance"
      description="Modifier cette assurance"
    >
      <Form iri={iri as string | undefined} />
    </FormPageContainer>
  )


}
