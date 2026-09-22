import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { IDEAS, ROUTES } from "@/lib/discovery";
import { SITUATIONS } from "@/lib/situations";
import { useI18n } from "@/lib/i18n";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { track } from "@/lib/analytics";
import { stashQuestion } from "@/lib/question-handoff";

const TITLE = "Pneum — Claridad para decisiones difíciles";
const DESCRIPTION =
  "Pneum es inteligencia personal para decidir: filosofía aplicada que te ayuda a comprender una situación compleja, examinar cómo estás pensando y ver la pregunta de otra manera.";

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
            "Filosofía aplicada para comprender decisiones difíciles, examinar supuestos y ver patrones en cómo piensas. En español e inglés.",
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
                text: "Inteligencia personal para decidir: filosofía aplicada que ayuda a comprender una situación, examinar supuestos y tensiones, y reformular la pregunta. No decide por ti.",
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
                text: "No. Pneum es una herramienta de claridad de pensamiento, no un servicio de salud mental ni un sustituto de terapia profesional.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

type L = { es: string; en: string };

const INTENTS: { id: string; label: L; starter: L }[] = [
  {
    id: "decision",
    label: { es: "Quiero tomar una decisión", en: "I want to make a decision" },
    starter: {
      es: "Estoy intentando decidir si ",
      en: "I am trying to decide whether ",
    },
  },
  {
    id: "situation",
    label: { es: "Quiero entender una situación", en: "I want to understand a situation" },
    starter: { es: "Lo que está pasando es que ", en: "What is happening is that " },
  },
  {
    id: "idea",
    label: { es: "Quiero examinar una idea", en: "I want to examine an idea" },
    starter: { es: "Quiero examinar esta idea: ", en: "I want to examine this idea: " },
  },
  {
    id: "self",
    label: { es: "Quiero entenderme mejor", en: "I want to understand myself better" },
    starter: { es: "Me pasa que ", en: "What happens to me is that " },
  },
];

const DEMO_INPUT: L = {
  es: "Estoy pensando en cambiar de trabajo, pero no sé si realmente quiero hacerlo o simplemente estoy cansado.",
  en: "I am thinking about changing jobs, but I do not know if I really want to or I am just tired.",
};

const DEMO_STEPS: { label: L; body: L; items?: L[] }[] = [
  {
    label: { es: "Lo que parece ser la decisión", en: "What the decision seems to be" },
    body: { es: "Cambiar de trabajo o quedarte.", en: "Change jobs or stay." },
  },
  {
    label: { es: "Lo que podría estar debajo", en: "What might be underneath" },
    body: { es: "", en: "" },
    items: [
      { es: "Cansancio", en: "Exhaustion" },
      { es: "Libertad", en: "Freedom" },
      { es: "Reconocimiento", en: "Recognition" },
      { es: "Seguridad", en: "Security" },
      { es: "Identidad profesional", en: "Professional identity" },
    ],
  },
  {
    label: { es: "Una tensión", en: "A tension" },
    body: { es: "Libertad ↔ estabilidad", en: "Freedom ↔ stability" },
  },
  {
    label: { es: "Una pregunta que abre la decisión", en: "A question that opens the decision" },
    body: {
      es: "¿Qué perderías si te quedaras?",
      en: "What would you lose if you stayed?",
    },
  },
];

const MOVES: { name: L; text: L }[] = [
  {
    name: { es: "Clarificar", en: "Clarify" },
    text: {
      es: "Comprende qué está realmente en juego en lo que estás decidiendo.",
      en: "Understand what is really at stake in what you are deciding.",
    },
  },
  {
    name: { es: "Examinar", en: "Examine" },
    text: {
      es: "Examina supuestos, valores, tensiones y perspectivas que no habías considerado.",
      en: "Examine assumptions, values, tensions and perspectives you had not considered.",
    },
  },
  {
    name: { es: "Descubrir", en: "Discover" },
    text: {
      es: "Descubre patrones sobre cómo estás pensando, conversación tras conversación.",
      en: "Discover patterns in how you are thinking, conversation after conversation.",
    },
  },
];

