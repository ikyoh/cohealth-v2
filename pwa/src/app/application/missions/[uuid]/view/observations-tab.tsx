"use client";

import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteIRI, useGetCollection, useGetIRI, usePostQuery } from "@/hooks/useQuery";
import dayjs from "@/utils/dayjs.config";
import { ObservationInterface, ObservationType } from "@/utils/types.utils";
import { observationFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ApexOptions } from "apexcharts";
import { Activity, Droplets, FileText, Scale, Thermometer, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const observationLabels: Record<ObservationType, string> = {
  [ObservationType.TEXT]: "Observation",
  [ObservationType.WEIGHT]: "Poids",
  [ObservationType.BLOOD_PRESSURE]: "Tension",
  [ObservationType.BLOOD_GLUCOSE]: "Glycémie",
  [ObservationType.TEMPERATURE]: "Température",
};

const observationUnits: Partial<Record<ObservationType, string>> = {
  [ObservationType.WEIGHT]: "kg",
  [ObservationType.BLOOD_PRESSURE]: "mmHg",
  [ObservationType.BLOOD_GLUCOSE]: "mmol/L",
  [ObservationType.TEMPERATURE]: "°C",
};

const typeItems = Object.values(ObservationType).map((value) => ({
  value,
  label: observationLabels[value],
}));

const getIri = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "@id" in value) {
    return String(value["@id"]);
  }
  return "";
};

const getCollectionMembers = (data: any): ObservationInterface[] =>
  data?.member ?? data?.["hydra:member"] ?? [];

