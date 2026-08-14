import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { PHILOSOPHERS, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";

const InputSchema = z.object({
  text: z.string().trim().min(3).max(6000),
  language: z.enum(["es", "en"]).default("es"),
});

export type InfluenceItem = { name: string; note: string };

export type AnalysisResult = {
  kind: string;
  thesis: string;
  reading: string[];
  concepts: { term: string; gloss: string }[];
  influences: {
    philosophical: InfluenceItem[];
    political: InfluenceItem[];
    literary: InfluenceItem[];
    religious: InfluenceItem[];
    scientific: InfluenceItem[];
    historical: InfluenceItem[];
  };
  lineage: { precursors: string[]; heirs: string[] };
  tensions: string[];
  questions: string[];
  voices: PhilosopherId[];
};

const EMPTY_INFLUENCES: AnalysisResult["influences"] = {
  philosophical: [],
  political: [],
  literary: [],
  religious: [],
  scientific: [],
  historical: [],
};

function asItems(raw: unknown): InfluenceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      if (typeof r === "string") return { name: r, note: "" };
      const o = r as { name?: unknown; note?: unknown };
      return { name: String(o?.name ?? "").trim(), note: String(o?.note ?? "").trim() };
    })
    .filter((i) => i.name.length > 0)
    .slice(0, 6);
}

function asStrings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => String(r ?? "").trim()).filter(Boolean).slice(0, 8);
}

export const analyzeText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const lang = data.language;
    const ids = Object.keys(PHILOSOPHERS).join(", ");
    const catalog = Object.values(PHILOSOPHERS)
      .map((p) => `${p.id} (${p.name})`)
      .join(", ");

    const system =
      lang === "es"
        ? `Eres un analista filosófico riguroso: filólogo, historiador de las ideas y crítico literario a la vez. Analizas textos, frases y conceptos con precisión histórica, sin inventar citas ni atribuciones. Cuando algo es incierto, lo marcas como probable. Escribes sobrio, denso, sin adornos ni clichés. Respondes SIEMPRE en JSON estricto.`
        : `You are a rigorous philosophical analyst: philologist, historian of ideas and literary critic at once. You analyze texts, phrases and concepts with historical precision, never inventing quotations or attributions. When something is uncertain, you mark it as probable. You write soberly, densely, without ornament. You ALWAYS reply in strict JSON.`;

    const prompt =
      lang === "es"
        ? `Analiza en profundidad el siguiente material (puede ser un texto, una frase, una cita o un concepto):
"""
${data.text}
"""

Devuelve EXCLUSIVAMENTE un JSON con esta forma exacta, sin markdown ni backticks:
{
 "kind": "<una de: frase | cita | texto | concepto | argumento>",
 "thesis": "<1 frase: qué afirma o pone en juego el material>",
 "reading": ["<3 a 4 párrafos de análisis: sentido literal, sentido filosófico, supuestos implícitos, contexto histórico y uso del lenguaje. Cada elemento del arreglo es un párrafo de 3 a 5 frases.>"],
 "concepts": [{"term":"<concepto clave>","gloss":"<1-2 frases: qué significa técnicamente y en qué tradición>"}],
 "influences": {
   "philosophical": [{"name":"<autor o corriente>","note":"<cómo influye o resuena aquí, 1 frase>"}],
   "political": [{"name":"<ideología, régimen o corriente política>","note":"<1 frase>"}],
   "literary": [{"name":"<autor, obra o género>","note":"<1 frase>"}],
   "religious": [{"name":"<tradición espiritual o teológica>","note":"<1 frase>"}],
   "scientific": [{"name":"<disciplina, teoría o paradigma>","note":"<1 frase>"}],
   "historical": [{"name":"<época, hecho o proceso histórico>","note":"<1 frase>"}]
 },
 "lineage": {"precursors": ["<quién lo anticipa>"], "heirs": ["<quién lo hereda o radicaliza>"]},
 "tensions": ["<objeciones, contradicciones o puntos ciegos, 1 frase cada uno>"],
 "questions": ["<3 preguntas para seguir pensando>"],
 "voices": ["<hasta 3 ids de: ${ids}>"]
}

Reglas: si una categoría de influencia no aplica, devuelve un arreglo vacío en vez de forzarla. Entre 1 y 4 elementos por categoría cuando aplique. Los ids de "voices" deben pertenecer al catálogo: ${catalog}. Todo el contenido en español.`
        : `Deeply analyze the following material (it may be a text, a phrase, a quotation or a concept):
"""
${data.text}
"""

Return ONLY a JSON object with this exact shape, no markdown, no backticks:
{
 "kind": "<one of: phrase | quotation | text | concept | argument>",
 "thesis": "<1 sentence: what the material claims or puts at stake>",
 "reading": ["<3 to 4 analytical paragraphs: literal sense, philosophical sense, implicit assumptions, historical context and use of language. Each array item is a paragraph of 3 to 5 sentences.>"],
 "concepts": [{"term":"<key concept>","gloss":"<1-2 sentences: technical meaning and tradition>"}],
 "influences": {
   "philosophical": [{"name":"<author or current>","note":"<how it influences or resonates here, 1 sentence>"}],
   "political": [{"name":"<ideology, regime or political current>","note":"<1 sentence>"}],
   "literary": [{"name":"<author, work or genre>","note":"<1 sentence>"}],
   "religious": [{"name":"<spiritual or theological tradition>","note":"<1 sentence>"}],
   "scientific": [{"name":"<discipline, theory or paradigm>","note":"<1 sentence>"}],
   "historical": [{"name":"<era, event or historical process>","note":"<1 sentence>"}]
 },
 "lineage": {"precursors": ["<who anticipates it>"], "heirs": ["<who inherits or radicalizes it>"]},
 "tensions": ["<objections, contradictions or blind spots, 1 sentence each>"],
 "questions": ["<3 questions to keep thinking>"],
 "voices": ["<up to 3 ids from: ${ids}>"]
}

Rules: if an influence category does not apply, return an empty array instead of forcing it. Between 1 and 4 items per category when it applies. "voices" ids must belong to the catalog: ${catalog}. All content in English.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system,
      prompt,
      temperature: 0.5,
    });
    const text = await result.text;

    let parsed: Record<string, unknown> | null = null;
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
    if (!parsed) throw new Error("analysis_parse_failed");

    const inf = (parsed.influences ?? {}) as Record<string, unknown>;
    const lineage = (parsed.lineage ?? {}) as Record<string, unknown>;

    return {
      kind: String(parsed.kind ?? "").trim() || (lang === "es" ? "texto" : "text"),
      thesis: String(parsed.thesis ?? "").trim(),
      reading: asStrings(parsed.reading),
      concepts: Array.isArray(parsed.concepts)
        ? (parsed.concepts as unknown[])
            .map((c) => {
              const o = c as { term?: unknown; gloss?: unknown };
              return { term: String(o?.term ?? "").trim(), gloss: String(o?.gloss ?? "").trim() };
            })
            .filter((c) => c.term)
            .slice(0, 8)
        : [],
      influences: {
        ...EMPTY_INFLUENCES,
        philosophical: asItems(inf.philosophical),
        political: asItems(inf.political),
        literary: asItems(inf.literary),
        religious: asItems(inf.religious),
        scientific: asItems(inf.scientific),
        historical: asItems(inf.historical),
      },
      lineage: {
        precursors: asStrings(lineage.precursors),
        heirs: asStrings(lineage.heirs),
      },
      tensions: asStrings(parsed.tensions),
      questions: asStrings(parsed.questions),
      voices: asStrings(parsed.voices).filter(isPhilosopherId).slice(0, 3),
    };
  });
