import PageContent from "@/components/page-content";
import SearchInput from "@/components/search-input";
import Content from "./content";

export default function CooperationsPage() {
  return (
    <PageContent
      title="Coopérations"
      actions={<SearchInput placeholder="Patient, description, statut" />}
    >
      <Content />
    </PageContent>
  );
}
