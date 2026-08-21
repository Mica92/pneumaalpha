import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateReport, type PsychReport } from "@/lib/report.functions";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { useI18n } from "@/lib/i18n";
import { GreekGlyph } from "@/components/greek-glyph";

export const Route = createFileRoute("/_authenticated/reporte")({
  component: ReportPage,
  head: () => ({
    meta: [
      { title: "PneumaA — Reporte · espejo de tus conversaciones" },
      {
        name: "description",
        content:
          "Un retrato psicológico-filosófico construido a partir de tus propias palabras: arquetipo, fortalezas, sombras y recomendaciones de lectura.",
      },
      { property: "og:title", content: "PneumaA — Reporte" },
    ],
  }),
});

function ReportPage() {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const runFn = useServerFn(generateReport);

  const [report, setReport] = useState<PsychReport | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (running) return;
    setRunning(true);
    setError(null);
    try {
      const r = await runFn({ data: { language: lang } });
      setReport(r);
    } catch (e) {
      console.error("[report] failed", e);
      setError(t("report.error"));
    } finally {
      setRunning(false);
    }
  }

  const next = report?.recommendations.nextPhilosopher
    ? PHILOSOPHERS[report.recommendations.nextPhilosopher]
    : null;

  return (
    <>
    <SiteNav />
    <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 md:px-10 md:py-14">
      <header className="mt-16 mb-10 md:mt-24 md:mb-14">
        <p className="tracking-in font-display text-[10px] uppercase text-muted-foreground">
          {t("report.kicker")}
        </p>
        <h1 className="fade-up mt-5 max-w-2xl font-display text-3xl font-light leading-[1.1] text-foreground md:text-5xl">
          {t("report.page.title")}
        </h1>
        <p className="fade-up mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("report.page.sub")}
        </p>
      </header>

      {!report && !running && (
        <div className="fade-up flex flex-col items-start gap-4">
          <button
            type="button"
            onClick={run}
            className="rounded-md border border-mist/40 bg-mist/10 px-6 py-3 font-display text-[11px] uppercase tracking-[0.3em] text-foreground transition-all hover:border-mist/70 hover:bg-mist/15"
          >
            {t("report.generate")}
          </button>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            {t("report.hint")}
          </p>
        </div>
      )}

      {running && (
        <div className="fade-up flex items-center gap-3 text-sm text-muted-foreground">
          <GreekGlyph className="font-display text-2xl text-mist pneuma-breathe" />
          <span>{t("report.running")}</span>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {report && (
        <article className="fade-up mt-2 space-y-10">
          {/* Archetype + summary */}
          <section className="overflow-hidden rounded-xl border border-mist/30 bg-card/60 p-7 backdrop-blur-sm md:p-9">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-mist">
              {t("report.archetype")}
            </p>
            <h2 className="mt-3 font-display text-2xl font-light tracking-tight text-foreground md:text-3xl">
              {report.archetype}
            </h2>
            {report.summary && (
              <p className="mt-5 text-sm leading-relaxed text-foreground/85 md:text-[15px]">
                {report.summary}
              </p>
            )}
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
              {t("report.basedOn", { n: String(report.messagesAnalyzed) })}
            </p>
          </section>

          {/* Scores */}
          {report.messagesAnalyzed >= 3 && (
            <section>
              <h3 className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {t("report.signals")}
              </h3>
              <ul className="mt-5 space-y-3">
                {(
                  [
                    ["reflection", report.scores.reflection],
                    ["lucidity", report.scores.lucidity],
                    ["emotionalOpenness", report.scores.emotionalOpenness],
                    ["intellectualCuriosity", report.scores.intellectualCuriosity],
                    ["discursiveDepth", report.scores.discursiveDepth],
                  ] as const
                ).map(([key, val]) => (
                  <li key={key} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs uppercase tracking-[0.2em] text-foreground/80">
                          {t(`report.signal.${key}`)}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground/80">
                          {val}/100
                        </span>
                      </div>
                      <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-border/60">
                        <div
                          className="h-full bg-mist/80 transition-all"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Writing style */}
          {report.writingStyle && (
            <section>
              <h3 className="font-display text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                {t("report.writingStyle")}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/85 md:text-[15px]">
                {report.writingStyle}
              </p>
            </section>
          )}

          {/* Themes, shadows, strengths */}
          <div className="grid gap-8 md:grid-cols-3">
            <ChipsBlock title={t("report.themes")} items={report.recurringThemes} />
            <ChipsBlock title={t("report.strengths")} items={report.strengths} />
            <ChipsBlock title={t("report.shadows")} items={report.shadows} />
          </div>

          {/* Recommendations */}
          <section className="space-y-8">
            <h3 className="font-display text-[11px] uppercase tracking-[0.3em] text-mist">
              {t("report.recommend.kicker")}
            </h3>

            <ListBlock title={t("report.recommend.topics")} items={report.recommendations.topics} />
            <ListBlock
              title={t("report.recommend.authors")}
              items={report.recommendations.authors}
            />
            <ListBlock title={t("report.recommend.ideas")} items={report.recommendations.ideas} />
            <ListBlock
              title={t("report.recommend.practices")}
              items={report.recommendations.practices}
            />

            {report.recommendations.books.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/80">
                  {t("report.recommend.books")}
                </h4>
                <ul className="mt-4 space-y-4">
                  {report.recommendations.books.map((b, i) => (
                    <li key={i} className="rounded-lg border border-border/60 bg-card/30 p-4">
                      <p className="font-display text-base text-foreground">
                        {b.title}
                        <span className="ml-2 text-xs text-muted-foreground">— {b.author}</span>
                      </p>
                      {b.why && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">
                          {b.why}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {next && (
              <div className="overflow-hidden rounded-xl border border-mist/30 bg-card/60 p-6">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-mist">
                  {t("report.recommend.nextVoice")}
                </p>
                <div className="mt-4 flex items-start gap-4">
                  <span className="pneuma-breathe font-display text-4xl text-foreground/90">
                    {next.glyph}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-display text-xl font-light tracking-tight text-foreground">
                      {next.name}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {next.subtitle[lang]}
                    </p>
                  </div>
                </div>
                {report.recommendations.nextPhilosopherReason && (
                  <p className="mt-4 text-sm leading-relaxed text-foreground/85">
                    {report.recommendations.nextPhilosopherReason}
                  </p>
                )}
                <div className="mt-5 flex justify-end">
                  <Link
                    to="/$philosopher"
                    params={{ philosopher: next.id }}
                    className="rounded-md border border-mist/50 bg-mist/15 px-4 py-2 font-display text-[10px] uppercase tracking-[0.3em] text-foreground transition-all hover:border-mist/80 hover:bg-mist/25"
                  >
                    {t("report.recommend.enter")}
                  </Link>
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6">
            <button
              type="button"
              onClick={() => {
                setReport(null);
                setError(null);
              }}
              className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("report.again")}
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
              {new Date(report.generatedAt).toLocaleString(lang === "es" ? "es-ES" : "en-US")}
            </span>
          </div>
        </article>
      )}

    </main>
    <SiteFooter />
    </>
  );
}

function ChipsBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/80">{title}</h4>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((s, i) => (
          <li
            key={i}
            className="rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-foreground/80"
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="text-xs uppercase tracking-[0.25em] text-foreground/80">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((s, i) => (
          <li key={i} className="text-sm leading-relaxed text-foreground/85 md:text-[15px]">
            — {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
