import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { buildSystemPrompt } from "@/lib/heidegger-prompt";
import { z } from "zod";

const MessageSchema = z.object({
  messages: z.array(z.any()),
});

// Load full conversation history for the current user (single perpetual dialogue).
export const loadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => ({
      id: m.id as string,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content as string }],
    }));
  });

export const loadMemory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_memory")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);
    return (data ?? []).map((r) => r.content as string);
  });

// Stream a Heidegger reply and persist both user message + assistant message.
export const sendChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => MessageSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const messages = data.messages as UIMessage[];

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY no está configurada.");

    // Load memory for system prompt
    const { data: mem } = await supabase
      .from("user_memory")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);
    const memoryLines = (mem ?? []).map((r) => r.content as string);

    // Persist the most recent user message (last item).
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
        });
      }
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const modelMessages = await convertToModelMessages(messages);
    const result = streamText({
      model,
      system: buildSystemPrompt(memoryLines),
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
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("messages").delete().eq("user_id", userId);
    return { ok: true };
  });
