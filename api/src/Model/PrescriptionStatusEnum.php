<?php

namespace App\Model;

enum PrescriptionStatusEnum: string
{
    case BROUILLON = "BROUILLON";
    case ENVOYE_AU_MEDECIN = "ENVOYE_AU_MEDECIN";
    case VALIDE_PAR_LE_MEDECIN = "VALIDE_PAR_LE_MEDECIN";
    case ENVOYE_A_L_ASSURANCE = "ENVOYE_A_L_ASSURANCE";
    case CONTESTE_PAR_L_ASSURANCE = "CONTESTE_PAR_L_ASSURANCE";
}
