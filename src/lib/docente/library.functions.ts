import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { assertTeacher } from "./access";
import { DIFFICULTIES, bankRowFromQuestion, type BankEntry } from "./bank";
import { QUESTION_TYPES, type ExamQuestion } from "./model";

/* All functions re-check teacher access: route gates do not protect RPC endpoints. */

const teacher = (context: { supabase: Parameters<typeof assertTeacher>[0]; userId: string; claims: unknown }) =>
  assertTeacher(context.supabase, context.userId, context.claims as Record<string, unknown>);

/* ───────── Archive ───────── */

export const setArchived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), archived: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { data: rows, error } = await context.supabase
      .from("teaching_materials")
      .update({ archived_at: data.archived ? new Date().toISOString() : null })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id");
    if (error) throw error;
    if (!rows || rows.length === 0) throw new Error("NOT_FOUND");
    return { ok: true };
  });

/* ───────── Collections ───────── */

export type Collection = { id: string; name: string; description: string; material_ids: string[]; updated_at: string };

export const listCollections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Collection[]> => {
    await teacher(context);
    const [{ data: cols, error }, { data: items, error: e2 }] = await Promise.all([
      context.supabase.from("material_collections").select("id, name, description, updated_at").eq("user_id", context.userId).order("name").limit(200),
      context.supabase.from("material_collection_items").select("collection_id, material_id").eq("user_id", context.userId).limit(5000),
    ]);
    if (error) throw error;
    if (e2) throw e2;
    const by = new Map<string, string[]>();
    for (const it of items ?? []) {
      const list = by.get(it.collection_id as string) ?? [];
      list.push(it.material_id as string);
      by.set(it.collection_id as string, list);
    }
    return (cols ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      description: c.description as string,
      updated_at: c.updated_at as string,
      material_ids: by.get(c.id as string) ?? [],
    }));
  });

const CollectionInput = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600).default(""),
});

export const createCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CollectionInput.extend({ materialId: z.string().uuid().optional() }).parse(input))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    await teacher(context);
    const { data: row, error } = await context.supabase
      .from("material_collections")
      .insert({ user_id: context.userId, name: data.name, description: data.description })
      .select("id")
      .single();
    if (error) throw error;
    if (data.materialId) {
      const { error: e2 } = await context.supabase
        .from("material_collection_items")
        .insert({ collection_id: row.id, material_id: data.materialId, user_id: context.userId });
      if (e2) throw e2;
    }
    return { id: row.id as string };
  });

export const updateCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CollectionInput.extend({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { data: rows, error } = await context.supabase
      .from("material_collections")
      .update({ name: data.name, description: data.description })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id");
    if (error) throw error;
    if (!rows || rows.length === 0) throw new Error("NOT_FOUND");
    return { ok: true };
  });

/** Deletes the collection only; its materials stay in the library. */
export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { error } = await context.supabase.from("material_collections").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const setCollectionMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ collectionId: z.string().uuid(), materialId: z.string().uuid(), member: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await teacher(context);
    if (data.member) {
      const { error } = await context.supabase
        .from("material_collection_items")
        .upsert(
          { collection_id: data.collectionId, material_id: data.materialId, user_id: context.userId },
          { onConflict: "collection_id,material_id", ignoreDuplicates: true },
        );
      if (error) throw error;
    } else {
      const { error } = await context.supabase
        .from("material_collection_items")
        .delete()
        .eq("collection_id", data.collectionId)
        .eq("material_id", data.materialId)
        .eq("user_id", context.userId);
      if (error) throw error;
    }
    return { ok: true };
  });

/* ───────── Question bank ───────── */

const QuestionSchema: z.ZodType<ExamQuestion> = z.object({
  id: z.string().max(60),
  type: z.enum(QUESTION_TYPES),
  prompt: z.string().max(6000),
  caseText: z.string().max(8000),
  options: z.array(z.string().max(600)).max(10),
  correctOption: z.number().int().nullable(),
  points: z.number().min(0).max(1000),
  answerLines: z.number().int().min(0).max(60),
  answerGuide: z.string().max(6000),
  rubric: z
    .array(z.object({ id: z.string().max(60), criterion: z.string().max(300), descriptor: z.string().max(1200), points: z.number().min(0).max(1000) }))
    .max(20),
  teacherNotes: z.string().max(3000),
});

const BankMetaSchema = z.object({
  concept: z.string().trim().max(200).default(""),
  discipline: z.string().trim().max(120).default(""),
  subject: z.string().trim().max(160).default(""),
  competency: z.string().trim().max(300).default(""),
  difficulty: z.enum(DIFFICULTIES).default("intermediate"),
  sources: z.string().trim().max(2000).default(""),
  language: z.enum(["es", "en"]).default("es"),
});

const BANK_COLS =
  "id, question, prompt, qtype, concept, discipline, subject, competency, difficulty, points, sources, language, review_status, source_material_id, created_at, updated_at";

export const listBank = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BankEntry[]> => {
    await teacher(context);
    const { data, error } = await context.supabase
      .from("question_bank")
      .select(BANK_COLS)
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return (data ?? []).map((r) => ({ ...r, points: Number(r.points) })) as unknown as BankEntry[];
  });

export const addToBank = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        questions: z.array(QuestionSchema).min(1).max(60),
        meta: BankMetaSchema,
        sourceMaterialId: z.string().uuid().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ count: number }> => {
    await teacher(context);
    let source: string | null = null;
    if (data.sourceMaterialId) {
      // Only link materials the teacher owns.
      const { data: m } = await context.supabase
        .from("teaching_materials")
        .select("id")
        .eq("id", data.sourceMaterialId)
        .eq("user_id", context.userId)
        .maybeSingle();
      source = (m?.id as string | undefined) ?? null;
    }
    const rows = data.questions
      .filter((q) => q.prompt.trim())
      .map((q) => ({ ...bankRowFromQuestion(q, data.meta), user_id: context.userId, source_material_id: source }));
    if (rows.length === 0) return { count: 0 };
    const { error } = await context.supabase.from("question_bank").insert(rows as never);
    if (error) throw error;
    return { count: rows.length };
  });

export const updateBankEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    BankMetaSchema.partial()
      .extend({
        id: z.string().uuid(),
        points: z.number().min(0).max(1000).optional(),
        reviewStatus: z.enum(["draft", "reviewed"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await teacher(context);
    const patch: Record<string, unknown> = {};
    for (const k of ["concept", "discipline", "subject", "competency", "difficulty", "sources", "language", "points"] as const) {
      if (data[k] !== undefined) patch[k] = data[k];
    }
    if (data.reviewStatus) patch.review_status = data.reviewStatus;
    const { data: rows, error } = await context.supabase
      .from("question_bank")
      .update(patch as never)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id");
    if (error) throw error;
    if (!rows || rows.length === 0) throw new Error("NOT_FOUND");
    return { ok: true };
  });

export const deleteBankEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await teacher(context);
    const { error } = await context.supabase.from("question_bank").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
