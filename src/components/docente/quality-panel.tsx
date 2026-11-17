import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { reviewMaterialQuality } from "@/lib/docente/docente-ai.functions";
import { QUALITY_LABELS, assessmentWeights, type QualityReport, type QualityStatus } from "@/lib/docente/planning";
import type { DocContent } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { inputCls } from "./config-fields";

const STATUS_MARK: Record<QualityStatus, string> = { ok: "●", attention: "◐", problem: "○" };

/** Academic Quality Assistant: an unsaved review. It never edits the material. */
export function QualityPanel({ materialId, onClose, beforeReview }: { materialId: string; onClose: () => void; beforeReview: () => Promise<unknown> | void }) {
  const tr = useTr();
  const { lang } = useI18n();
  const run = useServerFn(reviewMaterialQuality);
  const [objective, setObjective] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [report, setReport] = useState<QualityReport | null>(null);
  const statusText: Record<QualityStatus, string> = {
    ok: tr("Sin observaciones", "No observations"),
    attention: tr("Mejorable", "Could improve"),
    problem: tr("Conviene corregir", "Should be fixed"),
  };

  async function review() {
    setBusy(true);
    setErr(null);
    try {
      await beforeReview();
      setReport(await run({ data: { id: materialId, objective } }));
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(false);
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
          "Un revisor revisa rigor, coherencia, nivel, pertinencia disciplinar, fuentes, pluralidad, claridad y alineamiento. Son sugerencias: no cambia tu material ni lo aprueba.",
          "A reviewer checks rigor, coherence, level, discipline fit, sources, plurality, clarity and alignment. These are suggestions: it doesn't change or approve your material.",
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <input aria-label={tr("Objetivo de aprendizaje (opcional)", "Learning objective (optional)")} className={cn(inputCls, "min-w-[16rem] flex-1")} maxLength={1200} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder={tr("Objetivo de aprendizaje (opcional)", "Learning objective (optional)")} />
        <button type="button" onClick={review} disabled={busy} className="btn-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
          {busy ? tr("Revisando…", "Reviewing…") : report ? tr("Revisar de nuevo", "Review again") : tr("Revisar material", "Review material")}
        </button>
      </div>
      {err && <p className="mt-3 text-small text-destructive">{err}</p>}
      {report && (
        <div className="mt-5 space-y-4">
          {report.overview && <p className="text-body text-foreground">{report.overview}</p>}
          <ul className="divide-y divide-border/60">
            {report.findings.map((f) => (
              <li key={f.dimension} className="py-3">
                <p className="flex flex-wrap items-baseline gap-2">
                  <span className={cn("text-small", f.status === "problem" ? "text-destructive" : f.status === "attention" ? "text-bronze-bright" : "text-muted-foreground")} aria-hidden>{STATUS_MARK[f.status]}</span>
                  <span className="text-small font-medium text-foreground">{QUALITY_LABELS[f.dimension][lang]}</span>
                  <span className="text-micro text-muted-foreground">{statusText[f.status]}</span>
                </p>
                {f.summary && <p className="mt-1 text-small text-foreground/90">{f.summary}</p>}
                {f.suggestions.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-small text-muted-foreground">
                    {f.suggestions.map((s, k) => <li key={k}>{s}</li>)}
                  </ul>
                )}
              </li>
            ))}
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