const TRANSFORM: L[] = [
  { es: "¿Debería aceptar este trabajo?", en: "Should I take this job?" },
  {
    es: "¿Estoy buscando seguridad, reconocimiento, libertad o un cambio de identidad?",
    en: "Am I looking for security, recognition, freedom or a change of identity?",
  },
  {
    es: "¿Qué estoy suponiendo sobre lo que significa tener éxito?",
    en: "What am I assuming about what success means?",
  },
  {
    es: "¿Qué decisión seguiría teniendo sentido si elimino la necesidad de demostrar algo?",
    en: "Which decision would still make sense if I remove the need to prove something?",
  },
];

const ENGINE: { id: PhilosopherId; concepts: L }[] = [
  { id: "aristotle", concepts: { es: "virtud · carácter · acción", en: "virtue · character · action" } },
  { id: "nietzsche", concepts: { es: "valores · voluntad · creación", en: "values · will · creation" } },
  { id: "heidegger", concepts: { es: "existencia · autenticidad · sentido", en: "existence · authenticity · meaning" } },
  { id: "kierkegaard", concepts: { es: "elección · angustia · compromiso", en: "choice · anxiety · commitment" } },
  { id: "marx", concepts: { es: "estructura · poder · condiciones", en: "structure · power · conditions" } },
  { id: "james", concepts: { es: "experiencia · consecuencias", en: "experience · consequences" } },
];

const OVER_TIME: { when: L; text: L }[] = [
  { when: { es: "Hoy", en: "Today" }, text: { es: "“Ayúdame con esta decisión.”", en: "“Help me with this decision.”" } },
  {
    when: { es: "Después", en: "Later" },
    text: {
      es: "“Entiendo mejor lo que realmente estoy buscando.”",
      en: "“I understand better what I am actually looking for.”",
    },
  },
  {
    when: { es: "Con el tiempo", en: "Over time" },
    text: { es: "“Empiezo a ver cómo pienso.”", en: "“I start to see how I think.”" },
  },
];

const CONTROL: L[] = [
  { es: "Ver qué recuerda Pneum de ti.", en: "See what Pneum remembers about you." },
  { es: "Corregir o eliminar lo que no te representa.", en: "Correct or remove what does not represent you." },
  { es: "Decidir qué entra en tu mapa.", en: "Decide what enters your map." },
  { es: "Exportar o borrar todo.", en: "Export or delete everything." },
];

