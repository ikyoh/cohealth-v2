"use client";

import { Spinner } from "@/components/ui/spinner";
import { useGetIRI } from "@/hooks/useQuery";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: currentUser, isLoading, isError } = useGetIRI("/current_user");
    const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN") ?? false;

    useEffect(() => {
        if (!isLoading && (isError || !isAdmin)) {
            router.replace("/application");
        }
    }, [isAdmin, isError, isLoading, router]);

    if (isLoading || !isAdmin) {
        return (
            <div className="flex min-h-svh flex-1 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return children;
}
