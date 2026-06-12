<?php

namespace App\Model;

enum MandateCategoryEnum: string
{
    case NURSING = 'NURSING';
    case PHYSIOTHERAPY = 'PHYSIOTHERAPY';
    case MEDICAL_EQUIPMENT = 'MEDICAL_EQUIPMENT';
    case PERSONAL_ASSISTANCE = 'PERSONAL_ASSISTANCE';
}
