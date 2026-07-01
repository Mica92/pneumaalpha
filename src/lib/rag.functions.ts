import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { AQUINAS_CORPUS } from "@/lib/aquinas-corpus";

const EMBED_MODEL = "openai/text-embedding-3-small";
const EMBED_DIMS = 1536;

async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: text,
      dimensions: EMBED_DIMS,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Embedding failed (${res.status}): ${t}`);
  }
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}

function toVectorLiteral(v: number[]): string {
  return `[${v.join(",")}]`;
}

// Retrieve top-k passages for a given philosopher. Returns [] on any failure
// (never breaks the chat flow).
export const retrieveSources = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        philosopher: z.string(),
        query: z.string().min(1),
        matchCount: z.number().int().min(1).max(10).default(5),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      const embedding = await embed(data.query);
      const { data: rows, error } = await context.supabase.rpc(
        "match_philosopher_sources",
        {
          query_embedding: toVectorLiteral(embedding) as unknown as number[],
          target_philosopher: data.philosopher,
          match_count: data.matchCount,
        },
      );
      if (error) {
        console.error("[retrieveSources] rpc error", error);
        return [];
      }
      return (rows ?? []) as Array<{
        id: string;
        work: string;
        reference: string;
        lang: string;
        content: string;
        similarity: number;
      }>;
    } catch (e) {
      console.error("[retrieveSources] failed", e);
      return [];
    }
  });

// Seed / re-seed the Aquinas corpus. Idempotent via UPSERT on (philosopher, reference, lang).
export const seedAquinasCorpus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let inserted = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Check what's already indexed to avoid recomputing embeddings.
    const { data: existing } = await supabaseAdmin
      .from("philosopher_sources")
      .select("reference, lang")
      .eq("philosopher", "aquinas");
    const have = new Set((existing ?? []).map((r) => `${r.reference}::${r.lang}`));

    for (const passage of AQUINAS_CORPUS) {
      const key = `${passage.reference}::${passage.lang}`;
      if (have.has(key)) {
        skipped++;
        continue;
      }
      try {
        const vector = await embed(`${passage.work} — ${passage.reference}\n\n${passage.content}`);
        const { error } = await supabaseAdmin.from("philosopher_sources").insert({
          philosopher: "aquinas",
          work: passage.work,
          reference: passage.reference,
          lang: passage.lang,
          content: passage.content,
          embedding: toVectorLiteral(vector),
        });
        if (error) {
          errors.push(`${passage.reference}: ${error.message}`);
        } else {
          inserted++;
        }
      } catch (e) {
        errors.push(`${passage.reference}: ${(e as Error).message}`);
      }
    }

    return { inserted, skipped, total: AQUINAS_CORPUS.length, errors };
  });

export const countSources = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ philosopher: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("philosopher_sources")
      .select("id", { count: "exact", head: true })
      .eq("philosopher", data.philosopher);
    return { count: count ?? 0 };
  });
