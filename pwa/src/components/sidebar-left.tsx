"use client"

import { NavUser } from "@/components/nav-user"
import {
  BriefcaseMedical,
  CalendarDays,
  ClipboardPen,
  ClipboardPlus,
  ClipboardPlusIcon,
  HeartPulse,
  ReceiptText,
  ShieldUser,
  Users
} from "lucide-react"
import * as React from "react"

import { NavAdmin } from "@/components/nav-admin"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { useGetIRI } from "@/hooks/useQuery"
import Image from "next/image"

import logo from "../../public/logo-cohealth.svg"


const data = {
  navSecondary: [
    {
      title: "Collaborateurs",
      url: "/application/cooperators",
      icon: Users
    },
    {
      title: "Assurances",
      url: "/application/insurances",
      icon: ShieldUser
    },
    {
      title: "Mandants",
      url: "/application/principals",
      icon: ClipboardPen
    },

  ],

  navAdmin: [
    {
      title: "Utilisateurs",
      url: "/application/users",
      icon: Users,
    },
    {
      title: "Prestations",
      url: "/application/services",
      icon: ClipboardPlusIcon,
    },
    {
      title: "Assurances",
      url: "/application/insurances",
      icon: ShieldUser
    },
    {
      title: "Mandants",
      url: "/application/principals",
      icon: ClipboardPen
    },
  ],
  activity: [
    {
      title: "Planning",
      url: "/application/events",
      icon: CalendarDays,
    },
    {
      title: "Missions",
      url: "/application/missions",
      icon: BriefcaseMedical
    },
    {
      title: "Coopérations",
      url: "/application/cooperations",
      icon: Users,
    },
    {
      title: "Mandats",
      url: "/application/mandates",
      icon: ClipboardPlus,
    },
    {
      title: "Patients",
      url: "/application/patients",
      icon: HeartPulse,
    },
    {
      title: "Prescriptions",
      url: "/application/prescriptions",
      icon: ClipboardPlus,
    },
    {
      title: "Facturation",
      url: "/application/billing",
      icon: ReceiptText,
    }
  ],
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: currentUser, isLoading } = useGetIRI("/current_user")
  const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN") ?? false

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/application">
                <Image src={logo} alt="logo Cohealth" width={140} />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarHeader>
      <SidebarContent>
        {!isLoading && (
          isAdmin ? (
            <NavAdmin items={data.navAdmin} />
          ) : (
            <>
              <NavMain items={data.activity} title="Mon activité" />
              <NavMain items={data.navSecondary} title="Annuaire" />
              {/* <NavSecondary items={data.navSecondary} /> */}
            </>
          )
        )}
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
