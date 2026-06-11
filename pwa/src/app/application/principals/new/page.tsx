
import Form from "../form";
import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";

export default function NewInsurancePage() {

  return (
    <PageContent title="Nouveau mandant">
      <FormContainer
        title="Mandant"
        description="Créer une nouveau mandant"
      >
        <Form />
      </FormContainer >

    </PageContent>
  );
}
