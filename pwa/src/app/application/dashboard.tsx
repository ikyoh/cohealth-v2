"use client"

import { BadgeStatus } from "@/components/badge-status"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetCollection, useGetIRI } from "@/hooks/useQuery"
import { MissionInterface, MissionStatus } from "@/utils/types.utils"
import {
  ArrowRight,
  BriefcaseMedical,
  CalendarDays,
  ClipboardPen,
  ClipboardPlus,
  HeartPulse,
  ShieldUser,
  Sparkles,
  Users,
} from "lucide-react"
import Link from "next/link"

type CountData = {
  count?: number
}

type DashboardMetric = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  query: ReturnType<typeof useGetIRI>
}

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/Paris",
})

const fullDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
})

export default function Dashboard() {
  const { data: currentUser, isLoading } = useGetIRI("/current_user")

  if (isLoading) {
    return <DashboardSkeleton />
  }

  const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN") ?? false

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
}

function UserDashboard() {
  const missions = useGetIRI("/count/missions")
  const patients = useGetIRI("/count/patients")
  const prescriptions = useGetIRI("/count/prescriptions")
  const recentMissions = useGetCollection({
    entity: "missions",
    searchParams: "userOwnership=owned&itemsPerPage=5&order[id]=DESC",
  })

  const metrics: DashboardMetric[] = [
    {
      title: "Missions",
      description: "Missions dont vous êtes responsable",
      href: "/application/missions",
      icon: BriefcaseMedical,
      query: missions,
    },
    {
      title: "Patients",
      description: "Patients liés à votre activité",
      href: "/application/patients",
      icon: HeartPulse,
      query: patients,
    },
    {
      title: "Prescriptions",
      description: "Prescriptions accessibles",
      href: "/application/prescriptions",
      icon: ClipboardPlus,
      query: prescriptions,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardDate />
      <WelcomeCard
        title="Votre activité en un coup d’œil"
        description="Retrouvez vos dossiers prioritaires et accédez rapidement aux actions du quotidien."
        href="/application/events"
        action="Voir le planning"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <RecentMissions
          data={recentMissions.data?.member ?? []}
          isLoading={recentMissions.isLoading}
          isError={recentMissions.isError}
        />
        <QuickActions
          actions={[
            {
              title: "Nouvel événement",
              description: "Ajouter une intervention au planning",
              href: "/application/events/new",
              icon: CalendarDays,
            },
            {
              title: "Nouvelle mission",
              description: "Créer et attribuer une mission",
              href: "/application/missions/new",
              icon: BriefcaseMedical,
            },
            {
              title: "Nouveau patient",
              description: "Enregistrer un dossier patient",
              href: "/application/patients/new",
              icon: HeartPulse,
            },
            {
              title: "Nouvelle prescription",
              description: "Préparer une prescription",
              href: "/application/prescriptions/new",
              icon: ClipboardPlus,
            },
          ]}
        />
      </div>
    </div>
  )
}

function AdminDashboard() {
  const services = useGetIRI("/count/services")
  const insurances = useGetIRI("/count/insurances")
  const principals = useGetIRI("/count/principals")

  const metrics: DashboardMetric[] = [
    {
      title: "Prestations",
      description: "Prestations configurées",
      href: "/application/services",
      icon: ClipboardPlus,
      query: services,
    },
    {
      title: "Assurances",
      description: "Organismes d’assurance",
      href: "/application/insurances",
      icon: ShieldUser,
      query: insurances,
    },
    {
      title: "Mandants",
      description: "Partenaires mandants",
      href: "/application/principals",
      icon: ClipboardPen,
      query: principals,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardDate />
      <WelcomeCard
        title="Votre espace d’administration"
        description="Pilotez les référentiels et les accès qui structurent l’activité CoHealth."
        href="/application/users"
        action="Gérer les utilisateurs"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
        <QuickActions
          title="Administration"
          actions={[
            {
              title: "Nouvel utilisateur",
              description: "Créer un compte et attribuer un rôle",
              href: "/application/users/new",
              icon: Users,
            },
            {
              title: "Nouvelle prestation",
              description: "Compléter le catalogue de prestations",
              href: "/application/services/new",
              icon: ClipboardPlus,
            },
            {
              title: "Nouvelle assurance",
              description: "Ajouter un organisme d’assurance",
              href: "/application/insurances/new",
              icon: ShieldUser,
            },
            {
              title: "Nouveau mandant",
              description: "Référencer un nouveau partenaire",
              href: "/application/principals/new",
              icon: ClipboardPen,
            },
          ]}
        />

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Sparkles className="size-5" />
            </div>
            <CardTitle className="mt-3">Espace administrateur</CardTitle>
            <CardDescription>
              Les outils métier sont masqués pour garder une navigation centrée
              sur la configuration de la plateforme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/application/users">
                Consulter les utilisateurs
                <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DashboardDate() {
  const formattedDate = fullDateFormatter.format(new Date())
  const date = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
        <CalendarDays className="size-5" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Aujourd&apos;hui
        </p>
        <p className="font-semibold">{date}</p>
      </div>
    </div>
  )
}

function WelcomeCard({
  title,
  description,
  href,
  action,
}: {
  title: string
  description: string
  href: string
  action: string
}) {
  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="bg-primary/10 absolute -top-16 -right-12 size-48 rounded-full blur-3xl" />
      <CardHeader className="relative gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="max-w-2xl">{description}</CardDescription>
        </div>
        <Button variant="primary" asChild>
          <Link href={href}>
            {action}
            <ArrowRight />
          </Link>
        </Button>
      </CardHeader>
    </Card>
  )
}

function MetricCard({
  title,
  description,
  href,
  icon: Icon,
  query,
}: DashboardMetric) {
  const data = query.data as CountData | undefined

  return (
    <Link href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full gap-4 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardDescription>{title}</CardDescription>
              {query.isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : query.isError ? (
                <span className="text-muted-foreground text-sm">
                  Indisponible
                </span>
              ) : (
                <CardTitle className="text-3xl tabular-nums">
                  {data?.count ?? 0}
                </CardTitle>
              )}
            </div>
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-muted-foreground flex items-center justify-between gap-3 text-sm">
          <span>{description}</span>
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </CardContent>
      </Card>
    </Link>
  )
}

function RecentMissions({
  data,
  isLoading,
  isError,
}: {
  data: MissionInterface[]
  isLoading: boolean
  isError: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dernières missions</CardTitle>
        <CardDescription>
          Les dossiers récemment ajoutés à votre activité.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/application/missions">
              Tout voir
              <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Missions indisponibles"
            description="Les dernières missions ne peuvent pas être chargées."
          />
        ) : data.length === 0 ? (
          <EmptyState
            title="Aucune mission"
            description="Vos nouvelles missions apparaîtront ici."
          />
        ) : (
          <div className="divide-y">
            {data.map((mission) => (
              <MissionRow key={mission.uuid} mission={mission} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MissionRow({ mission }: { mission: MissionInterface }) {
  const patientIri = typeof mission.patient === "string" ? mission.patient : ""
  const patientQuery = useGetIRI(patientIri)
  const patient =
    typeof mission.patient === "string" ? patientQuery.data : mission.patient
  const status = mission.status as unknown as keyof typeof MissionStatus

  return (
    <Link
      href={`/application/missions/${mission.uuid}/view`}
      className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0"
    >
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
        <BriefcaseMedical className="text-muted-foreground size-5" />
      </div>
      <div className="min-w-0 flex-1">
        {patientQuery.isLoading && patientIri ? (
          <Skeleton className="mb-2 h-4 w-36" />
        ) : (
          <p className="truncate text-sm font-medium">
            {patient
              ? `${patient.firstname} ${patient.lastname}`.trim()
              : `Mission #${mission.id}`}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">
          Du {shortDateFormatter.format(new Date(mission.beginDate))} au{" "}
          {shortDateFormatter.format(new Date(mission.endDate))}
        </p>
      </div>
      <div className="hidden sm:block">
        <BadgeStatus status={status} label={MissionStatus[status] ?? status} />
      </div>
      <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function QuickActions({
  title = "Actions rapides",
  actions,
}: {
  title?: string
  actions: {
    title: string
    description: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Accédez directement aux tâches courantes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group hover:bg-accent flex items-center gap-3 rounded-lg border p-3 transition-colors"
            >
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{action.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {action.description}
                </p>
              </div>
              <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
      <BriefcaseMedical className="text-muted-foreground mb-3 size-7" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-xs">{description}</p>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  )
}
