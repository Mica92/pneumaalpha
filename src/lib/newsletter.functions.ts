import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SubscribeSchema = z.object({
  email: z.string().trim().email().max(254),
  lang: z.enum(["es", "en"]).default("es"),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SubscribeSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; already: boolean }> => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: data.email.toLowerCase(),
      lang: data.lang,
      user_id: userId,
    });
    // 23505 = unique violation: the address is already on the list.
    if (error && (error as { code?: string }).code === "23505") {
      return { ok: true, already: true };
    }
    if (error) throw error;
    return { ok: true, already: false };
  });
