"use client";

import InsuranceForm from "@/app/application/insurances/form";
import PatientForm from "@/app/application/patients/form";
import FormDatePicker from "@/components/form/form-datepicker";
import FormTextarea from "@/components/form/form-textarea";
import SearchMultiSelect from "@/components/form/search-multiselect";
import SearchSelect from "@/components/form/search-select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { cn } from "@/utils/utils";
import { missionFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useQueryClient
} from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import PrincipalForm from "../principals/form";

const getIri = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "@id" in value) {
    return String(value["@id"]);
  }

  return "";
}

const uniqueIris = (values: unknown[] = []): string[] => {
  return Array.from(new Set(values.map(getIri).filter(Boolean)));
}

const MissionForm = () => {

  const params = useParams()
  const iri = params.uuid ? `/missions/${params.uuid}` : ""
  const router = useRouter()
  const { mutateAsync: post, isPending: isPostPending } = usePostQuery('missions');
  const { mutateAsync: patchMission, isPending: isPatchPending } = usePatchQuery();
  const { mutateAsync: patchSharing, isPending: isSharingPending } = usePatchQuery();
  const { data, isLoading, error, isSuccess: isGetSuccess } = useGetIRI(iri);
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetIRI("/current_user");
  const isMissionOwner = !iri || getIri(data?.owner) === currentUser?.iri;

  console.log('data', data)

  // Fonction pour transformer les objets avec @id en leur valeur @id
  const transformDataForForm = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;

    const transformed = { ...obj };

    for (const key in transformed) {
      const value = transformed[key];

      // Si la valeur est un objet avec @id, remplacer par la valeur @id
      if (value && typeof value === 'object' && value['@id']) {
        transformed[key] = value['@id'];
      }
      // Si c'est un tableau, appliquer la transformation récursivement
      else if (Array.isArray(value)) {
        transformed[key] = value.map(item => transformDataForForm(item));
      }
      // Si c'est un objet, appliquer la transformation récursivement
      else if (value && typeof value === 'object') {
        transformed[key] = transformDataForForm(value);
      }
    }

    return transformed;
  };

  type FormSchema = z.infer<typeof missionFormSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(missionFormSchema) as any,
    defaultValues: {
      patient: "",
      principal: "",
      insurance: "",
      beginDate: new Date(),
      endDate: new Date(),
      description: "",
      status: "EN_COURS",
      owners: [],
    },
  });

  // Watch patient value changes
  const patientValue = form.watch('patient');
  const { data: patientData } = useGetIRI(patientValue);

  const [formChoice, setFormChoice] = useState<"patient" | "insurance" | "principal" | null>(null);

  const FormChoice = ({ form }: { form: any }) => {
    if (form === "patient") return <PatientForm cancelAction={() => setFormChoice(null)} submitAction={setFormValue} />
    if (form === "insurance") return <InsuranceForm cancelAction={() => setFormChoice(null)} submitAction={setFormValue} />
    if (form === "principal") return <PrincipalForm cancelAction={() => setFormChoice(null)} submitAction={setFormValue} />
    return null
  }

  const queryClient = useQueryClient();

  const setFormValue = (value: Record<string, any>) => {
    console.log('setFormValue', value)
    const datas = queryClient.getQueryData([`${formChoice}s`, `${formChoice}s?page=1`]) as any;
    datas.pages[0].member.push(value);
    queryClient.setQueryData([`${formChoice}s`, `${formChoice}s?page=1`], datas);
    if (!formChoice) return;
    form.setValue(formChoice, value["@id"]);
    setFormChoice(null);
  }


  const onSubmit: SubmitHandler<FormSchema> = async (values) => {
    const missionPayload = {
      patient: getIri(values.patient),
      principal: getIri(values.principal),
      insurance: getIri(values.insurance),
      beginDate: values.beginDate,
      endDate: values.endDate,
      description: values.description,
      status: values.status,
    };

    try {
      if (iri) {
        await patchMission({ ...missionPayload, iri })

        if (isMissionOwner) {
          await patchSharing({
            iri: `${iri}/sharing`,
            owners: uniqueIris(values.owners),
          })
        }
      } else {
        await post({
          ...missionPayload,
          owners: uniqueIris(values.owners),
        })
      }

      router.back()
    } catch (submitError) {
      console.error("Mission update failed", submitError)
    }
  };

  useEffect(() => {
    if (iri && isGetSuccess && data) {
      const transformedData = transformDataForForm(data);
      console.log('transformedData', transformedData);
      form.reset(transformedData);
    }
  }, [iri, isGetSuccess, data]);

  useEffect(() => {
    if (iri && isGetSuccess && currentUser && !isMissionOwner) {
      router.replace(`/application/missions/${params.uuid}/view`);
    }
  }, [currentUser, iri, isGetSuccess, isMissionOwner, params.uuid, router]);

  // Update insurance and principal when patient changes
  useEffect(() => {
    if (patientData && iri) {
      if (patientData.insurance) {
        const insuranceId = patientData.insurance['@id'] || patientData.insurance;
        form.setValue('insurance', insuranceId);
      }
      if (patientData.principal) {
        const principalId = patientData.principal['@id'] || patientData.principal;
        form.setValue('principal', principalId);
      }
    }
  }, [patientData, form]);

  console.log('form.errors', form.formState.errors)
  console.log('form.values', form.getValues())

  const isSubmitting = isPostPending || isPatchPending || isSharingPending;

  if (isLoading || isCurrentUserLoading || (iri && !isMissionOwner)) return <Spinner />
  return (
    <div className={cn("grid grid-cols-2 gap-6 w-[200%] h-full overflow-y-scroll transition-all", formChoice && "-translate-x-1/2")}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
          <div className="space-y-8 [&>*]:break-inside-avoid">
            <SearchSelect
              form={form}
              name="patient"
              title="Patient"
              entity="patients"
              placeholder="Choisir un patient"
              searchPlaceholder="Chercher un patient"
              labels={["firstname", "lastname"]}
              required
              className={iri ? "" : "mb-4"}
              defaultIRI={iri && data.patient ? data.patient : undefined}
            />
            {!iri &&
              <Button type="button" variant="outline" size={"sm"} onClick={() => setFormChoice("patient")}>
                Nouveau patient
              </Button>
            }
            <SearchSelect
              form={form}
              name="principal"
              title="Mandant"
              entity="principals"
              placeholder="Choisir un mandant"
              searchPlaceholder="Chercher un mandant"
              labels={["name"]}
              className={iri ? "" : "mb-4"}
              defaultIRI={iri && data.principal ? data.principal : undefined}
            />
            {!iri &&
              <Button type="button" variant="outline" size={"sm"} onClick={() => setFormChoice("principal")}>
                Nouveau mandant
              </Button>
            }
            <SearchSelect
              form={form}
              name="insurance"
              title="Assurance"
              entity="insurances"
              placeholder="Choisir une assurance"
              searchPlaceholder="Chercher une assurance"
              labels={["name"]}
              className={iri ? "" : "mb-4"}
              defaultIRI={iri && data.insurance ? data.insurance : undefined}
            />
            {!iri &&
              <Button type="button" variant="outline" size={"sm"} onClick={() => setFormChoice("insurance")}>
                Nouvelle assurance
              </Button>
            }
            <FormDatePicker
              form={form}
              name="beginDate"
              title="Début de la mission"
              required
            />
            <FormDatePicker
              form={form}
              name="endDate"
              title="Fin de la mission"
              required
            />
            <FormTextarea
              form={form}
              name="description"
              title="Description"
              placeholder="Description de la mission"
              className="h-50"
              required
            />
            {isMissionOwner && (
              <SearchMultiSelect
                form={form}
                name="owners"
                title="Collaborateurs"
                entity="cooperators"
                placeholder="Choisir vos collaborateurs"
                searchPlaceholder="Chercher un collaborateur"
                labels={["firstname", "lastname"]}
              />
            )}
          </div>
          <Button type="button" variant="cancel"
            disabled={isSubmitting}
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" className="ml-3"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            Enregistrer
          </Button>
        </form>
      </Form >
      <FormChoice form={formChoice} />
    </div>
  );

}


export default MissionForm;
