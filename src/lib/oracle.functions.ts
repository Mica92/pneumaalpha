import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { PHILOSOPHERS, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";
import { getTone, isToneId } from "@/lib/tones";

const InputSchema = z.object({
  inquiry: z.string().trim().min(3).max(2000),
  language: z.enum(["es", "en"]).default("es"),
  tone: z.string().optional(),
});

export type OraclePerspective = {
  philosopher: PhilosopherId;
  angle: string;
};

export type MatchResult = {
  /** Interpretive reading of what the question seems to be about. */
  reading: string;
  /** Optional reframing: what is asked vs. what also seems at stake. */
  reframe: { asked: string; beneath: string } | null;
  /** 2-4 relevant perspectives, each with a one-line angle. */
  perspectives: OraclePerspective[];
  /** Why these perspectives were chosen. */
  why: string;
  /** A possible new understanding — not "the answer". */
  aha: string;
  /** Primary voice to continue with. */
  philosopher: PhilosopherId;
  /** Legacy field kept for compatibility: same as `why`. */
  reason: string;
};

function buildCatalog(lang: "es" | "en"): string {
  return Object.values(PHILOSOPHERS)
    .map((p) => `- id: ${p.id} | ${p.name} — ${p.subtitle[lang]}. ${p.blurb[lang]}`)
    .join("\n");
}

const RawSchema = z.object({
  reading: z.string().optional(),
  reframe: z
    .object({ asked: z.string().optional(), beneath: z.string().optional() })
    .nullable()
    .optional(),
  perspectives: z
    .array(z.object({ philosopher: z.string(), angle: z.string().optional() }))
    .optional(),
  why: z.string().optional(),
  aha: z.string().optional(),
  philosopher: z.string().optional(),
});

export const matchPhilosopher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<MatchResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const lang = data.language;
    const catalog = buildCatalog(lang);
    const ids = Object.keys(PHILOSOPHERS).join(", ");

    const system =
      lang === "es"
        ? `Eres el Oráculo de Pneum. Pneum no vende filosofía: ayuda a ganar claridad de pensamiento frente a preguntas, problemas y decisiones complejas. La filosofía aplicada es el motor, no el producto.
Tu tarea: leer lo que escribe la persona y devolverle comprensión, no consejos.
Reglas:
- Lenguaje interpretativo ("parece", "podría", "tu pregunta contiene"). Nunca diagnósticos psicológicos ni lenguaje clínico, terapéutico, de coaching o de bienestar.
- No saludes, no expliques la aplicación, no uses clichés ni markdown.
- Las perspectivas son miradas intelectuales, no "interlocutores".
- Responde SIEMPRE en JSON estricto.`
        : `You are Pneum's Oracle. Pneum does not sell philosophy: it helps people gain clarity of thought about hard questions, complex problems and decisions. Applied philosophy is the engine, not the product.
Your task: read what the person writes and give them understanding, not advice.
Rules:
- Interpretive language ("seems", "might", "your question contains"). Never psychological diagnoses, nor clinical, therapeutic, coaching or wellness language.
- No greetings, no explaining the app, no clichés, no markdown.
- Perspectives are intellectual angles, not "chat partners".
- ALWAYS reply in strict JSON.`;

    const shape =
      lang === "es"
        ? `{
  "reading": "<1 o 2 frases: qué parece estar realmente en juego en lo que escribió. Empieza con algo como 'Esto parece ser sobre…' o 'Tu pregunta parece ser menos sobre… y más sobre…'>",
  "reframe": <null si la pregunta es simple; si no: {"asked":"<la pregunta tal como la trae, entre comillas o reformulada en una línea>","beneath":"<la pregunta que también parece estar en juego, en una línea>"}>,
  "perspectives": [ { "philosopher": "<id del catálogo>", "angle": "<una línea: sobre qué ayuda a pensar esta mirada, sin biografía>" } ],
  "why": "<1 o 2 frases explicando el criterio: qué tensión contiene su pregunta y por eso estas miradas>",
  "aha": "<1 o 2 frases: una forma distinta de ver el asunto. No es la respuesta correcta, es una comprensión posible. Concreta, no aforística.>",
  "philosopher": "<id del catálogo: la mirada principal para seguir profundizando; debe ser una de las de perspectives>"
}`
        : `{
  "reading": "<1 or 2 sentences: what seems to really be at stake. Start with something like 'This seems to be about…' or 'Your question seems less about… and more about…'>",
  "reframe": <null if the question is simple; otherwise: {"asked":"<the question as brought, in one line>","beneath":"<the question that also seems at stake, in one line>"}>,
  "perspectives": [ { "philosopher": "<catalog id>", "angle": "<one line: what this angle helps think about, no biography>" } ],
  "why": "<1 or 2 sentences on the criterion: what tension the question contains and why these angles>",
  "aha": "<1 or 2 sentences: a different way of seeing it. Not the right answer, a possible understanding. Concrete, not aphoristic.>",
  "philosopher": "<catalog id: the main angle to go deeper with; must be one of perspectives>"
}`;

    const prompt =
      lang === "es"
        ? `Catálogo de perspectivas disponibles (id | nombre — descripción):
${catalog}

Lo que escribió la persona:
"""
${data.inquiry}
"""

Elige entre 2 y 4 perspectivas del catálogo (ids válidos: ${ids}), distintas entre sí y realmente pertinentes.
Devuelve EXCLUSIVAMENTE un JSON con esta forma exacta, sin texto adicional, sin markdown, sin backticks:
${shape}`
        : `Catalog of available perspectives (id | name — description):
${catalog}

What the person wrote:
"""
${data.inquiry}
"""

Choose between 2 and 4 perspectives from the catalog (valid ids: ${ids}), distinct and genuinely pertinent.
Return ONLY a JSON object with this exact shape, no extra text, no markdown, no backticks:
${shape}`;

    const toneLine = isToneId(data.tone)
      ? lang === "es"
        ? `\n\nRegistro preferido por la persona: ${getTone(data.tone).label.es} — ${getTone(data.tone).hint.es} Úsalo como criterio SECUNDARIO (el tema manda) y escribe los textos en ese registro.`
        : `\n\nThe person's preferred register: ${getTone(data.tone).label.en} — ${getTone(data.tone).hint.en} Use it as a SECONDARY criterion (topic comes first) and write the texts in that register.`
      : "";

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system,
      prompt: prompt + toneLine,
      temperature: 0.5,
    });

    let parsed: z.infer<typeof RawSchema> | null = null;
    const attempt = (raw: string) => {
      try {
        const result = RawSchema.safeParse(JSON.parse(raw));
        if (result.success) parsed = result.data;
      } catch {
        /* ignore */
      }
    };
    attempt(text);
    if (!parsed) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) attempt(match[0]);
    }

    const raw: z.infer<typeof RawSchema> = parsed ?? {};

    const perspectives: OraclePerspective[] = [];
    for (const p of raw.perspectives ?? []) {
      if (!isPhilosopherId(p.philosopher)) continue;
      if (perspectives.some((x) => x.philosopher === p.philosopher)) continue;
      perspectives.push({
        philosopher: p.philosopher,
        angle: (p.angle ?? "").trim() || PHILOSOPHERS[p.philosopher].subtitle[lang],
      });
      if (perspectives.length === 4) break;
    }

    const primary: PhilosopherId =
      raw.philosopher && isPhilosopherId(raw.philosopher)
        ? raw.philosopher
        : (perspectives[0]?.philosopher ?? "james");

    if (!perspectives.some((p) => p.philosopher === primary)) {
      perspectives.unshift({
        philosopher: primary,
        angle: PHILOSOPHERS[primary].subtitle[lang],
      });
    }

    const fallbackWhy =
      lang === "es"
        ? "Estas miradas trabajan las tensiones que aparecen en lo que escribiste."
        : "These angles work on the tensions that appear in what you wrote.";
    const fallbackReading =
      lang === "es"
        ? "Tu pregunta parece contener más de lo que dice a primera vista."
        : "Your question seems to contain more than it says at first glance.";

    const reframeAsked = raw.reframe?.asked?.trim();
    const reframeBeneath = raw.reframe?.beneath?.trim();

    const why = (raw.why ?? "").trim() || fallbackWhy;

    return {
      reading: (raw.reading ?? "").trim() || fallbackReading,
      reframe:
        reframeAsked && reframeBeneath ? { asked: reframeAsked, beneath: reframeBeneath } : null,
      perspectives: perspectives.slice(0, 4),
      why,
      aha: (raw.aha ?? "").trim(),
      philosopher: primary,
      reason: why,
    };
  });
