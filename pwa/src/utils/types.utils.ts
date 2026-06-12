export interface UserInterface {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  uuid: string;
  email: string;
  roles: string[];
  firstname: string;
  lastname?: string | null;
  organizationName?: string | null;
  mobile?: string | null;
  phone?: string | null;
  city?: string | null;
  isActive: boolean;
  createdAt: string; // ISO date string
  isOptin: boolean;
  isApproved: boolean;
  onboardingCompleted: boolean;
  principal?: string | null;
  // Relations (optionnelles, souvent sous forme d'IRI ou d'objets partiels)
  missions?: string[]; // IRI[]
  sharedMissions?: string[]; // IRI[]
  patients?: string[]; // IRI[]
  prescriptions?: string[]; // IRI[]
}

export interface InsuranceInterface {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  uuid: string;
  name: string;
  category: string;
  organization?: string;
  type?: string;
  address?: string;
  additionalAddress?: string;
  npa?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  gln: string;
}

export interface PrincipalInterface {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  uuid: string;
  isActive: boolean;
  name: string;
  category: keyof typeof PrincipalCategories;
  furtherInformations?: string;
  phone?: string;
  fax?: string;
  mobile?: string;
  email?: string;
  npa: string;
  city: string;
  canton: keyof typeof Cantons;
  address?: string;
  additionalAddress?: string;
  rcc: string;
  gln: string;
  user?: string | { signature?: { contentUrl?: string } } | null;
}

export interface PatientInterface {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  uuid: string;
  firstname: string;
  lastname: string;
  gender: Gender;
  birthDate: string; // ISO date string
  phone?: string;
  mobile?: string;
  canton: Cantons;
  npa: string;
  city: string;
  address: string;
  additionalAddress?: string;
  email?: string;
  avsNumber: string;
  assuranceNumber?: string;
  missions?: MissionInterface[];
  principalName?: string;
  insuranceName?: string;
}

export interface MissionInterface {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  uuid: string;
  description?: string;
  duration: number;
  beginDate: string; // ISO date string
  endDate: string; // ISO date string
  patient: PatientInterface | string;
  principal: string;
  insurance: string;
  owner: UserInterface | string;
  owners: Array<UserInterface | string>;
  opas?: string;
  status: MissionStatus;
}

export enum ObservationType {
  WEIGHT = "WEIGHT",
  BLOOD_PRESSURE = "BLOOD_PRESSURE",
  BLOOD_GLUCOSE = "BLOOD_GLUCOSE",
  TEMPERATURE = "TEMPERATURE",
  TEXT = "TEXT",
}

export interface ObservationInterface {
  "@id": string;
  "@type": string;
  id: number;
  uuid: string;
  mission: MissionInterface | string;
  owner: UserInterface | string;
  authorName: string;
  type: ObservationType;
  observedAt: string;
  createdAt: string;
  value?: string | number | null;
  systolic?: number | null;
  diastolic?: number | null;
  content?: string | null;
}

export interface PrescriptionInterface {
  "@context": string;
  "@id": string;
  "@type": string;
  id: number;
  uuid: string;
  category: string; // PrescriptionCategoryEnum côté front (string ou enum)
  content?: any[] | null;
  beginDate: string; // ISO date string
  createdDate: string; // ISO date string
  signedDate?: string | null; // ISO date string ou null
  owner: string | UserInterface; // IRI ou objet User
  patient: string | PatientInterface; // IRI ou objet Patient
  status: string; // PrescriptionStatusEnum côté front (string ou enum)
  mission?: string | MissionInterface | null; // IRI, objet ou null
  planned: boolean;
}

export enum InsuranceCategory {
  LAMAL = "LAMAL",
  LAA = "LAA",
  LAI = "LAI",
  VVG = "VVG",
  INTERNATIONALE = "Internationale",
}

