import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage
} from "@/components/ui/breadcrumb"
import {
    SidebarInset,
    SidebarTrigger
} from "@/components/ui/sidebar"
import { Separator } from "@radix-ui/react-separator"



export default function PageContent({ children, actions, title }: { children: React.ReactNode, actions?: React.ReactNode, title?: React.ReactNode }) {
    return (
        <SidebarInset>
            <header className="sticky top-0 flex shrink-0 items-center gap-2 bg-background/60 backdrop-blur-xl z-40 px-4 py-3">
                <div className="flex flex-1 items-center gap-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="mr-2 h-4 w-px bg-foreground" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="line-clamp-1">
                                    {title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                {actions && <div className="flex items-center gap-2">
                    {actions}
                </div>}
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
                {children}
            </div>
        </SidebarInset>
    )
}
