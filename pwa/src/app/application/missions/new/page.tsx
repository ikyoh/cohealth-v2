
import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";
import Form from "../form";

export default function NewMissionPage() {

  return (
    <PageContent title="Nouvelle mission">
      <FormContainer
        title="Mission"
        description="Créer un nouvelle mission"
      >
        <Form />
      </FormContainer >
    </PageContent>
  );
}
