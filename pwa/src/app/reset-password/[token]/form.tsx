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
import { request } from "@/utils/axios.utils"
import { resetPasswordFormSchema } from "@/utils/zodSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type ResetPasswordSchema = z.infer<typeof resetPasswordFormSchema>

export default function ResetPasswordForm() {
  const params = useParams<{ token: string }>()
  const token = params.token
  const [tokenStatus, setTokenStatus] = useState<
    "checking" | "valid" | "invalid"
  >("checking")
  const [submitted, setSubmitted] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordFormSchema) as any,
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  })

  useEffect(() => {
    request({
      url: `/forgot-password/${encodeURIComponent(token)}`,
      method: "get",
      data: undefined,
    })
      .then(() => setTokenStatus("valid"))
      .catch(() => setTokenStatus("invalid"))
  }, [token])

  const onSubmit: SubmitHandler<ResetPasswordSchema> = async (values) => {
    form.clearErrors("root")
    setIsPending(true)

    try {
      await request({
        url: `/forgot-password/${encodeURIComponent(token)}`,
        method: "post",
        data: { password: values.password },
      })
      setSubmitted(true)
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setTokenStatus("invalid")
        return
      }

      form.setError("root", {
        message:
          error?.response?.data?.detail ??
          "Le mot de passe n’a pas pu être modifié. Veuillez réessayer.",
      })
    } finally {
      setIsPending(false)
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
            <CardTitle className="mt-3">Mot de passe modifié</CardTitle>
            <CardDescription>
              Vous pouvez maintenant vous connecter avec votre nouveau mot de
              passe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/signin">Se connecter</Link>
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
          <CardTitle>Nouveau mot de passe</CardTitle>
          <CardDescription>
            Choisissez un mot de passe contenant au moins 8 caractères.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tokenStatus === "checking" && (
            <p className="text-muted-foreground text-sm">
              Vérification du lien…
            </p>
          )}

          {tokenStatus === "invalid" && (
            <div className="flex flex-col gap-4">
              <p className="text-destructive text-sm" role="alert">
                Ce lien est invalide ou a expiré.
              </p>
              <Button asChild>
                <Link href="/forgot-password">Demander un nouveau lien</Link>
              </Button>
            </div>
          )}

          {tokenStatus === "valid" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <FormInput
                  form={form}
                  name="password"
                  title="Nouveau mot de passe"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                />
                <FormInput
                  form={form}
                  name="passwordConfirmation"
                  title="Confirmer le mot de passe"
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                />

                {form.formState.errors.root?.message && (
                  <p className="text-destructive text-sm" role="alert">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={isPending}
                  disabled={isPending}
                >
                  Modifier le mot de passe
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
