import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PneumaMark } from "@/components/pneuma-mark";
import { LanguageSelector, useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type NavItem = { to: string; es: string; en: string };

/** Navegación mínima: cuatro entradas. Todo lo demás vive dentro del recorrido. */
const PRIMARY: readonly NavItem[] = [
  { to: "/oraculo", es: "Pensar", en: "Think" },
  { to: "/explorar", es: "Explorar", en: "Explore" },
  { to: "/mi-mapa", es: "Mapa", en: "Map" },
  { to: "/conocimiento", es: "Red", en: "Network" },
  { to: "/filosofos", es: "Perspectivas", en: "Perspectives" },
  { to: "/editorial", es: "Editorial", en: "Editorial" },
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

export function SiteNav({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
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
        "sticky top-0 z-40 border-b border-border/50 bg-background/88 backdrop-blur-xl",
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

        <div className="hidden items-center gap-7 md:flex">
          {PRIMARY.map((item) => (
            <Link
              key={item.to}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              to={item.to as any}
              className="focus-mist whitespace-nowrap text-small text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item[lang]}
            </Link>
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
                aria-label={lang === "es" ? "Tu cuenta" : "Your account"}
                className="focus-mist inline-flex items-center gap-2 rounded-md border border-border/70 py-1 pr-3 pl-1 text-small text-muted-foreground transition-colors hover:text-foreground"
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
                {lang === "es" ? "Cuenta" : "Account"}
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
              className="btn-gold focus-mist whitespace-nowrap px-4 py-1.5 text-micro"
            >
              {lang === "es" ? "Iniciar" : "Start"}
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
        <div className="max-h-[75dvh] overflow-y-auto border-t border-border/50 bg-background/98 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-3">
            {PRIMARY.map((item) => (
              <Link
                key={item.to}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                to={item.to as any}
                onClick={() => setOpen(false)}
                className="focus-mist border-b border-border/30 py-3 text-small text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item[lang]}
              </Link>
            ))}
            <Link
              to="/umbral"
              onClick={() => setOpen(false)}
              className="focus-mist border-b border-border/30 py-3 text-small text-muted-foreground transition-colors hover:text-foreground"
            >
              {lang === "es" ? "Instrumentos" : "Instruments"}
            </Link>
            <Link
              to="/recorrido"
              onClick={() => setOpen(false)}
              className="focus-mist border-b border-border/30 py-3 text-small text-muted-foreground transition-colors hover:text-foreground"
            >
              {lang === "es" ? "Historial" : "History"}
            </Link>
            <Link
              to="/nosotros"
              onClick={() => setOpen(false)}
              className="focus-mist border-b border-border/30 py-3 text-small text-muted-foreground transition-colors hover:text-foreground"
            >
              {lang === "es" ? "Nosotros" : "About"}
            </Link>
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
                className="focus-mist py-4 text-left text-small text-muted-foreground transition-colors hover:text-foreground"
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

/** Barra inferior en móvil: Inicio · Decidir · Mapa · Explorar. */
export function MobileTabBar() {
  const { lang } = useI18n();
  const tabs: readonly NavItem[] = [
    { to: "/", es: "Inicio", en: "Home" },
    { to: "/oraculo", es: "Pensar", en: "Think" },
    { to: "/mi-mapa", es: "Mapa", en: "Map" },
    { to: "/explorar", es: "Explorar", en: "Explore" },
  ];
  return (
    <nav
      aria-label={lang === "es" ? "Navegación rápida" : "Quick navigation"}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
    >
      {tabs.map((t) => (
        <Link
          key={t.to}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to={t.to as any}
          className="focus-mist py-3 text-center text-micro text-muted-foreground transition-colors hover:text-foreground"
          activeProps={{ className: "text-foreground" }}
          activeOptions={{ exact: t.to === "/" }}
        >
          {t[lang]}
        </Link>
      ))}
    </nav>
  );
}
