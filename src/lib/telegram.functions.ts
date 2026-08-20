import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

async function telegramBotUsername(): Promise<string | null> {
  const configured = process.env["TELEGRAM_BOT_USERNAME"];
  if (configured) return configured;

  const lovableApiKey = process.env["LOVABLE_API_KEY"];
  const telegramApiKey = process.env["TELEGRAM_API_KEY"];
  if (!lovableApiKey || !telegramApiKey) return null;

  try {
    const res = await fetch(`${GATEWAY_URL}/getMe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": telegramApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    return json?.ok ? (json.result.username as string) : null;
  } catch {
    return null;
  }
}

/** Genera (o reutiliza) un código de 6 dígitos para vincular Telegram. */
export const createTelegramLinkCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: existing } = await supabase
      .from("telegram_link_codes")
      .select("code, expires_at")
      .eq("user_id", userId)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const botUsername = await telegramBotUsername();

    if (existing) {
      return {
        code: existing.code as string,
        expiresAt: existing.expires_at as string,
        deepLink: botUsername ? `https://t.me/${botUsername}?start=${existing.code}` : undefined,
      };
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const { data, error } = await supabase
        .from("telegram_link_codes")
        .insert({ user_id: userId, code })
        .select("code, expires_at")
        .single();
      if (!error && data) {
        return {
          code: data.code as string,
          expiresAt: data.expires_at as string,
          deepLink: botUsername ? `https://t.me/${botUsername}?start=${data.code}` : undefined,
        };
      }
    }
    throw new Error("No se pudo generar un código. Intenta de nuevo.");
  });

/** Estado de vinculación del usuario actual. */
export const getTelegramLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("telegram_links")
      .select("chat_id, current_philosopher")
      .eq("user_id", userId)
      .maybeSingle();
    return data
      ? { linked: true as const, philosopher: data.current_philosopher as string }
      : { linked: false as const };
  });

/** Desvincula todos los chats de Telegram del usuario. */
export const unlinkTelegram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("telegram_links").delete().eq("user_id", userId);
    return { ok: true };
  });
