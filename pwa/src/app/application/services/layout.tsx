import AdminOnly from "@/components/admin-only";

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return <AdminOnly>{children}</AdminOnly>;
}
