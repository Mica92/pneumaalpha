import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import {
  PHILOSOPHERS,
  PHILOSOPHER_LIST,
  buildSystemPrompt,
  isPhilosopherId,
  type PhilosopherId,
} from "@/lib/philosophers";
import {
  answerCallbackQuery,
  deriveTelegramWebhookSecret,
  safeEqual,
  sendTelegramChatAction,
  sendTelegramMessage,
  telegramKeys,
  type InlineKeyboard,
} from "@/lib/telegram.server";

const FREE_PHILOSOPHERS: PhilosopherId[] = ["heidegger", "pohlenz"];
const HISTORY_LIMIT = 12;

type SupabaseAdmin = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

/** Teclado con todas las mentes, en dos columnas. */
function philosopherKeyboard(): InlineKeyboard {
  const rows: InlineKeyboard = [];
  for (let i = 0; i < PHILOSOPHER_LIST.length; i += 2) {
    rows.push(
      PHILOSOPHER_LIST.slice(i, i + 2).map((p) => ({
        text: `${p.glyph} ${p.name}`,
        callback_data: `con:${p.id}`,
      })),
    );
  }
  return rows;
}

const HELP = [
  "Pneuma Alpha en Telegram.",
  "",
  "/filosofos — elegir con quién conversar (botones)",
  "/oraculo <texto> — que el oráculo elija por ti",
  "/actual — ver con quién estás hablando",
  "/reiniciar — empezar un hilo nuevo",
  "/vincular <código> — unir este chat con tu cuenta de la web",
  "",
  "Después, escribe lo que quieras: te responde esa conciencia.",
].join("\n");

/** Marca el update como visto; devuelve false si ya fue procesado. */
async function claimUpdate(admin: SupabaseAdmin, updateId: number): Promise<boolean> {
  const { error } = await admin.from("telegram_updates").insert({ update_id: updateId });
  if (error) {
    if (error.code === "23505") return false;
    console.error("[telegram webhook] claim failed", error);
  }
  return true;
}

async function resolveLink(admin: SupabaseAdmin, chatId: number) {
  const { data } = await admin
    .from("telegram_links")
    .select("user_id, current_philosopher")
    .eq("chat_id", chatId)
    .maybeSingle();
  return data as { user_id: string; current_philosopher: string } | null;
}

async function handleLinkCommand(
  admin: SupabaseAdmin,
  chatId: number,
  rawCode: string,
): Promise<string> {
  const code = rawCode.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) {
    return "Escribe: /vincular 123456 — el código de 6 dígitos que aparece en la web.";
  }
  const { data: row } = await admin
    .from("telegram_link_codes")
    .select("id, user_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();

  if (!row || row.used_at || new Date(row.expires_at as string).getTime() < Date.now()) {
    return "Ese código no es válido o ya expiró. Genera uno nuevo en la web.";
  }

  await admin
    .from("telegram_links")
    .upsert({ chat_id: chatId, user_id: row.user_id as string }, { onConflict: "chat_id" });
  await admin
    .from("telegram_link_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", row.id as string);

  return (
    "Cuenta vinculada. Tus conversaciones aquí quedan guardadas junto a las de la web.\n\n" + HELP
  );
}

async function pickPhilosopher(prompt: string, apiKey: string): Promise<PhilosopherId> {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const ids = PHILOSOPHER_LIST.map((p) => `${p.id}: ${p.subtitle.es}`).join("\n");
  const { text } = await generateText({
    model: gateway("google/gemini-3-flash-preview"),
    system:
      "Eliges qué conciencia filosófica responde mejor a un texto. Responde SOLO con el identificador, sin nada más.\n" +
      ids,
    prompt,
  });
  const clean = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  return isPhilosopherId(clean) ? clean : "heidegger";
}

