"use client";

import FormInput from "@/components/form/form-input";
import FormLoader from "@/components/form/form-loader";
import PageContent from "@/components/page-content";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetIRI, usePatchQuery } from "@/hooks/useQuery";
import { profileFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: ProfileFormValues = {
    firstname: "",
    lastname: "",
    email: "",
    organizationName: "",
    rcc: "",
    gln: "",
    mobile: "",
    phone: "",
    fax: "",
    address: "",
    postCode: "",
    city: "",
    country: "Suisse",
    roles: [],
};

export default function ProfileEditPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [submitError, setSubmitError] = useState("");
    const {
        data: currentUser,
        isLoading: isLoadingCurrentUser,
        isError: isCurrentUserError,
    } = useGetIRI("/current_user");
    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isUserError,
        isSuccess: isUserSuccess,
    } = useGetIRI(currentUser?.iri || "");
    const { mutateAsync: updateProfile, isPending } = usePatchQuery();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
    });

    useEffect(() => {
        if (!isUserSuccess || !user) return;

        form.reset({
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            email: user.email || "",
            organizationName: user.organizationName || "",
            rcc: user.rcc || "",
            gln: user.gln || "",
            mobile: user.mobile || "",
            phone: user.phone || "",
            fax: user.fax || "",
            address: user.address || "",
            postCode: user.postCode || "",
            city: user.city || "",
            country: user.country || "Suisse",
            roles: currentUser?.roles || [],
        });
    }, [currentUser?.roles, form, isUserSuccess, user]);

    const onSubmit: SubmitHandler<ProfileFormValues> = async (values) => {
        if (!currentUser?.iri) return;

        setSubmitError("");

        try {
            const { roles, ...profile } = values;

            await updateProfile({
                iri: currentUser.iri,
                ...profile,
            });
            await queryClient.invalidateQueries({ queryKey: ["/current_user"] });
            router.push("/application/profile");
        } catch {
            setSubmitError(
                "La mise à jour du profil a échoué. Vérifiez les informations saisies.",
            );
        }
    };

    if (isLoadingCurrentUser || isLoadingUser) {
        return (
            <PageContent title="Modifier mon profil">
                <FormLoader length={12} />
            </PageContent>
        );
    }

    if (isCurrentUserError || isUserError || !user) {
        return (
            <PageContent title="Modifier mon profil">
                <p className="text-sm text-destructive">
                    Impossible de charger le profil.
                </p>
            </PageContent>
        );
    }

    return (
        <PageContent title="Modifier mon profil">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full max-w-3xl space-y-8"
                >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormInput
                            form={form}
                            name="firstname"
                            title="Prénom"
                            placeholder="Prénom"
                            autoComplete="given-name"
                            required
                        />
                        <FormInput
                            form={form}
                            name="lastname"
                            title="Nom"
                            placeholder="Nom"
                            autoComplete="family-name"
                        />
                        <FormInput
                            form={form}
                            name="email"
                            title="Email"
                            placeholder="Adresse email"
                            type="email"
                            autoComplete="email"
                            required
                        />
                        <FormInput
                            form={form}
                            name="organizationName"
                            title="Organisation"
                            placeholder="Nom de l’organisation"
                            autoComplete="organization"
                        />
                        <FormInput
                            form={form}
                            name="rcc"
                            title="RCC"
                            placeholder="A123456"
                            required={!currentUser.roles?.some((role: string) =>
                                ["ROLE_ADMIN", "ROLE_COORDINATOR", "ROLE_COORNINATOR"].includes(role)
                            )}
                        />
                        <FormInput
                            form={form}
                            name="gln"
                            title="GLN"
                            placeholder="13 chiffres"
                            inputMode="numeric"
                            required={!currentUser.roles?.some((role: string) =>
                                ["ROLE_ADMIN", "ROLE_COORDINATOR", "ROLE_COORNINATOR"].includes(role)
                            )}
                        />
                        <FormInput
                            form={form}
                            name="mobile"
                            title="Mobile"
                            placeholder="Numéro mobile"
                            type="tel"
                            autoComplete="tel"
                        />
                        <FormInput
                            form={form}
                            name="phone"
                            title="Téléphone"
                            placeholder="Numéro de téléphone"
                            type="tel"
                        />
                        <FormInput
                            form={form}
                            name="fax"
                            title="Fax"
                            placeholder="Numéro de fax"
                            type="tel"
                        />
                        <div className="hidden md:block" />
                        <div className="md:col-span-2">
                            <FormInput
                                form={form}
                                name="address"
                                title="Adresse"
                                placeholder="Adresse principale"
                                autoComplete="street-address"
                                required
                            />
                        </div>
                        <FormInput
                            form={form}
                            name="postCode"
                            title="NPA"
                            placeholder="Code postal"
                            autoComplete="postal-code"
                        />
                        <FormInput
                            form={form}
                            name="city"
                            title="Ville"
                            placeholder="Ville"
                            autoComplete="address-level2"
                        />
                        <div className="md:col-span-2">
                            <FormInput
                                form={form}
                                name="country"
                                title="Pays"
                                placeholder="Pays"
                                autoComplete="country-name"
                                required
                            />
                        </div>
                    </div>

                    {submitError && (
                        <p role="alert" className="text-sm text-destructive">
                            {submitError}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="cancel"
                            onClick={() => router.back()}
                            disabled={isPending}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" loading={isPending}>
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </Form>
        </PageContent>
    );
}
