import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { useDocenteAccess, useTr } from "@/lib/docente/use-docente";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/docente", es: "Panel", en: "Desk", exact: true },
  { to: "/docente/investigar", es: "Investigar", en: "Research", also: "/docente/fuentes" },
  { to: "/docente/guias/nueva", es: "Guías", en: "Guides" },
  { to: "/docente/examenes/nuevo", es: "Exámenes", en: "Exams" },
  { to: "/docente/mapas/nuevo", es: "Mapas", en: "Maps" },
  { to: "/docente/clases/nueva", es: "Clases", en: "Classes" },
  { to: "/docente/analizador", es: "Argumentos", en: "Arguments" },
  { to: "/docente/biblioteca", es: "Biblioteca", en: "Library" },
  { to: "/docente/banco", es: "Banco", en: "Bank" },
] as const;

export function DocenteShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const tr = useTr();
  const { data: access } = useDocenteAccess();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <SiteNav className="print:hidden" />
      <div className="docente relative z-10 print:hidden">
        <div className="border-b border-border/50 bg-background/80 backdrop-blur">
          <nav
            aria-label={tr("Kionas Docente", "Kionas Docente")}
            className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 md:px-8"
          >
            <span className="mr-4 hidden shrink-0 font-serif text-lg text-foreground sm:inline">
              Docente
            </span>
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: "exact" in l ? l.exact : false }}
                className={cn(
                  "focus-mist shrink-0 border-b-2 border-transparent px-3 py-3 text-small text-muted-foreground transition-colors hover:text-foreground",
                  "also" in l && path.startsWith(l.also) && "border-bronze text-foreground",
                )}
                activeProps={{ className: "border-bronze text-foreground" }}
              >
                {tr(l.es, l.en)}
              </Link>
            ))}
            {access?.isAdmin && (
              <Link
                to="/docente/admin"
                className="focus-mist ml-auto shrink-0 px-3 py-3 text-small text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {tr("Accesos", "Access")}
              </Link>
            )}
          </nav>
        </div>
      </div>
      <main
        className={cn(
          "docente route-enter relative z-10 mx-auto px-5 pt-8 pb-28 md:px-8 md:pt-12",
          wide ? "max-w-7xl" : "max-w-5xl",
        )}
      >
        {children}
      </main>
    </>
  );
}

export function PageHeading({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <header className="mb-8">
      {eyebrow && <p className="label">{eyebrow}</p>}
      <h1 className="mt-2 font-serif text-title font-light text-foreground">{title}</h1>
      {lead && <p className="mt-3 max-w-2xl text-lead text-muted-foreground">{lead}</p>}
    </header>
  );
}

export function SaveIndicator({ state, onRetry }: { state: "saved" | "dirty" | "saving" | "error"; onRetry: () => void }) {
  const tr = useTr();
  if (state === "error")
    return (
      <span role="status" className="text-small text-destructive">
        {tr("No se pudo guardar.", "Could not save.")}{" "}
        <button type="button" onClick={onRetry} className="focus-mist underline">
          {tr("Reintentar", "Retry")}
        </button>
      </span>
    );
  const label =
    state === "saving"
      ? tr("Guardando…", "Saving…")
      : state === "dirty"
        ? tr("Cambios sin guardar", "Unsaved changes")
        : tr("Guardado", "Saved");
  return (
    <span role="status" className={cn("text-small", state === "saved" ? "text-muted-foreground" : "text-bronze")}>
      {label}
    </span>
  );
}
