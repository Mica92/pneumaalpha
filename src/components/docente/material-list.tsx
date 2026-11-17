import { Link } from "@tanstack/react-router";
import { KIND_LABELS } from "@/lib/docente/catalog";
import type { MaterialSummary } from "@/lib/docente/docente.functions";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function formatDate(iso: string, lang: "es" | "en") {
  try {
    return new Intl.DateTimeFormat(lang === "es" ? "es-CL" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function MaterialRow({ m, actions }: { m: MaterialSummary; actions?: React.ReactNode }) {
  const { lang } = useI18n();
  const meta = [m.discipline, m.subject, m.level].filter(Boolean).join(" · ");
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border/50 py-3 last:border-b-0">
      <span className="label w-24 shrink-0">{KIND_LABELS[m.kind][lang]}</span>
      <div className="min-w-0 flex-1">
        <Link
          to="/docente/material/$id"
          params={{ id: m.id }}
          className="focus-mist block truncate font-serif text-lg text-foreground hover:text-bronze-bright"
        >
          {m.title || m.concept || (lang === "es" ? "Sin título" : "Untitled")}
        </Link>
        {meta && <p className="truncate text-micro text-muted-foreground">{meta}</p>}
        {m.source_material_id && (
          <p className="text-micro text-muted-foreground">{lang === "es" ? "↳ Derivado de otro material" : "↳ Derived from another material"}</p>
        )}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-sm border px-1.5 py-0.5 text-micro",
          m.review_status === "reviewed" ? "border-bronze/50 text-bronze-bright" : "border-border text-muted-foreground",
        )}
      >
        {m.review_status === "reviewed" ? (lang === "es" ? "Revisado" : "Reviewed") : lang === "es" ? "Borrador" : "Draft"}
      </span>
      <span className="shrink-0 text-micro text-muted-foreground tabular-nums">{formatDate(m.updated_at, lang)}</span>
      {actions}
    </li>
  );
}
