<?php

namespace App\EntityListener;

use App\Entity\Mission;

class MissionListener
{

    public function prePersist(Mission $mission)
    {
        $this->defineDuration($mission);
    }

    public function preUpdate(Mission $mission)
    {
        $this->defineDuration($mission);
    }

    public function defineDuration(Mission $mission)
    {
        $beginDate = $mission->getBeginDate();
        $endDate = $mission->getEndDate();
        $calcDuration = $endDate->diff($beginDate)->days + 1;
        $mission->setDuration($calcDuration);
    }
}
