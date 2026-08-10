import { createHash, timingSafeEqual } from "crypto";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

export function telegramKeys() {
  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const telegramApiKey = process.env["TELEGRAM_API_KEY"];
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!telegramApiKey) throw new Error("TELEGRAM_API_KEY is not configured");
  return { lovableApiKey, telegramApiKey };
}

/** Deterministic webhook secret derived from the connection key. */
export function deriveTelegramWebhookSecret(telegramApiKey: string): string {
  return createHash("sha256")
    .update(`telegram-webhook:${telegramApiKey}`)
    .digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const { lovableApiKey, telegramApiKey } = telegramKeys();
  const res = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "X-Connection-Api-Key": telegramApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[telegram sendMessage] failed [${res.status}]: ${body}`);
  }
}

export async function sendTelegramChatAction(chatId: number): Promise<void> {
  try {
    const { lovableApiKey, telegramApiKey } = telegramKeys();
    await fetch(`${GATEWAY_URL}/sendChatAction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": telegramApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    });
  } catch {
    /* typing indicator is cosmetic */
  }
}
