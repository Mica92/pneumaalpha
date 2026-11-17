import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { getInsights, type InsightsResult } from "@/lib/docente/insights.functions";
import { estimatedCost, formatDuration } from "@/lib/docente/insights";
import { KIND_LABELS } from "@/lib/docente/catalog";
import { MATERIAL_KINDS } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/docente/insights")({
  head: () => ({
    meta: [
      { title: "Teaching Insights — Kionas Docente" },
      { name: "description", content: "Métricas personales de tu trabajo de preparación: materiales, reutilización, tiempo registrado y revisiones." },
      { property: "og:title", content: "Teaching Insights — Kionas Docente" },
      { property: "og:description", content: "Tu productividad de preparación académica, sin datos de estudiantes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InsightsPage,
});

type Period = "30d" | "90d" | "all";

function InsightsPage() {
  const tr = useTr();
  const { lang } = useI18n();
  const [period, setPeriod] = useState<Period>("30d");
  const fetchInsights = useServerFn(getInsights);
  const { data, isLoading, error } = useQuery({
    queryKey: ["docente-insights", period],
    queryFn: () => fetchInsights({ data: { period } }) as Promise<InsightsResult>,
  });
  const fmtMoney = (n: number, cur: string) => {
    try {
      return new Intl.NumberFormat(lang === "es" ? "es-CL" : "en-GB", { style: "currency", currency: cur || "CLP", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${n} ${cur}`;
    }
  };
  const periods: { id: Period; label: string }[] = [
    { id: "30d", label: tr("Últimos 30 días", "Last 30 days") },
    { id: "90d", label: tr("Últimos 90 días", "Last 90 days") },
    { id: "all", label: tr("Todo", "All time") },
  ];

  return (
    <DocenteShell>
      <PageHeading
        eyebrow="08 · Teaching Insights"
        title={tr("Tu trabajo de preparación", "Your preparation work")}
        lead={tr(
          "Métricas personales sobre tus materiales y el tiempo activo que les dedicas en Kionas. No usan datos de estudiantes ni miden aprendizaje.",
          "Personal metrics about your materials and the active time you spend on them in Kionas. They use no student data and don't measure learning.",
        )}
      />
      <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label={tr("Periodo", "Period")}>
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={cn("focus-mist rounded-full border px-3 py-1 text-micro", period === p.id ? "border-bronze text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
          >
            {p.label}
          </button>
        ))}
      </div>
      {isLoading && <p role="status" className="text-small text-muted-foreground">{tr("Calculando…", "Calculating…")}</p>}
      {error && <p className="text-small text-destructive">{errorText(error, lang)}</p>}
      {data && (
        <div className="space-y-12">
          <section aria-label={tr("Resumen", "Summary")} className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={tr("Materiales creados", "Materials created")} value={String(data.created)} />
            <Stat
              label={tr("Materiales reutilizados", "Materials reused")}
              value={String(data.reused)}
              note={tr(`${data.reusedBy.converted} convertidos · ${data.reusedBy.duplicated} duplicados`, `${data.reusedBy.converted} converted · ${data.reusedBy.duplicated} duplicated`)}
            />
            <Stat
              label={tr("Declarados listos", "Marked ready")}
              value={String(Object.values(data.ready).reduce((a, b) => a + (b ?? 0), 0))}
              note={tr(`${data.ready.guide ?? 0} guías · ${data.ready.exam ?? 0} exámenes`, `${data.ready.guide ?? 0} guides · ${data.ready.exam ?? 0} exams`)}
            />
            <Stat label={tr("Mapas creados", "Maps created")} value={String(data.mapsCreated)} />
            <Stat
              label={tr("Tiempo activo registrado", "Active time recorded")}
              value={formatDuration(data.trackedSeconds, lang)}
              note={data.trackTime ? tr("Solo mientras editas en Kionas", "Only while you edit in Kionas") : tr("Registro desactivado en Preferencias", "Tracking off in Preferences")}
            />
            <Stat
              label={tr("Costo estimado de tu tiempo", "Estimated cost of your time")}
              value={(() => {
                const c = estimatedCost(data.trackedSeconds, data.hourlyRate);
                return c === null ? "—" : fmtMoney(c, data.currency);
              })()}
              note={data.hourlyRate === null ? tr("Define tu valor hora en Preferencias", "Set your hourly rate in Preferences") : tr("Tiempo × valor hora. Es una estimación, no un ahorro.", "Time × hourly rate. An estimate, not savings.")}
            />
            <Stat label={tr("Referencias por verificar", "References to verify")} value={String(data.pendingRefs)} />
            <Stat
              label={tr("Observaciones de revisión pendientes", "Pending review observations")}
              value={String(data.reviews.pending)}
              note={tr(`${data.reviews.addressed} corregidas · ${data.reviews.dismissed} descartadas · ${data.reviews.total} revisiones`, `${data.reviews.addressed} addressed · ${data.reviews.dismissed} dismissed · ${data.reviews.total} reviews`)}
            />
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground">{tr("Por tipo de material", "By material type")}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-small">
                <thead>
                  <tr className="border-b border-border text-left text-micro text-muted-foreground">
                    <th className="py-2 pr-4 font-normal">{tr("Tipo", "Type")}</th>
                    <th className="px-3 py-2 text-right font-normal">{tr("Creados", "Created")}</th>
                    <th className="px-3 py-2 text-right font-normal">{tr("Listos", "Ready")}</th>
                    <th className="px-3 py-2 text-right font-normal">{tr("Tiempo registrado", "Time recorded")}</th>
                    <th className="px-3 py-2 text-right font-normal">{tr("Mediana hasta «listo»", "Median to “ready”")}</th>
                  </tr>
                </thead>
                <tbody>
                  {MATERIAL_KINDS.map((k) => {
                    const med = data.medianToReady[k];
                    return (
                      <tr key={k} className="border-b border-border/50">
                        <td className="py-2 pr-4 text-foreground">{KIND_LABELS[k][lang]}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{data.createdByKind[k] ?? 0}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{data.ready[k] ?? 0}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{data.trackedByKind[k] ? formatDuration(data.trackedByKind[k]!, lang) : "—"}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{med ? `${formatDuration(med.seconds, lang)} (n=${med.n})` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 max-w-3xl text-micro text-muted-foreground">
              {tr(
                "«Listo» es cuando marcas un material como «Revisado por mí». La mediana solo usa materiales listos con tiempo registrado; con pocos casos es solo orientativa. No se muestra ningún porcentaje de ahorro porque no hay una línea base válida para compararlo.",
                "“Ready” is when you mark a material “Reviewed by me”. The median only uses ready materials with recorded time; with few cases it is only indicative. No savings percentage is shown because there is no valid baseline to compare against.",
              )}
            </p>
          </section>

          {data.pendingRefMaterials.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl text-foreground">{tr("Materiales con referencias por verificar", "Materials with references to verify")}</h2>
              <ul className="mt-3">
                {data.pendingRefMaterials.map((m) => (
                  <li key={m.id} className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2">
                    <Link to="/docente/material/$id" params={{ id: m.id }} className="focus-mist font-serif text-lg text-foreground hover:text-bronze-bright">
                      {m.title || tr("Sin título", "Untitled")}
                    </Link>
                    <span className="text-micro tabular-nums text-muted-foreground">{m.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="text-micro text-muted-foreground">
            <Link to="/docente/preferencias" className="focus-mist underline hover:text-foreground">{tr("Preferencias: valor hora, registro de tiempo y plantillas →", "Preferences: hourly rate, time tracking and templates →")}</Link>
          </p>
        </div>
      )}
    </DocenteShell>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-background p-4">
      <p className="text-micro text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl text-foreground tabular-nums">{value}</p>
      {note && <p className="mt-1 text-micro text-muted-foreground">{note}</p>}
    </div>
  );
}
