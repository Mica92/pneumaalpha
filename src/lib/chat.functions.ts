import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { buildSystemPrompt, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";
import { z } from "zod";

const PhilosopherSchema = z.enum(["heidegger", "schopenhauer", "james", "nietzsche", "marx"]);
const LanguageSchema = z.enum(["es", "en"]).default("es");

const LoadSchema = z.object({ philosopher: PhilosopherSchema });
const SendSchema = z.object({
  philosopher: PhilosopherSchema,
  messages: z.array(z.any()),
  language: LanguageSchema.optional(),
});
const ClearSchema = z.object({ philosopher: PhilosopherSchema });


export const loadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => LoadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .eq("philosopher", data.philosopher)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((m) => ({
      id: m.id as string,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content as string }],
    }));
  });

export const sendChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const philosopher: PhilosopherId = isPhilosopherId(data.philosopher)
      ? data.philosopher
      : "heidegger";
    const messages = data.messages as UIMessage[];

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    const { data: mem } = await supabase
      .from("user_memory")
      .select("content")
      .eq("user_id", userId)
      .eq("philosopher", philosopher)
      .order("created_at", { ascending: false })
      .limit(40);
    const memoryLines = (mem ?? []).map((r) => r.content as string);

    const last = messages[messages.length - 1];
    if (last?.role === "user") {
      const lastText = last.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("\n")
        .trim();
      if (lastText) {
        await supabase.from("messages").insert({
          user_id: userId,
          role: "user",
          content: lastText,
          philosopher,
        });
      }
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model,
      system: buildSystemPrompt(philosopher, memoryLines),
      messages: modelMessages,
      temperature: 0.95,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ responseMessage }) => {
        try {
          const text = responseMessage.parts
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("")
            .trim();
          if (text) {
            await supabase.from("messages").insert({
              user_id: userId,
              role: "assistant",
              content: text,
              philosopher,
            });
          }
        } catch (e) {
          console.error("[sendChat onFinish] persist failed", e);
        }
      },
    });
  });

export const clearConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ClearSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase
      .from("messages")
      .delete()
      .eq("user_id", userId)
      .eq("philosopher", data.philosopher);
    return { ok: true };
  });
