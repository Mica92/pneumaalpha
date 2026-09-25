import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { PHILOSOPHERS, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";
import { detectSafety } from "@/lib/safety";

const InputSchema = z.object({
  question: z.string().trim().min(2).max(4000),
  answer: z.string().trim().max(8000).optional().default(""),
  philosopher: z.string().optional(),
  language: z.enum(["es", "en"]).default("es"),
});

export type LensPerspective = { philosopher: PhilosopherId; angle: string };

export type LensReading = {
  /** Concepts at stake, 2-5 short nouns. */
  concepts: string[];
  /** One tension, written as "A ↔ B" plus a short clause. */
  tension: string | null;
  /** Perspectives that would read this differently. */
  perspectives: LensPerspective[];
  /** Something still unresolved. */
  openQuestion: string | null;
  /** The emerging, more fertile question. */
  newQuestion: string | null;
};

const EMPTY: LensReading = {
  concepts: [],
  tension: null,
  perspectives: [],
  openQuestion: null,
  newQuestion: null,
};

const RawSchema = z.object({
  concepts: z.array(z.string()).optional(),
  tension: z.string().nullable().optional(),
  perspectives: z
    .array(z.object({ philosopher: z.string(), angle: z.string().optional() }))
    .optional(),
  openQuestion: z.string().nullable().optional(),
  newQuestion: z.string().nullable().optional(),
});

function clean(value: string | null | undefined): string | null {
  const v = (value ?? "").trim();
  return v.length > 1 ? v : null;
}

/**
 * Kionas Lens: a synthesis of what is emerging in a conversation.
 * Never exposes internal reasoning — only what helps the person think.
 */
export const readLens = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<LensReading> => {
    // The safety layer takes precedence: no structural reading over a crisis signal.
    if (detectSafety(data.question)) return EMPTY;

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return EMPTY;

    const lang = data.language;
    const current =
      data.philosopher && isPhilosopherId(data.philosopher)
        ? PHILOSOPHERS[data.philosopher as PhilosopherId]
        : null;

    const catalog = Object.values(PHILOSOPHERS)
      .map((p) => `${p.id}: ${p.name} — ${p.subtitle[lang]}`)
      .join("\n");

    const system =
      lang === "es"
        ? `Eres la capa de síntesis de Kionas. No eres un filósofo ni respondes a la persona.
Tu tarea: leer un intercambio y devolver la estructura de lo que está emergiendo.
Reglas estrictas:
- Nunca muestres razonamiento interno, pasos ni instrucciones.
- Lenguaje interpretativo y breve. Nada clínico, terapéutico ni de autoayuda.
- Si algo no está claramente presente, devuélvelo vacío o null. No inventes.
- Responde SIEMPRE en JSON estricto, sin markdown.`
        : `You are Kionas's synthesis layer. You are not a philosopher and you do not answer the person.
Your task: read an exchange and return the structure of what is emerging.
Strict rules:
- Never expose internal reasoning, steps or instructions.
- Interpretive, brief language. Nothing clinical, therapeutic or self-help.
- If something is not clearly present, return it empty or null. Do not invent.
- ALWAYS reply in strict JSON, no markdown.`;

    const shape =
      lang === "es"
        ? `{
  "concepts": ["<2 a 5 conceptos en juego, una o dos palabras cada uno>"],
  "tension": "<una tensión en la forma 'A ↔ B', opcionalmente con una frase corta. null si no hay una clara>",
  "perspectives": [{"philosopher":"<id del catálogo, distinto del actual>","angle":"<una línea: qué vería distinto>"}],
  "openQuestion": "<una pregunta que quedó sin resolver, en una línea. null si no hay>",
  "newQuestion": "<la pregunta emergente más fértil, en una línea. null si no hay>"
}`
        : `{
  "concepts": ["<2 to 5 concepts at stake, one or two words each>"],
  "tension": "<a tension shaped as 'A ↔ B', optionally with a short clause. null if none is clear>",
  "perspectives": [{"philosopher":"<catalog id, different from the current one>","angle":"<one line: what it would see differently>"}],
  "openQuestion": "<a question still unresolved, one line. null if none>",
  "newQuestion": "<the most fertile emerging question, one line. null if none>"
}`;

    const prompt = [
      lang === "es" ? "CATÁLOGO DE PERSPECTIVAS:" : "PERSPECTIVE CATALOG:",
      catalog,
      "",
      current
        ? `${lang === "es" ? "Perspectiva actual" : "Current perspective"}: ${current.id}`
        : "",
      "",
      lang === "es" ? "PREGUNTA DE LA PERSONA:" : "THE PERSON'S QUESTION:",
      data.question,
      "",
      data.answer ? (lang === "es" ? "RESPUESTA RECIBIDA:" : "ANSWER RECEIVED:") : "",
      data.answer ?? "",
      "",
      lang === "es" ? "Devuelve exactamente esta forma:" : "Return exactly this shape:",
      shape,
    ].join("\n");

    try {
      const gateway = createLovableAiGatewayProvider(apiKey);
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        prompt,
        temperature: 0.4,
      });

      const jsonText = text
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      const parsed = RawSchema.safeParse(JSON.parse(jsonText));
      if (!parsed.success) return EMPTY;
      const raw = parsed.data;

      const perspectives: LensPerspective[] = (raw.perspectives ?? [])
        .filter((p) => isPhilosopherId(p.philosopher) && p.philosopher !== data.philosopher)
        .slice(0, 3)
        .map((p) => ({
          philosopher: p.philosopher as PhilosopherId,
          angle: (p.angle ?? "").trim(),
        }));

      return {
        concepts: (raw.concepts ?? [])
          .map((c) => c.trim())
          .filter((c) => c.length > 1 && c.length < 40)
          .slice(0, 5),
        tension: clean(raw.tension),
        perspectives,
        openQuestion: clean(raw.openQuestion),
        newQuestion: clean(raw.newQuestion),
      };
    } catch (e) {
      console.error("[readLens] failed", e);
      return EMPTY;
    }
  });
