import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PneumaMark } from "@/components/pneuma-mark";
import { LanguageSelector, useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type NavItem = { to: string; es: string; en: string; note?: { es: string; en: string } };
type NavGroup = { id: string; es: string; en: string; items: readonly NavItem[] };

/** Four areas. Every existing page still lives at its own address. */
const GROUPS: readonly NavGroup[] = [
  {
    id: "minds",
    es: "Mentes",
    en: "Minds",
    items: [
      {
        to: "/filosofos",
        es: "Filósofos",
        en: "Philosophers",
        note: { es: "El catálogo completo", en: "The full catalogue" },
      },
      {
        to: "/explorar",
        es: "Explorar",
        en: "Explore",
        note: { es: "Entra por un tema, no por un nombre", en: "Enter by topic, not by name" },
      },
    ],
  },
  {
    id: "ideas",
    es: "Ideas",
    en: "Ideas",
    items: [
      {
        to: "/ideas",
        es: "Ideas",
        en: "Ideas",
        note: { es: "Las grandes preguntas", en: "The great questions" },
      },
      {
        to: "/rutas",
        es: "Rutas",
        en: "Paths",
        note: { es: "Recorridos guiados de lectura", en: "Guided reading paths" },
      },
      {
        to: "/conocimiento",
        es: "Red neuronal",
        en: "Neural map",
        note: { es: "El mapa de relaciones entre ideas", en: "The map of how ideas relate" },
      },
    ],
  },
  {
    id: "instruments",
    es: "Instrumentos",
    en: "Instruments",
    items: [
      {
        to: "/oraculo",
        es: "Oráculo",
        en: "Oracle",
        note: {
          es: "Escribe tu pregunta y encuentra la perspectiva",
          en: "Write your question and find the perspective",
        },
      },
      {
        to: "/analisis",
        es: "Análisis",
        en: "Analysis",
        note: { es: "Analiza una idea, argumento o texto", en: "Analyse an idea, argument or text" },
      },
      {
        to: "/mesa",
        es: "Mesa Redonda",
        en: "Round Table",
        note: { es: "Varias voces sobre una tensión", en: "Several voices on one tension" },
      },
      {
        to: "/comparar",
        es: "Comparar",
        en: "Compare",
        note: { es: "Dos posiciones, lado a lado", en: "Two positions, side by side" },
      },
      {
        to: "/modo-socrates",
        es: "Modo Sócrates",
        en: "Socratic mode",
        note: { es: "Que te pregunten a ti", en: "Be the one questioned" },
      },
      {
        to: "/podcast",
        es: "Podcast",
        en: "Podcast",
        note: { es: "Los clásicos, en voz alta", en: "The classics, read aloud" },
      },
      {
        to: "/biblioteca",
        es: "Biblioteca",
        en: "Library",
        note: { es: "Obras y fuentes", en: "Works and sources" },
      },
    ],
  },
  {
    id: "space",
    es: "Mi espacio",
    en: "My space",
    items: [
      {
        to: "/mi-mapa",
        es: "Mi mapa",
        en: "My map",
        note: { es: "Lo que has recorrido", en: "What you have explored" },
      },
      {
        to: "/reporte",
        es: "Retrato de tu pensamiento",
        en: "Portrait of your thinking",
        note: { es: "Patrones en tus propias palabras", en: "Patterns in your own words" },
      },
      {
        to: "/perfil",
        es: "Perfil",
        en: "Profile",
      },
    ],
  },
] as const;

function isGoogleUser(user: ReturnType<typeof useAuth>["user"]) {
  return Boolean(user && !user.is_anonymous);
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  );
}

function DesktopGroup({
  group,
  open,
  onToggle,
  onClose,
}: {
  group: NavGroup;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { lang } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDocPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative" onMouseLeave={onClose}>
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={onToggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "focus-mist inline-flex items-center gap-1.5 whitespace-nowrap py-2 text-small transition-colors",
          open ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {group[lang]}
        <span aria-hidden="true" className="text-[0.6em] opacity-70">
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-2">
          <ul className="overflow-hidden rounded-xl border border-border/70 bg-background/98 p-1.5 shadow-xl backdrop-blur-xl">
            {group.items.map((item) => (
              <li key={item.to}>
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={item.to as any}
                  onClick={onClose}
                  className="focus-mist block rounded-lg px-3 py-2.5 transition-colors hover:bg-card/80"
                  activeProps={{ className: "bg-card/70" }}
                >
                  <span className="block text-small text-foreground">{item[lang]}</span>
                  {item.note && (
                    <span className="mt-0.5 block text-micro leading-snug text-muted-foreground">
                      {item.note[lang]}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SiteNav({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const signedIn = isGoogleUser(user);
  const avatar = (user?.user_metadata?.avatar_url as string | undefined) ?? null;

  async function signIn() {
    await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

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
        <Link to="/" className="focus-mist shrink-0" aria-label="Pneum">
          <PneumaMark size={24} withWordmark />
        </Link>

        <div className="hidden items-center gap-5 md:flex lg:gap-7">
          {GROUPS.map((g) => (
            <DesktopGroup
              key={g.id}
              group={g}
              open={openGroup === g.id}
              onToggle={() => setOpenGroup((c) => (c === g.id ? null : g.id))}
              onClose={() => setOpenGroup((c) => (c === g.id ? null : c))}
            />
          ))}

          <Link
            to="/buscar"
            aria-label={lang === "es" ? "Buscar" : "Search"}
            className="focus-mist text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            <SearchIcon />
          </Link>

          <LanguageSelector />

          {signedIn ? (
            <>
              <Link
                to="/perfil"
                aria-label={lang === "es" ? "Tu perfil" : "Your profile"}
                className="focus-mist inline-flex items-center gap-2 rounded-full border border-border/70 py-1 pr-3 pl-1 text-small text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-bronze/20 text-micro text-bronze">
                    ●
                  </span>
                )}
                {lang === "es" ? "Perfil" : "Profile"}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="focus-mist whitespace-nowrap text-small text-muted-foreground transition-colors hover:text-foreground"
              >
                {lang === "es" ? "Salir" : "Sign out"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={signIn}
              className="btn-gold whitespace-nowrap rounded-full px-4 py-1.5 text-micro"
            >
              {lang === "es" ? "Entrar con Google" : "Sign in with Google"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/buscar"
            aria-label={lang === "es" ? "Buscar" : "Search"}
            className="focus-mist text-muted-foreground transition-colors hover:text-foreground"
          >
            <SearchIcon />
          </Link>
          <LanguageSelector />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={lang === "es" ? "Abrir menú" : "Open menu"}
            className="focus-mist inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-foreground"
          >
            <span aria-hidden="true" className="text-small">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div className="max-h-[75dvh] overflow-y-auto border-t border-border/60 bg-background/98 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {GROUPS.map((g) => (
              <section key={g.id} className="border-b border-border/40 py-3 last:border-b-0">
                <p className="label">{g[lang]}</p>
                <ul className="mt-2 flex flex-col">
                  {g.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        to={item.to as any}
                        onClick={() => setOpen(false)}
                        className="focus-mist block py-2 text-small text-muted-foreground transition-colors hover:text-foreground"
                        activeProps={{ className: "text-foreground" }}
                      >
                        {item[lang]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {signedIn ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="focus-mist py-4 text-left text-small text-muted-foreground transition-colors hover:text-foreground"
              >
                {lang === "es" ? "Cerrar sesión" : "Sign out"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signIn();
                }}
                className="btn-gold my-4 rounded-full px-4 py-2 text-micro"
              >
                {lang === "es" ? "Entrar con Google" : "Sign in with Google"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
