"use client"

import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"
import SearchInput from "@/components/search-input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { InsuranceCategory } from "@/utils/types.utils"
import { Check, ChevronDown } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Content from "./content"

export default function PageInsurances() {
  return (
    <PageContent title="Assurances" actions={<Actions />}>
      <Content />
    </PageContent >
  )
}



const Actions = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const activeCategory = searchParams.get("category")

  const handleCategoryFilter = (category?: string) => {
    const params = new URLSearchParams(searchParams)

    if (category) params.set("category", category)
    else params.delete("category")

    const queryString = params.toString()

    router.replace(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <>
      <SearchInput placeholder="Intitulé, Groupe, GLN" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Filtres <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Catégorie</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleCategoryFilter()}>
            <Check className={activeCategory ? "invisible" : ""} />
            Toutes
          </DropdownMenuItem>
          {Object.values(InsuranceCategory).map((category) => (
            <DropdownMenuItem key={category} onClick={() => handleCategoryFilter(category)}>
              <Check className={activeCategory === category ? "" : "invisible"} />
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ModalLink title="Nouvelle assurance" href="/application/insurances/new" />
    </>
  )
}
