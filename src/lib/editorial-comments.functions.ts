import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const KeySchema = z.object({ articleSlug: z.string().trim().min(1).max(160) });
const CommentSchema = KeySchema.extend({ content: z.string().trim().min(2).max(1500), lang: z.enum(["es", "en"]) });
const IdSchema = z.object({ id: z.string().uuid() });
const EditSchema = IdSchema.extend({ content: z.string().trim().min(2).max(1500) });
const ReportSchema = IdSchema.extend({ reason: z.string().trim().min(2).max(300) });
const ModerateSchema = IdSchema.extend({ status: z.enum(["approved", "rejected", "hidden"]), note: z.string().trim().max(500).optional() });

export type EditorialComment = {
  id: string; article_slug: string; user_id: string; author_name: string; content: string;
  lang: string; status: string; created_at: string; updated_at: string;
};

function publicClient() {
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
  return createClient<Database>(process.env['SUPABASE_URL']!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

export const listEditorialComments = createServerFn({ method: "GET" })
  .inputValidator((input) => KeySchema.parse(input))
  .handler(async ({ data }): Promise<EditorialComment[]> => {
    const { data: rows, error } = await publicClient().from("editorial_comments")
      .select("id, article_slug, user_id, author_name, content, lang, status, created_at, updated_at")
      .eq("article_slug", data.articleSlug).eq("status", "approved").order("created_at", { ascending: true });
    if (error) throw new Error("Could not load comments");
    return (rows ?? []) as EditorialComment[];
  });

export const createEditorialComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator((input) => CommentSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (context.claims.is_anonymous === true) throw new Error("identified_account_required");
    const { data: profile } = await context.supabase.from("profiles").select("display_name").eq("id", context.userId).maybeSingle();
    const fallback = typeof context.claims.email === "string" ? context.claims.email.split("@")[0] : "Lector";
    const authorName = profile?.display_name?.trim() || fallback;
    const { data: row, error } = await context.supabase.from("editorial_comments").insert({ article_slug: data.articleSlug, user_id: context.userId, author_name: authorName.slice(0, 80), content: data.content, lang: data.lang, status: "pending" }).select("id, status").single();
    if (error) throw new Error("Could not submit comment");
    return row;
  });

export const listMyEditorialComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]).inputValidator((input) => KeySchema.parse(input))
  .handler(async ({ data, context }): Promise<EditorialComment[]> => {
    if (context.claims.is_anonymous === true) return [];
    const { data: rows, error } = await context.supabase.from("editorial_comments")
      .select("id, article_slug, user_id, author_name, content, lang, status, created_at, updated_at")
      .eq("article_slug", data.articleSlug).eq("user_id", context.userId).order("created_at", { ascending: true });
    if (error) throw new Error("Could not load your comments");
    return (rows ?? []) as EditorialComment[];
  });

export const editEditorialComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator((input) => EditSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (context.claims.is_anonymous === true) throw new Error("identified_account_required");
    const { error } = await context.supabase.from("editorial_comments").update({ content: data.content, status: "pending", moderation_note: null }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Could not edit comment");
    return { ok: true };
  });

export const deleteEditorialComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator((input) => IdSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (context.claims.is_anonymous === true) throw new Error("identified_account_required");
    const { error } = await context.supabase.from("editorial_comments").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error("Could not delete comment");
    return { ok: true };
  });

export const reportEditorialComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator((input) => ReportSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (context.claims.is_anonymous === true) throw new Error("identified_account_required");
    const { error } = await context.supabase.from("editorial_comment_reports").insert({ comment_id: data.id, user_id: context.userId, reason: data.reason });
    if (error && (error as { code?: string }).code !== "23505") throw new Error("Could not report comment");
    return { ok: true };
  });

export const listPendingEditorialComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<EditorialComment[]> => {
    if (context.claims.is_anonymous === true) return [];
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).in("role", ["admin", "moderator"]);
    if (!roles?.length) return [];
    const { data: rows, error } = await context.supabase.from("editorial_comments").select("id, article_slug, user_id, author_name, content, lang, status, created_at, updated_at").eq("status", "pending").order("created_at", { ascending: true });
    if (error) throw new Error("Could not load moderation queue");
    return (rows ?? []) as EditorialComment[];
  });

export const moderateEditorialComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator((input) => ModerateSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (context.claims.is_anonymous === true) throw new Error("Forbidden");
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId).in("role", ["admin", "moderator"]);
    if (!roles?.length) throw new Error("Forbidden");
    const { error } = await context.supabase.from("editorial_comments").update({ status: data.status, moderation_note: data.note ?? null }).eq("id", data.id);
    if (error) throw new Error("Could not moderate comment");
    return { ok: true };
  });
