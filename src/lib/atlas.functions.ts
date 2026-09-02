import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const recordSchema = z.object({
  entityId: z.string().min(1).max(120),
  entityKind: z.string().min(1).max(40),
  reason: z.string().max(400).optional(),
});

export type JourneyNode = {
  entityId: string;
  entityKind: string;
  reason: string | null;
  count: number;
  updatedAt: string;
};

export const listJourneyNodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<JourneyNode[]> => {
    const { data, error } = await context.supabase
      .from("journey_nodes")
      .select("entity_id, entity_kind, reason, count, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      entityId: r.entity_id,
      entityKind: r.entity_kind,
      reason: r.reason,
      count: r.count,
      updatedAt: r.updated_at,
    }));
  });

export const recordJourneyNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => recordSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("journey_nodes")
      .select("id, count")
      .eq("user_id", userId)
      .eq("entity_id", data.entityId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("journey_nodes")
        .update({ count: existing.count + 1, ...(data.reason ? { reason: data.reason } : {}) })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const { error } = await supabase.from("journey_nodes").insert({
      user_id: userId,
      entity_id: data.entityId,
      entity_kind: data.entityKind,
      reason: data.reason ?? null,
      count: 1,
    });

    // A concurrent call may have inserted the same row between the select and
    // the insert; treat the unique-constraint violation as an increment.
    if (error) {
      if (error.code !== "23505") throw new Error(error.message);
      const { data: row } = await supabase
        .from("journey_nodes")
        .select("id, count")
        .eq("user_id", userId)
        .eq("entity_id", data.entityId)
        .maybeSingle();
      if (row) {
        await supabase
          .from("journey_nodes")
          .update({ count: row.count + 1, ...(data.reason ? { reason: data.reason } : {}) })
          .eq("id", row.id);
      }
    }
    return { ok: true };
  });

export const removeJourneyNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ entityId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase
      .from("journey_nodes")
      .delete()
      .eq("user_id", context.userId)
      .eq("entity_id", data.entityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
