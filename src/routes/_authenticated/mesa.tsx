import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { runRoundtableRound } from "@/lib/roundtable.functions";
import { MAX_SEATS, type RoundtableTurn } from "@/lib/roundtable.shared";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { portraitOf, portraitFocus } from "@/lib/portraits";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { GreekGlyph } from "@/components/greek-glyph";

export const Route = createFileRoute("/_authenticated/mesa")({
  component: RoundTablePage,
  head: () => ({
    meta: [
      { title: "PneumAlpha — Mesa redonda · tres filósofos debaten tu tema" },
      {
        name: "description",
        content:
          "Sienta hasta tres filósofos en la misma mesa y ponles un tema: debaten por turnos, se responden entre ellos y cierran con una síntesis. Filosofía e IA conversacional en español e inglés.",
      },
      { property: "og:title", content: "PneumAlpha — Mesa redonda" },
      {
        property: "og:description",
        content: "Tres mentes filosóficas reconstruidas debatiendo el tema que tú traigas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Round = { index: number; turns: RoundtableTurn[] };

function RoundTablePage() {
  const { lang, t } = useI18n();
  const runFn = useServerFn(runRoundtableRound);

  const [topic, setTopic] = useState("");
  const [seats, setSeats] = useState<PhilosopherId[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTurns = rounds.flatMap((r) => r.turns);
  const canStart = topic.trim().length >= 3 && seats.length >= 2 && !busy;

  const toggleSeat = (id: PhilosopherId) => {
    setSeats((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length >= MAX_SEATS
          ? prev
          : [...prev, id],
    );
  };

  const runRound = async () => {
    if (!canStart) return;
    setBusy(true);
    setError(null);
    try {
      const res = await runFn({
        data: { topic: topic.trim(), seats, language: lang, previous: allTurns, synthesize: false },
      });
      setRounds((prev) => [...prev, { index: prev.length + 1, turns: res.turns }]);
    } catch (e) {
      console.error("[mesa] round failed", e);
      setError(t("mesa.error"));
    } finally {
      setBusy(false);
    }
  };

  const runSynthesis = async () => {
    if (busy || allTurns.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await runFn({
        data: { topic: topic.trim(), seats, language: lang, previous: allTurns, synthesize: true },
      });
      setSynthesis(res.synthesis);
    } catch (e) {
      console.error("[mesa] synthesis failed", e);
      setError(t("mesa.error"));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setRounds([]);
    setSynthesis(null);
    setError(null);
  };

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex max-w-3xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mt-10 mb-10 md:mt-14 md:mb-12">
          <p className="label">{t("mesa.kicker")}</p>
          <h1 className="fade-up mt-5 font-serif text-4xl font-light leading-[1.08] text-foreground md:text-6xl">
            {t("mesa.page.title")}
          </h1>
          <p className="fade-up mt-5 max-w-xl text-small leading-relaxed text-muted-foreground md:text-base">
            {t("mesa.page.sub")}
          </p>
        </header>

        <section className="fade-up space-y-5">
          <div>
            <label
              htmlFor="mesa-topic"
              className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground"
            >
              {t("mesa.topic.label")}
            </label>
            <textarea
              id="mesa-topic"
              rows={3}
              value={topic}
              maxLength={1200}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t("mesa.topic.placeholder")}
              className="focus-mist mt-2 w-full resize-none rounded-xl border border-border bg-input px-5 py-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-glacier/50 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
                {t("mesa.seats", { n: String(seats.length) })}
              </p>
              <span className="text-micro uppercase tracking-[0.2em] text-muted-foreground/70">
                {seats.length >= MAX_SEATS ? t("mesa.seats.full") : t("mesa.seats.hint")}
              </span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PHILOSOPHER_LIST.map((p) => {
                const active = seats.includes(p.id);
                const disabled = !active && seats.length >= MAX_SEATS;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggleSeat(p.id)}
                      disabled={disabled || busy}
                      aria-pressed={active}
                      className={`focus-mist rounded-full border px-3 py-1.5 text-micro tracking-wide transition-colors disabled:opacity-30 ${
                        active
                          ? "border-glacier/70 bg-glacier/15 text-foreground"
                          : "border-border/70 text-muted-foreground hover:border-glacier/40 hover:text-foreground"
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

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runRound}
              disabled={!canStart}
              className="focus-mist rounded-md border border-glacier/45 bg-glacier/10 px-5 py-2.5 font-display text-micro uppercase tracking-[0.3em] text-foreground transition-all hover:border-glacier/80 hover:bg-glacier/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {rounds.length === 0 ? t("mesa.start") : t("mesa.round")}
            </button>
            {allTurns.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={runSynthesis}
                  disabled={busy}
                  className="focus-mist rounded-md border border-border/70 px-5 py-2.5 font-display text-micro uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:border-mist/50 hover:text-foreground disabled:opacity-40"
                >
                  {t("mesa.synthesis")}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={busy}
                  className="focus-mist rounded-md px-4 py-2.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  {t("mesa.reset")}
                </button>
              </>
            )}
          </div>
        </section>

        {error && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-small text-destructive">
            {error}
          </p>
        )}

        <section className="mt-12 space-y-10" aria-live="polite">
          {rounds.map((round) => (
            <div key={round.index} className="space-y-8">
              <p className="border-b border-border/60 pb-2 font-display text-micro uppercase tracking-[0.35em] text-muted-foreground">
                {t("mesa.roundLabel", { n: String(round.index) })}
              </p>
              {round.turns.map((turn, i) => (
                <SeatTurn key={`${round.index}-${turn.philosopher}-${i}`} turn={turn} />
              ))}
            </div>
          ))}

          {busy && (
            <div className="fade-up flex items-center gap-3">
              <GreekGlyph
                className="font-display text-lg text-glacier-bright pneuma-breathe"
                intervalMs={280}
              />
              <span className="text-micro uppercase tracking-[0.3em] glacier-shimmer">
                {t("mesa.thinking")}
              </span>
            </div>
          )}

          {synthesis && (
            <div className="fade-up rounded-xl border border-mist/30 bg-card/60 p-6 backdrop-blur-sm md:p-8">
              <p className="font-display text-micro uppercase tracking-[0.35em] text-mist">
                {t("mesa.synthesis.kicker")}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                {synthesis}
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SeatTurn({ turn }: { turn: RoundtableTurn }) {
  const meta = PHILOSOPHERS[turn.philosopher];
  const portrait = portraitOf(turn.philosopher);
  return (
    <article className="fade-up flex gap-4">
      {portrait ? (
        <img
          src={portrait}
          alt={`Retrato de ${meta.name}`}
          loading="lazy"
          decoding="async"
          width={44}
          height={44}
          className={`h-11 w-11 shrink-0 rounded-full border border-border/70 object-cover ${portraitFocus(turn.philosopher)} grayscale brightness-125`}
        />
      ) : (
        <span className="shrink-0 font-display text-subtitle text-mist" aria-hidden="true">
          {meta.glyph}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
          {meta.name}
        </h3>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
          {turn.text}
        </p>
      </div>
    </article>
  );
}