function Home() {
  const { lang } = useI18n();
  const es = lang === "es";
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState("");
  const startedRef = useRef(false);
  const heroInputRef = useRef<HTMLTextAreaElement>(null);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    if (demoStep >= DEMO_STEPS.length) return;
    const t = setTimeout(() => setDemoStep((s) => s + 1), demoStep === 0 ? 900 : 1400);
    return () => clearTimeout(t);
  }, [demoStep]);

  function ask(text: string, source: string) {
    const q = text.trim();
    if (!q) return;
    track("question_submitted", { surface: "home", source, length: q.length });
    const qid = stashQuestion(q);
    navigate({ to: "/oraculo", search: { ...(qid ? { qid } : {}) } });
  }

  function onType(value: string) {
    setInquiry(value);
    if (!startedRef.current && value.trim().length > 2) {
      startedRef.current = true;
      track("question_started", { surface: "home" });
    }
  }

  function composer(idSuffix: string, withIntents: boolean) {
    return (
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
        <textarea
          id={`inquiry-${idSuffix}`}
          ref={idSuffix === "hero" ? heroInputRef : undefined}
          value={inquiry}
          rows={3}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              ask(inquiry, idSuffix);
            }
          }}
          placeholder={
            es
              ? "Cuéntame la situación con tus propias palabras…"
              : "Tell me the situation in your own words…"
          }
          className="focus-mist mt-4 w-full resize-y rounded-md border border-border bg-background/70 px-4 py-4 text-body leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn-gold focus-mist px-7 py-3 text-small">
            {es ? "Explorar una decisión" : "Explore a decision"}
          </button>
          <span className="text-micro text-muted-foreground">
            {es ? "La decisión sigue siendo tuya." : "The decision remains yours."}
          </span>
        </div>

        {withIntents && (
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {INTENTS.map((intent) => (
              <li key={intent.id}>
                <button
                  type="button"
                  onClick={() => {
                    track("intent_selected", { intent: intent.id });
                    setInquiry(intent.starter[lang]);
                    heroInputRef.current?.focus();
                    const el = heroInputRef.current;
                    if (el) el.setSelectionRange(el.value.length, el.value.length);
                  }}
                  className="focus-mist w-full rounded-md border border-border/70 px-4 py-3 text-left text-small text-muted-foreground transition-colors hover:border-bronze/60 hover:text-foreground"
                >
                  {intent.label[lang]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>
    );
  }

  return (
    <>
      <SiteNav />

      <main className="route-enter relative z-10 pb-16 md:pb-0">
        {/* 01 — Hero */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="label">
                {es ? "Inteligencia personal para decidir" : "Personal decision intelligence"}
              </p>
              <h1 className="fade-up balance mt-5 font-serif text-display font-light text-foreground">
                {es ? (
                  <>
                    Hay decisiones que no necesitan más consejos. Necesitan más{" "}
                    <em className="text-bronze not-italic">claridad</em>.
                  </>
                ) : (
                  <>
                    Some decisions don&apos;t need more advice. They need more{" "}
                    <em className="text-bronze not-italic">clarity</em>.
                  </>
                )}
              </h1>
              <p className="lead measure mt-6">
                {es
                  ? "Pneum usa filosofía aplicada para ayudarte a comprender situaciones complejas, examinar cómo estás pensando y decidir con mayor claridad."
                  : "Pneum uses applied philosophy to help you understand complex situations, examine how you are thinking and decide with greater clarity."}
              </p>

              <div className="mt-10">{composer("hero", true)}</div>
            </div>

            {/* 02 — La experiencia */}
            <div className="lg:pt-24">
              <div className="rounded-lg border border-border/70 bg-card/40 p-6 md:p-8">
                <p className="label">{es ? "Una demostración" : "A demonstration"}</p>
                <p className="mt-4 border-l border-bronze/50 pl-4 font-serif text-subtitle font-light leading-snug text-foreground">
                  {DEMO_INPUT[lang]}
                </p>
                <ol className="mt-7 divide-y divide-border/50">
                  {DEMO_STEPS.map((step, i) => (
                    <li
                      key={step.label.en}
                      className={`py-4 transition-all duration-700 ${
                        i < demoStep ? "opacity-100" : "translate-y-1 opacity-0"
                      }`}
                    >
                      <p className="label">{step.label[lang]}</p>
                      {step.items ? (
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {step.items.map((it) => (
                            <li
                              key={it.en}
                              className="rounded-full border border-border/70 px-3 py-1 text-micro text-muted-foreground"
                            >
                              {it[lang]}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 font-serif text-subtitle font-light leading-snug text-bronze-bright">
                          {step.body[lang]}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => setDemoStep(0)}
                  className="focus-mist mt-5 text-micro text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {es ? "Ver de nuevo" : "Watch again"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 03 — Qué hace Pneum */}
        <section className="border-y border-border/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3 md:gap-0 md:px-8 md:py-24">
            {MOVES.map((m, i) => (
              <div key={m.name.en} className={i > 0 ? "md:border-l md:border-border md:pl-10" : "md:pr-10"}>
                <h2 className="font-serif text-title font-light text-foreground">{m.name[lang]}</h2>
                <p className="mt-3 text-small leading-relaxed text-muted-foreground">{m.text[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — La diferencia */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <h2 className="balance max-w-3xl font-serif text-title font-light text-foreground">
            {es
              ? "Pneum no te da una respuesta. Te ayuda a ver la estructura de la pregunta."
              : "Pneum doesn't give you an answer. It helps you see the structure of the question."}
          </h2>
          <ol className="mt-12 grid gap-0 divide-y divide-border/60 border-y border-border/60">
            {TRANSFORM.map((q, i) => (
              <li key={q.en} className="flex gap-6 py-6">
                <span className="mt-1 text-micro uppercase tracking-[0.25em] text-bronze">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className={`font-serif text-subtitle font-light leading-snug ${
                    i === 0 ? "text-muted-foreground line-through decoration-border" : "text-foreground"
                  }`}
                >
                  {q[lang]}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* 05 — El motor filosófico */}
        <section className="band-paper border-y border-border">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-2xl font-serif text-title font-light text-foreground">
                {es
                  ? `${PHILOSOPHER_LIST.length} perspectivas filosóficas, usadas como instrumentos de pensamiento.`
                  : `${PHILOSOPHER_LIST.length} philosophical perspectives, used as instruments of thought.`}
              </h2>
              <Link
                to="/filosofos"
                className="focus-mist text-small text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {es ? "Ver las perspectivas →" : "See the perspectives →"}
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-10 gap-y-0 divide-y divide-border/60 border-y border-border/60 md:grid-cols-2 md:divide-y-0">
              {ENGINE.filter((e) => e.id in PHILOSOPHERS).map((e) => (
                <li key={e.id} className="md:border-b md:border-border/60">
                  <Link
                    to="/filosofos/$id"
                    params={{ id: e.id }}
                    className="focus-mist flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="font-serif text-subtitle font-light text-foreground">
                      {PHILOSOPHERS[e.id].name}
                    </span>
                    <span className="text-micro text-muted-foreground">{e.concepts[lang]}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-2xl text-small leading-relaxed text-muted-foreground">
              {es
                ? "Primero eliges desde qué lente mirar la situación; después aparecen los pensadores que representan esa lente."
                : "First you choose the lens to look through; then the thinkers who represent that lens appear."}
            </p>
          </div>
        </section>

        {/* 06 — Mapa de pensamiento */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="label">{es ? "Mapa de pensamiento" : "Thinking map"}</p>
              <h2 className="balance mt-4 font-serif text-title font-light text-foreground">
                {es
                  ? "Con cada conversación, Pneum aprende algo sobre cómo piensas."
                  : "With each conversation, Pneum learns something about how you think."}
              </h2>
              <p className="lead measure mt-5">
                {es
                  ? "Tus conversaciones no quedan aisladas: decisiones, valores, conceptos, tensiones y preguntas se conectan en una representación dinámica de tu pensamiento."
                  : "Your conversations don't stay isolated: decisions, values, concepts, tensions and questions connect into a dynamic representation of your thinking."}
              </p>
              <p className="mt-4 text-small text-muted-foreground">
                {es
                  ? "No es un perfil psicológico, ni un diagnóstico, ni un test."
                  : "It is not a psychological profile, a diagnosis or a test."}
              </p>
              <Link to="/mi-mapa" className="btn-ghost-gold focus-mist mt-8 inline-flex px-5 py-2.5 text-micro">
                {es ? "Ver tu mapa" : "See your map"}
              </Link>
            </div>

            <ol className="grid gap-0 divide-y divide-border/60 self-start border-y border-border/60">
              {OVER_TIME.map((o) => (
                <li key={o.when.en} className="py-6">
                  <p className="label">{o.when[lang]}</p>
                  <p className="mt-2 font-serif text-subtitle font-light leading-snug text-foreground">
                    {o.text[lang]}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 07 — Qué quieres comprender */}
        <section className="border-y border-border/60 bg-card/25">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-xl font-serif text-title font-light text-foreground">
                {es ? "¿Qué quieres comprender?" : "What do you want to understand?"}
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

        {/* 08 — Ideas y rutas */}
        <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-14 lg:grid-cols-2">
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
                    <Link to="/ideas/$id" params={{ id: idea.id }} className="focus-mist block py-4">
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
        </section>

        {/* 09 — Tu pensamiento te pertenece */}
        <section className="band-paper border-y border-border">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
            <div>
              <h2 className="font-serif text-title font-light text-foreground">
                {es ? "Tu pensamiento te pertenece." : "Your thinking belongs to you."}
              </h2>
              <p className="mt-4 max-w-md text-small leading-relaxed text-muted-foreground">
                {es
                  ? "Pneum construye memoria sólo con lo que tú decides guardar, y esa memoria es legible y reversible."
                  : "Pneum builds memory only from what you decide to keep, and that memory is readable and reversible."}
              </p>
              <Link to="/perfil" className="btn-ghost-gold focus-mist mt-8 inline-flex px-5 py-2.5 text-micro">
                {es ? "Ver y controlar tu memoria" : "See and control your memory"}
              </Link>
            </div>
            <ul className="grid gap-0 divide-y divide-border/60 self-start border-y border-border/60">
              {CONTROL.map((c) => (
                <li key={c.en} className="py-4 text-small text-muted-foreground">
                  {c[lang]}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 10 — Cierre */}
        <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          {composer("closing", false)}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
