<?php

namespace App\Model;

enum MandateGroupStatusEnum: string
{
    case EDITED = 'EDITED';
    case IN_PROGRESS = 'IN_PROGRESS';
    case COMPLETED = 'COMPLETED';
    case CANCELLED = 'CANCELLED';
}
