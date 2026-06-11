
import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";
import Form from "../form";

export default function NewInsurancePage() {

  return (
    <PageContent title="Nouveau patient">
      <FormContainer
        title="Patient"
        description="Créer un nouveau patient"
      >
        <Form />
      </FormContainer >

    </PageContent>
  );
}
