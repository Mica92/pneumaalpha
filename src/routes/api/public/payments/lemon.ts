import { createFileRoute } from "@tanstack/react-router";
import { LIFETIME_SEATS, type PlanId } from "@/lib/billing.shared";
import { sendPurchaseConfirmationEmail } from "@/lib/purchase-email.server";

type LemonEvent = {
  meta?: { event_name?: string; custom_data?: Record<string, unknown> };
  data?: { id?: string; attributes?: Record<string, unknown> };
};

function str(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return null;
}

function readCustom(meta: LemonEvent["meta"]): { userId: string | null; plan: PlanId | null } {
  const cd = meta?.custom_data ?? {};
  const userId = typeof cd["user_id"] === "string" ? (cd["user_id"] as string) : null;
  const raw = typeof cd["plan"] === "string" ? (cd["plan"] as string) : null;
  const plan =
    raw === "monthly" || raw === "semiannual" || raw === "lifetime" ? (raw as PlanId) : null;
  return { userId, plan };
}

/** Purchase confirmation email, sent once per subscription row. */
async function notifyPurchase(
  supabaseAdmin: any,
  args: {
    userId: string;
    plan: PlanId;
    periodEnd: string | null;
    matchColumn: "ls_order_id" | "ls_subscription_id";
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
    console.error("[lemon webhook] confirmation email failed", e);
  }
}

export const Route = createFileRoute("/api/public/payments/lemon")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { verifyLemonSignature, planForVariant } = await import("@/lib/lemon.server");
        if (!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
          return new Response("Not configured", { status: 503 });
        }

        const body = await request.text();
        if (!verifyLemonSignature(body, request.headers.get("x-signature"))) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: LemonEvent;
        try {
          payload = JSON.parse(body) as LemonEvent;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const event = payload.meta?.event_name ?? "";
        const attrs = (payload.data?.attributes ?? {}) as Record<string, unknown>;
        const objectId = str(payload.data?.id);
        const { userId, plan: customPlan } = readCustom(payload.meta);

        const firstItem = attrs["first_order_item"] as Record<string, unknown> | undefined;
        const variantId = str(attrs["variant_id"]) ?? str(firstItem?.["variant_id"]);
        const plan = customPlan ?? planForVariant(variantId);
        const customerId = str(attrs["customer_id"]);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date().toISOString();

        // ---- One-time purchase (lifetime) -------------------------------
        if (event === "order_created") {
          if (plan !== "lifetime" || !userId) return new Response("ok");
          if (str(attrs["status"]) === "refunded") return new Response("ok");

          const { data: taken } = await supabaseAdmin.rpc("lifetime_seats_taken");
          if (((taken as number | null) ?? 0) >= LIFETIME_SEATS) {
            console.error("[lemon webhook] lifetime sold out, order", objectId);
            await supabaseAdmin.from("analytics_events").insert({
              user_id: userId,
              event: "purchase_completed",
              props: { plan, oversold: true },
            });
            return new Response("ok");
          }

          const { error } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan: "lifetime",
              status: "active",
              ls_order_id: objectId,
              ls_customer_id: customerId,
              ls_variant_id: variantId,
              ls_status: str(attrs["status"]),
              current_period_end: null,
              updated_at: now,
            },
            { onConflict: "ls_order_id" },
          );
          if (error) {
            console.error("[lemon webhook] lifetime upsert failed", error);
            return new Response("Upsert failed", { status: 500 });
          }
          await supabaseAdmin
            .from("analytics_events")
            .insert({ user_id: userId, event: "purchase_completed", props: { plan } });
          await notifyPurchase(supabaseAdmin, {
            userId,
            plan: "lifetime",
            periodEnd: null,
            matchColumn: "ls_order_id",
            matchValue: objectId,
          });
          return new Response("ok");
        }

        if (event === "order_refunded") {
          if (objectId) {
            await supabaseAdmin
              .from("subscriptions")
              .update({ status: "refunded", ls_status: "refunded", updated_at: now })
              .eq("ls_order_id", objectId);
          }
          return new Response("ok");
        }

        // ---- Subscriptions ----------------------------------------------
        if (event.startsWith("subscription") && objectId) {
          const lsStatus = str(attrs["status"]) ?? "";
          const renewsAt = str(attrs["renews_at"]);
          const endsAt = str(attrs["ends_at"]);
          const periodEnd = renewsAt ?? endsAt;

          if (event === "subscription_payment_refunded") {
            await supabaseAdmin
              .from("subscriptions")
              .update({ status: "refunded", ls_status: lsStatus || "refunded", updated_at: now })
              .eq("ls_subscription_id", objectId);
            return new Response("ok");
          }

          if (event === "subscription_payment_failed") {
            await supabaseAdmin
              .from("subscriptions")
              .update({ ls_status: "payment_failed", updated_at: now })
              .eq("ls_subscription_id", objectId);
            return new Response("ok");
          }

          if (event === "subscription_payment_success") {
            await supabaseAdmin
              .from("subscriptions")
              .update({ ls_status: lsStatus || "active", current_period_end: periodEnd, updated_at: now })
              .eq("ls_subscription_id", objectId);
            return new Response("ok");
          }

          if (!userId || !plan || plan === "lifetime") {
            console.error("[lemon webhook] subscription without custom data", event);
            return new Response("ok");
          }

          // "cancelled" keeps access until ends_at; expired/paused/unpaid revoke it.
          const stillEntitled =
            lsStatus === "active" ||
            lsStatus === "on_trial" ||
            (lsStatus === "cancelled" && Boolean(endsAt) && new Date(endsAt!).getTime() > Date.now());

          const { error } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan,
              status: stillEntitled ? "active" : "canceled",
              ls_subscription_id: objectId,
              ls_customer_id: customerId,
              ls_variant_id: variantId,
              ls_status: lsStatus,
              current_period_end: lsStatus === "cancelled" ? endsAt : periodEnd,
              updated_at: now,
            },
            { onConflict: "ls_subscription_id" },
          );
          if (error) {
            console.error("[lemon webhook] subscription upsert failed", error);
            return new Response("Upsert failed", { status: 500 });
          }

          if (event === "subscription_created") {
            await supabaseAdmin
              .from("analytics_events")
              .insert({ user_id: userId, event: "purchase_completed", props: { plan } });
            await notifyPurchase(supabaseAdmin, {
              userId,
              plan,
              periodEnd,
              matchColumn: "ls_subscription_id",
              matchValue: objectId,
            });
          }
          if (event === "subscription_cancelled" || event === "subscription_expired") {
            await supabaseAdmin
              .from("analytics_events")
              .insert({ user_id: userId, event: "subscription_canceled", props: { plan } });
          }
        }

        return new Response("ok");
      },
    },
  },
});
