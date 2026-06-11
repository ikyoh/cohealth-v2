<?php

namespace App\Model;

enum MissionStatusEnum: string
{
    case EN_COURS = "EN_COURS";
    case ANNULE = "ANNULE";
    case ARCHIVE = "ARCHIVE";
    case FACTURE = "FACTURE";
}
