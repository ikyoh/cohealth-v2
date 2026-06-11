"use client"

import { useGetIRI } from "@/hooks/useQuery"

export default function HomePageTitle() {
  const { data: currentUser } = useGetIRI("/current_user")
  const firstname = currentUser?.firstname?.trim()

  return (
    <div className="flex items-end gap-2">
      <span className="font-medium">
        Bonjour{firstname ? `, ${firstname}` : ""}
      </span>
    </div>
  )
}
