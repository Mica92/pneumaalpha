import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CTA, type L } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import {
  BIASES,
  CHALLENGE_METRICS,
  CLEMENTE,
  GLOSSARY,
  PISA_CAVEAT,
  SOURCES,
  STUDIES,
  EVIDENCE_COPY,
} from "@/lib/evidence";
import { Eyebrow, PageHero, Reveal, SectionHeading } from "@/components/institutional/primitives";
import {
  ComparisonBars,
  EvidenceMetric,
  EvidenceStudy,
  MethodologyNote,
  PilotBridge,
  ResearchReference,
  SourceLink,
} from "@/components/institutional/evidence";

export const Route = createFileRoute("/_site/evidencia")({
  component: EvidencePage,
  head: () =>
    institutionalHead({
      path: "/evidencia",
      title: "Evidencia — La investigación que inspira el enfoque de Kionas",
      description:
        "PISA 2025, metaanálisis de Philosophy for Children, experimentos universitarios sobre sesgos y programas de humanidades: qué dice la evidencia, sus límites y cómo Kionas propone validar sus propios resultados.",
      jsonLd: [breadcrumb("Evidencia", "/evidencia")],
    }),
});

const TOC: { id: string; label: L }[] = [
  { id: "contexto", label: { es: "El contexto educativo", en: "The educational context" } },
  { id: "filosofia", label: { es: "Filosofía y capacidades cognitivas", en: "Philosophy and cognitive abilities" } },
  { id: "universidad", label: { es: "Pensamiento crítico universitario", en: "University critical thinking" } },
  { id: "humanidades", label: { es: "Humanidades y desarrollo personal", en: "Humanities and personal development" } },
  { id: "limites", label: { es: "Qué sabemos y qué falta validar", en: "What we know and what remains to validate" } },
  { id: "validacion", label: { es: "Nuestra propuesta de validación", en: "Our validation proposal" } },
  { id: "bibliografia", label: { es: "Bibliografía", en: "References" } },
];

const VALIDATION: { title: L; body: L }[] = [
  {
    title: { es: "Pregunta y objetivo acordados", en: "Agreed question and objective" },
    body: { es: "Qué capacidad se quiere observar, en qué curso y con qué propósito pedagógico.", en: "Which ability is to be observed, in which course and for what pedagogical purpose." },
  },
  {
    title: { es: "Medición inicial y final", en: "Baseline and endline measurement" },
    body: { es: "Tareas comparables antes y después de la experiencia, evaluadas con los mismos criterios.", en: "Comparable tasks before and after the experience, assessed with the same criteria." },
  },
  {
    title: { es: "Rúbricas explícitas", en: "Explicit rubrics" },
    body: { es: "Criterios publicados de antemano —por ejemplo, calidad argumentativa o identificación de supuestos— aplicados de forma consistente.", en: "Criteria published in advance —for example, quality of argument or identification of assumptions— applied consistently." },
  },
  {
    title: { es: "Comparación cuando sea posible", en: "Comparison where possible" },
    body: { es: "Si el tamaño y las condiciones lo permiten, un grupo de comparación ayuda a distinguir el efecto de la experiencia de otros factores.", en: "When size and conditions allow, a comparison group helps distinguish the effect of the experience from other factors." },
  },
  {
    title: { es: "Percepciones, separadas de resultados", en: "Perceptions, kept apart from results" },
    body: { es: "Las encuestas a estudiantes y docentes se reportan como autoinforme, no como medición de aprendizaje.", en: "Student and teacher surveys are reported as self-report, not as measurement of learning." },
  },
];

