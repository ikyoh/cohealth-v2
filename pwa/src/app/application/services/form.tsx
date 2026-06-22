"use client";

import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { legalCares, servicesFamily } from "@/utils/arrays";
import { serviceFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";


type Props = {
    iri?: string;
}
const CategoryForm = ({ iri }: Props) => {

    const router = useRouter()

    const { mutate: post, isSuccess: isPostSuccess, isPending: isPostPending } = usePostQuery('services');

    const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

    const { data, isLoading, error, isSuccess: isGetSuccess } = useGetIRI(iri ? iri : "");

    console.log('data', data)

    const categoryItems = [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" }
    ]

    type FormSchema = z.infer<typeof serviceFormSchema>;

    const form = useForm<FormSchema>({
        resolver: zodResolver(serviceFormSchema) as any,
        defaultValues: {
            name: "",
            family: "",
            category: "",
            opas: "",
            duration: 0,
            actNumber: 10000,
        },
    });

    const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
        if (iri) patch({ ...values, iri })
        else post(values)
    };


    useEffect(() => {
        if (isPostSuccess || isPatchSuccess) router.back()
    }, [isPostSuccess, isPatchSuccess, router]);

    useEffect(() => {
        if (iri && isGetSuccess) {
            form.reset(data)
        }
    }, [iri, isGetSuccess]);

    if (isLoading) return <Spinner />

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8 max-w-md" >
                <FormTextarea
                    form={form}
                    name="name"
                    title="Intitulé"
                    placeholder=""
                    required
                />
                <FormSelect
                    form={form}
                    name="family"
                    title="Famille"
                    placeholder="Choisir une famille"
                    items={servicesFamily.map(item => ({ label: item, value: item }))}
                    required
                />
                <FormSelect
                    form={form}
                    name="category"
                    title="Catégorie"
                    placeholder="Choisir une catégorie"
                    items={categoryItems}
                />
                <FormSelect
                    form={form}
                    name="opas"
                    title="Article 7 OPAS"
                    placeholder="Choisir un article"
                    items={legalCares.map(item => ({ label: item, value: item }))}
                    required
                />
                <FormInput
                    form={form}
                    type="number"
                    name="actNumber"
                    title="Numéro d'acte"
                    placeholder=""
                    required
                />
                <FormInput
                    form={form}
                    type="number"
                    name="duration"
                    title="Durée en minutes"
                    placeholder=""
                    required
                />
                <FormTextarea
                    form={form}
                    name="description"
                    title="Détail de la prestation"
                    placeholder=""
                />
                <Button type="button" variant="cancel"
                    disabled={isPostPending || isPatchPending}
                    onClick={() => router.back()}
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


export default CategoryForm;
