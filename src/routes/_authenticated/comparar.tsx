import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { runRoundtableRound } from "@/lib/roundtable.functions";
import { type RoundtableTurn } from "@/lib/roundtable.shared";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { portraitFocus, portraitOf } from "@/lib/portraits";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { GreekGlyph } from "@/components/greek-glyph";
import { useI18n } from "@/lib/i18n";

const MAX_COMPARE = 3;

export const Route = createFileRoute("/_authenticated/comparar")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
  component: ComparePage,
  head: () => ({
    meta: [
      { title: "Comparar perspectivas — Pneuma Alpha" },
      {
        name: "description",
        content:
          "Una misma pregunta, respondida en paralelo por dos o tres mentes filosóficas. Compara las perspectivas y continúa la conversación con la que te interpele.",
      },
      { property: "og:title", content: "Comparar perspectivas — Pneuma Alpha" },
      {
        property: "og:description",
        content: "Una pregunta, varias mentes respondiendo al mismo tiempo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ComparePage() {
  const { q } = Route.useSearch();
  const { lang } = useI18n();
  const es = lang === "es";
  const runFn = useServerFn(runRoundtableRound);

  const [question, setQuestion] = useState(q ?? "");
  const [seats, setSeats] = useState<PhilosopherId[]>([]);
  const [turns, setTurns] = useState<RoundtableTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRun = question.trim().length >= 3 && seats.length >= 2 && !busy;

  const toggle = (id: PhilosopherId) =>
    setSeats((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id],
    );

  const run = async () => {
    if (!canRun) return;
    setBusy(true);
    setError(null);
    setTurns([]);
    try {
      const res = await runFn({
        data: {
          topic: question.trim(),
          seats,
          language: lang,
          previous: [],
          synthesize: false,
        },
      });
      setTurns(res.turns);
    } catch (e) {
      console.error("[comparar] failed", e);
      setError(
        es
          ? "No pudimos reunir las perspectivas. Inténtalo otra vez."
          : "We couldn't gather the perspectives. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-5xl px-5 pt-14 md:px-8 md:pt-20">
          <p className="label">{es ? "Comparar perspectivas" : "Compare perspectives"}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-title font-light text-foreground">
            {es ? "Una pregunta, varias respuestas" : "One question, several answers"}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {es
              ? "Elige dos o tres mentes y hazles la misma pregunta. Verás sus respuestas lado a lado y podrás seguir con la que te interpele."
              : "Pick two or three minds and ask them the same question. See their answers side by side and continue with the one that speaks to you."}
          </p>
        </div>

        <section className="mx-auto max-w-5xl space-y-6 px-5 py-10 md:px-8 md:py-14">
          <div>
            <label htmlFor="compare-q" className="label">
              {es ? "Tu pregunta" : "Your question"}
            </label>
            <textarea
              id="compare-q"
              rows={3}
              maxLength={1000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                es
                  ? "¿Qué hago con el miedo a equivocarme?"
                  : "What do I do with the fear of error?"
              }
              className="focus-mist mt-2 w-full resize-none rounded-xl border border-border bg-input px-5 py-4 text-body text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="label">
                {es ? "Mentes elegidas" : "Chosen minds"} · {seats.length}/{MAX_COMPARE}
              </p>
              <span className="text-micro text-muted-foreground/70">
                {es ? "Elige entre 2 y 3" : "Pick 2 to 3"}
              </span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PHILOSOPHER_LIST.map((p) => {
                const active = seats.includes(p.id);
                const disabled = !active && seats.length >= MAX_COMPARE;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      disabled={disabled || busy}
                      aria-pressed={active}
                      className={`focus-mist rounded-full border px-3 py-1.5 text-micro transition-colors disabled:opacity-30 ${
                        active
                          ? "border-bronze bg-bronze/15 text-foreground"
                          : "border-border/70 text-muted-foreground hover:border-bronze/50 hover:text-foreground"
                      }`}
                    >
                      <span aria-hidden="true" className="mr-1.5">
                        {p.glyph}
                      </span>
                      {p.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <button type="button" onClick={run} disabled={!canRun} className="btn-gold">
            {es ? "Comparar" : "Compare"}
          </button>

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-small text-destructive">
              {error}
            </p>
          )}
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-20 md:px-8" aria-live="polite">
          {busy && (
            <div className="flex items-center gap-3">
              <GreekGlyph className="pneuma-breathe font-serif text-lg text-bronze-bright" />
              <span className="label">{es ? "Pensando" : "Thinking"}</span>
            </div>
          )}

          {turns.length > 0 && (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {turns.map((turn) => {
                const meta = PHILOSOPHERS[turn.philosopher];
                const portrait = portraitOf(turn.philosopher);
                return (
                  <li key={turn.philosopher} className="card-editorial flex flex-col p-6">
                    <div className="flex items-center gap-3">
                      {portrait ? (
                        <img
                          src={portrait}
                          alt={meta.name}
                          loading="lazy"
                          width={40}
                          height={40}
                          className={`h-10 w-10 rounded-full border border-border/70 object-cover ${portraitFocus(turn.philosopher)} grayscale`}
                        />
                      ) : (
                        <span aria-hidden="true" className="font-serif text-subtitle text-bronze">
                          {meta.glyph}
                        </span>
                      )}
                      <h2 className="font-serif text-subtitle font-light text-foreground">
                        {meta.name}
                      </h2>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-body text-foreground/90">
                      {turn.text}
                    </p>
                    <Link
                      to="/$philosopher"
                      params={{ philosopher: turn.philosopher }}
                      search={{ q: question.trim() }}
                      className="btn-ghost-gold mt-6 self-start"
                    >
                      {es ? `Seguir con ${meta.name}` : `Continue with ${meta.name}`}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
