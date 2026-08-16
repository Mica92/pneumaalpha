import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { SOCRATIC_SUMMARY, SOCRATIC_SYSTEM } from "@/lib/socratic.shared";

const TurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().max(4000),
});

const AskSchema = z.object({
  turns: z.array(TurnSchema).min(1).max(40),
  language: z.enum(["es", "en"]).default("es"),
  summarize: z.boolean().default(false),
});

export const socraticReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => AskSchema.parse(input))
  .handler(async ({ data }): Promise<{ text: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");
    const lang = data.language;

    const system = data.summarize
      ? `${SOCRATIC_SYSTEM[lang]}\n\n${SOCRATIC_SUMMARY[lang]}`
      : SOCRATIC_SYSTEM[lang];

    const { text } = await generateText({
      model,
      system,
      messages: data.turns.map((t) => ({
        role: t.role,
        content: t.text,
      })),
      temperature: data.summarize ? 0.5 : 0.85,
    });

    return { text: text.trim() };
  });
