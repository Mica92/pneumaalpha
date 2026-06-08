import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import { GreekGlyph } from "@/components/greek-glyph";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "PneumaA — Umbral · múltiples filósofos, una conversación" },
      { name: "description", content: "El umbral de PneumaA: elige entre múltiples mentes filosóficas y científicas reconstruidas y conversa con su voz, en español o en inglés." },
      { property: "og:title", content: "PneumaA — Umbral" },
      { property: "og:description", content: "Múltiples conciencias filosóficas reconstruidas. Una lámpara distante. Una conversación que no se apaga." },
      { property: "og:url", content: "https://pneumaalpha.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://pneumaalpha.lovable.app/" }],
  }),
});

// Bento span recipe — first card is the cinematic hero tile, others stack quietly.
const BENTO_CLASSES = [
  "md:col-span-3 md:row-span-2", // hero
  "md:col-span-3 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-3 md:row-span-1",
  "md:col-span-3 md:row-span-1",
  "md:col-span-6 md:row-span-1",
];

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
        <GreekGlyph className="font-display text-3xl text-mist pneuma-breathe" />
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 md:px-10 md:py-14">
      {/* Top nav — clinical, almost invisible */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PneumaMark withWordmark size={26} />
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
            · {lang === "es" ? "vol. I" : "vol. I"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("umbral.exit")}
          </button>
        </div>
      </nav>

      {/* Hero header */}
      <header className="mt-16 mb-12 md:mt-24 md:mb-16">
        <p className="tracking-in font-display text-[10px] uppercase text-muted-foreground">
          {t("umbral.kicker")}
        </p>
        <h1 className="fade-up mt-5 max-w-3xl font-display text-4xl font-light leading-[1.05] text-foreground md:text-6xl">
          <span className="sr-only">PneumaA — conversaciones con múltiples mentes filosóficas reconstruidas. </span>
          {t("umbral.title")}
        </h1>
        <p className="fade-up mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("umbral.sub")}
        </p>
      </header>

      {/* Bento grid — 6 cols, asymmetric tiles */}
      <section className="grid flex-1 auto-rows-[minmax(180px,auto)] grid-cols-1 gap-3 md:grid-cols-6">
        {PHILOSOPHER_LIST.map((p, i) => {
          const isHero = i === 0;
          return (
            <Link
              key={p.id}
              to="/$philosopher"
              params={{ philosopher: p.id }}
              className={`group fade-up relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-mist/40 hover:bg-card/80 hover:shadow-mist md:p-8 ${BENTO_CLASSES[i] ?? "md:col-span-2 md:row-span-1"}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Subtle inner glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-mist/8 blur-3xl" />
              </div>

              {/* Index marker — top-right, clinical */}
              <span className="absolute right-5 top-5 font-mono text-[10px] tracking-widest text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")} / {String(PHILOSOPHER_LIST.length).padStart(2, "0")}
              </span>

              <div className="relative">
                <span
                  className={`pneuma-breathe block font-display text-foreground/90 ${
                    isHero ? "text-6xl md:text-7xl" : "text-4xl"
                  }`}
                >
                  {p.glyph}
                </span>
                <h2
                  className={`mt-6 font-display font-light tracking-tight text-foreground ${
                    isHero ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
                  }`}
                >
                  {p.name}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                  {p.subtitle[lang]}
                </p>
              </div>

              <div className="relative mt-6 space-y-3">
                {isHero && (
                  <p className="max-w-md text-sm leading-relaxed text-foreground/75 md:text-[15px]">
                    {p.blurb[lang]}
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                    {p.place[lang]}
                  </span>
                  <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:text-foreground group-hover:opacity-100">
                    {t("umbral.enter")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Footer hairline */}
      <footer className="mt-16 flex items-center justify-between border-t border-border/60 pt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span>PneumaA · {new Date().getFullYear()}</span>
        <span className="font-mono">∴ · ✦ · ❧ · ☤ · ⚒ · ⚖ · Ω · ✶</span>
      </footer>
    </main>
  );
}
