import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import {
  EVIDENCE_COPY,
  KIND_LABEL,
  PILOT_FLOW,
  PILOT_INDICATORS,
  PISA_COMPARISON,
  SOURCES,
  type Metric,
  type Source,
  type SourceId,
  type Study,
} from "@/lib/evidence";
import { cn } from "@/lib/utils";
import { Eyebrow, Reveal } from "./primitives";

/** Enlace accesible a la fuente primaria; nombra la fuente para lectores de pantalla. */
export function SourceLink({ id, className, label }: { id: SourceId; className?: string; label?: ReactNode }) {
  const { lang } = useI18n();
  const s = SOURCES[id];
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inst-link inline-flex items-center gap-1 text-micro", className)}
    >
      {label ?? EVIDENCE_COPY.viewSource[lang]}
      <span className="sr-only">
        {" "}
        — {s.author} ({s.year}), {s.title} {lang === "es" ? "(abre en una pestaña nueva)" : "(opens in a new tab)"}
      </span>
      <ArrowUpRight aria-hidden="true" size={12} />
    </a>
  );
}

/** Indicador editorial: número, descripción precisa, microdato y fuente visibles. */
export function EvidenceMetric({ metric, className }: { metric: Metric; className?: string }) {
  const { lang } = useI18n();
  return (
    <div className={className}>
      <p className="font-serif text-[clamp(3rem,2.2rem+2.6vw,4.25rem)] leading-none tabular-nums lining-nums text-foreground">{metric.value}</p>
      <p className="mt-4 max-w-[19rem] text-small text-ink">{metric.label[lang]}</p>
      <p className="mt-4 text-micro tracking-[0.06em] text-muted-foreground">{metric.micro[lang]}</p>
      <SourceLink id={metric.source} className="mt-2" />
    </div>
  );
}

