import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { DisciplineInput, Field, GenerationStatus, SourceNotice, inputCls } from "@/components/docente/config-fields";
import { ResearchTabs, SourcesField, parseSourceIds } from "@/components/docente/sources-ui";
import { MaterialRow } from "@/components/docente/material-list";
import { generateResearch } from "@/lib/docente/research-ai.functions";
import { listMaterials, type MaterialSummary } from "@/lib/docente/docente.functions";
import {
  DEPTH_INFO,
  RESEARCH_DEPTHS,
  RESEARCH_INPUTS,
  RESEARCH_INPUT_LABELS,
  RESEARCH_MODES,
  RESEARCH_MODE_INFO,
  type ResearchDepth,
  type ResearchInput,
  type ResearchMode,
} from "@/lib/docente/research";
import { LEVELS } from "@/lib/docente/catalog";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ResearchSearch = { q?: string; kind?: ResearchInput; discipline?: string; sources?: string };

export const Route = createFileRoute("/_authenticated/docente/investigar")({
  validateSearch: (s: Record<string, unknown>): ResearchSearch => ({
    q: typeof s.q === "string" ? s.q.slice(0, 2000) : undefined,
    kind: typeof s.kind === "string" && (RESEARCH_INPUTS as readonly string[]).includes(s.kind) ? (s.kind as ResearchInput) : undefined,
    discipline: typeof s.discipline === "string" ? s.discipline.slice(0, 120) : undefined,
    sources: typeof s.sources === "string" && /^[0-9a-f-]{36}(,[0-9a-f-]{36}){0,2}$/i.test(s.sources) ? s.sources : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Research Desk — Kionas Docente" },
      { name: "description", content: "Investiga un concepto, pregunta, autor o problema desde perspectivas conceptuales, históricas, filosóficas, disciplinares, comparativas y críticas." },
      { property: "og:title", content: "Research Desk — Kionas Docente" },
      { property: "og:description", content: "Investigación académica para preparar clases, con matriz conceptual y fuentes propias." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResearchDesk,
});

function ResearchDesk() {
  const tr = useTr();
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const generate = useServerFn(generateResearch);
  const fetchList = useServerFn(listMaterials);
  const saved = useQuery({
    queryKey: ["docente-materials", "research"],
    queryFn: () => fetchList({ data: { kind: "research", limit: 20 } }) as Promise<MaterialSummary[]>,
  });
  const [query, setQuery] = useState(search.q ?? "");
  const [inputKind, setInputKind] = useState<ResearchInput>(search.kind ?? "concept");
  const [mode, setMode] = useState<ResearchMode>("conceptual");
  const [depth, setDepth] = useState<ResearchDepth>("academic");
  const [matrix, setMatrix] = useState(true);
  const [discipline, setDiscipline] = useState(search.discipline ?? "");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState(LEVELS[1].label[lang]);
  const [language, setLanguage] = useState<"es" | "en">(lang);
  const [sourceIds, setSourceIds] = useState<string[]>(() => parseSourceIds(search.sources));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const long = ["text", "fragment", "case"].includes(inputKind);

  async function run() {
    if (query.trim().length < 2) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await generate({ data: { query, inputKind, mode, depth, matrix, discipline, subject, level, language, sourceIds } });
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
        eyebrow="01 · Research Desk"
        title={tr("Investigar", "Research")}
        lead={tr(
          "Estudia un concepto, una pregunta, un autor, una teoría, un problema o un texto desde distintas perspectivas. El resultado se guarda en tu biblioteca y puedes convertirlo en guía, mapa, examen o clase.",
          "Study a concept, question, author, theory, problem or text from several perspectives. The result is saved to your library and can become a guide, map, exam or class.",
        )}
      />
      <ResearchTabs />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
        className="space-y-8"
      >
        <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
          <Field label={tr("Qué investigas", "What you research")} htmlFor="rs-kind">
            <select id="rs-kind" className={inputCls} value={inputKind} onChange={(e) => setInputKind(e.target.value as ResearchInput)}>
              {RESEARCH_INPUTS.map((k) => (
                <option key={k} value={k}>
                  {RESEARCH_INPUT_LABELS[k][lang]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={RESEARCH_INPUT_LABELS[inputKind][lang]} htmlFor="rs-q">
            {long ? (
              <textarea id="rs-q" required className={cn(inputCls, "min-h-40 font-serif text-lg")} maxLength={20000} value={query} onChange={(e) => setQuery(e.target.value)} />
            ) : (
              <input
                id="rs-q"
                required
                className={cn(inputCls, "font-serif text-xl")}
                maxLength={2000}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("Ej. Libertad · ¿Puede una máquina ser responsable? · Spinoza", "E.g. Freedom · Can a machine be responsible? · Spinoza")}
              />
            )}
          </Field>
        </div>

        <fieldset>
          <legend className="text-small font-medium text-foreground">{tr("Modalidad", "Mode")}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {RESEARCH_MODES.map((m) => (
              <label key={m} className={cn("cursor-pointer rounded-md border p-3 transition-colors", mode === m ? "border-bronze bg-bronze/5" : "border-border hover:border-bronze/50")}>
                <input type="radio" name="mode" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
                <span className="block text-small font-medium text-foreground">{RESEARCH_MODE_INFO[m].label[lang]}</span>
                <span className="mt-1 block text-micro text-muted-foreground">{RESEARCH_MODE_INFO[m].hint[lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-small font-medium text-foreground">{tr("Profundidad", "Depth")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {RESEARCH_DEPTHS.map((d) => (
              <label key={d} className={cn("cursor-pointer rounded-md border px-3 py-2", depth === d ? "border-bronze bg-bronze/5" : "border-border hover:border-bronze/50")}>
                <input type="radio" name="depth" className="sr-only" checked={depth === d} onChange={() => setDepth(d)} />
                <span className="block text-small font-medium text-foreground">{DEPTH_INFO[d].label[lang]}</span>
                <span className="block text-micro text-muted-foreground">{DEPTH_INFO[d].hint[lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 md:grid-cols-4">
          <Field label={tr("Disciplina (opcional)", "Discipline (optional)")} htmlFor="rs-disc">
            <DisciplineInput id="rs-disc" value={discipline} onChange={setDiscipline} />
          </Field>
          <Field label={tr("Asignatura (opcional)", "Course (optional)")} htmlFor="rs-subj">
            <input id="rs-subj" className={inputCls} maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label={tr("Nivel", "Level")} htmlFor="rs-level">
            <select id="rs-level" className={inputCls} value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.label[lang]}>
                  {l.label[lang]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={tr("Idioma", "Language")} htmlFor="rs-lang">
            <select id="rs-lang" className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value as "es" | "en")}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </Field>
        </div>

        <label className="flex items-start gap-3 text-small text-foreground">
          <input type="checkbox" className="mt-1" checked={matrix} onChange={(e) => setMatrix(e.target.checked)} />
          <span>
            {tr("Incluir matriz conceptual", "Include concept matrix")}
            <span className="block text-micro text-muted-foreground">
              {tr(
                "Significado → variantes → supuestos → teorías → autores → objeciones → disciplinas → aplicaciones, distinguiendo lo etimológico, lo filosófico y lo empírico.",
                "Meaning → variants → assumptions → theories → authors → objections → disciplines → applications, keeping etymology, philosophy and evidence apart.",
              )}
            </span>
          </span>
        </label>

        <SourcesField value={sourceIds} onChange={setSourceIds} />

        <div className="space-y-4">
          <GenerationStatus busy={busy} error={err} onRetry={run} />
          <button type="submit" disabled={busy || query.trim().length < 2} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
            {busy ? tr("Investigando…", "Researching…") : tr("Investigar", "Research")}
          </button>
          <SourceNotice />
        </div>
      </form>

      <section className="mt-16" aria-labelledby="saved-research">
        <h2 id="saved-research" className="font-serif text-2xl text-foreground">
          {tr("Investigaciones guardadas", "Saved research")}
        </h2>
        {saved.isLoading && <p className="mt-3 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
        {saved.data && saved.data.filter((m) => !m.archived_at).length === 0 && (
          <p className="mt-3 text-small text-muted-foreground">{tr("Aún no has guardado investigaciones.", "No saved research yet.")}</p>
        )}
        <ul className="mt-3">
          {saved.data
            ?.filter((m) => !m.archived_at)
            .slice(0, 8)
            .map((m) => <MaterialRow key={m.id} m={m} />)}
        </ul>
        {saved.data && saved.data.length > 8 && (
          <Link to="/docente/biblioteca" search={{ kind: "research" }} className="focus-mist mt-3 inline-block text-micro text-muted-foreground hover:text-foreground">
            {tr("Ver todas en la biblioteca", "See all in the library")}
          </Link>
        )}
      </section>
    </DocenteShell>
  );
}
