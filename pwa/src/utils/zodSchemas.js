import { z } from "zod";
import { enumKeysToArray } from "./functions.utils";
import { Cantons, Gender, InsuranceCategory, MissionStatus, ObservationType, PrescriptionStatus, PrincipalCategories } from "./types.utils";

const requiredString = (min=2,max=255) => z.string({message:"Champ obligatoire."})
            .min(min, {
                message: "Champ obligatoire.",
            })
            .max(max, {
                message: `${max} caractères maximum.`,
            })

const optionalString = (max=255) => z.string()
            .max(max, {
                message: `${max} caractères maximum.`,
            }).optional()

const requiredNumber = z.coerce.number();

const requiredGLN = z.string({
    required_error: 'Champ obligatoire',
    invalid_type_error: 'Doit contenir 13 chiffres',
})
    .regex(/^\d{13}$/, 'Doit contenir 13 chiffres')

const requiredRCC = z.string({
    required_error: 'Champ obligatoire',
    invalid_type_error: 'Doit contenir 1 lettre suivie de 6 chiffres',})
    .regex(/^[a-zA-Z]\d{6}$/, 'Doit contenir 1 lettre suivie de 6 chiffres')

const optionalEmail = z.email()
        .max(255, { message: "255 caractères maximum." })
        .optional()
        .or(z.literal(''))

const requiredCanton =  z.enum(enumKeysToArray(Cantons), { error: "Choix obligatoire" })

const requiredNPA = z.string().regex(/^\d{4}$/, 'Doit contenir 4 chiffres')

const requiredAvsNumber = z.string().regex(/^\d{13}$/, 'Doit contenir 13 chiffres')

const requiredInsuranceNumber = z.string().regex(/^\d{20}$/, 'Doit contenir 20 chiffres')

const identifierExemptRoles = [
    "ROLE_ADMIN",
    "ROLE_COORDINATOR",
    "ROLE_COORNINATOR",
]

const validateProfessionalIdentifiers = (data, context) => {
    if (data.roles?.some((role) => identifierExemptRoles.includes(role))) {
        return
    }

    if (!data.rcc) {
        context.addIssue({
            code: "custom",
            path: ["rcc"],
            message: "Le RCC est obligatoire pour ce rôle.",
        })
    }

    if (!data.gln) {
        context.addIssue({
            code: "custom",
            path: ["gln"],
            message: "Le GLN est obligatoire pour ce rôle.",
        })
    }
}


export const loginFormSchema = z.object({
        email: z.email(),
        password: requiredString(),
})

export const forgotPasswordFormSchema = z.object({
    email: z.email({ message: "Adresse email invalide." }),
})

