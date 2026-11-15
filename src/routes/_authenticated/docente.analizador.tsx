import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { Field, GenerationStatus, SourceNotice, inputCls } from "@/components/docente/config-fields";
import { analyzeArgument } from "@/lib/docente/docente-ai.functions";
import { createMaterial } from "@/lib/docente/docente.functions";
import {
  CLAIM_STATUSES,
  CLAIM_STATUS_LABELS,
  DIMENSIONS,
  analysisToDoc,
  analysisToMap,
  type AnalysisItem,
  type ArgumentAnalysis,
  type ClaimStatus,
  type DimensionKey,
} from "@/lib/docente/analysis";
import { uid } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/docente/analizador")({
  head: () => ({
    meta: [
      { title: "Analizador de argumentos — Kionas Docente" },
      { name: "description", content: "Analiza tesis, premisas, supuestos, objeciones y reconstrucciones de un razonamiento y conviértelos en guías, mapas o exámenes." },
      { property: "og:title", content: "Analizador de argumentos — Kionas Docente" },
      { property: "og:description", content: "Examina un razonamiento en diez dimensiones editables." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analyzer,
});

const INPUT_KINDS = [
  ["argument", "Razonamiento", "Reasoning"],
  ["claim", "Afirmación", "Claim"],
  ["article", "Artículo", "Article"],
  ["fragment", "Fragmento de texto", "Text fragment"],
  ["question", "Pregunta", "Question"],
  ["case", "Caso", "Case"],
  ["interpretation", "Interpretación filosófica", "Philosophical interpretation"],
] as const;
type InputKind = (typeof INPUT_KINDS)[number][0];

const DRAFT_KEY = "kionas-docente-analysis-draft";
type Draft = { text: string; inputKind: InputKind; concept: string; discipline: string; language: "es" | "en"; analysis: ArgumentAnalysis | null };

function Analyzer() {
  const tr = useTr();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeArgument);
  const create = useServerFn(createMaterial);
  const [text, setText] = useState("");
  const [inputKind, setInputKind] = useState<InputKind>("argument");
  const [concept, setConcept] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [language, setLanguage] = useState<"es" | "en">(lang);
  const [analysis, setAnalysis] = useState<ArgumentAnalysis | null>(null);
  const [busy, setBusy] = useState<null | "analyze" | "save">(null);
  const [err, setErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore the unsaved draft after hydration; it lives only in this browser.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        setText(d.text ?? "");
        setInputKind(d.inputKind ?? "argument");
        setConcept(d.concept ?? "");
        setDiscipline(d.discipline ?? "");
        if (d.language) setLanguage(d.language);
        setAnalysis(d.analysis ?? null);
      }
    } catch {
      /* ignore corrupt drafts */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const d: Draft = { text, inputKind, concept, discipline, language, analysis };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  }, [loaded, text, inputKind, concept, discipline, language, analysis]);

  async function run() {
    if (text.trim().length < 10) return;
    setBusy("analyze");
    setErr(null);
    try {
      setAnalysis(await analyze({ data: { text, inputKind, concept, discipline, language } }));
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(null);
    }
  }

  function updateItems(key: DimensionKey, fn: (items: AnalysisItem[]) => AnalysisItem[]) {
    setAnalysis((a) => (a ? { ...a, dimensions: { ...a.dimensions, [key]: fn(a.dimensions[key]) } } : a));
  }

  async function save(target: "guide" | "map" | "exam" | "questions") {
    if (!analysis) return;
    setBusy("save");
    setErr(null);
    try {
      const title = analysis.title || concept || tr("Análisis de argumento", "Argument analysis");
      const meta = { concept: concept || title, discipline, language };
      const config = { origin: "analyzer", inputKind, analyzedText: text.slice(0, 20000) };
      const { id } =
        target === "map"
          ? await create({ data: { ...meta, kind: "map", title: `${title} — ${tr("mapa argumentativo", "argument map")}`, content: analysisToMap(analysis, language), config } })
          : await create({ data: { ...meta, kind: "guide", title, content: analysisToDoc(analysis, language), config } });
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
      window.localStorage.removeItem(DRAFT_KEY);
      if (target === "exam" || target === "questions") {
        await navigate({ to: "/docente/examenes/nuevo", search: { from: id, conv: target === "exam" ? "to_exam" : "question_bank" } });
      } else {
        await navigate({ to: "/docente/material/$id", params: { id } });
      }
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(null);
    }
  }

  return (
    <DocenteShell>
      <PageHeading
        eyebrow="06 · Reasoning Analyzer"
        title={tr("Analizador de argumentos", "Reasoning analyzer")}
        lead={tr(
          "Pega una afirmación, un razonamiento, un fragmento o un caso. Kionas propone un análisis en diez dimensiones que puedes corregir antes de usarlo.",
          "Paste a claim, an argument, a passage or a case. Kionas proposes a ten-dimension analysis you can correct before using it.",
        )}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
        className="space-y-6"
      >
        <Field label={tr("Texto a analizar", "Text to analyse")} htmlFor="an-text">
          <textarea id="an-text" className={cn(inputCls, "min-h-48 font-serif text-lg")} value={text} maxLength={20000} onChange={(e) => setText(e.target.value)} required />
        </Field>
        <div className="grid gap-5 md:grid-cols-4">
          <Field label={tr("Tipo de entrada", "Input type")} htmlFor="an-kind">
            <select id="an-kind" className={inputCls} value={inputKind} onChange={(e) => setInputKind(e.target.value as InputKind)}>
              {INPUT_KINDS.map(([k, es, en]) => (
                <option key={k} value={k}>
                  {tr(es, en)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tr("Concepto (opcional)", "Concept (optional)")} htmlFor="an-concept">
            <input id="an-concept" className={inputCls} value={concept} maxLength={200} onChange={(e) => setConcept(e.target.value)} />
          </Field>
          <Field label={tr("Disciplina (opcional)", "Discipline (optional)")} htmlFor="an-disc">
            <input id="an-disc" className={inputCls} value={discipline} maxLength={120} onChange={(e) => setDiscipline(e.target.value)} />
          </Field>
          <Field label={tr("Idioma", "Language")} htmlFor="an-lang">
            <select id="an-lang" className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value as "es" | "en")}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy !== null || text.trim().length < 10} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
            {analysis ? tr("Volver a analizar", "Analyse again") : tr("Analizar", "Analyse")}
          </button>
          {analysis && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(tr("¿Descartar este análisis?", "Discard this analysis?"))) setAnalysis(null);
              }}
              className="btn-ghost-gold focus-mist px-4 py-2 text-small"
            >
              {tr("Descartar análisis", "Discard analysis")}
            </button>
          )}
        </div>
        <GenerationStatus busy={busy === "analyze"} error={err} onRetry={analysis ? undefined : run} />
        <SourceNotice />
      </form>

      {analysis && (
        <section aria-label={tr("Análisis propuesto", "Proposed analysis")} className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
            <div className="min-w-0 flex-1">
              <p className="label">{tr("Propuesta — edítala antes de usarla", "Proposal — edit it before using it")}</p>
              <input
                aria-label={tr("Título del análisis", "Analysis title")}
                className="mt-2 w-full bg-transparent font-serif text-title font-light text-foreground focus:outline-none"
                value={analysis.title}
                onChange={(e) => setAnalysis({ ...analysis, title: e.target.value.slice(0, 240) })}
              />
            </div>
          </div>

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-micro text-muted-foreground" aria-label={tr("Leyenda", "Legend")}>
            {CLAIM_STATUSES.map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <StatusDot status={s} /> {CLAIM_STATUS_LABELS[s][lang]}
              </li>
            ))}
          </ul>

          <ol className="mt-6 space-y-6">
            {DIMENSIONS.map((d, i) => (
              <li key={d.key} className="rounded-md border border-border px-5 py-4">
                <h2 className="font-serif text-xl text-foreground">
                  <span className="mr-2 text-small text-muted-foreground tabular-nums">{i + 1}</span>
                  {d.label[lang]}
                </h2>
                <p className="text-micro text-muted-foreground">{d.hint[lang]}</p>
                <ul className="mt-3 space-y-3">
                  {analysis.dimensions[d.key].map((it) => (
                    <li key={it.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                      <textarea
                        aria-label={d.label[lang]}
                        className={cn(inputCls, "min-h-16 flex-1 text-small")}
                        value={it.text}
                        onChange={(e) => updateItems(d.key, (xs) => xs.map((x) => (x.id === it.id ? { ...x, text: e.target.value.slice(0, 2000) } : x)))}
                      />
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusDot status={it.status} />
                        <select
                          aria-label={tr("Tipo de afirmación", "Claim type")}
                          className={cn(inputCls, "w-auto py-1 text-micro")}
                          value={it.status}
                          onChange={(e) => updateItems(d.key, (xs) => xs.map((x) => (x.id === it.id ? { ...x, status: e.target.value as ClaimStatus } : x)))}
                        >
                          {CLAIM_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {CLAIM_STATUS_LABELS[s][lang]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => updateItems(d.key, (xs) => xs.filter((x) => x.id !== it.id))}
                          className="focus-mist rounded px-2 py-1 text-micro text-muted-foreground hover:text-destructive"
                          aria-label={tr("Eliminar", "Remove")}
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap items-start gap-3">
                  <button
                    type="button"
                    onClick={() => updateItems(d.key, (xs) => [...xs, { id: uid("a"), text: "", status: "debatable" }])}
                    className="focus-mist text-micro text-muted-foreground underline hover:text-foreground"
                  >
                    + {tr("Añadir elemento", "Add item")}
                  </button>
                </div>
                <label className="mt-3 block">
                  <span className="text-micro text-muted-foreground">{tr("Observación docente (solo en la versión docente)", "Teacher note (teacher version only)")}</span>
                  <textarea
                    className={cn(inputCls, "mt-1 min-h-12 text-small")}
                    value={analysis.notes[d.key] ?? ""}
                    maxLength={4000}
                    onChange={(e) => setAnalysis({ ...analysis, notes: { ...analysis.notes, [d.key]: e.target.value } })}
                  />
                </label>
              </li>
            ))}
          </ol>

          <div className="sticky bottom-4 mt-8 rounded-md border border-border bg-background/95 p-4 backdrop-blur">
            <p className="mb-3 text-small text-muted-foreground">
              {tr("Usar este análisis (se guarda en tu biblioteca y queda vinculado):", "Use this analysis (saved to your library and linked):")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy !== null} onClick={() => save("guide")} className="btn-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
                {tr("Guardar como guía", "Save as guide")}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => save("map")} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
                {tr("Crear mapa argumentativo", "Create argument map")}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => save("questions")} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
                {tr("Generar preguntas", "Generate questions")}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => save("exam")} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
                {tr("Usar en un examen", "Use in an exam")}
              </button>
            </div>
            {busy === "save" && <p role="status" className="mt-2 text-micro text-muted-foreground">{tr("Guardando…", "Saving…")}</p>}
          </div>
        </section>
      )}
    </DocenteShell>
  );
}

function StatusDot({ status }: { status: ClaimStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
        status === "verifiable" && "bg-foreground",
        status === "plausible" && "bg-bronze",
        status === "debatable" && "border border-muted-foreground",
      )}
    />
  );
}
