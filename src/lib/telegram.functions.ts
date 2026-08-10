import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

    if (existing) {
      return { code: existing.code as string, expiresAt: existing.expires_at as string };
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const { data, error } = await supabase
        .from("telegram_link_codes")
        .insert({ user_id: userId, code })
        .select("code, expires_at")
        .single();
      if (!error && data) {
        return { code: data.code as string, expiresAt: data.expires_at as string };
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
    return data ? { linked: true as const, philosopher: data.current_philosopher as string } : { linked: false as const };
  });

/** Desvincula todos los chats de Telegram del usuario. */
export const unlinkTelegram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("telegram_links").delete().eq("user_id", userId);
    return { ok: true };
  });
