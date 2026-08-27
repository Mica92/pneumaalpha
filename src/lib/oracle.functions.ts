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

type MatchResult = {
  philosopher: PhilosopherId;
  reason: string;
};

function buildCatalog(lang: "es" | "en"): string {
  return Object.values(PHILOSOPHERS)
    .map((p) => {
      const sub = p.subtitle[lang];
      const blurb = p.blurb[lang];
      return `- id: ${p.id} | ${p.name} — ${sub}. ${blurb}`;
    })
    .join("\n");
}

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
        ? `Eres un curador silencioso de Pneuma Alpha. Tu tarea: leer la inquietud, pregunta o frase del usuario y elegir, de un catálogo cerrado de mentes filosóficas y científicas, la ÚNICA voz mejor preparada para responderle con profundidad. Considera el tema, el tono emocional, la naturaleza de la pregunta (existencial, ética, racional, política, científica, estética, espiritual) y el temperamento de cada pensador. No expliques la app. No saludes. Responde SIEMPRE en JSON estricto.`
        : `You are a silent curator at Pneuma Alpha. Your task: read the user's concern, question, or phrase and choose, from a closed catalog of philosophical and scientific minds, the SINGLE voice best prepared to answer with depth. Consider topic, emotional tone, nature of the question (existential, ethical, rational, political, scientific, aesthetic, spiritual) and each thinker's temperament. Do not explain the app. Do not greet. ALWAYS reply in strict JSON.`;

    const prompt =
      lang === "es"
        ? `Catálogo de voces disponibles (id | nombre — descripción):
${catalog}

Inquietud del usuario:
"""
${data.inquiry}
"""

Devuelve EXCLUSIVAMENTE un JSON con esta forma exacta, sin texto adicional, sin markdown, sin backticks:
{"philosopher":"<uno de: ${ids}>","reason":"<2 a 3 frases en español, en segunda persona ('te conviene…'), explicando con calidez por qué esta voz es la indicada para esta inquietud. Sobrio, sin clichés. Sin nombrar a otros pensadores del catálogo.>"}`
        : `Catalog of available voices (id | name — description):
${catalog}

User's concern:
"""
${data.inquiry}
"""

Return ONLY a JSON object with this exact shape, no extra text, no markdown, no backticks:
{"philosopher":"<one of: ${ids}>","reason":"<2 to 3 sentences in English, addressing the user directly ('you might…'), warmly explaining why this voice fits this concern. Sober, no clichés. Do not name other thinkers from the catalog.>"}`;

    const toneLine = isToneId(data.tone)
      ? lang === "es"
        ? `\n\nRegistro preferido por la persona: ${getTone(data.tone).label.es} — ${getTone(data.tone).hint.es} Úsalo como criterio SECUNDARIO (el tema y la inquietud mandan) y escribe tu razón en ese registro.`
        : `\n\nThe person's preferred register: ${getTone(data.tone).label.en} — ${getTone(data.tone).hint.en} Use it as a SECONDARY criterion (topic and concern come first) and write your reason in that register.`
      : "";

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system,
      prompt: prompt + toneLine,
      temperature: 0.4,
    });

    // Robust JSON extraction (handles accidental code fences or surrounding text).
    let parsed: { philosopher?: string; reason?: string } | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          /* ignore */
        }
      }
    }

    const id =
      parsed?.philosopher && isPhilosopherId(parsed.philosopher) ? parsed.philosopher : "james"; // James as gentle fallback for general inquiries

    const reason =
      (parsed?.reason ?? "").toString().trim() ||
      (lang === "es"
        ? "Esta voz, por su temperamento y sus obsesiones, es la que mejor puede acompañarte ahora mismo."
        : "This voice, by temperament and lifelong concerns, is the one best suited to sit with you right now.");

    return { philosopher: id, reason };
  });