function EvidencePage() {
  const { lang } = useI18n();
  const es = lang === "es";
  const [meta, debias] = STUDIES;

  return (
    <>
      {/* 01 — Introducción */}
      <PageHero
        eyebrow={es ? "Evidencia" : "Evidence"}
        title={es ? "La evidencia detrás del pensamiento." : "The evidence behind thinking."}
        lead={
          es
            ? "Kionas se inspira en la filosofía de la educación, en la investigación sobre capacidades cognitivas y en metodologías activas de aprendizaje. Aquí reunimos los estudios que orientan nuestro enfoque, con sus poblaciones, sus límites y sus fuentes originales."
            : "Kionas draws on the philosophy of education, research on cognitive abilities and active learning methods. Here we bring together the studies that guide our approach, with their populations, their limits and their original sources."
        }
      />

      <section className="border-b border-border bg-card">
        <div className="inst-container grid gap-8 py-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <MethodologyNote>
            {es
              ? "Ninguno de estos estudios evaluó Kionas. Sus resultados respaldan la pertinencia de investigar este enfoque, pero no garantizan que una plataforma digital produzca los mismos efectos."
              : "None of these studies evaluated Kionas. Their results support the case for researching this approach, but do not guarantee that a digital platform will produce the same effects."}
          </MethodologyNote>
          <nav aria-label={es ? "Contenido de la página" : "On this page"}>
            <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="inst-link inline-flex gap-3 text-small">
                    <span className="tabular-nums text-bronze">{String(i + 2).padStart(2, "0")}</span>
                    {t.label[lang]}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* 02 — Contexto educativo */}
      <section id="contexto" aria-labelledby="ctx-title" className="scroll-mt-24 py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading
            id="ctx-title"
            eyebrow={es ? "02 · El contexto educativo" : "02 · The educational context"}
            title={EVIDENCE_COPY.challengeTitle[lang]}
            lead={EVIDENCE_COPY.challengeLead[lang]}
          />
          <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <div className="grid gap-10">
              {CHALLENGE_METRICS.map((m) => (
                <EvidenceMetric key={m.id} metric={m} className="border-t border-border pt-6" />
              ))}
            </div>
            <Reveal className="rounded-lg border border-border bg-card p-7 md:p-9">
              <h3 className="inst-h3">{es ? "Chile frente al promedio OCDE · PISA 2025" : "Chile compared with the OECD average · PISA 2025"}</h3>
              <div className="mt-6">
                <ComparisonBars />
              </div>
            </Reveal>
          </div>
          <MethodologyNote className="mt-12 max-w-3xl">
            {PISA_CAVEAT[lang]}{" "}
            {es
              ? "El 59% y el 38% se obtienen restando del 100% la proporción que alcanzó el nivel 2 (41% y 62%)."
              : "The 59% and 38% figures are obtained by subtracting from 100% the share that reached Level 2 (41% and 62%)."}
          </MethodologyNote>
        </div>
      </section>

      {/* 03 — Filosofía y capacidades cognitivas */}
      <section id="filosofia" aria-labelledby="p4c-title" className="scroll-mt-24 border-t border-border bg-secondary/50 py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
          <div>
            <Eyebrow>{es ? "03 · Filosofía y capacidades cognitivas" : "03 · Philosophy and cognitive abilities"}</Eyebrow>
            <h2 id="p4c-title" className="inst-title mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)]">
              {es ? "Qué observó un metaanálisis de Philosophy for Children." : "What a meta-analysis of Philosophy for Children observed."}
            </h2>
            <p className="mt-5 text-body text-muted-foreground">
              {es
                ? "Philosophy for Children (P4C) es un enfoque en que niños y niñas discuten preguntas filosóficas en comunidad, guiados por un docente. El metaanálisis de Wei y Chen combinó estudios experimentales y cuasiexperimentales con un modelo de tres niveles, que considera que varios tamaños de efecto pueden provenir de un mismo estudio."
                : "Philosophy for Children (P4C) is an approach in which children discuss philosophical questions as a community, guided by a teacher. Wei and Chen’s meta-analysis combined experimental and quasi-experimental studies using a three-level model, which accounts for several effect sizes coming from the same study."}
            </p>
            <p className="mt-4 text-body text-muted-foreground">
              {es
                ? "El efecto se mantuvo entre niveles escolares, diseños de investigación y años de publicación. El tamaño de la muestra fue un moderador significativo."
                : "The effect was consistent across grade levels, research designs and publication years. Sample size was a significant moderator."}
            </p>
          </div>
          <Reveal className="rounded-lg border border-border bg-card p-8 md:p-10">
            <EvidenceStudy study={meta} detailed />
          </Reveal>
        </div>
      </section>

      {/* 04 — Pensamiento crítico universitario */}
      <section id="universidad" aria-labelledby="uni-title" className="scroll-mt-24 border-t border-border py-20 md:py-24">
        <div className="inst-container">
          <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
            <Reveal className="rounded-lg border border-border bg-card p-8 md:p-10">
              <EvidenceStudy study={debias} detailed />
            </Reveal>
            <div>
              <Eyebrow>{es ? "04 · Pensamiento crítico universitario" : "04 · University critical thinking"}</Eyebrow>
              <h2 id="uni-title" className="inst-title mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)]">
                {es ? "Cuatro sesgos examinados." : "Four biases examined."}
              </h2>
              <p className="mt-5 text-body text-muted-foreground">
                {es
                  ? "El experimento comparó cursos de pensamiento crítico impartidos desde un departamento de filosofía con otros cursos de filosofía. Los efectos persistieron al menos 16 meses después de terminado el curso."
                  : "The experiment compared critical thinking classes taught in a philosophy department with other philosophy classes. The effects persisted at least 16 months after the class ended."}
              </p>
              <dl className="mt-8 border-t border-border">
                {BIASES.map((b) => (
                  <div key={b.title.en} className="border-b border-border py-4">
                    <dt className="font-serif text-[1.35rem] text-foreground">{b.title[lang]}</dt>
                    <dd className="mt-1 text-small text-muted-foreground">{b.body[lang]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <Reveal className="mt-16 grid gap-6 rounded-lg border border-border bg-secondary/50 p-8 md:grid-cols-[1fr_1.6fr] md:gap-12 md:p-10">
            <div>
              <p className="inst-eyebrow">{es ? "Antecedente · OCDE, 2022" : "Background · OECD, 2022"}</p>
              <h3 className="inst-title mt-3 text-[1.75rem]">{es ? "Medir competencias genéricas en educación superior." : "Measuring generic skills in higher education."}</h3>
            </div>
            <div>
              <p className="text-body text-ink">
                {es
                  ? "El informe Does Higher Education Teach Students to Think Critically? reúne los resultados de la iniciativa internacional CLA+, aplicada entre 2015 y 2021 en instituciones de seis países —Estados Unidos, Reino Unido, Italia, México, Finlandia y Chile— para evaluar pensamiento crítico, razonamiento analítico y comunicación escrita."
                  : "The report Does Higher Education Teach Students to Think Critically? brings together results of the CLA+ International Initiative, run between 2015 and 2021 in institutions across six countries —the United States, the United Kingdom, Italy, Mexico, Finland and Chile— to assess critical thinking, analytical reasoning and written communication."}
              </p>
              <MethodologyNote className="mt-4">
                {es
                  ? "Lo citamos como antecedente del interés institucional por medir estas competencias. Algunas aplicaciones fueron de pequeña escala; la muestra no representa a todas las universidades ni permite estimar un porcentaje general de estudiantes."
                  : "We cite it as background to institutional interest in measuring these skills. Some assessments were small-scale; the sample does not represent all universities and does not support a general percentage of students."}
              </MethodologyNote>
              <SourceLink id="oecd2022" className="mt-4" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 05 — Humanidades */}
      <section id="humanidades" aria-labelledby="hum-title" className="scroll-mt-24 border-t border-border bg-card py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading
            id="hum-title"
            eyebrow={es ? "05 · Humanidades y desarrollo personal" : "05 · Humanities and personal development"}
            title={es ? "Clemente Course in the Humanities." : "The Clemente Course in the Humanities."}
            lead={
              es
                ? "Programa de humanidades para personas adultas iniciado en 1995 en Nueva York. Según la reseña de la National Endowment for the Humanities, que le otorgó la Medalla Nacional de Humanidades en 2014, más de 10.000 adultos habían participado en sus cursos hasta ese momento; la cifra no es necesariamente un total actualizado."
                : "A humanities programme for adults started in 1995 in New York. According to the profile by the National Endowment for the Humanities, which awarded it the National Humanities Medal in 2014, more than 10,000 adults had taken part in its courses at that time; the figure is not necessarily an updated total."
            }
          />
          <ul className="mt-14 grid gap-8 md:grid-cols-3 md:gap-0">
            {CLEMENTE.map((c) => (
              <li key={c.value + c.year} className="border-t border-border pt-6 md:border-t-0 md:border-l md:px-8 md:pt-0 md:first:border-l-0 md:first:pl-0">
                <p className="font-serif text-[clamp(3rem,2.2rem+2.6vw,4.25rem)] leading-none tabular-nums text-foreground">{c.value}</p>
                <p className="mt-4 text-small text-ink">
                  {es ? "de los encuestados " : "of respondents "}
                  {c.label[lang]}
                </p>
                <p className="mt-3 text-micro tracking-[0.06em] text-muted-foreground">
                  {es ? `Encuesta ${c.year} · autoinforme` : `${c.year} survey · self-report`}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <MethodologyNote className="max-w-3xl">
              {es
                ? "Son percepciones declaradas por participantes en encuestas de años distintos (2011 y 2017), comunicadas por la propia organización. No son mediciones experimentales de mejora cognitiva y no deben sumarse como una sola muestra."
                : "These are perceptions reported by participants in surveys from different years (2011 and 2017), published by the organisation itself. They are not experimental measurements of cognitive improvement and should not be combined as a single sample."}
            </MethodologyNote>
            <div className="flex shrink-0 flex-col gap-1">
              <SourceLink id="clemente" label={es ? "Clemente Course · About" : "Clemente Course · About"} />
              <SourceLink id="neh2014" label={es ? "NEH · Medalla 2014" : "NEH · 2014 Medal"} />
            </div>
          </div>
        </div>
      </section>

      {/* 06 — Qué sabemos y qué falta */}
      <section id="limites" aria-labelledby="limits-title" className="scroll-mt-24 border-t border-border py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <Eyebrow>{es ? "06 · Transparencia" : "06 · Transparency"}</Eyebrow>
            <h2 id="limits-title" className="inst-title mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)]">
              {es ? "Qué sabemos y qué falta validar." : "What we know and what remains to validate."}
            </h2>
            <p className="mt-5 text-body text-muted-foreground">
              {es
                ? "La evidencia educativa depende del programa, de la población, de la calidad de la implementación y de los resultados que se decide medir. Un mismo enfoque puede mostrar efectos en un estudio y no en otro."
                : "Educational evidence depends on the programme, the population, the quality of implementation and the outcomes chosen for measurement. The same approach may show effects in one study and not in another."}
            </p>
          </div>
          <div>
            <ol className="border-t border-foreground/20">
              <li className="grid gap-2 border-b border-border py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <p className="inst-eyebrow pt-1">{es ? "Ensayo inicial" : "Initial trial"}</p>
                <p className="text-body text-ink">
                  {es
                    ? "Un primer ensayo de Philosophy for Children financiado por la Education Endowment Foundation (Reino Unido) reportó alrededor de dos meses adicionales de progreso en lectura y matemáticas."
                    : "A first Philosophy for Children trial funded by the Education Endowment Foundation (United Kingdom) reported around two months’ additional progress in reading and maths."}
                </p>
              </li>
              <li className="grid gap-2 border-b border-border py-6 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <p className="inst-eyebrow pt-1">{es ? "Ensayo a gran escala" : "Large-scale trial"}</p>
                <p className="text-body text-ink">
                  {es
                    ? "Una evaluación posterior, con 198 escuelas y 3.601 estudiantes, no encontró evidencia de progreso adicional en los resultados de lectura y matemáticas examinados."
                    : "A later evaluation, with 198 schools and 3,601 pupils, found no evidence of additional progress in the reading and maths outcomes examined."}
                </p>
              </li>
            </ol>
            <p className="mt-4 text-micro text-muted-foreground">
              {SOURCES.eef2021.short} · <SourceLink id="eef2021" />
            </p>
            <MethodologyNote className="mt-8">
              {es
                ? "Por eso presentamos la evidencia externa como razón para investigar, no como prueba de eficacia. Los resultados de Kionas solo podrán afirmarse tras evaluarlo en contextos reales."
                : "That is why we present external evidence as a reason to investigate, not as proof of effectiveness. Kionas’s results can only be stated after evaluating it in real settings."}
            </MethodologyNote>
          </div>
        </div>

        <div className="inst-container mt-16">
          <h3 className="inst-h3">{es ? "Conceptos para leer la evidencia" : "Concepts for reading the evidence"}</h3>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
            {GLOSSARY.map((g) => (
              <div key={g.term.en} className="bg-card p-6">
                <dt className="font-serif text-[1.35rem] text-foreground">{g.term[lang]}</dt>
                <dd className="mt-2 text-small text-muted-foreground">{g.body[lang]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 07 — Validación */}
      <section id="validacion" aria-labelledby="val-title" className="scroll-mt-24 border-t border-border bg-secondary/50 py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading
            id="val-title"
            eyebrow={es ? "07 · Nuestra propuesta de validación" : "07 · Our validation proposal"}
            title={es ? "Cómo podría evaluarse Kionas en una institución." : "How Kionas could be evaluated in an institution."}
            lead={
              es
                ? "Kionas aún no ha publicado estudios propios. Estos son los elementos que proponemos acordar con cada institución; el diseño final depende del contexto, del tamaño de la cohorte y del estado actual de la plataforma."
                : "Kionas has not yet published its own studies. These are the elements we propose to agree with each institution; the final design depends on the context, the cohort size and the platform’s current state."
            }
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {VALIDATION.map((v, i) => (
              <li key={v.title.en} className="border-t-2 border-navy pt-5">
                <p className="font-serif text-[2.25rem] leading-none text-brass">{i + 1}</p>
                <h3 className="inst-h3 mt-4">{v.title[lang]}</h3>
                <p className="mt-2 text-small text-muted-foreground">{v.body[lang]}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14">
            <PilotBridge withIndicators ctaTo="/pilotos" />
          </div>
        </div>
      </section>

      {/* 08 — Bibliografía */}
      <section id="bibliografia" aria-labelledby="refs-title" className="scroll-mt-24 border-t border-border py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading id="refs-title" eyebrow={es ? "08 · Bibliografía" : "08 · References"} title={es ? "Fuentes originales." : "Original sources."} />
          <ul className="mt-10 border-t border-foreground/20">
            {Object.values(SOURCES).map((s) => (
              <ResearchReference key={s.id} source={s} />
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild variant="institutional" size="xl">
              <Link to="/contacto">{CTA.demo[lang]}</Link>
            </Button>
            <Button asChild variant="institutionalOutline" size="xl">
              <Link to="/metodologia">
                {CTA.methodology[lang]} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
