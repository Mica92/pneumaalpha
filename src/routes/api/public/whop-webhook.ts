import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { LIFETIME_SEATS } from "@/lib/billing.shared";

type WhopEvent = {
  action?: string;
  event?: string;
  data?: Record<string, unknown>;
};

function planFromMetadata(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const plan = (meta as Record<string, unknown>)["plan"];
  return typeof plan === "string" ? plan : null;
}

function userFromMetadata(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const id = (meta as Record<string, unknown>)["user_id"];
  return typeof id === "string" ? id : null;
}

function verify(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const provided = signature.includes("=") ? signature.split("=").pop()! : signature;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/public/whop-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.WHOP_WEBHOOK_SECRET;
        if (!secret) return new Response("Not configured", { status: 503 });

        const body = await request.text();
        const signature =
          request.headers.get("x-whop-signature") ?? request.headers.get("whop-signature");
        if (!verify(body, signature, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: WhopEvent;
        try {
          payload = JSON.parse(body) as WhopEvent;
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const action = payload.action ?? payload.event ?? "";
        const d = (payload.data ?? {}) as Record<string, unknown>;
        const metadata = d["metadata"];
        const userId = userFromMetadata(metadata);
        const plan = planFromMetadata(metadata);
        const membershipId =
          (typeof d["id"] === "string" ? (d["id"] as string) : null) ??
          (typeof d["membership_id"] === "string" ? (d["membership_id"] as string) : null);

        if (!userId || !plan) {
          console.error("[whop webhook] missing metadata", action);
          return new Response("ok");
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (action.includes("valid") && !action.includes("invalid")) {
          if (plan === "lifetime") {
            const { data: taken } = await supabaseAdmin.rpc("lifetime_seats_taken");
            if (((taken as number | null) ?? 0) >= LIFETIME_SEATS) {
              console.error("[whop webhook] lifetime sold out, membership", membershipId);
              await supabaseAdmin.from("analytics_events").insert({
                user_id: userId,
                event: "purchase_completed",
                props: { plan, oversold: true },
              });
              return new Response("ok");
            }
          }

          const renewal = d["renewal_period_end"] ?? d["expires_at"];
          const periodEnd =
            typeof renewal === "number"
              ? new Date(renewal * 1000).toISOString()
              : typeof renewal === "string"
                ? renewal
                : plan === "monthly"
                  ? new Date(Date.now() + 31 * 86400_000).toISOString()
                  : plan === "semiannual"
                    ? new Date(Date.now() + 183 * 86400_000).toISOString()
                    : null;

          await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: userId,
              plan,
              status: "active",
              whop_membership_id: membershipId,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "whop_membership_id" },
          );
          await supabaseAdmin
            .from("analytics_events")
            .insert({ user_id: userId, event: "purchase_completed", props: { plan } });
        } else if (action.includes("invalid") || action.includes("cancel")) {
          if (membershipId) {
            await supabaseAdmin
              .from("subscriptions")
              .update({ status: "canceled", updated_at: new Date().toISOString() })
              .eq("whop_membership_id", membershipId);
          }
          await supabaseAdmin
            .from("analytics_events")
            .insert({ user_id: userId, event: "subscription_canceled", props: { plan } });
        }

        return new Response("ok");
      },
    },
  },
});
