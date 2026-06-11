
import ViewWeek from "@/app/application/events/view-week";
import PageContent from "@/components/page-content";
import { SidebarRight } from "@/components/sidebar-right";
import Form from "./form";

export default function EditPrescriptionPage() {

  return (
    <>
      <PageContent title="Planification">
        <ViewWeek />
      </PageContent>
      <SidebarRight>
        <Form />
      </SidebarRight>
    </>
  );
}
