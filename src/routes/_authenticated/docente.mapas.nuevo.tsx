import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { BaseConfigFields, Field, GenerationStatus, SourceNotice, inputCls } from "@/components/docente/config-fields";
import { useSeededConfig, validateCreateSearch } from "@/components/docente/use-seeded-config";
import { generateMap } from "@/lib/docente/docente-ai.functions";
import { createMaterial } from "@/lib/docente/docente.functions";
import { uid, type MapContent } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/docente/mapas/nuevo")({
  validateSearch: validateCreateSearch,
  head: () => ({
    meta: [
      { title: "Nuevo mapa intelectual — Kionas Docente" },
      { name: "description", content: "Crea mapas conceptuales y argumentativos editables, con relaciones con significado." },
      { property: "og:title", content: "Nuevo mapa intelectual — Kionas Docente" },
      { property: "og:description", content: "Mapas conceptuales editables con IA o desde un lienzo vacío." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewMap,
});

function NewMap() {
  const tr = useTr();
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { config, setConfig, source } = useSeededConfig(search);
  const [size, setSize] = useState<"compact" | "full">("full");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const generate = useServerFn(generateMap);
  const create = useServerFn(createMaterial);

  async function open(id: string) {
    await qc.invalidateQueries({ queryKey: ["docente-materials"] });
    await navigate({ to: "/docente/material/$id", params: { id } });
  }

  async function run() {
    if (!config.concept.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await generate({ data: { ...config, size, fromMaterialId: search.from ?? null } });
      await open(id);
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  async function manual() {
    setBusy(true);
    setErr(null);
    try {
      const label = config.concept.trim() || tr("Concepto central", "Central concept");
      const content: MapContent = { nodes: [{ id: uid("n"), label, kind: "central", note: "", x: 600, y: 400 }], edges: [] };
      const { id } = await create({
        data: {
          kind: "map",
          title: label,
          concept: config.concept,
          discipline: config.discipline,
          subject: config.subject,
          level: config.level,
          language: config.language,
          content,
          sourceMaterialId: search.from ?? null,
        },
      });
      await open(id);
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  return (
    <DocenteShell>
      <PageHeading
        eyebrow="03 · Maps"
        title={tr("Nuevo mapa intelectual", "New intellectual map")}
        lead={tr(
          "Genera una estructura con IA o empieza desde un lienzo vacío. Los mapas son editables: nodos, relaciones con nombre y notas.",
          "Generate a structure with AI or start from a blank canvas. Maps stay editable: nodes, named relations and notes.",
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
        <BaseConfigFields value={config} onChange={setConfig} showDuration={false} showObjective={false} />
        <Field label={tr("Extensión", "Size")} htmlFor="mp-size" className="max-w-xs">
          <select id="mp-size" className={inputCls} value={size} onChange={(e) => setSize(e.target.value as typeof size)}>
            <option value="compact">{tr("Compacto (8–12 nodos)", "Compact (8–12 nodes)")}</option>
            <option value="full">{tr("Completo (14–22 nodos)", "Full (14–22 nodes)")}</option>
          </select>
        </Field>
        <div className="space-y-4">
          <GenerationStatus busy={busy} error={err} onRetry={run} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !config.concept.trim()} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {busy ? tr("Generando…", "Generating…") : tr("Generar mapa con IA", "Generate map with AI")}
            </button>
            <button type="button" onClick={manual} disabled={busy} className="btn-ghost-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {tr("Crear mapa manual", "Create manual map")}
            </button>
          </div>
          <SourceNotice />
        </div>
      </form>
    </DocenteShell>
  );
}