export enum Cantons {
  ZURICH = "Zurich (1)",
  BERNE = "Berne (2)",
  LUCERNE = "Lucerne (3)",
  URI = "Uri (4)",
  SCHWYZ = "Schwyz (5)",
  OBWALD = "Obwald (6)",
  NIDWALD = "Nidwald (7)",
  GLARIS = "Glaris (8)",
  ZOUG = "Zoug (9)",
  FRIBOURG = "Fribourg (10)",
  SOLEURE = "Soleure (11)",
  BALE_VILLE = "Bâle-Ville (12)",
  BALE_CAMPAGNE = "Bâle-Campagne (13)",
  SCHAFFHOUSE = "Schaffhouse (14)",
  APPENZELL_RH_EXT = "Appenzell Rh.-Ext. (15)",
  APPENZELL_RH_INT = "Appenzell Rh.-Int. (16)",
  SAINT_GALL = "Saint-Gall (17)",
  GRISONS = "Grisons (18)",
  ARGOVIE = "Argovie (19)",
  THURGOVIE = "Thurgovie (20)",
  TESSIN = "Tessin (21)",
  VAUD = "Vaud (22)",
  VALAIS = "Valais (23)",
  NEUCHATEL = "Neuchâtel (24)",
  GENEVE = "Genève (25)",
  JURA = "Jura (26)",
}

export enum Gender {
  MALE = "Homme",
  FEMALE = "Femme",
}

export enum MissionStatus {
  A_FAIRE = "À faire",
  EN_COURS = "En cours",
  ANNULE = "Annulé",
  ARCHIVE = "Archivé",
  FACTURE = "Facturé",
}

export enum PrescriptionStatus {
  A_FAIRE = "A faire",
  BROUILLON = "Brouillon",
  ENVOYE_AU_MEDECIN = "Envoyé M",
  VALIDE_PAR_LE_MEDECIN = "Validé",
  ENVOYE_A_L_ASSURANCE = "Envoyé A",
  CONTESTE_PAR_L_ASSURANCE = "Contesté",
}

export enum PrincipalCategories {
  CHIRURGIE = "Chirurgie",
  CABINETS_DE_GROUPE = "Cabinets de groupe",
  CARDIOLOGIE = "Cardiologie",
  CAS_SPECIAUX = "Cas spéciaux",
  CHIRURGIEN_DENTISTE = "Chirurgien dentiste",
  CHIRURGIE_PLASTIQUE_RECONSTRUCTIVE_ET_ESTHETIQUE = "Chirurgie plastique, reconstructive et esthétique",
  CHIRURGIE_ORTHOPEDIQUE_ET_TRAUMATOLOGIQUE = "Chirurgie orthopédique et traumatologique",
  CLINIQUE_HOPITAL = "Clinique / Hôpital",
  HOPITAL_UNIVERSITAIRE = "Hôpital universitaire",
  CLINIQUE_SPECIALISEE_CHIRURGIE = "Clinique spécialisée chirurgie",
  CLINIQUES_SPECIALISEES_DIVERSE = "Clinique spécialisée diverse",
  CLINIQUE_PSYCHIATRIQUE = "Clinique psychiatrique",
  CLINIQUE_DE_READAPTATION = "Clinique de réadaptation",
  DERMATOLOGIE_ET_VENEREOLOGIE = "Dermatologie et vénéréologie",
  ENDOCRINOLOGIE_ET_DIABETOLOGIE = "Endocrinologie et diabétologie",
  GYNECOLOGIE_ET_OBSTETRIQUE = "Gynécologie et obstétrique",
  INSTITUTION_DE_SOINS_AMBULATOIRES_DISPENSES_PAR_DES_CHIRURGIENS_DENTISTES = "Institution de soins ambulatoires dispensés par des chirurgiens dentistes",
  MAISON_DE_NAISSANCE = "Maison de naissance",
  MEDECINE_INTERNE_GENERALE = "Médecine interne générale",
  MEDECINE_GENERALE = "Médecine générale",
  MEDECINE_PRATICIENNE = "Médecine praticienne",
  NEUROLOGIE = "Neurologie",
  OPHTALMOLOGIE = "Ophtalmologie",
  OTO_RHINO_LARYNGOLOGIE = "Oto-rhino-laryngologie",
  PEDIATRIE = "Pédiatrie",
  PSYCHIATRIE_ET_PSYCHOTHERAPIE = "Psychiatrie et psychothérapie",
  PSYCHIATRIE_ET_PSYCHOTHERAPIE_PEDIATRIQUE = "Psychiatrie et psychothérapie pédiatrique",
  RADIOLOGIE = "Radiologie",
  UROLOGIE = "Urologie",
  AUTRE = "Autre",
}
