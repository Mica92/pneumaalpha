import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import { QuoteCard } from "@/components/quote-card";
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
    <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-10 md:px-10 md:py-14">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PneumaMark withWordmark size={26} />
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:inline">
            · vol. I
          </span>
        </div>
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

      <header className="mt-14 mb-10 md:mt-20 md:mb-12">
        <p className="tracking-in font-display text-[10px] uppercase text-muted-foreground">
          {t("umbral.kicker")}
        </p>
        <h1 className="fade-up mt-5 max-w-3xl font-display text-4xl font-light leading-[1.05] text-foreground md:text-6xl">
          {t("umbral.title")}
        </h1>
        <p className="fade-up mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("umbral.sub")}
        </p>
      </header>

      {/* Conversación aleatoria — ya abierta */}
      <section
        aria-labelledby="live-chat-heading"
        className="fade-up mb-12 overflow-hidden rounded-2xl border border-glacier/40 bg-card/40 backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="live-chat-heading"
              className="font-display text-[10px] uppercase tracking-[0.35em] text-glacier-bright"
            >
              {t("umbral.random")}
            </h2>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {meta.name} · {meta.subtitle[lang]}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrent((prev) => randomPhilosopher(prev))}
            className="focus-mist inline-flex items-center gap-2 rounded-md border border-glacier/45 bg-glacier/10 px-4 py-2 font-display text-[10px] uppercase tracking-[0.3em] text-foreground transition-all hover:border-glacier/80 hover:bg-glacier/15"
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
      </section>

      {/* Qué es esto — conciencias reconstruidas */}
      <section
        aria-labelledby="about-heading"
        className="fade-up mb-10 rounded-xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm md:p-8"
      >
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-mist">
          {t("umbral.about.kicker")}
        </p>
        <h2
          id="about-heading"
          className="mt-3 font-display text-xl font-light tracking-tight text-foreground md:text-2xl"
        >
          {t("umbral.about.title")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t("umbral.about.body")}
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {PHILOSOPHER_LIST.slice(0, 8).map((p) => (
            <li key={p.id}>
              <Link
                to="/$philosopher"
                params={{ philosopher: p.id }}
                className="focus-mist inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-mist/40 hover:text-foreground"
              >
                {portraitOf(p.id) && (
                  <img
                    src={portraitOf(p.id)}
                    alt=""
                    loading="lazy"
                    className={`h-5 w-5 rounded-full object-cover ${portraitFocus(p.id)} grayscale`}
                  />
                )}
                {p.name}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/umbral"
          className="focus-mist mt-6 inline-block font-display text-[10px] uppercase tracking-[0.3em] text-glacier-bright transition-colors hover:text-foreground"
        >
          {lang === "es" ? "Ver todas las mentes e instrumentos →" : "See all minds and instruments →"}
        </Link>
      </section>

      {/* Citas de los filósofos */}
      <QuoteCard className="mb-10" />

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span>PneumaA · {new Date().getFullYear()}</span>
        <Link to="/privacy" className="transition-colors hover:text-foreground">
          {lang === "es" ? "Privacidad" : "Privacy"}
        </Link>
      </footer>
    </main>
  );
}
