"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const ALL_ROLES = "all"

export default function RoleFilter() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedRole = searchParams.get("role") || ALL_ROLES

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (role === ALL_ROLES) {
      params.delete("role")
    } else {
      params.set("role", role)
    }

    params.delete("page")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <Select value={selectedRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-48" aria-label="Filtrer par profession">
        <SelectValue placeholder="Toutes les professions" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_ROLES}>Toutes les professions</SelectItem>
        <SelectItem value="ROLE_NURSE">Infirmiers</SelectItem>
        <SelectItem value="ROLE_PHYSIO">Physiothérapeutes</SelectItem>
      </SelectContent>
    </Select>
  )
}
