import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSources, type SourceSummary } from "@/lib/docente/sources.functions";
import { INTEGRITY_LABELS, type Integrity } from "@/lib/docente/sources";
import { useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function useSources() {
  const fetchList = useServerFn(listSources);
  return useQuery({ queryKey: ["docente-sources"], queryFn: () => fetchList() as Promise<SourceSummary[]> });
}

/** Parses the comma-separated `sources` search param into at most three UUIDs. */
export function parseSourceIds(v: string | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[0-9a-f-]{36}$/i.test(s))
    .slice(0, 3);
}

export function IntegrityBadge({ value, className }: { value: Integrity; className?: string }) {
  const { lang } = useI18n();
  const info = INTEGRITY_LABELS[value];
  return (
    <span
      title={info.hint[lang]}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-micro",
        value === "verified" ? "border-bronze/60 text-bronze-bright" : value === "provided" ? "border-border text-foreground" : "border-dashed border-border text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", value === "verified" ? "bg-bronze" : value === "provided" ? "bg-foreground/70" : "border border-muted-foreground")} />
      {info[lang]}
    </span>
  );
}

/** Tabs shared by Research Desk and Source Desk, so both read as one research area. */
export function ResearchTabs() {
  const tr = useTr();
  const cls = "focus-mist border-b-2 border-transparent px-1 pb-2 text-small text-muted-foreground hover:text-foreground";
  return (
    <nav aria-label={tr("Investigación", "Research")} className="mb-8 flex gap-6 border-b border-border/60">
      <Link to="/docente/investigar" className={cls} activeProps={{ className: "border-bronze text-foreground" }}>
        {tr("Research Desk", "Research Desk")}
      </Link>
      <Link to="/docente/fuentes" className={cls} activeProps={{ className: "border-bronze text-foreground" }}>
        {tr("Source Desk · Mis fuentes", "Source Desk · My sources")}
      </Link>
    </nav>
  );
}

/** Pick up to three of the teacher's sources to build on. */
export function SourcePicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const tr = useTr();
  const { data, isLoading } = useSources();
  const list = (data ?? []).filter((s) => !s.archived_at);
  if (isLoading) return <p className="text-small text-muted-foreground">{tr("Cargando fuentes…", "Loading sources…")}</p>;
  if (list.length === 0)
    return (
      <p className="text-small text-muted-foreground">
        {tr("Aún no tienes fuentes propias. ", "You have no sources yet. ")}
        <Link to="/docente/fuentes" className="focus-mist underline hover:text-foreground">
          {tr("Añadir un documento", "Add a document")}
        </Link>
      </p>
    );
  return (
    <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
      {list.map((s) => {
        const on = value.includes(s.id);
        const disabled = !on && value.length >= 3;
        return (
          <li key={s.id}>
            <label className={cn("flex cursor-pointer items-start gap-3 rounded px-2 py-1.5 hover:bg-muted/50", disabled && "cursor-not-allowed opacity-50")}>
              <input
                type="checkbox"
                className="mt-1"
                checked={on}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked ? [...value, s.id] : value.filter((x) => x !== s.id))}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-small text-foreground">{s.title || tr("Sin título", "Untitled")}</span>
                <span className="block truncate text-micro text-muted-foreground">{[s.authors, s.year].filter(Boolean).join(" · ") || "—"}</span>
              </span>
              <IntegrityBadge value={s.integrity} />
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/** Collapsible "own sources" block for the creation forms. */
export function SourcesField({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const tr = useTr();
  return (
    <details className="rounded-md border border-border p-4" open={value.length > 0}>
      <summary className="cursor-pointer text-small font-medium text-foreground">
        {tr("Usar mis fuentes (opcional)", "Use my sources (optional)")} {value.length > 0 && `· ${value.length}`}
      </summary>
      <p className="mt-2 text-micro text-muted-foreground">
        {tr(
          "Hasta 3 documentos de tu Source Desk. Se usan como base y se citan con sus datos; no se envían a nadie.",
          "Up to 3 documents from your Source Desk. They are used as the basis and cited with their details; they are never sent to anyone.",
        )}
      </p>
      <div className="mt-3">
        <SourcePicker value={value} onChange={onChange} />
      </div>
    </details>
  );
}