export const resetPasswordFormSchema = z.object({
    password: z.string().min(8, {
        message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
    passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["passwordConfirmation"],
})

export const signupFormSchema = z.object({
    firstname: requiredString(),
    lastname: requiredString(),
    email: z.email({ message: "Adresse email invalide." })
        .max(180, { message: "180 caractères maximum." }),
    password: z.string().min(8, {
        message: "Le mot de passe doit contenir au moins 8 caractères.",
    }),
    passwordConfirmation: z.string(),
    role: z.enum(["ROLE_NURSE", "ROLE_PHYSIO", "ROLE_PRINCIPAL"], {
        error: "Choisissez votre profession.",
    }),
    organizationName: optionalString(),
    rcc: requiredRCC,
    gln: requiredGLN,
    mobile: optionalString(12),
    phone: optionalString(12),
    address: requiredString(),
    postCode: requiredNPA,
    city: requiredString(),
    country: requiredString(),
    isOptin: z.boolean(),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["passwordConfirmation"],
})

export const serviceFormSchema = z.object({
        name: requiredString(),
        family: requiredString(),
        category: requiredString(1,1),
        opas: requiredString(),
        duration: requiredNumber,
        actNumber: requiredNumber
})

export const insuranceFormSchema = z.object({
    name: requiredString(),
    organization: optionalString(),
    category: z.enum(enumKeysToArray(InsuranceCategory), { error: "Choix obligatoire" }),
    address: optionalString(),
    additionalAddress: optionalString(),
    npa: optionalString(),
    city: optionalString(),
    phone: optionalString(),
    email: optionalEmail,
    website: optionalString(),
    gln: requiredGLN,
})

export const userFormSchema = z.object({
    email: z.email(),
    password: z.string().optional().or(z.literal('')),
    firstname: requiredString(),
    lastname: optionalString(),
    organizationName: optionalString(),
    roles: z.array(z.string()).optional(),
    isActive: z.boolean(),
    isApproved: z.boolean(),
    isOptin: z.boolean(),
    rcc: z.string().regex(/^[a-zA-Z]\d{6}$/, 'Doit contenir 1 lettre suivie de 6 chiffres').optional().or(z.literal('')),
    gln: z.string().regex(/^\d{13}$/, 'Doit contenir 13 chiffres').optional().or(z.literal('')),
    mobile: optionalString(),
    phone: optionalString(),
    fax: optionalString(),
    address: optionalString(),
    postCode: optionalString(),
    city: optionalString(),
    country: optionalString(),
    principalCategory: z.enum(enumKeysToArray(PrincipalCategories)).optional().or(z.literal('')),
    principalCanton: z.enum(enumKeysToArray(Cantons)).optional().or(z.literal('')),
}).superRefine(validateProfessionalIdentifiers)

export const profileFormSchema = z.object({
    firstname: requiredString(),
    lastname: optionalString(),
    email: z.email(),
    organizationName: optionalString(),
    rcc: z.string().regex(/^[a-zA-Z]\d{6}$/, 'Doit contenir 1 lettre suivie de 6 chiffres').optional().or(z.literal('')),
    gln: z.string().regex(/^\d{13}$/, 'Doit contenir 13 chiffres').optional().or(z.literal('')),
    mobile: optionalString(),
    phone: optionalString(),
    fax: optionalString(),
    address: requiredString(),
    postCode: optionalString(),
    city: optionalString(),
    country: requiredString(),
    roles: z.array(z.string()).optional(),
}).superRefine(validateProfessionalIdentifiers)

export const principalFormSchema = z.object({
    name: requiredString(),
    isActive: z.boolean(),
    category: z.enum(enumKeysToArray(PrincipalCategories), { error: "Choix obligatoire" }),
    furtherInformations: optionalString(),
    phone: optionalString(),
    fax: optionalString(),
    mobile: optionalString(),
    email: optionalEmail,
    npa: requiredNPA,
    city: requiredString(),
    canton: requiredCanton,
    address: requiredString(),
    additionalAddress: optionalString(),
    rcc: requiredRCC,
    gln: requiredGLN
})

export const patientFormSchema = z.object({
    firstname: requiredString(),
    lastname: requiredString(),
    gender:  z.enum(enumKeysToArray(Gender), { error: "Choix obligatoire" }),
    birthDate: z.coerce.date({error: "Champ obligatoire."}),
    phone: optionalString(),
    mobile: optionalString(),
    canton: requiredCanton,
    npa: requiredNPA,
    city: requiredString(),
    address: requiredString(),
    additionalAddress: optionalString(),
    email: optionalEmail,
    avsNumber: requiredAvsNumber,
    insuranceNumber: requiredInsuranceNumber,
    insurance: optionalString(),
    principal: optionalString()
})

export const missionFormSchema = z.object({
    patient: requiredString(),
    principal: requiredString(),
    insurance: requiredString(),
    beginDate: z.coerce.date({error: "Champ obligatoire."}),
    endDate: z.coerce.date({error: "Champ obligatoire."}),
    description: requiredString(),
    status: z.enum(enumKeysToArray(MissionStatus), { error: "Choix obligatoire" }),
    owners: z.array(z.string()).optional(),
})

const optionalMeasuredNumber = z.preprocess(
    (value) => value === "" || value === null || value === undefined ? undefined : Number(value),
    z.number().positive("La valeur doit être supérieure à zéro.").optional(),
)

export const observationFormSchema = z.object({
    type: z.enum(enumKeysToArray(ObservationType), { error: "Choix obligatoire" }),
    observedAt: z.string().min(1, "La date et l’heure sont obligatoires."),
    value: optionalMeasuredNumber,
    systolic: optionalMeasuredNumber,
    diastolic: optionalMeasuredNumber,
    content: z.string().max(5000, "5000 caractères maximum.").optional(),
}).superRefine((data, context) => {
    if (data.type === ObservationType.TEXT && !data.content?.trim()) {
        context.addIssue({
            code: "custom",
            path: ["content"],
            message: "Le texte de l’observation est obligatoire.",
        })
    }

    if (data.type === ObservationType.BLOOD_PRESSURE) {
        if (!data.systolic) {
            context.addIssue({
                code: "custom",
                path: ["systolic"],
                message: "La pression systolique est obligatoire.",
            })
        }
        if (!data.diastolic) {
            context.addIssue({
                code: "custom",
                path: ["diastolic"],
                message: "La pression diastolique est obligatoire.",
            })
        }
    }

    if (![ObservationType.TEXT, ObservationType.BLOOD_PRESSURE].includes(data.type) && !data.value) {
        context.addIssue({
            code: "custom",
            path: ["value"],
            message: "La valeur mesurée est obligatoire.",
        })
    }
})

export const prescriptionServicesFormSchema = z.array(z.object({
            "@id": z.string(),
            "@type": z.string(),
            id: z.number(),
            uuid: z.string(),
            name: z.string(),
            family: z.string(),
            category: z.string(),
            duration: z.number(),
            description: z.string(),
            opas: z.string(),
            actNumber: z.number(),
            active: z.boolean(),
            periodicity: z.string(),
            frequency:  z.number(),
            cooperator: z.object({
                "@id": z.string(),
                uuid: z.string().optional(),
                firstname: z.string().optional(),
                lastname: z.string().optional(),
            }).optional(),
        }))

export const prescriptionFormSchema = z.object({
    mission: requiredString(),
    patient: optionalString(),
    status: z.enum(enumKeysToArray(PrescriptionStatus), { error: "Choix obligatoire" }),
    category: requiredString(),
    beginDate: z.coerce.date({error: "Champ obligatoire."}),
    endDate: z.coerce.date({error: "Champ obligatoire."}),
    content: z.object({
        type: z.enum(['prescription', 'revaluation','complementary'], { error: "Choix obligatoire" }) ,
            case: z.enum(['disease', 'accident','invalidity'], { error: "Choix obligatoire" }),
            diagnosticDoctor: requiredString(),
            diagnosticNurse: requiredString(),
            disability: z.enum(['yes', 'no'], { error: "Choix obligatoire" }),
            services : prescriptionServicesFormSchema,
        }
    ),
})

export const eventFormSchema = z.object({
    title: requiredString(),
    periodicity: requiredString(),
    frequency: requiredNumber,
    description: optionalString(),
    mission: optionalString(),
    beginDate: z.coerce.date({error: "Champ obligatoire."}),
    endDate: z.coerce.date({error: "Champ obligatoire."}),
    duration: z.coerce.number(),
    isAllday: z.boolean(),
    days: z.array(z.string()).optional(),
    recurrenceRule: z.object().optional(),
    services: prescriptionServicesFormSchema,

    // recurrenceRule: z.object({
    //     freq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    //     interval: z.number().min(1).optional(),
    //     byDay: z.array(z.enum(['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'])).optional(),
    //     byMonth: z.array(z.number().min(1).max(12)).optional(),
    //     byMonthDay: z.array(z.number().min(1).max(31)).optional(),
    //     byYearDay: z.array(z.number().min(1).max(366)).optional(),
    //     until: z.coerce.date().optional(),
    // })
})

export const eventFormSchemaArray = z.object(
    {
        events: z.array(eventFormSchema),
    }
);

export const fileFormSchema = z.object({
    file: z.instanceof(File, { message: "Fichier obligatoire." }),
})
