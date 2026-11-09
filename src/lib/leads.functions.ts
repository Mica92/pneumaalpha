import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LEAD_MAX_PER_HOUR, LeadSchema, looksAutomated } from "./leads.shared";

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Endpoint público: registra una solicitud de demostración o piloto.
 * Valida en servidor, descarta bots y limita envíos por origen. Nunca devuelve registros.
 */
export const submitInstitutionalLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => LeadSchema.parse(input))
  .handler(async ({ data }) => {
    // Los bots reciben la misma respuesta que un envío válido, sin guardar nada.
    if (looksAutomated(data)) return { ok: true as const };

    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const ipHash = await sha256(`kionas-leads:${ip}`);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from("institutional_leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if (countError) throw new Error("No pudimos registrar la solicitud. Inténtalo de nuevo.");
    if ((count ?? 0) >= LEAD_MAX_PER_HOUR) {
      throw new Error("RATE_LIMITED");
    }

    const { data: inserted, error } = await supabaseAdmin.from("institutional_leads").insert({
      full_name: data.fullName,
      email: data.email,
      institution: data.institution,
      job_title: data.jobTitle,
      country: data.country,
      message: data.message,
      interest: data.interest,
      language: data.language,
      source_path: data.sourcePath,
      ip_hash: ipHash,
    }).select("id").single();
    if (error || !inserted) throw new Error("No pudimos registrar la solicitud. Inténtalo de nuevo.");

    // Aviso al equipo (destinatario fijo en la plantilla). Si el correo falla, la solicitud ya quedó guardada.
    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("lead-notification", "", {
        templateData: {
          fullName: data.fullName,
          email: data.email,
          institution: data.institution,
          jobTitle: data.jobTitle,
          country: data.country,
          message: data.message,
          interest: data.interest,
          language: data.language,
          sourcePath: data.sourcePath,
        },
        idempotencyKey: `lead-notification-${inserted.id}`,
        replyTo: data.email,
      });
    } catch (e) {
      console.error("[leads] notification email failed", e);
    }
    return { ok: true as const };
  });

export type InstitutionalLeadRow = {
  id: string;
  full_name: string;
  email: string;
  institution: string;
  job_title: string;
  country: string;
  message: string;
  interest: string;
  language: string;
  created_at: string;
};

/** Solo administradores: lista las solicitudes más recientes (RLS también lo exige). */
export const listInstitutionalLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InstitutionalLeadRow[]> => {
    const { supabase, userId } = context;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .limit(1);
    if (!roles || roles.length === 0) throw new Error("Forbidden");

    const { data, error } = await supabase
      .from("institutional_leads")
      .select(
        "id, full_name, email, institution, job_title, country, message, interest, language, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
