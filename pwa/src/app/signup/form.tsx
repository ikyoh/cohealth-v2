"use client"

import FormInput from "@/components/form/form-input"
import FormSelect from "@/components/form/form-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { usePostQuery } from "@/hooks/useQuery"
import { signupFormSchema } from "@/utils/zodSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type SignupSchema = z.infer<typeof signupFormSchema>

const roleItems = [
  { value: "ROLE_NURSE", label: "Infirmier / Infirmière" },
  { value: "ROLE_PHYSIO", label: "Physiothérapeute" },
  { value: "ROLE_PRINCIPAL", label: "Mandant" },
]

export function SignupForm() {
  const [submitted, setSubmitted] = useState(false)
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(true)
  const { mutateAsync: register, isPending } = usePostQuery("register")

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupFormSchema) as any,
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      role: undefined,
      organizationName: "",
      rcc: "",
      gln: "",
      mobile: "",
      phone: "",
      address: "",
      postCode: "",
      city: "",
      country: "Suisse",
      isOptin: false,
    },
  })

  const onSubmit: SubmitHandler<SignupSchema> = async (values) => {
    form.clearErrors("root")
    const { passwordConfirmation, ...payload } = values

    try {
      const response = await register(payload)
      setConfirmationEmailSent(response?.confirmationEmailSent !== false)
      setSubmitted(true)
    } catch (error: any) {
      const status = error?.response?.status
      const errors = error?.response?.data?.errors

      if (errors && typeof errors === "object") {
        Object.entries(errors).forEach(([field, message]) => {
          form.setError(field as keyof SignupSchema, {
            message: String(message),
          })
        })
        return
      }

      form.setError("root", {
        message:
          status === 409
            ? "Un compte existe déjà avec cette adresse email."
            : "L’inscription n’a pas pu être enregistrée. Veuillez réessayer.",
      })
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6">
        <Image src="/logo-cohealth.svg" alt="CoHealth" width={180} height={40} />
        <Card className="w-full max-w-xl text-center">
          <CardHeader className="flex flex-col items-center justify-center">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
              <CheckCircle2 className="size-6" />
            </div>
            <CardTitle className="mt-3 text-center">Demande enregistrée</CardTitle>
            <CardDescription className="max-w-md">
              Votre compte doit maintenant être approuvé par un administrateur
              avant votre première connexion.{" "}
              {confirmationEmailSent
                ? "Un email de confirmation vous a été envoyé."
                : "L’email de confirmation n’a pas pu être envoyé."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/signin">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div >
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Image src="/logo-cohealth.svg" alt="CoHealth" width={180} height={40} />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Renseignez vos informations professionnelles. Votre demande sera
            vérifiée avant activation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <section className="space-y-4">
                <h2 className="font-semibold">Identité et accès</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    form={form}
                    name="firstname"
                    title="Prénom"
                    placeholder="Prénom"
                    autoComplete="given-name"
                    required
                  />
                  <FormInput
                    form={form}
                    name="lastname"
                    title="Nom"
                    placeholder="Nom"
                    autoComplete="family-name"
                    required
                  />
                  <FormInput
                    form={form}
                    name="email"
                    title="Email"
                    placeholder="vous@exemple.ch"
                    type="email"
                    autoComplete="email"
                    required
                  />
                  <FormSelect
                    form={form}
                    name="role"
                    title="Profession"
                    placeholder="Choisir une profession"
                    items={roleItems}
                    required
                  />
                  <FormInput
                    form={form}
                    name="password"
                    title="Mot de passe"
                    placeholder="8 caractères minimum"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                  <FormInput
                    form={form}
                    name="passwordConfirmation"
                    title="Confirmer le mot de passe"
                    placeholder="Répétez le mot de passe"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="font-semibold">Informations professionnelles</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    form={form}
                    name="organizationName"
                    title="Organisation"
                    placeholder="Nom de l’organisation"
                  />
                  <FormInput
                    form={form}
                    name="rcc"
                    title="RCC"
                    placeholder="A123456"
                    required
                  />
                  <FormInput
                    form={form}
                    name="gln"
                    title="GLN"
                    placeholder="13 chiffres"
                    required
                  />
                  <FormInput
                    form={form}
                    name="mobile"
                    title="Mobile"
                    placeholder="+41..."
                    type="tel"
                    autoComplete="tel"
                  />
                  <FormInput
                    form={form}
                    name="phone"
                    title="Téléphone"
                    placeholder="+41..."
                    type="tel"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="font-semibold">Adresse professionnelle</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FormInput
                      form={form}
                      name="address"
                      title="Adresse"
                      placeholder="Rue et numéro"
                      autoComplete="street-address"
                      required
                    />
                  </div>
                  <FormInput
                    form={form}
                    name="postCode"
                    title="NPA"
                    placeholder="1201"
                    autoComplete="postal-code"
                    required
                  />
                  <FormInput
                    form={form}
                    name="city"
                    title="Ville"
                    placeholder="Genève"
                    autoComplete="address-level2"
                    required
                  />
                  <FormInput
                    form={form}
                    name="country"
                    title="Pays"
                    placeholder="Suisse"
                    autoComplete="country-name"
                    required
                  />
                </div>
              </section>

              <FormField
                control={form.control}
                name="isOptin"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-normal">
                        Je souhaite recevoir les informations liées à CoHealth.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.message && (
                <p className="text-destructive text-sm" role="alert">
                  {form.formState.errors.root.message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" asChild>
                  <Link href="/signin">J’ai déjà un compte</Link>
                </Button>
                <Button type="submit" loading={isPending} disabled={isPending}>
                  Envoyer ma demande
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
