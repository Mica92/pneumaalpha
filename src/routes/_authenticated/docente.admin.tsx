import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { formatDate } from "@/components/docente/material-list";
import { listAccessRequests, reviewAccessRequest, type AccessRequestRow } from "@/lib/docente/docente.functions";
import { errorText, useDocenteAccess, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/docente/admin")({
  head: () => ({
    meta: [
      { title: "Accesos docentes — Kionas Docente" },
      { name: "description", content: "Revisa y aprueba las solicitudes de acceso a Kionas Docente." },
      { property: "og:title", content: "Accesos docentes — Kionas Docente" },
      { property: "og:description", content: "Administración de accesos de Kionas Docente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAccess,
});

const STATUS: Record<string, { es: string; en: string }> = {
  pending: { es: "Pendiente", en: "Pending" },
  approved: { es: "Aprobado", en: "Approved" },
  rejected: { es: "Rechazado", en: "Rejected" },
  revoked: { es: "Desactivado", en: "Disabled" },
};

function AdminAccess() {
  const tr = useTr();
  const { lang } = useI18n();
  const { data: access } = useDocenteAccess();
  const qc = useQueryClient();
  const fetchList = useServerFn(listAccessRequests);
  const review = useServerFn(reviewAccessRequest);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const { data, isLoading, error } = useQuery({
    queryKey: ["docente-access-requests"],
    queryFn: () => fetchList() as Promise<AccessRequestRow[]>,
    enabled: Boolean(access?.isAdmin),
  });

  if (access && !access.isAdmin)
    return (
      <DocenteShell>
        <p className="text-body text-foreground">{tr("Esta sección es solo para administradores.", "This section is for administrators only.")}</p>
      </DocenteShell>
    );

  async function set(userId: string, status: "approved" | "rejected" | "revoked") {
    setErr(null);
    try {
      await review({ data: { userId, status } });
      await qc.invalidateQueries({ queryKey: ["docente-access-requests"] });
    } catch (e) {
      setErr(errorText(e, lang));
    }
  }

  const rows = (data ?? []).filter((r) => filter === "all" || r.status === "pending");

  return (
    <DocenteShell>
      <PageHeading title={tr("Accesos docentes", "Teacher access")} lead={tr("Aprueba solo a docentes que conozcas o cuya institución puedas confirmar.", "Approve only teachers you know or whose institution you can confirm.")} />
      <div className="flex gap-1.5">
        {(["pending", "all"] as const).map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("focus-mist rounded-full border px-3 py-1 text-micro", filter === f ? "border-bronze text-foreground" : "border-border text-muted-foreground")}>
            {f === "pending" ? tr("Pendientes", "Pending") : tr("Todas", "All")}
          </button>
        ))}
      </div>
      {err && <p role="alert" className="mt-4 text-small text-destructive">{err}</p>}
      {isLoading && <p className="mt-6 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
      {error && <p className="mt-6 text-small text-destructive">{errorText(error, lang)}</p>}
      {data && rows.length === 0 && <p className="mt-6 text-small text-muted-foreground">{tr("No hay solicitudes.", "No requests.")}</p>}
      <ul className="mt-6 space-y-4">
        {rows.map((r) => (
          <li key={r.user_id} className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-xl text-foreground">{r.full_name}</span>
              <span className="text-small text-muted-foreground">{r.email}</span>
              <span className="label ml-auto">{STATUS[r.status]?.[lang] ?? r.status}</span>
            </div>
            <p className="mt-1 text-small text-foreground">
              {r.institution} · {r.discipline}
            </p>
            {r.message && <p className="mt-2 text-small text-muted-foreground">{r.message}</p>}
            <p className="mt-2 text-micro text-muted-foreground">{formatDate(r.created_at, lang)}</p>
            <div className="mt-3 flex gap-2">
              {r.status !== "approved" && (
                <button type="button" onClick={() => set(r.user_id, "approved")} className="btn-gold focus-mist px-3 py-1.5 text-micro">
                  {tr("Aprobar", "Approve")}
                </button>
              )}
              {r.status === "pending" && (
                <button type="button" onClick={() => set(r.user_id, "rejected")} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro">
                  {tr("Rechazar", "Reject")}
                </button>
              )}
              {r.status === "approved" && (
                <button type="button" onClick={() => set(r.user_id, "revoked")} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro">
                  {tr("Desactivar", "Disable")}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DocenteShell>
  );
}
