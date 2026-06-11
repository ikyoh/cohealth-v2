<?php

namespace App\Model;

enum ObservationTypeEnum: string
{
    case WEIGHT = 'WEIGHT';
    case BLOOD_PRESSURE = 'BLOOD_PRESSURE';
    case BLOOD_GLUCOSE = 'BLOOD_GLUCOSE';
    case TEMPERATURE = 'TEMPERATURE';
    case TEXT = 'TEXT';
}
