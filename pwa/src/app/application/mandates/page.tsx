import PageContent from "@/components/page-content"
import MandateActions from "./actions"
import MandatesContent from "./content"

export default function MandatesPage() {
  return (
    <PageContent
      title="Mandats"
      actions={<MandateActions />}
    >
      <MandatesContent />
    </PageContent>
  )
}
