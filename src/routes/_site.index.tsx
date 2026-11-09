import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import {
  CHALLENGE,
  CONTACT,
  CTA,
  DISCIPLINES,
  HERO,
  MEASURES,
  METHOD_HOME,
  PILOT_HOME,
  PILOT_STAGES,
  PLATFORM,
  PRINCIPLES,
  SEGMENTS,
  SOLUTIONS_HOME,
  STEPS,
  VISION,
} from "@/lib/institutional-content";
import { institutionalHead } from "@/lib/institutional-head";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Eyebrow, IndexNumber, Reveal, SectionHeading } from "@/components/institutional/primitives";
import { ProductFrame } from "@/components/institutional/product-frame";
import { ConceptDiagram } from "@/components/institutional/concept-diagram";
import { FeatureShowcase } from "@/components/institutional/feature-showcase";
import { LeadForm } from "@/components/institutional/lead-form";

export const Route = createFileRoute("/_site/")({
  component: InstitutionalHome,
  head: () =>
    institutionalHead({
      path: "/",
      title: "Kionas — Plataforma de pensamiento crítico para instituciones educativas",
      description:
        "Kionas integra filosofía aplicada e inteligencia artificial para explorar ideas, contrastar perspectivas y ejercitar el razonamiento en universidades, colegios y formación profesional.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/kionas-logo.png`,
          description:
            "Plataforma de filosofía aplicada e inteligencia artificial para explorar, desarrollar y ejercitar capacidades de pensamiento.",
          address: { "@type": "PostalAddress", addressLocality: "Santiago", addressCountry: "CL" },
        },
      ],
    }),
});

