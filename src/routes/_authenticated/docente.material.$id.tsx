import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, SaveIndicator } from "@/components/docente/shell";
import { DocEditor } from "@/components/docente/doc-editor";
import { ExamEditor, issueText } from "@/components/docente/exam-editor";
import { MapEditor } from "@/components/docente/map-editor";
import { DocMarkdown } from "@/components/docente/doc-markdown";
import { inputCls } from "@/components/docente/config-fields";
import {
  deleteMaterial,
  duplicateMaterial,
  getMaterial,
  listVersions,
  restoreVersion,
  saveVersion,
  updateMaterial,
  type Material,
  type MaterialVersion,
} from "@/lib/docente/docente.functions";
import { KIND_LABELS } from "@/lib/docente/catalog";
import { materialToMarkdown, type Variant } from "@/lib/docente/markdown";
import { MAP_H, MAP_W, mapToSvg } from "@/lib/docente/map-svg";
import { asDoc, asExam, asMap, auditExam, makeVariantB, type DocContent, type ExamContent, type MapContent } from "@/lib/docente/model";
import { errorText, useAutosave, useTr } from "@/lib/docente/use-docente";
import { formatDate } from "@/components/docente/material-list";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/docente/material/$id")({
  head: () => ({
    meta: [
      { title: "Material — Kionas Docente" },
      { name: "description", content: "Edita, revisa y exporta tu material académico en Kionas Docente." },
      { property: "og:title", content: "Material — Kionas Docente" },
      { property: "og:description", content: "Editor de materiales académicos de Kionas Docente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MaterialPage,
});

function MaterialPage() {
  const { id } = Route.useParams();
  const tr = useTr();
  const { lang } = useI18n();
  const fetchMaterial = useServerFn(getMaterial);
  const q = useQuery({
    queryKey: ["docente-material", id],
    queryFn: () => fetchMaterial({ data: { id } }) as Promise<Material>,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  if (q.isLoading)
    return (
      <DocenteShell>
        <p role="status" className="text-small text-muted-foreground">{tr("Abriendo material…", "Opening material…")}</p>
      </DocenteShell>
    );
  if (q.error || !q.data)
    return (
      <DocenteShell>
        <p className="text-body text-foreground">{errorText(q.error, lang)}</p>
        <Link to="/docente/biblioteca" className="btn-ghost-gold focus-mist mt-4 inline-block px-4 py-2 text-small">
          {tr("Volver a la biblioteca", "Back to library")}
        </Link>
      </DocenteShell>
    );
  return <Workspace key={q.data.id + q.dataUpdatedAt} material={q.data} />;
}

type View = "edit" | "teacher" | "student";

function Workspace({ material }: { material: Material }) {
  const tr = useTr();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const kind = material.kind;
  const initialContent = useMemo<Record<string, unknown>>(() => {
    if (kind === "exam") return asExam(material.content);
    if (kind === "map") return asMap(material.content);
    return asDoc(material.content);
  }, [kind, material.content]);
  const auto = useAutosave<Record<string, unknown>>(material.id, { title: material.title, content: initialContent });
  const [view, setView] = useState<View>("edit");
  const [size, setSize] = useState<"A4" | "LETTER">(lang === "en" ? "LETTER" : "A4");
  const [review, setReview] = useState(material.review_status);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [projecting, setProjecting] = useState(false);
  const update = useServerFn(updateMaterial);
  const dup = useServerFn(duplicateMaterial);
  const del = useServerFn(deleteMaterial);
  const snap = useServerFn(saveVersion);

  const meta = {
    title: auto.title,
    kind,
    language: material.language,
    concept: material.concept,
    discipline: material.discipline,
    subject: material.subject,
    level: material.level,
  };
  const exam = kind === "exam" ? (auto.content as unknown as ExamContent) : null;
  const variants: Variant[] = kind === "map" ? ["teacher"] : ["teacher", "student"];

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

  function confirmExamIssues(): boolean {
    if (!exam) return true;
    const errors = auditExam(exam).filter((i) => i.severity === "error");
    if (errors.length === 0) return true;
    return window.confirm(
      `${tr("El examen tiene observaciones:", "The exam has issues:")}\n\n${errors.map((i) => "• " + issueText(i, lang)).join("\n")}\n\n${tr("¿Exportar de todos modos?", "Export anyway?")}`,
    );
  }

  async function exportAs(format: "pdf" | "docx" | "png", variant: Variant) {
    if (!confirmExamIssues()) return;
    await run(`${format}-${variant}`, async () => {
      const ex = await import("@/lib/docente/export");
      const md = materialToMarkdown(meta, auto.content, variant);
      const suffix = kind === "map" ? "mapa" : variant === "student" ? tr("estudiante", "student") : tr("docente", "teacher");
      let blob: Blob;
      if (kind === "map") {
        const svg = mapToSvg(auto.content as unknown as MapContent, material.language);
        blob = format === "png" ? await ex.svgToPngBlob(svg, MAP_W, MAP_H, 2) : await ex.mapToPdfBlob(svg, md, size, auto.title);
      } else if (format === "docx") blob = await ex.markdownToDocxBlob(md, size, auto.title);
      else blob = await ex.markdownToPdfBlob(md, size, auto.title);
      ex.downloadBlob(blob, ex.safeFilename(auto.title, suffix, format));
    });
  }

  async function toggleReview() {
    const next = review === "reviewed" ? "draft" : "reviewed";
    await run("review", async () => {
      await update({ data: { id: material.id, reviewStatus: next } });
      setReview(next);
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
    });
  }

  async function duplicate(variantB = false) {
    await run(variantB ? "variant" : "dup", async () => {
      await auto.flush();
      const { id } = await dup({
        data: {
          id: material.id,
          titleSuffix: variantB ? tr(" — Versión B", " — Version B") : tr(" (copia)", " (copy)"),
          content: variantB && exam ? makeVariantB(exam, Date.now() % 100000) : undefined,
        },
      });
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
      await navigate({ to: "/docente/material/$id", params: { id } });
    });
  }

  async function remove() {
    if (!window.confirm(tr("¿Eliminar este material de forma permanente? Se borrarán también sus versiones.", "Delete this material permanently? Its versions will be deleted too.")))
      return;
    await run("delete", async () => {
      await del({ data: { id: material.id } });
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
      await navigate({ to: "/docente/biblioteca" });
    });
  }

  async function saveSnapshot() {
    const note = window.prompt(tr("Nombre de esta versión (opcional)", "Name for this version (optional)"), "") ?? null;
    if (note === null) return;
    await run("snap", async () => {
      await auto.flush();
      await snap({ data: { id: material.id, note } });
      await qc.invalidateQueries({ queryKey: ["docente-versions", material.id] });
      setMsg(tr("Versión guardada.", "Version saved."));
    });
  }

  const btn = "btn-ghost-gold focus-mist px-3 py-1.5 text-micro disabled:opacity-50";

  return (
    <DocenteShell wide={kind === "map"}>
      <div className="print:hidden">
        <div className="flex flex-wrap items-center gap-3 text-micro text-muted-foreground">
          <Link to="/docente/biblioteca" className="focus-mist hover:text-foreground">
            ← {tr("Biblioteca", "Library")}
          </Link>
          <span className="label">{KIND_LABELS[kind][lang]}</span>
          {[material.discipline, material.subject, material.level].filter(Boolean).join(" · ")}
          <span className="ml-auto">
            <SaveIndicator state={auto.state} onRetry={auto.retry} />
          </span>
        </div>
        <textarea
          aria-label={tr("Título", "Title")}
          value={auto.title}
          maxLength={240}
          rows={1}
          onChange={(e) => auto.setTitle(e.target.value.replace(/\n/g, " "))}
          className="focus-mist mt-3 w-full resize-none rounded bg-transparent font-serif text-title font-light text-foreground [field-sizing:content]"
        />

        <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-border/60 py-3">
          <div className="flex overflow-hidden rounded border border-border" role="tablist" aria-label={tr("Vista", "View")}>
            {(["edit", ...variants] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn("focus-mist px-3 py-1.5 text-micro", view === v ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {v === "edit" ? tr("Editar", "Edit") : v === "teacher" ? (kind === "map" ? tr("Vista de impresión", "Print view") : tr("Versión docente", "Teacher version")) : tr("Versión estudiante", "Student version")}
              </button>
            ))}
          </div>
          <select aria-label={tr("Tamaño de página", "Page size")} value={size} onChange={(e) => setSize(e.target.value as "A4" | "LETTER")} className={cn(inputCls, "w-auto py-1.5 text-micro")}>
            <option value="A4">A4</option>
            <option value="LETTER">{tr("Carta", "Letter")}</option>
          </select>
          <details className="relative">
            <summary className={cn(btn, "list-none cursor-pointer")}>{tr("Exportar", "Export")} ▾</summary>
            <div className="absolute z-20 mt-1 w-64 rounded-md border border-border bg-popover p-2 shadow-lg">
              {kind === "map" ? (
                <>
                  <ExportItem label={tr("Imagen PNG", "PNG image")} busy={busy === "png-teacher"} onClick={() => exportAs("png", "teacher")} />
                  <ExportItem label="PDF" busy={busy === "pdf-teacher"} onClick={() => exportAs("pdf", "teacher")} />
                </>
              ) : (
                variants.map((v) => (
                  <div key={v} className="py-1">
                    <p className="px-2 pb-1 text-micro text-muted-foreground">{v === "teacher" ? tr("Versión docente", "Teacher version") : tr("Versión estudiante", "Student version")}</p>
                    <ExportItem label="PDF" busy={busy === `pdf-${v}`} onClick={() => exportAs("pdf", v)} />
                    <ExportItem label={tr("Word (DOCX)", "Word (DOCX)")} busy={busy === `docx-${v}`} onClick={() => exportAs("docx", v)} />
                  </div>
                ))
              )}
              <ExportItem
                label={tr("Imprimir vista actual", "Print current view")}
                busy={false}
                onClick={() => {
                  if (view === "edit") setView("teacher");
                  setTimeout(() => window.print(), 150);
                }}
              />
            </div>
          </details>
          <button type="button" onClick={toggleReview} disabled={busy === "review"} className={btn} aria-pressed={review === "reviewed"}>
            {review === "reviewed" ? tr("✓ Revisado por mí", "✓ Reviewed by me") : tr("Marcar como revisado", "Mark as reviewed")}
          </button>
          {kind === "class" && (
            <button type="button" onClick={() => setProjecting(true)} className={btn}>
              {tr("Proyectar", "Project")}
            </button>
          )}
          {kind === "exam" && (
            <button type="button" onClick={() => duplicate(true)} disabled={busy === "variant"} className={btn}>
              {tr("Crear versión B", "Create version B")}
            </button>
          )}
          <details className="relative">
            <summary className={cn(btn, "list-none cursor-pointer")}>{tr("Más", "More")} ▾</summary>
            <div className="absolute z-20 mt-1 w-64 rounded-md border border-border bg-popover p-2 shadow-lg">
              {kind !== "exam" && <DeriveLink to="/docente/examenes/nuevo" from={material.id} label={tr("Crear examen a partir de esto", "Create exam from this")} />}
              {kind !== "map" && <DeriveLink to="/docente/mapas/nuevo" from={material.id} label={tr("Crear mapa a partir de esto", "Create map from this")} />}
              {kind !== "class" && <DeriveLink to="/docente/clases/nueva" from={material.id} label={tr("Planificar una clase con esto", "Plan a class with this")} />}
              <ExportItem label={tr("Duplicar", "Duplicate")} busy={busy === "dup"} onClick={() => duplicate(false)} />
              <ExportItem label={tr("Guardar versión", "Save version")} busy={busy === "snap"} onClick={saveSnapshot} />
              <ExportItem label={tr("Historial de versiones", "Version history")} busy={false} onClick={() => setShowVersions((s) => !s)} />
              <ExportItem label={tr("Eliminar", "Delete")} busy={busy === "delete"} onClick={remove} danger />
            </div>
          </details>
        </div>
        {msg && (
          <p role="status" className="mt-3 text-small text-muted-foreground">
            {msg}
          </p>
        )}
        {busy && busy !== "review" && (
          <p role="status" className="mt-3 text-small text-muted-foreground">
            {tr("Procesando…", "Working…")}
          </p>
        )}
        {showVersions && (
          <VersionsPanel
            materialId={material.id}
            onRestored={async () => {
              await qc.invalidateQueries({ queryKey: ["docente-material", material.id] });
            }}
            beforeRestore={auto.flush}
          />
        )}
      </div>

      <div className="mt-8">
        {view === "edit" ? (
          kind === "exam" ? (
            <ExamEditor
              content={auto.content as unknown as ExamContent}
              setContent={(u) => auto.setContent((p) => u(p as unknown as ExamContent) as unknown as Record<string, unknown>)}
              meta={{ concept: material.concept, discipline: material.discipline, subject: material.subject, level: material.level, language: material.language }}
            />
          ) : kind === "map" ? (
            <MapEditor
              content={auto.content as unknown as MapContent}
              setContent={(u) => auto.setContent((p) => u(p as unknown as MapContent) as unknown as Record<string, unknown>)}
              meta={{ concept: material.concept, discipline: material.discipline, language: material.language }}
            />
          ) : (
            <DocEditor
              content={auto.content as unknown as DocContent}
              setContent={(u) => auto.setContent((p) => u(p as unknown as DocContent) as unknown as Record<string, unknown>)}
              meta={{ concept: material.concept, discipline: material.discipline, subject: material.subject, level: material.level, language: material.language, kind: kind === "class" ? "class" : "guide" }}
            />
          )
        ) : (
          <PrintView kind={kind} md={materialToMarkdown(meta, auto.content, view)} map={kind === "map" ? (auto.content as unknown as MapContent) : null} language={material.language} variant={view} />
        )}
      </div>

      {projecting && kind === "class" && (
        <Projection title={auto.title} doc={auto.content as unknown as DocContent} onClose={() => setProjecting(false)} />
      )}
    </DocenteShell>
  );
}

function ExportItem({ label, onClick, busy, danger }: { label: string; onClick: () => void; busy: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
        onClick();
      }}
      disabled={busy}
      className={cn("focus-mist block w-full rounded px-2 py-1.5 text-left text-small hover:bg-muted disabled:opacity-50", danger ? "text-destructive" : "text-foreground")}
    >
      {busy ? "…" : label}
    </button>
  );
}

function DeriveLink({ to, from, label }: { to: "/docente/examenes/nuevo" | "/docente/mapas/nuevo" | "/docente/clases/nueva"; from: string; label: string }) {
  return (
    <Link to={to} search={{ from, concept: undefined }} className="focus-mist block rounded px-2 py-1.5 text-small text-foreground hover:bg-muted">
      {label}
    </Link>
  );
}

function PrintView({ kind, md, map, language, variant }: { kind: Material["kind"]; md: string; map: MapContent | null; language: "es" | "en"; variant: Variant }) {
  const tr = useTr();
  const svg = map ? mapToSvg(map, language) : null;
  return (
    <div>
      <p className="mb-3 text-micro text-muted-foreground print:hidden">
        {variant === "student"
          ? tr("Versión estudiante: sin respuestas, rúbricas, notas ni secciones docentes.", "Student version: no answers, rubrics, notes or teacher sections.")
          : tr("Vista previa de impresión.", "Print preview.")}
      </p>
      <article className="print-sheet mx-auto max-w-[52rem] rounded-sm bg-paper px-8 py-10 text-ink shadow-md md:px-14 print:max-w-none print:p-0 print:shadow-none">
        {svg && kind === "map" && <div className="mb-6 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />}
        <DocMarkdown text={md} className="doc-print" />
      </article>
    </div>
  );
}

function VersionsPanel({ materialId, onRestored, beforeRestore }: { materialId: string; onRestored: () => Promise<void>; beforeRestore: () => Promise<void> }) {
  const tr = useTr();
  const { lang } = useI18n();
  const fetchVersions = useServerFn(listVersions);
  const restore = useServerFn(restoreVersion);
  const [err, setErr] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["docente-versions", materialId],
    queryFn: () => fetchVersions({ data: { id: materialId } }) as Promise<MaterialVersion[]>,
  });
  return (
    <section className="mt-4 rounded-md border border-border p-4" aria-label={tr("Historial de versiones", "Version history")}>
      <p className="text-small font-medium text-foreground">{tr("Versiones guardadas", "Saved versions")}</p>
      {isLoading && <p className="mt-2 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
      {data && data.length === 0 && (
        <p className="mt-2 text-small text-muted-foreground">
          {tr("Aún no hay versiones. Usa «Guardar versión» antes de cambios importantes.", "No versions yet. Use “Save version” before major changes.")}
        </p>
      )}
      <ul className="mt-2 space-y-1">
        {data?.map((v) => (
          <li key={v.id} className="flex flex-wrap items-center gap-3 text-small">
            <span className="text-muted-foreground tabular-nums">
              {formatDate(v.created_at, lang)} {new Date(v.created_at).toLocaleTimeString(lang === "es" ? "es-CL" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-foreground">{v.note || v.title}</span>
            <button
              type="button"
              className="focus-mist text-micro text-muted-foreground underline hover:text-foreground"
              onClick={async () => {
                if (!window.confirm(tr("¿Restaurar esta versión? El estado actual se guardará antes como versión.", "Restore this version? The current state will be saved as a version first."))) return;
                setErr(null);
                try {
                  await beforeRestore();
                  await restore({ data: { versionId: v.id, note: tr("Antes de restaurar", "Before restoring") } });
                  await onRestored();
                } catch (e) {
                  setErr(errorText(e, lang));
                }
              }}
            >
              {tr("Restaurar", "Restore")}
            </button>
          </li>
        ))}
      </ul>
      {err && <p role="alert" className="mt-2 text-small text-destructive">{err}</p>}
    </section>
  );
}

function Projection({ title, doc, onClose }: { title: string; doc: DocContent; onClose: () => void }) {
  const tr = useTr();
  const slides = doc.sections.filter((s) => s.audience === "all");
  const [i, setI] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") setI((x) => Math.min(slides.length - 1, x + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined);
    };
  }, [slides.length, onClose]);
  const s = slides[i];
  return (
    <div role="dialog" aria-modal="true" aria-label={tr("Modo proyección", "Projection mode")} className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-3 text-small text-muted-foreground">
        <span className="font-serif text-lg text-foreground">{title}</span>
        <span className="tabular-nums">
          {slides.length ? i + 1 : 0} / {slides.length}
        </span>
        <button type="button" onClick={onClose} className="focus-mist ml-auto underline">
          {tr("Salir (Esc)", "Exit (Esc)")}
        </button>
      </div>
      <div className="flex-1 overflow-auto px-6 py-10 md:px-20">
        {s ? (
          <div className="mx-auto max-w-4xl">
            <p className="label">{s.minutes ? `${s.minutes} min` : ""}</p>
            <h2 className="mt-2 font-serif text-display font-light text-foreground">{s.title}</h2>
            <DocMarkdown text={s.body} className="doc-projection mt-8" />
          </div>
        ) : (
          <p className="text-muted-foreground">{tr("No hay secciones para proyectar.", "No sections to project.")}</p>
        )}
      </div>
      <div className="flex justify-between border-t border-border/60 px-6 py-3">
        <button type="button" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-40">
          ← {tr("Anterior", "Previous")}
        </button>
        <button type="button" onClick={() => setI((x) => Math.min(slides.length - 1, x + 1))} disabled={i >= slides.length - 1} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-40">
          {tr("Siguiente", "Next")} →
        </button>
      </div>
    </div>
  );
}
