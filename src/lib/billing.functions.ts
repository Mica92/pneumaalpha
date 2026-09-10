import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { LIFETIME_SEATS, type Entitlement } from "@/lib/billing.shared";

const CheckoutSchema = z.object({
  plan: z.enum(["monthly", "semiannual", "lifetime"]),
  redirectUrl: z.string().url(),
});

export const getEntitlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Entitlement> => {
    const { readEntitlement } = await import("@/lib/entitlement.server");
    return readEntitlement(context.supabase, context.userId);
  });

/**
 * Validates that the user can buy the plan and creates a Lemon Squeezy
 * checkout bound to their account. The overlay opens the returned URL.
 */
export const prepareCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => CheckoutSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const { lemonConfigured, variantIdFor, createCheckoutUrl } = await import(
      "@/lib/lemon.server"
    );
    if (!lemonConfigured()) return { error: "not_configured" };

    const variantId = variantIdFor(data.plan);
    if (!variantId) return { error: "not_configured" };

    const { readEntitlement } = await import("@/lib/entitlement.server");
    const ent = await readEntitlement(context.supabase, context.userId);
    if (ent.active) return { error: "already_subscribed" };
    if (data.plan === "lifetime" && ent.lifetimeSeatsLeft <= 0) return { error: "sold_out" };

    try {
      const url = await createCheckoutUrl({
        plan: data.plan,
        variantId,
        userId: context.userId,
        email: (context.claims as { email?: string } | undefined)?.email ?? null,
        redirectUrl: data.redirectUrl,
      });
      return { url };
    } catch (e) {
      const code = e instanceof Error ? e.message : "checkout_failed";
      return { error: code === "plan_unavailable" ? "plan_unavailable" : "checkout_failed" };
    }
  });

/**
 * Public counter for the landing/pricing page (no session required).
 * The seat function is SECURITY DEFINER and only executable by the service
 * role, so it is called server-side and only the aggregate count is returned.
 */
export const getLifetimeSeats = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.rpc("lifetime_seats_taken");
  const taken = (data as number | null) ?? 0;
  return { taken, left: Math.max(0, LIFETIME_SEATS - taken) };
});

