
import FormContainer from "@/components/form-container";
import PageContent from "@/components/page-content";
import Form from "../form";

export default function EditPrescriptionPage() {

  return (
    <PageContent title="Prescription">
      <FormContainer
        title="Prescription"
        description="Modifer la prescription"
      >
        <Form />
      </FormContainer >

    </PageContent>
  );
}
