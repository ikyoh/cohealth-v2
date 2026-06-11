
import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";
import Form from "../form";

export default function NewCategoryPage() {

  return (
    <PageContent title="Nouvelle prestation">
      <FormContainer
        title="Catégorie"
        description="Créer une nouvelle catégorie"
      >
        <Form />
      </FormContainer >

    </PageContent>
  );
}
