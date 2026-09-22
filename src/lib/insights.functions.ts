import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SaveSchema = z.object({
  text: z.string().trim().min(3).max(1200),
  philosopher: z.string().max(60).optional(),
  sourceQuestion: z.string().trim().max(1200).optional(),
  context: z.string().trim().max(2000).optional(),
});

const DeleteSchema = z.object({ id: z.string().uuid() });

export type SavedInsight = {
  id: string;
  text: string;
  philosopher: string | null;
  source_question: string | null;
  context: string | null;
  created_at: string;
};

export const saveInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("saved_insights")
      .insert({
        user_id: userId,
        text: data.text,
        philosopher: data.philosopher ?? null,
        source_question: data.sourceQuestion ?? null,
        context: data.context ?? null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true, id: row.id as string };
  });

export const listInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SavedInsight[]> => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("saved_insights")
      .select("id, text, philosopher, source_question, context, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (rows ?? []) as SavedInsight[];
  });

export const deleteInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => DeleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("saved_insights").delete().eq("id", data.id).eq("user_id", userId);
    return { ok: true };
  });
