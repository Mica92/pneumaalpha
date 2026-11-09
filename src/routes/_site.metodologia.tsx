import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CTA, PRINCIPLES, STEPS, type L } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import { Eyebrow, IndexNumber, PageHero, Reveal, SectionHeading } from "@/components/institutional/primitives";
import { AiLearningNote } from "@/components/institutional/evidence";

export const Route = createFileRoute("/_site/metodologia")({
  component: MethodologyPage,
  head: () =>
    institutionalHead({
      path: "/metodologia",
      title: "Metodología — Pensamiento crítico, diálogo filosófico y el rol de la IA en Kionas",
      description:
        "Fundamentos de Kionas: pensamiento crítico, diálogo filosófico, análisis conceptual y un uso de la inteligencia artificial que no sustituye el juicio humano. Método, límites y criterios de calidad.",
      jsonLd: [breadcrumb("Metodología", "/metodologia")],
    }),
});

const PILLARS: { title: L; body: L }[] = [
  {
    title: { es: "Pensamiento crítico", en: "Critical thinking" },
    body: {
      es: "No como desconfianza general, sino como el hábito de preguntar qué se está afirmando, sobre qué base y qué quedaría fuera si fuera cierto.",
      en: "Not as general distrust, but as the habit of asking what is being claimed, on what basis, and what would be left out if it were true.",
    },
  },
  {
    title: { es: "Diálogo filosófico", en: "Philosophical dialogue" },
    body: {
      es: "Pensar con otros —también con tradiciones lejanas— obliga a precisar. Kionas permite dialogar, contrastar y confrontar una tesis con corrientes filosóficas.",
      en: "Thinking with others —including distant traditions— forces precision. Kionas lets you converse with, contrast and confront a thesis against philosophical traditions.",
    },
  },
  {
    title: { es: "Análisis conceptual", en: "Conceptual analysis" },
    body: {
      es: "Muchos desacuerdos son, en el fondo, usos distintos de una misma palabra. Distinguir conceptos es el primer paso para discutir bien.",
      en: "Many disagreements are, at bottom, different uses of the same word. Distinguishing concepts is the first step to arguing well.",
    },
  },
  {
    title: { es: "El rol de la inteligencia artificial", en: "The role of artificial intelligence" },
    body: {
      es: "La IA actúa como instrumento de exploración: propone perspectivas, tensiones y preguntas. No es una autoridad y no decide por nadie.",
      en: "AI acts as an instrument of exploration: it proposes perspectives, tensions and questions. It is not an authority and decides for no one.",
    },
  },
];

const LIMITS: L[] = [
  { es: "Las respuestas generadas pueden contener errores o simplificaciones; deben leerse con criterio.", en: "Generated answers may contain errors or simplifications; they must be read with judgement." },
  { es: "Cada perspectiva es una construcción editorial basada en obra publicada, no la persona histórica.", en: "Each perspective is an editorial construction based on published work, not the historical person." },
  { es: "Kionas no es terapia, asesoría ni un asistente general. Ante señales de riesgo, deja la filosofía de lado y ofrece ayuda concreta.", en: "Kionas is not therapy, advice or a general assistant. Faced with signs of risk, it sets philosophy aside and offers concrete help." },
  { es: "No reemplaza al docente: funciona mejor dentro de una experiencia diseñada y acompañada.", en: "It does not replace the teacher: it works best inside a designed and supported experience." },
];

const QUALITY: { title: L; body: L }[] = [
  { title: { es: "Fidelidad a las fuentes", en: "Fidelity to sources" }, body: { es: "Perspectivas apoyadas en obra publicada y literatura de referencia.", en: "Perspectives grounded in published work and reference literature." } },
  { title: { es: "Pluralidad", en: "Plurality" }, body: { es: "Una pregunta se examina desde más de una tradición.", en: "A question is examined from more than one tradition." } },
  { title: { es: "Tensiones visibles", en: "Visible tensions" }, body: { es: "Se muestran los desacuerdos en lugar de disolverlos.", en: "Disagreements are shown rather than dissolved." } },
  { title: { es: "Juicio propio", en: "Own judgement" }, body: { es: "La conclusión queda siempre en manos de quien piensa.", en: "The conclusion always stays with the person thinking." } },
];

function MethodologyPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  return (
    <>
      <PageHero
        eyebrow={es ? "Metodología" : "Methodology"}
        title={es ? "La filosofía como método, la tecnología como instrumento." : "Philosophy as method, technology as instrument."}
        lead={
          es
            ? "Kionas parte de una convicción simple: pensar bien no consiste en recibir mejores respuestas, sino en formular mejores preguntas y sostener el examen de las propias ideas."
            : "Kionas starts from a simple conviction: thinking well is not about receiving better answers, but about asking better questions and sustaining the examination of one’s own ideas."
        }
      />

      <section aria-labelledby="pillars-title" className="py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading id="pillars-title" eyebrow={es ? "Fundamentos" : "Foundations"} title={es ? "Cuatro fundamentos." : "Four foundations."} />
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title.en} className="bg-card p-8 md:p-10">
                <IndexNumber n={i + 1} />
                <h3 className="inst-title mt-4 text-[1.9rem]">{p.title[lang]}</h3>
                <p className="mt-3 text-body text-muted-foreground">{p.body[lang]}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-label={es ? "Educación en la era de la IA" : "Education in the age of AI"} className="pb-20 md:pb-24">
        <div className="inst-container">
          <AiLearningNote />
        </div>
      </section>

      <section aria-labelledby="method-steps" className="border-t border-border bg-secondary/50 py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <SectionHeading id="method-steps" eyebrow={es ? "Método" : "Method"} title={STEPS.title[lang]} lead={STEPS.note[lang]} />
          </div>
          <ol className="border-t border-foreground/20">
            {STEPS.items.map((s, i) => (
              <li key={s.title.en} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-border py-6">
                <span className="font-serif text-[2rem] leading-none text-brass">{i + 1}</span>
                <div>
                  <h3 className="inst-h3">{s.title[lang]}</h3>
                  <p className="mt-1 text-small text-muted-foreground">{s.body[lang]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="border-t border-border py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading id="principles-title" eyebrow={es ? "Principios" : "Principles"} title={es ? "Lo que orienta cada interacción." : "What guides every interaction."} />
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title.en} className="border-t-2 border-navy pt-6">
                <IndexNumber n={i + 1} />
                <h3 className="mt-3 font-serif text-[1.6rem] leading-tight text-foreground">{p.title[lang]}</h3>
                <p className="mt-2 text-small text-muted-foreground">{p.body[lang]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="limits-title" className="border-t border-border bg-card py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>{es ? "Límites" : "Limits"}</Eyebrow>
            <h2 id="limits-title" className="inst-title mt-4 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">
              {es ? "Lo que la plataforma no hace." : "What the platform does not do."}
            </h2>
            <ul className="mt-8 border-t border-border">
              {LIMITS.map((l) => (
                <li key={l.en} className="flex gap-4 border-b border-border py-4 text-small text-ink">
                  <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-sage-line" />
                  {l[lang]}
                </li>
              ))}
            </ul>
            <Link to="/uso-de-ia" className="inst-link mt-6 inline-block text-small">
              {es ? "Política de uso de IA" : "AI use policy"}
            </Link>
          </div>
          <div>
            <Eyebrow>{es ? "Criterios de calidad" : "Quality criteria"}</Eyebrow>
            <h2 className="inst-title mt-4 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">{es ? "Cómo juzgamos una buena respuesta." : "How we judge a good answer."}</h2>
            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              {QUALITY.map((q) => (
                <div key={q.title.en} className="rounded-md border border-border bg-background p-5">
                  <dt className="inst-h3">{q.title[lang]}</dt>
                  <dd className="mt-2 text-small text-muted-foreground">{q.body[lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="inst-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-body text-muted-foreground">
            {es
              ? "Kionas aún no ha publicado estudios de impacto propios. Las experiencias piloto son el camino para generar evidencia en contextos reales."
              : "Kionas has not yet published its own impact studies. Pilot experiences are the way to generate evidence in real settings."}{" "}
            <Link to="/evidencia" className="inst-link">
              {es ? "Ver la evidencia externa que inspira el enfoque" : "See the external evidence behind the approach"}
            </Link>
          </p>
          <Button asChild variant="institutional" size="xl">
            <Link to="/pilotos">{CTA.pilot[lang]}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
