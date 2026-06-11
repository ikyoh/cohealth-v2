
import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";
import Form from "../form";

export default function NewInsurancePage() {

  return (
    <PageContent title="Nouvelle assurance">
      <FormContainer
        title="Assurance"
        description="Créer une nouvelle assurance"
      >
        <Form />
      </FormContainer >

    </PageContent>
  );
}
