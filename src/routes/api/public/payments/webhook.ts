import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { LIFETIME_SEATS, type PlanId } from "@/lib/billing.shared";
import { sendPurchaseConfirmationEmail } from "@/lib/purchase-email.server";

type PaddleEvent = {
  event_type?: string;
  data?: Record<string, unknown>;
};

function customData(d: Record<string, unknown>): { userId: string | null; plan: PlanId | null } {
  const cd = d["custom_data"];
  if (!cd || typeof cd !== "object") return { userId: null, plan: null };
  const rec = cd as Record<string, unknown>;
  const userId = typeof rec["user_id"] === "string" ? (rec["user_id"] as string) : null;
  const rawPlan = typeof rec["plan"] === "string" ? (rec["plan"] as string) : null;
  const plan =
    rawPlan === "monthly" || rawPlan === "semiannual" || rawPlan === "lifetime"
      ? rawPlan
      : null;
  return { userId, plan };
}

/** Paddle-Signature: ts=<unix>;h1=<hex-hmac-sha256 of `${ts}:${body}`> */
function verifySignature(body: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(";").map((kv) => {
      const idx = kv.indexOf("=");
      return [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()];
    }),
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Reject signatures older than 5 minutes.
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
  const a = Buffer.from(h1);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Purchase confirmation email, sent once per subscription row.
 * `match` identifies the row just written (transaction or subscription id).
 */
async function notifyPurchase(
  supabaseAdmin: any,
  args: {
    userId: string;
    plan: PlanId;
    periodEnd: string | null;
    matchColumn: "paddle_transaction_id" | "paddle_subscription_id";
    matchValue: string | null;
  },
) {
  if (!args.matchValue) return;
  try {
    const { data: row } = await supabaseAdmin
      .from("subscriptions")
      .select("id, confirmation_email_sent_at")
      .eq(args.matchColumn, args.matchValue)
      .maybeSingle();
    if (!row || row.confirmation_email_sent_at) return;

    const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(args.userId);
    const email: string | undefined = userRes?.user?.email;
    if (!email) return;
    const metaLang = userRes?.user?.user_metadata?.lang;
    const lang: "es" | "en" = metaLang === "en" ? "en" : "es";

    const sent = await sendPurchaseConfirmationEmail({
      to: email,
      lang,
      plan: args.plan,
      periodEnd: args.periodEnd,
    });
    if (sent) {
      await supabaseAdmin
        .from("subscriptions")
        .update({ confirmation_email_sent_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  } catch (e) {
    console.error("[paddle webhook] confirmation email failed", e);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const env = new URL(request.url).searchParams.get("env") === "live" ? "live" : "sandbox";
        const secret =
          env === "live"
            ? process.env.PAYMENTS_LIVE_WEBHOOK_SECRET
            : process.env.PAYMENTS_SANDBOX_WEBHOOK_SECRET;
        if (!secret) return new Response("Not configured", { status: 503 });

        const body = await request.text();
        if (!verifySignature(body, request.headers.get("paddle-signature"), secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: PaddleEvent;
        try {
          payload = JSON.parse(body) as PaddleEvent;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const type = payload.event_type ?? "";
        const d = (payload.data ?? {}) as Record<string, unknown>;
        const { userId, plan } = customData(d);
        const subscriptionId = typeof d["id"] === "string" && type.startsWith("subscription")
          ? (d["id"] as string)
          : null;
        const transactionId = typeof d["id"] === "string" && type.startsWith("transaction")
          ? (d["id"] as string)
          : null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date().toISOString();

        // Lifetime: one-time payment, granted on transaction completion.
        if (type === "transaction.completed" && plan === "lifetime" && userId) {
          const { data: taken } = await supabaseAdmin.rpc("lifetime_seats_taken");
          if (((taken as number | null) ?? 0) >= LIFETIME_SEATS) {
            console.error("[paddle webhook] lifetime sold out, transaction", transactionId);
            await supabaseAdmin.from("analytics_events").insert({
              user_id: userId,
              event: "purchase_completed",
              props: { plan, oversold: true },
            });
            return new Response("ok");
          }
          await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan: "lifetime",
              status: "active",
              paddle_transaction_id: transactionId,
              current_period_end: null,
              updated_at: now,
            },
            { onConflict: "paddle_transaction_id" },
          );
          await supabaseAdmin
            .from("analytics_events")
            .insert({ user_id: userId, event: "purchase_completed", props: { plan } });
          await notifyPurchase(supabaseAdmin, {
            userId,
            plan: "lifetime",
            periodEnd: null,
            matchColumn: "paddle_transaction_id",
            matchValue: transactionId,
          });
          return new Response("ok");
        }

        // Recurring plans: subscription lifecycle.
        if (type.startsWith("subscription.") && subscriptionId) {
          const status = typeof d["status"] === "string" ? (d["status"] as string) : "";

          if (type === "subscription.canceled" || status === "canceled") {
            await supabaseAdmin
              .from("subscriptions")
              .update({ status: "canceled", updated_at: now })
              .eq("paddle_subscription_id", subscriptionId);
            if (userId) {
              await supabaseAdmin
                .from("analytics_events")
                .insert({ user_id: userId, event: "subscription_canceled", props: { plan } });
            }
            return new Response("ok");
          }

          if (status === "active" || status === "trialing") {
            if (!userId || !plan || plan === "lifetime") {
              console.error("[paddle webhook] subscription missing custom_data", type);
              return new Response("ok");
            }
            const period = d["current_billing_period"];
            const endsAt =
              period && typeof period === "object"
                ? ((period as Record<string, unknown>)["ends_at"] as string | undefined)
                : undefined;
            await supabaseAdmin.from("subscriptions").upsert(
              {
                user_id: userId,
                plan,
                status: "active",
                paddle_subscription_id: subscriptionId,
                current_period_end: endsAt ?? null,
                updated_at: now,
              },
              { onConflict: "paddle_subscription_id" },
            );
            if (type === "subscription.activated" || type === "subscription.created") {
              await supabaseAdmin
                .from("analytics_events")
                .insert({ user_id: userId, event: "purchase_completed", props: { plan } });
            }
            await notifyPurchase(supabaseAdmin, {
              userId,
              plan,
              periodEnd: endsAt ?? null,
              matchColumn: "paddle_subscription_id",
              matchValue: subscriptionId,
            });
          }
        }

        return new Response("ok");
      },
    },
  },
});
