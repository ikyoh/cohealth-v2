import PageContent from "@/components/page-content"
import Dashboard from "./dashboard"
import HomePageTitle from "./home-page-title"

export default function Page() {
  return (
    <PageContent title={<HomePageTitle />}>
      <Dashboard />
    </PageContent>
  )
}
