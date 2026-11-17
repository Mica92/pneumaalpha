import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, BookmarkPlus, Copy, Trash2 } from "lucide-react";
import {
  QUESTION_TYPES,
  auditExam,
  estimateExamMinutes,
  examPointsSum,
  rebalanceExamPoints,
  rebalanceRubric,
  rubricPointsSum,
  uid,
  type AuditIssue,
  type ExamContent,
  type ExamQuestion,
  type QuestionType,
} from "@/lib/docente/model";
import { QUESTION_TYPE_LABELS } from "@/lib/docente/catalog";
import { regenerateQuestion } from "@/lib/docente/docente-ai.functions";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DocMarkdown } from "./doc-markdown";
import { MdTextarea } from "./md-textarea";
import { Field, inputCls } from "./config-fields";
import { BankPicker, SaveToBankDialog } from "./question-bank";
import { DistractorHelper, SpecMatrixPanel } from "./exam-spec";
import { COGNITIVE_LEVELS, COGNITIVE_LABELS, asCognitive } from "@/lib/docente/planning";

export type ExamMeta = { concept: string; discipline: string; subject: string; level: string; language: "es" | "en" };

export function issueText(i: AuditIssue, lang: "es" | "en"): string {
  const q = i.questionIndex !== undefined ? (lang === "es" ? `Pregunta ${i.questionIndex + 1}: ` : `Question ${i.questionIndex + 1}: `) : "";
  const es: Record<AuditIssue["code"], string> = {
    points_total: `La suma de puntajes (${i.detail}) no coincide con el total.`,
    rubric_points: `la rúbrica suma ${i.detail} puntos.`,
    empty_prompt: "el enunciado está vacío.",
    no_guide: "no tiene respuesta esperada ni rúbrica.",
    duplicate: `parece repetir la pregunta ${i.detail}.`,
    mc_no_answer: "no tiene alternativa correcta marcada.",
    mc_few_options: "tiene menos de tres alternativas.",
    time_load: `La carga estimada (${i.detail?.replace("/", " min de ")} min) supera la duración.`,
    no_bibliography: "No hay bibliografía de referencia.",
    no_questions: "El examen no tiene preguntas.",
    no_higher_order: "Ninguna pregunta evalúa análisis, evaluación o creación.",
    unclassified_level: `${i.detail} pregunta(s) sin nivel cognitivo: la matriz queda incompleta.`,
  };
  const en: Record<AuditIssue["code"], string> = {
    points_total: `Points add up to ${i.detail}, not the total.`,
    rubric_points: `rubric adds up to ${i.detail} points.`,
    empty_prompt: "prompt is empty.",
    no_guide: "has no expected answer or rubric.",
    duplicate: `seems to repeat question ${i.detail}.`,
    mc_no_answer: "has no correct option marked.",
    mc_few_options: "has fewer than three options.",
    time_load: `Estimated load (${i.detail?.replace("/", " min of ")} min) exceeds the duration.`,
    no_bibliography: "No reference bibliography.",
    no_questions: "The exam has no questions.",
    no_higher_order: "No question assesses analysis, evaluation or creation.",
    unclassified_level: `${i.detail} question(s) without a cognitive level: the matrix is incomplete.`,
  };
  return q + (lang === "es" ? es : en)[i.code];
}

function blankQuestion(type: QuestionType = "concept"): ExamQuestion {
  return {
    id: uid("q"),
    type,
    prompt: "",
    caseText: "",
    options: type === "multiple_choice" ? ["", "", "", ""] : [],
    correctOption: null,
    points: 10,
    answerLines: 8,
    answerGuide: "",
    rubric: [],
    teacherNotes: "",
  };
}

