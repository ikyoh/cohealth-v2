"use client";

import FormDateTimePicker from "@/components/form/form-datetimepicker";
import FormInput from "@/components/form/form-input";
import FormSwitch from "@/components/form/form-switch";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { eventFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const EventForm = () => {
    const params = useParams()
    const iri = params.uuid ? `/events/${params.uuid}` : ""
    const router = useRouter()

    const { mutate: post, isSuccess: isPostSuccess, isPending: isPostPending } = usePostQuery('events');

    const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

    const { data, isLoading, error, isSuccess: isGetSuccess, isError } = useGetIRI(iri);

    type FormSchema = z.infer<typeof eventFormSchema>;

    const form = useForm<FormSchema>({
        resolver: zodResolver(eventFormSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            beginDate: undefined,
            endDate: undefined,
            isAllday: false,
        },
    });

    console.log('form.errors', form.formState.errors)

    const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
        console.log('submit', values)
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

    if (isLoading || isError) return <Spinner />

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                <FormInput
                    form={form}
                    name="title"
                    title="Titre"
                />
                <FormDateTimePicker
                    form={form}
                    name="beginDate"
                    title="Début"
                    description="Date et heure de début de l'événement"
                    required
                />
                <FormDateTimePicker
                    form={form}
                    name="endDate"
                    title="Fin"
                    description="Date et heure de fin de l'événement"
                    required
                />
                <FormTextarea
                    form={form}
                    name="description"
                    title="Description"
                    placeholder="Description de l'événement"
                />
                <FormSwitch
                    form={form}
                    name="isAllday"
                    title="Journée entière"
                    description="Activer ou désactiver la journée entière"
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


export default EventForm;