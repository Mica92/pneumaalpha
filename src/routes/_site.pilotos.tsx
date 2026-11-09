import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { MEASURES, PILOT_HOME, PILOT_STAGES, type L } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import { Eyebrow, PageHero, Reveal, SectionHeading } from "@/components/institutional/primitives";
import { LeadForm } from "@/components/institutional/lead-form";
import { PilotBridge } from "@/components/institutional/evidence";

export const Route = createFileRoute("/_site/pilotos")({
  component: PilotsPage,
  head: () =>
    institutionalHead({
      path: "/pilotos",
      title: "Pilotos institucionales — Evaluar Kionas en contextos educativos reales",
      description:
        "Propuesta de pilotos de Kionas para universidades y colegios: objetivos, proceso en tres etapas, mediciones propuestas y alcance a acordar con cada institución.",
      jsonLd: [breadcrumb("Pilotos", "/pilotos")],
    }),
});

const GOALS: L[] = [
  { es: "Explorar si Kionas aporta a un objetivo de aprendizaje concreto.", en: "Explore whether Kionas contributes to a concrete learning objective." },
  { es: "Recoger retroalimentación de estudiantes y docentes.", en: "Gather feedback from students and teachers." },
  { es: "Contar con información para decidir sobre su continuidad.", en: "Have information to decide on continuing." },
];

const SCOPE: { title: L; body: L }[] = [
  { title: { es: "Participantes", en: "Participants" }, body: { es: "Cursos, grupos y número de estudiantes.", en: "Courses, groups and number of students." } },
  { title: { es: "Duración", en: "Duration" }, body: { es: "Se define según el calendario académico y el caso de uso.", en: "Defined by the academic calendar and the use case." } },
  { title: { es: "Datos y privacidad", en: "Data and privacy" }, body: { es: "Qué información se recoge, quién accede y cómo se protege.", en: "What information is collected, who accesses it and how it is protected." } },
  { title: { es: "Acompañamiento", en: "Support" }, body: { es: "Instancias de trabajo con el equipo docente.", en: "Working sessions with the teaching team." } },
  { title: { es: "Condiciones", en: "Terms" }, body: { es: "Se conversan con cada institución; no hay tarifas publicadas.", en: "Discussed with each institution; there are no published fees." } },
];

function PilotsPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  return (
    <>
      <PageHero eyebrow={PILOT_HOME.eyebrow[lang]} title={PILOT_HOME.title[lang]} lead={PILOT_HOME.lead[lang]} />

      <section aria-labelledby="goals-title" className="py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <SectionHeading id="goals-title" eyebrow={es ? "Objetivos" : "Objectives"} title={es ? "Para qué sirve un piloto." : "What a pilot is for."} />
          <ul className="border-t border-foreground/20">
            {GOALS.map((g) => (
              <li key={g.en} className="flex gap-4 border-b border-border py-5 text-body text-ink">
                <span aria-hidden="true" className="mt-3 h-px w-5 shrink-0 bg-brass" />
                {g[lang]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="process-title" className="border-t border-border bg-secondary/50 py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading id="process-title" eyebrow={es ? "Proceso" : "Process"} title={es ? "Tres etapas." : "Three stages."} />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {PILOT_STAGES.map((s, i) => (
              <Reveal as="li" key={s.title.en} delay={i * 80} className="rounded-lg border border-border bg-card p-7">
                <p className="font-serif text-[3rem] leading-none text-brass">{i + 1}</p>
                <h3 className="inst-h3 mt-5">{s.title[lang]}</h3>
                <p className="mt-2 text-small text-muted-foreground">{s.body[lang]}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label={es ? "De la evidencia a la evaluación" : "From evidence to evaluation"} className="border-t border-border py-20 md:py-24">
        <div className="inst-container">
          <PilotBridge withIndicators ctaTo="/contacto" />
        </div>
      </section>

      <section aria-labelledby="measure-title" className="border-t border-border py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>{PILOT_HOME.measuresTitle[lang]}</Eyebrow>
            <h2 id="measure-title" className="inst-title mt-4 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">
              {es ? "Qué podríamos observar juntos." : "What we could observe together."}
            </h2>
            <p className="mt-4 text-body text-muted-foreground">{PILOT_HOME.measuresNote[lang]}</p>
            <ul className="mt-8 space-y-3">
              {MEASURES.map((m) => (
                <li key={m.en} className="flex gap-3 text-small text-ink">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-line" />
                  {m[lang]}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-micro text-muted-foreground">
              {es
                ? "Hoy Kionas no incluye rúbricas integradas ni reportes por cohorte; estas mediciones se diseñarían junto con la institución."
                : "Kionas does not currently include built-in rubrics or cohort reports; these measures would be designed together with the institution."}
            </p>
          </div>
          <div>
            <Eyebrow>{es ? "Alcance a acordar" : "Scope to agree"}</Eyebrow>
            <dl className="mt-6 border-t border-border">
              {SCOPE.map((s) => (
                <div key={s.title.en} className="grid gap-1 border-b border-border py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                  <dt className="text-small font-semibold text-foreground">{s.title[lang]}</dt>
                  <dd className="text-small text-ink">{s.body[lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="pilot-form-title" className="border-t border-border bg-card py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div>
            <Eyebrow>{es ? "Conversemos" : "Let’s talk"}</Eyebrow>
            <h2 id="pilot-form-title" className="inst-title mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.1rem)]">
              {es ? "Cuéntanos qué te gustaría explorar." : "Tell us what you would like to explore."}
            </h2>
            <p className="mt-5 text-lead text-muted-foreground">
              {es
                ? "Con unos pocos datos podemos preparar una primera conversación sobre un posible piloto."
                : "With a few details we can prepare a first conversation about a possible pilot."}
            </p>
          </div>
          <LeadForm defaultInterest="pilot" sourcePath="/pilotos" />
        </div>
      </section>
    </>
  );
}
