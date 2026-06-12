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
import { useGetIRI, usePatchQuery } from "@/hooks/useQuery"
import { onboardingFormSchema } from "@/utils/zodSchemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  FileText,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

type OnboardingValues = z.infer<typeof onboardingFormSchema>

const defaultValues: OnboardingValues = {
  firstname: "",
  lastname: "",
  organizationName: "",
  mobile: "",
  phone: "",
  address: "",
  postCode: "",
  city: "",
  country: "Suisse",
}

const steps = [
  {
    title: "Bienvenue",
    description: "Découvrez votre nouvel espace",
  },
  {
    title: "Votre profil",
    description: "Vérifiez vos coordonnées",
  },
  {
    title: "Prêt à démarrer",
    description: "Prenez en main CoHealth",
  },
]

const profileFields: Array<keyof OnboardingValues> = [
  "firstname",
  "lastname",
  "organizationName",
  "mobile",
  "phone",
  "address",
  "postCode",
  "city",
  "country",
]

const roleLabels: Record<string, string> = {
  ROLE_NURSE: "Infirmier / Infirmière",
  ROLE_PHYSIO: "Physiothérapeute",
  ROLE_PRINCIPAL: "Mandant",
  ROLE_COORDINATOR: "Coordinateur / Coordinatrice",
  ROLE_ADMIN: "Administrateur / Administratrice",
}

