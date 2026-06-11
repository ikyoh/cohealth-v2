
import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"
import { SidebarRight } from "@/components/sidebar-right"
import { PatientFilter } from "./patient-filter"
import ViewWeek from "./view-week"

export default function Page() {


  return (
    <>
      <PageContent title="Planning" actions={<Actions />}>
        <ViewWeek />
      </PageContent>
      <SidebarRight>
        <PatientFilter />
      </SidebarRight>
    </>
  )
}

const Actions = () => (
  <ModalLink title="Nouvel événement" href="/application/events/new" />
)
