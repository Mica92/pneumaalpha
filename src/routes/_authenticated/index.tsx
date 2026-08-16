import { portraitOf, portraitFocus, profileOf } from "@/lib/portraits";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import { InstallAppCard } from "@/components/install-app";
import { TelegramCard } from "@/components/telegram-card";
import { QuoteCard } from "@/components/quote-card";




export const Route = createFileRoute("/_authenticated/")({
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

// Instrumentos — misma estructura, acento distinto por sección.
const FEATURES = [
  {
    to: "/oraculo",
    kicker: "oracle.kicker",
    title: "oracle.card.title",
    sub: "oracle.card.sub",
    cta: "oracle.card.cta",
    accent: "text-glacier-bright",
    border: "border-glacier/45 hover:border-glacier/80",
    rule: "bg-gradient-to-r from-transparent via-glacier/70 to-transparent",
    glow: "bg-glacier/25",
  },
  {
    to: "/reporte",
    kicker: "report.kicker",
    title: "report.card.title",
    sub: "report.card.sub",
    cta: "report.card.cta",
    accent: "text-sage",
    border: "border-sage/40 hover:border-sage/70",
    rule: "bg-gradient-to-r from-transparent via-sage/70 to-transparent",
    glow: "bg-sage/20",
  },
  {
    to: "/conocimiento",
    kicker: "knowledge.kicker",
    title: "knowledge.card.title",
    sub: "knowledge.card.sub",
    cta: "knowledge.card.cta",
    accent: "text-mist",
    border: "border-mist/30 hover:border-mist/55",
    rule: "bg-gradient-to-r from-transparent via-mist/60 to-transparent",
    glow: "bg-mist/15",
  },
  {
    to: "/analisis",
    kicker: "analysis.kicker",
    title: "analysis.card.title",
    sub: "analysis.card.sub",
    cta: "analysis.card.cta",
    accent: "text-glacier-bright",
    border: "border-glacier/35 hover:border-glacier/65",
    rule: "bg-gradient-to-r from-transparent via-glacier/50 to-transparent",
    glow: "bg-glacier/20",
  },
] as const;

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
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  return (
    <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-10 md:px-10 md:py-14">

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

      <QuoteCard className="mb-10" />

      {/* Herramientas — cuatro accesos con la misma estructura, distinto acento */}
      <section aria-labelledby="tools-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
          <h2
            id="tools-heading"
            className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
          >
            {lang === "es" ? "Instrumentos" : "Instruments"}
          </h2>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground/70">
            {String(FEATURES.length).padStart(2, "0")}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Link
              key={f.to}
              to={f.to}
              className={`group fade-up hover-lift focus-mist relative flex min-h-[190px] flex-col justify-between overflow-hidden rounded-xl border ${f.border} bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:bg-card/80 hover:shadow-mist`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-px ${f.rule} opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                <div className={`absolute -top-24 right-0 h-48 w-48 rounded-full ${f.glow} blur-3xl`} />
              </div>

              <div className="relative">
                <p className={`font-display text-[10px] uppercase tracking-[0.35em] ${f.accent}`}>
                  {t(f.kicker)}
                </p>
                <h3 className="mt-3 font-display text-xl font-light leading-tight tracking-tight text-foreground md:text-2xl">
                  {t(f.title)}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t(f.sub)}</p>
              </div>

              <span
                className={`relative mt-6 font-display text-[10px] uppercase tracking-[0.3em] ${f.accent} transition-colors group-hover:text-foreground`}
              >
                {t(f.cta)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Mentes — bento grid, 6 cols, tiles asimétricos */}
      <div
        id="minds-heading-wrap"
        className="mb-4 mt-12 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3"
      >
        <h2
          id="minds-heading"
          className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground"
        >
          {lang === "es" ? "Las mentes" : "The minds"}
        </h2>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground/70">
          {String(PHILOSOPHER_LIST.length).padStart(2, "0")}
        </span>
      </div>

      <section
        aria-labelledby="minds-heading"
        className="grid flex-1 auto-rows-[minmax(180px,auto)] grid-cols-1 gap-3 md:grid-cols-6"
      >

        {PHILOSOPHER_LIST.map((p, i) => {
          const isHero = i === 0;
          const portrait = portraitOf(p.id);
          const topics = (profileOf(p.id)?.expertise ?? [])
            .slice(0, isHero ? 4 : 3)
            .map((e) => e[lang]);

          return (
            <Link
              key={p.id}
              to="/$philosopher"
              params={{ philosopher: p.id }}
              aria-label={`${p.name} — ${p.subtitle[lang]}`}
              className={`group fade-up hover-lift focus-mist relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-mist/40 hover:bg-card/80 hover:shadow-mist md:p-8 ${BENTO_CLASSES[i] ?? "md:col-span-2 md:row-span-1"}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Cinematic portrait layer */}
              {portrait && (
                <div className="pointer-events-none absolute inset-0">
                  <img
                    src={portrait}
                    alt={`Retrato de ${p.name}`}
                    loading="lazy"
                    className={`h-full w-full object-cover ${portraitFocus(p.id)} opacity-40 grayscale brightness-125 contrast-105 transition-all duration-[1200ms] group-hover:scale-[1.04] group-hover:opacity-55`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 to-card/25" />
                  <div className="absolute inset-0 bg-gradient-to-r from-card/90 via-transparent to-transparent" />
                </div>
              )}

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

                {topics.length > 0 && (
                  <ul
                    aria-label={`${lang === "es" ? "Temas de" : "Topics of"} ${p.name}`}
                    className="mt-4 flex flex-wrap gap-1.5"
                  >
                    {topics.map((topic) => (
                      <li
                        key={topic}
                        className="rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[10px] leading-none tracking-wide text-muted-foreground transition-colors group-hover:border-mist/40 group-hover:text-foreground/80"
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
              </div>


              <div className="relative mt-6 space-y-3">
                {isHero && (
                  <p className="max-w-md text-sm leading-relaxed text-foreground/75 md:text-[15px]">
                    {p.blurb[lang]}
                  </p>
                )}
                <div className="flex items-center justify-end border-t border-border/60 pt-3">
                  <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:text-foreground group-hover:opacity-100">
                    {t("umbral.enter")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <InstallAppCard className="mt-12" />

      <TelegramCard className="mt-4" />


      {/* Footer hairline */}

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span>PneumaA · {new Date().getFullYear()}</span>
        <Link to="/privacy" className="transition-colors hover:text-foreground">
          {lang === "es" ? "Privacidad" : "Privacy"}
        </Link>
        <span className="font-mono">∴ · ✦ · ❧ · ☤ · ⚒ · ⚖ · Ω · ✶ · ◈ · ❋ · ✟ · ☦ · ⧫ · ✡ · ✠</span>
      </footer>
    </main>
  );
}
