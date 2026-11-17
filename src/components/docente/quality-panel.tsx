import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { latestReview, setReviewDecision, type SavedReview } from "@/lib/docente/insights.functions";
import { DECISIONS, DECISION_LABELS, reviewCounts, type Decision } from "@/lib/docente/insights";
import { formatDate } from "./material-list";
import { reviewMaterialQuality } from "@/lib/docente/docente-ai.functions";
import { QUALITY_LABELS, assessmentWeights, type QualityStatus } from "@/lib/docente/planning";
import type { DocContent } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { inputCls } from "./config-fields";

const STATUS_MARK: Record<QualityStatus, string> = { ok: "●", attention: "◐", problem: "○" };

/** Academic Quality Assistant: observations are kept as review history with the teacher's decision on each; it never edits the material. */
export function QualityPanel({ materialId, onClose, beforeReview }: { materialId: string; onClose: () => void; beforeReview: () => Promise<unknown> | void }) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const run = useServerFn(reviewMaterialQuality);
  const fetchLatest = useServerFn(latestReview);
  const decide = useServerFn(setReviewDecision);
  const latest = useQuery({ queryKey: ["docente-review", materialId], queryFn: () => fetchLatest({ data: { materialId } }) as Promise<SavedReview | null> });
  const [objective, setObjective] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const review = latest.data ?? null;
  const report = review?.report ?? null;
  const decisions = review?.decisions ?? {};
  const statusText: Record<QualityStatus, string> = {
    ok: tr("Sin observaciones", "No observations"),
    attention: tr("Mejorable", "Could improve"),
    problem: tr("Conviene corregir", "Should be fixed"),
  };
  const counts = report ? reviewCounts(report.findings, decisions) : null;

  async function doReview() {
    setBusy(true);
    setErr(null);
    try {
      await beforeReview();
      const r = await run({ data: { id: materialId, objective } });
      qc.setQueryData(["docente-review", materialId], r);
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(false);
    }
  }

  async function setDecision(dimension: string, decision: Decision) {
    if (!review) return;
    const prev = review;
    qc.setQueryData(["docente-review", materialId], { ...review, decisions: { ...decisions, [dimension]: decision } });
    try {
      await decide({ data: { id: review.id, dimension, decision } });
    } catch (e) {
      qc.setQueryData(["docente-review", materialId], prev);
      setErr(errorText(e, lang));
    }
  }

  return (
    <section aria-labelledby="quality" className="mt-5 rounded-lg border border-border bg-card/60 p-4 md:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quality" className="font-serif text-xl text-foreground">{tr("Revisión académica", "Academic review")}</h2>
        <button type="button" onClick={onClose} className="focus-mist text-micro text-muted-foreground hover:text-foreground">{tr("Cerrar", "Close")}</button>
      </div>
      <p className="mt-1 text-small text-muted-foreground">
        {tr(
          "Revisa rigor, coherencia, nivel, pertinencia disciplinar, fuentes, pluralidad, claridad, alineamiento y calidad editorial. Son sugerencias orientativas: no cambia tu material, no lo aprueba ni equivale a una validación académica externa.",
          "Checks rigor, coherence, level, discipline fit, sources, plurality, clarity, alignment and editorial quality. These are guiding suggestions: it doesn't change or approve your material and is not an external academic validation.",
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <input aria-label={tr("Objetivo de aprendizaje (opcional)", "Learning objective (optional)")} className={cn(inputCls, "min-w-[16rem] flex-1")} maxLength={1200} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder={tr("Objetivo de aprendizaje (opcional)", "Learning objective (optional)")} />
        <button type="button" onClick={doReview} disabled={busy} className="btn-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
          {busy ? tr("Revisando…", "Reviewing…") : report ? tr("Revisar de nuevo", "Review again") : tr("Revisar material", "Review material")}
        </button>
      </div>
      {err && <p className="mt-3 text-small text-destructive">{err}</p>}
      {latest.isLoading && <p className="mt-3 text-small text-muted-foreground">{tr("Cargando la última revisión…", "Loading the last review…")}</p>}
      {report && review && (
        <div className="mt-5 space-y-4">
          <p className="text-micro text-muted-foreground">
            {tr("Revisión del", "Review of")} {formatDate(review.created_at, lang)}
            {counts && ` · ${tr("pendientes", "pending")}: ${counts.pending} · ${tr("corregidas", "addressed")}: ${counts.addressed} · ${tr("descartadas", "dismissed")}: ${counts.dismissed}`}
          </p>
          {report.overview && <p className="text-body text-foreground">{report.overview}</p>}
          <ul className="divide-y divide-border/60">
            {report.findings.map((f) => {
              const d = (decisions[f.dimension] as Decision | undefined) ?? "pending";
              return (
                <li key={f.dimension} className="py-3">
                  <p className="flex flex-wrap items-baseline gap-2">
                    <span className={cn("text-small", f.status === "problem" ? "text-destructive" : f.status === "attention" ? "text-bronze-bright" : "text-muted-foreground")} aria-hidden>{STATUS_MARK[f.status]}</span>
                    <span className="text-small font-medium text-foreground">{QUALITY_LABELS[f.dimension][lang]}</span>
                    <span className="text-micro text-muted-foreground">{statusText[f.status]}</span>
                    {f.status !== "ok" && (
                      <span className="ml-auto flex overflow-hidden rounded border border-border" role="group" aria-label={tr("Estado de la observación", "Observation status")}>
                        {DECISIONS.map((x) => (
                          <button key={x} type="button" aria-pressed={d === x} onClick={() => setDecision(f.dimension, x)} className={cn("focus-mist px-2 py-0.5 text-micro", d === x ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>
                            {DECISION_LABELS[x][lang]}
                          </button>
                        ))}
                      </span>
                    )}
                  </p>
                  {f.excerpt && <blockquote className="mt-1 border-l-2 border-border pl-3 text-small italic text-muted-foreground">«{f.excerpt}»</blockquote>}
                  {f.summary && <p className="mt-1 text-small text-foreground/90">{f.summary}</p>}
                  {f.suggestions.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-small text-muted-foreground">
                      {f.suggestions.map((s, k) => <li key={k}>{s}</li>)}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Deterministic syllabus checks: assessment weights add up to 100 %. */
export function CurriculumCheck({ content }: { content: DocContent }) {
  const tr = useTr();
  const section = content.sections.find((s) => s.key === "assessment");
  if (!section) return null;
  const { items, sum } = assessmentWeights(section.body);
  if (items.length === 0) return null;
  const ok = Math.abs(sum - 100) < 0.05;
  return (
    <p className={cn("mb-6 rounded-md border border-border px-3 py-2 text-small", ok ? "text-muted-foreground" : "text-destructive")}>
      {ok
        ? tr(`Plan de evaluación: ${items.length} instrumentos, ponderaciones suman 100 %.`, `Assessment plan: ${items.length} instruments, weights add up to 100 %.`)
        : tr(`Plan de evaluación: las ponderaciones suman ${sum} %, no 100 %.`, `Assessment plan: weights add up to ${sum} %, not 100 %.`)}
    </p>
  );
}
