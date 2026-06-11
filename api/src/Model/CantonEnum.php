<?php

namespace App\Model;

enum CantonEnum: string
{
    case ZURICH = "ZURICH";
    case BERNE = "BERNE";
    case LUCERNE = "LUCERNE";
    case URI = "URI";
    case SCHWYZ = "SCHWYZ";
    case OBWALDEN = "OBWALDEN";
    case NIDWALDEN = "NIDWALDEN";
    case GLARIS = "GLARIS";
    case ZOUG = "ZOUG";
    case FRIBOURG = "FRIBOURG";
    case SOLEURE = "SOLEURE";
    case BALE_VILLE = "BALE_VILLE";
    case BALE_CAMPAGNE = "BALE_CAMPAGNE";
    case SCHAFFHOUSE = "SCHAFFHOUSE";
    case APPENZELL_RH_EXT = "APPENZELL_RH_EXT";
    case APPENZELL_RH_INT = "APPENZELL_RH_INT";
    case SAINT_GALL = "SAINT_GALL";
    case GRISONS = "GRISONS";
    case ARGOVIE = "ARGOVIE";
    case THURGOVIE = "THURGOVIE";
    case TESSIN = "TESSIN";
    case VAUD = "VAUD";
    case VALAIS = "VALAIS";
    case NEUCHATEL = "NEUCHATEL";
    case GENEVE = "GENEVE";
    case JURA = "JURA";
}
