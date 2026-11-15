import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { assertTeacher, readAccess, type AccessState } from "./access";
import type { MaterialKind } from "./model";
import type { Json } from "@/integrations/supabase/types";

const KIND = z.enum(["guide", "exam", "map", "class"]);
/** Upper bound for a stored document so one material can't grow without limit. */
const MAX_CONTENT_CHARS = 600_000;
const ContentSchema = z
  .record(z.string(), z.unknown())
  .refine((v) => JSON.stringify(v).length <= MAX_CONTENT_CHARS, { message: "CONTENT_TOO_LARGE" });

export type MaterialSummary = {
  id: string;
  kind: MaterialKind;
  title: string;
  concept: string;
  discipline: string;
  subject: string;
  level: string;
  language: "es" | "en";
  review_status: "draft" | "reviewed";
  source_material_id: string | null;
  conversion: string;
  source_synced_at: string | null;
  created_at: string;
  updated_at: string;
};
type JsonObject = { [key: string]: Json | undefined };
export type Material = MaterialSummary & {
  config: JsonObject;
  content: JsonObject;
};
export type MaterialVersion = { id: string; title: string; note: string; created_at: string };

const SUMMARY_COLS =
  "id, kind, title, concept, discipline, subject, level, language, review_status, source_material_id, conversion, source_synced_at, created_at, updated_at";

/* ───────── Access ───────── */

export const getDocenteAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccessState> => {
    return readAccess(context.supabase, context.userId, context.claims as Record<string, unknown>);
  });

const RequestSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  institution: z.string().trim().min(2).max(160),
  discipline: z.string().trim().max(120).default(""),
  message: z.string().trim().max(1000).default(""),
});

export const requestDocenteAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const claims = context.claims as Record<string, unknown>;
    if (claims["is_anonymous"]) throw new Error("SIGN_IN_REQUIRED");
    const current = await readAccess(supabase, userId, claims);
    const row = {
      full_name: data.fullName,
      institution: data.institution,
      discipline: data.discipline,
      message: data.message,
      email: current.email,
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
    };
    if (current.status === "approved" || current.status === "revoked") return { ok: true };
    if (current.status === "none") {
      const { error } = await supabase.from("teacher_access").insert({ user_id: userId, ...row });
      if (error) throw error;
    } else {
      const { error } = await supabase.from("teacher_access").update(row).eq("user_id", userId);
      if (error) throw error;
    }
    return { ok: true };
  });

export type AccessRequestRow = {
  user_id: string;
  email: string | null;
  full_name: string;
  institution: string;
  discipline: string;
  message: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

export const listAccessRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccessRequestRow[]> => {
    const a = await readAccess(context.supabase, context.userId, context.claims as Record<string, unknown>);
    if (!a.isAdmin) throw new Error("FORBIDDEN_ADMIN");
    const { data, error } = await context.supabase
      .from("teacher_access")
      .select("user_id, email, full_name, institution, discipline, message, status, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as AccessRequestRow[];
  });

export const reviewAccessRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid(), status: z.enum(["approved", "rejected", "revoked"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const a = await readAccess(context.supabase, context.userId, context.claims as Record<string, unknown>);
    if (!a.isAdmin) throw new Error("FORBIDDEN_ADMIN");
    const { data: rows, error } = await context.supabase
      .from("teacher_access")
      .update({ status: data.status, reviewed_by: context.userId, reviewed_at: new Date().toISOString() })
      .eq("user_id", data.userId)
      .select("user_id");
    if (error) throw error;
    if (!rows || rows.length === 0) throw new Error("NOT_FOUND");
    return { ok: true };
  });

/* ───────── Materials ───────── */

export const listMaterials = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ kind: KIND.optional(), limit: z.number().int().min(1).max(200).default(100) })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<MaterialSummary[]> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    let q = context.supabase
      .from("teaching_materials")
      .select(SUMMARY_COLS)
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(data.limit);
    if (data.kind) q = q.eq("kind", data.kind);
    const { data: rows, error } = await q;
    if (error) throw error;
    return (rows ?? []) as MaterialSummary[];
  });

export const getMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<Material> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { data: row, error } = await context.supabase
      .from("teaching_materials")
      .select(`${SUMMARY_COLS}, config, content`)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("NOT_FOUND");
    return row as unknown as Material;
  });

const MetaSchema = z.object({
  title: z.string().trim().max(240).optional(),
  concept: z.string().trim().max(200).optional(),
  discipline: z.string().trim().max(120).optional(),
  subject: z.string().trim().max(160).optional(),
  level: z.string().trim().max(60).optional(),
  language: z.enum(["es", "en"]).optional(),
});

