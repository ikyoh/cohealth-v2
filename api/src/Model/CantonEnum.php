<?php

namespace App\Model;

enum CantonEnum: string
{
    case ZURICH = "Zurich (1)";
    case BERNE = "Berne (2)";
    case LUCERNE = "Lucerne (3)";
    case URI = "Uri (4)";
    case SCHWYZ = "Schwyz (5)";
    case OBWALD = "Obwald (6)";
    case NIDWALD = "Nidwald (7)";
    case GLARIS = "Glaris (8)";
    case ZOUG = "Zoug (9)";
    case FRIBOURG = "Fribourg (10)";
    case SOLEURE = "Soleure (11)";
    case BALE_VILLE = "Bâle-Ville (12)";
    case BALE_CAMPAGNE = "Bâle-Campagne (13)";
    case SCHAFFHOUSE = "Schaffhouse (14)";
    case APPENZELL_RH_EXT = "Appenzell Rh.-Ext. (15)";
    case APPENZELL_RH_INT = "Appenzell Rh.-Int. (16)";
    case SAINT_GALL = "Saint-Gall (17)";
    case GRISONS = "Grisons (18)";
    case ARGOVIE = "Argovie (19)";
    case THURGOVIE = "Thurgovie (20)";
    case TESSIN = "Tessin (21)";
    case VAUD = "Vaud (22)";
    case VALAIS = "Valais (23)";
    case NEUCHATEL = "Neuchâtel (24)";
    case GENEVE = "Genève (25)";
    case JURA = "Jura (26)";
}
