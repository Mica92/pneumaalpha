import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import {
  MAX_SEATS,
  seatSystemPrompt,
  seatUserPrompt,
  synthesisPrompt,
  type RoundtableTurn,
} from "@/lib/roundtable.shared";

const IdSchema = z.enum(PHILOSOPHER_LIST.map((p) => p.id) as [string, ...string[]]);

const RoundSchema = z.object({
  topic: z.string().trim().min(3).max(1200),
  seats: z.array(IdSchema).min(2).max(MAX_SEATS),
  language: z.enum(["es", "en"]).default("es"),
  previous: z
    .array(z.object({ philosopher: IdSchema, text: z.string() }))
    .max(24)
    .default([]),
  synthesize: z.boolean().default(false),
});

export const runRoundtableRound = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RoundSchema.parse(input))
  .handler(async ({ data }): Promise<{ turns: RoundtableTurn[]; synthesis: string | null }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");
    const lang = data.language;

    const history = data.previous as RoundtableTurn[];
    const fresh: RoundtableTurn[] = [];

    if (data.synthesize) {
      const { system, prompt } = synthesisPrompt(data.topic, history, lang);
      const { text } = await generateText({ model, system, prompt, temperature: 0.5 });
      return { turns: [], synthesis: text.trim() };
    }

    for (const seat of data.seats as PhilosopherId[]) {
      const { text } = await generateText({
        model,
        system: seatSystemPrompt(seat, lang),
        prompt: seatUserPrompt(data.topic, [...history, ...fresh], lang),
        temperature: 0.9,
      });
      fresh.push({ philosopher: seat, text: text.trim() });
    }

    return { turns: fresh, synthesis: null };
  });
