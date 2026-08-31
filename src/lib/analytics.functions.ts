import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const ANALYTICS_EVENTS = [
  "visit",
  "chat_opened",
  "message_sent",
  "paywall_hit",
  "pricing_viewed",
  "checkout_started",
  "purchase_completed",
  "subscription_canceled",
  "report_viewed",
  "podcast_viewed",
  "history_viewed",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const TrackSchema = z.object({
  event: z.enum(ANALYTICS_EVENTS),
  sessionId: z.string().max(64).optional(),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const trackEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => TrackSchema.parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase.from("analytics_events").insert({
      user_id: context.userId,
      session_id: data.sessionId ?? null,
      event: data.event,
      props: data.props ?? {},
    });
    return { ok: true };
  });

export type AnalyticsOverview = {
  funnel: { event: string; users: number }[];
  conversionRate: number;
  planCounts: { plan: string; count: number }[];
  retention: { cohort: string; users: number; d1: number; d7: number; d30: number }[];
  messages: { totalUsers: number; avgMessages: number; hitWall: number };
  lifetimeSeatsTaken: number;
};

const RangeSchema = z.object({ days: z.number().int().min(7).max(365).default(90) });

export const getAnalyticsOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => RangeSchema.parse(input))
  .handler(async ({ data, context }): Promise<AnalyticsOverview> => {
    const { supabase, userId } = context;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .limit(1);
    if (!roles || roles.length === 0) throw new Error("Forbidden");

    const since = new Date(Date.now() - data.days * 86400_000).toISOString();

    const { data: events } = await supabase
      .from("analytics_events")
      .select("user_id, event, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    const rows = (events ?? []) as { user_id: string | null; event: string; created_at: string }[];

    const byEvent = new Map<string, Set<string>>();
    const firstSeen = new Map<string, number>();
    const lastActivity = new Map<string, number[]>();
    const messagesPerUser = new Map<string, number>();

    for (const r of rows) {
      const uid = r.user_id ?? "anon";
      if (!byEvent.has(r.event)) byEvent.set(r.event, new Set());
      byEvent.get(r.event)!.add(uid);
      const ts = new Date(r.created_at).getTime();
      if (!firstSeen.has(uid) || ts < firstSeen.get(uid)!) firstSeen.set(uid, ts);
      if (!lastActivity.has(uid)) lastActivity.set(uid, []);
      lastActivity.get(uid)!.push(ts);
      if (r.event === "message_sent")
        messagesPerUser.set(uid, (messagesPerUser.get(uid) ?? 0) + 1);
    }

    const funnelOrder = [
      "visit",
      "chat_opened",
      "message_sent",
      "paywall_hit",
      "pricing_viewed",
      "checkout_started",
      "purchase_completed",
    ];
    const funnel = funnelOrder.map((e) => ({ event: e, users: byEvent.get(e)?.size ?? 0 }));
    const visits = funnel[0]?.users ?? 0;
    const purchases = byEvent.get("purchase_completed")?.size ?? 0;
    const conversionRate = visits > 0 ? (purchases / visits) * 100 : 0;

    // Weekly cohorts with D1 / D7 / D30 return rates.
    const cohorts = new Map<string, string[]>();
    for (const [uid, first] of firstSeen) {
      const d = new Date(first);
      const day = d.getUTCDay();
      const monday = new Date(d);
      monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
      const key = monday.toISOString().slice(0, 10);
      if (!cohorts.has(key)) cohorts.set(key, []);
      cohorts.get(key)!.push(uid);
    }
    const retention = [...cohorts.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .slice(0, 12)
      .map(([cohort, users]) => {
        const back = (minDays: number) =>
          users.filter((u) => {
            const first = firstSeen.get(u)!;
            return (lastActivity.get(u) ?? []).some(
              (t) => t - first >= minDays * 86400_000 && t - first < (minDays + 1) * 86400_000 * 30,
            );
          }).length;
        return {
          cohort,
          users: users.length,
          d1: back(1),
          d7: back(7),
          d30: back(30),
        };
      });

    const { data: subs } = await supabase.from("subscriptions").select("plan, status");
    const planCounts = ["monthly", "semiannual", "lifetime"].map((plan) => ({
      plan,
      count: (subs ?? []).filter((s) => s.plan === plan && s.status === "active").length,
    }));

    const totalMsgUsers = messagesPerUser.size;
    const totalMsgs = [...messagesPerUser.values()].reduce((a, b) => a + b, 0);

    const { data: seats } = await supabase.rpc("lifetime_seats_taken");

    return {
      funnel,
      conversionRate,
      planCounts,
      retention,
      messages: {
        totalUsers: totalMsgUsers,
        avgMessages: totalMsgUsers > 0 ? totalMsgs / totalMsgUsers : 0,
        hitWall: byEvent.get("paywall_hit")?.size ?? 0,
      },
      lifetimeSeatsTaken: (seats as number | null) ?? 0,
    };
  });
