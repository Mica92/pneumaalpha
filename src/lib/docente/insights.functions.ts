import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { assertTeacher } from "./access";
import {
  DECISIONS,
  DEFAULT_PREFERENCES,
  TEMPLATES,
  WORK_FLUSH_MAX,
  computeInsights,
  countPendingRefs,
  normalizeTags,
  reviewCounts,
  type Insights,
  type InsightMaterial,
  type Preferences,
  type WorkRow,
} from "./insights";
import type { QualityReport } from "./planning";

/* All functions re-check teacher access: route gates do not protect RPC endpoints. */
type Ctx = { supabase: Parameters<typeof assertTeacher>[0]; userId: string; claims: unknown };
const teacher = (c: Ctx) => assertTeacher(c.supabase, c.userId, c.claims as Record<string, unknown>);

/* ───────── Preferences ───────── */

const PREF_COLS =
  "institution, faculty, course, teacher_name, template, show_header, default_discipline, default_level, default_language, hourly_rate, currency, track_time";

export const getPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Preferences> => {
    await teacher(context);
    const { data, error } = await context.supabase.from("docente_preferences").select(PREF_COLS).eq("user_id", context.userId).maybeSingle();
    if (error) throw error;
    if (!data) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...data, hourly_rate: data.hourly_rate === null ? null : Number(data.hourly_rate) } as Preferences;
  });

const PrefInput = z.object({
  institution: z.string().trim().max(200),
  faculty: z.string().trim().max(200),
  course: z.string().trim().max(200),
  teacher_name: z.string().trim().max(200),
  template: z.enum(TEMPLATES),
  show_header: z.boolean(),
  default_discipline: z.string().trim().max(120),
  default_level: z.string().trim().max(60),
  default_language: z.enum(["es", "en"]),
  hourly_rate: z.number().min(0).max(10_000_000).nullable(),
  currency: z.string().trim().max(8),
  track_time: z.boolean(),
});

export const savePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PrefInput.parse(input))
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { error } = await context.supabase.from("docente_preferences").upsert({ user_id: context.userId, ...data }, { onConflict: "user_id" });
    if (error) throw error;
    return { ok: true };
  });

/* ───────── Active work time ───────── */

export const logWorkTime = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), seconds: z.number().int().min(1).max(WORK_FLUSH_MAX) }).parse(input))
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { error } = await context.supabase.rpc("log_docente_work", { _material_id: data.id, _seconds: data.seconds });
    if (error) throw error;
    return { ok: true };
  });

export const getMaterialWorkTime = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ seconds: number }> => {
    await teacher(context);
    const { data: rows, error } = await context.supabase.from("docente_work_log").select("seconds").eq("material_id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { seconds: (rows ?? []).reduce((s, r) => s + (r.seconds as number), 0) };
  });

/* ───────── Library organization ───────── */

export const setFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), favorite: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { data: rows, error } = await context.supabase
      .from("teaching_materials")
      .update({ favorite: data.favorite })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id");
    if (error) throw error;
    if (!rows?.length) throw new Error("NOT_FOUND");
    return { ok: true };
  });

export const setTags = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), tags: z.array(z.string().max(60)).max(40) }).parse(input))
  .handler(async ({ data, context }): Promise<{ tags: string[] }> => {
    await teacher(context);
    const tags = normalizeTags(data.tags);
    const { data: rows, error } = await context.supabase
      .from("teaching_materials")
      .update({ tags })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id");
    if (error) throw error;
    if (!rows?.length) throw new Error("NOT_FOUND");
    return { tags };
  });

/* ───────── Academic review history ───────── */

export type SavedReview = { id: string; created_at: string; report: QualityReport; decisions: Record<string, string> };

export const latestReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ materialId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<SavedReview | null> => {
    await teacher(context);
    const { data: row, error } = await context.supabase
      .from("docente_quality_reviews")
      .select("id, created_at, report, decisions")
      .eq("material_id", data.materialId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (row as unknown as SavedReview) ?? null;
  });

export const setReviewDecision = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), dimension: z.string().max(40).regex(/^[a-z_]+$/), decision: z.enum(DECISIONS) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { data: row, error } = await context.supabase
      .from("docente_quality_reviews")
      .select("decisions")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("NOT_FOUND");
    const decisions = { ...((row.decisions as Record<string, string>) ?? {}), [data.dimension]: data.decision };
    const { error: e2 } = await context.supabase.from("docente_quality_reviews").update({ decisions }).eq("id", data.id).eq("user_id", context.userId);
    if (e2) throw e2;
    return { decisions };
  });

/* ───────── Teaching Insights ───────── */

export type InsightsResult = Insights & {
  period: "30d" | "90d" | "all";
  pendingRefs: number;
  pendingRefMaterials: { id: string; title: string; count: number }[];
  reviews: { total: number; pending: number; addressed: number; dismissed: number };
  hourlyRate: number | null;
  currency: string;
  trackTime: boolean;
};

export const getInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ period: z.enum(["30d", "90d", "all"]).default("30d") }).parse(input ?? {}))
  .handler(async ({ data, context }): Promise<InsightsResult> => {
    await teacher(context);
    const since = data.period === "all" ? null : new Date(Date.now() - (data.period === "30d" ? 30 : 90) * 86_400_000).toISOString();
    const sb = context.supabase;
    const [mats, work, reviews, prefs] = await Promise.all([
      sb.from("teaching_materials").select("id, kind, title, review_status, source_material_id, conversion, created_at, ready_at, archived_at, content").eq("user_id", context.userId).limit(2000),
      sb.from("docente_work_log").select("material_id, day, seconds").eq("user_id", context.userId).limit(20000),
      (() => {
        let q = sb.from("docente_quality_reviews").select("material_id, created_at, report, decisions").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(1000);
        if (since) q = q.gte("created_at", since);
        return q;
      })(),
      sb.from("docente_preferences").select("hourly_rate, currency, track_time").eq("user_id", context.userId).maybeSingle(),
    ]);
    for (const r of [mats, work, reviews, prefs]) if (r.error) throw r.error;
    const materials = (mats.data ?? []) as (InsightMaterial & { title: string; content: unknown })[];
    const ins = computeInsights(materials, (work.data ?? []) as WorkRow[], since);

    const pendingRefMaterials = materials
      .filter((m) => !m.archived_at)
      .map((m) => ({ id: m.id, title: m.title, count: countPendingRefs(m.content) }))
      .filter((m) => m.count > 0)
      .sort((a, b) => b.count - a.count);

    // Only the latest review of each material counts toward pending observations.
    const seen = new Set<string>();
    const totals = { total: 0, pending: 0, addressed: 0, dismissed: 0 };
    for (const r of reviews.data ?? []) {
      totals.total++;
      if (seen.has(r.material_id as string)) continue;
      seen.add(r.material_id as string);
      const c = reviewCounts(((r.report as unknown as QualityReport)?.findings ?? []) as { dimension: string; status: string }[], (r.decisions as Record<string, string>) ?? {});
      totals.pending += c.pending;
      totals.addressed += c.addressed;
      totals.dismissed += c.dismissed;
    }
    return {
      ...ins,
      period: data.period,
      pendingRefs: pendingRefMaterials.reduce((s, m) => s + m.count, 0),
      pendingRefMaterials: pendingRefMaterials.slice(0, 8),
      reviews: totals,
      hourlyRate: prefs.data?.hourly_rate === null || prefs.data?.hourly_rate === undefined ? null : Number(prefs.data.hourly_rate),
      currency: (prefs.data?.currency as string) ?? "CLP",
      trackTime: prefs.data?.track_time ?? true,
    };
  });
