import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"
import SearchInput from "@/components/search-input"
import Content from "./content"

export default function PagePrincipals() {
  return (
    <PageContent title="Mandants" actions={<Actions />}>
      <Content />
    </PageContent >
  )
}


const Actions = () =>
  <>
    <SearchInput placeholder="Nom, Catégorie, GLN" />
    <ModalLink title="Nouveau mandant" href="/application/principals/new" />
  </>