import { createHash, timingSafeEqual } from "crypto";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

/** Telegram rechaza mensajes de más de 4096 caracteres. */
const MAX_LEN = 3800;

export type InlineKeyboard = { text: string; callback_data: string }[][];

export function telegramKeys() {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const telegramApiKey = process.env["TELEGRAM_API_KEY"];
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!telegramApiKey) throw new Error("TELEGRAM_API_KEY is not configured");
  return { lovableApiKey, telegramApiKey };
}

/** Deterministic webhook secret derived from the connection key. */
export function deriveTelegramWebhookSecret(telegramApiKey: string): string {
  return createHash("sha256").update(`telegram-webhook:${telegramApiKey}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

async function callTelegram(method: string, payload: unknown): Promise<any> {
  const { lovableApiKey, telegramApiKey } = telegramKeys();
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": telegramApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`[telegram ${method}] failed [${res.status}]: ${body}`);
    return null;
  }
  try {
    const json = JSON.parse(body);
    if (json?.ok === false) console.error(`[telegram ${method}] provider error: ${body}`);
    return json;
  } catch {
    return null;
  }
}

/** Corta el texto en bloques respetando párrafos. */
function chunk(text: string): string[] {
  if (text.length <= MAX_LEN) return [text];
  const parts: string[] = [];
  let buffer = "";
  for (const paragraph of text.split(/\n{2,}/)) {
    for (const piece of paragraph.length > MAX_LEN
      ? (paragraph.match(new RegExp(`[\\s\\S]{1,${MAX_LEN}}`, "g")) ?? [])
      : [paragraph]) {
      if ((buffer + "\n\n" + piece).length > MAX_LEN && buffer) {
        parts.push(buffer);
        buffer = piece;
      } else {
        buffer = buffer ? `${buffer}\n\n${piece}` : piece;
      }
    }
  }
  if (buffer) parts.push(buffer);
  return parts;
}

export async function sendTelegramMessage(
  chatId: number,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<void> {
  const parts = chunk(text);
  for (let i = 0; i < parts.length; i++) {
    await callTelegram("sendMessage", {
      chat_id: chatId,
      text: parts[i],
      disable_web_page_preview: true,
      ...(keyboard && i === parts.length - 1
        ? { reply_markup: { inline_keyboard: keyboard } }
        : {}),
    });
  }
}

export async function sendTelegramChatAction(chatId: number): Promise<void> {
  try {
    await callTelegram("sendChatAction", { chat_id: chatId, action: "typing" });
  } catch {
    /* typing indicator is cosmetic */
  }
}

export async function answerCallbackQuery(id: string, text?: string): Promise<void> {
  try {
    await callTelegram("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
  } catch {
    /* cosmetic */
  }
}
