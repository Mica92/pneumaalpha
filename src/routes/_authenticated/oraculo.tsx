import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { matchPhilosopher } from "@/lib/oracle.functions";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { useI18n } from "@/lib/i18n";
import { GreekGlyph } from "@/components/greek-glyph";
import { ToneSelect } from "@/components/tone-select";
import { isToneId, loadStoredTone, storeTone, type ToneId } from "@/lib/tones";

export const Route = createFileRoute("/_authenticated/oraculo")({
  validateSearch: (search: Record<string, unknown>): { q?: string; tone?: string } => ({
    ...(typeof search.q === "string" && search.q ? { q: search.q } : {}),
    ...(isToneId(search.tone) ? { tone: search.tone } : {}),
  }),
  component: OraclePage,
  head: () => ({
    meta: [
      { title: "Pneum — Oráculo · una inquietud, una voz" },
      {
        name: "description",
        content:
          "Escribe lo que sientas y Pneum te asignará la mente filosófica mejor preparada para responder a tu inquietud.",
      },
      { property: "og:title", content: "Pneum — Oráculo" },
      {
        property: "og:description",
        content:
          "Una pregunta, una frase, una duda. Pneum elige por ti la voz más adecuada para conversar.",
      },
    ],
  }),
});

type Result = { philosopher: PhilosopherId; reason: string };

function OraclePage() {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const matchFn = useServerFn(matchPhilosopher);

  const { q, tone: toneParam } = Route.useSearch();
  const [inquiry, setInquiry] = useState(q ?? "");
  const [tone, setTone] = useState<ToneId | null>(isToneId(toneParam) ? toneParam : null);

  useEffect(() => {
    if (isToneId(toneParam)) storeTone(toneParam);
    else setTone(loadStoredTone());
  }, [toneParam]);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = inquiry.trim();
    if (text.length < 3 || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const r = await matchFn({
        data: { inquiry: text, language: lang, tone: tone ?? undefined },
      });
      setResult(r);
    } catch (err) {
      console.error("[oracle] match failed", err);
      setError(t("oracle.error"));
    } finally {
      setSubmitting(false);
    }
  }

  const chosen = result ? PHILOSOPHERS[result.philosopher] : null;

  return (
    <>
      <SiteNav />
      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mt-16 mb-10 md:mt-24 md:mb-14">
          <p className="tracking-in font-display text-micro uppercase text-muted-foreground">
            {t("oracle.kicker")}
          </p>
          <h1 className="fade-up mt-5 max-w-2xl font-display text-title font-light text-foreground">
            {t("oracle.page.title")}
          </h1>
          <p className="fade-up mt-5 max-w-xl text-small leading-relaxed text-muted-foreground md:text-base">
            {t("oracle.page.sub")}
          </p>
        </header>

        <form onSubmit={onSubmit} className="fade-up flex flex-col gap-4">
          <textarea
            ref={inputRef}
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            placeholder={t("oracle.placeholder")}
            rows={5}
            maxLength={2000}
            disabled={submitting}
            className="w-full resize-none rounded-xl border border-border bg-input px-5 py-4 text-body text-foreground placeholder:text-muted-foreground focus:border-mist/50 focus:outline-none focus:ring-1 focus:ring-mist/15 disabled:opacity-50"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
          />
          <ToneSelect
            value={tone}
            onChange={(v) => {
              setTone(v);
              storeTone(v);
            }}
            className="self-start"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-micro uppercase tracking-[0.25em] text-muted-foreground/70">
              {inquiry.length}/2000
            </span>
            <button
              type="submit"
              disabled={submitting || inquiry.trim().length < 3}
              className="rounded-md border border-mist/40 bg-mist/10 px-5 py-2.5 font-display text-micro uppercase tracking-[0.3em] text-foreground transition-all hover:border-mist/70 hover:bg-mist/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? t("oracle.submitting") : t("oracle.submit")}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-small text-destructive">
            {error}
          </p>
        )}

        {chosen && result && (
          <section
            aria-live="polite"
            className="fade-up mt-12 overflow-hidden rounded-xl border border-mist/30 bg-card/60 p-7 backdrop-blur-sm md:p-9"
            style={{ animationDelay: "60ms" }}
          >
            <p className="font-display text-micro uppercase tracking-[0.3em] text-mist">
              {t("oracle.result.kicker")}
            </p>
            <div className="mt-5 flex items-start gap-5">
              <span className="pneuma-breathe font-display text-5xl text-foreground/90 md:text-6xl">
                {chosen.glyph}
              </span>
              <div className="flex-1">
                <h2 className="font-display text-heading font-light tracking-tight text-foreground">
                  {chosen.name}
                </h2>
                <p className="mt-1 text-micro leading-relaxed text-muted-foreground md:text-small">
                  {chosen.subtitle[lang]}
                </p>
              </div>
            </div>

            <p className="mt-6 text-body text-foreground/85">
              {result.reason}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-5">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                  setInquiry("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="text-micro uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("oracle.result.again")}
              </button>
              <Link
                to="/$philosopher"
                params={{ philosopher: chosen.id }}
                className="rounded-md border border-mist/50 bg-mist/15 px-5 py-2.5 font-display text-micro uppercase tracking-[0.3em] text-foreground transition-all hover:border-mist/80 hover:bg-mist/25"
              >
                {t("oracle.result.enter")}
              </Link>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
