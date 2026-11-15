import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";
import { EPISTEMIC_KINDS, uid, type DocContent, type DocSection } from "@/lib/docente/model";
import { EPISTEMIC_LABELS, GUIDE_SECTIONS, SECTION_ACTIONS, type SectionAction } from "@/lib/docente/catalog";
import { refineSection } from "@/lib/docente/docente-ai.functions";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { DocMarkdown } from "./doc-markdown";
import { MdTextarea } from "./md-textarea";
import { inputCls } from "./config-fields";

export type DocMeta = {
  concept: string;
  discipline: string;
  subject: string;
  level: string;
  language: "es" | "en";
  kind: "guide" | "class";
};

export function DocEditor({
  content,
  setContent,
  meta,
}: {
  content: DocContent;
  setContent: (u: (prev: DocContent) => DocContent) => void;
  meta: DocMeta;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const sections = content.sections;
  const update = (id: string, patch: Partial<DocSection>) =>
    setContent((c) => ({ sections: c.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const move = (i: number, d: -1 | 1) =>
    setContent((c) => {
      const s = [...c.sections];
      const j = i + d;
      if (j < 0 || j >= s.length) return c;
      [s[i], s[j]] = [s[j], s[i]];
      return { sections: s };
    });
  const duplicate = (i: number) =>
    setContent((c) => {
      const s = [...c.sections];
      s.splice(i + 1, 0, { ...s[i], id: uid("s"), sources: s[i].sources.map((r) => ({ ...r, id: uid("r") })) });
      return { sections: s };
    });
  const remove = (id: string) => {
    if (!window.confirm(tr("¿Eliminar esta sección?", "Delete this section?"))) return;
    setContent((c) => ({ sections: c.sections.filter((s) => s.id !== id) }));
  };
  const add = (key: string) => {
    const def = GUIDE_SECTIONS.find((s) => s.key === key);
    setContent((c) => ({
      sections: [
        ...c.sections,
        {
          id: uid("s"),
          key: key || "custom",
          title: def ? def.label[lang] : tr("Nueva sección", "New section"),
          body: "",
          audience: "all",
          epistemic: "conceptual",
          sources: [],
          minutes: meta.kind === "class" ? 10 : undefined,
        },
      ],
    }));
  };

  const totalMinutes = sections.reduce((s, x) => s + (x.audience === "all" ? x.minutes ?? 0 : 0), 0);

  return (
    <div className="space-y-6">
      {meta.kind === "class" && (
        <p className="text-small text-muted-foreground">
          {tr("Duración planificada:", "Planned duration:")} <span className="text-foreground tabular-nums">{totalMinutes} min</span>
        </p>
      )}
      {sections.length === 0 && (
        <p className="text-small text-muted-foreground">{tr("Este documento no tiene secciones todavía.", "This document has no sections yet.")}</p>
      )}
      {sections.map((s, i) => (
        <SectionCard
          key={s.id}
          s={s}
          index={i}
          count={sections.length}
          meta={meta}
          onPatch={(p) => update(s.id, p)}
          onMove={(d) => move(i, d)}
          onDuplicate={() => duplicate(i)}
          onRemove={() => remove(s.id)}
        />
      ))}
      <div className="flex items-center gap-3">
        <label htmlFor="add-section" className="text-small text-muted-foreground">
          {tr("Añadir sección", "Add section")}
        </label>
        <select
          id="add-section"
          className={cn(inputCls, "max-w-xs")}
          value=""
          onChange={(e) => {
            if (e.target.value !== "__") add(e.target.value === "__blank" ? "" : e.target.value);
          }}
        >
          <option value="__">{tr("Elegir…", "Choose…")}</option>
          <option value="__blank">{tr("Sección libre", "Free section")}</option>
          {GUIDE_SECTIONS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label[lang]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

type Proposal = { text: string; notes: string; sources: string[]; action: SectionAction };

function SectionCard({
  s,
  index,
  count,
  meta,
  onPatch,
  onMove,
  onDuplicate,
  onRemove,
}: {
  s: DocSection;
  index: number;
  count: number;
  meta: DocMeta;
  onPatch: (p: Partial<DocSection>) => void;
  onMove: (d: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const [mode, setMode] = useState<"edit" | "read">("read");
  const [action, setAction] = useState<SectionAction>("deepen");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [newSource, setNewSource] = useState("");
  const refine = useServerFn(refineSection);

  async function ask() {
    if (!s.body.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await refine({
        data: {
          action,
          sectionTitle: s.title,
          text: s.body,
          concept: meta.concept,
          discipline: meta.discipline,
          subject: meta.subject,
          level: meta.level,
          language: meta.language,
          instruction,
        },
      });
      setProposal({ ...r, action });
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(false);
    }
  }

  function accept() {
    if (!proposal) return;
    const existing = new Set(s.sources.map((r) => r.text.toLowerCase()));
    const added = proposal.sources
      .filter((t) => !existing.has(t.toLowerCase()))
      .map((t) => ({ id: uid("r"), text: t, status: "pending" as const }));
    onPatch({ body: proposal.text, sources: [...s.sources, ...added] });
    setProposal(null);
  }

  const iconBtn = "focus-mist grid h-8 w-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30";

  return (
    <section className={cn("rounded-lg border bg-card/60 p-4 md:p-5", s.audience === "teacher" ? "border-bronze/40" : "border-border")}>
      <div className="flex flex-wrap items-start gap-2">
        <span className="label mt-2.5 w-6 tabular-nums">{index + 1}</span>
        <input
          aria-label={tr("Título de la sección", "Section title")}
          value={s.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          className="focus-mist min-w-0 flex-1 rounded bg-transparent px-1 py-1 font-serif text-xl text-foreground hover:bg-muted/40"
        />
        <div className="flex items-center">
          <button type="button" className={iconBtn} onClick={() => onMove(-1)} disabled={index === 0} aria-label={tr("Subir", "Move up")} title={tr("Subir", "Move up")}>
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" className={iconBtn} onClick={() => onMove(1)} disabled={index === count - 1} aria-label={tr("Bajar", "Move down")} title={tr("Bajar", "Move down")}>
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" className={iconBtn} onClick={onDuplicate} aria-label={tr("Duplicar", "Duplicate")} title={tr("Duplicar", "Duplicate")}>
            <Copy className="h-4 w-4" />
          </button>
          <button type="button" className={iconBtn} onClick={onRemove} aria-label={tr("Eliminar", "Delete")} title={tr("Eliminar", "Delete")}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 text-micro text-muted-foreground">
        <label className="flex items-center gap-1.5">
          {tr("Naturaleza", "Nature")}
          <select
            value={s.epistemic}
            onChange={(e) => onPatch({ epistemic: e.target.value as DocSection["epistemic"] })}
            className="focus-mist rounded border border-border bg-transparent px-1 py-0.5 text-micro text-foreground"
          >
            {EPISTEMIC_KINDS.map((k) => (
              <option key={k} value={k}>
                {EPISTEMIC_LABELS[k][lang]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={s.audience === "teacher"} onChange={(e) => onPatch({ audience: e.target.checked ? "teacher" : "all" })} />
          {tr("Solo versión docente", "Teacher version only")}
        </label>
        {meta.kind === "class" && (
          <label className="flex items-center gap-1.5">
            {tr("Minutos", "Minutes")}
            <input
              type="number"
              min={0}
              max={600}
              value={s.minutes ?? 0}
              onChange={(e) => onPatch({ minutes: Math.max(0, Number(e.target.value) || 0) })}
              className="focus-mist w-16 rounded border border-border bg-transparent px-1 py-0.5 text-micro text-foreground"
            />
          </label>
        )}
        <div className="ml-auto flex overflow-hidden rounded border border-border">
          {(["read", "edit"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn("focus-mist px-2 py-0.5", mode === m ? "bg-muted text-foreground" : "hover:text-foreground")}
            >
              {m === "read" ? tr("Vista", "View") : tr("Editar", "Edit")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 pl-8">
        {mode === "edit" ? (
          <MdTextarea value={s.body} onChange={(v) => onPatch({ body: v })} ariaLabel={s.title} />
        ) : s.body.trim() ? (
          <button type="button" onClick={() => setMode("edit")} className="block w-full cursor-text text-left" aria-label={tr("Editar sección", "Edit section")}>
            <DocMarkdown text={s.body} />
          </button>
        ) : (
          <button type="button" onClick={() => setMode("edit")} className="text-small text-muted-foreground underline">
            {tr("Escribir contenido", "Write content")}
          </button>
        )}

        <Sources
          sources={s.sources}
          onChange={(sources) => onPatch({ sources })}
          newSource={newSource}
          setNewSource={setNewSource}
        />

        <details className="mt-4 rounded-md border border-border/70 p-3">
          <summary className="cursor-pointer text-small text-muted-foreground hover:text-foreground">{tr("Asistencia de IA para esta sección", "AI assistance for this section")}</summary>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <select aria-label={tr("Acción", "Action")} value={action} onChange={(e) => setAction(e.target.value as SectionAction)} className={cn(inputCls, "w-auto")}>
              {SECTION_ACTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label[lang]}
                </option>
              ))}
            </select>
            <input
              aria-label={tr("Indicación opcional", "Optional instruction")}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              maxLength={600}
              placeholder={tr("Indicación opcional…", "Optional instruction…")}
              className={cn(inputCls, "min-w-48 flex-1")}
            />
            <button type="button" onClick={ask} disabled={busy || !s.body.trim()} className="btn-ghost-gold focus-mist px-3 py-2 text-small disabled:opacity-50">
              {busy ? tr("Pensando…", "Thinking…") : tr("Proponer", "Propose")}
            </button>
          </div>
          {err && <p role="alert" className="mt-2 text-small text-destructive">{err}</p>}
        </details>

        {proposal && (
          <div className="mt-4 rounded-md border border-bronze/50 p-4">
            <p className="label">{tr("Propuesta — revisa antes de aceptar", "Proposal — review before accepting")}</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-micro text-muted-foreground">{tr("Actual", "Current")}</p>
                <DocMarkdown text={s.body} className="max-h-96 overflow-auto rounded bg-muted/30 p-3" />
              </div>
              <div>
                <p className="mb-1 text-micro text-muted-foreground">{tr("Propuesta", "Proposal")}</p>
                <DocMarkdown text={proposal.text} className="max-h-96 overflow-auto rounded bg-bronze/5 p-3" />
              </div>
            </div>
            {proposal.notes && (
              <div className="mt-3 text-small text-foreground">
                <p className="text-micro text-muted-foreground">{tr("Observaciones", "Notes")}</p>
                <DocMarkdown text={proposal.notes} />
              </div>
            )}
            {proposal.sources.length > 0 && (
              <p className="mt-3 text-micro text-muted-foreground">
                {tr("Referencias sugeridas (se añadirán como pendientes):", "Suggested references (added as pending):")} {proposal.sources.join("; ")}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={accept} className="btn-gold focus-mist px-3 py-1.5 text-small">
                {tr("Aceptar cambios", "Accept changes")}
              </button>
              <button type="button" onClick={() => setProposal(null)} className="btn-ghost-gold focus-mist px-3 py-1.5 text-small">
                {tr("Rechazar", "Reject")}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Sources({
  sources,
  onChange,
  newSource,
  setNewSource,
}: {
  sources: DocSection["sources"];
  onChange: (s: DocSection["sources"]) => void;
  newSource: string;
  setNewSource: (v: string) => void;
}) {
  const tr = useTr();
  return (
    <div className="mt-4">
      <p className="text-micro text-muted-foreground">{tr("Fuentes de esta sección", "Sources for this section")}</p>
      {sources.length > 0 && (
        <ul className="mt-1 space-y-1">
          {sources.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-2 text-small">
              <span className="text-foreground">{r.text}</span>
              <button
                type="button"
                onClick={() => onChange(sources.map((x) => (x.id === r.id ? { ...x, status: x.status === "verified" ? "pending" : "verified" } : x)))}
                className={cn(
                  "focus-mist rounded-sm border px-1.5 text-micro",
                  r.status === "verified" ? "border-bronze/60 text-bronze-bright" : "border-border text-muted-foreground",
                )}
                title={tr("Cambiar estado de verificación", "Toggle verification status")}
              >
                {r.status === "verified" ? tr("Verificada por mí", "Verified by me") : tr("Pendiente de verificación", "Pending verification")}
              </button>
              <button
                type="button"
                onClick={() => onChange(sources.filter((x) => x.id !== r.id))}
                className="focus-mist text-micro text-muted-foreground hover:text-destructive"
                aria-label={tr("Quitar fuente", "Remove source")}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = newSource.trim();
          if (!t) return;
          onChange([...sources, { id: uid("r"), text: t, status: "pending" }]);
          setNewSource("");
        }}
      >
        <input
          aria-label={tr("Nueva fuente", "New source")}
          value={newSource}
          onChange={(e) => setNewSource(e.target.value)}
          maxLength={400}
          placeholder={tr("Autor, Obra", "Author, Work")}
          className="focus-mist min-w-0 flex-1 rounded border border-border bg-transparent px-2 py-1 text-small text-foreground"
        />
        <button type="submit" className="focus-mist rounded border border-border px-2 py-1 text-micro text-muted-foreground hover:text-foreground">
          {tr("Añadir", "Add")}
        </button>
      </form>
    </div>
  );
}
