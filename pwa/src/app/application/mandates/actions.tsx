"use client"

import ModalLink from "@/components/modal-link"
import { useGetIRI } from "@/hooks/useQuery"

export default function MandateActions() {
  const { data: currentUser } = useGetIRI("/current_user")

  if (!currentUser?.roles?.includes("ROLE_PRINCIPAL")) {
    return null
  }

  return <ModalLink title="Nouveau dossier" href="/application/mandates/new" />
}