/** Módulo de investigación: número protagonista, hallazgo, indicador técnico explicado y fuente. */
export function EvidenceStudy({ study, detailed = false }: { study: Study; detailed?: boolean }) {
  const { lang } = useI18n();
  const s = SOURCES[study.source];
  return (
    <article className="flex h-full flex-col">
      <p className="inst-eyebrow">{KIND_LABEL[s.kind][lang]} · {s.year}</p>
      <p className="mt-6 flex items-baseline gap-3">
        <span className="font-serif text-[clamp(3.5rem,2.6rem+3vw,5rem)] leading-none tabular-nums lining-nums text-foreground">{study.headline}</span>
        <span className="font-serif text-[1.6rem] text-foreground/80">{study.headlineUnit[lang]}</span>
      </p>
      <p className="mt-3 text-small text-muted-foreground">{study.secondary[lang]}</p>
      <h3 className="inst-title mt-8 text-[clamp(1.6rem,1.3rem+1vw,2.1rem)]">{study.title[lang]}</h3>
      <p className="mt-4 text-body text-ink">{study.body[lang]}</p>
      <div className="mt-6 rounded-md border border-border bg-background px-5 py-4">
        <p className="font-sans text-small font-semibold tabular-nums text-foreground">{study.indicator}</p>
        <p className="mt-1 text-micro text-muted-foreground">{study.indicatorNote[lang]}</p>
      </div>
      {detailed ? (
        <>
          <p className="mt-6 text-small text-ink">
            <span className="font-semibold text-foreground">{lang === "es" ? "Población: " : "Population: "}</span>
            {study.population[lang]}
          </p>
          <MethodologyNote className="mt-4">{study.caveat[lang]}</MethodologyNote>
        </>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
        <p className="text-micro text-muted-foreground">{s.short[lang]}</p>
        <SourceLink id={study.source} label={EVIDENCE_COPY.examine[lang]} className="text-small" />
      </div>
    </article>
  );
}

/** Aclaración interpretativa siempre visible (nunca solo en un tooltip). */
export function MethodologyNote({ children, className }: { children: ReactNode; className?: string }) {
  const { lang } = useI18n();
  return (
    <aside className={cn("border-l-2 border-sage-line pl-4 text-micro leading-relaxed text-muted-foreground", className)}>
      <span className="font-semibold text-foreground">{lang === "es" ? "Cómo leer este dato. " : "How to read this. "}</span>
      {children}
    </aside>
  );
}

/** Barras horizontales Chile vs. OCDE: solo porcentajes de estudiantes, escala común 0–100. */
export function ComparisonBars() {
  const { lang } = useI18n();
  const es = lang === "es";
  return (
    <figure>
      <div className="flex flex-wrap gap-5 text-micro text-muted-foreground" aria-hidden="true">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-5 rounded-sm bg-navy" />Chile</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-5 rounded-sm bg-brass" />{es ? "Promedio OCDE" : "OECD average"}</span>
      </div>
      <dl className="mt-6 space-y-7">
        {PISA_COMPARISON.map((row) => (
          <div key={row.id}>
            <dt className="text-small text-ink">{row.label[lang]}</dt>
            <dd className="mt-3 space-y-2">
              {[
                { who: "Chile", v: row.chile, cls: "bg-navy" },
                { who: es ? "Promedio OCDE" : "OECD average", v: row.oecd, cls: "bg-brass" },
              ].map((b) => (
                <div key={b.who} className="grid grid-cols-[6.5rem_1fr_2.75rem] items-center gap-3">
                  <span className="text-micro text-muted-foreground">{b.who}</span>
                  <span className="h-2.5 overflow-hidden rounded-sm bg-border/70">
                    <span className={cn("block h-full rounded-sm", b.cls)} style={{ width: `${b.v}%` }} />
                  </span>
                  <span className="text-right text-small font-semibold tabular-nums text-foreground">{b.v}%</span>
                </div>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <figcaption className="mt-6 text-micro text-muted-foreground">
        {es
          ? "Porcentaje de estudiantes de 15 años. Escala de 0 a 100%."
          : "Percentage of 15-year-old students. Scale 0 to 100%."}{" "}
        <SourceLink id="pisa2025" label={es ? "OCDE, PISA 2025 · Nota de Chile" : "OECD, PISA 2025 · Chile note"} />
      </figcaption>
    </figure>
  );
}

/** Referencia bibliográfica completa con tipo de evidencia y enlace original. */
export function ResearchReference({ source }: { source: Source }) {
  const { lang } = useI18n();
  return (
    <li className="grid gap-2 border-b border-border py-5 md:grid-cols-[1fr_13rem] md:gap-8">
      <div>
        <p className="text-small text-ink">
          <span className="font-semibold text-foreground">{source.author}</span> ({source.year}). <em>{source.title}</em>.{" "}
          {source.venue[lang]}.
        </p>
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="inst-link mt-1 inline-block break-all text-micro">
          {source.url}
        </a>
      </div>
      <p className="text-micro tracking-[0.06em] text-muted-foreground uppercase md:text-right">{KIND_LABEL[source.kind][lang]}</p>
    </li>
  );
}

/** Bloque «Educación en la era de la IA» para Metodología. */
export function AiLearningNote({ className }: { className?: string }) {
  const { lang } = useI18n();
  return (
    <Reveal className={cn("grid gap-8 rounded-lg border border-border bg-card p-8 md:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14", className)}>
      <div>
        <Eyebrow>{EVIDENCE_COPY.aiEyebrow[lang]}</Eyebrow>
        <h3 className="inst-title mt-4 text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)]">{EVIDENCE_COPY.aiTitle[lang]}</h3>
      </div>
      <div>
        <p className="text-body text-ink">{EVIDENCE_COPY.aiBody[lang]}</p>
        <p className="mt-2 text-micro text-muted-foreground">
          {SOURCES.deo2026.short[lang]} · <SourceLink id="deo2026" />
        </p>
        <p className="mt-6 border-t border-border pt-6 text-body text-foreground">{EVIDENCE_COPY.aiKionas[lang]}</p>
      </div>
    </Reveal>
  );
}

/** Puente evidencia externa → validación propia en pilotos. */
export function PilotBridge({ withIndicators = false, ctaTo }: { withIndicators?: boolean; ctaTo?: "/pilotos" | "/contacto" }) {
  const { lang } = useI18n();
  return (
    <Reveal className="rounded-lg border border-border bg-card p-8 md:p-10">
      <div>
        <div className="max-w-2xl">
          <h3 className="inst-title text-[clamp(1.6rem,1.2rem+1.5vw,2.3rem)]">{EVIDENCE_COPY.bridgeTitle[lang]}</h3>
          <p className="mt-4 text-body text-muted-foreground">{EVIDENCE_COPY.bridgeBody[lang]}</p>
        </div>
        <ol className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center" aria-label={lang === "es" ? "Proceso de validación" : "Validation process"}>
          {PILOT_FLOW.map((step, i) => (
            <li key={step.en} className="flex items-center gap-3">
              <span className={cn("rounded-full border px-4 py-2 text-small", i === 1 ? "border-navy bg-navy text-ivory" : "border-border bg-background text-foreground")}>
                {step[lang]}
              </span>
              {i < PILOT_FLOW.length - 1 ? <ArrowRight aria-hidden="true" size={14} className="hidden shrink-0 text-bronze sm:block" /> : null}
            </li>
          ))}
        </ol>
      </div>
      {withIndicators ? (
        <div className="mt-10 border-t border-border pt-8">
          <p className="inline-flex rounded-full border border-sage-line px-3 py-1 text-micro text-ink">{EVIDENCE_COPY.indicatorsBadge[lang]}</p>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {PILOT_INDICATORS.map((m) => (
              <li key={m.en} className="flex gap-3 text-small text-ink">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                {m[lang]}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-micro text-muted-foreground">{EVIDENCE_COPY.indicatorsNote[lang]}</p>
        </div>
      ) : null}
      {ctaTo ? (
        <div className="mt-8">
          <Button asChild variant="institutional" size="xl">
            <Link to={ctaTo}>{EVIDENCE_COPY.bridgeCta[lang]}</Link>
          </Button>
        </div>
      ) : null}
    </Reveal>
  );
}
