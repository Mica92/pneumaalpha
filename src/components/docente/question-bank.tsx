import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DIFFICULTIES, filterBank, questionFromBank, type BankEntry, type BankFilter, type Difficulty } from "@/lib/docente/bank";
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from "@/lib/docente/catalog";
import { addToBank, deleteBankEntry, listBank, updateBankEntry } from "@/lib/docente/library.functions";
import { QUESTION_TYPES, type ExamQuestion, type QuestionType } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Field, inputCls } from "./config-fields";
import { DocMarkdown } from "./doc-markdown";
import type { ExamMeta } from "./exam-editor";

export const BANK_KEY = ["docente-bank"] as const;

export function useBank() {
  const fetchBank = useServerFn(listBank);
  return useQuery({ queryKey: BANK_KEY, queryFn: () => fetchBank() as Promise<BankEntry[]> });
}

/* ───────── Save questions from an exam ───────── */

export function SaveToBankDialog({
  questions,
  meta,
  materialId,
  onClose,
}: {
  questions: ExamQuestion[];
  meta: ExamMeta;
  materialId: string | null;
  onClose: (saved: number) => void;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const save = useServerFn(addToBank);
  const [competency, setCompetency] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [sources, setSources] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const usable = questions.filter((q) => q.prompt.trim());

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      const r = await save({
        data: {
          questions: usable,
          meta: { concept: meta.concept, discipline: meta.discipline, subject: meta.subject, competency, difficulty, sources, language: meta.language },
          sourceMaterialId: materialId,
        },
      });
      await qc.invalidateQueries({ queryKey: BANK_KEY });
      onClose(r.count);
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose(0)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">{tr("Guardar en el banco de preguntas", "Save to question bank")}</DialogTitle>
          <DialogDescription>
            {usable.length === 1
              ? tr("Se guardará 1 pregunta con su pauta docente. Solo tú puedes verla.", "1 question will be saved with its teacher key. Only you can see it.")
              : tr(`Se guardarán ${usable.length} preguntas con su pauta docente. Solo tú puedes verlas.`, `${usable.length} questions will be saved with their teacher key. Only you can see them.`)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-micro text-muted-foreground">{[meta.concept, meta.discipline, meta.subject].filter(Boolean).join(" · ")}</p>
          <Field label={tr("Competencia evaluada (opcional)", "Competency assessed (optional)")} htmlFor="bk-comp">
            <input id="bk-comp" value={competency} maxLength={300} onChange={(e) => setCompetency(e.target.value)} className={inputCls} placeholder={tr("p. ej., reconstruir un argumento", "e.g., reconstruct an argument")} />
          </Field>
          <Field label={tr("Dificultad estimada por ti", "Difficulty (your estimate)")} htmlFor="bk-diff">
            <select id="bk-diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className={inputCls}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d][lang]}</option>)}
            </select>
          </Field>
          <Field label={tr("Fuentes (opcional)", "Sources (optional)")} htmlFor="bk-src">
            <input id="bk-src" value={sources} maxLength={2000} onChange={(e) => setSources(e.target.value)} className={inputCls} />
          </Field>
          {err && <p role="alert" className="text-small text-destructive">{err}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onClose(0)} className="btn-ghost-gold focus-mist px-4 py-2 text-small">{tr("Cancelar", "Cancel")}</button>
            <button type="button" onClick={submit} disabled={busy || usable.length === 0} className="btn-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
              {busy ? "…" : tr("Guardar", "Save")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Shared filters ───────── */

function BankFilters({ f, setF, disciplines }: { f: BankFilter; setF: (f: BankFilter) => void; disciplines: string[] }) {
  const tr = useTr();
  const { lang } = useI18n();
  const sel = cn(inputCls, "w-auto py-1.5 text-micro");
  return (
    <div className="flex flex-wrap gap-2">
      <input type="search" value={f.q ?? ""} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder={tr("Buscar por enunciado, concepto o competencia…", "Search prompt, concept or competency…")} aria-label={tr("Buscar preguntas", "Search questions")} className={cn(inputCls, "min-w-56 flex-1 py-1.5 text-micro")} />
      <select aria-label={tr("Tipo", "Type")} value={f.type ?? ""} onChange={(e) => setF({ ...f, type: e.target.value as QuestionType | "" })} className={sel}>
        <option value="">{tr("Todos los tipos", "All types")}</option>
        {QUESTION_TYPES.map((t) => <option key={t} value={t}>{QUESTION_TYPE_LABELS[t][lang]}</option>)}
      </select>
      <select aria-label={tr("Dificultad", "Difficulty")} value={f.difficulty ?? ""} onChange={(e) => setF({ ...f, difficulty: e.target.value as Difficulty | "" })} className={sel}>
        <option value="">{tr("Toda dificultad", "Any difficulty")}</option>
        {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d][lang]}</option>)}
      </select>
      {disciplines.length > 1 && (
        <select aria-label={tr("Disciplina", "Discipline")} value={f.discipline ?? ""} onChange={(e) => setF({ ...f, discipline: e.target.value })} className={sel}>
          <option value="">{tr("Todas las disciplinas", "All disciplines")}</option>
          {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
      <select aria-label={tr("Estado", "Status")} value={f.review ?? ""} onChange={(e) => setF({ ...f, review: e.target.value as BankFilter["review"] })} className={sel}>
        <option value="">{tr("Revisadas y borradores", "Reviewed and drafts")}</option>
        <option value="reviewed">{tr("Revisadas por mí", "Reviewed by me")}</option>
        <option value="draft">{tr("Borradores", "Drafts")}</option>
      </select>
    </div>
  );
}

function EntryMeta({ e }: { e: BankEntry }) {
  const tr = useTr();
  const { lang } = useI18n();
  return (
    <p className="text-micro text-muted-foreground">
      {[QUESTION_TYPE_LABELS[e.qtype]?.[lang], DIFFICULTY_LABELS[e.difficulty]?.[lang], `${e.points} ${tr("pts", "pts")}`, e.concept, e.discipline, e.competency].filter(Boolean).join(" · ")}
      {" · "}
      <span className={e.review_status === "reviewed" ? "text-sage" : "text-bronze-bright"}>{e.review_status === "reviewed" ? tr("revisada", "reviewed") : tr("borrador", "draft")}</span>
    </p>
  );
}

/* ───────── Insert into an exam ───────── */

export function BankPicker({ onInsert, onClose }: { onInsert: (qs: ExamQuestion[]) => void; onClose: () => void }) {
  const tr = useTr();
  const { lang } = useI18n();
  const { data, isLoading, error } = useBank();
  const [f, setF] = useState<BankFilter>({});
  const [picked, setPicked] = useState<string[]>([]);
  const items = useMemo(() => filterBank(data ?? [], f), [data, f]);
  const disciplines = useMemo(() => [...new Set((data ?? []).map((e) => e.discipline).filter(Boolean))].sort(), [data]);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">{tr("Insertar desde el banco", "Insert from bank")}</DialogTitle>
          <DialogDescription>{tr("Las preguntas se copian al examen; el banco no cambia.", "Questions are copied into the exam; the bank is not changed.")}</DialogDescription>
        </DialogHeader>
        <BankFilters f={f} setF={setF} disciplines={disciplines} />
        <div className="-mx-1 max-h-[50vh] overflow-auto px-1">
          {isLoading && <p className="text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
          {error && <p className="text-small text-destructive">{errorText(error, lang)}</p>}
          {data && data.length === 0 && <p className="text-small text-muted-foreground">{tr("Tu banco está vacío. Guarda preguntas desde un examen.", "Your bank is empty. Save questions from an exam.")}</p>}
          <ul className="space-y-2">
            {items.map((e) => (
              <li key={e.id}>
                <label className="flex cursor-pointer gap-3 rounded-md border border-border p-3 hover:bg-muted/40">
                  <input type="checkbox" checked={picked.includes(e.id)} onChange={(ev) => setPicked((p) => (ev.target.checked ? [...p, e.id] : p.filter((x) => x !== e.id)))} className="mt-1" />
                  <span className="min-w-0">
                    <span className="line-clamp-3 block text-small text-foreground">{e.prompt}</span>
                    <EntryMeta e={e} />
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-micro text-muted-foreground">{tr(`${picked.length} seleccionadas`, `${picked.length} selected`)}</span>
          <button type="button" onClick={onClose} className="btn-ghost-gold focus-mist px-4 py-2 text-small">{tr("Cancelar", "Cancel")}</button>
          <button
            type="button"
            disabled={picked.length === 0}
            onClick={() => onInsert(picked.map((id) => data!.find((e) => e.id === id)!).filter(Boolean).map(questionFromBank))}
            className="btn-gold focus-mist px-4 py-2 text-small disabled:opacity-50"
          >
            {tr("Insertar", "Insert")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── Full bank page ───────── */

export function BankBrowser() {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const { data, isLoading, error } = useBank();
  const update = useServerFn(updateBankEntry);
  const del = useServerFn(deleteBankEntry);
  const [f, setF] = useState<BankFilter>({});
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const items = useMemo(() => filterBank(data ?? [], f), [data, f]);
  const disciplines = useMemo(() => [...new Set((data ?? []).map((e) => e.discipline).filter(Boolean))].sort(), [data]);

  async function patch(
    id: string,
    p: Partial<Pick<BankEntry, "competency" | "difficulty" | "sources" | "points">> & { reviewStatus?: "draft" | "reviewed" },
  ) {
    setErr(null);
    qc.setQueryData<BankEntry[]>(BANK_KEY, (old) =>
      old?.map((e) => (e.id === id ? { ...e, ...p, ...(p.reviewStatus ? { review_status: p.reviewStatus } : {}) } as BankEntry : e)),
    );
    try {
      await update({ data: { ...p, id } });
    } catch (e) {
      setErr(errorText(e, lang));
      await qc.invalidateQueries({ queryKey: BANK_KEY });
    }
  }

  return (
    <div className="space-y-5">
      <BankFilters f={f} setF={setF} disciplines={disciplines} />
      {isLoading && <p role="status" className="text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
      {error && <p className="text-small text-destructive">{errorText(error, lang)}</p>}
      {err && <p role="alert" className="text-small text-destructive">{err}</p>}
      {data && data.length === 0 && (
        <p className="text-body text-muted-foreground">
          {tr("Aún no hay preguntas. Abre un examen y usa «Guardar en el banco» en una pregunta o en todas.", "No questions yet. Open an exam and use “Save to bank” on one question or all of them.")}
        </p>
      )}
      {data && data.length > 0 && <p className="text-micro text-muted-foreground tabular-nums">{items.length} / {data.length}</p>}
      <ul className="space-y-3">
        {items.map((e) => (
          <li key={e.id} className="rounded-lg border border-border bg-card/60 p-4">
            <button type="button" onClick={() => setOpen(open === e.id ? null : e.id)} className="focus-mist block w-full text-left" aria-expanded={open === e.id}>
              <span className={cn("block text-body text-foreground", open !== e.id && "line-clamp-2")}>{e.prompt}</span>
              <EntryMeta e={e} />
            </button>
            {open === e.id && (
              <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
                {e.question.caseText && <DocMarkdown text={e.question.caseText} />}
                {e.question.options.length > 0 && (
                  <ol className="list-[lower-alpha] space-y-1 pl-6 text-small text-foreground">
                    {e.question.options.map((o, i) => <li key={i} className={i === e.question.correctOption ? "text-sage" : ""}>{o}</li>)}
                  </ol>
                )}
                {e.question.answerGuide && (
                  <div>
                    <p className="label">{tr("Respuesta esperada (docente)", "Expected answer (teacher)")}</p>
                    <DocMarkdown text={e.question.answerGuide} />
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-4">
                  <Field label={tr("Competencia", "Competency")} htmlFor={`c-${e.id}`}>
                    <input id={`c-${e.id}`} defaultValue={e.competency} maxLength={300} onBlur={(ev) => ev.target.value !== e.competency && patch(e.id, { competency: ev.target.value })} className={inputCls} />
                  </Field>
                  <Field label={tr("Dificultad", "Difficulty")} htmlFor={`d-${e.id}`}>
                    <select id={`d-${e.id}`} value={e.difficulty} onChange={(ev) => patch(e.id, { difficulty: ev.target.value as Difficulty })} className={inputCls}>
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABELS[d][lang]}</option>)}
                    </select>
                  </Field>
                  <Field label={tr("Puntos sugeridos", "Suggested points")} htmlFor={`p-${e.id}`}>
                    <input id={`p-${e.id}`} type="number" min={0} max={1000} defaultValue={e.points} onBlur={(ev) => Number(ev.target.value) !== e.points && patch(e.id, { points: Math.max(0, Number(ev.target.value) || 0) })} className={inputCls} />
                  </Field>
                  <Field label={tr("Fuentes", "Sources")} htmlFor={`s-${e.id}`}>
                    <input id={`s-${e.id}`} defaultValue={e.sources} maxLength={2000} onBlur={(ev) => ev.target.value !== e.sources && patch(e.id, { sources: ev.target.value })} className={inputCls} />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => patch(e.id, { reviewStatus: e.review_status === "reviewed" ? "draft" : "reviewed" })} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro" aria-pressed={e.review_status === "reviewed"}>
                    {e.review_status === "reviewed" ? tr("✓ Revisada por mí", "✓ Reviewed by me") : tr("Marcar como revisada", "Mark as reviewed")}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(tr("¿Quitar esta pregunta del banco? Los exámenes que la usan no cambian.", "Remove this question from the bank? Exams using it are not affected."))) return;
                      try {
                        await del({ data: { id: e.id } });
                        await qc.invalidateQueries({ queryKey: BANK_KEY });
                      } catch (x) {
                        setErr(errorText(x, lang));
                      }
                    }}
                    className="focus-mist ml-auto text-micro text-muted-foreground underline hover:text-destructive"
                  >
                    {tr("Quitar del banco", "Remove from bank")}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="text-micro text-muted-foreground">
        {tr(
          "La dificultad es tu estimación; Kionas no calibra ni garantiza equivalencia psicométrica entre preguntas.",
          "Difficulty is your own estimate; Kionas does not calibrate questions or guarantee psychometric equivalence.",
        )}
      </p>
    </div>
  );
}
