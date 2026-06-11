"use client"

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetCollection, useGetIRI } from "@/hooks/useQuery";
import { cn } from "@/utils/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PatientOption = {
  firstname?: string;
  lastname?: string;
  uuid: string;
}

type ComboboxPatient = {
  label: string;
  value: string;
}

export function PatientFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedPatient = searchParams.get("patient") || "";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 600);

  const patientSearchParams = new URLSearchParams({ pagination: "false" });

  if (debouncedSearch) {
    patientSearchParams.set("search", debouncedSearch);
  }

  const { data, isLoading } = useGetCollection({
    entity: "patients",
    searchParams: patientSearchParams.toString(),
  });
  const { data: selectedPatientData } = useGetIRI(selectedPatient ? `/patients/${selectedPatient}` : "");

  const patients = useMemo<ComboboxPatient[]>(() => (data?.member || []).map((patient: PatientOption) => ({
    label: [patient.lastname, patient.firstname].filter(Boolean).join(" "),
    value: patient.uuid,
  })), [data]);

  const selectedPatientLabel = patients.find((patient) => patient.value === selectedPatient)?.label ||
    (selectedPatientData ? [selectedPatientData.lastname, selectedPatientData.firstname].filter(Boolean).join(" ") : "");

  const updatePatient = (patientUuid: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (patientUuid) {
      params.set("patient", patientUuid);
    } else {
      params.delete("patient");
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Patient</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", !selectedPatient && "text-muted-foreground")}
          >
            <span className="truncate">
              {selectedPatient ? selectedPatientLabel || "Chargement..." : "Tous les patients"}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Chercher un patient"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{isLoading ? "Chargement..." : "Aucun patient."}</CommandEmpty>
              <CommandGroup>
                <CommandItem value="Tous les patients" onSelect={() => updatePatient("")}>
                  Tous les patients
                  <Check className={cn("ml-auto", !selectedPatient ? "opacity-100" : "opacity-0")} />
                </CommandItem>
                {patients.map((patient) => (
                  <CommandItem
                    key={patient.value}
                    value={patient.label}
                    onSelect={() => updatePatient(patient.value)}
                  >
                    {patient.label}
                    <Check className={cn("ml-auto", patient.value === selectedPatient ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
