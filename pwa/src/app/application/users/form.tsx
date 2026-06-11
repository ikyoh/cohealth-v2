"use client";

import FormCheckbox from "@/components/form/form-checkbox";
import FormInput from "@/components/form/form-input";
import FormLoader from "@/components/form/form-loader";
import FormSelect from "@/components/form/form-select";
import FormSwitch from "@/components/form/form-switch";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { roles } from "@/utils/arrays";
import { enumToSelectItems } from "@/utils/functions.utils";
import { Cantons, PrincipalCategories } from "@/utils/types.utils";
import { userFormSchema } from "@/utils/zodSchemas";
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

const UserForm = ({ iri, cancelAction, submitAction }: Props) => {
  const router = useRouter()

  const { mutate: post, isSuccess: isPostSuccess, isPending: isPostPending, data: user } = usePostQuery("users");
  const { mutate: patch, isSuccess: isPatchSuccess, isPending: isPatchPending } = usePatchQuery();
  const { data, isLoading, isSuccess: isGetSuccess } = useGetIRI(iri ? iri : "");

  type FormSchema = z.infer<typeof userFormSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(userFormSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      firstname: "",
      lastname: "",
      organizationName: "",
      roles: [],
      isActive: true,
      isApproved: false,
      isOptin: false,
      rcc: "",
      gln: "",
      mobile: "",
      phone: "",
      fax: "",
      address: "",
      postCode: "",
      city: "",
      country: "Suisse",
      principalCategory: "",
      principalCanton: "",
    },
  });
  const selectedRoles = form.watch("roles") || [];
  const isPrincipal = selectedRoles.includes("ROLE_PRINCIPAL");
  const identifiersRequired = !selectedRoles.some((role) =>
    ["ROLE_ADMIN", "ROLE_COORDINATOR", "ROLE_COORNINATOR"].includes(role)
  );

  const onSubmit: SubmitHandler<FormSchema> = (values: any) => {
    if (!iri && !values.password) {
      form.setError("password", { message: "Champ obligatoire." });
      return;
    }

    if (values.roles?.includes("ROLE_PRINCIPAL") && values.isApproved && !data?.principal) {
      let hasMissingPrincipalDetails = false;

      if (!values.principalCategory) {
        form.setError("principalCategory", { message: "Champ obligatoire." });
        hasMissingPrincipalDetails = true;
      }

      if (!values.principalCanton) {
        form.setError("principalCanton", { message: "Champ obligatoire." });
        hasMissingPrincipalDetails = true;
      }

      if (hasMissingPrincipalDetails) {
        return;
      }
    }

    const payload = { ...values };

    if (iri && !payload.password) {
      delete payload.password;
    }

    if (iri) patch({ ...payload, iri })
    else post(payload)
  };

  useEffect(() => {
    if (isPostSuccess || isPatchSuccess) {
      if (submitAction) submitAction(user)
      else router.back()
    }
  }, [isPostSuccess, isPatchSuccess, router, submitAction, user]);

  useEffect(() => {
    if (iri && isGetSuccess) {
      form.reset({
        email: data.email || "",
        password: "",
        firstname: data.firstname || "",
        lastname: data.lastname || "",
        organizationName: data.organizationName || "",
        roles: data.roles?.filter((role: string) => role !== "ROLE_USER") || [],
        isActive: data.isActive ?? true,
        isApproved: data.isApproved ?? false,
        isOptin: data.isOptin ?? false,
        rcc: data.rcc || "",
        gln: data.gln || "",
        mobile: data.mobile || "",
        phone: data.phone || "",
        fax: data.fax || "",
        address: data.address || "",
        postCode: data.postCode || "",
        city: data.city || "",
        country: data.country || "Suisse",
        principalCategory: "",
        principalCanton: "",
      })
    }
  }, [data, form, iri, isGetSuccess]);

  if (isLoading) return <FormLoader length={16} />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-md">
        <FormInput
          form={form}
          name="firstname"
          title="Prénom"
          placeholder="Prénom"
          required
        />
        <FormInput
          form={form}
          name="lastname"
          title="Nom"
          placeholder="Nom"
        />
        <FormInput
          form={form}
          name="email"
          title="Email"
          placeholder="Adresse email"
          type="email"
          required
        />
        <FormInput
          form={form}
          name="password"
          title={iri ? "Nouveau mot de passe" : "Mot de passe"}
          placeholder={iri ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
          type="password"
          required={!iri}
        />
        <FormInput
          form={form}
          name="organizationName"
          title="Organisation"
          placeholder="Nom de l'organisation"
        />
        <FormCheckbox
          form={form}
          name="roles"
          title="Rôles"
          items={Object.entries(roles).map(([id, label]) => ({ id, label }))}
        />
        {isPrincipal && !data?.principal && (
          <>
            <FormSelect
              form={form}
              name="principalCategory"
              title="Catégorie du mandant"
              placeholder="Choisir une catégorie"
              items={enumToSelectItems(PrincipalCategories)}
              required
            />
            <FormSelect
              form={form}
              name="principalCanton"
              title="Canton du mandant"
              placeholder="Choisir un canton"
              items={enumToSelectItems(Cantons)}
              required
            />
          </>
        )}
        <FormSwitch
          form={form}
          name="isActive"
          title="Utilisateur actif"
        />
        <FormSwitch
          form={form}
          name="isApproved"
          title="Utilisateur approuvé"
        />
        <FormSwitch
          form={form}
          name="isOptin"
          title="Opt-in"
        />
        <FormInput
          form={form}
          name="rcc"
          title="RCC"
          placeholder="A123456"
          required={identifiersRequired}
        />
        <FormInput
          form={form}
          name="gln"
          title="GLN"
          placeholder="Numéro GLN"
          required={identifiersRequired}
        />
        <FormInput
          form={form}
          name="mobile"
          title="Mobile"
          placeholder="Numéro mobile"
        />
        <FormInput
          form={form}
          name="phone"
          title="Téléphone"
          placeholder="Numéro de téléphone"
        />
        <FormInput
          form={form}
          name="fax"
          title="Fax"
          placeholder="Numéro de fax"
        />
        <FormInput
          form={form}
          name="address"
          title="Adresse"
          placeholder="Adresse principale"
        />
        <FormInput
          form={form}
          name="postCode"
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
          name="country"
          title="Pays"
          placeholder="Pays"
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
    </Form>
  );
}

export default UserForm;
