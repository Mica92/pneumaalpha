import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CTA, type L } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import { IndexNumber, PageHero, Reveal } from "@/components/institutional/primitives";

export const Route = createFileRoute("/_site/soluciones")({
  component: SolutionsPage,
  head: () =>
    institutionalHead({
      path: "/soluciones",
      title: "Soluciones — Kionas para razonamiento, argumentación e interdisciplina",
      description:
        "Casos de uso de Kionas en educación: razonamiento, argumentación, discusión de problemas y exploración interdisciplinaria, con ejemplos ilustrativos por disciplina.",
      jsonLd: [breadcrumb("Soluciones", "/soluciones")],
    }),
});

type UseCase = { title: L; body: L; tools: L; examples: { area: L; text: L }[] };

const CASES: UseCase[] = [
  {
    title: { es: "Razonamiento", en: "Reasoning" },
    body: {
      es: "Ejercitar la distinción de conceptos, la identificación de supuestos y la reformulación de preguntas mal planteadas.",
      en: "Practise distinguishing concepts, identifying assumptions and reframing poorly posed questions.",
    },
    tools: { es: "Explorar · Ideas · Explorador ontológico", en: "Explore · Ideas · Ontological explorer" },
    examples: [
      { area: { es: "Ciencias", en: "Sciences" }, text: { es: "¿Qué diferencia una correlación de una causa? Examinar el supuesto detrás de una conclusión.", en: "What separates correlation from cause? Examine the assumption behind a conclusion." } },
      { area: { es: "Primer año universitario", en: "First-year university" }, text: { es: "Reformular una pregunta de investigación hasta que sea precisa y abordable.", en: "Reframe a research question until it is precise and workable." } },
    ],
  },
  {
    title: { es: "Argumentación", en: "Argumentation" },
    body: {
      es: "Construir, contrastar y confrontar argumentos: escuchar la mejor versión de la posición contraria antes de responder.",
      en: "Build, contrast and confront arguments: hear the strongest version of the opposing position before replying.",
    },
    tools: { es: "Diálogos (modo Confrontar) · Comparar perspectivas", en: "Dialogues (Confront mode) · Compare perspectives" },
    examples: [
      { area: { es: "Derecho", en: "Law" }, text: { es: "Someter una tesis sobre justicia a la objeción de dos tradiciones distintas.", en: "Submit a thesis about justice to objections from two different traditions." } },
      { area: { es: "Educación media", en: "Secondary school" }, text: { es: "Preparar un debate escuchando primero los argumentos del otro lado.", en: "Prepare a debate by first hearing the other side’s arguments." } },
    ],
  },
  {
    title: { es: "Discusión de problemas", en: "Problem discussion" },
    body: {
      es: "Abordar dilemas reales —éticos, profesionales, públicos— separando hechos, interpretaciones y valores en juego.",
      en: "Address real dilemmas —ethical, professional, public— separating facts, interpretations and the values at stake.",
    },
    tools: { es: "Espacio de reflexión · Comparar perspectivas", en: "Reflection space · Compare perspectives" },
    examples: [
      { area: { es: "Ingeniería", en: "Engineering" }, text: { es: "Un caso de seguridad: ¿qué riesgo es aceptable y quién decide?", en: "A safety case: what risk is acceptable and who decides?" } },
      { area: { es: "Salud", en: "Health" }, text: { es: "Autonomía del paciente frente a beneficio: dónde se tensionan los principios.", en: "Patient autonomy versus benefit: where principles pull apart." } },
    ],
  },
  {
    title: { es: "Exploración interdisciplinaria", en: "Interdisciplinary exploration" },
    body: {
      es: "Conectar una pregunta de la propia disciplina con ideas, autores y movimientos de otras áreas del pensamiento.",
      en: "Connect a question from one’s own discipline with ideas, authors and movements from other areas of thought.",
    },
    tools: { es: "Mapa de ideas · Editorial · Ideas", en: "Idea map · Editorial · Ideas" },
    examples: [
      { area: { es: "Ciencias sociales", en: "Social sciences" }, text: { es: "Rastrear cómo el concepto de trabajo cambia entre tradiciones.", en: "Trace how the concept of work changes across traditions." } },
      { area: { es: "Humanidades", en: "Humanities" }, text: { es: "Leer la libertad desde el estoicismo, el existencialismo y el pragmatismo.", en: "Read freedom through Stoicism, existentialism and pragmatism." } },
    ],
  },
];

function SolutionsPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  return (
    <>
      <PageHero
        eyebrow={es ? "Soluciones" : "Solutions"}
        title={es ? "Casos de uso para pensar mejor en cualquier disciplina." : "Use cases for thinking better in any discipline."}
        lead={
          es
            ? "Cuatro ámbitos donde Kionas puede apoyar experiencias educativas. Los ejemplos son ilustrativos: muestran usos posibles, no implementaciones en instituciones específicas."
            : "Four areas where Kionas can support educational experiences. The examples are illustrative: they show possible uses, not implementations at specific institutions."
        }
      >
        <Button asChild variant="institutional" size="xl">
          <Link to="/contacto">{CTA.demo[lang]}</Link>
        </Button>
      </PageHero>

      <div className="inst-container py-16 md:py-20">
        <ol className="space-y-6">
          {CASES.map((c, i) => (
            <Reveal as="li" key={c.title.en} className="grid gap-8 rounded-lg border border-border bg-card p-7 md:p-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
              <div>
                <IndexNumber n={i + 1} />
                <h2 className="inst-title mt-3 text-[clamp(1.9rem,1.4rem+1.6vw,2.6rem)]">{c.title[lang]}</h2>
                <p className="mt-4 text-body text-muted-foreground">{c.body[lang]}</p>
                <p className="mt-6 text-micro text-muted-foreground">
                  <span className="font-semibold tracking-[0.12em] text-bronze uppercase">{es ? "En Kionas" : "In Kionas"}</span>
                  <span className="ml-3 text-ink">{c.tools[lang]}</span>
                </p>
              </div>
              <div>
                <p className="text-micro font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {es ? "Ejemplos ilustrativos" : "Illustrative examples"}
                </p>
                <dl className="mt-4 border-t border-border">
                  {c.examples.map((ex) => (
                    <div key={ex.area.en} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                      <dt className="text-small font-semibold text-foreground">{ex.area[lang]}</dt>
                      <dd className="text-small text-ink">{ex.text[lang]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>

      <section className="border-t border-border bg-secondary/50 py-16">
        <div className="inst-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="inst-title max-w-2xl text-[clamp(1.7rem,1.3rem+1.4vw,2.4rem)]">
            {es ? "¿Tienes un caso de uso en mente? Diseñémoslo juntos." : "Have a use case in mind? Let’s design it together."}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="institutional" size="xl">
              <Link to="/pilotos">{CTA.pilot[lang]}</Link>
            </Button>
            <Button asChild variant="institutionalOutline" size="xl">
              <Link to="/instituciones">{es ? "Ver por institución" : "See by institution"}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
