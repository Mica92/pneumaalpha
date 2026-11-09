import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CTA, type L } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import { Eyebrow, PageHero, Reveal } from "@/components/institutional/primitives";

export const Route = createFileRoute("/_site/instituciones")({
  component: InstitutionsPage,
  head: () =>
    institutionalHead({
      path: "/instituciones",
      title: "Instituciones — Kionas para universidades, colegios y formación profesional",
      description:
        "Cómo Kionas puede aportar a universidades y facultades, colegios de enseñanza media y organizaciones de formación profesional, y qué conviene acordar antes de comenzar.",
      jsonLd: [breadcrumb("Instituciones", "/instituciones")],
    }),
});

type Block = { id: string; title: L; lead: L; value: L[]; contexts: L[]; consider: L };

const BLOCKS: Block[] = [
  {
    id: "universidades",
    title: { es: "Universidades y educación superior", en: "Universities and higher education" },
    lead: {
      es: "Para facultades, carreras y centros de innovación docente que buscan fortalecer el razonamiento, la argumentación y el diálogo de forma transversal.",
      en: "For faculties, programmes and teaching innovation centres seeking to strengthen reasoning, argumentation and dialogue across the curriculum.",
    },
    value: [
      { es: "Un espacio donde los estudiantes contrastan perspectivas antes de concluir.", en: "A space where students contrast perspectives before concluding." },
      { es: "Apoyo a cursos de formación general, ética profesional y pensamiento crítico.", en: "Support for general education, professional ethics and critical thinking courses." },
      { es: "Un uso de la inteligencia artificial que exige juicio en lugar de reemplazarlo.", en: "A use of artificial intelligence that demands judgement rather than replacing it." },
    ],
    contexts: [
      { es: "Cursos de formación general o transversal", en: "General or cross-curricular courses" },
      { es: "Ética y responsabilidad profesional por carrera", en: "Ethics and professional responsibility by programme" },
      { es: "Talleres de escritura argumentativa", en: "Argumentative writing workshops" },
      { es: "Iniciativas de innovación educativa con IA", en: "Educational innovation initiatives with AI" },
    ],
    consider: {
      es: "Conviene definir con el equipo académico el curso, los objetivos de aprendizaje y cómo se observarán resultados.",
      en: "It is worth defining with the academic team the course, the learning objectives and how results will be observed.",
    },
  },
  {
    id: "colegios",
    title: { es: "Colegios de enseñanza media", en: "Secondary schools" },
    lead: {
      es: "Para equipos docentes que quieren abordar preguntas complejas —libertad, justicia, verdad— con experiencias adaptadas al contexto escolar.",
      en: "For teaching teams who want to approach complex questions —freedom, justice, truth— through experiences adapted to the school context.",
    },
    value: [
      { es: "Conceptos filosóficos explicados en lenguaje claro.", en: "Philosophical concepts explained in plain language." },
      { es: "Preparación de debates y ensayos desde varias perspectivas.", en: "Preparing debates and essays from several perspectives." },
      { es: "Bilingüe: útil también en programas en inglés.", en: "Bilingual: also useful in English-language programmes." },
    ],
    contexts: [
      { es: "Filosofía y formación ciudadana", en: "Philosophy and civic education" },
      { es: "Lenguaje y escritura argumentativa", en: "Language and argumentative writing" },
      { es: "Proyectos interdisciplinarios", en: "Interdisciplinary projects" },
    ],
    consider: {
      es: "El uso con estudiantes menores de edad requiere acordar con la institución el acompañamiento docente y las condiciones de privacidad.",
      en: "Use with students under age requires agreeing teacher supervision and privacy conditions with the institution.",
    },
  },
  {
    id: "formacion",
    title: { es: "Formación profesional y organizaciones", en: "Professional training and organisations" },
    lead: {
      es: "Para programas que desarrollan la capacidad de analizar problemas, decisiones y supuestos desde perspectivas interdisciplinarias.",
      en: "For programmes that develop the ability to analyse problems, decisions and assumptions from interdisciplinary perspectives.",
    },
    value: [
      { es: "Análisis de dilemas profesionales sin respuestas prefabricadas.", en: "Analysis of professional dilemmas without ready-made answers." },
      { es: "Separación entre hechos, interpretaciones y valores en juego.", en: "Separating facts, interpretations and values at stake." },
      { es: "Ejercicios breves que se integran a programas existentes.", en: "Short exercises that fit into existing programmes." },
    ],
    contexts: [
      { es: "Programas de liderazgo y toma de decisiones", en: "Leadership and decision-making programmes" },
      { es: "Ética aplicada en organizaciones", en: "Applied ethics in organisations" },
      { es: "Educación continua", en: "Continuing education" },
    ],
    consider: {
      es: "El alcance, los participantes y los objetivos se definen caso a caso.",
      en: "Scope, participants and objectives are defined case by case.",
    },
  },
];

function InstitutionsPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  return (
    <>
      <PageHero
        eyebrow={es ? "Instituciones" : "Institutions"}
        title={es ? "El mismo rigor, adaptado a cada contexto educativo." : "The same rigour, adapted to each educational context."}
        lead={
          es
            ? "Kionas prioriza la educación superior, y también puede aportar en colegios y en formación profesional. Esto es lo que ofrece a cada uno y lo que conviene acordar."
            : "Kionas prioritises higher education, and can also contribute to schools and professional training. This is what it offers each one and what is worth agreeing on."
        }
      />

      <nav aria-label={es ? "Tipos de institución" : "Institution types"} className="border-b border-border bg-card">
        <ul className="inst-container flex gap-6 overflow-x-auto py-4 text-small">
          {BLOCKS.map((b) => (
            <li key={b.id} className="shrink-0">
              <a href={`#${b.id}`} className="inst-link">
                {b.title[lang]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="inst-container divide-y divide-border">
        {BLOCKS.map((b, i) => (
          <section key={b.id} id={b.id} aria-labelledby={`${b.id}-title`} className="scroll-mt-24 py-16 md:py-20">
            <Reveal className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
              <div>
                <Eyebrow>{i === 0 ? (es ? "Prioridad · 01" : "Priority · 01") : String(i + 1).padStart(2, "0")}</Eyebrow>
                <h2 id={`${b.id}-title`} className={`inst-title mt-4 ${i === 0 ? "text-[clamp(2.2rem,1.5rem+2.6vw,3.4rem)]" : "text-[clamp(1.9rem,1.4rem+1.8vw,2.7rem)]"}`}>
                  {b.title[lang]}
                </h2>
                <p className="mt-5 text-lead text-muted-foreground">{b.lead[lang]}</p>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="inst-h3">{es ? "Qué aporta" : "What it offers"}</h3>
                  <ul className="mt-4 space-y-3">
                    {b.value.map((v) => (
                      <li key={v.en} className="flex gap-3 text-small text-ink">
                        <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                        {v[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="inst-h3">{es ? "Contextos posibles" : "Possible contexts"}</h3>
                  <ul className="mt-4 space-y-3">
                    {b.contexts.map((v) => (
                      <li key={v.en} className="border-b border-border pb-3 text-small text-ink">
                        {v[lang]}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="rounded-md border-l-2 border-sage-line bg-secondary/60 p-4 text-small text-ink sm:col-span-2">
                  <span className="font-semibold text-foreground">{es ? "A considerar: " : "To consider: "}</span>
                  {b.consider[lang]}
                </p>
              </div>
            </Reveal>
          </section>
        ))}
      </div>

      <section className="inst-dark py-16 md:py-20">
        <div className="inst-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="inst-title max-w-2xl text-[clamp(1.8rem,1.3rem+1.6vw,2.6rem)]">
            {es ? "Conversemos sobre tu institución." : "Let’s talk about your institution."}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="institutional" size="xl">
              <Link to="/contacto">{CTA.demo[lang]}</Link>
            </Button>
            <Button asChild variant="institutionalOutline" size="xl">
              <Link to="/pilotos">{es ? "Ver pilotos" : "See pilots"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
