import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ChatWindow } from "@/components/chat-window";
import { GreekGlyph } from "@/components/greek-glyph";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { matchPhilosopher } from "@/lib/oracle.functions";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { CATEGORIES, IDEAS, REAL_PROBLEMS, centralQuestion } from "@/lib/discovery";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/explorar")({
  component: ExplorePage,
  head: () => ({
    meta: [
      { title: "Explorar — habla y encuentra tu filósofo | Pneum" },
      {
        name: "description",
        content:
          "Escribe lo que tengas en mente y la IA te asigna la mente filosófica adecuada para conversar. Con una guía de temas y preguntas para empezar.",
      },
      { property: "og:title", content: "Explorar — habla y encuentra tu filósofo | Pneum" },
      {
        property: "og:description",
        content: "Un chat abierto: cuenta lo que te ocurre y conversa con la mente adecuada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const COPY = {
  kicker: { es: "Conversación abierta", en: "Open conversation" },
  title: { es: "Habla. Nosotros elegimos la mente.", en: "Speak. We choose the mind." },
  sub: {
    es: "Escribe lo que tengas en la cabeza —una duda, una frase, un problema real— y te asignamos al pensador mejor preparado para responderte. La conversación empieza aquí mismo.",
    en: "Write whatever is on your mind — a doubt, a phrase, a real problem — and we assign the thinker best prepared to answer. The conversation starts right here.",
  },
  placeholder: {
    es: "Lo que quieras: “No sé si quedarme en este trabajo”, “¿qué es una vida buena?”…",
    en: "Anything: “I don't know whether to stay in this job”, “what is a good life?”…",
  },
  submit: { es: "Encontrar mi filósofo", en: "Find my philosopher" },
  submitting: { es: "Buscando…", en: "Searching…" },
  error: {
    es: "No pudimos elegir una voz ahora mismo. Inténtalo otra vez.",
    en: "We couldn't choose a voice right now. Try again.",
  },
  guideTitle: { es: "Guía de temas y preguntas", en: "Guide of topics and questions" },
  guideSub: {
    es: "Si no sabes por dónde empezar, elige y lo escribimos por ti.",
    en: "If you don't know where to start, pick one and we write it for you.",
  },
  topics: { es: "Temas", en: "Topics" },
  problems: { es: "Situaciones reales", en: "Real situations" },
  questions: { es: "Grandes preguntas", en: "Great questions" },
  chosen: { es: "Tu voz para esta conversación", en: "Your voice for this conversation" },
  again: { es: "Elegir otra mente", en: "Choose another mind" },
} as const;

type Result = { philosopher: PhilosopherId; reason: string };

function ExplorePage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const matchFn = useServerFn(matchPhilosopher);

  const [inquiry, setInquiry] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [sentPrompt, setSentPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const questions = IDEAS.slice(0, 6).flatMap((i) => i.questions.slice(0, 1).map((q) => q[lang]));

  async function run(text: string) {
    const q = text.trim();
    if (q.length < 3 || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const r = await matchFn({ data: { inquiry: q, language: lang } });
      setResult(r);
      setSentPrompt(q);
    } catch (err) {
      console.error("[explore] match failed", err);
      setError(COPY.error[lang]);
    } finally {
      setSubmitting(false);
    }
  }

  function pick(text: string) {
    setInquiry(text);
    inputRef.current?.focus();
  }

  const chosen = result ? PHILOSOPHERS[result.philosopher] : null;

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <header>
          <p className="label">{COPY.kicker[lang]}</p>
          <h1 className="fade-up mt-4 max-w-3xl font-serif text-title font-light text-foreground">
            {COPY.title[lang]}
          </h1>
          <p className="fade-up mt-5 max-w-2xl text-small leading-relaxed text-muted-foreground md:text-base">
            {COPY.sub[lang]}
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(inquiry);
          }}
          className="fade-up mt-10 flex flex-col gap-4"
        >
          <textarea
            ref={inputRef}
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            placeholder={COPY.placeholder[lang]}
            rows={4}
            maxLength={2000}
            disabled={submitting}
            aria-label={COPY.placeholder[lang]}
            className="w-full resize-none rounded-xl border border-border bg-input px-5 py-4 text-body text-foreground placeholder:text-muted-foreground focus:border-bronze/50 focus:ring-1 focus:ring-bronze/20 focus:outline-none disabled:opacity-50"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
            }}
          />
          <div className="flex items-center justify-between gap-4">
            <span className="label">{inquiry.length}/2000</span>
            <button
              type="submit"
              disabled={submitting || inquiry.trim().length < 3}
              className="btn-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? COPY.submitting[lang] : COPY.submit[lang]}
            </button>
          </div>
        </form>

        {submitting && (
          <p className="mt-8 flex items-center gap-3 text-small text-muted-foreground">
            <GreekGlyph className="pneuma-breathe font-serif text-subtitle text-bronze" />
            {COPY.submitting[lang]}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-small text-destructive">
            {error}
          </p>
        )}

        {chosen && result && (
          <section aria-live="polite" className="fade-up mt-12">
            <div className="card-editorial p-6 md:p-8">
              <p className="label text-bronze">{COPY.chosen[lang]}</p>
              <div className="mt-4 flex items-start gap-5">
                <span className="pneuma-breathe font-serif text-5xl text-foreground/90">
                  {chosen.glyph}
                </span>
                <div>
                  <h2 className="font-serif text-heading font-light text-foreground">{chosen.name}</h2>
                  <p className="mt-1 text-micro text-muted-foreground md:text-small">
                    {chosen.subtitle[lang]}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-small leading-relaxed text-foreground/85">{result.reason}</p>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setInquiry("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="btn-ghost-gold mt-6"
              >
                {COPY.again[lang]}
              </button>
            </div>

            {user && (
              <div className="mt-8 overflow-hidden rounded-xl border border-border/60">
                <ChatWindow
                  key={chosen.id}
                  userId={user.id}
                  philosopher={chosen.id}
                  embedded
                  initialPrompt={sentPrompt}
                  onSignOut={() => void supabase.auth.signOut()}
                />
              </div>
            )}
          </section>
        )}

        {/* ── Guía de temas y preguntas ─────────────────────────── */}
        <section className="mt-20" aria-labelledby="guide-heading">
          <div className="rule-hairline mb-6" />
          <h2 id="guide-heading" className="font-serif text-heading font-light text-foreground">
            {COPY.guideTitle[lang]}
          </h2>
          <p className="mt-2 text-small text-muted-foreground">{COPY.guideSub[lang]}</p>

          <h3 className="label mt-8">{COPY.topics[lang]}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c.seed[lang])}
                className="card-editorial p-4 text-left transition-colors hover:border-bronze/50"
              >
                <span className="font-serif text-subtitle text-bronze">{c.glyph}</span>
                <p className="mt-2 font-serif text-subtitle text-foreground">{c.title[lang]}</p>
                <p className="mt-1 text-micro text-muted-foreground">{c.tags[lang]}</p>
              </button>
            ))}
          </div>

          <h3 className="label mt-10">{COPY.problems[lang]}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {REAL_PROBLEMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p.text[lang])}
                className="rounded-full border border-border/70 px-4 py-2 text-small text-muted-foreground transition-colors hover:border-bronze/60 hover:text-foreground"
              >
                {p.text[lang]}
              </button>
            ))}
          </div>

          <h3 className="label mt-10">{COPY.questions[lang]}</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {questions.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => pick(q)}
                  className="w-full border-b border-border/40 py-3 text-left font-serif text-lg text-foreground/90 transition-colors hover:text-bronze"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="label mt-10">
            {lang === "es" ? "Preguntas centrales de cada mente" : "Each mind's central question"}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(PHILOSOPHERS) as PhilosopherId[]).slice(0, 10).map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => pick(centralQuestion(id, lang))}
                  className="rounded-full border border-border/70 px-4 py-2 text-small text-muted-foreground transition-colors hover:border-bronze/60 hover:text-foreground"
                >
                  {centralQuestion(id, lang)}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
