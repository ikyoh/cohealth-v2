"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetIRI } from "@/hooks/useQuery";
import { PenLine } from "lucide-react";
import { useRouter } from "next/navigation";

const getIri = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "@id" in value) {
        return String(value["@id"]);
    }

    return "";
};

export default function Content() {
    const router = useRouter();
    const { data: currentUser, isLoading: isLoadingCurrentUser, isError: isCurrentUserError } = useGetIRI("/current_user");
    const { data: user, isLoading: isLoadingUser, isError: isUserError } = useGetIRI(currentUser?.iri || "");
    const { data: signature, isLoading: isLoadingSignature } = useGetIRI(getIri(user?.signature));
    const { data: avatar, isLoading: isLoadingAvatar } = useGetIRI(getIri(user?.avatar));

    if (isLoadingCurrentUser || isLoadingUser || isLoadingSignature || isLoadingAvatar) {
        return <Skeleton className="h-12 w-50" />;
    }

    if (!user || isCurrentUserError || isUserError) {
        return <p className="text-sm text-destructive">Impossible de charger le profil.</p>;
    }

    const fullName = [user.firstname, user.lastname].filter(Boolean).join(" ");
    const initials = `${user.firstname?.charAt(0) || ""}${user.lastname?.charAt(0) || ""}`;

    return (
        <div>
            <Card>
                <CardHeader className="space-y-2">
                    <Avatar
                        className="relative h-18 w-18 cursor-pointer rounded-lg"
                        onClick={() => router.push("/application/profile/edit/avatar", { scroll: false })}
                    >
                        <AvatarImage src={avatar?.contentUrl} alt={fullName} />
                        <AvatarFallback className="rounded-lg bg-primary">
                            {initials}
                        </AvatarFallback>
                        <PenLine size={24} className="absolute right-0 bottom-0 rounded-tl-md bg-muted p-1" />
                    </Avatar>
                    <CardTitle>{fullName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>Email: {user.email}</p>
                    <p>Mobile: +{user.mobile}</p>
                    <p>Rcc: {user.rcc}</p>
                    <p>GLN: {user.gln}</p>
                    <p>Adresse: {user.address}</p>
                    <p>Ville: {user.city}</p>
                    <p>Code Postal: {user.postCode}</p>
                    <p>Pays: {user.country}</p>
                </CardContent>
                <CardFooter>
                    <Avatar
                        className="relative h-18 w-50 cursor-pointer rounded-lg border"
                        onClick={() => router.push("/application/profile/edit/signature", { scroll: false })}
                    >
                        <AvatarImage src={signature?.contentUrl} alt="Signature" />
                        <AvatarFallback className="rounded-lg bg-muted">
                            Ma signature
                        </AvatarFallback>
                        <PenLine size={24} className="absolute right-0 bottom-0 rounded-tl-md bg-muted p-1" />
                    </Avatar>
                </CardFooter>
            </Card>
        </div>
    );
}
