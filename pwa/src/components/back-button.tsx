import { Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export default function BackButton() {

    const router = useRouter()

    return (
        <Button variant="primary" onClick={() => router.back()}>
            <Undo2 />
        </Button>
    );
}