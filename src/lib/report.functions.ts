import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { PHILOSOPHERS, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";

const InputSchema = z.object({
  language: z.enum(["es", "en"]).default("es"),
});

export type PsychReport = {
  generatedAt: string;
  messagesAnalyzed: number;
  // Qualitative scores 0-100
  scores: {
    reflection: number;
    lucidity: number;
    emotionalOpenness: number;
    intellectualCuriosity: number;
    discursiveDepth: number;
  };
  archetype: string; // e.g. "El buscador melancólico"
  summary: string; // 3-5 sentences, second person, warm
  writingStyle: string; // 1-2 sentences
  recurringThemes: string[];
  shadows: string[]; // blind spots / tensions
  strengths: string[];
  recommendations: {
    topics: string[];
    authors: string[];
    books: { title: string; author: string; why: string }[];
    ideas: string[];
    practices: string[];
    nextPhilosopher: PhilosopherId | null;
    nextPhilosopherReason: string;
  };
};

function buildCatalog(lang: "es" | "en"): string {
  return Object.values(PHILOSOPHERS)
    .map((p) => `- ${p.id}: ${p.name} — ${p.subtitle[lang]}`)
    .join("\n");
}

export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }): Promise<PsychReport> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const { supabase, userId } = context;
    const lang = data.language;

    // Pull the user's own utterances across all philosophers — these reveal voice, themes and depth.
    const { data: rows, error } = await supabase
      .from("messages")
      .select("content, philosopher, created_at, role")
      .eq("user_id", userId)
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(120);

    if (error) throw new Error(error.message);

    const messages = rows ?? [];
    if (messages.length < 3) {
      // Not enough signal — return a gentle empty profile.
      return {
        generatedAt: new Date().toISOString(),
        messagesAnalyzed: messages.length,
        scores: { reflection: 0, lucidity: 0, emotionalOpenness: 0, intellectualCuriosity: 0, discursiveDepth: 0 },
        archetype: lang === "es" ? "Aún en silencio" : "Still in silence",
        summary: lang === "es"
          ? "Todavía no hay suficientes conversaciones para leerte con honestidad. Conversa un poco más con cualquiera de las voces y vuelve cuando hayas dejado algunas huellas."
          : "There aren't enough conversations yet to read you honestly. Talk a little more with any of the voices and come back once you've left some traces.",
        writingStyle: "",
        recurringThemes: [],
        shadows: [],
        strengths: [],
        recommendations: {
          topics: [], authors: [], books: [], ideas: [], practices: [],
          nextPhilosopher: null, nextPhilosopherReason: "",
        },
      };
    }

    // Build a compact transcript — chronological, oldest first, capped per message.
    const transcript = messages
      .slice()
      .reverse()
      .map((m, i) => {
        const text = (m.content ?? "").toString().replace(/\s+/g, " ").trim().slice(0, 600);
        return `[${i + 1}] (${m.philosopher}) ${text}`;
      })
      .join("\n");

    const catalog = buildCatalog(lang);
    const ids = Object.keys(PHILOSOPHERS).join(", ");

    const system = lang === "es"
      ? `Eres un lector psicológico-filosófico de PneumaA. Te entrego transcripciones de lo que un usuario ha escrito a distintos pensadores. Tu tarea: trazar un retrato honesto, cálido pero no complaciente, que ayude a la persona a conocerse y crecer. No diagnosticas patologías. No usas jerga clínica. Hablas en segunda persona ("tú"/"te"). Sé concreto: cita patrones que se ven en su escritura, no generalidades. Responde SIEMPRE en JSON estricto.`
      : `You are a psychological-philosophical reader for PneumaA. You receive transcripts of what a user wrote to several thinkers. Your task: draw an honest, warm but non-flattering portrait that helps the person know themselves and grow. Do not diagnose pathologies. Avoid clinical jargon. Speak in second person ("you"). Be concrete: name patterns visible in their writing, not generalities. ALWAYS reply in strict JSON.`;

    const prompt = lang === "es"
      ? `Catálogo de voces disponibles para recomendar como próximo interlocutor:
${catalog}

Transcripción (mensajes del usuario, en orden cronológico):
"""
${transcript}
"""

Devuelve EXCLUSIVAMENTE JSON con esta forma exacta, sin markdown ni backticks:
{
  "scores": {
    "reflection": <0-100, capacidad de mirarse a sí mismo>,
    "lucidity": <0-100, claridad para nombrar lo que vive>,
    "emotionalOpenness": <0-100, disposición a mostrar afecto/vulnerabilidad>,
    "intellectualCuriosity": <0-100, hambre genuina de ideas>,
    "discursiveDepth": <0-100, profundidad y articulación del discurso>
  },
  "archetype": "<3-6 palabras, un arquetipo evocador y específico, no cliché>",
  "summary": "<4 a 6 frases, segunda persona, cálidas y honestas, basadas en patrones reales del texto>",
  "writingStyle": "<1-2 frases sobre cómo escribes: ritmo, léxico, longitud, recursos>",
  "recurringThemes": ["<4-6 temas concretos que reaparecen>"],
  "shadows": ["<2-4 puntos ciegos, evasiones o tensiones que se asoman, dicho con tacto>"],
  "strengths": ["<2-4 fortalezas reales que el texto revela>"],
  "recommendations": {
    "topics": ["<4-6 temas a explorar a continuación>"],
    "authors": ["<4-6 autores/pensadores, ojalá fuera del catálogo cuando ayude>"],
    "books": [
      {"title":"<título>","author":"<autor>","why":"<1 frase, por qué resuena con tu perfil>"}
    ],
    "ideas": ["<3-5 ideas o conceptos a meditar, formuladas brevemente>"],
    "practices": ["<3-5 prácticas concretas (escritura, caminar, leer X) acordes a tu perfil>"],
    "nextPhilosopher": "<uno de: ${ids}, o cadena vacía si ninguna voz del catálogo encaja>",
    "nextPhilosopherReason": "<1-2 frases en segunda persona, por qué esa voz ahora>"
  }
}
Incluye entre 3 y 5 libros. Sé específico y serio: nada de listas genéricas tipo "leer más".`
      : `Catalog of available voices to recommend as next interlocutor:
${catalog}

Transcript (user messages, chronological order):
"""
${transcript}
"""

Return ONLY JSON with this exact shape, no markdown, no backticks:
{
  "scores": {
    "reflection": <0-100>,
    "lucidity": <0-100>,
    "emotionalOpenness": <0-100>,
    "intellectualCuriosity": <0-100>,
    "discursiveDepth": <0-100>
  },
  "archetype": "<3-6 evocative, specific words>",
  "summary": "<4-6 sentences, second person, warm and honest, grounded in real patterns>",
  "writingStyle": "<1-2 sentences on cadence, lexicon, length, devices>",
  "recurringThemes": ["<4-6 concrete recurring themes>"],
  "shadows": ["<2-4 blind spots / evasions / tensions, said with tact>"],
  "strengths": ["<2-4 real strengths the text reveals>"],
  "recommendations": {
    "topics": ["<4-6 topics to explore next>"],
    "authors": ["<4-6 authors/thinkers, ideally outside the catalog when helpful>"],
    "books": [
      {"title":"<title>","author":"<author>","why":"<1 sentence>"}
    ],
    "ideas": ["<3-5 short ideas/concepts to sit with>"],
    "practices": ["<3-5 concrete practices fit for your profile>"],
    "nextPhilosopher": "<one of: ${ids}, or empty string if none fit>",
    "nextPhilosopherReason": "<1-2 sentences in second person>"
  }
}
Include between 3 and 5 books. Be specific and serious: no generic "read more" filler.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system,
      prompt,
      temperature: 0.6,
    });

    let parsed: any = null;
    try { parsed = JSON.parse(text); } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* ignore */ } }
    }
    if (!parsed || typeof parsed !== "object") {
      throw new Error("No se pudo interpretar el reporte.");
    }

    const clampScore = (v: unknown) => {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, Math.round(n)));
    };
    const asArr = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean) : [];
    const asBooks = (v: unknown) =>
      Array.isArray(v) ? v.map((b: any) => ({
        title: String(b?.title ?? "").trim(),
        author: String(b?.author ?? "").trim(),
        why: String(b?.why ?? "").trim(),
      })).filter((b) => b.title) : [];

    const nextRaw = parsed?.recommendations?.nextPhilosopher;
    const nextPhilosopher: PhilosopherId | null =
      typeof nextRaw === "string" && isPhilosopherId(nextRaw) ? nextRaw : null;

    return {
      generatedAt: new Date().toISOString(),
      messagesAnalyzed: messages.length,
      scores: {
        reflection: clampScore(parsed?.scores?.reflection),
        lucidity: clampScore(parsed?.scores?.lucidity),
        emotionalOpenness: clampScore(parsed?.scores?.emotionalOpenness),
        intellectualCuriosity: clampScore(parsed?.scores?.intellectualCuriosity),
        discursiveDepth: clampScore(parsed?.scores?.discursiveDepth),
      },
      archetype: String(parsed?.archetype ?? "").trim() || (lang === "es" ? "Buscador silencioso" : "Silent seeker"),
      summary: String(parsed?.summary ?? "").trim(),
      writingStyle: String(parsed?.writingStyle ?? "").trim(),
      recurringThemes: asArr(parsed?.recurringThemes).slice(0, 8),
      shadows: asArr(parsed?.shadows).slice(0, 6),
      strengths: asArr(parsed?.strengths).slice(0, 6),
      recommendations: {
        topics: asArr(parsed?.recommendations?.topics).slice(0, 8),
        authors: asArr(parsed?.recommendations?.authors).slice(0, 8),
        books: asBooks(parsed?.recommendations?.books).slice(0, 6),
        ideas: asArr(parsed?.recommendations?.ideas).slice(0, 6),
        practices: asArr(parsed?.recommendations?.practices).slice(0, 6),
        nextPhilosopher,
        nextPhilosopherReason: String(parsed?.recommendations?.nextPhilosopherReason ?? "").trim(),
      },
    };
  });
