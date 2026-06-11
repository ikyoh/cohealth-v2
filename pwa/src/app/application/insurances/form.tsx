"use client";

import FormInput from "@/components/form/form-input";
import FormLoader from "@/components/form/form-loader";
import FormSelect from "@/components/form/form-select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { InsuranceCategory } from "@/utils/types.utils";
import { insuranceFormSchema } from "@/utils/zodSchemas";
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

const InsuranceForm = ({ iri, cancelAction, submitAction }: Props) => {

    const router = useRouter()

    const { mutate: post, isSuccess: isPostSuccess, isPending: isPostPending, data: insurance } = usePostQuery('insurances');

    const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

    const { data, isLoading, error, isSuccess: isGetSuccess } = useGetIRI(iri ? iri : "");

    type FormSchema = z.infer<typeof insuranceFormSchema>;

    const form = useForm<FormSchema>({
        resolver: zodResolver(insuranceFormSchema),
        defaultValues: {
            name: "",
            organization: "",
            category: undefined,
            address: "",
            additionalAddress: "",
            npa: "",
            city: "",
            phone: "",
            email: "",
            website: "",
            gln: "",
        },
    });

    const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
        if (iri) patch({ ...values, iri })
        else post(values)
    };


    useEffect(() => {
        if (isPostSuccess || isPatchSuccess) {
            if (submitAction) submitAction(insurance)
            else router.back()
        }
    }, [isPostSuccess, isPatchSuccess, router]);

    useEffect(() => {
        if (iri && isGetSuccess) {
            form.reset(data)
        }
    }, [iri, isGetSuccess]);

    if (isLoading) return <FormLoader length={11} />;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
                <FormInput
                    form={form}
                    name="name"
                    title="Assurance"
                    placeholder="Nom de l'assurance"
                    required
                />
                <FormInput
                    form={form}
                    name="organization"
                    title="Groupe"
                    placeholder="Nom du groupe"
                />
                <FormSelect
                    form={form}
                    name="category"
                    title="Catégorie"
                    placeholder="Choisir une catégorie"
                    items={Object.values(InsuranceCategory).map((cat) => ({ label: cat, value: cat }))}
                    required
                />
                <FormInput
                    form={form}
                    name="address"
                    title="Adresse"
                    placeholder="Adresse principale"
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
                />
                <FormInput
                    form={form}
                    name="city"
                    title="Ville"
                    placeholder="Ville"
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
                    name="website"
                    title="Site web"
                    placeholder="URL du site web"
                />
                <FormInput
                    form={form}
                    name="gln"
                    title="GLN"
                    placeholder="Numéro GLN"
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


export default InsuranceForm;