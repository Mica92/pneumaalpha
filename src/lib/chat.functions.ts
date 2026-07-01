import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { buildSystemPrompt, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";
import { z } from "zod";

const PhilosopherSchema = z.enum(["heidegger", "schopenhauer", "james", "nietzsche", "marx", "bentham", "pohlenz", "einstein", "rationalism", "pascal", "kierkegaard", "yannaras", "levinas", "maimonides", "aquinas"]);
const LanguageSchema = z.enum(["es", "en"]).default("es");

const LoadSchema = z.object({ philosopher: PhilosopherSchema });
const SendSchema = z.object({
  philosopher: PhilosopherSchema,
  messages: z.array(z.any()),
  language: LanguageSchema.optional(),
});
const ClearSchema = z.object({ philosopher: PhilosopherSchema });
const MigrateSchema = z.object({
  from: PhilosopherSchema,
  to: PhilosopherSchema,
  mode: z.enum(["full", "questions"]).default("full"),
});



export const loadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => LoadSchema.parse(input))
  .handler(async ({ data, context }) => {
    // The full conversation history is preserved server-side for internal memory.
    // On screen we only surface the most recent exchanges — a quiet, recent slice.
    const RECENT_LIMIT = 12;
    const { supabase, userId } = context;
    const { data: rows } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .eq("philosopher", data.philosopher)
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT);

    const recent = (rows ?? []).slice().reverse();
    return recent.map((r) => ({
      id: r.id as string,
      role: r.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: r.content as string }],
    }));
  });

export const loadFullHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => LoadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("user_id", userId)
      .eq("philosopher", data.philosopher)
      .order("created_at", { ascending: true });

    return (rows ?? []).map((r) => ({
      id: r.id as string,
      role: r.role as "user" | "assistant",
      content: r.content as string,
      created_at: r.created_at as string,
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
    let lastUserText = "";
    if (last?.role === "user") {
      lastUserText = last.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("\n")
        .trim();
      if (lastUserText) {
        await supabase.from("messages").insert({
          user_id: userId,
          role: "user",
          content: lastUserText,
          philosopher,
        });
      }
    }

    // Retrieval-augmented context (currently indexed: aquinas).
    let ragContext = "";
    if (lastUserText) {
      try {
        const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
          body: JSON.stringify({
            model: "openai/text-embedding-3-small",
            input: lastUserText,
            dimensions: 1536,
          }),
        });
        if (embedRes.ok) {
          const embedJson = (await embedRes.json()) as { data: { embedding: number[] }[] };
          const vector = embedJson.data[0]?.embedding;
          if (vector) {
            const { data: hits } = await supabase.rpc("match_philosopher_sources", {
              query_embedding: `[${vector.join(",")}]`,
              target_philosopher: philosopher,
              match_count: 5,
            });
            const rows = (hits ?? []) as Array<{
              work: string;
              reference: string;
              content: string;
              similarity: number;
            }>;
            const relevant = rows.filter((r) => r.similarity > 0.35);
            if (relevant.length > 0) {
              ragContext =
                "\n\n[FUENTES INDEXADAS — cita textualmente cuando corresponda, indicando la referencia entre paréntesis]\n" +
                relevant
                  .map((r) => `• (${r.reference}) «${r.content}»`)
                  .join("\n");
            }
          }
        }
      } catch (e) {
        console.error("[sendChat rag] retrieval failed", e);
      }
    }

    const gateway = createLovableAiGatewayProvider(apiKey);
    const model = gateway("google/gemini-3-flash-preview");

    const modelMessages = await convertToModelMessages(messages);
    const baseSystem = buildSystemPrompt(philosopher, memoryLines, data.language ?? "es");
    const result = streamText({
      model,
      system: baseSystem + ragContext,
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

export const migrateConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => MigrateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.from === data.to) return { ok: true, copied: 0 };

    const { data: rows, error } = await supabase
      .from("messages")
      .select("role, content, created_at")
      .eq("user_id", userId)
      .eq("philosopher", data.from)
      .order("created_at", { ascending: true });
    if (error) throw error;

    const source = rows ?? [];
    const filtered = data.mode === "questions"
      ? source.filter((r) => r.role === "user")
      : source;
    if (filtered.length === 0) return { ok: true, copied: 0 };

    const payload = filtered.map((r) => ({
      user_id: userId,
      role: r.role as "user" | "assistant",
      content: r.content as string,
      philosopher: data.to,
    }));

    const { error: insertError } = await supabase.from("messages").insert(payload);
    if (insertError) throw insertError;
    return { ok: true, copied: payload.length };
  });

