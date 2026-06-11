
import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";
import Form from "../form";

export default function NewEventPage() {

  return (
    <PageContent title="Nouvel événement">
      <FormContainer
        title="Événement"
        description="Créer une nouvel événement"
      >
        <Form />
      </FormContainer >

    </PageContent>
  );
}
