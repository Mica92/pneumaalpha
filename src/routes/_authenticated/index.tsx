import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { portraitFocus, portraitOf, profileOf } from "@/lib/portraits";
import { IDEAS, REAL_PROBLEMS, ROUTES, centralQuestion } from "@/lib/discovery";
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
import audiencePersonal from "@/assets/audience-personal.jpg";
import audienceAcademic from "@/assets/audience-academic.jpg";
import audienceExecutive from "@/assets/audience-executive.jpg";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Pneum — Claridad para preguntas difíciles" },
      {
        name: "description",
        content:
          "Pneum te ayuda a comprender preguntas, problemas y decisiones complejas con mayor claridad. Filosofía aplicada, inteligencia artificial y análisis intelectual.",
      },
      { property: "og:title", content: "Pneum — Claridad para preguntas difíciles" },
      {
        property: "og:description",
        content:
          "Escribe lo que estás intentando comprender. Pneum interpreta tu pregunta, confronta perspectivas y te devuelve claridad antes de decidir.",
      },
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
            "Claridad de pensamiento para preguntas, problemas y decisiones complejas. Pneum usa filosofía aplicada como motor intelectual, en español e inglés.",
          applicationCategory: "LifestyleApplication",
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
              name: "¿En qué idiomas funciona Pneum?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "En español y en inglés. Pneum responde en el idioma en que escribas tu pregunta.",
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
            {
              "@type": "Question",
              name: "¿Cómo funciona?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Escribes lo que estás intentando comprender. Pneum interpreta tu pregunta, muestra lo que parece haber detrás y confronta perspectivas relevantes para pensarla mejor. No necesitas saber filosofía.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

const DEMO_QUESTION = {
  es: "Quiero renunciar, pero necesito el sueldo.",
  en: "I want to quit, but I need the salary.",
};

const DEMO_STEPS: {
  id: string;
  label: { es: string; en: string };
  text: { es: string; en: string };
}[] = [
  {
    id: "reading",
    label: { es: "Interpretación", en: "Interpretation" },
    text: {
      es: "Tu pregunta parece contener una tensión entre seguridad, sentido y autonomía.",
      en: "Your question seems to contain a tension between security, meaning and autonomy.",
    },
  },
  {
    id: "reframe",
    label: { es: "Reencuadre", en: "Reframing" },
    text: {
      es: "Quizás el problema no es solamente si renunciar, sino qué estás dispuesto a sacrificar para conservar seguridad.",
      en: "Perhaps the problem is not only whether to quit, but what you are willing to sacrifice to keep security.",
    },
  },
  {
    id: "aha",
    label: { es: "Una forma distinta de verlo", en: "A different way of seeing it" },
    text: {
      es: "Si la seguridad es lo que estás comprando, conviene saber exactamente con qué la estás pagando.",
      en: "If security is what you are buying, it helps to know exactly what you are paying with.",
    },
  },
];

const DEMO_PERSPECTIVES: PhilosopherId[] = ["camus", "aristotle", "marx"];

const CAPABILITIES: {
  id: string;
  to: "/explorar" | "/analisis" | "/comparar" | "/conocimiento";
  title: { es: string; en: string };
  text: { es: string; en: string };
}[] = [
  {
    id: "explore",
    to: "/explorar",
    title: { es: "Explora", en: "Explore" },
    text: {
      es: "Accede a ideas, autores y conceptos clave para ampliar tu horizonte de pensamiento.",
      en: "Reach ideas, authors and key concepts that widen your horizon of thought.",
    },
  },
  {
    id: "analyse",
    to: "/analisis",
    title: { es: "Analiza", en: "Analyse" },
    text: {
      es: "Comprende tus textos, identifica patrones de pensamiento y detecta áreas de mejora.",
      en: "Understand your texts, identify patterns of thought and spot what to improve.",
    },
  },
  {
    id: "decide",
    to: "/comparar",
    title: { es: "Decide", en: "Decide" },
    text: {
      es: "Enfrenta decisiones complejas con análisis estructurado, múltiples perspectivas y escenarios.",
      en: "Face complex decisions with structured analysis, multiple perspectives and scenarios.",
    },
  },
  {
    id: "learn",
    to: "/conocimiento",
    title: { es: "Aprende", en: "Learn" },
    text: {
      es: "Desarrolla tu pensamiento crítico y profundiza en los temas que realmente importan.",
      en: "Develop critical thinking and go deeper into the questions that matter.",
    },
  },
];

const HOW_IT_WORKS: { es: string; en: string }[] = [
  { es: "Escribes", en: "You write" },
  { es: "Comprendemos", en: "We interpret" },
  { es: "Confrontamos perspectivas", en: "We confront perspectives" },
  { es: "Ves el problema de otra manera", en: "You see the problem differently" },
];

const INFRASTRUCTURE: { title: { es: string; en: string }; text: { es: string; en: string } }[] = [
  {
    title: { es: "Oráculo", en: "Oracle" },
    text: {
      es: "Lee tu pregunta y expone la tensión que contiene.",
      en: "Reads your question and surfaces the tension it holds.",
    },
  },
  {
    title: { es: "Inteligencia de texto", en: "Text intelligence" },
    text: {
      es: "Reconoce conceptos, supuestos y saltos en un texto.",
      en: "Recognises concepts, assumptions and gaps in a text.",
    },
  },
  {
    title: { es: "Motor de análisis", en: "Analysis engine" },
    text: {
      es: "Contrasta argumentos y los pone a prueba entre sí.",
      en: "Contrasts arguments and tests them against each other.",
    },
  },
  {
    title: { es: "Motor filosófico", en: "Philosophical engine" },
    text: {
      es: "Siglos de pensamiento convertidos en perspectivas operativas.",
      en: "Centuries of thought turned into working perspectives.",
    },
  },
  {
    title: { es: "Grafo intelectual", en: "Intellectual graph" },
    text: {
      es: "Un mapa de cómo se relacionan ideas, escuelas y tradiciones.",
      en: "A map of how ideas, schools and traditions relate.",
    },
  },
  {
    title: { es: "Inteligencia de decisión", en: "Decision intelligence" },
    text: {
      es: "Perspectivas confrontadas antes de que decidas.",
      en: "Perspectives confronted before you decide.",
    },
  },
];

const AUDIENCES: {
  id: string;
  img: string;
  to: "/oraculo" | "/explorar" | "/comparar";
  title: { es: string; en: string };
  text: { es: string; en: string };
  cta: { es: string; en: string };
}[] = [
  {
    id: "personal",
    img: audiencePersonal,
    to: "/oraculo",
    title: { es: "Personal", en: "Personal" },
    text: {
      es: "Para quienes quieren pensar mejor, vivir con más claridad y descubrir nuevas perspectivas.",
      en: "For those who want to think better, live with more clarity and find new perspectives.",
    },
    cta: { es: "Comenzar", en: "Start" },
  },
  {
    id: "academic",
    img: audienceAcademic,
    to: "/explorar",
    title: { es: "Académico", en: "Academic" },
    text: {
      es: "Para estudiantes, docentes e instituciones que creen en el poder del pensamiento crítico.",
      en: "For students, teachers and institutions that believe in critical thinking.",
    },
    cta: { es: "Explorar", en: "Explore" },
  },
  {
    id: "executive",
    img: audienceExecutive,
    to: "/comparar",
    title: { es: "Ejecutivo", en: "Executive" },
    text: {
      es: "Para líderes y tomadores de decisiones que enfrentan desafíos complejos y de alto impacto.",
      en: "For leaders and decision makers facing complex, high-impact challenges.",
    },
    cta: { es: "Explorar", en: "Explore" },
  },
];

function Home() {
  const { lang } = useI18n();
  const es = lang === "es";
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState("");
  const [tone, setTone] = useState<ToneId | null>(null);

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

          <div className="relative mx-auto w-full max-w-6xl px-5 py-28 md:px-8 md:py-36">
            <div className="max-w-2xl">
              <h1 className="fade-up balance font-serif text-display font-light text-foreground">
                {es ? (
                  <>
                    Claridad para preguntas <em className="text-bronze not-italic">difíciles</em>.
                  </>
                ) : (
                  <>
                    Clarity for <em className="text-bronze not-italic">hard</em> questions.
                  </>
                )}
              </h1>
              <p className="lead measure mt-6">
                {es
                  ? "Pneum te ayuda a comprender preguntas, problemas y decisiones complejas con mayor claridad."
                  : "Pneum helps you understand complex questions, problems and decisions with greater clarity."}
              </p>
              <p className="mt-3 text-micro uppercase tracking-[0.25em] text-bronze-bright">
                {es
                  ? "Filosofía aplicada + inteligencia artificial + análisis intelectual"
                  : "Applied philosophy + artificial intelligence + intellectual analysis"}
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(inquiry);
                }}
                className="mt-12"
              >
                <label
                  className="block font-serif text-subtitle font-light text-foreground"
                  htmlFor="home-inquiry"
                >
                  {es ? "¿Qué estás intentando comprender?" : "What are you trying to understand?"}
                </label>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="home-inquiry"
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    placeholder={
                      es
                        ? "Escribe una pregunta, problema, decisión o idea…"
                        : "Write a question, problem, decision or idea…"
                    }
                    className="focus-mist min-w-0 flex-1 rounded-md border border-bronze/45 bg-background/80 px-4 py-4 text-body text-foreground backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/70"
                  />
                  <button
                    type="submit"
                    className="btn-gold focus-mist whitespace-nowrap px-7 py-4 text-small"
                  >
                    {es ? "Pensarlo con Pneum" : "Think it with Pneum"}
                  </button>
                </div>
              </form>

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
                {REAL_PROBLEMS.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => ask(p.text[lang], "suggestion")}
                      className="focus-mist rounded-full border border-border/60 bg-background/40 px-3.5 py-1.5 text-micro text-muted-foreground backdrop-blur-sm transition-colors hover:border-bronze/50 hover:text-foreground"
                    >
                      {p.text[lang]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <p
              aria-hidden="true"
              className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 border-l border-bronze/40 pl-4 text-micro leading-loose tracking-[0.18em] text-foreground/70 xl:block"
            >
              {es ? "Más perspectiva." : "More perspective."}
              <br />
              {es ? "Mejores preguntas." : "Better questions."}
              <br />
              {es ? "Mejores decisiones." : "Better decisions."}
            </p>
          </div>
        </section>

        {/* ── Demostración ─────────────────────────────────────── */}
        <section className="border-b border-border/60 bg-card/25">
          <div className="mx-auto max-w-5xl px-5 py-20 md:px-8 md:py-28">
            <p className="label">{es ? "Así se ve" : "What it looks like"}</p>
            <h2 className="balance mt-3 max-w-2xl font-serif text-title font-light text-foreground">
              {es
                ? "Una pregunta cualquiera, pensada de otra manera"
                : "An ordinary question, thought through differently"}
            </h2>

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <div className="card-editorial flex flex-col justify-between p-7">
                <div>
                  <p className="label">{es ? "Escribes" : "You write"}</p>
                  <p className="mt-4 font-serif text-subtitle font-light leading-snug text-foreground">
                    “{DEMO_QUESTION[lang]}”
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => ask(DEMO_QUESTION[lang], "demo")}
                  className="btn-gold focus-mist mt-8 self-start px-6 py-3 text-small"
                >
                  {es ? "Explorar esta pregunta" : "Explore this question"}
                </button>
              </div>

              <ol className="flex flex-col gap-4">
                {DEMO_STEPS.slice(0, 2).map((step) => (
                  <li key={step.id} className="card-editorial p-6">
                    <p className="label">{step.label[lang]}</p>
                    <p className="mt-3 text-body leading-relaxed text-muted-foreground">
                      {step.text[lang]}
                    </p>
                  </li>
                ))}

                <li className="card-editorial p-6">
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
                </li>

                <li className="card-editorial border-bronze/45 bg-bronze/5 p-6">
                  <p className="label">{DEMO_STEPS[2].label[lang]}</p>
                  <p className="mt-3 font-serif text-subtitle font-light leading-snug text-bronze-bright">
                    {DEMO_STEPS[2].text[lang]}
                  </p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* ── Capacidades ──────────────────────────────────────── */}
        <section className="band-paper border-y border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              {CAPABILITIES.map((c, i) => (
                <li
                  key={c.id}
                  className={i > 0 ? "lg:border-l lg:border-border lg:pl-10" : "lg:pr-10"}
                >
                  <Link to={c.to} className="focus-mist group block">
                    <h3 className="font-serif text-subtitle font-light text-foreground">
                      {c.title[lang]}
                    </h3>
                    <p className="mt-3 text-small leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                      {c.text[lang]}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Cómo funciona ────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <p className="label">{es ? "Cómo funciona" : "How it works"}</p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={step.en} className="border-t border-bronze/30 pt-5">
                  <p className="text-micro uppercase tracking-[0.25em] text-bronze">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 font-serif text-subtitle font-light leading-snug text-foreground">
                    {step[lang]}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── La filosofía aplicada es el motor ────────────────── */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <p className="label">{es ? "El motor" : "The engine"}</p>
          <h2 className="balance mt-3 max-w-3xl font-serif text-title font-light text-foreground">
            {es
              ? "La filosofía aplicada es el motor de Pneum."
              : "Applied philosophy is the engine of Pneum."}
          </h2>
          <p className="measure mt-5 text-body leading-relaxed text-muted-foreground">
            {es
              ? "Pneum utiliza siglos de pensamiento filosófico para ampliar perspectivas, cuestionar supuestos y profundizar preguntas reales."
              : "Pneum draws on centuries of philosophical thought to widen perspectives, question assumptions and deepen real questions."}
          </p>
          <p className="measure mt-4 font-serif text-subtitle font-light leading-snug text-bronze-bright">
            {es
              ? "No buscamos darte una respuesta única. Ponemos distintas formas de pensar a trabajar sobre tu problema."
              : "We do not aim to give you a single answer. We put different ways of thinking to work on your problem."}
          </p>

          <p className="label mt-14">{es ? "Perspectivas de entrada" : "Starting perspectives"}</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((id) => (
              <li key={id}>
                <PhilosopherCard id={id} />
              </li>
            ))}
          </ul>
          <Link
            to="/filosofos"
            className="focus-mist mt-8 inline-block text-small text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {es ? "Ver todas las perspectivas →" : "See all perspectives →"}
          </Link>
        </section>

        {/* ── La inteligencia detrás de tu pensamiento ─────────── */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
            <div>
              <p className="label">{es ? "Una sola plataforma" : "One single platform"}</p>
              <h2 className="balance mt-3 font-serif text-title font-light text-foreground">
                {es ? "La inteligencia detrás de tu pensamiento." : "The intelligence behind your thinking."}
              </h2>
              <p className="measure mt-5 text-body leading-relaxed text-muted-foreground">
                {es
                  ? "Pneum integra múltiples capas de inteligencia para ofrecerte una experiencia única y profunda."
                  : "Pneum integrates multiple layers of intelligence to give you a single, deep experience."}
              </p>
              <blockquote className="mt-10 border-l border-bronze/40 pl-5">
                <p className="font-serif text-subtitle font-light italic leading-snug text-bronze-bright">
                  {es
                    ? "“El pensamiento no es un lujo, es una herramienta de supervivencia.”"
                    : "“Thought is not a luxury, it is a survival tool.”"}
                </p>
                <footer className="mt-3 text-micro uppercase tracking-[0.25em] text-muted-foreground">
                  — {SITE_NAME}
                </footer>
              </blockquote>
            </div>

            <div>
              <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
                <ul className="flex flex-col gap-3">
                  {INFRASTRUCTURE.slice(0, 3).map((item) => (
                    <li
                      key={item.title.en}
                      className="rounded-md border border-border/70 bg-background/60 px-4 py-3"
                    >
                      <p className="text-small text-foreground">{item.title[lang]}</p>
                      <p className="mt-1 text-micro leading-relaxed text-muted-foreground">
                        {item.text[lang]}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mx-auto flex size-32 items-center justify-center rounded-full border border-bronze/45 bg-background/70 text-center md:size-36">
                  <span className="font-serif text-subtitle font-light tracking-[0.3em] text-bronze-bright">
                    {SITE_NAME.toUpperCase()}
                  </span>
                </div>

                <ul className="flex flex-col gap-3">
                  {INFRASTRUCTURE.slice(3).map((item) => (
                    <li
                      key={item.title.en}
                      className="rounded-md border border-border/70 bg-background/60 px-4 py-3"
                    >
                      <p className="text-small text-foreground">{item.title[lang]}</p>
                      <p className="mt-1 text-micro leading-relaxed text-muted-foreground">
                        {item.text[lang]}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <ol className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {(es
                  ? ["Claridad", "Juicio", "Acción"]
                  : ["Clarity", "Judgement", "Action"]
                ).map((step, i) => (
                  <li key={step} className="flex items-center gap-3">
                    {i > 0 && (
                      <span aria-hidden="true" className="text-bronze/60">
                        →
                      </span>
                    )}
                    <span className="rounded-full border border-bronze/35 px-4 py-1.5 text-micro uppercase tracking-[0.25em] text-bronze-bright">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── Diseñado para cada tipo de pensador ──────────────── */}
        <section className="band-paper border-y border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
            <h2 className="font-serif text-title font-light text-foreground">
              {es ? "Diseñado para cada tipo de pensador" : "Designed for every kind of thinker"}
            </h2>
            <p className="mt-2 text-small text-muted-foreground">
              {es
                ? "Una misma infraestructura. Diferentes caminos."
                : "One infrastructure. Different paths."}
            </p>

            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {AUDIENCES.map((a) => (
                <li key={a.id}>
                  <Link
                    to={a.to}
                    className="focus-mist group flex h-full flex-col overflow-hidden rounded-md border border-border transition-colors hover:border-bronze/60"
                  >
                    <img
                      src={a.img}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      width={992}
                      height={672}
                      className="aspect-[3/2] w-full object-cover"
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-serif text-subtitle font-light text-foreground">
                        {a.title[lang]}
                      </h3>
                      <p className="mt-3 text-small leading-relaxed text-muted-foreground">
                        {a.text[lang]}
                      </p>
                      <span className="mt-6 text-micro uppercase tracking-[0.25em] text-bronze-bright">
                        {a.cta[lang]} →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Grandes ideas ────────────────────────────────────── */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label">{es ? "Grandes ideas" : "Great ideas"}</p>
                <h2 className="mt-3 font-serif text-title font-light text-foreground">
                  {es ? "Conceptos, en lenguaje simple" : "Concepts, in plain language"}
                </h2>
              </div>
              <Link
                to="/ideas"
                className="focus-mist text-small text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
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
                    <h3 className="font-serif text-subtitle font-light text-foreground">
                      {idea.title[lang]}
                    </h3>
                    <p className="mt-2 text-small text-bronze-bright">{idea.short[lang]}</p>
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
              <p className="label">{es ? "Rutas" : "Paths"}</p>
              <h2 className="mt-3 max-w-xl font-serif text-title font-light text-foreground">
                {es ? "Una pregunta, cuatro perspectivas" : "One question, four perspectives"}
              </h2>
            </div>
            <Link
              to="/rutas"
              className="focus-mist text-small text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
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
                  <h3 className="mt-3 font-serif text-subtitle font-light leading-tight text-foreground">
                    {r.question[lang]}
                  </h3>
                  <p className="mt-3 text-small leading-relaxed text-muted-foreground">
                    {r.intro[lang]}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Qué es Pneum ─────────────────────────────────────── */}
        <section className="border-y border-border/60">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <p className="label">{es ? "Qué es Pneum" : "What Pneum is"}</p>
            <h2 className="balance mt-3 max-w-3xl font-serif text-title font-light text-foreground">
              {es
                ? "Una infraestructura intelectual para pensar mejor lo que tienes delante"
                : "An intellectual infrastructure for thinking better about what is in front of you"}
            </h2>
            <p className="measure mt-5 text-small leading-relaxed text-muted-foreground">
              {es
                ? `Pneum reúne un motor de interpretación de preguntas, análisis de textos, confrontación de perspectivas, un mapa navegable de ideas y una biblioteca de ${PHILOSOPHER_LIST.length} perspectivas históricas. Cada perspectiva es un personaje editorial escrito por nuestro equipo a partir de la obra publicada de un autor de dominio público.`
                : `Pneum brings together an engine for interpreting questions, text analysis, confrontation of perspectives, a navigable map of ideas and a library of ${PHILOSOPHER_LIST.length} historical perspectives. Each perspective is an editorial persona written by our team from the published work of a public-domain author.`}
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="card-editorial p-6">
                <p className="label">{es ? "Qué recibes" : "What you get"}</p>
                <ul className="mt-4 space-y-2.5 text-small leading-relaxed text-muted-foreground">
                  {(es
                    ? [
                        "Lectura e interpretación de tus preguntas, sin límite de uso.",
                        "Análisis de textos: conceptos, supuestos y contradicciones.",
                        "Confrontación de perspectivas antes de decidir.",
                        "Mapa de ideas, rutas guiadas y podcast de los clásicos.",
                        "Historial completo y exportable de tu trabajo.",
                      ]
                    : [
                        "Reading and interpretation of your questions, with no usage limit.",
                        "Text analysis: concepts, assumptions and contradictions.",
                        "Confrontation of perspectives before you decide.",
                        "Map of ideas, guided paths and a podcast on the classics.",
                        "Full, exportable history of your work.",
                      ]
                  ).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true" className="text-bronze">
                        ·
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-editorial p-6">
                <p className="label">{es ? "Qué no es" : "What it is not"}</p>
                <ul className="mt-4 space-y-2.5 text-small leading-relaxed text-muted-foreground">
                  {(es
                    ? [
                        "No es asesoría psicológica, médica, legal ni financiera.",
                        "No es un compañero virtual ni un servicio de acompañamiento emocional o romántico.",
                        "No reconstruye personas vivas: solo autores históricos de dominio público. Sin deepfakes ni suplantaciones.",
                        "No es un asistente de propósito general: el sistema está acotado al dominio filosófico.",
                        "Las respuestas son generadas por un modelo de lenguaje y pueden contener errores: verifícalas.",
                      ]
                    : [
                        "It is not psychological, medical, legal or financial advice.",
                        "It is not a virtual companion or an emotional/romantic support service.",
                        "It does not reconstruct living people: historical, public-domain authors only. No deepfakes, no impersonation.",
                        "It is not a general-purpose assistant: the system is scoped to philosophy.",
                        "Answers are generated by a language model and may be inaccurate: verify them.",
                      ]
                  ).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true" className="text-bronze">
                        ·
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/uso-de-ia"
                  className="focus-mist mt-6 inline-block text-micro uppercase tracking-[0.25em] text-bronze-bright underline-offset-4 hover:underline"
                >
                  {es ? "Política de uso de IA →" : "AI acceptable use policy →"}
                </Link>
              </div>
            </div>

            <p className="mt-8 text-micro leading-relaxed text-muted-foreground">
              {es
                ? "Acceso completo y gratuito. Soporte: soporte@pneumaalpha.app."
                : "Complete, free access. Support: soporte@pneumaalpha.app."}
            </p>
            <p className="mt-3 flex flex-wrap gap-4 text-micro uppercase tracking-[0.25em] text-muted-foreground">
              <Link to="/contacto" className="focus-mist hover:text-foreground">
                {es ? "Contacto" : "Contact"}
              </Link>
              <Link to="/terminos" className="focus-mist hover:text-foreground">
                {es ? "Términos" : "Terms"}
              </Link>
            </p>
          </div>
        </section>

        {/* ── Perspectiva del día ──────────────────────────────── */}
        <section className="bg-card/25">
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
              <p className="label">{es ? "Perspectiva del día" : "Perspective of the day"}</p>
              <h2 className="mt-3 font-serif text-title font-light text-foreground">
                {spotlight.name}
              </h2>
              <p className="mt-2 text-small text-muted-foreground">{spotlight.subtitle[lang]}</p>
              <p className="mt-6 max-w-lg font-serif text-subtitle font-light italic leading-snug text-bronze-bright">
                {centralQuestion(spotlight.id, lang)}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/$philosopher"
                  params={{ philosopher: spotlight.id }}
                  className="btn-gold focus-mist px-6 py-3 text-small"
                >
                  {es ? "Pensar desde aquí" : "Think from here"}
                </Link>
                <Link
                  to="/filosofos/$id"
                  params={{ id: spotlight.id }}
                  className="btn-ghost-gold focus-mist px-5 py-3 text-small"
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
