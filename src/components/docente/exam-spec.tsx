import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { QUESTION_TYPE_LABELS } from "@/lib/docente/catalog";
import { proposeDistractors } from "@/lib/docente/docente-ai.functions";
import type { ExamContent, ExamQuestion } from "@/lib/docente/model";
import { COGNITIVE_LABELS, higherOrderShare, specCell, specMatrix } from "@/lib/docente/planning";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Specification matrix: question type × cognitive level, with question counts and points. */
export function SpecMatrixPanel({ exam }: { exam: ExamContent }) {
  const tr = useTr();
  const { lang } = useI18n();
  const m = specMatrix(exam);
  const share = higherOrderShare(m);
  if (m.rows.length === 0) return null;
  const cell = (c: { count: number; points: number }) =>
    c.count === 0 ? <span className="text-muted-foreground/40">·</span> : <span className="tabular-nums">{c.count} <span className="text-muted-foreground">/ {c.points}</span></span>;
  return (
    <section aria-labelledby="spec" className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="spec" className="text-small font-medium text-foreground">{tr("Matriz de especificaciones", "Specification matrix")}</h3>
        <p className="text-micro text-muted-foreground">
          {tr("Preguntas / puntos por tipo y nivel cognitivo", "Questions / points by type and cognitive level")}
          {share !== null && ` · ${tr("orden superior", "higher order")}: ${Math.round(share * 100)} %`}
        </p>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-micro">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-1.5 pr-3 font-normal">{tr("Tipo", "Type")}</th>
              {m.cols.map((c) => (
                <th key={c} className="px-2 py-1.5 text-center font-normal">{COGNITIVE_LABELS[c][lang]}</th>
              ))}
              <th className="px-2 py-1.5 text-center font-normal">{tr("Sin nivel", "No level")}</th>
              <th className="px-2 py-1.5 text-center font-normal">{tr("Total", "Total")}</th>
            </tr>
          </thead>
          <tbody>
            {m.rows.map((r) => {
              const un = exam.questions.filter((q) => q.type === r && !q.cognitive);
              return (
                <tr key={r} className="border-b border-border/50">
                  <td className="py-1.5 pr-3 text-foreground">{QUESTION_TYPE_LABELS[r][lang]}</td>
                  {m.cols.map((c) => (
                    <td key={c} className="px-2 py-1.5 text-center">{cell(specCell(m, r, c))}</td>
                  ))}
                  <td className="px-2 py-1.5 text-center">{cell({ count: un.length, points: un.reduce((s, q) => s + q.points, 0) })}</td>
                  <td className="px-2 py-1.5 text-center font-medium">{cell(m.rowTotals[r])}</td>
                </tr>
              );
            })}
            <tr>
              <td className="py-1.5 pr-3 font-medium text-foreground">{tr("Total", "Total")}</td>
              {m.cols.map((c) => (
                <td key={c} className="px-2 py-1.5 text-center font-medium">{cell(m.colTotals[c] ?? { count: 0, points: 0 })}</td>
              ))}
              <td className="px-2 py-1.5 text-center font-medium">{cell(m.unclassified)}</td>
              <td className="px-2 py-1.5 text-center font-medium">{cell(m.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Proposes distractors for a multiple-choice question; the teacher adds each one explicitly. */
export function DistractorHelper({
  q,
  meta,
  onAdd,
}: {
  q: ExamQuestion;
  meta: { concept: string; discipline: string; level: string; language: "es" | "en" };
  onAdd: (text: string) => void;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const run = useServerFn(proposeDistractors);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<{ distractor: string; misconception: string }[]>([]);
  const correct = q.correctOption !== null ? q.options[q.correctOption]?.trim() : "";
  const ready = q.prompt.trim().length >= 3 && Boolean(correct);

  async function propose() {
    setBusy(true);
    setErr(null);
    try {
      setItems(await run({ data: { ...meta, prompt: q.prompt, correct: correct!, existing: q.options.filter(Boolean).slice(0, 8), count: 3 } }));
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-md border border-dashed border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={propose} disabled={busy || !ready} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro disabled:opacity-50">
          {busy ? tr("Proponiendo…", "Proposing…") : tr("Proponer distractores plausibles", "Propose plausible distractors")}
        </button>
        {!ready && <span className="text-micro text-muted-foreground">{tr("Escribe el enunciado y marca la alternativa correcta.", "Write the prompt and mark the correct option.")}</span>}
      </div>
      {err && <p className="mt-2 text-micro text-destructive">{err}</p>}
      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li key={it.distractor} className="flex items-start gap-3 text-small">
              <div className="flex-1">
                <p className="text-foreground">{it.distractor}</p>
                {it.misconception && <p className="text-micro text-muted-foreground">{tr("Detecta:", "Detects:")} {it.misconception}</p>}
              </div>
              <button
                type="button"
                disabled={q.options.length >= 8}
                className={cn("focus-mist shrink-0 text-micro underline text-muted-foreground hover:text-foreground disabled:opacity-40")}
                onClick={() => {
                  onAdd(it.distractor);
                  setItems((xs) => xs.filter((x) => x !== it));
                }}
              >
                {tr("Añadir", "Add")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
