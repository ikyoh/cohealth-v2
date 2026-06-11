"use client";

import { BadgeStatus } from "@/components/badge-status";
import FormCheckbox from "@/components/form/form-checkbox";
import FormDateTimePicker from "@/components/form/form-datetimepicker";
import FormTimePicker from "@/components/form/form-timepicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
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
import usePostQueries from "@/hooks/usePostQueries";
import { useCombinedQueries, useGetIRI } from "@/hooks/useQuery";
import dayjs from "@/utils/dayjs.config";
import { eventFormSchemaArray } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

type Cooperator = {
  "@id": string;
  uuid?: string;
  firstname?: string;
  lastname?: string;
};

const PatientForm = () => {
  const params = useParams()
  const iri = params.uuid ? `/prescriptions/${params.uuid}` : ""
  const router = useRouter()



  const { data, isLoading, error, isSuccess: isGetSuccess, isError } = useGetIRI(iri);
  const { data: mission, isLoading: isLoadingMission, error: errorMission, isSuccess: isGetSuccessMission, isError: isErrorMission } = useGetIRI(data && data.mission ? data.mission : null);
  const { data: patient, isLoading: isLoadingPatient, error: errorPatient, isSuccess: isGetSuccessPatient, isError: isErrorPatient } = useGetIRI(data && data.patient ? data.patient : null);
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

  const { isSuccess, isLoading: isPosting, setQueries } = usePostQueries('events');
  type FormSchema = z.infer<typeof eventFormSchemaArray>;


  const defaultValues = {
    events: [],
  }

  const form = useForm<FormSchema>({
    resolver: zodResolver(eventFormSchemaArray) as any,
    defaultValues: defaultValues,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "events"
  });

  const onSubmit: SubmitHandler<FormSchema> = (values: any) => {

    const { events } = values;
    const updatedEvents = events.map((event: any) => {

      if (event.periodicity === 'weekly' && event.days) {
        const dtstart = dayjs(event.beginDate).format('YYYYMMDDTHHmmss');
        const until = dayjs(event.endDate).format('YYYYMMDDTHHmmss');
        const byday = event.days.join(',');
        event.recurrenceRule = `DTSTART:${dtstart}\nRRULE:FREQ=WEEKLY;UNTIL=${until};BYDAY=${byday}`;
      }
      if (event.periodicity === 'daily') {
        const dtstart = dayjs(event.beginDate).format('YYYYMMDDTHHmmss');
        const until = dayjs(event.endDate).format('YYYYMMDDTHHmmss');
        event.recurrenceRule = `DTSTART:${dtstart}\nRRULE:FREQ=DAILY;UNTIL=${until}`;
      }
      if (event.periodicity === 'period') {
        event.endDate = dayjs(event.beginDate).add(event.duration, 'minute').toDate();
        event.recurrenceRule = null;
      }

      return event;
    })

    setQueries(updatedEvents);
  };

  useEffect(() => {
    if (isSuccess) {
      router.back()
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (iri && isGetSuccess && isGetSuccessMission && mission && isGetSuccessPatient && patient) {

      const groupedServicesByFrequencyAndPeriodicity = data.content.services.reduce((acc: any, service: any) => {

        if (service.periodicity === "period") {
          Array.from(Array(service.frequency)).map((e, i) =>
            acc.push({
              frequency: 1,
              periodicity: service.periodicity,
              services: [service]
            }))
        }

        else {
          const existingGroup = acc.find((g: any) => g.frequency === service.frequency && g.periodicity === service.periodicity);

          if (existingGroup) {
            existingGroup.services.push(service);
          } else {
            acc.push({
              frequency: service.frequency,
              periodicity: service.periodicity,
              services: [service]
            });
          }
        }

        return acc;
      }, []);

      const eventsFromGroupedServices = groupedServicesByFrequencyAndPeriodicity.map((group: any) => (

        group.periodicity === 'daily' ?

          Array.from(Array(group.frequency)).map((e, i) =>
          ({
            title: patient.lastname,
            beginDate: mission.beginDate,
            endDate: mission.endDate,
            duration: group.services.reduce((sum: number, s: any) => sum + s.duration, 0),
            periodicity: group.periodicity,
            frequency: group.frequency,
            isAllday: false,
            mission: mission['@id'],
            recurrenceRule: {},
            services: group.services,
            days: []
          }))
          :
          {
            title: patient.lastname,
            beginDate: mission.beginDate,
            endDate: mission.endDate,
            duration: group.services.reduce((sum: number, s: any) => sum + s.duration, 0),
            periodicity: group.periodicity,
            frequency: group.frequency,
            isAllday: false,
            mission: mission['@id'],
            recurrenceRule: {},
            services: group.services,
            days: []
          }
      )).flat();

      form.reset({ events: eventsFromGroupedServices || [] });// Set fetched data as default values
    }


  }, [iri, isGetSuccess, patient, isGetSuccessPatient, mission, isGetSuccessMission]);


  if (isLoading || isError || isLoadingMission || isLoadingCooperators) return <Spinner />

  if (data?.planned) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prescription déjà planifiée</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Cette prescription a déjà généré des interventions et ne peut pas être planifiée une seconde fois.
          </p>
          <Button type="button" variant="cancel" onClick={() => router.back()}>
            Retour
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <div className="w-full gap-4">

          <div className="overflow-y-auto space-y-5">

            {fields?.map((field, index) =>
              <div key={index} className='flex flex-col gap-4 rounded-md border p-2'>
                <EventsTitle periodicity={field.periodicity} frequency={field.frequency} />

                {field.services.map((service: any, serviceIndex: number) =>
                  <div key={`${index}_${serviceIndex}`} className="">
                    <div className="flex items-center gap-2 pb-2">
                      <div>
                        <BadgeStatus status={service.category} label={service.category} />
                      </div>
                      <div className='grow text-sm/3'>
                        {service.name}
                      </div>
                    </div>
                    <CooperatorSelect
                      form={form}
                      name={`events.${index}.services.${serviceIndex}.cooperator`}
                      cooperators={cooperators}
                    />
                  </div>
                )}
                {cooperators.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Aucun collaborateur n’est associé à cette mission.
                  </p>
                )}

                <div className='text-sm'>
                  {field.periodicity === 'period' && (
                    <FormDateTimePicker
                      form={form}
                      name={`events.${index}.beginDate`}
                      title="Date"
                      placeholder="Date"
                    />
                  )}
                  {field.periodicity === 'daily' && (
                    <FormTimePicker
                      form={form}
                      name={`events.${index}.beginDate`}
                      title="Heure d'intervention"
                      placeholder="Heure"
                    />)}

                  {field.periodicity === 'weekly' && (
                    <div className="space-y-4">
                      <FormTimePicker
                        form={form}
                        name={`events.${index}.beginDate`}
                        title="Heure d'intervention"
                        placeholder="Heure"
                      />
                      <FormCheckbox
                        form={form}
                        name={`events.${index}.days`}
                        title="Jours d'intervention"
                        items={[
                          { label: "Lundi", id: "MO" },
                          { label: "Mardi", id: "TU" },
                          { label: "Mercredi", id: "WE" },
                          { label: "Jeudi", id: "TH" },
                          { label: "Vendredi", id: "FR" },
                          { label: "Samedi", id: "SA" },
                          { label: "Dimanche", id: "SU" },
                        ]}
                      />
                    </div>

                  )}

                </div>
              </div>
            )}
          </div>

        </div>
        <Button type="button" variant="cancel"
          disabled={isPosting || isLoading}
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <Button type="submit" className="ml-3"
          disabled={isPosting || isLoading}
          loading={isPosting || isLoading}
        >
          Enregistrer
        </Button>
      </form>
    </Form >
  );
}


export default PatientForm;

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
        <FormLabel>Collaborateur</FormLabel>
        <Select
          value={field.value?.["@id"]}
          onValueChange={(iri) => {
            field.onChange(cooperators.find((cooperator) => cooperator["@id"] === iri));
          }}
          disabled={cooperators.length === 0}
        >
          <FormControl>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Non attribué" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
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

const EventsTitle = ({ periodicity, frequency }: { periodicity: string, frequency: number }) => {

  return <div className="font-bold text-sm">
    {"Intervention" + (periodicity === 'period' ? ` unique` : periodicity === 'daily' ? ` quotidienne` : periodicity === 'weekly' ? (frequency > 1 ? `s hebdomadaires (${frequency} jours)` : ` hebdomadaire`) : "")}
  </div>

};
