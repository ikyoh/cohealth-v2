"use client"

import FormInput from "@/components/form/form-input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { usePostQuery } from "@/hooks/useQuery"
import { forgotPasswordFormSchema } from "@/utils/zodSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type ForgotPasswordSchema = z.infer<typeof forgotPasswordFormSchema>

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const { mutateAsync: requestReset, isPending } =
    usePostQuery("forgot-password/")

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordFormSchema) as any,
    defaultValues: {
      email: "",
    },
  })

  const onSubmit: SubmitHandler<ForgotPasswordSchema> = async (values) => {
    form.clearErrors("root")

    try {
      await requestReset(values)
      setSubmitted(true)
    } catch {
      form.setError("root", {
        message: "La demande n’a pas pu être envoyée. Veuillez réessayer.",
      })
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6">
        <Image src="/logo-cohealth.svg" alt="CoHealth" width={180} height={40} />
        <Card className="w-full text-center">
          <CardHeader className="items-center">
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
              <CheckCircle2 className="size-6" />
            </div>
            <CardTitle className="mt-3">Consultez votre messagerie</CardTitle>
            <CardDescription>
              Si un compte correspond à cette adresse, un lien valable une
              heure vient de vous être envoyé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/signin">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Image src="/logo-cohealth.svg" alt="CoHealth" width={180} height={40} />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Saisissez l’adresse email associée à votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <FormInput
                form={form}
                name="email"
                title="Email"
                placeholder="me@example.com"
                type="email"
                autoComplete="email"
              />

              {form.formState.errors.root?.message && (
                <p className="text-destructive text-sm" role="alert">
                  {form.formState.errors.root.message}
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/signin">Retour</Link>
                </Button>
                <Button
                  type="submit"
                  className="grow"
                  loading={isPending}
                  disabled={isPending}
                >
                  Envoyer le lien
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
