import { SidebarLeft } from "@/components/sidebar-left";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import UserProvider from "./user-provider";
// Configuration globale de Day.js
import "@/utils/dayjs.config";


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COHEALTH",
  description: "Cohealth Application",
};





export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserProvider>
      <SidebarProvider>
        <SidebarLeft />
        {children}
      </SidebarProvider>
    </UserProvider>
  )
}
