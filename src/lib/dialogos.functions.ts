import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { buildTraditionSystemPrompt, traditionById, type Tradition } from "@/lib/traditions";

const TraditionSchema = z
  .string()
  .refine((s) => traditionById(s) !== undefined, { message: "Tradición desconocida" });

const LangSchema = z.enum(["es", "en"]).default("es");

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

/* ── Modo 1: dialogar desde una tradición ─────────────────────────────────── */

const DialogarSchema = z.object({
  tradition: TraditionSchema,
  messages: z.array(ChatMessageSchema).max(40),
  language: LangSchema,
});

export const dialogar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DialogarSchema.parse(input))
  .handler(async ({ data }: { data: z.infer<typeof DialogarSchema> }): Promise<{ text: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const system = buildTraditionSystemPrompt(data.tradition, data.language);
    const messages = data.messages.map((m) => ({ role: m.role, content: m.content }));

    const { text } = await generateText({
      model,
      system,
      messages,
      temperature: 0.9,
    });
    return { text: text.trim() };
  });

/* ── Modo 2: contrastar dos o tres tradiciones ────────────────────────────── */

const ContrastarSchema = z.object({
  question: z.string().trim().min(3).max(800),
  traditions: z.array(TraditionSchema).min(2).max(3),
  language: LangSchema,
});

function contrastSystem(traditions: Tradition[], lang: "es" | "en"): string {
  const fichas = traditions
    .map(
      (t) =>
        `— ${t.name.es} (${t.name.en}): ${t.tagline.es} Conceptos: ${t.concepts.join("; ")}. Premisas: ${t.premises.join(" ")}`,
    )
    .join("\n");

  const rules =
    lang === "en"
      ? `You are a rigorous moderator. You compare the traditions below on a single question, without taking sides.
— First explain what each tradition understands by the central concept of the question.
— State what each one presupposes and what it considers relevant.
— Identify where they genuinely disagree and what argument each offers.
— Point out the difficulty or limit of each position.
— No mechanical tables: explain why two traditions can reach incompatible conclusions from different assumptions.
— Do not invent agreement; if meanings overlap, say so plainly.`
      : `Eres un moderador riguroso. Comparas las tradiciones de abajo sobre una sola pregunta, sin tomar partido.
— Primero explica qué entiende cada tradición por el concepto central de la pregunta.
— Señala qué presupone cada una y qué considera relevante.
— Identifica en qué discrepan de verdad y qué argumento ofrece cada una.
— Señala la dificultad o el límite de cada postura.
— Nada de tablas mecánicas: explica por qué dos tradiciones pueden llegar a conclusiones incompatibles desde supuestos distintos.
— No inventes acuerdos; si los significados se solapan, dilo con claridad.`;

  return `FICHAS:\n${fichas}\n\n${rules}\n\n${lang === "en" ? "Always reply in English." : "Responde siempre en español."}`;
}

export const contrastar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ContrastarSchema.parse(input))
  .handler(async ({ data }: { data: z.infer<typeof ContrastarSchema> }): Promise<{ text: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const traditions = data.traditions
      .map((id) => traditionById(id))
      .filter((t): t is Tradition => t !== undefined);

    const { text } = await generateText({
      model,
      system: contrastSystem(traditions, data.language),
      prompt: data.question,
      temperature: 0.5,
    });
    return { text: text.trim() };
  });

/* ── Modo 3: confrontar una tesis desde una tradición ─────────────────────── */

const ConfrontarSchema = z.object({
  thesis: z.string().trim().min(3).max(2000),
  tradition: TraditionSchema,
  language: LangSchema,
});

function confrontSystem(id: string, lang: "es" | "en"): string {
  const mode =
    lang === "en"
      ? `═══ CONFRONT MODE ═══
You will examine a thesis the person presents. Do not always oppose it: be honest and proportionate.
1) Restate the thesis precisely and point out ambiguous concepts.
2) Offer the strongest critique against it from your tradition.
3) Offer the strongest defence in its favour (from your tradition or the best version available).
4) Evaluate the disagreement clearly.
Do not become an automatic adversary or a flatterer.`
      : `═══ MODO CONFRONTAR ═══
Vas a examinar una tesis que te presenta la persona. No lleves siempre la contraria: sé honesto y proporcional.
1) Reformula la tesis con precisión y señala los conceptos ambiguos.
2) Ofrece la crítica más sólida contra la tesis desde tu tradición.
3) Ofrece la defensa más sólida a su favor (desde tu tradición o la mejor versión disponible).
4) Evalúa el desacuerdo con claridad.
No te conviertas en un adversario automático ni en un adulador.`;

  return `${buildTraditionSystemPrompt(id, lang)}\n\n${mode}`;
}

export const confrontar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ConfrontarSchema.parse(input))
  .handler(async ({ data }: { data: z.infer<typeof ConfrontarSchema> }): Promise<{ text: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const { text } = await generateText({
      model,
      system: confrontSystem(data.tradition, data.language),
      prompt: data.thesis,
      temperature: 0.7,
    });
    return { text: text.trim() };
  });
