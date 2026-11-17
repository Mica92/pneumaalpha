import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { BaseConfigFields, Field, GenerationStatus, SourceNotice, inputCls, ConversionNotice } from "@/components/docente/config-fields";
import { useSeededConfig, validateCreateSearch } from "@/components/docente/use-seeded-config";
import { SourcesField, parseSourceIds } from "@/components/docente/sources-ui";
import { generateClass } from "@/lib/docente/docente-ai.functions";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { CLASS_FORMATS, CLASS_FORMAT_LABELS, type ClassFormat } from "@/lib/docente/planning";

export const Route = createFileRoute("/_authenticated/docente/clases/nueva")({
  validateSearch: validateCreateSearch,
  head: () => ({
    meta: [
      { title: "Planificar una clase — Kionas Docente" },
      { name: "description", content: "Convierte una guía o un concepto en una clase con apertura, desarrollo, confrontación, aplicación y cierre." },
      { property: "og:title", content: "Planificar una clase — Kionas Docente" },
      { property: "og:description", content: "Secuencias de clase editables a partir de tus materiales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewClass,
});

function NewClass() {
  const tr = useTr();
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { config, setConfig, source } = useSeededConfig(search);
  const [sourceIds, setSourceIds] = useState<string[]>(() => parseSourceIds(search.sources));
  const [modality, setModality] = useState<"in_person" | "online" | "hybrid">("in_person");
  const [students, setStudents] = useState(30);
  const [resources, setResources] = useState("");
  const [format, setFormat] = useState<ClassFormat>(search.conv === "debate" ? "debate" : "lecture");
  const [sessions, setSessions] = useState(search.conv === "curriculum_sequence" ? 4 : 1);
  const [teacherScript, setTeacherScript] = useState(true);
  const [priorKnowledge, setPriorKnowledge] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const generate = useServerFn(generateClass);

  async function run() {
    if (!config.concept.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await generate({ data: { ...config, sourceIds, modality, students, resources, format, sessions, teacherScript, priorKnowledge, fromMaterialId: search.from ?? null, conversion: search.conv ?? null } });
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
        eyebrow="05 · Class Studio"
        title={tr("Planificar una clase", "Plan a class")}
        lead={tr(
          "Kionas propone una clase o una secuencia de clases con preguntas detonantes, actividades, minutos y un guion docente privado. Podrás editar cada fase y proyectarla.",
          "Kionas proposes a class or a sequence of classes with opening questions, activities, timings and a private teacher script. You can edit each phase and project it.",
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
        <BaseConfigFields value={config} onChange={setConfig} conceptLabel={tr("Tema de la clase", "Class topic")} />
        <div className="grid gap-5 md:grid-cols-3">
          <Field label={tr("Modalidad", "Modality")} htmlFor="cl-mod">
            <select id="cl-mod" className={inputCls} value={modality} onChange={(e) => setModality(e.target.value as typeof modality)}>
              <option value="in_person">{tr("Presencial", "In person")}</option>
              <option value="online">{tr("En línea", "Online")}</option>
              <option value="hybrid">{tr("Híbrida", "Hybrid")}</option>
            </select>
          </Field>
          <Field label={tr("Número aproximado de estudiantes", "Approximate number of students")} htmlFor="cl-n">
            <input id="cl-n" type="number" min={1} max={1000} className={inputCls} value={students} onChange={(e) => setStudents(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))} />
          </Field>
          <Field label={tr("Recursos disponibles", "Available resources")} htmlFor="cl-r">
            <input id="cl-r" className={inputCls} maxLength={600} value={resources} onChange={(e) => setResources(e.target.value)} placeholder={tr("Ej. proyector, pizarra", "E.g. projector, whiteboard")} />
          </Field>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Field label={tr("Formato de clase", "Class format")} htmlFor="cl-fmt">
            <select id="cl-fmt" className={inputCls} value={format} onChange={(e) => setFormat(e.target.value as ClassFormat)}>
              {CLASS_FORMATS.map((f) => (
                <option key={f} value={f}>{CLASS_FORMAT_LABELS[f][lang]}</option>
              ))}
            </select>
          </Field>
          <Field label={tr("Número de sesiones", "Number of sessions")} htmlFor="cl-ses" hint={tr("Más de una crea una secuencia de clases.", "More than one creates a class sequence.")}>
            <input id="cl-ses" type="number" min={1} max={8} className={inputCls} value={sessions} onChange={(e) => setSessions(Math.max(1, Math.min(8, Number(e.target.value) || 1)))} />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-small text-foreground">
            <input type="checkbox" checked={teacherScript} onChange={(e) => setTeacherScript(e.target.checked)} />
            {tr("Incluir guion docente (solo para ti)", "Include teacher script (only for you)")}
          </label>
          <Field label={tr("Conocimientos previos de los estudiantes", "Students' prior knowledge")} htmlFor="cl-prev" className="md:col-span-3">
            <input id="cl-prev" className={inputCls} maxLength={800} value={priorKnowledge} onChange={(e) => setPriorKnowledge(e.target.value)} placeholder={tr("Opcional. Ej. ya leyeron la Apología", "Optional. E.g. they already read the Apology")} />
          </Field>
        </div>
        <div className="space-y-4">
          <SourcesField value={sourceIds} onChange={setSourceIds} />
          <GenerationStatus busy={busy} error={err} onRetry={run} />
          <button type="submit" disabled={busy || !config.concept.trim()} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
            {busy ? tr("Generando…", "Generating…") : tr("Proponer clase", "Propose class")}
          </button>
          <SourceNotice />
        </div>
      </form>
    </DocenteShell>
  );
}
