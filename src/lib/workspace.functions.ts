import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  REFLECTION_STATES,
  THOUGHT_KINDS,
  type DecisionRecord,
  type Reflection,
  type ThoughtObject,
} from "@/lib/workspace.shared";

const OpenSchema = z.object({
  philosopher: z.string().trim().max(60).optional(),
  title: z.string().trim().max(160).optional(),
  openingQuestion: z.string().trim().max(2000).optional(),
});

/** Returns the most recent reflection for this perspective, or creates one. */
export const openReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => OpenSchema.parse(input))
  .handler(async ({ data, context }): Promise<Reflection> => {
    const { supabase, userId } = context;
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString();

    const { data: existing, error: readError } = await supabase
      .from("reflections")
      .select("id, title, state, philosopher, opening_question, created_at, updated_at")
      .eq("user_id", userId)
      .eq("philosopher", data.philosopher ?? "")
      .gte("updated_at", since)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (readError) throw readError;
    if (existing) return existing as Reflection;

    const { data: row, error } = await supabase
      .from("reflections")
      .insert({
        user_id: userId,
        philosopher: data.philosopher ?? null,
        title: data.title ?? "",
        opening_question: data.openingQuestion ?? null,
      })
      .select("id, title, state, philosopher, opening_question, created_at, updated_at")
      .single();
    if (error) throw error;
    return row as Reflection;
  });

const UpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().max(160).optional(),
  state: z.enum(REFLECTION_STATES).optional(),
  openingQuestion: z.string().trim().max(2000).optional(),
});

export const updateReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => UpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: { title?: string; state?: string; opening_question?: string } = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.state !== undefined) patch.state = data.state;
    if (data.openingQuestion !== undefined) patch.opening_question = data.openingQuestion;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabase
      .from("reflections")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const listReflections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Reflection[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("reflections")
      .select("id, title, state, philosopher, opening_question, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as Reflection[];
  });

const SaveObjectSchema = z.object({
  reflectionId: z.string().uuid().nullable().optional(),
  kind: z.enum(THOUGHT_KINDS),
  text: z.string().trim().min(2).max(2000),
  context: z.string().trim().max(2000).optional(),
  rationale: z.string().trim().max(800).optional(),
  philosopher: z.string().trim().max(60).optional(),
  inMap: z.boolean().optional(),
});

export const saveThoughtObject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SaveObjectSchema.parse(input))
  .handler(async ({ data, context }): Promise<ThoughtObject> => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("thought_objects")
      .insert({
        user_id: userId,
        reflection_id: data.reflectionId ?? null,
        kind: data.kind,
        text: data.text,
        context: data.context ?? null,
        rationale: data.rationale ?? null,
        philosopher: data.philosopher ?? null,
        in_map: data.inMap ?? true,
      })
      .select(
        "id, reflection_id, kind, text, context, rationale, philosopher, in_map, muted, created_at",
      )
      .single();
    if (error) throw error;

    // Insights stay visible in the existing library too.
    if (data.kind === "insight") {
      await supabase.from("saved_insights").insert({
        user_id: userId,
        text: data.text,
        philosopher: data.philosopher ?? null,
        source_question: data.context ?? null,
      });
    }
    return row as ThoughtObject;
  });

const ListObjectsSchema = z.object({
  reflectionId: z.string().uuid().nullable().optional(),
});

export const listThoughtObjects = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ListObjectsSchema.parse(input ?? {}))
  .handler(async ({ data, context }): Promise<ThoughtObject[]> => {
    const { supabase, userId } = context;
    let query = supabase
      .from("thought_objects")
      .select(
        "id, reflection_id, kind, text, context, rationale, philosopher, in_map, muted, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(300);
    if (data.reflectionId) query = query.eq("reflection_id", data.reflectionId);
    const { data: rows, error } = await query;
    if (error) throw error;
    return (rows ?? []) as ThoughtObject[];
  });

const ObjectPatchSchema = z.object({
  id: z.string().uuid(),
  text: z.string().trim().min(2).max(2000).optional(),
  inMap: z.boolean().optional(),
  muted: z.boolean().optional(),
});

export const updateThoughtObject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ObjectPatchSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: { text?: string; in_map?: boolean; muted?: boolean } = {};
    if (data.text !== undefined) patch.text = data.text;
    if (data.inMap !== undefined) patch.in_map = data.inMap;
    if (data.muted !== undefined) patch.muted = data.muted;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabase
      .from("thought_objects")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteThoughtObject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("thought_objects")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

const DecisionSchema = z.object({
  reflectionId: z.string().uuid().nullable().optional(),
  situation: z.string().trim().min(2).max(2000),
  decision: z.string().trim().min(2).max(2000),
  reason: z.string().trim().max(2000).optional(),
  risk: z.string().trim().max(2000).optional(),
  learned: z.string().trim().max(2000).optional(),
  watchFor: z.string().trim().max(2000).optional(),
  reviewInDays: z.number().int().min(0).max(365).optional(),
});

export const saveDecisionRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => DecisionSchema.parse(input))
  .handler(async ({ data, context }): Promise<DecisionRecord> => {
    const { supabase, userId } = context;
    const reviewAt =
      data.reviewInDays && data.reviewInDays > 0
        ? new Date(Date.now() + data.reviewInDays * 86400000).toISOString()
        : null;
    const { data: row, error } = await supabase
      .from("decision_records")
      .insert({
        user_id: userId,
        reflection_id: data.reflectionId ?? null,
        situation: data.situation,
        decision: data.decision,
        reason: data.reason ?? null,
        risk: data.risk ?? null,
        learned: data.learned ?? null,
        watch_for: data.watchFor ?? null,
        review_at: reviewAt,
      })
      .select(
        "id, reflection_id, situation, decision, reason, risk, learned, watch_for, review_at, created_at",
      )
      .single();
    if (error) throw error;

    await supabase.from("thought_objects").insert({
      user_id: userId,
      reflection_id: data.reflectionId ?? null,
      kind: "decision",
      text: data.decision,
      context: data.situation,
      rationale: data.reason ?? null,
      in_map: true,
    });
    return row as DecisionRecord;
  });

export const listDecisionRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DecisionRecord[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("decision_records")
      .select(
        "id, reflection_id, situation, decision, reason, risk, learned, watch_for, review_at, created_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as DecisionRecord[];
  });

/**
 * Patterns are only reported when they are real: a word or concept that shows
 * up across several different reflections.
 */
export const findPatterns = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ term: string; count: number }[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("thought_objects")
      .select("text, reflection_id")
      .eq("user_id", userId)
      .eq("muted", false)
      .limit(300);
    if (error) throw error;

    const STOP = new Set(
      "para pero como cuando donde porque entre sobre desde hasta esto esta este eso ese aquello todo todos cada más menos muy algo nada nadie alguien tengo tiene tener hacer puedo puede quiero quiere siendo estar estoy siempre nunca that this with from what when where which because about there their would could should being have has".split(
        " ",
      ),
    );
    const byTerm = new Map<string, Set<string>>();
    for (const row of data ?? []) {
      const reflection = (row as { reflection_id: string | null }).reflection_id ?? "none";
      const words = String((row as { text: string }).text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .match(/[a-z]{5,}/g);
      for (const word of new Set(words ?? [])) {
        if (STOP.has(word)) continue;
        const set = byTerm.get(word) ?? new Set<string>();
        set.add(reflection);
        byTerm.set(word, set);
      }
    }
    return [...byTerm.entries()]
      .filter(([, set]) => set.size >= 3)
      .map(([term, set]) => ({ term, count: set.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });
