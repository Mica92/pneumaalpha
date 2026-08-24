import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeText, type AnalysisResult, type InfluenceItem } from "@/lib/analysis.functions";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { useI18n } from "@/lib/i18n";
import { GreekGlyph } from "@/components/greek-glyph";

export const Route = createFileRoute("/_authenticated/analisis")({
  component: AnalysisPage,
  head: () => ({
    meta: [
      { title: "PneumAlpha — Análisis de textos, frases y conceptos" },
      {
        name: "description",
        content:
          "Análisis filosófico detallado de textos, frases y conceptos: conceptos clave, influencias políticas, literarias, religiosas y científicas, tensiones y linaje.",
      },
      { property: "og:title", content: "PneumAlpha — Análisis filosófico" },
      {
        property: "og:description",
        content:
          "Pega una cita o escribe un concepto y recibe una lectura densa con sus influencias y su linaje intelectual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const INFLUENCE_KEYS = [
  "philosophical",
  "political",
  "literary",
  "religious",
  "scientific",
  "historical",
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-border/60 pt-6">
      <p className="font-display text-micro uppercase tracking-[0.3em] text-glacier-bright">
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfluenceGroup({ label, items }: { label: string; items: InfluenceItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/70 bg-background/30 p-4">
      <p className="font-display text-micro uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((i, k) => (
          <li key={`${i.name}-${k}`} className="text-small leading-relaxed text-foreground/85">
            <span className="text-foreground">{i.name}</span>
            {i.note && <span className="text-muted-foreground"> — {i.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisPage() {
  const { lang, t } = useI18n();
  const analyzeFn = useServerFn(analyzeText);

  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (text.length < 3 || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const r = await analyzeFn({ data: { text, language: lang } });
      setResult(r);
    } catch (err) {
      console.error("[analysis] failed", err);
      setError(t("analysis.error"));
    } finally {
      setSubmitting(false);
    }
  }

  const hasInfluences =
    result != null && INFLUENCE_KEYS.some((k) => result.influences[k].length > 0);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mt-16 mb-10 md:mt-20 md:mb-12">
          <p className="tracking-in font-display text-micro uppercase tracking-[0.35em] text-glacier-bright">
            {t("analysis.kicker")}
          </p>
          <h1 className="fade-up mt-5 max-w-2xl font-display text-3xl font-light leading-[1.1] text-foreground md:text-5xl">
            {t("analysis.page.title")}
          </h1>
          <p className="fade-up mt-5 max-w-xl text-small leading-relaxed text-muted-foreground md:text-base">
            {t("analysis.page.sub")}
          </p>
        </header>

        <form onSubmit={onSubmit} className="fade-up flex flex-col gap-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("analysis.placeholder")}
            rows={7}
            maxLength={6000}
            disabled={submitting}
            className="w-full resize-none rounded-xl border border-border bg-input px-5 py-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-glacier/60 focus:outline-none focus:ring-1 focus:ring-glacier/20 disabled:opacity-50"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-micro uppercase tracking-[0.25em] text-muted-foreground/70">
              {input.length}/6000
            </span>
            <button
              type="submit"
              disabled={submitting || input.trim().length < 3}
              className="rounded-md border border-glacier/50 bg-glacier/10 px-5 py-2.5 font-display text-micro uppercase tracking-[0.3em] text-foreground transition-all hover:border-glacier/80 hover:bg-glacier/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? t("analysis.submitting") : t("analysis.submit")}
            </button>
          </div>
        </form>

        {submitting && (
          <div className="mt-10 flex items-center gap-3 text-muted-foreground">
            <GreekGlyph />
            <span className="text-small">{t("analysis.submitting")}</span>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-small text-destructive">
            {error}
          </p>
        )}

        {result && (
          <article
            aria-live="polite"
            className="fade-up mt-12 rounded-xl border border-glacier/30 bg-card/60 p-6 backdrop-blur-sm md:p-9"
          >
            <p className="font-display text-micro uppercase tracking-[0.3em] text-glacier-bright">
              {result.kind}
            </p>
            {result.thesis && (
              <h2 className="mt-3 font-display text-subtitle font-light leading-snug text-foreground md:text-subtitle">
                {result.thesis}
              </h2>
            )}

            {result.reading.length > 0 && (
              <Section title={t("analysis.reading")}>
                <div className="space-y-4">
                  {result.reading.map((p, i) => (
                    <p
                      key={i}
                      className="text-small leading-relaxed text-foreground/85 md:text-[15px]"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </Section>
            )}

            {result.concepts.length > 0 && (
              <Section title={t("analysis.concepts")}>
                <ul className="space-y-3">
                  {result.concepts.map((c, i) => (
                    <li key={`${c.term}-${i}`} className="text-small leading-relaxed">
                      <span className="font-display text-foreground">{c.term}</span>
                      <span className="text-muted-foreground"> — {c.gloss}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {hasInfluences && (
              <Section title={t("analysis.influences")}>
                <div className="grid gap-3 md:grid-cols-2">
                  {INFLUENCE_KEYS.map((k) => (
                    <InfluenceGroup
                      key={k}
                      label={t(`analysis.inf.${k}`)}
                      items={result.influences[k]}
                    />
                  ))}
                </div>
              </Section>
            )}

            {(result.lineage.precursors.length > 0 || result.lineage.heirs.length > 0) && (
              <Section title={t("analysis.lineage")}>
                <div className="grid gap-3 md:grid-cols-2">
                  {(["precursors", "heirs"] as const).map((k) =>
                    result.lineage[k].length > 0 ? (
                      <div
                        key={k}
                        className="rounded-lg border border-border/70 bg-background/30 p-4"
                      >
                        <p className="font-display text-micro uppercase tracking-[0.25em] text-muted-foreground">
                          {t(k === "precursors" ? "analysis.precursors" : "analysis.heirs")}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {result.lineage[k].map((n, i) => (
                            <span
                              key={`${n}-${i}`}
                              className="rounded-full border border-border bg-card/60 px-3 py-1 text-micro text-foreground/85"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              </Section>
            )}

            {result.tensions.length > 0 && (
              <Section title={t("analysis.tensions")}>
                <ul className="space-y-2">
                  {result.tensions.map((x, i) => (
                    <li key={i} className="text-small leading-relaxed text-foreground/85">
                      · {x}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {result.questions.length > 0 && (
              <Section title={t("analysis.questions")}>
                <ul className="space-y-2">
                  {result.questions.map((q, i) => (
                    <li key={i} className="text-small leading-relaxed text-muted-foreground">
                      {q}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {result.voices.length > 0 && (
              <Section title={t("analysis.voices")}>
                <div className="flex flex-wrap gap-2">
                  {result.voices.map((id) => {
                    const p = PHILOSOPHERS[id];
                    return (
                      <Link
                        key={id}
                        to="/$philosopher"
                        params={{ philosopher: id }}
                        className="flex items-center gap-2 rounded-md border border-glacier/50 bg-glacier/10 px-4 py-2 text-small text-foreground transition-colors hover:bg-glacier/20"
                      >
                        <span className="font-display text-base">{p.glyph}</span>
                        {p.name}
                      </Link>
                    );
                  })}
                </div>
              </Section>
            )}

            <div className="mt-8 border-t border-border/60 pt-5">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setInput("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="text-micro uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("analysis.again")}
              </button>
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
