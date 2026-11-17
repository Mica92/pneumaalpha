import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { Field, inputCls } from "@/components/docente/config-fields";
import { IntegrityBadge, ResearchTabs, useSources } from "@/components/docente/sources-ui";
import { createSource, lookupDoi } from "@/lib/docente/sources.functions";
import { INTEGRITY, INTEGRITY_LABELS, MAX_BODY_CHARS, ORIGIN_LABELS, type Integrity, type SourceOrigin } from "@/lib/docente/sources";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { formatDate } from "@/components/docente/material-list";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/docente/fuentes/")({
  head: () => ({
    meta: [
      { title: "Source Desk — Kionas Docente" },
      { name: "description", content: "Tus documentos de trabajo privados: PDF, DOCX, TXT, texto pegado y referencias DOI, con estado de verificación." },
      { property: "og:title", content: "Source Desk — Kionas Docente" },
      { property: "og:description", content: "Fuentes académicas privadas para investigar y preparar clases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SourceDesk,
});

type Tab = "file" | "paste" | "doi";
type Draft = { title: string; authors: string; year: string; container: string; doi: string; url: string; body: string; pageCount: number; note: string; origin: SourceOrigin; crossref: boolean };
const empty: Draft = { title: "", authors: "", year: "", container: "", doi: "", url: "", body: "", pageCount: 0, note: "", origin: "pasted", crossref: false };

function SourceDesk() {
  const tr = useTr();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, error } = useSources();
  const create = useServerFn(createSource);
  const lookup = useServerFn(lookupDoi);
  const [tab, setTab] = useState<Tab>("file");
  const [d, setD] = useState<Draft>(empty);
  const [busy, setBusy] = useState<null | "extract" | "doi" | "save">(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<Integrity | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [q, setQ] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy("extract");
    setErr(null);
    try {
      const { extractFile } = await import("@/lib/docente/extract");
      const x = await extractFile(file, lang);
      setD({ ...empty, origin: x.origin, title: x.title, body: x.body, pageCount: x.pageCount, note: x.note });
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(null);
    }
  }

  async function onDoi() {
    setBusy("doi");
    setErr(null);
    try {
      const m = await lookup({ data: { doi: d.doi } });
      setD((c) => ({ ...c, ...m, origin: "doi", crossref: true }));
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy("save");
    setErr(null);
    try {
      const origin: SourceOrigin = tab === "paste" ? "pasted" : tab === "doi" ? (d.doi ? "doi" : "url") : d.origin;
      const { id } = await create({
        data: {
          origin,
          title: d.title,
          authors: d.authors,
          year: d.year,
          container: d.container,
          doi: d.doi,
          url: d.url,
          body: d.body,
          pageCount: d.pageCount,
          extractionNote: d.note,
          metadataSource: d.crossref ? "crossref" : "",
        },
      });
      await qc.invalidateQueries({ queryKey: ["docente-sources"] });
      setD(empty);
      await navigate({ to: "/docente/fuentes/$id", params: { id } });
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(null);
    }
  }

  const canSave = busy === null && (d.body.trim().length > 0 || d.title.trim().length > 0 || (tab === "doi" && (d.doi.trim() || d.url.trim())));
  const list = (data ?? [])
    .filter((s) => (showArchived ? s.archived_at : !s.archived_at))
    .filter((s) => filter === "all" || s.integrity === filter)
    .filter((s) => !q.trim() || `${s.title} ${s.authors} ${s.container}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <DocenteShell>
      <PageHeading
        eyebrow="01 · Source Desk"
        title={tr("Mis fuentes", "My sources")}
        lead={tr(
          "Documentos de trabajo privados: solo tú los ves. Kionas los resume, localiza citas, compara y los usa como base de tus materiales, sin publicarlos ni enviarlos a nadie.",
          "Private working documents only you can see. Kionas summarises them, locates quotations, compares them and builds your materials on them — never publishing or sending them.",
        )}
      />
      <ResearchTabs />

      <section aria-labelledby="add-source" className="rounded-lg border border-border bg-card/60 p-5 md:p-6">
        <h2 id="add-source" className="font-serif text-2xl text-foreground">
          {tr("Añadir una fuente", "Add a source")}
        </h2>
        <div className="mt-4 flex overflow-hidden rounded border border-border text-micro" role="tablist">
          {(
            [
              ["file", tr("Subir PDF, DOCX o TXT", "Upload PDF, DOCX or TXT")],
              ["paste", tr("Pegar texto", "Paste text")],
              ["doi", tr("DOI o enlace", "DOI or link")],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setD(empty);
                setErr(null);
              }}
              className={cn("focus-mist flex-1 px-3 py-2", tab === t ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-5">
          {tab === "file" && (
            <Field
              label={tr("Archivo", "File")}
              htmlFor="src-file"
              hint={tr("Se lee en tu navegador; solo se guarda el texto extraído. Máx. 25 MB.", "Read in your browser; only the extracted text is stored. Max 25 MB.")}
            >
              <input
                id="src-file"
                type="file"
                accept=".pdf,.docx,.txt,.md,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className={cn(inputCls, "py-1.5 text-small")}
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </Field>
          )}
          {tab === "doi" && (
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <Field label="DOI" htmlFor="src-doi">
                <input id="src-doi" className={inputCls} placeholder="10.1000/xyz123" value={d.doi} onChange={(e) => setD({ ...d, doi: e.target.value, crossref: false })} />
              </Field>
              <div className="flex items-end">
                <button type="button" onClick={onDoi} disabled={busy !== null || d.doi.trim().length < 5} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-50">
                  {busy === "doi" ? tr("Consultando…", "Looking up…") : tr("Consultar Crossref", "Look up on Crossref")}
                </button>
              </div>
              <Field label={tr("o enlace bibliográfico", "or bibliographic link")} htmlFor="src-url" className="md:col-span-2">
                <input id="src-url" className={inputCls} placeholder="https://" value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} />
              </Field>
            </div>
          )}
          {busy === "extract" && <p role="status" className="text-small text-muted-foreground">{tr("Leyendo el documento…", "Reading the document…")}</p>}

          {(tab !== "file" || d.body) && (
            <Field
              label={tab === "doi" ? tr("Texto del documento (opcional)", "Document text (optional)") : tr("Texto", "Text")}
              htmlFor="src-body"
              hint={
                tab === "doi"
                  ? tr("Sin texto, queda como referencia pendiente: Kionas no puede leerla.", "Without text it stays a pending reference: Kionas cannot read it.")
                  : `${d.body.length.toLocaleString()} / ${MAX_BODY_CHARS.toLocaleString()}${d.pageCount ? ` · ${d.pageCount} ${tr("páginas", "pages")}` : ""}`
              }
            >
              <textarea id="src-body" className={cn(inputCls, "min-h-40 text-small")} maxLength={MAX_BODY_CHARS} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} />
            </Field>
          )}
          {d.note && (
            <p role="alert" className="rounded border border-bronze/40 px-3 py-2 text-small text-foreground">
              {d.note}
            </p>
          )}
          {d.crossref && (
            <p className="text-micro text-muted-foreground">
              {tr("Datos obtenidos de Crossref. Comprueban la referencia, no el contenido del documento.", "Details from Crossref. They confirm the reference, not the document's content.")}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            <Field label={tr("Título", "Title")} htmlFor="src-title" className="md:col-span-2">
              <input id="src-title" className={inputCls} maxLength={400} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
            </Field>
            <Field label={tr("Autoría", "Authors")} htmlFor="src-auth">
              <input id="src-auth" className={inputCls} maxLength={600} value={d.authors} onChange={(e) => setD({ ...d, authors: e.target.value })} />
            </Field>
            <Field label={tr("Año", "Year")} htmlFor="src-year">
              <input id="src-year" className={inputCls} maxLength={20} value={d.year} onChange={(e) => setD({ ...d, year: e.target.value })} />
            </Field>
            <Field label={tr("Revista, editorial o fuente", "Journal, publisher or venue")} htmlFor="src-cont" className="md:col-span-4">
              <input id="src-cont" className={inputCls} maxLength={400} value={d.container} onChange={(e) => setD({ ...d, container: e.target.value })} />
            </Field>
          </div>

          {err && (
            <p role="alert" className="text-small text-destructive">
              {err}
            </p>
          )}
          <button type="button" onClick={save} disabled={!canSave} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-50">
            {busy === "save" ? tr("Guardando…", "Saving…") : tr("Guardar fuente", "Save source")}
          </button>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="my-sources">
        <div className="flex flex-wrap items-end gap-3">
          <h2 id="my-sources" className="mr-auto font-serif text-2xl text-foreground">
            {tr("Biblioteca de fuentes", "Source library")}
          </h2>
          <input aria-label={tr("Buscar fuentes", "Search sources")} placeholder={tr("Buscar…", "Search…")} className={cn(inputCls, "w-48 py-1.5 text-small")} value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label={tr("Estado", "Status")} className={cn(inputCls, "w-auto py-1.5 text-small")} value={filter} onChange={(e) => setFilter(e.target.value as Integrity | "all")}>
            <option value="all">{tr("Todos los estados", "All statuses")}</option>
            {INTEGRITY.map((i) => (
              <option key={i} value={i}>
                {INTEGRITY_LABELS[i][lang]}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-small text-muted-foreground">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            {tr("Archivadas", "Archived")}
          </label>
        </div>
        {isLoading && <p className="mt-4 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
        {error && <p className="mt-4 text-small text-destructive">{errorText(error, lang)}</p>}
        {data && list.length === 0 && <p className="mt-4 text-small text-muted-foreground">{tr("No hay fuentes con estos filtros.", "No sources match these filters.")}</p>}
        <ul className="mt-4 divide-y divide-border/60 border-y border-border/60">
          {list.map((s) => (
            <li key={s.id}>
              <Link to="/docente/fuentes/$id" params={{ id: s.id }} className="focus-mist flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-muted/30">
                <span className="label w-24 shrink-0">{ORIGIN_LABELS[s.origin][lang]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-lg text-foreground">{s.title || tr("Sin título", "Untitled")}</span>
                  <span className="block truncate text-micro text-muted-foreground">
                    {[s.authors, s.year, s.page_count ? `${s.page_count} ${tr("págs.", "pp.")}` : "", s.chars ? `${Math.round(s.chars / 1000)}k ${tr("caracteres", "chars")}` : tr("sin texto", "no text")]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <IntegrityBadge value={s.integrity} />
                <span className="w-20 text-right text-micro text-muted-foreground tabular-nums">{formatDate(s.updated_at, lang)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </DocenteShell>
  );
}
