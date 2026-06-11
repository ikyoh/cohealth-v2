"use client";

import FormDatePicker from "@/components/form/form-datepicker";
import FormInput from "@/components/form/form-input";
import FormLoader from "@/components/form/form-loader";
import FormSelect from "@/components/form/form-select";
import SearchSelect from "@/components/form/search-select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { enumToSelectItems } from "@/utils/functions.utils";
import { Cantons, Gender } from "@/utils/types.utils";
import { patientFormSchema } from "@/utils/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";



type Props = {
  cancelAction?: () => void;
  submitAction?: (value: object) => void;
}


const PatientForm = ({ cancelAction, submitAction }: Props) => {

  let previousUrl = document.referrer || null;
  console.log('previousUrl', previousUrl)

  const params = useParams()
  const iri = params.uuid ? `/patients/${params.uuid}` : ""
  const router = useRouter()

  const { mutate: post, data: patient, isSuccess: isPostSuccess, isPending: isPostPending } = usePostQuery('patients');

  const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();

  const { data, isLoading, error, isSuccess: isGetSuccess, isError } = useGetIRI(iri);

  console.log('data', data)

  type FormSchema = z.infer<typeof patientFormSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(patientFormSchema) as any,
    defaultValues: {
      gender: "",
      lastname: "",
      firstname: "",
      birthDate: undefined,
      canton: "",
      address: "",
      additionalAddress: "",
      npa: "",
      city: "",
      phone: "",
      mobile: "",
      email: "",
      avsNumber: "",
      insuranceNumber: "",
      principal: "",
      insurance: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
    if (iri) patch({ ...values, iri })
    else post(values)
  };

  useEffect(() => {
    if (isPostSuccess || isPatchSuccess) {
      if (submitAction) submitAction(patient)
      else router.back()
    }
  }, [isPostSuccess, isPatchSuccess, router, patient, params.uuid]);

  useEffect(() => {
    if (iri && isGetSuccess) {
      form.reset(data)
    }
  }, [iri, isGetSuccess]);

  if (isLoading || isError) return <FormLoader length={13} />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormInput
          form={form}
          name="lastname"
          title="Nom"
          placeholder="Nom du patient"
          required
        />
        <FormInput
          form={form}
          name="firstname"
          title="Prénom"
          placeholder="Prénom du patient"
          required
        />
        <FormSelect
          form={form}
          name="gender"
          title="Genre"
          placeholder="Choisir un genre"
          items={enumToSelectItems(Gender)}
          required
        />
        <FormDatePicker
          form={form}
          name="birthDate"
          title="Date de naissance"
          required
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
          placeholder="Numéro postal d'acheminement"
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
          name="avsNumber"
          title="Numéro AVS"
          placeholder="Assurance-vieillesse et survivants"
          required
        />
        <FormInput
          form={form}
          name="insuranceNumber"
          title="Numéro d'assuré"
          placeholder="Numéro d'assuré"
          required
        />
        <SearchSelect
          form={form}
          name="insurance"
          entity="insurances"
          labels={["name"]}
          title="Assurance"
          placeholder="Choisir une assurance"
          searchPlaceholder="Rechercher une assurance"
          defaultIRI={iri && data.insurance ? data.insurance : undefined}
        />
        <SearchSelect
          form={form}
          name="principal"
          entity="principals"
          labels={["name"]}
          title="Médecin"
          placeholder="Choisir un médecin"
          searchPlaceholder="Rechercher un médecin"
          defaultIRI={iri && data.principal ? data.principal : undefined}
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


export default PatientForm;