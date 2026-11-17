import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { Field, inputCls } from "@/components/docente/config-fields";
import { DocMarkdown } from "@/components/docente/doc-markdown";
import { usePreferences } from "@/components/docente/stage-e";
import { savePreferences } from "@/lib/docente/insights.functions";
import { DEFAULT_PREFERENCES, TEMPLATES, TEMPLATE_LABELS, headerFromPreferences, headerMarkdown, type Preferences, type Template } from "@/lib/docente/insights";
import { LEVELS } from "@/lib/docente/catalog";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/docente/preferencias")({
  head: () => ({
    meta: [
      { title: "Preferencias — Kionas Docente" },
      { name: "description", content: "Encabezado institucional, plantilla de documentos, valores por defecto y registro de tiempo de Kionas Docente." },
      { property: "og:title", content: "Preferencias — Kionas Docente" },
      { property: "og:description", content: "Configura tus plantillas y valores por defecto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreferencesPage,
});

function PreferencesPage() {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const { data, isLoading } = usePreferences();
  const save = useServerFn(savePreferences);
  const [p, setP] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (data) setP(data);
  }, [data]);
  const set = <K extends keyof Preferences>(k: K, v: Preferences[K]) => setP((x) => ({ ...x, [k]: v }));
  const preview = headerMarkdown(headerFromPreferences(p), lang);

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      await save({ data: p });
      await qc.invalidateQueries({ queryKey: ["docente-preferences"] });
      setMsg(tr("Preferencias guardadas.", "Preferences saved."));
    } catch (e) {
      setMsg(errorText(e, lang));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DocenteShell>
      <PageHeading
        eyebrow={tr("Preferencias", "Preferences")}
        title={tr("Tu forma de trabajar", "How you work")}
        lead={tr("Encabezado y plantilla de tus documentos, valores por defecto para crear materiales y registro de tiempo.", "Header and template for your documents, defaults for new materials and time tracking.")}
      />
      {isLoading ? (
        <p role="status" className="text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>
      ) : (
        <form
          className="space-y-12"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <section className="space-y-5">
            <h2 className="font-serif text-2xl text-foreground">{tr("Plantilla y encabezado institucional", "Template and institutional header")}</h2>
            <p className="text-small text-muted-foreground">
              {tr("Aparece en la vista de impresión, el PDF y el Word. Solo se muestran los campos que completes: Kionas nunca añade afiliaciones.", "Shown in the print view, PDF and Word. Only fields you fill in are shown: Kionas never adds affiliations.")}
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={tr("Institución", "Institution")} htmlFor="pf-i"><input id="pf-i" className={inputCls} maxLength={200} value={p.institution} onChange={(e) => set("institution", e.target.value)} /></Field>
              <Field label={tr("Facultad o departamento", "Faculty or department")} htmlFor="pf-f"><input id="pf-f" className={inputCls} maxLength={200} value={p.faculty} onChange={(e) => set("faculty", e.target.value)} /></Field>
              <Field label={tr("Curso", "Course")} htmlFor="pf-c"><input id="pf-c" className={inputCls} maxLength={200} value={p.course} onChange={(e) => set("course", e.target.value)} /></Field>
              <Field label={tr("Nombre del docente", "Teacher name")} htmlFor="pf-t"><input id="pf-t" className={inputCls} maxLength={200} value={p.teacher_name} onChange={(e) => set("teacher_name", e.target.value)} /></Field>
              <Field label={tr("Plantilla", "Template")} htmlFor="pf-tpl" hint={TEMPLATE_LABELS[p.template].hint[lang]}>
                <select id="pf-tpl" className={inputCls} value={p.template} onChange={(e) => set("template", e.target.value as Template)}>
                  {TEMPLATES.map((t) => <option key={t} value={t}>{TEMPLATE_LABELS[t][lang]}</option>)}
                </select>
              </Field>
              <label className="flex items-end gap-2 pb-2 text-small text-foreground">
                <input type="checkbox" checked={p.show_header} onChange={(e) => set("show_header", e.target.checked)} />
                {tr("Incluir el encabezado en mis documentos", "Include the header in my documents")}
              </label>
            </div>
            <div className="rounded-md border border-dashed border-border p-4">
              <p className="label mb-2">{tr("Vista previa", "Preview")}</p>
              {preview.length ? <DocMarkdown text={preview.join("\n\n")} /> : <p className="text-small text-muted-foreground">{tr("Sin encabezado.", "No header.")}</p>}
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="font-serif text-2xl text-foreground">{tr("Valores por defecto", "Defaults")}</h2>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label={tr("Carrera o disciplina", "Career or discipline")} htmlFor="pf-d"><input id="pf-d" className={inputCls} maxLength={120} value={p.default_discipline} onChange={(e) => set("default_discipline", e.target.value)} /></Field>
              <Field label={tr("Nivel académico", "Academic level")} htmlFor="pf-l">
                <select id="pf-l" className={inputCls} value={p.default_level} onChange={(e) => set("default_level", e.target.value)}>
                  <option value="">{tr("Sin preferencia", "No preference")}</option>
                  {LEVELS.map((l) => <option key={l.id} value={l.label[lang]}>{l.label[lang]}</option>)}
                </select>
              </Field>
              <Field label={tr("Idioma de los materiales", "Material language")} htmlFor="pf-lang">
                <select id="pf-lang" className={inputCls} value={p.default_language} onChange={(e) => set("default_language", e.target.value as "es" | "en")}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="font-serif text-2xl text-foreground">{tr("Tiempo y costo", "Time and cost")}</h2>
            <label className="flex items-center gap-2 text-small text-foreground">
              <input type="checkbox" checked={p.track_time} onChange={(e) => set("track_time", e.target.checked)} />
              {tr("Registrar mi tiempo activo al editar materiales", "Record my active time while editing materials")}
            </label>
            <p className="text-micro text-muted-foreground">{tr("Solo cuenta mientras la pestaña está abierta y escribes, haces clic o te desplazas. El tiempo fuera de Kionas no se registra.", "Only counts while the tab is open and you type, click or scroll. Time outside Kionas isn't recorded.")}</p>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label={tr("Valor hora (opcional)", "Hourly rate (optional)")} htmlFor="pf-r">
                <input id="pf-r" type="number" min={0} step="any" className={inputCls} value={p.hourly_rate ?? ""} onChange={(e) => set("hourly_rate", e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0))} />
              </Field>
              <Field label={tr("Moneda", "Currency")} htmlFor="pf-cur">
                <select id="pf-cur" className={inputCls} value={p.currency} onChange={(e) => set("currency", e.target.value)}>
                  {["CLP", "USD", "EUR", "ARS", "MXN", "COP", "PEN", "UYU", "BRL"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
              {busy ? tr("Guardando…", "Saving…") : tr("Guardar preferencias", "Save preferences")}
            </button>
            {msg && <p role="status" className="text-small text-muted-foreground">{msg}</p>}
          </div>
        </form>
      )}
    </DocenteShell>
  );
}
