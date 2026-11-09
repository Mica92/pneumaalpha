import { useEffect, useId, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { PneumaMark } from "@/components/pneuma-mark";
import { Button } from "@/components/ui/button";
import { LanguageSelector, useI18n } from "@/lib/i18n";
import { CTA, INST_NAV } from "@/lib/institutional-content";
import { cn } from "@/lib/utils";

export function InstitutionalHeader() {
  const { lang } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-md">
      <div className="inst-container flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Link to="/" className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={lang === "es" ? "Kionas, inicio" : "Kionas, home"}>
          <PneumaMark size={26} withWordmark />
        </Link>

        <nav aria-label={lang === "es" ? "Navegación institucional" : "Institutional navigation"} className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {INST_NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="relative py-2 text-small text-ink transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-brass after:transition-transform hover:text-foreground hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  activeProps={{ className: "text-foreground after:scale-x-100", "aria-current": "page" }}
                >
                  {item.label[lang]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSelector />
          <Button asChild variant="institutionalOutline" size="sm" className="h-9 px-4">
            <Link to="/app">{CTA.enter[lang]}</Link>
          </Button>
          <Button asChild variant="institutional" size="sm" className="h-9 px-4">
            <Link to="/contacto">{CTA.demo[lang]}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild variant="institutional" size="sm" className="hidden h-9 sm:inline-flex">
            <Link to="/contacto">{CTA.demo[lang]}</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="sr-only">{open ? (lang === "es" ? "Cerrar menú" : "Close menu") : lang === "es" ? "Abrir menú" : "Open menu"}</span>
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
          </button>
        </div>
      </div>

      <div
        id={panelId}
        hidden={!open}
        className={cn("border-t border-border bg-background lg:hidden", open && "animate-in fade-in slide-in-from-top-1 duration-200")}
      >
        <nav aria-label={lang === "es" ? "Menú móvil" : "Mobile menu"} className="inst-container py-4">
          <ul className="divide-y divide-border">
            {INST_NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center justify-between py-3.5 font-serif text-subtitle text-foreground"
                  activeProps={{ "aria-current": "page", className: "text-bronze" }}
                >
                  {item.label[lang]}
                  <span aria-hidden="true" className="text-brass">→</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/pilotos" className="flex items-center justify-between py-3.5 font-serif text-subtitle text-foreground" activeProps={{ "aria-current": "page", className: "text-bronze" }}>
                {lang === "es" ? "Pilotos" : "Pilots"}
                <span aria-hidden="true" className="text-brass">→</span>
              </Link>
            </li>
          </ul>
          <div className="mt-5 grid gap-3">
            <Button asChild variant="institutional" size="xl">
              <Link to="/contacto">{CTA.demo[lang]}</Link>
            </Button>
            <Button asChild variant="institutionalOutline" size="xl">
              <Link to="/app">{CTA.enter[lang]}</Link>
            </Button>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-micro text-muted-foreground">{lang === "es" ? "Idioma" : "Language"}</span>
            <LanguageSelector />
          </div>
        </nav>
      </div>
    </header>
  );
}