/** Cambia (o propone) la mente activa para este chat. */
async function selectPhilosopher(
  admin: SupabaseAdmin,
  chatId: number,
  wanted: PhilosopherId,
  link: { user_id: string } | null,
): Promise<void> {
  if (!link && !FREE_PHILOSOPHERS.includes(wanted)) {
    await sendTelegramMessage(
      chatId,
      "Para conversar con esa mente, vincula tu cuenta: genera un código en la web y escribe /vincular 123456.",
    );
    return;
  }
  if (link) {
    await admin
      .from("telegram_links")
      .update({ current_philosopher: wanted })
      .eq("chat_id", chatId);
  }
  await sendTelegramMessage(
    chatId,
    `${PHILOSOPHERS[wanted].glyph} ${PHILOSOPHERS[wanted].name}\n\n${PHILOSOPHERS[wanted].opening.es}`,
  );
}

async function answerAs(
  admin: SupabaseAdmin,
  philosopher: PhilosopherId,
  userId: string | null,
  text: string,
  apiKey: string,
): Promise<string> {
  const [historyRes, memoryRes] = await Promise.all([
    userId
      ? admin
          .from("messages")
          .select("role, content, created_at")
          .eq("user_id", userId)
          .eq("philosopher", philosopher)
          .order("created_at", { ascending: false })
          .limit(HISTORY_LIMIT)
      : Promise.resolve({ data: [] as any[] }),
    userId
      ? admin
          .from("user_memory")
          .select("content")
          .eq("user_id", userId)
          .eq("philosopher", philosopher)
          .order("created_at", { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const history = ((historyRes.data ?? []) as any[])
    .slice()
    .reverse()
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content as string }));
  const memoryLines = ((memoryRes.data ?? []) as any[]).map((r) => r.content as string);

  const gateway = createLovableAiGatewayProvider(apiKey);
  const { text: reply } = await generateText({
    model: gateway("google/gemini-3-flash-preview"),
    system: buildSystemPrompt(philosopher, memoryLines, "es"),
    messages: [...history, { role: "user", content: text }],
    temperature: 0.95,
  });

  if (userId) {
    await admin.from("messages").insert([
      { user_id: userId, role: "user", content: text, philosopher },
      { user_id: userId, role: "assistant", content: reply, philosopher },
    ]);
  }

  return reply;
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let telegramApiKey: string;
        let lovableApiKey: string;
        try {
          ({ telegramApiKey, lovableApiKey } = telegramKeys());
        } catch (e) {
          console.error("[telegram webhook] missing keys", e);
          return new Response("Not configured", { status: 503 });
        }

        const expected = deriveTelegramWebhookSecret(telegramApiKey);
        const actual = request.headers.get("X-Telegram-Bot-Api-Secret-Token") ?? "";
        if (!safeEqual(actual, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const update = (await request.json()) as Record<string, any>;
        const callback = update.callback_query;
        const message = update.message ?? update.edited_message ?? callback?.message;
        const chatId: number | undefined = message?.chat?.id;
        const text: string = (callback?.data ?? message?.text ?? "").trim();
        if (!chatId || !text || typeof update.update_id !== "number") {
          return Response.json({ ok: true, ignored: true });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as SupabaseAdmin;

        // Telegram reintenta si tardamos: no respondas dos veces al mismo update.
        if (!(await claimUpdate(admin, update.update_id))) {
          return Response.json({ ok: true, duplicate: true });
        }

        try {
          const link = await resolveLink(admin, chatId);

          if (callback) {
            await answerCallbackQuery(callback.id);
            const wanted = text.startsWith("con:") ? text.slice(4) : "";
            if (isPhilosopherId(wanted)) {
              await selectPhilosopher(admin, chatId, wanted, link);
            }
            return Response.json({ ok: true });
          }

          if (text.startsWith("/start") || text.startsWith("/ayuda") || text.startsWith("/help")) {
            const startParam = text.replace(/^\/start\s*/, "").trim();
            if (startParam && /^\d{6}$/.test(startParam)) {
              const reply = await handleLinkCommand(admin, chatId, startParam);
              await sendTelegramMessage(chatId, reply);
              return Response.json({ ok: true });
            }
            await sendTelegramMessage(chatId, HELP, philosopherKeyboard());
            return Response.json({ ok: true });
          }

          if (text.startsWith("/filosofos") || text.startsWith("/filósofos")) {
            await sendTelegramMessage(chatId, "Elige una conciencia:", philosopherKeyboard());
            return Response.json({ ok: true });
          }

          if (text.startsWith("/actual")) {
            const current = isPhilosopherId(link?.current_philosopher ?? "")
              ? (link!.current_philosopher as PhilosopherId)
              : "heidegger";
            await sendTelegramMessage(
              chatId,
              `Hablas con ${PHILOSOPHERS[current].glyph} ${PHILOSOPHERS[current].name}.`,
              philosopherKeyboard(),
            );
            return Response.json({ ok: true });
          }

          if (text.startsWith("/reiniciar")) {
            if (link) {
              await admin
                .from("telegram_links")
                .update({ current_philosopher: "heidegger" })
                .eq("chat_id", chatId);
            }
            await sendTelegramMessage(
              chatId,
              "Hilo reiniciado. Elige con quién seguir:",
              philosopherKeyboard(),
            );
            return Response.json({ ok: true });
          }

          if (text.startsWith("/vincular")) {
            const reply = await handleLinkCommand(admin, chatId, text.slice("/vincular".length));
            await sendTelegramMessage(chatId, reply);
            return Response.json({ ok: true });
          }

          if (text.startsWith("/con")) {
            const wanted = text.slice("/con".length).trim().toLowerCase();
            if (!isPhilosopherId(wanted)) {
              await sendTelegramMessage(chatId, "No conozco esa mente.", philosopherKeyboard());
              return Response.json({ ok: true });
            }
            await selectPhilosopher(admin, chatId, wanted, link);
            return Response.json({ ok: true });
          }

          if (text.startsWith("/")) {
            await sendTelegramMessage(chatId, "No conozco ese comando.\n\n" + HELP);
            return Response.json({ ok: true });
          }

          let philosopher: PhilosopherId = isPhilosopherId(link?.current_philosopher ?? "")
            ? (link!.current_philosopher as PhilosopherId)
            : "heidegger";
          let body = text;

          if (text.startsWith("/oraculo") || text.startsWith("/oráculo")) {
            body = text.replace(/^\/or[aá]culo/, "").trim();
            if (!body) {
              await sendTelegramMessage(
                chatId,
                "Escribe: /oraculo seguido de tu pregunta o frase.",
              );
              return Response.json({ ok: true });
            }
            await sendTelegramChatAction(chatId);
            philosopher = await pickPhilosopher(body, lovableApiKey);
            if (!link && !FREE_PHILOSOPHERS.includes(philosopher)) {
              philosopher = "heidegger";
            }
            await sendTelegramMessage(
              chatId,
              `${PHILOSOPHERS[philosopher].glyph} El oráculo te envía a ${PHILOSOPHERS[philosopher].name}.`,
            );
          }

          if (!link && !FREE_PHILOSOPHERS.includes(philosopher)) philosopher = "heidegger";

          await sendTelegramChatAction(chatId);
          const reply = await answerAs(
            admin,
            philosopher,
            link?.user_id ?? null,
            body,
            lovableApiKey,
          );
          await sendTelegramMessage(chatId, `${PHILOSOPHERS[philosopher].glyph} ${reply}`);

          if (!link) {
            await sendTelegramMessage(
              chatId,
              "Vincula tu cuenta con /vincular <código> para guardar el hilo y abrir las demás mentes.",
            );
          }
        } catch (e) {
          console.error("[telegram webhook] handler failed", e);
          await sendTelegramMessage(chatId, "Algo se interrumpió. Intenta de nuevo en un momento.");
        }

        return Response.json({ ok: true });
      },
    },
  },
});
