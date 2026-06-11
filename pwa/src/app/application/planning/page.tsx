import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"
import { SidebarRight } from "@/components/sidebar-right"
import ViewWeek from "./view-week"

export default function Page() {
  return (
    <>
      <PageContent title="Planning" actions={<ModalLink title="Nouvel événement" href="/application/planning/new" />}>
        <ViewWeek />
      </PageContent>
      <SidebarRight>
        <div
          className="droppable-element"
          draggable={true}
          unselectable="on"
          data-data="some data"
        // this is a hack for firefox
        // Firefox requires some kind of initialization
        // which we can do by adding this attribute
        // @see https://bugzilla.mozilla.org/show_bug.cgi?id=568313
        //onDragStart={e => e.dataTransfer.setData("text/plain", "")}
        >
          Droppable Element (Drag me!)
        </div>
      </SidebarRight>
    </>
  )
}
