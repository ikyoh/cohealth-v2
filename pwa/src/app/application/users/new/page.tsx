import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";
import Form from "../form";

export default function NewUserPage() {
  return (
    <PageContent title="Nouvel utilisateur">
      <FormContainer
        title="Utilisateur"
        description="Créer un nouvel utilisateur"
      >
        <Form />
      </FormContainer>
    </PageContent>
  );
}
