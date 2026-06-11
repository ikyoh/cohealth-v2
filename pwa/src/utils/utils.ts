import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusClasses = {
    A: "bg-green-400 dark:bg-green-600",
    B: "bg-pink-400 dark:bg-pink-600",
    C: "bg-orange-400 dark:bg-orange-600",
    N: "bg-gray-400 dark:bg-gray-600",
    A_FAIRE: "border-destructive dark:border-destructive",
    EN_COURS: "border-primary dark:border-primary",
    ANNULE: "border-destructive dark:border-destructive",
    ARCHIVE: "border-lime-500 dark:border-lime-600",
    FACTURE: "border-purple-500 dark:border-purple-600",
    BROUILLON: "border-gray-400 dark:border-gray-400",
    ENVOYE_AU_MEDECIN: "border-blue-500 dark:border-blue-600",
    VALIDE_PAR_LE_MEDECIN: "border-green-500 dark:border-green-600",
    ENVOYE_A_L_ASSURANCE: "border-indigo-500 dark:border-indigo-600",
    CONTESTE_PAR_L_ASSURANCE: "border-red-500 dark:border-red-600",
};