import { z } from "zod";

/** Reglas compartidas (cliente y servidor) para solicitudes institucionales. */
export const LEAD_MIN_FILL_MS = 3000;
export const LEAD_MAX_PER_HOUR = 5;
export const LEAD_MESSAGE_MAX = 2000;

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);

export const LeadSchema = z.object({
  fullName: trimmed(2, 120),
  email: z.string().trim().toLowerCase().max(200).email(),
  institution: trimmed(2, 200),
  jobTitle: trimmed(2, 120),
  country: trimmed(2, 80),
  message: z.string().trim().max(LEAD_MESSAGE_MAX).default(""),
  interest: z.enum(["demo", "pilot"]).default("demo"),
  language: z.enum(["es", "en"]).default("es"),
  sourcePath: z
    .string()
    .max(120)
    .regex(/^\/[a-z0-9\-/]*$/)
    .default("/contacto"),
  consent: z.literal(true),
  // Antispam: campo trampa que debe quedar vacío y tiempo mínimo de llenado.
  website: z.string().max(200).default(""),
  elapsedMs: z.number().int().min(0).max(86_400_000),
});

export type LeadInput = z.input<typeof LeadSchema>;
export type Lead = z.output<typeof LeadSchema>;

/** Un envío es sospechoso si rellenó el campo oculto o se completó demasiado rápido. */
export function looksAutomated(lead: Pick<Lead, "website" | "elapsedMs">): boolean {
  return lead.website.trim().length > 0 || lead.elapsedMs < LEAD_MIN_FILL_MS;
}

export type LeadField = "fullName" | "email" | "institution" | "jobTitle" | "country" | "message" | "consent";

/** Devuelve los campos inválidos para mostrar mensajes junto a cada uno. */
export function invalidLeadFields(input: unknown): LeadField[] {
  const result = LeadSchema.safeParse(input);
  if (result.success) return [];
  const fields = new Set<LeadField>();
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (
      key === "fullName" ||
      key === "email" ||
      key === "institution" ||
      key === "jobTitle" ||
      key === "country" ||
      key === "message" ||
      key === "consent"
    )
      fields.add(key);
  }
  return [...fields];
}
