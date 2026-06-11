import { Button } from "@/components/ui/button";
import { useDeleteIRI } from "@/hooks/useQuery";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const DeleteConfirmation = () => {

    const pathname = usePathname()
    const router = useRouter()

    console.log(pathname);
    const iri = pathname?.replace('/application', '').replace('/delete', '');

    const { mutate, isSuccess, isPending } = useDeleteIRI();

    useEffect(() => {
        if (isSuccess) {
            router.back();
        }
    }, [isSuccess, router]);

    return (
        <div>
            <p>Attention cette action est irréversible</p>
            <p>Êtes vous sûr de vouloir continuer?</p>
            <div className="flex gap-3 mt-5">
                <Button
                    type="button"
                    variant="secondary"
                    disabled={isPending}
                    onClick={() => router.back()}>
                    Annuler
                </Button>
                {
                    pathname &&
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isPending}
                        loading={isPending}
                        onClick={() => mutate(iri)}
                    >
                        Supprimer
                    </Button>
                }
            </div>
        </div>
    );
};

export default DeleteConfirmation;