export default function OnboardingPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [submitError, setSubmitError] = useState("")

  const {
    data: currentUser,
    isLoading: isLoadingCurrentUser,
    isError: isCurrentUserError,
  } = useGetIRI("/current_user")
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isUserError,
    isSuccess: isUserSuccess,
  } = useGetIRI(currentUser?.iri || "")
  const { mutateAsync: updateUser, isPending } = usePatchQuery()

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (isCurrentUserError) {
      router.replace("/signin")
      return
    }

    if (currentUser?.onboardingCompleted) {
      router.replace("/application")
    }
  }, [currentUser?.onboardingCompleted, isCurrentUserError, router])

  useEffect(() => {
    if (!isUserSuccess || !user) return

    form.reset({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      organizationName: user.organizationName || "",
      mobile: user.mobile || "",
      phone: user.phone || "",
      address: user.address || "",
      postCode: user.postCode || "",
      city: user.city || "",
      country: user.country || "Suisse",
    })
  }, [form, isUserSuccess, user])

  const goForward = async () => {
    if (step === 1) {
      const isValid = await form.trigger(profileFields, { shouldFocus: true })
      if (!isValid) return
    }

    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const onSubmit: SubmitHandler<OnboardingValues> = async (values) => {
    if (!currentUser?.iri) return

    setSubmitError("")

    try {
      await updateUser({
        iri: currentUser.iri,
        ...values,
        onboardingCompleted: true,
      })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/current_user"] }),
        queryClient.invalidateQueries({ queryKey: [currentUser.iri] }),
      ])
      router.replace("/application")
      router.refresh()
    } catch {
      setSubmitError(
        "La configuration n’a pas pu être enregistrée. Vérifiez vos informations et réessayez.",
      )
    }
  }

  const isLoading = isLoadingCurrentUser || isLoadingUser
  const hasError = isCurrentUserError || isUserError
  const activeRole = currentUser?.roles?.find(
    (role: string) => roleLabels[role],
  )
  const progress = ((step + 1) / steps.length) * 100

  if (isLoading || currentUser?.onboardingCompleted) {
    return (
      <div className="bg-muted flex min-h-svh items-center justify-center">
        <Image
          src="/logo-cohealth.svg"
          alt="CoHealth"
          width={160}
          height={40}
          className="animate-pulse"
        />
      </div>
    )
  }

  if (hasError || !user) {
    return (
      <div className="bg-muted flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="justify-center">
              Impossible de charger votre profil
            </CardTitle>
            <CardDescription>
              Reconnectez-vous pour reprendre la configuration de votre compte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.replace("/signin")}>
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-muted/40 px-4 py-6 sm:px-6 lg:px-8">
      <div className="bg-primary/10 absolute -left-32 -top-32 size-96 rounded-full blur-3xl" />
      <div className="bg-chart-2/10 absolute -bottom-40 -right-24 size-[28rem] rounded-full blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <Image
            src="/logo-cohealth.svg"
            alt="CoHealth"
            width={170}
            height={42}
            priority
          />
          <span className="text-muted-foreground hidden text-sm sm:block">
            Configuration du compte
          </span>
        </header>

        <div className="bg-border h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Card className="min-h-[680px] overflow-hidden p-0 lg:grid lg:grid-cols-[300px_1fr]">
          <aside className="bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-8 lg:flex">
            <div className="bg-white/10 absolute -right-20 -top-20 size-64 rounded-full" />
            <div className="relative">
              <div className="mb-10 flex size-12 items-center justify-center rounded-2xl bg-white/15">
                <HeartPulse className="size-6" />
              </div>
              <ol className="space-y-7">
                {steps.map((item, index) => {
                  const isComplete = index < step
                  const isActive = index === step

                  return (
                    <li key={item.title} className="flex gap-4">
                      <div
                        className={[
                          "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                          isComplete
                            ? "border-white bg-white text-primary"
                            : isActive
                              ? "border-white bg-white/15"
                              : "border-white/40 text-white/60",
                        ].join(" ")}
                      >
                        {isComplete ? <Check className="size-4" /> : index + 1}
                      </div>
                      <div className={isActive || isComplete ? "" : "opacity-60"}>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-white/70">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>

            <div className="relative rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/80">
              <ShieldCheck className="mb-3 size-5 text-white" />
              Vos informations professionnelles sont protégées et utilisées
              uniquement pour votre activité sur CoHealth.
            </div>
          </aside>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex min-h-[680px] flex-col"
            >
              <div className="border-b px-6 py-4 lg:hidden">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Étape {step + 1} sur {steps.length}
                </p>
                <p className="mt-1 font-semibold">{steps[step].title}</p>
              </div>

              <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
                {step === 0 && (
                  <div className="mx-auto w-full max-w-2xl">
                    <div className="bg-primary/10 text-primary mb-6 flex size-14 items-center justify-center rounded-2xl">
                      <Sparkles className="size-7" />
                    </div>
                    <p className="text-primary mb-2 text-sm font-semibold">
                      Bienvenue sur CoHealth
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Bonjour {user.firstname},
                      <br />
                      votre espace est prêt.
                    </h1>
                    <p className="text-muted-foreground mt-4 max-w-xl text-base leading-7">
                      Quelques instants suffisent pour vérifier votre profil et
                      découvrir les outils essentiels à votre activité.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {[
                        {
                          icon: Users,
                          title: "Patients",
                          text: "Centralisez les dossiers et les missions.",
                        },
                        {
                          icon: CalendarDays,
                          title: "Planning",
                          text: "Organisez les interventions simplement.",
                        },
                        {
                          icon: FileText,
                          title: "Prescriptions",
                          text: "Suivez les documents de soins au même endroit.",
                        },
                      ].map(({ icon: Icon, title, text }) => (
                        <div
                          key={title}
                          className="bg-muted/50 rounded-2xl border p-4"
                        >
                          <Icon className="text-primary mb-3 size-5" />
                          <p className="font-semibold">{title}</p>
                          <p className="text-muted-foreground mt-1 text-sm leading-5">
                            {text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-primary/5 mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-4 py-3 text-sm">
                      <span className="font-medium">
                        {user.firstname} {user.lastname}
                      </span>
                      <span className="text-muted-foreground hidden sm:inline">
                        •
                      </span>
                      <span className="text-muted-foreground">
                        {activeRole ? roleLabels[activeRole] : "Professionnel de santé"}
                      </span>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="mx-auto w-full max-w-2xl">
                    <p className="text-primary mb-2 text-sm font-semibold">
                      Votre profil professionnel
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Vérifiez vos coordonnées
                    </h1>
                    <p className="text-muted-foreground mt-3">
                      Ces informations seront utilisées dans votre espace et sur
                      les documents générés par CoHealth.
                    </p>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
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
                      <div className="sm:col-span-2">
                        <FormInput
                          form={form}
                          name="organizationName"
                          title="Organisation"
                          placeholder="Nom de votre organisation"
                          autoComplete="organization"
                        />
                      </div>
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
                      <div className="sm:col-span-2">
                        <FormInput
                          form={form}
                          name="address"
                          title="Adresse professionnelle"
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
                      <div className="sm:col-span-2">
                        <FormInput
                          form={form}
                          name="country"
                          title="Pays"
                          placeholder="Suisse"
                          autoComplete="country-name"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mx-auto w-full max-w-2xl text-center">
                    <div className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-full">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <p className="text-primary mt-6 text-sm font-semibold">
                      Tout est en ordre
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                      Vous pouvez commencer
                    </h1>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-xl leading-7">
                      Votre profil est configuré. Retrouvez maintenant vos
                      patients, vos missions et votre planning depuis le tableau
                      de bord.
                    </p>

                    <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
                      {[
                        "Consulter le tableau de bord",
                        "Ajouter un premier patient",
                        "Planifier une intervention",
                      ].map((label) => (
                        <div
                          key={label}
                          className="flex items-start gap-3 rounded-xl border p-4"
                        >
                          <span className="bg-primary/10 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                            <Check className="size-3.5" />
                          </span>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/60 mt-6 rounded-2xl p-5 text-left">
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                        Profil configuré
                      </p>
                      <p className="mt-2 font-semibold">
                        {form.getValues("firstname")}{" "}
                        {form.getValues("lastname")}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {[
                          form.getValues("organizationName"),
                          form.getValues("city"),
                          form.getValues("country"),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    {submitError && (
                      <p
                        className="bg-destructive/10 text-destructive mt-6 rounded-lg p-3 text-sm"
                        role="alert"
                      >
                        {submitError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <footer className="flex items-center justify-between border-t px-6 py-5 sm:px-10 lg:px-14">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep((current) => Math.max(current - 1, 0))}
                  disabled={step === 0 || isPending}
                >
                  <ArrowLeft />
                  Retour
                </Button>

                {step < steps.length - 1 ? (
                  <Button type="button" size="lg" onClick={goForward}>
                    {step === 0 ? "Configurer mon espace" : "Continuer"}
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    loading={isPending}
                    disabled={isPending}
                  >
                    Accéder à CoHealth
                    <ArrowRight />
                  </Button>
                )}
              </footer>
            </form>
          </Form>
        </Card>
      </div>
    </main>
  )
}
