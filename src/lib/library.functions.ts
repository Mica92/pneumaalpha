import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";

const IdSchema = z.enum(PHILOSOPHER_LIST.map((p) => p.id) as [string, ...string[]]);

const ShareSchema = z.object({
  philosopher: IdSchema,
  question: z.string().trim().max(600).optional(),
  fragment: z.string().trim().min(20).max(1200),
  lang: z.enum(["es", "en"]).default("es"),
});

const ListSchema = z.object({
  philosopher: IdSchema.optional(),
  limit: z.number().int().min(1).max(60).default(30),
});

const ModerateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

export type LibraryFragment = {
  id: string;
  philosopher: string;
  question: string | null;
  fragment: string;
  lang: string;
  status: string;
  created_at: string;
};

export const shareFragment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ShareSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("shared_fragments").insert({
      user_id: userId,
      philosopher: data.philosopher,
      question: data.question ?? null,
      fragment: data.fragment,
      lang: data.lang,
      status: "pending",
    });
    if (error) throw error;
    return { ok: true };
  });

export const listApprovedFragments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ListSchema.parse(input))
  .handler(async ({ data, context }): Promise<LibraryFragment[]> => {
    let query = context.supabase
      .from("shared_fragments")
      .select("id, philosopher, question, fragment, lang, status, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.philosopher) query = query.eq("philosopher", data.philosopher);
    const { data: rows, error } = await query;
    if (error) throw error;
    return (rows ?? []) as LibraryFragment[];
  });

export const isModerator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ moderator: boolean }> => {
    const { supabase, userId } = context;
    const { hasModeratorRole } = await import("./roles.server");
    return { moderator: await hasModeratorRole(supabase, userId) };
  });

export const listPendingFragments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LibraryFragment[]> => {
    const { supabase, userId } = context;
    const { hasModeratorRole } = await import("./roles.server");
    if (!(await hasModeratorRole(supabase, userId))) throw new Error("Forbidden");


    const { data: rows, error } = await supabase
      .from("shared_fragments")
      .select("id, philosopher, question, fragment, lang, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (rows ?? []) as LibraryFragment[];
  });

export const moderateFragment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ModerateSchema.parse(input))
  .handler(async ({ data, context }) => {
    // RLS already restricts updates to moderators/admins.
    const { error } = await context.supabase
      .from("shared_fragments")
      .update({ status: data.status, reviewed_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
