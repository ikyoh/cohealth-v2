"use client";

import { BadgeStatus } from "@/components/badge-status";
import FormDatePicker from "@/components/form/form-datepicker";
import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useGetCollection, useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { prescriptionFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";


const PrescriptionForm = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const missionUUID = searchParams.get('mission')
  const iri = params.uuid ? `/prescriptions/${params.uuid}` : ""
  const router = useRouter()

  const { mutate: post, isSuccess: isPostSuccess, isPending: isPostPending } = usePostQuery('prescriptions');

  const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

  const { data, isLoading, error, isSuccess: isGetSuccess, isError } = useGetIRI(iri);
  const { data: mission, isLoading: isLoadingMission, error: errorMission, isSuccess: isGetSuccessMission, isError: isErrorMission } = useGetIRI(`missions/${missionUUID}`);
  const { data: services, isLoading: isLoadingServices, error: errorServices, isSuccess: isGetSuccessServices, isError: isErrorServices } = useGetCollection({ entity: 'services', searchParams: 'pagination=false&itemsPerPage=500' });

  type FormSchema = z.infer<typeof prescriptionFormSchema>;

  console.log('mission', mission)

  const form = useForm<FormSchema>({
    resolver: zodResolver(prescriptionFormSchema) as any,
    defaultValues: {
      content: {
        type: "prescription",
        case: "disease",
        diagnosticNurse: "",
        diagnosticDoctor: "",
        disability: "no",
        services: [],
      },
      status: "BROUILLON",
      category: "OPAS",
    },
  });

  const { fields, prepend, remove } = useFieldArray({
    control: form.control,
    name: "content.services"
  });

  //console.log('fields', fields)

  const handleAddService = (service: any) => {
    prepend({ ...service, "periodicity": "period", "duration": service.duration, "frequency": 1 })
  }

  console.log('form.errors', form.formState.errors)
  console.log('form.values', form.getValues())

  const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
    console.log('values', values)
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

  useEffect(() => {
    if (missionUUID && mission && isGetSuccessMission) {
      form.reset({
        ...form.getValues(),
        mission: mission["@id"],
        patient: mission.patient,
        beginDate: mission.beginDate,
        endDate: mission.endDate,
      })
    }
  }, [mission, isGetSuccessMission]);


  const [category, setCategory] = useState<string>("Evaluation - Conseil - Coordination");
  const [serviceSearch, setServiceSearch] = useState("");

  const categories = services?.["member"]?.reduce((acc: string[], service: any) => {
    if (service.family && !acc.includes(service.family)) {
      acc.push(service.family);
    }
    return acc;
  }, [])?.sort() || [];

  console.log('categories', categories)

  const normalizedServiceSearch = serviceSearch.trim().toLocaleLowerCase("fr");
  const filteredServices = services?.member?.filter((service: any) => {
    const matchesCategory = category === "" || service.family === category;
    const matchesSearch = normalizedServiceSearch === ""
      || service.name?.toLocaleLowerCase("fr").includes(normalizedServiceSearch);

    return matchesCategory && matchesSearch;
  }) || [];

  if (isLoading || isLoadingServices || isError || isErrorServices || isLoadingMission) return <Spinner />

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8 [&>*]:break-inside-avoid">
          <FormDatePicker
            form={form}
            name="beginDate"
            title="Début de la prescription"
            required
          />
          <FormDatePicker
            form={form}
            name="endDate"
            title="Fin de la prescription"
            required
          />
          <FormSelect
            form={form}
            name="content.type"
            title="Prescription médicale"
            placeholder="Choisir"
            items={[
              { label: "Prescription initiale", value: "prescription" },
              { label: "Réévaluation", value: "revaluation" },
              { label: "Complément d'OPAS", value: "complementary" },
            ]}
            required
          />
          <FormSelect
            form={form}
            name="content.case"
            title="Cas"
            placeholder="Choisir"
            items={[
              { label: "Maladie", value: "disease" },
              { label: "Accident", value: "accident" },
              { label: "Invalidité", value: "invalidity" },
            ]}
            required
          />
          <FormSelect
            form={form}
            name="content.disability"
            title="Allocation pour impotent"
            placeholder="Choisir"
            items={[
              { label: "Non", value: "no" },
              { label: "Oui", value: "yes" },
            ]}
            required
          />
          <FormTextarea
            form={form}
            name="content.diagnosticNurse"
            title="Diagnostic infirmier"
            placeholder="Diagnostic"
            required
          />
          <FormTextarea
            form={form}
            name="content.diagnosticDoctor"
            title="Diagnostic médecin"
            placeholder="Diagnostic"
            required
          />
        </div>

        <FormItem>
          <FormLabel>Services prescrits</FormLabel>
          <div className="flex w-full gap-4 border-input placeholder:text-muted-foreground dark:bg-input/30 rounded-md border bg-transparent p-3 text-base shadow-xs outline-none md:text-sm">
            <div className="basis-1/2 space-y-4">
              <Input
                type="search"
                value={serviceSearch}
                onChange={(event) => setServiceSearch(event.target.value)}
                placeholder="Rechercher un service par nom"
                aria-label="Rechercher un service par nom"
              />
              <div className="flex gap-2 flex-wrap">
                {categories?.map((cat: string) => (
                  <Button
                    type="button"
                    key={cat}
                    className="basis-auto"
                    variant={cat === category ? "cancel" : "primary"}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
                <Button
                  type="button"
                  className="basis-auto"
                  variant={category === "" ? "cancel" : "primary"}
                  onClick={() => setCategory("")}
                >
                  Tous
                </Button>
              </div>

              <div className="font-semibold text-sm mb-2">{category === "" ? "Tous les services" : category}</div>
              {filteredServices.map((service: any) => (
                <div key={service.id} className="mb-4"
                  onClick={() => handleAddService(service)}>
                  <div className="flex gap-2 cursor-pointer">
                    <BadgeStatus status={service.category} label={service.category} />
                    <span>-</span>{service.name}
                  </div>
                </div>)
              )}
              {filteredServices.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Aucun service ne correspond à la recherche.
                </p>
              )}

            </div>
            <div className="basis-1/2 space-y-4">
              {fields.map((field, index) =>
                <div key={field.id} className='flex flex-col gap-2 bg-muted p-2 rounded-md'>
                  <div className='flex gap-2 items-start'>
                    <div >
                      <BadgeStatus status={field.category} label={field.category} />
                    </div>
                    <span>-</span>
                    <div className='grow'>
                      {field.name}
                    </div>
                    <div className="cursor-pointer" onClick={() => remove(index)}><X size={16} />
                    </div>
                  </div>
                  <div className='grid grid-cols-3 gap-2 text-sm'>
                    <FormInput
                      form={form}
                      name={`content.services.${index}.duration`}
                      title="Durée (minutes)"
                      placeholder="Durée"
                      type="number"
                      required
                      min={0}
                      className="bg-background"
                    />
                    <FormInput
                      form={form}
                      name={`content.services.${index}.frequency`}
                      title="Fréquence"
                      placeholder="Fréquence"
                      type="number"
                      required
                      min={1}
                      className="bg-background"
                    />
                    <FormSelect
                      form={form}
                      name={`content.services.${index}.periodicity`}
                      title="Par"
                      placeholder="Choisir"
                      items={[
                        { label: "période", value: "period" },
                        { label: "jour", value: "daily" },
                        { label: "semaine", value: "weekly" },
                        { label: "mois", value: "monthly" },
                      ]}
                      required
                      className="bg-background w-full"
                    />

                  </div>
                </div>
              )}
            </div>

          </div>
        </FormItem>
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


export default PrescriptionForm;
