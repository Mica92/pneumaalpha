import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import landingBg from "@/assets/landing-bg.jpg";
import { ChatWindow } from "@/components/chat-window";
import { GreekGlyph } from "@/components/greek-glyph";
import { useAuth } from "@/hooks/use-auth";
import { portraitOf, portraitFocus } from "@/lib/portraits";

export const Route = createFileRoute("/_authenticated/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "PneumaA — conciencias filosóficas reconstruidas, una conversación" },
      {
        name: "description",
        content:
          "Empieza a conversar al instante con una conciencia filosófica elegida al azar. Qué es PneumaA, citas de los pensadores y acceso a todas las mentes.",
      },
      { property: "og:title", content: "PneumaA — conciencias reconstruidas" },
      {
        property: "og:description",
        content:
          "Una conversación abierta desde el primer segundo: filósofos reconstruidos, citas y diálogo bilingüe ES / EN.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pneumaalpha.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://pneumaalpha.lovable.app/" }],
  }),
});

function randomPhilosopher(exclude?: PhilosopherId): PhilosopherId {
  const pool = PHILOSOPHER_LIST.filter((p) => p.id !== exclude);
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? PHILOSOPHER_LIST[0];
  return pick.id;
}

function Landing() {
  const { lang, t } = useI18n();
  const { user, loading } = useAuth();
  const first = useMemo(() => randomPhilosopher(), []);
  const [current, setCurrent] = useState<PhilosopherId>(first);
  const meta = PHILOSOPHER_LIST.find((p) => p.id === current)!;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <img
          src={landingBg}
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />
      </div>

      <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 md:px-10 md:py-14">
        <nav className="flex items-center justify-between">
          <PneumaMark size={26} />
          <div className="flex items-center gap-4">
            <Link
              to="/umbral"
              className="focus-mist font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {lang === "es" ? "Umbral" : "Threshold"}
            </Link>
            <LanguageSelector />
          </div>
        </nav>

        <header className="mt-20 mb-16 md:mt-28 md:mb-20">
          <h1 className="fade-up font-display text-4xl font-light tracking-[0.24em] text-foreground md:text-6xl">
            PneumAlpha
          </h1>
          <p className="fade-up mt-6 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
            {t("umbral.sub")}
          </p>
        </header>

        {/* 1 — Conciencias reconstruidas */}
        <section aria-labelledby="about-heading" className="fade-up mb-16">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-mist">
            {t("umbral.about.kicker")}
          </p>
          <h2
            id="about-heading"
            className="mt-4 max-w-2xl font-display text-xl font-light tracking-tight text-foreground md:text-2xl"
          >
            {t("umbral.about.title")}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("umbral.about.body")}
          </p>

          <Link
            to="/umbral"
            className="focus-mist mt-8 inline-block font-display text-[10px] uppercase tracking-[0.3em] text-glacier-bright transition-colors hover:text-foreground"
          >
            {lang === "es" ? "Ver todas las mentes →" : "See all minds →"}
          </Link>
        </section>

        {/* 2 — Conversación abierta */}
        <section
          aria-labelledby="live-chat-heading"
          className="fade-up mb-14 overflow-hidden rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
            <div className="min-w-0">
              <h2
                id="live-chat-heading"
                className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
              >
                {t("umbral.random")}
              </h2>
              <p className="mt-1 truncate text-xs text-muted-foreground/80">
                {meta.name} · {meta.subtitle[lang]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrent((prev) => randomPhilosopher(prev))}
              className="focus-mist inline-flex items-center gap-2 rounded-md border border-border/70 px-4 py-2 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-all hover:border-mist/50 hover:text-foreground"
            >
              <span aria-hidden="true">◇</span>
              {lang === "es" ? "Otra mente" : "Another mind"}
            </button>
          </div>

          {loading || !user ? (
            <div className="flex h-[40vh] items-center justify-center">
              <GreekGlyph className="font-display text-4xl text-mist pneuma-breathe" />
            </div>
          ) : (
            <ChatWindow
              key={current}
              embedded
              userId={user.id}
              philosopher={current}
              onSignOut={() => undefined}
            />
          )}
        </section>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>PneumAlpha · {new Date().getFullYear()}</span>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            {lang === "es" ? "Privacidad" : "Privacy"}
          </Link>
        </footer>
      </main>
    </>
  );
}

