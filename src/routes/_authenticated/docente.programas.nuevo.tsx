import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { BaseConfigFields, ConversionNotice, Field, GenerationStatus, SourceNotice, inputCls } from "@/components/docente/config-fields";
import { useSeededConfig, validateCreateSearch } from "@/components/docente/use-seeded-config";
import { SourcesField, parseSourceIds } from "@/components/docente/sources-ui";
import { generateCurriculum } from "@/lib/docente/docente-ai.functions";
import { CURRICULUM_APPROACHES, CURRICULUM_APPROACH_LABELS, curriculumLoad, type CurriculumApproach } from "@/lib/docente/planning";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/docente/programas/nuevo")({
  validateSearch: validateCreateSearch,
  head: () => ({
    meta: [
      { title: "Diseñar un programa de asignatura — Kionas Docente" },
      { name: "description", content: "Curriculum Architect: fundamentación, resultados de aprendizaje, unidades, cronograma y evaluación de una asignatura." },
      { property: "og:title", content: "Curriculum Architect — Kionas Docente" },
      { property: "og:description", content: "Diseña programas de asignatura alineados y editables." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewCurriculum,
});

const num = (v: string, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number(v) || lo));

function NewCurriculum() {
  const tr = useTr();
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { config, setConfig, source } = useSeededConfig(search);
  const [sourceIds, setSourceIds] = useState<string[]>(() => parseSourceIds(search.sources));
  const [weeks, setWeeks] = useState(16);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [sessionMinutes, setSessionMinutes] = useState(90);
  const [units, setUnits] = useState(4);
  const [approach, setApproach] = useState<CurriculumApproach>("thematic");
  const [profile, setProfile] = useState("");
  const [assessment, setAssessment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const generate = useServerFn(generateCurriculum);
  const load = curriculumLoad({ weeks, sessionsPerWeek, sessionMinutes });

  async function run() {
    if (!config.concept.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await generate({
        data: { ...config, sourceIds, weeks, sessionsPerWeek, sessionMinutes, units, approach, profile, assessment, fromMaterialId: search.from ?? null, conversion: search.conv ?? null },
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
        eyebrow="Curriculum Architect"
        title={tr("Diseñar un programa de asignatura", "Design a syllabus")}
        lead={tr(
          "Kionas propone fundamentación, resultados de aprendizaje, unidades, cronograma sesión a sesión y plan de evaluación. Después podrás convertir cada unidad en clases, guías o exámenes.",
          "Kionas proposes rationale, learning outcomes, units, a session-by-session schedule and an assessment plan. Then you can turn each unit into classes, guides or exams.",
        )}
      />
      {(source || search.conv) && (
        <div className="mb-6">
          <ConversionNotice conv={search.conv} sourceTitle={source?.title} />
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
        className="space-y-10"
      >
        <BaseConfigFields value={config} onChange={setConfig} showDuration={false} conceptLabel={tr("Asignatura o eje central del curso", "Course or central theme")} />
        <div className="grid gap-5 md:grid-cols-4">
          <Field label={tr("Semanas", "Weeks")} htmlFor="cu-w">
            <input id="cu-w" type="number" min={1} max={40} className={inputCls} value={weeks} onChange={(e) => setWeeks(num(e.target.value, 1, 40))} />
          </Field>
          <Field label={tr("Sesiones por semana", "Sessions per week")} htmlFor="cu-s">
            <input id="cu-s" type="number" min={1} max={7} className={inputCls} value={sessionsPerWeek} onChange={(e) => setSessionsPerWeek(num(e.target.value, 1, 7))} />
          </Field>
          <Field label={tr("Minutos por sesión", "Minutes per session")} htmlFor="cu-m">
            <input id="cu-m" type="number" min={20} max={600} className={inputCls} value={sessionMinutes} onChange={(e) => setSessionMinutes(num(e.target.value, 20, 600))} />
          </Field>
          <Field label={tr("Unidades", "Units")} htmlFor="cu-u">
            <input id="cu-u" type="number" min={2} max={10} className={inputCls} value={units} onChange={(e) => setUnits(num(e.target.value, 2, 10))} />
          </Field>
        </div>
        <p className="text-small text-muted-foreground">
          {tr(`${load.sessions} sesiones · ${load.hours} horas presenciales`, `${load.sessions} sessions · ${load.hours} contact hours`)}
        </p>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label={tr("Enfoque de diseño", "Design approach")} htmlFor="cu-a">
            <select id="cu-a" className={inputCls} value={approach} onChange={(e) => setApproach(e.target.value as CurriculumApproach)}>
              {CURRICULUM_APPROACHES.map((a) => (
                <option key={a} value={a}>{CURRICULUM_APPROACH_LABELS[a][lang]}</option>
              ))}
            </select>
          </Field>
          <Field label={tr("Requisitos de evaluación", "Assessment requirements")} htmlFor="cu-ev">
            <input id="cu-ev" className={inputCls} maxLength={800} value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder={tr("Opcional. Ej. dos pruebas y un ensayo final", "Optional. E.g. two tests and a final essay")} />
          </Field>
          <Field label={tr("Perfil de egreso o competencias", "Graduate profile or competencies")} htmlFor="cu-p" className="md:col-span-2">
            <textarea id="cu-p" rows={3} className={inputCls} maxLength={1200} value={profile} onChange={(e) => setProfile(e.target.value)} placeholder={tr("Opcional. Pega las competencias que la asignatura debe trabajar.", "Optional. Paste the competencies the course must develop.")} />
          </Field>
        </div>
        <div className="space-y-4">
          <SourcesField value={sourceIds} onChange={setSourceIds} />
          <GenerationStatus busy={busy} error={err} onRetry={run} />
          <button type="submit" disabled={busy || !config.concept.trim()} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
            {busy ? tr("Diseñando…", "Designing…") : tr("Proponer programa", "Propose syllabus")}
          </button>
          <SourceNotice />
        </div>
      </form>
    </DocenteShell>
  );
}
