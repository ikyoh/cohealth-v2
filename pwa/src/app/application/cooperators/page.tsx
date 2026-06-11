import PageContent from "@/components/page-content"
import SearchInput from "@/components/search-input"
import Content from "./content"
import RoleFilter from "./role-filter"

export default function CooperatorsPage() {
  return (
    <PageContent
      title="Collaborateurs"
      actions={
        <>
          <RoleFilter />
          <SearchInput placeholder="Nom, organisation ou email" />
        </>
      }
    >
      <Content />
    </PageContent>
  )
}
