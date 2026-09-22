import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { portraitFocus, portraitOf, profileOf } from "@/lib/portraits";
import { IDEAS, ROUTES, centralQuestion } from "@/lib/discovery";
import { SITUATIONS } from "@/lib/situations";
import { useI18n } from "@/lib/i18n";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";
import { ToneSelect } from "@/components/tone-select";
import { loadStoredTone, storeTone, type ToneId } from "@/lib/tones";
import { SiteFooter } from "@/components/site-footer";
import { PhilosopherCard } from "@/components/philosopher-card";
import { track } from "@/lib/analytics";
import { AskLink } from "@/components/ask-link";
import { stashQuestion } from "@/lib/question-handoff";
import heroColumns from "@/assets/hero-columns.jpg";

const TITLE = "Pneum — Hay preguntas que no se resuelven con otro consejo";
const DESCRIPTION =
  "Pneum pone una pregunta real en perspectiva: qué estás suponiendo, qué estás dejando fuera y qué estás intentando decidir. Filosofía aplicada para pensar mejor.";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          description:
            "Filosofía aplicada para pensar mejor decisiones, problemas e ideas reales. Pneum muestra supuestos, tensiones y perspectivas en contraste, en español e inglés.",
          applicationCategory: "EducationalApplication",
          operatingSystem: "Web",
          inLanguage: ["es", "en"],
          url: SITE_URL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "¿Qué es Pneum?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Una herramienta de filosofía aplicada para pensar preguntas, decisiones y problemas reales. No entrega una respuesta única: muestra supuestos, tensiones y perspectivas en contraste.",
              },
            },
            {
              "@type": "Question",
              name: "¿Qué es una perspectiva?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Una construcción editorial basada en la obra, los conceptos y el contexto intelectual de un pensador. No pretende ser la persona histórica.",
              },
            },
            {
              "@type": "Question",
              name: "¿Pneum reemplaza a un terapeuta?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. Pneum es una herramienta de claridad de pensamiento y análisis, no un servicio de salud mental ni un sustituto de terapia profesional.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

const EXAMPLES: { es: string; en: string }[] = [
  { es: "¿Debería renunciar?", en: "Should I quit?" },
  { es: "No sé qué quiero.", en: "I do not know what I want." },
  {
    es: "¿Estoy tomando esta decisión por miedo?",
    en: "Am I making this decision out of fear?",
  },
  {
    es: "¿Qué está pasando realmente en mi relación?",
    en: "What is really happening in my relationship?",
  },
];

const DEMO_QUESTION = {
  es: "No sé si debería renunciar a mi trabajo.",
  en: "I do not know whether I should quit my job.",
};

const DEMO_TENSIONS = {
  es: ["Sentido", "Libertad", "Identidad", "Riesgo", "Responsabilidad"],
  en: ["Meaning", "Freedom", "Identity", "Risk", "Responsibility"],
};

const DEMO_PERSPECTIVES: PhilosopherId[] = ["heidegger", "seneca", "nietzsche"];

const DEMO_NEW_QUESTION = {
  es: "¿Estoy intentando decidir si renunciar, o qué estoy dispuesto a sacrificar?",
  en: "Am I trying to decide whether to quit, or what I am willing to sacrifice?",
};

const METHOD: { es: string; en: string }[] = [
  { es: "Tu pregunta", en: "Your question" },
  { es: "Lo que estás suponiendo", en: "What you are assuming" },
  { es: "Tensiones en juego", en: "Tensions at play" },
  { es: "Distintas perspectivas", en: "Different perspectives" },
  { es: "Contraste", en: "Contrast" },
  { es: "Una pregunta mejor", en: "A better question" },
];

const INSTRUMENTS: {
  id: string;
  to: "/oraculo" | "/mesa" | "/analisis";
  name: { es: string; en: string };
  claim: { es: string; en: string };
  text: { es: string; en: string };
}[] = [
  {
    id: "oracle",
    to: "/oraculo",
    name: { es: "Oráculo", en: "Oracle" },
    claim: {
      es: "Encuentra las perspectivas que pueden iluminar tu pregunta.",
      en: "Finds the perspectives that can illuminate your question.",
    },
    text: {
      es: "Lee lo que escribiste, muestra la tensión que contiene y propone desde dónde pensarlo.",
      en: "Reads what you wrote, shows the tension it holds and proposes where to think it from.",
    },
  },
  {
    id: "roundtable",
    to: "/mesa",
    name: { es: "Mesa Redonda", en: "Round Table" },
    claim: { es: "Pon tu pregunta en conflicto.", en: "Put your question in conflict." },
    text: {
      es: "Perspectivas que no están de acuerdo discuten el mismo problema y devuelven contradicciones, síntesis y una pregunta operativa.",
      en: "Perspectives that disagree argue the same problem and return contradictions, a synthesis and an operative question.",
    },
  },
  {
    id: "analysis",
    to: "/analisis",
    name: { es: "Análisis", en: "Analysis" },
    claim: {
      es: "Descubre qué estás dando por supuesto.",
      en: "Find what you are taking for granted.",
    },
    text: {
      es: "Examina textos, argumentos y declaraciones. Útil para estudiantes, investigadores, periodistas, consultores y equipos.",
      en: "Examines texts, arguments and statements. Useful for students, researchers, journalists, consultants and teams.",
    },
  },
];

const TRUST: { title: { es: string; en: string }; text: { es: string; en: string } }[] = [
  {
    title: { es: "Corpus y fuentes", en: "Corpus and sources" },
    text: {
      es: "Partimos de obra publicada y de dominio público del autor, junto con literatura secundaria de referencia.",
      en: "We start from the author's published, public-domain work, together with reference secondary literature.",
    },
  },
  {
    title: { es: "Criterio editorial", en: "Editorial criteria" },
    text: {
      es: "Nuestro equipo escribe guiones documentados: qué conceptos son centrales, qué distingue a ese pensamiento y qué no le corresponde decir.",
      en: "Our team writes documented scripts: which concepts are central, what distinguishes that thinking and what it should not say.",
    },
  },
  {
    title: { es: "Estructura conceptual", en: "Conceptual structure" },
    text: {
      es: "Cada perspectiva se organiza alrededor de sus conceptos, sus tensiones internas y sus preguntas propias.",
      en: "Each perspective is organised around its concepts, internal tensions and characteristic questions.",
    },
  },
  {
    title: { es: "Comportamiento", en: "Behaviour" },
    text: {
      es: "Responde en pocos párrafos, toma posición y devuelve una contrapregunta. No adula ni adivina datos.",
      en: "It answers in a few paragraphs, takes a position and returns a counter-question. It does not flatter or guess facts.",
    },
  },
  {
    title: { es: "Límites", en: "Limits" },
    text: {
      es: "No es la persona histórica, no es terapia y no es un asistente general. Ante señales de riesgo deja la filosofía de lado y entrega ayuda concreta.",
      en: "It is not the historical person, it is not therapy and it is not a general assistant. Faced with risk signals it sets philosophy aside and offers concrete help.",
    },
  },
  {
    title: { es: "Quién lo construye", en: "Who builds it" },
    text: {
      es: "Un equipo pequeño que trabaja sobre filosofía aplicada y tecnología de lenguaje existente. No entrenamos modelos propios.",
      en: "A small team working on applied philosophy and existing language technology. We do not train our own models.",
    },
  },
];

function Home() {
  const { lang } = useI18n();
  const es = lang === "es";
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState("");
  const [tone, setTone] = useState<ToneId | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    setTone(loadStoredTone());
  }, []);

  const featured = useMemo(() => {
    const ids: PhilosopherId[] = [
      "nietzsche", "marx", "plato", "confucius", "buddha", "suntzu",
      "aristotle", "marcusaurelius", "seneca", "socrates", "kant", "heidegger",
    ];
    return ids.filter((id) => id in PHILOSOPHERS);
  }, []);

  const spotlight = useMemo(() => {
    const day = new Date().getUTCDate();
    return PHILOSOPHER_LIST[day % PHILOSOPHER_LIST.length];
  }, []);

  function ask(text: string, source: string = "hero") {
    const q = text.trim();
    if (!q) return;
    track("question_submitted", { surface: "home", source, length: q.length });
    const qid = stashQuestion(q);
    navigate({
      to: "/oraculo",
      search: { ...(qid ? { qid } : {}), ...(tone ? { tone } : {}) },
    });
  }

  function onType(value: string) {
    setInquiry(value);
    if (!startedRef.current && value.trim().length > 2) {
      startedRef.current = true;
      track("question_started", { surface: "home" });
    }
  }

  const questionField = (idSuffix: string) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        ask(inquiry, idSuffix);
      }}
    >
      <label
        className="block font-serif text-subtitle font-light text-foreground"
        htmlFor={`inquiry-${idSuffix}`}
      >
        {es ? "¿Qué estás intentando comprender?" : "What are you trying to understand?"}
      </label>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          id={`inquiry-${idSuffix}`}
          value={inquiry}
          onChange={(e) => onType(e.target.value)}
          placeholder={
            es
              ? "Una pregunta, una decisión, una situación o una idea…"
              : "A question, a decision, a situation or an idea…"
          }
          className="focus-mist min-w-0 flex-1 rounded-md border border-bronze/45 bg-background/80 px-4 py-4 text-body text-foreground backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/70"
        />
        <button type="submit" className="btn-gold focus-mist whitespace-nowrap px-7 py-4 text-small">
          {es ? "Pensar con Pneum" : "Think with Pneum"}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <SiteNav />

      <main className="route-enter relative z-10">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden border-b border-border/60">
          <img
            src={heroColumns}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1088}
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-background/92 via-background/55 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-background/45"
          />

          <div className="relative mx-auto w-full max-w-6xl px-5 py-24 md:px-8 md:py-32">
            <div className="max-w-2xl">
              <h1 className="fade-up balance font-serif text-display font-light text-foreground">
                {es ? (
                  <>
                    Hay preguntas que no se resuelven con otro{" "}
                    <em className="text-bronze not-italic">consejo</em>.
                  </>
                ) : (
                  <>
                    Some questions are not solved by more{" "}
                    <em className="text-bronze not-italic">advice</em>.
                  </>
                )}
              </h1>
              <p className="lead measure mt-6">
                {es
                  ? "Pneum pone una pregunta real en perspectiva para ayudarte a descubrir qué estás suponiendo, qué estás dejando fuera y qué estás intentando decidir."
                  : "Pneum puts a real question in perspective so you can see what you are assuming, what you are leaving out and what you are actually trying to decide."}
              </p>

              <div className="mt-12">{questionField("hero")}</div>

              <div className="mt-4">
                <ToneSelect
                  value={tone}
                  onChange={(v) => {
                    setTone(v);
                    storeTone(v);
                  }}
                />
              </div>

              <ul className="mt-8 flex flex-wrap gap-2">
                {EXAMPLES.map((p) => (
                  <li key={p.en}>
                    <button
                      type="button"
                      onClick={() => ask(p[lang], "example")}
                      className="focus-mist rounded-full border border-border/60 bg-background/40 px-3.5 py-1.5 text-micro text-muted-foreground backdrop-blur-sm transition-colors hover:border-bronze/50 hover:text-foreground"
                    >
                      {p[lang]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Demostración ─────────────────────────────────────── */}
        <section className="border-b border-border/60 bg-card/25">
          <div className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28">
            <p className="label">{es ? "Momento a momento" : "Step by step"}</p>
            <h2 className="balance mt-3 max-w-2xl font-serif text-title font-light text-foreground">
              {es
                ? "Mira qué ocurre cuando Pneum piensa una pregunta"
                : "See what happens when Pneum thinks a question"}
            </h2>

            <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="flex flex-col justify-between border-l border-bronze/40 pl-6">
                <div>
                  <p className="label">{es ? "Escribes" : "You write"}</p>
                  <p className="mt-4 font-serif text-title font-light leading-snug text-foreground">
                    “{DEMO_QUESTION[lang]}”
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => ask(DEMO_QUESTION[lang], "demo")}
                  className="btn-gold focus-mist mt-10 self-start px-6 py-3 text-small"
                >
                  {es ? "Pensar esta pregunta" : "Think this question"}
                </button>
              </div>

              <ol className="flex flex-col divide-y divide-border/60 border-y border-border/60">
                <li className="py-6">
                  <p className="label">{es ? "Tensiones detectadas" : "Detected tensions"}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {DEMO_TENSIONS[lang].map((t) => (
                      <li
                        key={t}
                        className="rounded-full border border-border/70 px-3.5 py-1.5 text-micro uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </li>

                <li className="py-6">
                  <p className="label">{es ? "Perspectivas" : "Perspectives"}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {DEMO_PERSPECTIVES.filter((id) => id in PHILOSOPHERS).map((id) => (
                      <li key={id}>
                        <AskLink
                          to="/$philosopher"
                          params={{ philosopher: id }}
                          text={DEMO_QUESTION[lang]}
                          className="btn-ghost-gold focus-mist px-3.5 py-1.5 text-micro"
                        >
                          {PHILOSOPHERS[id].name}
                        </AskLink>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-small leading-relaxed text-muted-foreground">
                    {es
                      ? "Las tres parten de supuestos distintos sobre libertad, responsabilidad e identidad."
                      : "The three start from different assumptions about freedom, responsibility and identity."}
                  </p>
                </li>

                <li className="py-6">
                  <p className="label">{es ? "La pregunta que aparece" : "The question that appears"}</p>
                  <p className="mt-3 font-serif text-subtitle font-light leading-snug text-bronze-bright">
                    {DEMO_NEW_QUESTION[lang]}
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ── El método ────────────────────────────────────────── */}
        <section className="band-paper border-y border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <h2 className="balance max-w-2xl font-serif text-title font-light text-foreground">
              {es
                ? "Tu pregunta contiene más de lo que parece."
                : "Your question contains more than it seems."}
            </h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-6 lg:gap-4">
              {METHOD.map((step, i) => (
                <li key={step.en} className="border-t border-bronze/40 pt-4">
                  <p className="text-micro uppercase tracking-[0.25em] text-bronze">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 font-serif text-subtitle font-light leading-snug text-foreground">
                    {step[lang]}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Los tres instrumentos ────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="label">{es ? "Los instrumentos" : "The instruments"}</p>
          <h2 className="balance mt-3 max-w-2xl font-serif text-title font-light text-foreground">
            {es ? "Tres movimientos, un mismo recorrido" : "Three movements, one single path"}
          </h2>

          <ul className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-0">
            {INSTRUMENTS.map((inst, i) => (
              <li
                key={inst.id}
                className={i > 0 ? "lg:border-l lg:border-border lg:pl-10" : "lg:pr-10"}
              >
                <Link to={inst.to} className="focus-mist group block">
                  <h3 className="font-serif text-title font-light text-foreground">
                    {inst.name[lang]}
                  </h3>
                  <p className="mt-3 font-serif text-subtitle font-light leading-snug text-bronze-bright">
                    {inst.claim[lang]}
                  </p>
                  <p className="mt-4 text-small leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                    {inst.text[lang]}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Situaciones ──────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-xl font-serif text-title font-light text-foreground">
                {es
                  ? "Empieza por la situación que estás viviendo"
                  : "Start from the situation you are in"}
              </h2>
              <Link
                to="/situaciones"
                className="focus-mist text-small text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {es ? "Ver todas →" : "See all →"}
              </Link>
            </div>

            <ul className="mt-10 grid gap-x-10 gap-y-0 divide-y divide-border/60 border-y border-border/60 md:grid-cols-2 md:divide-y-0">
              {SITUATIONS.map((s) => (
                <li key={s.id} className="md:border-b md:border-border/60">
                  <Link
                    to="/situaciones/$id"
                    params={{ id: s.id }}
                    className="focus-mist group flex items-baseline justify-between gap-4 py-5"
                  >
                    <span className="font-serif text-subtitle font-light leading-snug text-foreground">
                      {s.title[lang]}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-bronze opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Y cuando quieras ir más lejos ────────────────────── */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <h2 className="balance max-w-2xl font-serif text-title font-light text-foreground">
              {es ? "Y cuando quieras ir más lejos." : "And when you want to go further."}
            </h2>
            <div className="mt-12 grid gap-14 lg:grid-cols-2">
              <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2 className="font-serif text-title font-light text-foreground">
                    {es ? "Entra por la idea" : "Enter by the idea"}
                  </h2>
                  <Link
                    to="/ideas"
                    className="focus-mist text-small text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {es ? "Todas las ideas →" : "All ideas →"}
                  </Link>
                </div>
                <ul className="mt-8 flex flex-col divide-y divide-border/60 border-y border-border/60">
                  {IDEAS.slice(0, 6).map((idea) => (
                    <li key={idea.id}>
                      <Link
                        to="/ideas/$id"
                        params={{ id: idea.id }}
                        className="focus-mist block py-4"
                      >
                        <span className="font-serif text-subtitle font-light text-foreground">
                          {idea.title[lang]}
                        </span>
                        <span className="mt-1 block text-small text-muted-foreground">
                          {idea.short[lang]}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2 className="font-serif text-title font-light text-foreground">
                    {es ? "Explora una pregunta" : "Explore a question"}
                  </h2>
                  <Link
                    to="/rutas"
                    className="focus-mist text-small text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {es ? "Todas las rutas →" : "All paths →"}
                  </Link>
                </div>
                <ul className="mt-8 grid gap-4">
                  {ROUTES.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      <Link
                        to="/rutas/$id"
                        params={{ id: r.id }}
                        className="card-editorial focus-mist block p-6"
                      >
                        <p className="label">
                          {r.steps.length} {es ? "perspectivas" : "perspectives"}
                        </p>
                        <h3 className="mt-3 font-serif text-subtitle font-light leading-tight text-foreground">
                          {r.question[lang]}
                        </h3>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Cómo construimos una perspectiva ─────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="label">{es ? "Transparencia" : "Transparency"}</p>
          <h2 className="balance mt-3 max-w-2xl font-serif text-title font-light text-foreground">
            {es ? "¿Cómo construimos una perspectiva?" : "How do we build a perspective?"}
          </h2>
          <p className="measure mt-5 text-body leading-relaxed text-muted-foreground">
            {es
              ? "Cada perspectiva es una construcción editorial basada en las obras, conceptos y contexto intelectual de un pensador. No pretende ser la persona histórica ni una conciencia digitalizada."
              : "Each perspective is an editorial construction based on a thinker's works, concepts and intellectual context. It does not claim to be the historical person or a digitised consciousness."}
          </p>

          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {TRUST.map((item) => (
              <li key={item.title.en} className="border-t border-border pt-4">
                <h3 className="text-small text-foreground">{item.title[lang]}</h3>
                <p className="mt-2 text-small leading-relaxed text-muted-foreground">
                  {item.text[lang]}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-10 flex flex-wrap gap-5 text-micro uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/nosotros" className="focus-mist hover:text-foreground">
              {es ? "Nosotros" : "About"}
            </Link>
            <Link to="/uso-de-ia" className="focus-mist hover:text-foreground">
              {es ? "Uso de IA" : "AI use"}
            </Link>
            <Link to="/contacto" className="focus-mist hover:text-foreground">
              {es ? "Contacto" : "Contact"}
            </Link>
            <Link to="/terminos" className="focus-mist hover:text-foreground">
              {es ? "Términos" : "Terms"}
            </Link>
          </p>
        </section>


        {/* ── Cierre ───────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8 md:py-32">
          <h2 className="balance font-serif text-title font-light text-foreground">
            {es ? "Trae tu pregunta." : "Bring your question."}
          </h2>
          <p className="mt-4 text-body leading-relaxed text-muted-foreground">
            {es
              ? "No necesita estar bien formulada. Ese suele ser el punto de partida."
              : "It does not need to be well formed. That is usually the starting point."}
          </p>
          <div className="mt-10 text-left">{questionField("cierre")}</div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
