import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { PODCAST_BOOKS } from "@/lib/podcast-books";

const InputSchema = z.object({
  bookId: z.enum(PODCAST_BOOKS.map((b) => b.id) as [string, ...string[]]),
  language: z.enum(["es", "en"]).default("es"),
});

export type PodcastEpisode = {
  bookId: string;
  title: string;
  script: string;
};

export const generateEpisode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }): Promise<PodcastEpisode> => {
    const { requireActivePlan } = await import("@/lib/entitlement.server");
    await requireActivePlan(context.supabase, context.userId);
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const book = PODCAST_BOOKS.find((b) => b.id === data.bookId)!;
    const es = data.language === "es";
    const title = es ? book.title.es : book.title.en;

    const system = es
      ? `Eres el guionista y voz de un podcast filosófico sobrio, íntimo y preciso. Hablas como una persona real frente a un micrófono: frases de longitud variable, pausas naturales, sin locución artificial. No usas clichés de podcast ("bienvenidos a un nuevo episodio"), ni emojis, ni markdown, ni encabezados, ni listas. No inventas citas literales. Nunca describes lo que vas a hacer: simplemente lo haces.`
      : `You are the writer and voice of a sober, intimate, precise philosophy podcast. You speak like a real person at a microphone: varied sentence length, natural pauses, no artificial announcer tone. No podcast clichés ("welcome to another episode"), no emojis, no markdown, no headings, no lists. You never invent literal quotations. You never describe what you are about to do: you just do it.`;

    const prompt = es
      ? `Escribe el guion hablado de un episodio de máximo 5 minutos (entre 680 y 760 palabras) sobre "${title}" de ${book.author} (${book.year}).

Estructura interna, sin títulos ni marcas visibles, fluyendo como habla continua:
1. Una entrada de dos o tres frases que instale la escena o la pregunta que abre el libro.
2. Qué ocurre en la obra, lo mínimo indispensable para sostener el análisis (sin spoilers gratuitos, pero sin evasiones).
3. El núcleo filosófico: dos o tres ideas trabajadas de verdad (${book.themes.map((t) => t.es).join(", ")}), con la tradición o el pensador con quien dialogan.
4. Una tensión u objeción: qué se le puede reprochar al libro o a su lectura habitual.
5. Un cierre breve que deje una pregunta al oyente.

Reglas: español neutro, tono contemplativo y adulto, sin adornos. Párrafos cortos separados por línea en blanco, pensados para ser leídos en voz alta. Devuelve solo el texto del guion.`
      : `Write the spoken script of an episode of at most 5 minutes (between 680 and 760 words) about "${title}" by ${book.author} (${book.year}).

Internal structure, with no visible titles or markers, flowing as continuous speech:
1. A two or three sentence opening that sets the scene or the question the book opens.
2. What happens in the work, only what is needed to sustain the analysis.
3. The philosophical core: two or three ideas genuinely worked through (${book.themes.map((t) => t.en).join(", ")}), naming the tradition or thinker they converse with.
4. A tension or objection: what can be held against the book or its usual reading.
5. A short closing that leaves the listener with a question.

Rules: sober, contemplative, adult tone, no ornament. Short paragraphs separated by a blank line, written to be read aloud. Return only the script text.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    const result = streamText({
      model: gateway("google/gemini-3-flash-preview"),
      system,
      prompt,
      temperature: 0.8,
    });

    const raw = await result.text;
    const script = raw
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/```$/i, "")
      .replace(/[*_#>]/g, "")
      .trim();

    return { bookId: book.id, title, script };
  });
