import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { BaseConfigFields, Field, GenerationStatus, SourceNotice, inputCls } from "@/components/docente/config-fields";
import { useSeededConfig, validateCreateSearch } from "@/components/docente/use-seeded-config";
import { EXAM_TYPES, QUESTION_TYPE_LABELS } from "@/lib/docente/catalog";
import { generateExam } from "@/lib/docente/docente-ai.functions";
import { createMaterial } from "@/lib/docente/docente.functions";
import { QUESTION_TYPES, type ExamContent, type QuestionType } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/docente/examenes/nuevo")({
  validateSearch: validateCreateSearch,
  head: () => ({
    meta: [
      { title: "Nuevo examen — Kionas Docente" },
      { name: "description", content: "Diseña exámenes con casos, análisis de argumentos y rúbricas, con versión estudiante y pauta docente." },
      { property: "og:title", content: "Nuevo examen — Kionas Docente" },
      { property: "og:description", content: "Exámenes con casos, argumentos y rúbricas editables." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewExam,
});

function NewExam() {
  const tr = useTr();
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { config, setConfig, source } = useSeededConfig({ ...search });
  const [examType, setExamType] = useState("mixed");
  const [types, setTypes] = useState<QuestionType[]>(["concept", "argument", "assumption", "case"]);
  const [count, setCount] = useState(6);
  const [total, setTotal] = useState(100);
  const [difficulty, setDifficulty] = useState<"basic" | "intermediate" | "advanced">("intermediate");
  const [responseFormat, setResponseFormat] = useState<"open" | "mixed" | "closed">("open");
  const [competencies, setCompetencies] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const generate = useServerFn(generateExam);
  const create = useServerFn(createMaterial);


  async function run() {
    if (!config.concept.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await generate({
        data: {
          ...config,
          durationMin: config.durationMin,
          examType,
          questionTypes: types,
          questionCount: count,
          totalPoints: total,
          difficulty,
          responseFormat,
          competencies,
          fromMaterialId: search.from ?? null,
        },
      });
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
      await navigate({ to: "/docente/material/$id", params: { id } });
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  async function blank() {
    setBusy(true);
    setErr(null);
    try {
      const content: ExamContent = { instructions: "", durationMin: config.durationMin, totalPoints: total, questions: [], bibliography: "" };
      const { id } = await create({
        data: {
          kind: "exam",
          title: config.concept || tr("Examen sin título", "Untitled exam"),
          concept: config.concept,
          discipline: config.discipline,
          subject: config.subject,
          level: config.level,
          language: config.language,
          content,
          sourceMaterialId: search.from ?? null,
        },
      });
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
      await navigate({ to: "/docente/material/$id", params: { id } });
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  return (
    <DocenteShell>
      <PageHeading
        eyebrow="02 · Exam Studio"
        title={tr("Nuevo examen", "New exam")}
        lead={tr(
          "Evalúa conocimiento, análisis, aplicación y razonamiento. Recibirás una pauta docente separada de la versión para estudiantes.",
          "Assess knowledge, analysis, application and reasoning. You get a teacher key kept separate from the student version.",
        )}
      />
      {source && (
        <p className="mb-6 text-small text-muted-foreground">
          {tr("A partir de:", "Based on:")} <span className="text-foreground">{source.title}</span>
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
        className="space-y-10"
      >
        <BaseConfigFields value={config} onChange={setConfig} conceptLabel={tr("Tema o concepto", "Topic or concept")} />

        <div className="grid gap-5 md:grid-cols-3">
          <Field label={tr("Tipo de prueba", "Exam type")} htmlFor="ex-type">
            <select id="ex-type" className={inputCls} value={examType} onChange={(e) => setExamType(e.target.value)}>
              {EXAM_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label[lang]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tr("Número de preguntas", "Number of questions")} htmlFor="ex-n">
            <input id="ex-n" type="number" min={1} max={30} className={inputCls} value={count} onChange={(e) => setCount(Math.max(1, Math.min(30, Number(e.target.value) || 1)))} />
          </Field>
          <Field label={tr("Puntaje total", "Total points")} htmlFor="ex-p">
            <input id="ex-p" type="number" min={1} max={1000} className={inputCls} value={total} onChange={(e) => setTotal(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))} />
          </Field>
          <Field label={tr("Dificultad", "Difficulty")} htmlFor="ex-d">
            <select id="ex-d" className={inputCls} value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
              <option value="basic">{tr("Básica", "Basic")}</option>
              <option value="intermediate">{tr("Intermedia", "Intermediate")}</option>
              <option value="advanced">{tr("Avanzada", "Advanced")}</option>
            </select>
          </Field>
          <Field label={tr("Formato de respuesta", "Response format")} htmlFor="ex-f">
            <select id="ex-f" className={inputCls} value={responseFormat} onChange={(e) => setResponseFormat(e.target.value as typeof responseFormat)}>
              <option value="open">{tr("Preguntas abiertas", "Open questions")}</option>
              <option value="mixed">{tr("Mixto", "Mixed")}</option>
              <option value="closed">{tr("Preferentemente cerradas", "Mostly closed")}</option>
            </select>
          </Field>
          <Field label={tr("Competencias", "Competencies")} htmlFor="ex-c">
            <input id="ex-c" className={inputCls} maxLength={800} value={competencies} onChange={(e) => setCompetencies(e.target.value)} placeholder={tr("Ej. argumentación, aplicación", "E.g. argumentation, application")} />
          </Field>
        </div>

        <fieldset>
          <legend className="text-small font-medium text-foreground">{tr("Tipos de pregunta", "Question types")}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {QUESTION_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2 text-small text-foreground">
                <input type="checkbox" checked={types.includes(t)} onChange={(e) => setTypes((cur) => (e.target.checked ? [...cur, t] : cur.filter((x) => x !== t)))} />
                {QUESTION_TYPE_LABELS[t][lang]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-4">
          <GenerationStatus busy={busy} error={err} onRetry={run} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !config.concept.trim()} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {busy ? tr("Generando…", "Generating…") : tr("Generar examen", "Generate exam")}
            </button>
            <button type="button" onClick={blank} disabled={busy} className="btn-ghost-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {tr("Empezar en blanco", "Start blank")}
            </button>
          </div>
          <SourceNotice />
        </div>
      </form>
    </DocenteShell>
  );
}
