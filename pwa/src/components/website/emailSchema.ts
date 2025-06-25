import { z } from "zod";

export const FormDataSchema = z.object({
  name: z.string().min(2, {
    message: "Champ obligatoire",
  }),
  email: z.string().email({
    message: "Adresse email invalide",
  }),
  who: z.string().min(2, {
    message: "Choix obligatoire",
  }),
  phone: z
    .string()
    .regex(/^\+?[0-9\s().-]{6,}$/, {
      message: "Numéro de téléphone invalide",
    })
    .optional(),
  message: z.string().optional(),
});
