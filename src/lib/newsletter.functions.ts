import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SubscribeSchema = z.object({
  email: z.string().trim().email().max(254),
  lang: z.enum(["es", "en"]).default("es"),
  // E.164: +<country><number>, digits only after the plus sign.
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "invalid_phone")
    .optional(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SubscribeSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; already: boolean }> => {
    const { supabase, userId } = context;
    const email = data.email.toLowerCase();
    const phone = data.phone ?? null;

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      lang: data.lang,
      user_id: userId,
      phone,
      whatsapp_optin: Boolean(phone),
    });

    // 23505 = unique violation: the address is already on the list.
    if (error && (error as { code?: string }).code === "23505") {
      if (phone) {
        // Keep the WhatsApp number fresh for existing subscribers.
        await supabase
          .from("newsletter_subscribers")
          .update({ phone, whatsapp_optin: true, lang: data.lang })
          .eq("user_id", userId)
          .eq("email", email);
      }
      return { ok: true, already: true };
    }
    if (error) throw error;
    return { ok: true, already: false };
  });
