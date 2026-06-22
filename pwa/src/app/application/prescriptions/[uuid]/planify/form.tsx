"use client";

import { BadgeStatus } from "@/components/badge-status";
import FormCheckbox from "@/components/form/form-checkbox";
import FormDateTimePicker from "@/components/form/form-datetimepicker";
import FormTimePicker from "@/components/form/form-timepicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Combine, Ungroup } from "lucide-react";
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

const DEFAULT_EVENT_HOUR = 8;

const withDefaultEventTime = (date: string | Date) => (
  dayjs(date).hour(DEFAULT_EVENT_HOUR).minute(0).second(0).millisecond(0).toDate()
);

const PlanifyForm = () => {
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

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "events"
  });
  const watchedEvents = form.watch("events") || [];

  const getGroupCandidates = (eventIndex: number) => {
    const event = watchedEvents[eventIndex];

    if (!event || event.services?.length !== 1) {
      return [];
    }

    return watchedEvents
      .map((candidate: any, index: number) => ({ candidate, index }))
      .filter(({ candidate, index }: any) => (
        index !== eventIndex
        && candidate?.periodicity === event.periodicity
        && candidate?.frequency === event.frequency
      ));
  };

  const getGroupLabel = (event: any, index: number) => {
    const serviceNames = event.services
      ?.map((service: any) => service.name)
      .filter(Boolean)
      .join(", ");

    return `Intervention ${index + 1}${serviceNames ? ` - ${serviceNames}` : ""}`;
  };

  const handleUngroupService = (eventIndex: number, serviceIndex: number) => {
    const events = form.getValues("events") || [];
    const event = events[eventIndex];
    const service = event?.services?.[serviceIndex];

    if (!event || !service || event.services.length <= 1) {
      return;
    }

    const remainingServices = event.services.filter((_: any, index: number) => index !== serviceIndex);
    const remainingDuration = remainingServices.reduce((sum: number, item: any) => sum + Number(item.duration || 0), 0);

    const updatedEvent = {
      ...event,
      duration: remainingDuration,
      services: remainingServices,
    };

    const ungroupedEvent = {
      ...event,
      duration: Number(service.duration || 0),
      services: [service],
      days: event.days ? [...event.days] : [],
    };

    replace([
      ...events.slice(0, eventIndex),
      updatedEvent,
      ungroupedEvent,
      ...events.slice(eventIndex + 1),
    ]);
  };

  const handleGroupService = (sourceIndex: number, targetIndex: number) => {
    const events = form.getValues("events") || [];
    const sourceEvent = events[sourceIndex];
    const targetEvent = events[targetIndex];
    const service = sourceEvent?.services?.[0];

    if (
      !sourceEvent
      || !targetEvent
      || !service
      || sourceEvent.services.length !== 1
      || sourceIndex === targetIndex
      || sourceEvent.periodicity !== targetEvent.periodicity
      || sourceEvent.frequency !== targetEvent.frequency
    ) {
      return;
    }

    replace(events.flatMap((event: any, index: number) => {
      if (index === sourceIndex) {
        return [];
      }

      if (index === targetIndex) {
        const services = [...event.services, service];

        return [{
          ...event,
          duration: services.reduce((sum: number, item: any) => sum + Number(item.duration || 0), 0),
          services,
        }];
      }

      return [event];
    }));
  };

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

      const defaultBeginDate = withDefaultEventTime(mission.beginDate);
      const defaultEndDate = withDefaultEventTime(mission.endDate);

      const eventsFromGroupedServices = groupedServicesByFrequencyAndPeriodicity.map((group: any) => (

        group.periodicity === 'daily' ?

          Array.from(Array(group.frequency)).map((e, i) =>
          ({
            title: patient.lastname,
            beginDate: defaultBeginDate,
            endDate: defaultEndDate,
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
            beginDate: defaultBeginDate,
            endDate: defaultEndDate,
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

            {fields?.map((field, index) => {
              const event = watchedEvents[index] || field;
              const eventServices = event.services || [];
              const groupCandidates = getGroupCandidates(index);

              return (
                <div key={field.id} className='flex flex-col gap-4 rounded-md border p-2'>
                  <div className="flex items-center gap-2">
                    <div className="grow">
                      <EventsTitle periodicity={event.periodicity} frequency={event.frequency} />
                    </div>
                    {eventServices.length === 1 && groupCandidates.length === 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground"
                        disabled={isPosting || isLoading}
                        aria-label={`Regrouper ${eventServices[0].name}`}
                        title={`Regrouper avec ${getGroupLabel(groupCandidates[0].candidate, groupCandidates[0].index)}`}
                        onClick={() => handleGroupService(index, groupCandidates[0].index)}
                      >
                        <Combine className="size-4" />
                        Regrouper
                      </Button>
                    )}
                    {eventServices.length === 1 && groupCandidates.length > 1 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground"
                            disabled={isPosting || isLoading}
                            aria-label={`Regrouper ${eventServices[0].name}`}
                            title={`Regrouper ${eventServices[0].name}`}
                          >
                            <Combine className="size-4" />
                            Regrouper
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="max-w-80">
                          {groupCandidates.map(({ candidate, index: targetIndex }: any) => (
                            <DropdownMenuItem
                              key={targetIndex}
                              onClick={() => handleGroupService(index, targetIndex)}
                            >
                              {getGroupLabel(candidate, targetIndex)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                {eventServices.map((service: any, serviceIndex: number) =>
                  <div key={`${service.uuid || service.id}_${serviceIndex}`} className="">
                    <div className="flex items-center gap-2 pb-2">
                      <div>
                        <BadgeStatus status={service.category} label={service.category} />
                      </div>
                      <div className='grow text-sm/3'>
                        {service.name}
                      </div>
                      {eventServices.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground"
                          disabled={isPosting || isLoading}
                          aria-label={`Dégrouper ${service.name}`}
                          title={`Dégrouper ${service.name}`}
                          onClick={() => handleUngroupService(index, serviceIndex)}
                        >
                          <Ungroup className="size-4" />
                          Dégrouper
                        </Button>
                      )}
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
                  {event.periodicity === 'period' && (
                    <FormDateTimePicker
                      form={form}
                      name={`events.${index}.beginDate`}
                      title="Date"
                      placeholder="Date"
                    />
                  )}
                  {event.periodicity === 'daily' && (
                    <FormTimePicker
                      form={form}
                      name={`events.${index}.beginDate`}
                      title="Heure d'intervention"
                      placeholder="Heure"
                    />)}

                  {event.periodicity === 'weekly' && (
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
              );
            })}
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


export default PlanifyForm;

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
