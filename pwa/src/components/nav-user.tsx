"use client"
import { useGetIRI } from "@/hooks/useQuery";
import { removeAuthToken } from "@/utils/authToken";
import { useRouter } from "next/navigation";

import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Moon,
  Settings,
  Sun,
  User
} from "lucide-react";

import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export function NavUser() {


  const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useGetIRI("/current_user");
  const { data, isLoading, isError } = useGetIRI(user ? user.iri : null);

  const { data: avatar, isLoading: isLoadingAvatar, isError: isErrorAvatar } = useGetIRI(data ? data.avatar : null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isMobile } = useSidebar()
  const { theme, setTheme } = useTheme();

  const handleSwitchTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };

  const handleLogout = async () => {
    removeAuthToken();
    await queryClient.cancelQueries();
    queryClient.clear();
    router.replace("/signin");
    router.refresh();
  };

  if (isLoading || isLoadingUser || isLoadingAvatar) {
    return <Skeleton className="h-10 w-full rounded-lg" />;
  }

  if (isError || !user) {
    return <div>Error loading user data</div>;
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatar?.contentUrl} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-primary">
                  {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.firstname}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatar?.contentUrl} alt={user.firstname} />
                  <AvatarFallback className="rounded-lg">
                    {user.firstname?.charAt(0)}{user.lastname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.firstname}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/application/profile" className="text-foreground">
                <DropdownMenuItem>
                  <User />
                  Mon compte
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Settings />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSwitchTheme}>
                <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                {theme === "light" ? "Mode sombre" : "Mode clair"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
            >
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