function InstitutionalHome() {
  const { lang } = useI18n();
  const navigate = useNavigate();

  // La app móvil instalada abre directamente la aplicación, no la web institucional.
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (cap?.isNativePlatform?.()) void navigate({ to: "/app", replace: true });
  }, [navigate]);

  return (
    <>
      {/* 01 — Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-border">
        <div className="inst-container grid gap-14 pt-14 pb-20 md:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:items-center lg:gap-16 lg:pt-24 lg:pb-28">
          <div>
            <Eyebrow>{HERO.eyebrow[lang]}</Eyebrow>
            <h1 id="hero-title" className="inst-title mt-6 text-[clamp(2.6rem,1.5rem+3.9vw,4.6rem)]">
              {HERO.title[lang]}
            </h1>
            <p className="mt-7 max-w-xl text-lead text-muted-foreground">{HERO.lead[lang]}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="institutional" size="xl">
                <Link to="/contacto">{CTA.demo[lang]}</Link>
              </Button>
              <Button asChild variant="institutionalOutline" size="xl">
                <Link to="/plataforma">
                  {CTA.platform[lang]} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <p className="mt-10 flex items-center gap-3 text-micro text-muted-foreground">
              <span aria-hidden="true" className="h-px w-8 bg-brass" />
              {HERO.tag[lang]}
            </p>
          </div>

          <div className="relative pb-24 sm:pb-16 lg:pb-10">
            <ProductFrame shot="app" alt={HERO.caption[lang]} priority />
            <ConceptDiagram className="absolute right-4 -bottom-2 w-[min(88%,22rem)] sm:-left-8 sm:right-auto lg:-left-14" />
          </div>
        </div>
      </section>

      {/* 02 — El desafío */}
      <section aria-labelledby="challenge-title" className="py-20 md:py-28">
        <div className="inst-container">
          <Reveal>
            <SectionHeading id="challenge-title" eyebrow={CHALLENGE.eyebrow[lang]} title={CHALLENGE.title[lang]} lead={CHALLENGE.lead[lang]} />
          </Reveal>
          <ol className="mt-14 grid border-t border-foreground/20 md:grid-cols-3">
            {CHALLENGE.items.map((item, i) => (
              <Reveal as="li" key={item.title.en} delay={i * 80} className="border-b border-border py-8 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0">
                <IndexNumber n={i + 1} />
                <h3 className="inst-h3 mt-4 text-[1.25rem]">{item.title[lang]}</h3>
                <p className="mt-3 text-small text-muted-foreground">{item.body[lang]}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 03 — La plataforma */}
      <section aria-labelledby="platform-title" className="border-y border-border bg-secondary/50 py-20 md:py-28">
        <div className="inst-container">
          <Reveal>
            <SectionHeading id="platform-title" eyebrow={PLATFORM.eyebrow[lang]} title={PLATFORM.title[lang]} lead={PLATFORM.lead[lang]} />
          </Reveal>
          <div className="mt-14">
            <FeatureShowcase keys={["explorar", "perspectivas", "ideas", "mapa", "editorial"]} />
          </div>
        </div>
      </section>

      {/* 04 — Cómo funciona */}
      <section aria-labelledby="steps-title" className="py-20 md:py-28">
        <div className="inst-container">
          <Reveal>
            <SectionHeading id="steps-title" eyebrow={STEPS.eyebrow[lang]} title={STEPS.title[lang]} lead={STEPS.note[lang]} />
          </Reveal>
          <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-8">
            <span aria-hidden="true" className="absolute top-[0.6rem] right-0 left-0 hidden h-px bg-gradient-to-r from-brass via-sage-line to-transparent md:block" />
            {STEPS.items.map((s, i) => (
              <Reveal as="li" key={s.title.en} delay={i * 90} className="relative">
                <span aria-hidden="true" className="relative z-10 block h-5 w-5 rounded-full border border-navy bg-background">
                  <span className="absolute inset-1.5 rounded-full bg-brass" />
                </span>
                <p className="mt-6 font-sans text-micro font-semibold tracking-[0.12em] text-bronze">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="inst-title mt-2 text-[1.75rem]">{s.title[lang]}</h3>
                <p className="mt-3 max-w-[18rem] text-small text-muted-foreground">{s.body[lang]}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 05 — Soluciones */}
      <section aria-labelledby="solutions-title" className="border-t border-border bg-card py-20 md:py-28">
        <div className="inst-container">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <Reveal>
              <SectionHeading id="solutions-title" eyebrow={SOLUTIONS_HOME.eyebrow[lang]} title={SOLUTIONS_HOME.title[lang]} />
            </Reveal>
            <Button asChild variant="institutionalOutline" size="xl" className="self-start md:self-auto">
              <Link to="/soluciones">
                {CTA.solutions[lang]} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-[1.25fr_1fr_1fr]">
            {SEGMENTS.map((s, i) => (
              <Reveal key={s.key} delay={i * 80} className={i === 0 ? "bg-navy p-8 text-ivory md:p-10" : "bg-background p-8 md:p-10"}>
                <Link to="/instituciones" hash={s.key} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
                  <p className={i === 0 ? "inst-eyebrow text-brass" : "inst-eyebrow"}>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className={i === 0 ? "mt-6 font-serif text-[2rem] leading-tight text-ivory" : "mt-6 font-serif text-[2rem] leading-tight text-foreground"}>
                    {s.title[lang]}
                  </h3>
                  <p className={i === 0 ? "mt-4 text-small text-ivory/80" : "mt-4 text-small text-muted-foreground"}>{s.body[lang]}</p>
                  <span className={i === 0 ? "mt-8 inline-flex items-center gap-2 text-small text-brass" : "mt-8 inline-flex items-center gap-2 text-small text-foreground"}>
                    {lang === "es" ? "Ver aplicaciones" : "See applications"}
                    <ArrowRight aria-hidden="true" size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-16">
            <h3 className="inst-h3">{SOLUTIONS_HOME.examplesLabel[lang]}</h3>
            <dl className="mt-6 grid border-t border-border sm:grid-cols-2 lg:grid-cols-4">
              {DISCIPLINES.map((d) => (
                <div key={d.area.en} className="border-b border-border py-6 sm:pr-8 lg:border-b-0 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0">
                  <dt className="font-serif text-[1.375rem] text-foreground">{d.area[lang]}</dt>
                  <dd className="mt-2 text-small text-muted-foreground">{d.example[lang]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-micro text-muted-foreground">{SOLUTIONS_HOME.examplesNote[lang]}</p>
          </div>
        </div>
      </section>

      {/* 06 — Metodología */}
      <section aria-labelledby="method-title" className="border-t border-border py-20 md:py-28">
        <div className="inst-container grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading id="method-title" eyebrow={METHOD_HOME.eyebrow[lang]} title={METHOD_HOME.title[lang]} lead={METHOD_HOME.lead[lang]} />
            <figure className="mt-12 border-l-2 border-brass pl-6">
              <blockquote className="font-serif text-[clamp(1.6rem,1.2rem+1.3vw,2.25rem)] leading-snug text-foreground italic">
                “{METHOD_HOME.quote[lang]}”
              </blockquote>
              <figcaption className="mt-4 text-micro tracking-[0.12em] text-muted-foreground uppercase">{METHOD_HOME.quoteSource[lang]}</figcaption>
            </figure>
          </Reveal>
          <div className="lg:pt-8">
            <ol className="border-t border-foreground/20">
              {PRINCIPLES.map((p, i) => (
                <Reveal as="li" key={p.title.en} delay={i * 80} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-border py-7">
                  <IndexNumber n={i + 1} className="pt-1.5" />
                  <div>
                    <h3 className="font-serif text-[1.625rem] leading-tight text-foreground">{p.title[lang]}</h3>
                    <p className="mt-2 text-small text-muted-foreground">{p.body[lang]}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Link to="/metodologia" className="inst-link mt-8 inline-flex items-center gap-2 text-small">
              {CTA.methodology[lang]} <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 07 — Pilotos */}
      <section aria-labelledby="pilot-title" className="border-t border-border bg-secondary/50 py-20 md:py-28">
        <div className="inst-container">
          <Reveal>
            <SectionHeading id="pilot-title" eyebrow={PILOT_HOME.eyebrow[lang]} title={PILOT_HOME.title[lang]} lead={PILOT_HOME.lead[lang]} />
          </Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
            <ol className="grid gap-6 sm:grid-cols-3">
              {PILOT_STAGES.map((s, i) => (
                <Reveal as="li" key={s.title.en} delay={i * 80} className="border-t-2 border-navy pt-6">
                  <p className="font-serif text-[2.75rem] leading-none text-brass">{i + 1}</p>
                  <h3 className="inst-h3 mt-5">{s.title[lang]}</h3>
                  <p className="mt-2 text-small text-muted-foreground">{s.body[lang]}</p>
                </Reveal>
              ))}
            </ol>
            <Reveal className="rounded-lg border border-border bg-card p-7">
              <h3 className="inst-h3">{PILOT_HOME.measuresTitle[lang]}</h3>
              <ul className="mt-4 space-y-3">
                {MEASURES.map((m) => (
                  <li key={m.en} className="flex gap-3 text-small text-ink">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-line" />
                    {m[lang]}
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-border pt-4 text-micro text-muted-foreground">{PILOT_HOME.measuresNote[lang]}</p>
            </Reveal>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button asChild variant="institutional" size="xl">
              <Link to="/pilotos">{CTA.pilot[lang]}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 08 — Visión */}
      <section aria-labelledby="vision-title" className="inst-dark relative overflow-hidden py-24 md:py-32">
        <svg aria-hidden="true" viewBox="0 0 800 400" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-25">
          <g fill="none" strokeWidth="0.6" className="stroke-brass">
            <path d="M0 320 C200 260 300 120 800 90" />
            <path d="M0 360 C240 300 380 170 800 150" />
            <path d="M0 390 C260 340 460 230 800 210" />
          </g>
        </svg>
        <div className="inst-container relative">
          <Reveal className="max-w-4xl">
            <p className="inst-eyebrow">{lang === "es" ? "Visión" : "Vision"}</p>
            <h2 id="vision-title" className="inst-title mt-6 text-[clamp(2.4rem,1.5rem+3.4vw,4.25rem)]">
              {VISION.title[lang]}
            </h2>
            <p className="mt-8 max-w-2xl text-lead text-muted-foreground">{VISION.lead[lang]}</p>
          </Reveal>
        </div>
      </section>

      {/* 09 — Contacto */}
      <section aria-labelledby="contact-title" className="py-20 md:py-28">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <Reveal>
            <Eyebrow>{lang === "es" ? "Contacto" : "Contact"}</Eyebrow>
            <h2 id="contact-title" className="inst-title mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)]">
              {CONTACT.title[lang]}
            </h2>
            <p className="mt-5 text-lead text-muted-foreground">{CONTACT.lead[lang]}</p>
            <p className="mt-10 text-small text-muted-foreground">
              {lang === "es" ? "¿Ya usas Kionas?" : "Already using Kionas?"}{" "}
              <Link to="/app" className="inst-link">
                {CTA.enter[lang]}
              </Link>
            </p>
          </Reveal>
          <LeadForm sourcePath="/" />
        </div>
      </section>
    </>
  );
}
