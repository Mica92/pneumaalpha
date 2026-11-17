import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { BaseConfigFields, Field, GenerationStatus, SourceNotice, inputCls, ConversionNotice } from "@/components/docente/config-fields";
import { useSeededConfig, validateCreateSearch } from "@/components/docente/use-seeded-config";
import { SourcesField, parseSourceIds } from "@/components/docente/sources-ui";
import { generateMap } from "@/lib/docente/docente-ai.functions";
import { createMaterial } from "@/lib/docente/docente.functions";
import { uid, type MapContent } from "@/lib/docente/model";
import { BASE_MAPS, buildBaseMap, type BaseMap } from "@/lib/docente/base-maps";
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
  const [sourceIds, setSourceIds] = useState<string[]>(() => parseSourceIds(search.sources));
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
      const { id } = await generate({ data: { ...config, sourceIds, size, fromMaterialId: search.from ?? null, conversion: search.conv ?? null } });
      await open(id);
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  async function fromBase(b: BaseMap) {
    setBusy(true);
    setErr(null);
    try {
      const l = config.language;
      const { id } = await create({
        data: {
          kind: "map",
          title: b.concept[l],
          concept: b.concept[l],
          discipline: config.discipline,
          subject: config.subject,
          level: config.level,
          language: l,
          content: buildBaseMap(b, l),
          sourceMaterialId: null,
        },
      });
      await open(id);
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  async function manual(argument = false) {
    setBusy(true);
    setErr(null);
    try {
      const label = config.concept.trim() || (argument ? tr("Conclusión", "Conclusion") : tr("Concepto central", "Central concept"));
      const content: MapContent = argument
        ? {
            mode: "argument",
            nodes: [
              { id: uid("n"), label: tr("Premisa 1", "Premise 1"), kind: "premise", note: "", x: 400, y: 200 },
              { id: uid("n"), label: tr("Premisa 2", "Premise 2"), kind: "premise", note: "", x: 800, y: 200 },
              { id: uid("n"), label, kind: "conclusion", note: "", x: 600, y: 560 },
            ],
            edges: [],
          }
        : { nodes: [{ id: uid("n"), label, kind: "central", note: "", x: 600, y: 400 }], edges: [] };
      if (argument) {
        const [p1, p2, c] = content.nodes;
        content.edges = [
          { id: uid("e"), from: p1.id, to: c.id, relation: "grounds" },
          { id: uid("e"), from: p2.id, to: c.id, relation: "grounds" },
        ];
      }
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
        <BaseConfigFields value={config} onChange={setConfig} showDuration={false} showObjective={false} />
        <Field label={tr("Extensión", "Size")} htmlFor="mp-size" className="max-w-xs">
          <select id="mp-size" className={inputCls} value={size} onChange={(e) => setSize(e.target.value as typeof size)}>
            <option value="compact">{tr("Compacto (8–12 nodos)", "Compact (8–12 nodes)")}</option>
            <option value="full">{tr("Completo (14–22 nodos)", "Full (14–22 nodes)")}</option>
          </select>
        </Field>
        <div className="space-y-4">
          <SourcesField value={sourceIds} onChange={setSourceIds} />
          <GenerationStatus busy={busy} error={err} onRetry={run} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={busy || !config.concept.trim()} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {busy ? tr("Generando…", "Generating…") : tr("Generar mapa con IA", "Generate map with AI")}
            </button>
            <button type="button" onClick={() => manual(false)} disabled={busy} className="btn-ghost-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {tr("Crear mapa manual", "Create manual map")}
            </button>
            <button type="button" onClick={() => manual(true)} disabled={busy} className="btn-ghost-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {tr("Mapa argumentativo vacío", "Blank argument map")}
            </button>
          </div>
          <SourceNotice />
        </div>
      </form>

      {!source && !search.conv && (
        <section aria-labelledby="base-maps" className="mt-16 border-t border-border/60 pt-10">
          <h2 id="base-maps" className="font-serif text-2xl font-light text-foreground">{tr("Mapas base de Kionas", "Kionas base maps")}</h2>
          <p className="mt-2 max-w-2xl text-small text-muted-foreground">
            {tr(
              "Puntos de partida para conceptos centrales. Se copian a tu biblioteca como borrador editable: revísalos y adáptalos antes de usarlos en clase.",
              "Starting points for core concepts. They are copied to your library as an editable draft: review and adapt them before using them in class.",
            )}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BASE_MAPS.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fromBase(b)}
                  className="focus-mist block h-full w-full rounded-lg border border-border bg-card/50 p-4 text-left transition-colors hover:border-bronze disabled:opacity-50"
                >
                  <span className="block font-serif text-xl text-foreground">{b.concept[config.language]}</span>
                  <span className="mt-1 block text-small text-muted-foreground">{b.lead[config.language]}</span>
                  <span className="mt-2 block text-micro text-muted-foreground tabular-nums">{tr(`${b.nodes.length} nodos`, `${b.nodes.length} nodes`)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </DocenteShell>
  );
}
