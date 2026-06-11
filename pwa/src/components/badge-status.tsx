
export const statusClasses = {
    A: "bg-green-400",
    B: "bg-pink-400",
    C: "bg-orange-400",
    N: "bg-gray-400",
    A_FAIRE: "bg-destructive",
    EN_COURS: "bg-primary",
    ANNULE: "bg-destructive",
    ARCHIVE: "bg-lime-500",
    FACTURE: "bg-purple-500",
    BROUILLON: "bg-gray-400",
    ENVOYE_AU_MEDECIN: "bg-blue-500",
    VALIDE_PAR_LE_MEDECIN: "bg-green-500",
    ENVOYE_A_L_ASSURANCE: "bg-indigo-500",
    CONTESTE_PAR_L_ASSURANCE: "bg-red-500",
};

export function BadgeStatus({ status, label }: { status: string, label?: string }) {

    return (
        <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full! ${statusClasses[status] || 'bg-gray-400'}`} />
            {label}
        </div>
    );
}