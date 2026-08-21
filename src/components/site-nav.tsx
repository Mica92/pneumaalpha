import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PneumaMark } from "@/components/pneuma-mark";
import { LanguageSelector, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/filosofos", es: "Filósofos", en: "Philosophers" },
  { to: "/ideas", es: "Ideas", en: "Ideas" },
  { to: "/rutas", es: "Rutas", en: "Paths" },
  { to: "/comparar", es: "Comparar", en: "Compare" },
  { to: "/umbral", es: "Instrumentos", en: "Instruments" },
  { to: "/recorrido", es: "Mi recorrido", en: "My journey" },
  { to: "/buscar", es: "Buscar", en: "Search" },
] as const;

export function SiteNav({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        className,
      )}
    >
      <nav
        aria-label={lang === "es" ? "Navegación principal" : "Main navigation"}
        className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8"
      >
        <Link to="/" className="focus-mist" aria-label="PneumaA">
          <PneumaMark size={24} withWordmark />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="focus-mist text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l[lang]}
            </Link>
          ))}
          <LanguageSelector />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <LanguageSelector />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={lang === "es" ? "Abrir menú" : "Open menu"}
            className="focus-mist inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-foreground"
          >
            <span aria-hidden="true" className="text-sm">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-border/60 bg-background/95 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="focus-mist border-b border-border/40 py-3 text-sm text-muted-foreground transition-colors last:border-0 hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l[lang]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
