import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { LIFETIME_SEATS, type Entitlement } from "@/lib/billing.shared";

const CheckoutSchema = z.object({
  plan: z.enum(["monthly", "semiannual", "lifetime"]),
  returnUrl: z.string().url(),
});

export const getEntitlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Entitlement> => {
    const { readEntitlement } = await import("@/lib/entitlement.server");
    return readEntitlement(context.supabase, context.userId);
  });

const PLAN_ENV: Record<string, string> = {
  monthly: "WHOP_PLAN_MONTHLY",
  semiannual: "WHOP_PLAN_SEMIANNUAL",
  lifetime: "WHOP_PLAN_LIFETIME",
};

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => CheckoutSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ url: string } | { error: string }> => {
    const apiKey = process.env.WHOP_API_KEY;
    const planId = process.env[PLAN_ENV[data.plan]!];
    if (!apiKey || !planId) return { error: "not_configured" };

    const { readEntitlement } = await import("@/lib/entitlement.server");
    const ent = await readEntitlement(context.supabase, context.userId);
    if (ent.active) return { error: "already_subscribed" };
    if (data.plan === "lifetime" && ent.lifetimeSeatsLeft <= 0) return { error: "sold_out" };

    const res = await fetch("https://api.whop.com/api/v2/checkout_sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        redirect_url: data.returnUrl,
        metadata: { user_id: context.userId, plan: data.plan },
      }),
    });

    if (!res.ok) {
      console.error("[whop checkout]", res.status, await res.text());
      return { error: "checkout_failed" };
    }
    const json = (await res.json()) as { purchase_url?: string; id?: string };
    const url = json.purchase_url ?? (json.id ? `https://whop.com/checkout/${json.id}` : null);
    if (!url) return { error: "checkout_failed" };
    return { url };
  });

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