export const createMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    MetaSchema.extend({
      kind: KIND,
      content: ContentSchema,
      config: z.record(z.string(), z.unknown()).default({}),
      sourceMaterialId: z.string().uuid().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { data: row, error } = await context.supabase
      .from("teaching_materials")
      .insert({
        user_id: context.userId,
        kind: data.kind,
        title: data.title ?? "",
        concept: data.concept ?? "",
        discipline: data.discipline ?? "",
        subject: data.subject ?? "",
        level: data.level ?? "",
        language: data.language ?? "es",
        config: data.config as never,
        content: data.content as never,
        source_material_id: data.sourceMaterialId ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id as string };
  });

export const updateMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    MetaSchema.extend({
      id: z.string().uuid(),
      content: ContentSchema.optional(),
      reviewStatus: z.enum(["draft", "reviewed"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ updated_at: string }> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const patch: Record<string, unknown> = {};
    for (const k of ["title", "concept", "discipline", "subject", "level", "language"] as const) {
      if (data[k] !== undefined) patch[k] = data[k];
    }
    if (data.content !== undefined) patch.content = data.content;
    if (data.reviewStatus !== undefined) patch.review_status = data.reviewStatus;
    const { data: rows, error } = await context.supabase
      .from("teaching_materials")
      .update(patch as never)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("updated_at");
    if (error) throw error;
    if (!rows || rows.length === 0) throw new Error("NOT_FOUND");
    return { updated_at: rows[0].updated_at as string };
  });

export const deleteMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { data: rows, error } = await context.supabase
      .from("teaching_materials")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id");
    if (error) throw error;
    if (!rows || rows.length === 0) throw new Error("NOT_FOUND");
    return { ok: true };
  });

export const duplicateMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        titleSuffix: z.string().max(40).default(" (copia)"),
        content: ContentSchema.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { data: src, error } = await context.supabase
      .from("teaching_materials")
      .select("kind, title, concept, discipline, subject, level, language, config, content")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!src) throw new Error("NOT_FOUND");
    const { data: row, error: e2 } = await context.supabase
      .from("teaching_materials")
      .insert({
        ...src,
        content: (data.content ?? src.content) as never,
        title: `${src.title}${data.titleSuffix}`.slice(0, 240),
        user_id: context.userId,
        source_material_id: data.id,
        review_status: "draft",
      })
      .select("id")
      .single();
    if (e2) throw e2;
    return { id: row.id as string };
  });

/* ───────── Versions ───────── */

export const listVersions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<MaterialVersion[]> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { data: rows, error } = await context.supabase
      .from("material_versions")
      .select("id, title, note, created_at")
      .eq("material_id", data.id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (rows ?? []) as MaterialVersion[];
  });

export const saveVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), note: z.string().trim().max(200).default("") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { data: m, error } = await context.supabase
      .from("teaching_materials")
      .select("title, content")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!m) throw new Error("NOT_FOUND");
    const { error: e2 } = await context.supabase.from("material_versions").insert({
      material_id: data.id,
      user_id: context.userId,
      title: m.title,
      content: m.content,
      note: data.note,
    });
    if (e2) throw e2;
    return { ok: true };
  });

/** Restores a version; the current state is saved as a version first so nothing is lost. */
export const restoreVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ versionId: z.string().uuid(), note: z.string().max(200).default("") }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { supabase, userId } = context;
    const { data: v, error } = await supabase
      .from("material_versions")
      .select("material_id, title, content")
      .eq("id", data.versionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!v) throw new Error("NOT_FOUND");
    const { data: cur, error: e1 } = await supabase
      .from("teaching_materials")
      .select("title, content")
      .eq("id", v.material_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (e1) throw e1;
    if (!cur) throw new Error("NOT_FOUND");
    const { error: e2 } = await supabase.from("material_versions").insert({
      material_id: v.material_id,
      user_id: userId,
      title: cur.title,
      content: cur.content,
      note: data.note,
    });
    if (e2) throw e2;
    const { error: e3 } = await supabase
      .from("teaching_materials")
      .update({ title: v.title, content: v.content })
      .eq("id", v.material_id)
      .eq("user_id", userId);
    if (e3) throw e3;
    return { ok: true, materialId: v.material_id as string };
  });

/* ───────── Related materials ───────── */

export type RelatedMaterials = { source: MaterialSummary | null; derived: MaterialSummary[] };

export const listRelated = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<RelatedMaterials> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { data: self, error } = await context.supabase
      .from("teaching_materials")
      .select("source_material_id")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!self) throw new Error("NOT_FOUND");
    let source: MaterialSummary | null = null;
    if (self.source_material_id) {
      const { data: s } = await context.supabase
        .from("teaching_materials")
        .select(SUMMARY_COLS)
        .eq("id", self.source_material_id as string)
        .eq("user_id", context.userId)
        .maybeSingle();
      source = (s as MaterialSummary | null) ?? null;
    }
    const { data: derived, error: dErr } = await context.supabase
      .from("teaching_materials")
      .select(SUMMARY_COLS)
      .eq("source_material_id", data.id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (dErr) throw dErr;
    return { source, derived: (derived ?? []) as MaterialSummary[] };
  });

/** Teacher confirms the derivative is up to date with its (changed) source. Never touches content. */
export const markSourceSynced = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);
    const { error } = await context.supabase
      .from("teaching_materials")
      .update({ source_synced_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
