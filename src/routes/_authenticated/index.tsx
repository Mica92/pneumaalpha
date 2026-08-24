import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { portraitFocus, portraitOf, profileOf } from "@/lib/portraits";
import { CATEGORIES, IDEAS, REAL_PROBLEMS, ROUTES, centralQuestion } from "@/lib/discovery";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PhilosopherCard } from "@/components/philosopher-card";
import landingBg from "@/assets/landing-bg.jpg";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "PneumAlpha — Conversa con los grandes pensadores de la historia" },
      {
        name: "description",
        content:
          "Escribe lo que te preocupa y habla con una conciencia filosófica reconstruida. Diecinueve mentes, grandes ideas y rutas guiadas para pensar tu vida.",
      },
      { property: "og:title", content: "PneumAlpha — Conversa con los grandes pensadores" },
      {
        property: "og:description",
        content:
          "No es una enciclopedia: es una conversación. Entra por una pregunta, no por un autor.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pneumaalpha.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pneumaalpha.lovable.app/" }],
  }),
});

function Home() {
  const { lang } = useI18n();
  const es = lang === "es";
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState("");

  const featured = useMemo(() => {
    const ids: PhilosopherId[] = ["heidegger", "nietzsche", "pohlenz", "levinas", "marx", "kant"];
    return ids.filter((id) => id in PHILOSOPHERS);
  }, []);

  const spotlight = useMemo(() => {
    const day = new Date().getUTCDate();
    return PHILOSOPHER_LIST[day % PHILOSOPHER_LIST.length];
  }, []);

  function ask(text: string) {
    const q = text.trim();
    if (!q) return;
    navigate({ to: "/oraculo", search: { q } });
  }

  return (
    <>
      <SiteNav />

      <main className="route-enter relative z-10">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <img
              src={landingBg}
              alt=""
              className="h-full w-full scale-105 object-cover opacity-20 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
          </div>

          <div className="relative mx-auto max-w-4xl px-5 py-24 text-center md:px-8 md:py-36">
            <p className="label">
              {PHILOSOPHER_LIST.length} {es ? "conciencias reconstruidas" : "reconstructed minds"}
            </p>
            <h1 className="fade-up balance mx-auto mt-6 max-w-3xl font-serif text-display font-light text-foreground">
              {es ? (
                <>
                  ¿Qué pregunta llevas <em className="text-bronze not-italic">contigo</em> hoy?
                </>
              ) : (
                <>
                  What question are you <em className="text-bronze not-italic">carrying</em> today?
                </>
              )}
            </h1>
            <p className="lead measure mx-auto mt-6">
              {es
                ? "Escríbela como te salga. Te pondremos frente a la mente que lleva siglos pensándola."
                : "Write it however it comes. We'll put you in front of the mind that has spent centuries on it."}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(inquiry);
              }}
              className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <label className="sr-only" htmlFor="home-inquiry">
                {es ? "Tu pregunta" : "Your question"}
              </label>
              <input
                id="home-inquiry"
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                placeholder={
                  es ? "No sé qué hacer con mi vida…" : "I don't know what to do with my life…"
                }
                className="focus-mist flex-1 rounded-md border border-border/70 bg-input px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70"
              />
              <button type="submit" className="btn-gold focus-mist px-6 py-3.5 text-sm">
                {es ? "Empezar" : "Begin"}
              </button>
            </form>

            <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
              {REAL_PROBLEMS.slice(0, 4).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => ask(p.text[lang])}
                    className="focus-mist rounded-full border border-border/60 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-bronze/50 hover:text-foreground"
                  >
                    {p.text[lang]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── ¿Qué estás buscando? ─────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label">{es ? "Por dónde entrar" : "Where to start"}</p>
              <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-5xl">
                {es ? "¿Qué estás buscando?" : "What are you looking for?"}
              </h2>
            </div>
            <Link
              to="/filosofos"
              className="focus-mist text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {es ? "Ver todas las mentes →" : "See all minds →"}
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  to="/oraculo"
                  search={{ q: c.seed[lang] }}
                  className="card-editorial focus-mist flex h-full flex-col p-6"
                >
                  <span aria-hidden="true" className="font-serif text-2xl text-bronze">
                    {c.glyph}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl font-light text-foreground">
                    {c.title[lang]}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {c.tags[lang]}
                  </p>
                  <p className="mt-5 text-[11px] text-bronze-bright">
                    {c.philosophers
                      .slice(0, 3)
                      .map((p) => PHILOSOPHERS[p]?.name)
                      .join(" · ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Mentes destacadas ────────────────────────────────── */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <p className="label">{es ? "Empieza por aquí" : "Start here"}</p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-light text-foreground md:text-5xl">
              {es
                ? "Seis mentes para una primera conversación"
                : "Six minds for a first conversation"}
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((id) => (
                <li key={id}>
                  <PhilosopherCard id={id} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Filosofía para problemas reales ──────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="label">{es ? "Filosofía aplicada" : "Applied philosophy"}</p>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-light text-foreground md:text-5xl">
            {es ? "Para lo que te está pasando ahora" : "For what is happening to you now"}
          </h2>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {REAL_PROBLEMS.map((p) => (
              <li
                key={p.id}
                className="card-editorial flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
              >
                <p className="flex-1 font-serif text-xl font-light leading-snug text-foreground">
                  “{p.text[lang]}”
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.philosophers.map((pid) => (
                    <Link
                      key={pid}
                      to="/$philosopher"
                      params={{ philosopher: pid }}
                      search={{ q: p.text[lang] }}
                      className="btn-ghost-gold focus-mist px-3 py-1.5 text-xs"
                    >
                      {PHILOSOPHERS[pid]?.name}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Grandes ideas ────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label">{es ? "Grandes ideas" : "Great ideas"}</p>
                <h2 className="mt-3 font-serif text-3xl font-light text-foreground md:text-5xl">
                  {es ? "Conceptos, en lenguaje simple" : "Concepts, in plain language"}
                </h2>
              </div>
              <Link
                to="/ideas"
                className="focus-mist text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {es ? "Ver todas las ideas →" : "See all ideas →"}
              </Link>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {IDEAS.slice(0, 4).map((idea) => (
                <li key={idea.id}>
                  <Link
                    to="/ideas/$id"
                    params={{ id: idea.id }}
                    className="card-editorial focus-mist flex h-full flex-col p-6"
                  >
                    <h3 className="font-serif text-2xl font-light text-foreground">
                      {idea.title[lang]}
                    </h3>
                    <p className="mt-2 text-sm text-bronze-bright">{idea.short[lang]}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Rutas ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label">{es ? "Rutas filosóficas" : "Philosophical paths"}</p>
              <h2 className="mt-3 max-w-xl font-serif text-3xl font-light text-foreground md:text-5xl">
                {es ? "Una pregunta, cuatro mentes" : "One question, four minds"}
              </h2>
            </div>
            <Link
              to="/rutas"
              className="focus-mist text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {es ? "Ver todas las rutas →" : "See all paths →"}
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {ROUTES.slice(0, 3).map((r) => (
              <li key={r.id}>
                <Link
                  to="/rutas/$id"
                  params={{ id: r.id }}
                  className="card-editorial focus-mist flex h-full flex-col p-6"
                >
                  <p className="label">
                    {r.steps.length} {es ? "pasos" : "steps"}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-light leading-tight text-foreground">
                    {r.question[lang]}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {r.intro[lang]}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Mente del día ────────────────────────────────────── */}
        <section className="border-t border-border/60 bg-card/25">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[280px_1fr] md:items-center md:px-8 md:py-28">
            <div className="overflow-hidden rounded-md border border-border/70 bg-secondary">
              {portraitOf(spotlight.id) ? (
                <img
                  src={portraitOf(spotlight.id)}
                  alt={`${spotlight.name}, ${profileOf(spotlight.id)?.years ?? ""}`}
                  loading="lazy"
                  className={`aspect-[3/4] w-full object-cover ${portraitFocus(spotlight.id)} opacity-80 grayscale`}
                />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center font-serif text-5xl text-bronze">
                  {spotlight.glyph}
                </div>
              )}
            </div>
            <div>
              <p className="label">{es ? "Mente del día" : "Mind of the day"}</p>
              <h2 className="mt-3 font-serif text-4xl font-light text-foreground md:text-6xl">
                {spotlight.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{spotlight.subtitle[lang]}</p>
              <p className="mt-6 max-w-lg font-serif text-2xl font-light italic leading-snug text-bronze-bright">
                {centralQuestion(spotlight.id, lang)}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/$philosopher"
                  params={{ philosopher: spotlight.id }}
                  className="btn-gold focus-mist px-6 py-3 text-sm"
                >
                  {es ? "Conversar ahora" : "Talk now"}
                </Link>
                <Link
                  to="/filosofos/$id"
                  params={{ id: spotlight.id }}
                  className="btn-ghost-gold focus-mist px-5 py-3 text-sm"
                >
                  {es ? "Ver perfil" : "View profile"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
