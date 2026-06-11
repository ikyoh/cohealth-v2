import dayjs from "dayjs";
import "dayjs/locale/fr";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";

// Configuration de la locale française
dayjs.locale("fr");

// Configuration des plugins
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.extend(isoWeek);
dayjs.extend(isBetween);

// Personnalisation de la locale française
// dayjs.updateLocale("fr", {
//   weekdaysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
//   weekdaysMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
//   months: [
//     "Janvier",
//     "Février",
//     "Mars",
//     "Avril",
//     "Mai",
//     "Juin",
//     "Juillet",
//     "Août",
//     "Septembre",
//     "Octobre",
//     "Novembre",
//     "Décembre",
//   ],
//   monthsShort: [
//     "Jan",
//     "Fév",
//     "Mar",
//     "Avr",
//     "Mai",
//     "Juin",
//     "Juil",
//     "Août",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Déc",
//   ],
// });

export default dayjs;
