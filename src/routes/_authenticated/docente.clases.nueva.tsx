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
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const generate = useServerFn(generateClass);

  async function run() {
    if (!config.concept.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await generate({ data: { ...config, sourceIds, modality, students, resources, fromMaterialId: search.from ?? null, conversion: search.conv ?? null } });
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
          "Kionas propone apertura, desarrollo, confrontación, aplicación y cierre. Podrás editar cada fase y proyectarla.",
          "Kionas proposes opening, development, confrontation, application and closing. You can edit each phase and project it.",
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
