import { SITE_URL } from "@/lib/site";
import { classifyTheme } from "@/lib/topic-classifier";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { matchPhilosopher, type MatchResult } from "@/lib/oracle.functions";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { useI18n } from "@/lib/i18n";
import { ToneSelect } from "@/components/tone-select";
import { isToneId, loadStoredTone, storeTone, type ToneId } from "@/lib/tones";
import { track, trackOnce } from "@/lib/analytics";
import { PageAtmosphere } from "@/components/page-atmosphere";
import { readQuestion, useQuestionHandoff, validateQid } from "@/lib/question-handoff";
import { CRISIS_RESOURCES } from "@/lib/safety";

export const Route = createFileRoute("/_authenticated/oraculo")({
  validateSearch: (search: Record<string, unknown>): { qid?: string; tone?: string } => ({
    ...validateQid(search),
    ...(isToneId(search.tone) ? { tone: search.tone } : {}),
  }),
  component: OraclePage,
  head: () => ({
    meta: [
      { title: "Kionas — Escribe tu pregunta y gana claridad" },
      {
        name: "description",
        content:
          "Escribe lo que estás intentando comprender. Kionas lee tu pregunta, muestra lo que hay detrás y te ofrece perspectivas para pensarla mejor.",
      },
      { property: "og:title", content: "Kionas — Claridad para preguntas difíciles" },
      {
        property: "og:description",
        content:
          "Kionas interpreta tu pregunta, identifica las tensiones que contiene y te muestra perspectivas relevantes para pensarla mejor.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/oraculo` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/oraculo` }],
  }),
});

function OraclePage() {
  const { lang, t } = useI18n();
  const es = lang === "es";
  const matchFn = useServerFn(matchPhilosopher);

  const { qid, tone: toneParam } = Route.useSearch();
  const [inquiry, setInquiry] = useState("");
  const [asked, setAsked] = useState("");
  const [tone, setTone] = useState<ToneId | null>(isToneId(toneParam) ? toneParam : null);

  useEffect(() => {
    if (isToneId(toneParam)) storeTone(toneParam);
    else setTone(loadStoredTone());
  }, [toneParam]);

  const [result, setResult] = useState<MatchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const run = useCallback(
    async (raw: string, source: string) => {
      const text = raw.trim();
      if (text.length < 3) return;
      setSubmitting(true);
      setError(null);
      setResult(null);
      setAsked(text);
      track("oracle_run", { source, length: text.length, theme: classifyTheme(text) });
      try {
        const r = await matchFn({
          data: { inquiry: text, language: lang, tone: tone ?? undefined },
        });
        setResult(r);
        track("perspective_assigned", { philosopher: r.philosopher, source });
        track("oracle_reading_shown", {
          perspectives: r.perspectives.length,
          reframed: r.reframe ? 1 : 0,
        });
        if (r.aha) trackOnce("aha_first_perspective", { philosopher: r.philosopher });
      } catch (err) {
        console.error("[oracle] match failed", err);
        setError(t("oracle.error"));
      } finally {
        setSubmitting(false);
      }
    },
    [matchFn, lang, tone, t],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    track("question_submitted", { surface: "oracle", length: inquiry.trim().length });
    await run(inquiry, "form");
  }

  // Arriving with a question already written (from the homepage or search):
  // run it straight away so the flow stays question -> understanding.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    const handed = readQuestion(qid);
    if (!handed || handed.trim().length < 3) return;
    autoRan.current = true;
    setInquiry(handed);
    void run(handed, "prefilled");
  }, [qid, run]);

  const askedQid = useQuestionHandoff(asked);
  const primary = result ? PHILOSOPHERS[result.philosopher] : null;

  function reset() {
    setResult(null);
    setError(null);
    setInquiry("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col overflow-hidden px-6 py-10 md:px-10 md:py-14">
        <PageAtmosphere variant="study" />
        <header className="relative mt-16 mb-10 md:mt-24 md:mb-14">
          <p className="label">{es ? "Claridad antes de decidir" : "Clarity before deciding"}</p>
          <h1 className="fade-up mt-5 max-w-2xl font-serif text-title font-light text-foreground">
            {es ? "¿Qué estás intentando comprender?" : "What are you trying to understand?"}
          </h1>
          <p className="fade-up mt-5 max-w-xl text-small leading-relaxed text-muted-foreground md:text-base">
            {es
              ? "Puede ser una pregunta, una situación, una decisión o una idea. Kionas lee lo que traes, muestra lo que parece haber detrás y te ofrece perspectivas para pensarlo mejor."
              : "It can be a question, a situation, a decision or an idea. Kionas reads what you bring, shows what seems to lie beneath it and offers perspectives to think it through."}
          </p>
        </header>

        <form onSubmit={onSubmit} className="fade-up flex flex-col gap-4">
          <textarea
            ref={inputRef}
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            placeholder={
              es
                ? "Escribe lo que estás intentando comprender…"
                : "Write what you are trying to understand…"
            }
            rows={5}
            maxLength={2000}
            disabled={submitting}
            className="page-form focus-mist w-full resize-none px-5 py-4 text-body text-foreground placeholder:text-muted-foreground disabled:opacity-50"
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
              className="btn-gold focus-mist px-6 py-3 text-small disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting
                ? es
                  ? "Estamos leyendo tu pregunta…"
                  : "We are reading your question…"
                : es
                  ? "Pensarlo con Kionas"
                  : "Think it with Kionas"}
            </button>
          </div>
        </form>

        {submitting && (
          <p
            aria-live="polite"
            className="pneuma-breathe mt-10 text-small text-muted-foreground"
          >
            {es
              ? "Estamos leyendo tu pregunta y buscando lo que hay detrás…"
              : "We are reading your question and looking for what lies beneath…"}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-small text-destructive">
            {error}
          </p>
        )}

        {result?.safety === "crisis" && (
          <section aria-live="polite" className="fade-up mt-12">
            <div className="rounded-xl border border-bronze/50 bg-card/70 p-7 md:p-9">
              <p className="label text-bronze-bright">{es ? "Antes de seguir" : "Before we go on"}</p>
              <p className="mt-4 font-serif text-subtitle font-light leading-snug text-foreground">
                {result.reading}
              </p>
              <p className="mt-4 text-small leading-relaxed text-muted-foreground">
                {es
                  ? "Kionas no puede acompañarte en esto y no es el lugar adecuado ahora. Hay personas disponibles en este momento, gratis y sin juicio."
                  : "Kionas cannot accompany you in this and is not the right place right now. There are people available at this moment, free and without judgement."}
              </p>
              <ul className="mt-6 space-y-4">
                {CRISIS_RESOURCES.map((r) => (
                  <li key={r.country} className="border-t border-border/50 pt-4">
                    <p className="text-body text-foreground">{r.name[lang]}</p>
                    <p className="mt-1 font-serif text-subtitle font-light text-bronze-bright">
                      {r.contact}
                    </p>
                    <p className="mt-1 text-micro text-muted-foreground">{r.note[lang]}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-small text-muted-foreground">
                {es
                  ? "Si puedes, habla ahora con alguien de confianza."
                  : "If you can, talk to someone you trust right now."}
              </p>
            </div>
          </section>
        )}

        {result?.safety === "off_domain" && (
          <section aria-live="polite" className="fade-up mt-12">
            <div className="card-editorial p-7 md:p-9">
              <p className="label">{es ? "Fuera de lo que hacemos" : "Outside what we do"}</p>
              <p className="mt-4 font-serif text-subtitle font-light leading-snug text-foreground">
                {result.reading}
              </p>
              <p className="mt-4 text-small leading-relaxed text-muted-foreground">
                {es
                  ? "Kionas no resuelve tareas técnicas, cálculos ni información general. Sí puede ayudarte a pensar el problema o la decisión que hay detrás. Reescríbelo como pregunta y lo trabajamos."
                  : "Kionas does not solve technical tasks, calculations or general information. It can help you think through the problem or decision behind it. Rewrite it as a question and we will work on it."}
              </p>
              <button
                type="button"
                onClick={reset}
                className="btn-ghost-gold focus-mist mt-6 px-5 py-3 text-small"
              >
                {es ? "Reescribir mi pregunta" : "Rewrite my question"}
              </button>
            </div>
          </section>
        )}

        {result && !result.safety && primary && (
          <section aria-live="polite" className="fade-up mt-12 flex flex-col gap-8">
            {/* Lectura */}
            <div className="card-editorial p-7 md:p-9">
              <p className="label">{es ? "Lo que leemos" : "What we read"}</p>
              <p className="mt-4 font-serif text-subtitle font-light leading-snug text-foreground">
                {result.reading}
              </p>
            </div>

            {/* Reencuadre */}
            {result.reframe && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="card-editorial p-6">
                  <p className="label">{es ? "Lo que preguntas" : "What you ask"}</p>
                  <p className="mt-3 text-body text-muted-foreground">{result.reframe.asked}</p>
                </div>
                <div className="card-editorial border-bronze/40 p-6">
                  <p className="label text-bronze-bright">
                    {es ? "Lo que también parece estar en juego" : "What also seems at stake"}
                  </p>
                  <p className="mt-3 text-body text-foreground">{result.reframe.beneath}</p>
                </div>
              </div>
            )}

            {/* Perspectivas */}
            <div>
              <p className="label">
                {es
                  ? `${result.perspectives.length === 2 ? "Dos" : result.perspectives.length === 3 ? "Tres" : "Cuatro"} perspectivas que pueden ayudarte a pensar esto`
                  : "Perspectives that can help you think this"}
              </p>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {result.perspectives.map((p) => {
                  const mind = PHILOSOPHERS[p.philosopher];
                  if (!mind) return null;
                  return (
                    <li key={p.philosopher}>
                      <Link
                        to="/$philosopher"
                        params={{ philosopher: p.philosopher }}
                        search={askedQid ? { qid: askedQid } : {}}
                        onClick={() =>
                          track("first_interaction", {
                            philosopher: p.philosopher,
                            from: "oracle_perspective",
                          })
                        }
                        className="card-editorial focus-mist flex h-full gap-4 p-5"
                      >
                        <span aria-hidden="true" className="font-serif text-3xl text-bronze">
                          {mind.glyph}
                        </span>
                        <span className="flex-1">
                          <span className="block font-serif text-subtitle font-light text-foreground">
                            {mind.name}
                          </span>
                          <span className="mt-1 block text-small leading-relaxed text-muted-foreground">
                            {p.angle}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 rounded-md border border-border/60 bg-card/30 px-5 py-4">
                <p className="label">
                  {es ? "¿Por qué estas perspectivas?" : "Why these perspectives?"}
                </p>
                <p className="mt-2 text-small leading-relaxed text-muted-foreground">
                  {result.why}
                </p>
              </div>
            </div>

            {/* Aha */}
            {result.aha && (
              <div className="rounded-xl border border-bronze/45 bg-bronze/5 p-7 md:p-9">
                <p className="label text-bronze-bright">
                  {es ? "Una forma distinta de verlo" : "A different way of seeing it"}
                </p>
                <p className="mt-4 font-serif text-title font-light leading-snug text-foreground">
                  {result.aha}
                </p>
                <p className="mt-4 text-micro text-muted-foreground">
                  {es
                    ? "No es la respuesta correcta: es una comprensión posible."
                    : "Not the right answer: a possible understanding."}
                </p>
              </div>
            )}

            {/* Siguiente acción */}
            <div className="border-t border-border/60 pt-7">
              <p className="label">
                {es ? "¿Qué quieres hacer con esta idea?" : "What do you want to do with this?"}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/$philosopher"
                  params={{ philosopher: primary.id }}
                  search={askedQid ? { qid: askedQid } : {}}
                  onClick={() =>
                    track("first_interaction", { philosopher: primary.id, from: "oracle" })
                  }
                  className="btn-gold focus-mist px-5 py-3 text-small"
                >
                  {es ? "Profundizar" : "Go deeper"}
                </Link>
                <Link
                  to="/comparar"
                  search={{
                    ...(askedQid ? { qid: askedQid } : {}),
                    ...(result.perspectives.length
                      ? { seats: result.perspectives.map((p) => p.philosopher).join(",") }
                      : {}),
                  }}
                  onClick={() => track("next_action", { action: "compare" })}
                  className="btn-ghost-gold focus-mist px-5 py-3 text-small"
                >
                  {es ? "Comparar perspectivas" : "Compare perspectives"}
                </Link>
                <Link
                  to="/analisis"
                  onClick={() => track("next_action", { action: "analyse" })}
                  className="btn-ghost-gold focus-mist px-5 py-3 text-small"
                >
                  {es ? "Analizar mi situación" : "Analyse my situation"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    track("next_action", { action: "ask_again" });
                    reset();
                  }}
                  className="btn-ghost-gold focus-mist px-5 py-3 text-small"
                >
                  {es ? "Seguir preguntando" : "Keep asking"}
                </button>
              </div>
            </div>
          </section>
        )}

        {!result && !submitting && (
          <p className="mt-10 text-micro text-muted-foreground/80">
            {es
              ? "La filosofía aplicada es el motor. La claridad es el resultado."
              : "Applied philosophy is the engine. Clarity is the result."}
          </p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
