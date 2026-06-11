import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"
import SearchInput from "@/components/search-input"
import Content from "./content"

export default function PagePrincipals() {
    return (
        <PageContent title="Missions" actions={<Actions />}>
            <Content />
        </PageContent >
    )
}


const Actions = () =>
    <>
        <SearchInput placeholder="Patient, description, statut" />
        <ModalLink title="Nouvelle mission" href="/application/missions/new" />
    </>

