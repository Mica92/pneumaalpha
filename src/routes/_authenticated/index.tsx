import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import landingBg from "@/assets/landing-bg.jpg";
import { ChatWindow } from "@/components/chat-window";
import { GreekGlyph } from "@/components/greek-glyph";
import { useAuth } from "@/hooks/use-auth";

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
      { name: "twitter:card", content: "summary_large_image" },
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
      {/* Fondo — imagen + retícula rota */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <img
          src={landingBg}
          alt=""
          width={1920}
          height={1080}
          className="h-full w-full scale-105 object-cover opacity-30 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
        <div className="absolute inset-y-0 left-[8%] hidden w-px bg-border/60 md:block" />
        <div className="absolute inset-y-0 right-[22%] hidden w-px bg-border/40 md:block" />
        <div className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-glacier/10 blur-[120px]" />
      </div>

      <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-8 md:px-10 md:py-12">
        <nav className="flex items-center justify-between">
          <PneumaMark size={26} />
          <div className="flex items-center gap-5">
            <Link
              to="/umbral"
              className="focus-mist font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {lang === "es" ? "Umbral" : "Threshold"}
            </Link>
            <LanguageSelector />
          </div>
        </nav>

        {/* HERO rupturista — tipografía desbordada y desalineada */}
        <header className="relative mt-16 mb-14 md:mt-24 md:mb-20">
          <span className="absolute -top-6 left-0 font-mono text-[10px] tracking-[0.4em] text-mist/70">
            {String(PHILOSOPHER_LIST.length).padStart(2, "0")} ·{" "}
            {lang === "es" ? "MENTES" : "MINDS"}
          </span>

          <h1 className="fade-up font-display leading-[0.82] text-foreground">
            <span className="block text-[15vw] font-extralight tracking-[-0.04em] md:text-[9rem]">
              PNEUM
            </span>
            <span className="ml-[18%] block text-[15vw] font-bold tracking-[-0.05em] text-glacier-bright md:ml-[26%] md:text-[9rem]">
              ALPHA
            </span>
          </h1>

          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <p className="fade-up max-w-md text-sm font-light leading-relaxed text-muted-foreground">
              {t("umbral.sub")}
            </p>
            <Link
              to="/umbral"
              className="focus-mist group inline-flex w-fit items-center gap-3 border-b border-glacier/50 pb-2 font-display text-[11px] uppercase tracking-[0.32em] text-glacier-bright transition-colors hover:border-foreground hover:text-foreground"
            >
              {lang === "es" ? "Todas las mentes" : "All minds"}
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </header>

        {/* Manifiesto — bloque diagonal, texto grande */}
        <section aria-labelledby="about-heading" className="fade-up relative mb-16">
          <div className="grid gap-8 border-t border-border/60 pt-8 md:grid-cols-[auto_1fr] md:gap-14">
            <p className="font-display text-[10px] uppercase leading-relaxed tracking-[0.4em] text-mist md:[writing-mode:vertical-rl]">
              {t("umbral.about.kicker")}
            </p>
            <div>
              <h2
                id="about-heading"
                className="max-w-3xl font-display text-2xl font-light leading-[1.15] tracking-tight text-foreground md:text-4xl"
              >
                {t("umbral.about.title")}
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {t("umbral.about.body")}
              </p>
            </div>
          </div>
        </section>

        {/* Conversación abierta */}
        <section aria-labelledby="live-chat-heading" className="fade-up relative mb-16 md:-mx-4">
          <div className="overflow-hidden rounded-none border border-border/70 bg-card/40 backdrop-blur-md md:rounded-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/40 px-5 py-4">
              <div className="min-w-0">
                <h2
                  id="live-chat-heading"
                  className="font-display text-[10px] uppercase tracking-[0.4em] text-mist"
                >
                  {t("umbral.random")}
                </h2>
                <p className="mt-1 truncate font-display text-base font-light tracking-tight text-foreground">
                  {meta.name}
                  <span className="ml-2 text-xs text-muted-foreground/80">
                    {meta.subtitle[lang]}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrent((prev) => randomPhilosopher(prev))}
                className="focus-mist inline-flex items-center gap-2 border border-glacier/40 bg-glacier/10 px-5 py-2.5 font-display text-[10px] uppercase tracking-[0.3em] text-foreground transition-all hover:border-glacier/80 hover:bg-glacier/20"
              >
                <span aria-hidden="true">✦</span>
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
          </div>
        </section>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span>PneumAlpha · {new Date().getFullYear()}</span>
          <span className="hidden font-mono text-muted-foreground/50 md:inline">
            ∴ · ✦ · Ω · ◈ · ⧫
          </span>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            {lang === "es" ? "Privacidad" : "Privacy"}
          </Link>
        </footer>
      </main>
    </>
  );
}
