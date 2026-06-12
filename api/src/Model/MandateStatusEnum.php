<?php

namespace App\Model;

enum MandateStatusEnum: string
{
    case EDITED = 'EDITED';
    case ASSIGNED = 'ASSIGNED';
    case ACCEPTED = 'ACCEPTED';
    case REJECTED = 'REJECTED';
    case CANCELLED = 'CANCELLED';
}
