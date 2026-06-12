
import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"
import { SidebarRight } from "@/components/sidebar-right"
import { Separator } from "@/components/ui/separator"
import { CooperatorFilter } from "./cooperator-filter"
import { DatePicker } from "./date-picker"
import { PatientFilter } from "./patient-filter"
import ViewWeek from "./view-week"

export default function Page() {


  return (
    <>
      <PageContent title="Planning" actions={<Actions />}>
        <ViewWeek />
      </PageContent>
      <SidebarRight>
        <DatePicker />
        <Separator className="my-4" />
        <PatientFilter />
        <Separator className="my-4" />
        <CooperatorFilter />
      </SidebarRight>
    </>
  )
}

const Actions = () => (
  <ModalLink title="Nouvel événement" href="/application/events/new" />
)