const chartOptions = (unit: string): ApexOptions => ({
  chart: {
    animations: { enabled: true },
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#2563eb", "#dc2626"],
  dataLabels: { enabled: false },
  grid: { borderColor: "hsl(var(--border))" },
  legend: { position: "top" },
  markers: { size: 4 },
  stroke: { curve: "smooth", width: 3 },
  tooltip: {
    x: { format: "dd/MM/yyyy HH:mm" },
    y: { formatter: (value) => `${value} ${unit}` },
  },
  xaxis: {
    type: "datetime",
    labels: { datetimeUTC: false },
  },
  yaxis: {
    decimalsInFloat: 1,
    labels: { formatter: (value) => `${value}` },
  },
});

type MetricChartProps = {
  title: string;
  unit: string;
  icon: React.ReactNode;
  series: Array<{
    name: string;
    data: Array<{ x: number; y: number }>;
  }>;
};

function MetricChart({ title, unit, icon, series }: MetricChartProps) {
  const hasData = series.some((item) => item.data.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <Chart options={chartOptions(unit)} series={series} type="line" height={280} />
        ) : (
          <p className="py-24 text-center text-sm text-muted-foreground">
            Aucune donnée
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ObservationsTab({
  missionIri,
  canManage = false,
}: {
  missionIri: string;
  canManage?: boolean;
}) {
  const filters = `mission=${encodeURIComponent(missionIri)}&pagination=false&order[observedAt]=asc`;
  const { data, isLoading } = useGetCollection({ entity: "observations", filters });
  const { data: currentUser } = useGetIRI("/current_user");
  const { mutateAsync: createObservation, isPending } = usePostQuery("observations");
  const { mutate: deleteObservation, isPending: isDeleting } = useDeleteIRI();
  const observations = getCollectionMembers(data);

  type FormSchema = z.infer<typeof observationFormSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(observationFormSchema) as any,
    defaultValues: {
      type: ObservationType.WEIGHT,
      observedAt: dayjs().format("YYYY-MM-DDTHH:mm"),
      value: undefined,
      systolic: undefined,
      diastolic: undefined,
      content: "",
    },
  });

  const selectedType = form.watch("type") as ObservationType;

  const onSubmit: SubmitHandler<FormSchema> = async (values) => {
    const payload: Record<string, unknown> = {
      mission: missionIri,
      type: values.type,
      observedAt: new Date(values.observedAt).toISOString(),
    };

    if (values.type === ObservationType.TEXT) {
      payload.content = values.content?.trim();
    } else if (values.type === ObservationType.BLOOD_PRESSURE) {
      payload.systolic = values.systolic;
      payload.diastolic = values.diastolic;
    } else {
      payload.value = String(values.value);
    }

    await createObservation(payload);
    form.reset({
      type: values.type,
      observedAt: dayjs().format("YYYY-MM-DDTHH:mm"),
      value: undefined,
      systolic: undefined,
      diastolic: undefined,
      content: "",
    });
  };

  const series = useMemo(() => {
    const valuesFor = (type: ObservationType) =>
      observations
        .filter((observation) => observation.type === type && observation.value != null)
        .map((observation) => ({
          x: new Date(observation.observedAt).getTime(),
          y: Number(observation.value),
        }));

    const bloodPressure = observations.filter(
      (observation) => observation.type === ObservationType.BLOOD_PRESSURE,
    );

    return {
      weight: [{ name: "Poids", data: valuesFor(ObservationType.WEIGHT) }],
      glucose: [{ name: "Glycémie", data: valuesFor(ObservationType.BLOOD_GLUCOSE) }],
      temperature: [{ name: "Température", data: valuesFor(ObservationType.TEMPERATURE) }],
      bloodPressure: [
        {
          name: "Systolique",
          data: bloodPressure.map((observation) => ({
            x: new Date(observation.observedAt).getTime(),
            y: Number(observation.systolic),
          })),
        },
        {
          name: "Diastolique",
          data: bloodPressure.map((observation) => ({
            x: new Date(observation.observedAt).getTime(),
            y: Number(observation.diastolic),
          })),
        },
      ],
    };
  }, [observations]);

  if (isLoading) {
    return <div className="flex min-h-64 items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle observation</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <FormSelect
                form={form}
                name="type"
                title="Type"
                items={typeItems}
                required
              />
              <FormInput
                form={form}
                name="observedAt"
                title="Date et heure"
                type="datetime-local"
                required
              />

              {selectedType === ObservationType.BLOOD_PRESSURE ? (
                <>
                  <FormInput form={form} name="systolic" title="Systolique (mmHg)" type="number" min="1" required />
                  <FormInput form={form} name="diastolic" title="Diastolique (mmHg)" type="number" min="1" required />
                </>
              ) : selectedType === ObservationType.TEXT ? (
                <div className="md:col-span-2">
                  <FormTextarea
                    form={form}
                    name="content"
                    title="Observation"
                    placeholder="Saisir l’observation"
                    required
                  />
                </div>
              ) : (
                <FormInput
                  form={form}
                  name="value"
                  title={`${observationLabels[selectedType]} (${observationUnits[selectedType]})`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                />
              )}

              <div className="flex items-end">
                <Button type="submit" loading={isPending} disabled={isPending} className="w-full md:w-auto">
                  Enregistrer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <MetricChart title="Poids" unit="kg" icon={<Scale />} series={series.weight} />
        <MetricChart title="Tension" unit="mmHg" icon={<Activity />} series={series.bloodPressure} />
        <MetricChart title="Glycémie" unit="mmol/L" icon={<Droplets />} series={series.glucose} />
        <MetricChart title="Température" unit="°C" icon={<Thermometer />} series={series.temperature} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText />
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          {observations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune observation enregistrée.</p>
          ) : (
            <div className="divide-y">
              {[...observations].reverse().map((observation) => {
                const canDelete = canManage || getIri(observation.owner) === currentUser?.iri;
                const value = observation.type === ObservationType.TEXT
                  ? observation.content
                  : observation.type === ObservationType.BLOOD_PRESSURE
                    ? `${observation.systolic}/${observation.diastolic} mmHg`
                    : `${observation.value} ${observationUnits[observation.type]}`;

                return (
                  <div key={observation.uuid} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium">{observationLabels[observation.type]}</p>
                      <p className="whitespace-pre-wrap">{value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dayjs(observation.observedAt).format("DD/MM/YYYY à HH:mm")}
                        {" · "}
                        {observation.authorName || "Utilisateur inconnu"}
                      </p>
                    </div>
                    {canDelete && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => deleteObservation(observation["@id"])}
                        aria-label="Supprimer l’observation"
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
