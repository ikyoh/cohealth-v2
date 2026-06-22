"use client";

import FormDateTimePicker from "@/components/form/form-datetimepicker";
import FormInput from "@/components/form/form-input";
import FormSwitch from "@/components/form/form-switch";
import FormTextarea from "@/components/form/form-textarea";
import { BadgeStatus } from "@/components/badge-status";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCombinedQueries, useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { eventFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useFieldArray } from "react-hook-form";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

type Cooperator = {
    "@id": string;
    uuid?: string;
    firstname?: string;
    lastname?: string;
};

const getIri = (resource: string | { "@id"?: string } | undefined | null) => (
    typeof resource === "string" ? resource : resource?.["@id"] || ""
);

const EventForm = () => {
    const params = useParams()
    const iri = params.uuid ? `/events/${params.uuid}` : ""
    const router = useRouter()

    const { mutate: post, isSuccess: isPostSuccess, isPending: isPostPending } = usePostQuery('events');

    const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

    const { data, isLoading, error, isSuccess: isGetSuccess, isError } = useGetIRI(iri);
    const missionIri = getIri(data?.mission);
    const shouldFetchMission = Boolean(missionIri) && typeof data?.mission === "string";
    const { data: fetchedMission, isLoading: isLoadingMission } = useGetIRI(shouldFetchMission ? missionIri : "");
    const mission = typeof data?.mission === "object" ? data.mission : fetchedMission;
    const missionOwnerIris = useMemo(
        () => (mission?.owners ?? [])
            .filter((owner: string | Cooperator) => typeof owner === "string"),
        [mission?.owners],
    );
    const embeddedCooperators = useMemo(
        () => (mission?.owners ?? [])
            .filter((owner: string | Cooperator): owner is Cooperator => typeof owner !== "string"),
        [mission?.owners],
    );
    const {
        data: fetchedCooperators = [],
        isLoading: isLoadingCooperators,
    } = useCombinedQueries(missionOwnerIris);
    const cooperators = useMemo<Cooperator[]>(
        () => [...embeddedCooperators, ...fetchedCooperators]
            .filter((cooperator): cooperator is Cooperator => Boolean(cooperator?.["@id"])),
        [embeddedCooperators, fetchedCooperators],
    );

    type FormSchema = z.infer<typeof eventFormSchema>;

    const form = useForm<FormSchema>({
        resolver: zodResolver(eventFormSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            beginDate: undefined,
            endDate: undefined,
            isAllday: false,
            services: [],
        },
    });
    const { fields: serviceFields } = useFieldArray({
        control: form.control,
        name: "services",
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

    if (isLoading || isError || isLoadingMission || isLoadingCooperators) return <Spinner />

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
                {serviceFields.length > 0 && (
                    <div className="space-y-4 rounded-md border p-3">
                        <div>
                            <FormLabel>Collaborateur</FormLabel>
                            <p className="text-muted-foreground text-sm">
                                Attribution des services de l’événement.
                            </p>
                        </div>
                        {serviceFields.map((service: any, index) => (
                            <div key={service.id} className="space-y-2 rounded-md bg-muted p-2">
                                <div className="flex items-center gap-2">
                                    <BadgeStatus status={service.category} label={service.category} />
                                    <div className="grow text-sm">{service.name}</div>
                                </div>
                                <CooperatorSelect
                                    form={form}
                                    name={`services.${index}.cooperator`}
                                    cooperators={cooperators}
                                />
                            </div>
                        ))}
                        {cooperators.length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                Aucun collaborateur n’est associé à la mission.
                            </p>
                        )}
                    </div>
                )}
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

const CooperatorSelect = ({
    form,
    name,
    cooperators,
}: {
    form: any;
    name: string;
    cooperators: Cooperator[];
}) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <Select
                    value={getIri(field.value) || "unassigned"}
                    onValueChange={(iri) => {
                        field.onChange(
                            iri === "unassigned"
                                ? undefined
                                : cooperators.find((cooperator) => cooperator["@id"] === iri)
                        );
                    }}
                    disabled={cooperators.length === 0}
                >
                    <FormControl>
                        <SelectTrigger className="w-full bg-background">
                            <SelectValue placeholder="Non attribué" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="unassigned">Non attribué</SelectItem>
                        {cooperators.map((cooperator) => (
                            <SelectItem key={cooperator["@id"]} value={cooperator["@id"]}>
                                {[cooperator.firstname, cooperator.lastname].filter(Boolean).join(" ") || cooperator["@id"]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )}
    />
);
