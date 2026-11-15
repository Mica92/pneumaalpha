import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { BaseConfigFields, Field, GenerationStatus, SourceNotice, inputCls } from "@/components/docente/config-fields";
import { useSeededConfig, validateCreateSearch } from "@/components/docente/use-seeded-config";
import { GUIDE_SECTIONS, GUIDE_TEMPLATES } from "@/lib/docente/catalog";
import { generateGuide } from "@/lib/docente/docente-ai.functions";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/docente/guias/nueva")({
  validateSearch: validateCreateSearch,
  head: () => ({
    meta: [
      { title: "Nueva guía académica — Kionas Docente" },
      { name: "description", content: "Genera una guía de estudio rigurosa adaptada a tu carrera, asignatura y nivel." },
      { property: "og:title", content: "Nueva guía académica — Kionas Docente" },
      { property: "og:description", content: "Guías de estudio adaptadas a cada disciplina." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewGuide,
});

function NewGuide() {
  const tr = useTr();
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { config, setConfig, source } = useSeededConfig(search);
  const [templateId, setTemplateId] = useState("standard");
  const [sections, setSections] = useState<string[]>(GUIDE_TEMPLATES[1].sections);
  const [depth, setDepth] = useState<"introductory" | "intermediate" | "advanced">("intermediate");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const generate = useServerFn(generateGuide);

  function pickTemplate(id: string) {
    setTemplateId(id);
    setSections(GUIDE_TEMPLATES.find((t) => t.id === id)?.sections ?? []);
  }

  async function run() {
    if (!config.concept.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const { id } = await generate({
        data: { ...config, templateId, sectionKeys: sections, depth, fromMaterialId: search.from ?? null },
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
        eyebrow={tr("01 · Studio", "01 · Studio")}
        title={tr("Nueva guía académica", "New academic guide")}
        lead={tr(
          "Kionas adapta preguntas, marcos teóricos, debates y casos a tu disciplina. Después podrás editar cada sección.",
          "Kionas adapts questions, theoretical frameworks, debates and cases to your discipline. You can then edit every section.",
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
        <BaseConfigFields value={config} onChange={setConfig} />

        <fieldset>
          <legend className="text-small font-medium text-foreground">{tr("Tipo de guía", "Guide type")}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDE_TEMPLATES.map((t) => (
              <label
                key={t.id}
                className={cn(
                  "cursor-pointer rounded-md border p-3 transition-colors",
                  templateId === t.id ? "border-bronze bg-bronze/5" : "border-border hover:border-bronze/50",
                )}
              >
                <input type="radio" name="tpl" className="sr-only" checked={templateId === t.id} onChange={() => pickTemplate(t.id)} />
                <span className="block text-small font-medium text-foreground">{t.label[lang]}</span>
                <span className="mt-1 block text-micro text-muted-foreground">{t.description[lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <details className="rounded-md border border-border p-4">
          <summary className="cursor-pointer text-small font-medium text-foreground">
            {tr("Secciones", "Sections")} ({sections.length})
          </summary>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {GUIDE_SECTIONS.map((s) => (
              <label key={s.key} className="flex items-center gap-2 text-small text-foreground">
                <input
                  type="checkbox"
                  checked={sections.includes(s.key)}
                  onChange={(e) =>
                    setSections((cur) =>
                      e.target.checked
                        ? GUIDE_SECTIONS.map((x) => x.key).filter((k) => k === s.key || cur.includes(k))
                        : cur.filter((k) => k !== s.key),
                    )
                  }
                />
                {s.label[lang]}
              </label>
            ))}
          </div>
        </details>

        <Field label={tr("Profundidad conceptual", "Conceptual depth")} htmlFor="depth" className="max-w-xs">
          <select id="depth" className={inputCls} value={depth} onChange={(e) => setDepth(e.target.value as typeof depth)}>
            <option value="introductory">{tr("Introductoria", "Introductory")}</option>
            <option value="intermediate">{tr("Intermedia", "Intermediate")}</option>
            <option value="advanced">{tr("Avanzada", "Advanced")}</option>
          </select>
        </Field>

        <div className="space-y-4">
          <GenerationStatus busy={busy} error={err} onRetry={run} />
          <button type="submit" disabled={busy || !config.concept.trim() || sections.length === 0} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
            {busy ? tr("Generando…", "Generating…") : tr("Generar guía", "Generate guide")}
          </button>
          <SourceNotice />
        </div>
      </form>
    </DocenteShell>
  );
}
