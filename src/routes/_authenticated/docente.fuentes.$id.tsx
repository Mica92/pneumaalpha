import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell } from "@/components/docente/shell";
import { Field, inputCls } from "@/components/docente/config-fields";
import { IntegrityBadge, ResearchTabs, useSources } from "@/components/docente/sources-ui";
import { analyzeSource, compareSources, deleteSource, getSource, updateSource, type SourceDetail } from "@/lib/docente/sources.functions";
import { createMaterial } from "@/lib/docente/docente.functions";
import { INTEGRITY_LABELS, ORIGIN_LABELS, SOURCE_OPS, formatCitation, type SourceAnalysis, type SourceOp } from "@/lib/docente/sources";
import { uid, type DocSection } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/docente/fuentes/$id")({
  head: () => ({
    meta: [
      { title: "Fuente — Kionas Docente" },
      { name: "description", content: "Analiza una fuente privada: resumen, tesis, conceptos, argumentos, citas con página, preguntas y vacíos." },
      { property: "og:title", content: "Fuente — Kionas Docente" },
      { property: "og:description", content: "Análisis documental privado para profesores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SourcePage,
});

function SourcePage() {
  const { id } = Route.useParams();
  const tr = useTr();
  const { lang } = useI18n();
  const fetchOne = useServerFn(getSource);
  const q = useQuery({ queryKey: ["docente-source", id], queryFn: () => fetchOne({ data: { id } }) as Promise<SourceDetail> });
  return (
    <DocenteShell>
      <ResearchTabs />
      {q.isLoading && <p role="status" className="text-small text-muted-foreground">{tr("Abriendo fuente…", "Opening source…")}</p>}
      {q.error && (
        <div>
          <p className="text-body text-foreground">{errorText(q.error, lang)}</p>
          <Link to="/docente/fuentes" className="btn-ghost-gold focus-mist mt-4 inline-block px-4 py-2 text-small">
            {tr("Volver a mis fuentes", "Back to my sources")}
          </Link>
        </div>
      )}
      {q.data && <SourceWorkspace key={q.data.updated_at} source={q.data} />}
    </DocenteShell>
  );
}

const GROUP_LABELS: Record<string, { es: string; en: string }> = {
  agreement: { es: "Acuerdo", en: "Agreement" },
  disagreement: { es: "Desacuerdo", en: "Disagreement" },
  difference: { es: "Diferencia de enfoque", en: "Difference of approach" },
  gap: { es: "Vacío común", en: "Shared gap" },
};

function SourceWorkspace({ source }: { source: SourceDetail }) {
  const tr = useTr();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const update = useServerFn(updateSource);
  const del = useServerFn(deleteSource);
  const analyze = useServerFn(analyzeSource);
  const compare = useServerFn(compareSources);
  const create = useServerFn(createMaterial);
  const all = useSources();
  const [meta, setMeta] = useState({ title: source.title, authors: source.authors, year: source.year, container: source.container, doi: source.doi, url: source.url });
  const [notes, setNotes] = useState(source.notes);
  const [analyses, setAnalyses] = useState<Record<string, SourceAnalysis>>(source.analyses ?? {});
  const [active, setActive] = useState<string | null>(Object.keys(source.analyses ?? {}).find((k) => !k.startsWith("compare:")) ?? null);
  const [other, setOther] = useState("");
  const [consulted, setConsulted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const hasText = source.chars > 0;
  const dirty =
    notes !== source.notes || (Object.keys(meta) as (keyof typeof meta)[]).some((k) => meta[k] !== source[k]);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(errorText(e, lang));
    } finally {
      setBusy(null);
    }
  }
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["docente-sources"] }), qc.invalidateQueries({ queryKey: ["docente-source", source.id] })]);

  const runOp = (op: SourceOp, force = false) =>
    run(op, async () => {
      const r = await analyze({ data: { id: source.id, op, language: lang, force } });
      setAnalyses((a) => ({ ...a, [op]: r }));
      setActive(op);
    });
  const runCompare = (force = false) =>
    run("compare", async () => {
      if (!other) return;
      const r = await compare({ data: { a: source.id, b: other, language: lang, force } });
      setAnalyses((a) => ({ ...a, [`compare:${other}`]: r }));
      setActive(`compare:${other}`);
    });

  function opLabel(key: string): string {
    if (key.startsWith("compare:")) {
      const o = all.data?.find((s) => s.id === key.slice(8));
      return `${tr("Comparación con", "Comparison with")} «${o?.title ?? "…"}»`;
    }
    const op = SOURCE_OPS.find((o) => o.id === key);
    return op ? op[lang] : key;
  }

  async function saveAsGuide() {
    await run("guide", async () => {
      const keys = Object.keys(analyses);
      const citation = formatCitation(meta, lang);
      const sections: DocSection[] = keys.map((k) => {
        const a = analyses[k];
        const body = [
          a.intro,
          a.items
            .map((it) => {
              const page = it.page != null ? ` (p. ${it.page})` : "";
              const g = it.group ? `*${GROUP_LABELS[it.group]?.[lang] ?? it.group}* · ` : "";
              return k === "quotes" ? `> «${it.text}»${page}\n\n${it.detail}` : `- ${g}**${it.text}**${page}${it.detail ? ` — ${it.detail}` : ""}`;
            })
            .join(k === "quotes" ? "\n\n" : "\n"),
        ]
          .filter(Boolean)
          .join("\n\n");
        return { id: uid("s"), key: `source_${k.split(":")[0]}`, title: opLabel(k), body, audience: "all", epistemic: "interpretive", sources: [{ id: uid("r"), text: citation, status: source.integrity === "verified" ? "verified" : "provided" }] };
      });
      const { id } = await create({
        data: { kind: "guide", title: `${meta.title || tr("Fuente", "Source")} — ${tr("análisis", "analysis")}`, concept: meta.title, language: lang, content: { sections }, config: { origin: "source_desk", sourceIds: [source.id] } },
      });
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
      await navigate({ to: "/docente/material/$id", params: { id } });
    });
  }

  const current = active ? analyses[active] : null;
  const others = (all.data ?? []).filter((s) => s.id !== source.id && s.chars > 0 && !s.archived_at);
  const btn = "btn-ghost-gold focus-mist px-3 py-1.5 text-micro disabled:opacity-50";
  const srcParam = { sources: source.id };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 text-micro text-muted-foreground">
        <Link to="/docente/fuentes" className="focus-mist hover:text-foreground">
          ← {tr("Mis fuentes", "My sources")}
        </Link>
        <span className="label">{ORIGIN_LABELS[source.origin][lang]}</span>
        {source.page_count > 0 && `${source.page_count} ${tr("páginas", "pages")}`}
        <IntegrityBadge value={source.integrity} className="ml-auto" />
      </div>
      <h1 className="mt-3 font-serif text-title font-light text-foreground">{meta.title || tr("Sin título", "Untitled")}</h1>
      <p className="mt-1 text-small text-muted-foreground">{formatCitation(meta, lang).replace(/\*/g, "")}</p>
      {source.extraction_note && (
        <p role="alert" className="mt-4 rounded border border-bronze/40 px-3 py-2 text-small text-foreground">
          {source.extraction_note}
        </p>
      )}
      {source.metadata_source === "crossref" && (
        <p className="mt-2 text-micro text-muted-foreground">{tr("Datos bibliográficos comprobados en Crossref (no el contenido).", "Bibliographic details checked on Crossref (not the content).")}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-y border-border/60 py-3">
        <Link to="/docente/investigar" search={{ ...srcParam, q: meta.title || undefined }} className="btn-gold focus-mist px-3 py-1.5 text-micro">
          {tr("Investigar con esta fuente", "Research with this source")}
        </Link>
        <Link to="/docente/guias/nueva" search={{ ...srcParam, concept: meta.title || undefined }} className={btn}>
          {tr("Crear guía", "Create guide")}
        </Link>
        <Link to="/docente/mapas/nuevo" search={{ ...srcParam, concept: meta.title || undefined }} className={btn}>
          {tr("Crear mapa", "Create map")}
        </Link>
        <Link to="/docente/examenes/nuevo" search={{ ...srcParam, concept: meta.title || undefined }} className={btn}>
          {tr("Crear examen", "Create exam")}
        </Link>
        <Link to="/docente/clases/nueva" search={{ ...srcParam, concept: meta.title || undefined }} className={btn}>
          {tr("Preparar clase", "Plan a class")}
        </Link>
      </div>
      {msg && (
        <p role="status" className="mt-3 text-small text-destructive">
          {msg}
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <section aria-labelledby="src-analyses">
          <h2 id="src-analyses" className="font-serif text-2xl text-foreground">
            {tr("Análisis del documento", "Document analysis")}
          </h2>
          {!hasText ? (
            <p className="mt-3 text-small text-muted-foreground">
              {tr("Esta referencia no tiene texto: Kionas no puede analizarla. Añade el documento como nueva fuente para trabajar con él.", "This reference has no text, so Kionas cannot analyse it. Add the document as a new source to work with it.")}
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {SOURCE_OPS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    disabled={busy !== null}
                    onClick={() => (analyses[o.id] ? setActive(o.id) : runOp(o.id))}
                    className={cn(btn, active === o.id && "border-bronze text-foreground")}
                    aria-pressed={active === o.id}
                  >
                    {busy === o.id ? "…" : o[lang]}
                    {analyses[o.id] && " ✓"}
                  </button>
                ))}
              </div>
              {others.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <select aria-label={tr("Comparar con", "Compare with")} className={cn(inputCls, "w-auto max-w-xs py-1.5 text-small")} value={other} onChange={(e) => setOther(e.target.value)}>
                    <option value="">{tr("Comparar con otra fuente…", "Compare with another source…")}</option>
                    {others.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!other || busy !== null}
                    onClick={() => (analyses[`compare:${other}`] ? setActive(`compare:${other}`) : runCompare())}
                    className={btn}
                  >
                    {busy === "compare" ? "…" : tr("Comparar", "Compare")}
                  </button>
                </div>
              )}
              {busy && busy !== "guide" && busy !== "meta" && (
                <p role="status" className="mt-4 text-small text-muted-foreground">
                  {tr("Analizando el documento… puede tardar hasta un minuto.", "Analysing the document… this can take up to a minute.")}
                </p>
              )}
              {current && active && (
                <article className="mt-6 rounded-md border border-border px-5 py-5">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="mr-auto font-serif text-xl text-foreground">{opLabel(active)}</h3>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => (active.startsWith("compare:") ? (setOther(active.slice(8)), runCompare(true)) : runOp(active as SourceOp, true))}
                      className="focus-mist text-micro text-muted-foreground underline hover:text-foreground disabled:opacity-50"
                    >
                      {tr("Regenerar", "Regenerate")}
                    </button>
                  </div>
                  {current.truncated && (
                    <p className="mt-2 text-micro text-muted-foreground">
                      {tr("Documento extenso: se analizó hasta la página ", "Long document: analysed up to page ")}
                      {current.lastPage ?? "?"}.
                    </p>
                  )}
                  {current.dropped ? (
                    <p className="mt-2 text-micro text-muted-foreground">
                      {tr(
                        `Se descartaron ${current.dropped} citas propuestas que no aparecen literalmente en el documento.`,
                        `${current.dropped} proposed quotations were discarded because they do not appear verbatim in the document.`,
                      )}
                    </p>
                  ) : null}
                  {current.intro && <p className="mt-3 whitespace-pre-line text-body text-foreground">{current.intro}</p>}
                  <ul className="mt-4 space-y-3">
                    {current.items.map((it, i) => (
                      <li key={i} className="text-small">
                        {active === "quotes" ? (
                          <blockquote className="border-l-2 border-bronze/60 pl-3 font-serif text-lg text-foreground">
                            «{it.text}»
                            <span className="ml-2 font-sans text-micro text-muted-foreground">{it.page != null ? `p. ${it.page}` : tr("sin página", "no page")}</span>
                          </blockquote>
                        ) : (
                          <p className="text-foreground">
                            {it.group && <span className="label mr-2">{GROUP_LABELS[it.group]?.[lang] ?? it.group}</span>}
                            <strong className="font-medium">{it.text}</strong>
                          </p>
                        )}
                        {it.detail && <p className="mt-1 text-muted-foreground">{it.detail}</p>}
                      </li>
                    ))}
                  </ul>
                  {current.items.length === 0 && <p className="mt-3 text-small text-muted-foreground">{tr("Sin resultados.", "No results.")}</p>}
                </article>
              )}
              {Object.keys(analyses).length > 0 && (
                <button type="button" onClick={saveAsGuide} disabled={busy !== null} className="btn-ghost-gold focus-mist mt-6 px-4 py-2 text-small disabled:opacity-50">
                  {busy === "guide" ? tr("Guardando…", "Saving…") : tr("Guardar los análisis como guía", "Save analyses as a guide")}
                </button>
              )}
            </>
          )}

          {hasText && (
            <details className="mt-10 rounded-md border border-border p-4">
              <summary className="cursor-pointer text-small font-medium text-foreground">
                {tr("Texto extraído", "Extracted text")} · {source.chars.toLocaleString()} {tr("caracteres", "characters")}
              </summary>
              <SourceText id={source.id} />
            </details>
          )}
        </section>

        <aside className="space-y-8">
          <section aria-labelledby="src-integrity">
            <h2 id="src-integrity" className="label">
              {tr("Integridad de la fuente", "Source integrity")}
            </h2>
            <p className="mt-2 text-small text-muted-foreground">{INTEGRITY_LABELS[source.integrity].hint[lang]}</p>
            {source.integrity !== "verified" ? (
              <div className="mt-3 space-y-2 text-small text-foreground">
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" checked={consulted} onChange={(e) => setConsulted(e.target.checked)} />
                  {tr("Consulté este documento.", "I consulted this document.")}
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                  {tr("Comprobé título, autoría y datos de publicación.", "I checked title, authors and publication details.")}
                </label>
                <button
                  type="button"
                  disabled={!consulted || !checked || busy !== null}
                  onClick={() =>
                    run("verify", async () => {
                      await update({ data: { id: source.id, ...meta, integrity: "verified", consulted, detailsChecked: checked } });
                      await refresh();
                    })
                  }
                  className={btn}
                >
                  {tr("Marcar como verificada", "Mark as verified")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() =>
                  run("unverify", async () => {
                    await update({ data: { id: source.id, integrity: hasText ? "provided" : "pending" } });
                    await refresh();
                  })
                }
                className={cn(btn, "mt-3")}
              >
                {tr("Quitar verificación", "Remove verification")}
              </button>
            )}
          </section>

          <section aria-labelledby="src-meta" className="space-y-3">
            <h2 id="src-meta" className="label">
              {tr("Datos bibliográficos", "Bibliographic details")}
            </h2>
            {(
              [
                ["title", tr("Título", "Title"), 400],
                ["authors", tr("Autoría", "Authors"), 600],
                ["year", tr("Año", "Year"), 20],
                ["container", tr("Revista o editorial", "Journal or publisher"), 400],
                ["doi", "DOI", 200],
                ["url", tr("Enlace", "Link"), 1000],
              ] as const
            ).map(([k, label, max]) => (
              <Field key={k} label={label} htmlFor={`m-${k}`}>
                <input id={`m-${k}`} className={cn(inputCls, "py-1.5 text-small")} maxLength={max} value={meta[k]} onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} />
              </Field>
            ))}
            <Field label={tr("Notas privadas", "Private notes")} htmlFor="m-notes">
              <textarea id="m-notes" className={cn(inputCls, "min-h-20 text-small")} maxLength={8000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
            <button
              type="button"
              disabled={!dirty || busy !== null}
              onClick={() =>
                run("meta", async () => {
                  await update({ data: { id: source.id, ...meta, notes } });
                  await refresh();
                })
              }
              className="btn-gold focus-mist px-3 py-1.5 text-micro disabled:opacity-50"
            >
              {busy === "meta" ? tr("Guardando…", "Saving…") : tr("Guardar datos", "Save details")}
            </button>
          </section>

          <section className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                run("archive", async () => {
                  await update({ data: { id: source.id, archived: !source.archived_at } });
                  await refresh();
                })
              }
              className={btn}
            >
              {source.archived_at ? tr("Restaurar del archivo", "Restore from archive") : tr("Archivar", "Archive")}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => {
                if (!window.confirm(tr("¿Eliminar esta fuente y sus análisis? Los materiales creados con ella se conservan.", "Delete this source and its analyses? Materials made from it are kept."))) return;
                void run("delete", async () => {
                  await del({ data: { id: source.id } });
                  await qc.invalidateQueries({ queryKey: ["docente-sources"] });
                  await navigate({ to: "/docente/fuentes" });
                });
              }}
              className={cn(btn, "text-destructive")}
            >
              {tr("Eliminar", "Delete")}
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

/** The full text is only rendered when opened, to keep long documents light. */
function SourceText({ id }: { id: string }) {
  const qc = useQueryClient();
  const s = qc.getQueryData<SourceDetail>(["docente-source", id]);
  const text = s?.body ?? "";
  return (
    <pre className="mt-3 max-h-[32rem] overflow-y-auto whitespace-pre-wrap break-words font-sans text-small leading-relaxed text-muted-foreground">
      {text.slice(0, 60000)}
      {text.length > 60000 ? "\n…" : ""}
    </pre>
  );
}
