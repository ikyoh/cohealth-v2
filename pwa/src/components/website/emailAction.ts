import { z } from "zod";
import { FormDataSchema } from "./emailSchema";

type ContactFormInputs = z.infer<typeof FormDataSchema>;

export async function sendEmail(data: ContactFormInputs) {
  const result = FormDataSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.format() };
  }

  const { name, email, who, phone, message } = result.data;

  return fetch("https://localhost/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      htmlContent: `
        <p>Bonjour</p>
        <p>Vous avez reçu un message de CoHealth</p>
        <p>De : ${name} (${email}) - ${who}</p>
        <p>Téléphone : ${phone || "Non fourni"}</p>
        <p>Message :</p>
        <p>${message || "Aucun message fourni."}</p>
      `,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur HTTP: " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      return { success: true, data };
    })
    .catch((error) => {
      console.error("Erreur:", error);
    });
}
