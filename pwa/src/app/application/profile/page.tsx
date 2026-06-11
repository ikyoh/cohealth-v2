import ModalLink from "@/components/modal-link";
import PageContent from "@/components/page-content";
import { LucidePenLine } from "lucide-react";
import Content from "./content";

export default function PageProfile() {
    return (
        <PageContent title="Mon compte" actions={<Actions />}>
            <Content />
        </PageContent >
    )
}


const Actions = () => <ModalLink title="Éditer" icon={<LucidePenLine />} href="/application/profile/edit" />
