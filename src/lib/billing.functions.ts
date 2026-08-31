import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { LIFETIME_SEATS, PLAN_PRICE_IDS, type Entitlement } from "@/lib/billing.shared";

const CheckoutSchema = z.object({
  plan: z.enum(["monthly", "semiannual", "lifetime"]),
});

export const getEntitlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Entitlement> => {
    const { readEntitlement } = await import("@/lib/entitlement.server");
    return readEntitlement(context.supabase, context.userId);
  });

/**
 * Validates that the user can buy the plan and returns the Paddle price
 * external_id. The actual checkout opens client-side with Paddle.js.
 */
export const prepareCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => CheckoutSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ priceId: string } | { error: string }> => {
      const { paddleConfigured } = await import("@/lib/paddle.server");
      if (!paddleConfigured()) return { error: "not_configured" };

      const { readEntitlement } = await import("@/lib/entitlement.server");
      const ent = await readEntitlement(context.supabase, context.userId);
      if (ent.active) return { error: "already_subscribed" };
      if (data.plan === "lifetime" && ent.lifetimeSeatsLeft <= 0) return { error: "sold_out" };

      return { priceId: PLAN_PRICE_IDS[data.plan] };
    },
  );

/** Public counter for the landing/pricing page (no session required). */
export const getLifetimeSeats = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const client = createClient(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await client.rpc("lifetime_seats_taken");
  const taken = (data as number | null) ?? 0;
  return { taken, left: Math.max(0, LIFETIME_SEATS - taken) };
});
