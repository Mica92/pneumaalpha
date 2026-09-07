/**
 * Server-side Lemon Squeezy access. Server-only: never import from client code.
 */
import { createHmac, timingSafeEqual } from "crypto";
import type { PlanId } from "@/lib/billing.shared";

const API_BASE = "https://api.lemonsqueezy.com/v1";

export function lemonConfigured(): boolean {
  return Boolean(process.env.LEMON_SQUEEZY_API_KEY && process.env.LEMON_SQUEEZY_STORE_ID);
}

export function variantIdFor(plan: PlanId): string | null {
  const map: Record<PlanId, string | undefined> = {
    monthly: process.env.LEMON_SQUEEZY_VARIANT_MONTHLY,
    semiannual: process.env.LEMON_SQUEEZY_VARIANT_SEMIANNUAL,
    lifetime: process.env.LEMON_SQUEEZY_VARIANT_LIFETIME,
  };
  return map[plan] ?? null;
}

/** Reverse lookup used by the webhook when custom_data is missing. */
export function planForVariant(variantId: string | null): PlanId | null {
  if (!variantId) return null;
  const plans: PlanId[] = ["monthly", "semiannual", "lifetime"];
  return plans.find((p) => variantIdFor(p) === variantId) ?? null;
}

async function lemonFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!key) throw new Error("LEMON_SQUEEZY_API_KEY is not configured");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Accept", "application/vnd.api+json");
  if (init.body) headers.set("Content-Type", "application/vnd.api+json");
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

/**
 * Creates a hosted checkout bound to this user and returns its URL.
 * The overlay opens that URL client-side with Lemon.js.
 */
export async function createCheckoutUrl(args: {
  plan: PlanId;
  variantId: string;
  userId: string;
  email?: string | null;
  redirectUrl: string;
}): Promise<string> {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID!;
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          ...(args.email ? { email: args.email } : {}),
          custom: { user_id: args.userId, plan: args.plan },
        },
        product_options: {
          redirect_url: args.redirectUrl,
          enabled_variants: [Number(args.variantId)],
ատ        },
        checkout_options: { embed: true },
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(args.variantId) } },
      },
    },
  };

  const res = await lemonFetch("/checkouts", { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text();
    console.error("[lemon] checkout creation failed", res.status, text);
    throw new Error("checkout_failed");
  }
  const json = (await res.json()) as { data?: { attributes?: { url?: string } } };
  const url = json.data?.attributes?.url;
  if (!url) throw new Error("checkout_failed");
  return url;
}

/** X-Signature: hex HMAC-SHA256 of the raw request body. */
export function verifyLemonSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
