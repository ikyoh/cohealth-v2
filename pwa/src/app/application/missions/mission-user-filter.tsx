"use client"

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ownershipLabels = {
  all: "Toutes mes missions",
  owned: "Dont je suis propriétaire",
  "not-owned": "Partagées avec moi",
}

export function MissionUserFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedOwnership = searchParams.get("userOwnership") === "owned" || searchParams.get("userOwnership") === "not-owned"
    ? searchParams.get("userOwnership") as keyof typeof ownershipLabels
    : "all";

  const updateOwnership = (ownership: keyof typeof ownershipLabels) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("user");

    if (ownership === "all") {
      params.delete("userOwnership");
    } else {
      params.set("userOwnership", ownership);
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {ownershipLabels[selectedOwnership]} <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appartenance</DropdownMenuLabel>
        {Object.entries(ownershipLabels).map(([value, label]) => (
          <DropdownMenuItem key={value} onClick={() => updateOwnership(value as keyof typeof ownershipLabels)}>
            <Check className={selectedOwnership === value ? "" : "invisible"} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
