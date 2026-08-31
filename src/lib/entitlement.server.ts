import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_MESSAGE_LIMIT, LIFETIME_SEATS, PAYWALL_ERROR, type Entitlement, type PlanId } from "@/lib/billing.shared";

type Client = SupabaseClient<any, "public", any>;

export function paymentsConfigured() {
  return Boolean(process.env.PADDLE_SANDBOX_API_KEY || process.env.PADDLE_LIVE_API_KEY);
}

/** Active plan for a user, honouring expiry of period-based plans. */
export async function activePlan(
  supabase: Client,
  userId: string,
): Promise<{ plan: PlanId; currentPeriodEnd: string | null } | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  for (const row of data ?? []) {
    const plan = row.plan as PlanId;
    if (plan === "lifetime") return { plan, currentPeriodEnd: null };
    const end = row.current_period_end as string | null;
    if (!end || new Date(end).getTime() > Date.now()) {
      return { plan, currentPeriodEnd: end };
    }
  }
  return null;
}

export async function freeMessagesUsed(supabase: Client, userId: string): Promise<number> {
  const { data } = await supabase
    .from("usage_counters")
    .select("free_messages_used")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.free_messages_used as number | undefined) ?? 0;
}

export async function readEntitlement(supabase: Client, userId: string): Promise<Entitlement> {
  // lifetime_seats_taken is SECURITY DEFINER and no longer executable by
  // anon/authenticated; call it server-side with the service role only.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [plan, used, seatsRes] = await Promise.all([
    activePlan(supabase, userId),
    freeMessagesUsed(supabase, userId),
    supabaseAdmin.rpc("lifetime_seats_taken"),
  ]);
  const taken = (seatsRes.data as number | null) ?? 0;
  return {
    active: Boolean(plan),
    plan: plan?.plan ?? null,
    currentPeriodEnd: plan?.currentPeriodEnd ?? null,
    freeMessagesUsed: used,
    freeMessagesLeft: Math.max(0, FREE_MESSAGE_LIMIT - used),
    lifetimeSeatsTaken: taken,
    lifetimeSeatsLeft: Math.max(0, LIFETIME_SEATS - taken),
    checkoutConfigured: paymentsConfigured(),
  };
}

export class PaywallError extends Error {
  constructor(message = PAYWALL_ERROR) {
    super(message);
    this.name = "PaywallError";
  }
}

/** Throws when the feature requires an active subscription. */
export async function requireActivePlan(supabase: Client, userId: string) {
  const plan = await activePlan(supabase, userId);
  if (!plan) throw new PaywallError();
  return plan;
}

/**
 * Chat gate: subscribers pass freely; free users consume one of their
 * 12 lifetime messages. Throws PaywallError when the allowance is spent.
 */
export async function consumeFreeMessage(supabase: Client, userId: string) {
  const plan = await activePlan(supabase, userId);
  if (plan) return { paywalled: false as const, left: Infinity };

  const used = await freeMessagesUsed(supabase, userId);
  if (used >= FREE_MESSAGE_LIMIT) throw new PaywallError();

  await supabase
    .from("usage_counters")
    .upsert(
      { user_id: userId, free_messages_used: used + 1, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
  return { paywalled: false as const, left: FREE_MESSAGE_LIMIT - (used + 1) };
}

export { FREE_MESSAGE_LIMIT, LIFETIME_SEATS };
