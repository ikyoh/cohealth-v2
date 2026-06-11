import ModalLink from "@/components/modal-link"
import PageContent from "@/components/page-content"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import Content from "./content"


export default function PageServices() {
    return (
        <PageContent title="Prestations" actions={<Actions />}>
            <Content />
        </PageContent >
    )
}

const Actions = () =>
    <>
        <Input type="search" />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                    Filtres <ChevronDown />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Statut</DropdownMenuLabel>
                <DropdownMenuItem>
                    En cours
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Archivé
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Facturé
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Annulé
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Tous
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <ModalLink title="Nouvelle prestation" href="/application/services/new" />
    </>