export function ExamEditor({
  content,
  setContent,
  meta,
  materialId = null,
}: {
  content: ExamContent;
  setContent: (u: (prev: ExamContent) => ExamContent) => void;
  meta: ExamMeta;
  materialId?: string | null;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const [showKey, setShowKey] = useState(true);
  const [toBank, setToBank] = useState<ExamQuestion[] | null>(null);
  const [picking, setPicking] = useState(false);
  const [bankMsg, setBankMsg] = useState<string | null>(null);
  const issues = auditExam(content);
  const sum = examPointsSum(content);
  const est = estimateExamMinutes(content);
  const setQ = (id: string, u: (q: ExamQuestion) => ExamQuestion) =>
    setContent((c) => ({ ...c, questions: c.questions.map((q) => (q.id === id ? u(q) : q)) }));
  const move = (i: number, d: -1 | 1) =>
    setContent((c) => {
      const qs = [...c.questions];
      const j = i + d;
      if (j < 0 || j >= qs.length) return c;
      [qs[i], qs[j]] = [qs[j], qs[i]];
      return { ...c, questions: qs };
    });

  return (
    <div className="space-y-8">
      {content.variant === "B" && (
        <p className="rounded-md border border-border px-3 py-2 text-small text-muted-foreground">
          {tr(
            "Versión B: mismo contenido con orden y alternativas reorganizados. No se garantiza equivalencia psicométrica.",
            "Version B: same content with reordered questions and options. Psychometric equivalence is not guaranteed.",
          )}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-3">
        <Field label={tr("Duración (min)", "Duration (min)")} htmlFor="ex-dur">
          <input id="ex-dur" type="number" min={1} max={600} className={inputCls} value={content.durationMin} onChange={(e) => setContent((c) => ({ ...c, durationMin: Math.max(1, Number(e.target.value) || 1) }))} />
        </Field>
        <Field label={tr("Puntaje total", "Total points")} htmlFor="ex-tot">
          <input id="ex-tot" type="number" min={1} max={1000} className={inputCls} value={content.totalPoints} onChange={(e) => setContent((c) => ({ ...c, totalPoints: Math.max(1, Number(e.target.value) || 1) }))} />
        </Field>
        <div className="flex flex-col justify-end gap-1 text-small">
          <p className={cn(sum === content.totalPoints ? "text-muted-foreground" : "text-destructive")}>
            {tr("Suma actual:", "Current sum:")} <span className="tabular-nums">{sum}</span> / {content.totalPoints}
          </p>
          <p className="text-muted-foreground">
            {tr("Tiempo estimado:", "Estimated time:")} <span className="tabular-nums">~{est} min</span>
          </p>
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-small font-medium text-foreground">{tr("Instrucciones para estudiantes", "Student instructions")}</p>
        <MdTextarea value={content.instructions} onChange={(v) => setContent((c) => ({ ...c, instructions: v }))} minRows={3} ariaLabel={tr("Instrucciones", "Instructions")} />
      </div>

      <section aria-labelledby="audit" className="rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="audit" className="text-small font-medium text-foreground">
            {tr("Revisión antes de exportar", "Pre-export review")}
          </h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setContent((c) => rebalanceExamPoints(c))} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro">
              {tr("Ajustar puntajes al total", "Fit points to total")}
            </button>
            <label className="flex items-center gap-1.5 text-micro text-muted-foreground">
              <input type="checkbox" checked={showKey} onChange={(e) => setShowKey(e.target.checked)} />
              {tr("Mostrar pauta docente", "Show teacher key")}
            </label>
          </div>
        </div>
        {issues.length === 0 ? (
          <p className="mt-2 text-small text-muted-foreground">{tr("Sin observaciones automáticas. Revisa igualmente el contenido.", "No automatic observations. Still review the content.")}</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {issues.map((i, k) => (
              <li key={k} className={cn("text-small", i.severity === "error" ? "text-destructive" : "text-muted-foreground")}>
                {i.severity === "error" ? "● " : "○ "}
                {issueText(i, lang)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <SpecMatrixPanel exam={content} />

      <ol className="space-y-6">
        {content.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={i}
            count={content.questions.length}
            showKey={showKey}
            meta={meta}
            onChange={(u) => setQ(q.id, u)}
            onMove={(d) => move(i, d)}
            onDuplicate={() =>
              setContent((c) => {
                const qs = [...c.questions];
                qs.splice(i + 1, 0, { ...q, id: uid("q"), rubric: q.rubric.map((r) => ({ ...r, id: uid("c") })) });
                return { ...c, questions: qs };
              })
            }
            onRemove={() => {
              if (window.confirm(tr("¿Eliminar esta pregunta?", "Delete this question?")))
                setContent((c) => ({ ...c, questions: c.questions.filter((x) => x.id !== q.id) }));
            }}
            onSaveToBank={() => setToBank([q])}
          />
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setContent((c) => ({ ...c, questions: [...c.questions, blankQuestion()] }))} className="btn-ghost-gold focus-mist px-4 py-2 text-small">
          {tr("Añadir pregunta", "Add question")}
        </button>
        <button type="button" onClick={() => setPicking(true)} className="btn-ghost-gold focus-mist px-4 py-2 text-small">
          {tr("Insertar desde el banco", "Insert from bank")}
        </button>
        <button type="button" onClick={() => setToBank(content.questions)} disabled={content.questions.length === 0} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
          {tr("Guardar todas en el banco", "Save all to bank")}
        </button>
        {bankMsg && <span role="status" className="text-small text-muted-foreground">{bankMsg}</span>}
      </div>
      {toBank && (
        <SaveToBankDialog
          questions={toBank}
          meta={meta}
          materialId={materialId}
          onClose={(n) => {
            setToBank(null);
            if (n) setBankMsg(tr(`${n} pregunta(s) guardada(s) en tu banco.`, `${n} question(s) saved to your bank.`));
          }}
        />
      )}
      {picking && (
        <BankPicker
          onClose={() => setPicking(false)}
          onInsert={(qs) => {
            setContent((c) => ({ ...c, questions: [...c.questions, ...qs] }));
            setPicking(false);
            setBankMsg(tr(`${qs.length} pregunta(s) insertada(s). Revisa el puntaje total.`, `${qs.length} question(s) inserted. Check the total points.`));
          }}
        />
      )}

      <div>
        <p className="mb-1.5 text-small font-medium text-foreground">{tr("Bibliografía de referencia (pauta docente)", "Reference bibliography (teacher key)")}</p>
        <MdTextarea value={content.bibliography} onChange={(v) => setContent((c) => ({ ...c, bibliography: v }))} minRows={3} ariaLabel={tr("Bibliografía", "Bibliography")} />
        <p className="mt-1 text-micro text-muted-foreground">{tr("Las referencias sugeridas por IA deben verificarse antes de usarse.", "AI-suggested references must be verified before use.")}</p>
      </div>
    </div>
  );
}

function QuestionCard({
  q,
  index,
  count,
  showKey,
  meta,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
  onSaveToBank,
}: {
  q: ExamQuestion;
  index: number;
  count: number;
  showKey: boolean;
  meta: ExamMeta;
  onChange: (u: (q: ExamQuestion) => ExamQuestion) => void;
  onMove: (d: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onSaveToBank: () => void;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const regen = useServerFn(regenerateQuestion);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ExamQuestion | null>(null);
  const [regenType, setRegenType] = useState<QuestionType | "">("");
  const [instruction, setInstruction] = useState("");
  const patch = (p: Partial<ExamQuestion>) => onChange((x) => ({ ...x, ...p }));
  const rSum = rubricPointsSum(q);
  const iconBtn = "focus-mist grid h-8 w-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30";

  async function propose() {
    setBusy(true);
    setErr(null);
    try {
      const r = await regen({
        data: {
          ...meta,
          question: { type: q.type, prompt: q.prompt, caseText: q.caseText, points: q.points },
          type: regenType || undefined,
          instruction,
        },
      });
      setProposal(r);
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-lg border border-border bg-card/60 p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-serif text-xl text-foreground tabular-nums">{index + 1}.</span>
        <select aria-label={tr("Tipo de pregunta", "Question type")} value={q.type} onChange={(e) => {
          const type = e.target.value as QuestionType;
          patch({ type, options: type === "multiple_choice" && q.options.length < 2 ? ["", "", "", ""] : q.options });
        }} className={cn(inputCls, "w-auto")}>
          {QUESTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {QUESTION_TYPE_LABELS[t][lang]}
            </option>
          ))}
        </select>
        <select aria-label={tr("Nivel cognitivo", "Cognitive level")} value={q.cognitive ?? ""} onChange={(e) => patch({ cognitive: asCognitive(e.target.value) })} className={cn(inputCls, "w-auto")}>
          <option value="">{tr("Nivel cognitivo…", "Cognitive level…")}</option>
          {COGNITIVE_LEVELS.map((c) => (
            <option key={c} value={c}>{COGNITIVE_LABELS[c][lang]}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-small text-muted-foreground">
          {tr("Puntos", "Points")}
          <input type="number" min={0} max={1000} value={q.points} onChange={(e) => patch({ points: Math.max(0, Number(e.target.value) || 0) })} className="focus-mist w-20 rounded border border-border bg-transparent px-2 py-1 text-small text-foreground" />
        </label>
        <div className="ml-auto flex">
          <button type="button" className={iconBtn} onClick={() => onMove(-1)} disabled={index === 0} aria-label={tr("Subir", "Move up")}><ArrowUp className="h-4 w-4" /></button>
          <button type="button" className={iconBtn} onClick={() => onMove(1)} disabled={index === count - 1} aria-label={tr("Bajar", "Move down")}><ArrowDown className="h-4 w-4" /></button>
          <button type="button" className={iconBtn} onClick={onSaveToBank} disabled={!q.prompt.trim()} aria-label={tr("Guardar en el banco", "Save to bank")} title={tr("Guardar en el banco", "Save to bank")}><BookmarkPlus className="h-4 w-4" /></button>
          <button type="button" className={iconBtn} onClick={onDuplicate} aria-label={tr("Duplicar", "Duplicate")}><Copy className="h-4 w-4" /></button>
          <button type="button" className={iconBtn} onClick={onRemove} aria-label={tr("Eliminar", "Delete")}><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {(q.type === "case" || q.caseText) && (
          <div>
            <p className="mb-1 text-micro text-muted-foreground">{tr("Caso o texto base", "Case or source text")}</p>
            <MdTextarea value={q.caseText} onChange={(v) => patch({ caseText: v })} minRows={3} ariaLabel={tr("Caso", "Case")} />
          </div>
        )}
        <div>
          <p className="mb-1 text-micro text-muted-foreground">{tr("Enunciado", "Prompt")}</p>
          <MdTextarea value={q.prompt} onChange={(v) => patch({ prompt: v })} minRows={3} ariaLabel={tr("Enunciado", "Prompt")} />
        </div>
        {q.type === "multiple_choice" && (
          <fieldset>
            <legend className="mb-1 text-micro text-muted-foreground">{tr("Alternativas (marca la correcta)", "Options (mark the correct one)")}</legend>
            <ul className="space-y-1.5">
              {q.options.map((o, oi) => (
                <li key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`co-${q.id}`} checked={q.correctOption === oi} onChange={() => patch({ correctOption: oi })} aria-label={tr(`Correcta ${oi + 1}`, `Correct ${oi + 1}`)} />
                  <span className="w-5 text-small text-muted-foreground">{String.fromCharCode(97 + oi)})</span>
                  <input value={o} onChange={(e) => patch({ options: q.options.map((x, k) => (k === oi ? e.target.value : x)) })} className={cn(inputCls, "py-1.5")} aria-label={tr(`Alternativa ${oi + 1}`, `Option ${oi + 1}`)} />
                  <button type="button" className="focus-mist text-micro text-muted-foreground hover:text-destructive" onClick={() => onChange((x) => ({ ...x, options: x.options.filter((_, k) => k !== oi), correctOption: x.correctOption === oi ? null : x.correctOption !== null && x.correctOption > oi ? x.correctOption - 1 : x.correctOption }))} aria-label={tr("Quitar alternativa", "Remove option")}>✕</button>
                </li>
              ))}
            </ul>
            {q.options.length < 8 && (
              <button type="button" onClick={() => patch({ options: [...q.options, ""] })} className="mt-2 text-micro text-muted-foreground underline">
                {tr("Añadir alternativa", "Add option")}
              </button>
            )}
            <DistractorHelper q={q} meta={{ concept: meta.concept, discipline: meta.discipline, level: meta.level, language: meta.language }} onAdd={(t) => onChange((x) => { const blank = x.options.findIndex((o, k) => !o.trim() && k !== x.correctOption); if (blank >= 0) return { ...x, options: x.options.map((o, k) => (k === blank ? t : o)) }; return x.options.length >= 8 ? x : { ...x, options: [...x.options, t] }; })} />
          </fieldset>
        )}
        {q.type !== "multiple_choice" && (
          <label className="flex items-center gap-2 text-micro text-muted-foreground">
            {tr("Líneas de respuesta en la versión impresa", "Answer lines in the printed version")}
            <input type="number" min={0} max={60} value={q.answerLines} onChange={(e) => patch({ answerLines: Math.max(0, Math.min(60, Number(e.target.value) || 0)) })} className="focus-mist w-16 rounded border border-border bg-transparent px-1 py-0.5 text-micro text-foreground" />
          </label>
        )}

        {showKey && (
          <div className="space-y-4 rounded-md border border-bronze/40 bg-bronze/5 p-3">
            <p className="label">{tr("Pauta docente — no aparece en la versión estudiante", "Teacher key — not in the student version")}</p>
            <div>
              <p className="mb-1 text-micro text-muted-foreground">{tr("Respuesta esperada", "Expected answer")}</p>
              <MdTextarea value={q.answerGuide} onChange={(v) => patch({ answerGuide: v })} minRows={3} ariaLabel={tr("Respuesta esperada", "Expected answer")} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-micro text-muted-foreground">
                  {tr("Rúbrica", "Rubric")} · <span className={cn("tabular-nums", q.rubric.length > 0 && rSum !== q.points && "text-destructive")}>{rSum}/{q.points}</span>
                </p>
                {q.rubric.length > 0 && rSum !== q.points && (
                  <button type="button" onClick={() => onChange((x) => rebalanceRubric(x))} className="text-micro text-muted-foreground underline">
                    {tr("Ajustar a los puntos", "Fit to points")}
                  </button>
                )}
              </div>
              <ul className="mt-1 space-y-1.5">
                {q.rubric.map((c) => (
                  <li key={c.id} className="grid gap-1.5 sm:grid-cols-[1fr_2fr_5rem_auto]">
                    <input value={c.criterion} onChange={(e) => patch({ rubric: q.rubric.map((x) => (x.id === c.id ? { ...x, criterion: e.target.value } : x)) })} placeholder={tr("Criterio", "Criterion")} className={cn(inputCls, "py-1.5")} aria-label={tr("Criterio", "Criterion")} />
                    <input value={c.descriptor} onChange={(e) => patch({ rubric: q.rubric.map((x) => (x.id === c.id ? { ...x, descriptor: e.target.value } : x)) })} placeholder={tr("Descriptor de logro", "Achievement descriptor")} className={cn(inputCls, "py-1.5")} aria-label={tr("Descriptor", "Descriptor")} />
                    <input type="number" min={0} value={c.points} onChange={(e) => patch({ rubric: q.rubric.map((x) => (x.id === c.id ? { ...x, points: Math.max(0, Number(e.target.value) || 0) } : x)) })} className={cn(inputCls, "py-1.5")} aria-label={tr("Puntos del criterio", "Criterion points")} />
                    <button type="button" onClick={() => patch({ rubric: q.rubric.filter((x) => x.id !== c.id) })} className="focus-mist text-micro text-muted-foreground hover:text-destructive" aria-label={tr("Quitar criterio", "Remove criterion")}>✕</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => patch({ rubric: [...q.rubric, { id: uid("c"), criterion: "", descriptor: "", points: 0 }] })} className="mt-2 text-micro text-muted-foreground underline">
                {tr("Añadir criterio", "Add criterion")}
              </button>
            </div>
            <div>
              <p className="mb-1 text-micro text-muted-foreground">{tr("Notas para el docente", "Teacher notes")}</p>
              <MdTextarea value={q.teacherNotes} onChange={(v) => patch({ teacherNotes: v })} minRows={2} ariaLabel={tr("Notas", "Notes")} />
            </div>
          </div>
        )}

        <details className="rounded-md border border-border/70 p-3">
          <summary className="cursor-pointer text-small text-muted-foreground hover:text-foreground">{tr("Regenerar con IA", "Regenerate with AI")}</summary>
          <div className="mt-3 flex flex-wrap gap-2">
            <select aria-label={tr("Nuevo tipo", "New type")} value={regenType} onChange={(e) => setRegenType(e.target.value as QuestionType | "")} className={cn(inputCls, "w-auto")}>
              <option value="">{tr("Mismo tipo", "Same type")}</option>
              {QUESTION_TYPES.map((t) => (
                <option key={t} value={t}>{QUESTION_TYPE_LABELS[t][lang]}</option>
              ))}
            </select>
            <input value={instruction} onChange={(e) => setInstruction(e.target.value)} maxLength={600} placeholder={tr("Ej. más difícil, con un caso local…", "E.g. harder, with a local case…")} className={cn(inputCls, "min-w-48 flex-1")} aria-label={tr("Indicación", "Instruction")} />
            <button type="button" onClick={propose} disabled={busy || !q.prompt.trim()} className="btn-ghost-gold focus-mist px-3 py-2 text-small disabled:opacity-50">
              {busy ? tr("Generando…", "Generating…") : tr("Proponer", "Propose")}
            </button>
          </div>
          {err && <p role="alert" className="mt-2 text-small text-destructive">{err}</p>}
        </details>
        {proposal && (
          <div className="rounded-md border border-bronze/50 p-4">
            <p className="label">{tr("Propuesta", "Proposal")} · {QUESTION_TYPE_LABELS[proposal.type][lang]}</p>
            {proposal.caseText && <DocMarkdown text={proposal.caseText} className="mt-2 text-small" />}
            <DocMarkdown text={proposal.prompt} className="mt-2" />
            {proposal.options.length > 0 && (
              <ol className="mt-2 list-[lower-alpha] pl-6 text-small">
                {proposal.options.map((o, k) => (
                  <li key={k} className={k === proposal.correctOption ? "text-bronze-bright" : ""}>{o}</li>
                ))}
              </ol>
            )}
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => { onChange(() => ({ ...proposal, id: q.id })); setProposal(null); }} className="btn-gold focus-mist px-3 py-1.5 text-small">
                {tr("Reemplazar pregunta", "Replace question")}
              </button>
              <button type="button" onClick={() => setProposal(null)} className="btn-ghost-gold focus-mist px-3 py-1.5 text-small">
                {tr("Descartar", "Discard")}
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
