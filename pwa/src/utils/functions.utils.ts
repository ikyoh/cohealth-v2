import dayjs from "@/utils/dayjs.config";

export const removeDuplicates = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const arrayOfIris = <T extends { "@id": string }>(array: T[]): string[] => {
  return array.map((currentValue) => currentValue["@id"]);
};

export const arrayOfParam = <T extends Record<string, any>>(array: T[], param: string): any[] => {
  return array.map((currentValue) => currentValue[param]);
};

export const arrayOfIds = <T extends { id: number | string }>(array: T[]): Array<number | string> => {
  return array.map((currentValue) => currentValue.id);
};

export const roundPrice = (price: number) => {
  return Math.round((price + Number.EPSILON) * 100) / 100;
};

export const deepClone = (clone: [] | {}) => {
  return JSON.parse(JSON.stringify(clone));
};

export const enumToSelectItems = (enumObj: Record<string, string>) => {
  return Object.entries(enumObj).map(([key, value]: [string, string]) => ({
    label: value,
    value: key,
  }));
};

export const enumKeysToArray = (enumObj: Record<string, string>) => {
  return Object.entries(enumObj).map(([key, value]: [string, string]) => key);
};

export const replaceObjectsByIri = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;

  const transformed = { ...obj };

  for (const key in transformed) {
    const value = transformed[key];

    // Si la valeur est un objet avec @id, remplacer par la valeur @id
    if (value && typeof value === "object" && value["@id"]) {
      transformed[key] = value["@id"];
    }
    // Si c'est un tableau, appliquer la transformation récursivement
    else if (Array.isArray(value)) {
      transformed[key] = value.map((item) => replaceObjectsByIri(item));
    }
    // Si c'est un objet, appliquer la transformation récursivement
    else if (value && typeof value === "object") {
      transformed[key] = replaceObjectsByIri(value);
    }
  }

  return transformed;
};

export const calcNumberOfDays = (beginAt: string | Date, endAt: string | Date) => {
  const begin = dayjs(beginAt);
  const end = dayjs(endAt).add(1, "day");
  return end.diff(begin, "days");
};

export const calcNumberOfWeeks = (beginAt: string | Date, endAt: string | Date) => {
  const begin = dayjs(beginAt);
  const end = dayjs(endAt);
  return end.diff(begin, "weeks") + 1;
};

export const calcNumberOfMonths = (beginAt: string | Date, endAt: string | Date) => {
  const begin = dayjs(beginAt);
  const end = dayjs(endAt);
  return end.diff(begin, "months") + 1;
};

// services = selected services {}
// category = "A" || "B" || "C" || "N"
type ServiceWithPeriodicity = {
  category: string;
  duration: number | string;
  frequency: number | string;
  periodicity: string;
};

export const calcABCN = (
  category: string,
  services: ServiceWithPeriodicity[],
  beginAt: string | Date,
  endAt: string | Date
) => {
  let filteredServices = services.filter(
    (service) => service.category === category
  );

  let total = filteredServices.reduce((acc, curr) => {
    if (curr.periodicity === "period")
      return Number(curr.duration) * Number(curr.frequency) + acc;
    if (curr.periodicity === "daily")
      return (
        Number(curr.duration) *
          Number(curr.frequency) *
          Number(calcNumberOfDays(beginAt, endAt)) +
        acc
      );
    if (curr.periodicity === "weekly")
      return (
        Number(curr.duration) *
          Number(curr.frequency) *
          Number(calcNumberOfWeeks(beginAt, endAt)) +
        acc
      );
    if (curr.periodicity === "monthly")
      return (
        Number(curr.duration) *
          Number(curr.frequency) *
          Number(calcNumberOfMonths(beginAt, endAt)) +
        acc
      );
    return 0;
  }, 0);

  return total;
};

export const calcMinutestoHours = (minutes: number) => {
  return Math.round((minutes * 100) / 60) / 100;
};

export const firstLetterUppercase = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const iriToUuid = (iri: string) => {
  if (!iri) return null;
  const parts = iri.split('/');
  return parts[parts.length - 1];
};
