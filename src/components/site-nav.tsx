import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PneumaMark } from "@/components/pneuma-mark";
import { LanguageSelector, useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/explorar", es: "Explorar", en: "Explore" },
  { to: "/filosofos", es: "Filósofos", en: "Philosophers" },
  { to: "/ideas", es: "Ideas", en: "Ideas" },
  { to: "/rutas", es: "Rutas", en: "Paths" },
  { to: "/conocimiento", es: "Red neuronal", en: "Neural map" },
  { to: "/comparar", es: "Comparar", en: "Compare" },
  { to: "/umbral", es: "Instrumentos", en: "Instruments" },
  { to: "/mi-mapa", es: "Mi mapa", en: "My map" },
  { to: "/buscar", es: "Buscar", en: "Search" },
  { to: "/nosotros", es: "Nosotros", en: "About" },
] as const;

function isGoogleUser(user: ReturnType<typeof useAuth>["user"]) {
  return Boolean(user && !user.is_anonymous);
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
        "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl",
        className,
      )}
    >
      <nav
        aria-label={lang === "es" ? "Navegación principal" : "Main navigation"}
        className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-8"
      >
        <Link to="/" className="focus-mist" aria-label="PneumAlpha">
          <PneumaMark size={24} withWordmark />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
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
          {signedIn ? (
            <>
              <Link
                to="/perfil"
                aria-label={lang === "es" ? "Tu perfil" : "Your profile"}
                className="focus-mist inline-flex items-center gap-2 rounded-full border border-border/70 py-1 pr-3 pl-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
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
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-bronze/20 text-[11px] text-bronze">
                    ●
                  </span>
                )}
                {lang === "es" ? "Perfil" : "Profile"}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="focus-mist text-[13px] text-muted-foreground transition-colors hover:text-foreground"
              >
                {lang === "es" ? "Salir" : "Sign out"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={signIn}
              className="btn-gold rounded-full px-4 py-1.5 text-[12px]"
            >
              {lang === "es" ? "Entrar con Google" : "Sign in with Google"}
            </button>
          )}
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
                className="focus-mist border-b border-border/40 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l[lang]}
              </Link>
            ))}
            {signedIn ? (
              <>
                <Link
                  to="/perfil"
                  onClick={() => setOpen(false)}
                  className="focus-mist border-b border-border/40 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {lang === "es" ? "Tu perfil" : "Your profile"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="focus-mist py-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {lang === "es" ? "Cerrar sesión" : "Sign out"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signIn();
                }}
                className="btn-gold my-3 rounded-full px-4 py-2 text-[12px]"
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
