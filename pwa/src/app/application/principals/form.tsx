"use client";

import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { enumToSelectItems } from "@/utils/functions.utils";
import { Cantons, PrincipalCategories } from "@/utils/types.utils";
import { principalFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";


type Props = {
    iri?: string;
    cancelAction?: () => void;
    submitAction?: (value: object) => void;
}

const PrincipalForm = ({ iri, cancelAction, submitAction }: Props) => {

    const router = useRouter()

    const { mutate: post, data: principal, isSuccess: isPostSuccess, isPending: isPostPending } = usePostQuery('principals');

    const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

    const { data, isLoading, error, isSuccess: isGetSuccess } = useGetIRI(iri ? iri : "");


    type FormSchema = z.infer<typeof principalFormSchema>;

    const form = useForm<FormSchema>({
        resolver: zodResolver(principalFormSchema),
        defaultValues: {
            name: "",
            furtherInformations: "",
            isActive: true,
            category: "",
            phone: "",
            fax: "",
            mobile: "",
            email: "",
            npa: "",
            city: "Genève",
            canton: "GENEVE",
            address: "",
            additionalAddress: "",
            rcc: "",
            gln: ""
        },
    });

    const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
        if (iri) patch({ ...values, iri })
        else post(values)
    };

    useEffect(() => {
        if (isPostSuccess || isPatchSuccess)
            if (submitAction) submitAction(principal)
            else router.back()
    }, [isPostSuccess, isPatchSuccess, router]);

    useEffect(() => {
        if (iri && isGetSuccess) {
            form.reset(data)
        }
    }, [iri, isGetSuccess]);

    if (isLoading) return <Spinner />

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
                <FormInput
                    form={form}
                    name="name"
                    title="Mandant"
                    placeholder="Nom complet"
                    required
                />
                <FormSelect
                    form={form}
                    name="category"
                    title="Catégorie"
                    placeholder="Choisir une catégorie"
                    items={enumToSelectItems(PrincipalCategories)}
                    required
                />
                <FormInput
                    form={form}
                    name="furtherInformations"
                    title="Informations complémentaires"
                    placeholder="Informations complémentaires"
                />
                <FormSelect
                    form={form}
                    name="canton"
                    title="Canton"
                    placeholder="Choisir un canton"
                    items={enumToSelectItems(Cantons)}
                    required
                />
                <FormInput
                    form={form}
                    name="address"
                    title="Adresse"
                    placeholder="Adresse principale"
                    required
                />
                <FormInput
                    form={form}
                    name="additionalAddress"
                    title="Complément d'adresse"
                    placeholder="Complément d'adresse"
                />
                <FormInput
                    form={form}
                    name="npa"
                    title="NPA"
                    placeholder="Code postal"
                    required
                />
                <FormInput
                    form={form}
                    name="city"
                    title="Ville"
                    placeholder="Ville"
                    required
                />
                <FormInput
                    form={form}
                    name="phone"
                    title="Téléphone"
                    placeholder="Numéro de téléphone"
                />
                <FormInput
                    form={form}
                    name="email"
                    title="Email"
                    placeholder="Adresse email"
                    type="email"
                />
                <FormInput
                    form={form}
                    name="rcc"
                    title="RCC"
                    placeholder="Numéro RCC"
                    required
                />
                <FormInput
                    form={form}
                    name="gln"
                    title="GLN"
                    placeholder="Numéro GLN"
                    required
                />
                <Button type="button" variant="cancel"
                    disabled={isPostPending || isPatchPending}
                    onClick={() => cancelAction ? cancelAction() : router.back()}
                >
                    Annuler
                </Button>
                <Button type="submit" className="ml-3"
                    disabled={isPostPending || isPatchPending}
                    loading={isPostPending || isPatchPending}
                >
                    {iri ? "Modifier" : "Enregistrer"}
                </Button>
            </form>
        </Form >
    );
}


export default PrincipalForm;