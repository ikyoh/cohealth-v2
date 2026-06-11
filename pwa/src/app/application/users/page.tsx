"use client"

import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"
import SearchInput from "@/components/search-input"
import Content from "./content"

export default function PageUsers() {
  return (
    <PageContent title="Utilisateurs" actions={<Actions />}>
      <Content />
    </PageContent>
  )
}

const Actions = () => (
  <>
    <SearchInput placeholder="Nom, prénom, email, organisation" />
    <ModalLink title="Nouvel utilisateur" href="/application/users/new" />
  </>
)
