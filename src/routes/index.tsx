import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-serif text-3xl text-primary ember-breathe">∴</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-16">
      <div className="absolute right-6 top-6">
        <LanguageSelector />
      </div>

      <header className="mb-16 text-center fade-up">
        <p className="font-serif text-xs uppercase tracking-[0.4em] text-primary/80">
          {t("app.name")} · {t("umbral.kicker")}
        </p>
        <h1 className="mt-4 font-serif text-5xl text-foreground">
          {t("umbral.title")}
        </h1>
        <p className="mt-4 font-serif text-base italic text-muted-foreground">
          {t("umbral.sub")}
        </p>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
        {PHILOSOPHER_LIST.map((p) => (
          <Link
            key={p.id}
            to="/$philosopher"
            params={{ philosopher: p.id }}
            className="group fade-up relative flex flex-col rounded-lg border border-border bg-card/40 p-8 transition-all hover:border-primary/60 hover:bg-card/70 hover:shadow-lamp"
          >
            <div className="mb-6 flex items-baseline gap-3">
              <span className="font-serif text-4xl text-primary ember-breathe">{p.glyph}</span>
              <div>
                <h2 className="font-serif text-3xl text-foreground">{p.name}</h2>
                <p className="font-serif text-sm italic text-muted-foreground">{p.subtitle[lang]}</p>
              </div>
            </div>
            <p className="font-serif text-base leading-relaxed text-foreground/85">
              {p.blurb[lang]}
            </p>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              {p.place[lang]}
            </p>
            <p className="mt-8 font-serif text-xs uppercase tracking-[0.3em] text-primary/70 opacity-0 transition-opacity group-hover:opacity-100">
              {t("umbral.enter")}
            </p>
          </Link>
        ))}
      </div>

      <footer className="mt-16 text-center">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
          className="font-serif text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("umbral.exit")}
        </button>
      </footer>
    </main>
  );
}
