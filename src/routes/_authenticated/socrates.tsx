import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { socraticReply } from "@/lib/socratic.functions";
import { SOCRATIC_OPENING, type SocraticTurn } from "@/lib/socratic.shared";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { GreekGlyph } from "@/components/greek-glyph";

export const Route = createFileRoute("/_authenticated/socrates")({
  component: SocratesPage,
  head: () => ({
    meta: [
      { title: "Pneum — Modo Sócrates · piensa tus propias ideas" },
      {
        name: "description",
        content:
          "Un guía socrático que solo pregunta: clarifica tus propias ideas, descubre supuestos ocultos y cierra con una síntesis de a dónde llegaste. Filosofía e IA conversacional.",
      },
      { property: "og:title", content: "Pneum — Modo Sócrates" },
      {
        property: "og:description",
        content: "Solo preguntas, hasta que tu propia idea queda clara.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/socrates` }],
  }),
});

function SocratesPage() {
  const { lang, t } = useI18n();
  const replyFn = useServerFn(socraticReply);
  const endRef = useRef<HTMLDivElement>(null);

  const [turns, setTurns] = useState<SocraticTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy, summary]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next: SocraticTurn[] = [...turns, { role: "user", text }];
    setTurns(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await replyFn({ data: { turns: next, language: lang, summarize: false } });
      setTurns([...next, { role: "assistant", text: res.text }]);
    } catch (err) {
      console.error("[socrates] reply failed", err);
      setError(t("socrates.error"));
    } finally {
      setBusy(false);
    }
  };

  const close = async () => {
    if (busy || turns.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await replyFn({ data: { turns, language: lang, summarize: true } });
      setSummary(res.text);
    } catch (err) {
      console.error("[socrates] summary failed", err);
      setError(t("socrates.error"));
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setTurns([]);
    setSummary(null);
    setInput("");
    setError(null);
  };

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex max-w-2xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mt-10 mb-8 md:mt-14 md:mb-10">
          <p className="label">{t("socrates.kicker")}</p>
          <h1 className="fade-up mt-5 font-serif text-title font-light text-foreground">
            {t("socrates.page.title")}
          </h1>
          <p className="fade-up mt-5 max-w-xl text-small leading-relaxed text-muted-foreground md:text-base">
            {t("socrates.page.sub")}
          </p>
        </header>

        <section className="flex-1 space-y-6" aria-live="polite">
          <p className="fade-up rounded-xl border border-mist/25 bg-card/50 p-5 text-body text-foreground/90">
            {SOCRATIC_OPENING[lang]}
          </p>

          {turns.map((turn, i) => (
            <div
              key={i}
              className={
                turn.role === "user"
                  ? "fade-up ml-auto max-w-[85%] rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-body text-foreground"
                  : "fade-up max-w-[90%] text-body text-foreground/90"
              }
            >
              {turn.role === "assistant" && (
                <p className="mb-1.5 font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
                  Σωκράτης
                </p>
              )}
              <p className="whitespace-pre-wrap">{turn.text}</p>
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-3">
              <GreekGlyph
                className="font-display text-lg text-mist pneuma-breathe"
                intervalMs={280}
              />
              <span className="text-micro uppercase tracking-[0.3em] text-muted-foreground">
                {t("socrates.thinking")}
              </span>
            </div>
          )}

          {summary && (
            <div className="fade-up rounded-xl border border-sage/35 bg-card/60 p-6 backdrop-blur-sm">
              <p className="font-display text-micro uppercase tracking-[0.35em] text-sage">
                {t("socrates.summary.kicker")}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-body text-foreground/90">
                {summary}
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-small text-destructive">
              {error}
            </p>
          )}
          <div ref={endRef} />
        </section>

        <form onSubmit={send} className="sticky bottom-4 mt-8">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-card/90 p-2 backdrop-blur-xl">
            <label className="sr-only" htmlFor="socrates-input">
              {t("socrates.placeholder")}
            </label>
            <textarea
              id="socrates-input"
              rows={2}
              value={input}
              maxLength={4000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(e as unknown as React.FormEvent);
                }
              }}
              placeholder={t("socrates.placeholder")}
              className="focus-mist flex-1 resize-none bg-transparent px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="focus-mist rounded-md border border-mist/40 bg-mist/10 px-4 py-2.5 font-display text-micro uppercase tracking-[0.3em] text-foreground transition-all hover:border-mist/70 disabled:opacity-30"
            >
              {t("socrates.send")}
            </button>
          </div>
          {turns.length > 0 && (
            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                disabled={busy}
                className="text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                {t("socrates.summary")}
              </button>
              <button
                type="button"
                onClick={restart}
                disabled={busy}
                className="text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                {t("socrates.restart")}
              </button>
            </div>
          )}
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
