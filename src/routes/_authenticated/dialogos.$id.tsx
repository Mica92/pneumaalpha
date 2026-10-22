import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { SITE_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { traditionById, TRADITION_LIST } from "@/lib/traditions";
import { TraditionBrowser } from "@/components/tradition-browser";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { contrastSelection, dialogueHistory } from "@/lib/dialogos.shared";
import { dialogar, contrastar, confrontar } from "@/lib/dialogos.functions";

type Mode = "dialogar" | "contrastar" | "confrontar";

const MODES: { key: Mode; es: string; en: string }[] = [
  { key: "dialogar", es: "Dialogar", en: "Converse" },
  { key: "contrastar", es: "Contrastar", en: "Compare" },
  { key: "confrontar", es: "Confrontar", en: "Confront" },
];


export const Route = createFileRoute("/_authenticated/dialogos/$id")({
  loader: ({ params }: { params: { id: string } }) => {
    if (!traditionById(params.id)) throw notFound();
    return { id: params.id };
  },
  validateSearch: (search: Record<string, unknown>): { mode?: Mode; with?: string } => ({
    mode:
      search.mode === "dialogar" || search.mode === "contrastar" || search.mode === "confrontar"
        ? search.mode
        : "dialogar",
    with: typeof search.with === "string" ? search.with.slice(0, 200) : undefined,
  }),
  head: ({ loaderData }: { loaderData?: { id: string } }) => {
    const t = loaderData ? traditionById(loaderData.id) : undefined;
    if (!t) {
      return { meta: [{ title: "Diálogo no disponible — Kionas" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${t.name.es} — Diálogos filosóficos | Kionas`;
    return {
      meta: [
        { title },
        { name: "description", content: t.tagline.es },
        { property: "og:title", content: title },
        { property: "og:description", content: t.tagline.es },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}/dialogos/${t.id}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/dialogos/${t.id}` }],
    };
  },
  component: DialogoPage,
});

type ChatMsg = { role: "user" | "assistant"; content: string };

function DialogoPage() {
  const { id } = Route.useLoaderData();
  const { mode = "dialogar", with: withParam } = Route.useSearch();
  const { lang, t: tr } = useI18n();
  const { loading, session } = useAuth();
  const requestLock = useRef(false);
  const es = lang === "es";
  const t = traditionById(id);
  const navigate = useNavigate();

  const dialogarFn = useServerFn(dialogar);
  const contrastarFn = useServerFn(contrastar);
  const confrontarFn = useServerFn(confrontar);

  type DialogueState = { messages: ChatMsg[]; input: string; question: string; picks: string[]; contrast: string | null; thesis: string; confront: string | null; busy: Mode | null; error: string | null; fichaOpen: boolean };
  const [states, setStates] = useState<Record<string, DialogueState>>({});
  const current = states[id] ?? { messages: [], input: "", question: "", picks: contrastSelection(id, withParam), contrast: null, thesis: "", confront: null, busy: null, error: null, fichaOpen: false };
  function setter<K extends keyof DialogueState>(key: K) {
    return (value: DialogueState[K] | ((previous: DialogueState[K]) => DialogueState[K])) => {
      setStates(previous => {
        const state = previous[id] ?? current;
        return { ...previous, [id]: { ...state, [key]: typeof value === "function" ? (value as (p: DialogueState[K]) => DialogueState[K])(state[key]) : value } };
      });
    };
  }
  const { messages, input, question, picks, contrast, thesis, confront, busy, error, fichaOpen } = current;
  const setMessages = setter("messages"), setInput = setter("input"), setQuestion = setter("question"), setPicks = setter("picks"), setContrast = setter("contrast"), setThesis = setter("thesis"), setConfront = setter("confront"), setBusy = setter("busy"), setError = setter("error"), setFichaOpen = setter("fichaOpen");
  if (!t) return null;

  const togglePick = (tid: string) =>
    setPicks((prev) =>
      prev.includes(tid) ? prev.filter((p) => p !== tid) : prev.length >= 3 ? prev : [...prev, tid],
    );

  const switchTradition = (newId: string) => {
    navigate({ to: "/dialogos/$id", params: { id: newId }, search: { mode } });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || requestLock.current || loading || !session) return;
    requestLock.current = true;
    const trimmed = dialogueHistory(messages);
    const next: ChatMsg[] = [...trimmed, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy("dialogar");
    setError(null);
    try {
      const res = await dialogarFn({ data: { tradition: id, messages: next, language: lang } });
      if (!res.text?.trim()) throw new Error("empty");
      setMessages((prev) => [...prev, { role: "assistant", content: res.text }]);
    } catch {
      setMessages(trimmed);
      setInput(text);
      setError(tr("dialogue.text15"));
    } finally {
      requestLock.current = false;
      setBusy(null);
    }
  };

  const runContrast = async () => {
    if (question.trim().length < 3 || picks.length < 2 || requestLock.current || loading || !session) return;
    requestLock.current = true;
    setBusy("contrastar");
    setError(null);
    try {
      const res = await contrastarFn({ data: { question: question.trim(), traditions: picks, language: lang } });
      if (!res.text?.trim()) throw new Error("empty");
      setContrast(res.text);
    } catch {
      setError(tr("dialogue.text16"));
    } finally {
      requestLock.current = false;
      setBusy(null);
    }
  };

  const runConfront = async () => {
    if (thesis.trim().length < 3 || requestLock.current || loading || !session) return;
    requestLock.current = true;
    setBusy("confrontar");
    setError(null);
    try {
      const res = await confrontarFn({ data: { thesis: thesis.trim(), tradition: id, language: lang } });
      if (!res.text?.trim()) throw new Error("empty");
      setConfront(res.text);
    } catch {
      setError(tr("dialogue.text17"));
    } finally {
      requestLock.current = false;
      setBusy(null);
    }
  };

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-14">
        <Link to="/dialogos" className="focus-mist text-micro text-muted-foreground transition-colors hover:text-foreground">
          ← {tr("dialogue.text18")}
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">{tr("dialogue.title")}</p>
            <h1 className="mt-3 font-serif text-display font-light text-foreground">{t.name[lang]}</h1>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-micro uppercase tracking-[0.25em] text-muted-foreground">
              {tr("dialogue.text19")}
            </span>
            <select
              value={id}
              disabled={Boolean(busy)}
              onChange={(e) => switchTradition(e.target.value)}
              className="focus-mist rounded-md border border-border bg-background/70 px-3 py-2 text-small text-foreground transition-colors hover:border-bronze/60"
            >
              {TRADITION_LIST.map((tr) => (
                <option key={tr.id} value={tr.id}>
                  {tr.name[lang]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-3 font-serif text-subtitle font-light italic text-bronze-bright">{t.tagline[lang]}</p>

        {/* Modos (controles reales) */}
        <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label={tr("dialogue.text11")}>
          {MODES.map((m) => (
            <Link
              key={m.key}
              to="/dialogos/$id"
              params={{ id }}
              search={{ mode: m.key, with: withParam }}
              
              aria-current={mode === m.key ? "page" : undefined}
              className={`focus-mist rounded-full border px-4 py-1.5 text-micro uppercase tracking-[0.2em] transition-colors ${
                mode === m.key ? "border-bronze/60 text-bronze" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m[lang]}
            </Link>
          ))}
        </div>

        {/* Dialogar */}
        {mode === "dialogar" && (
          <section className="mt-8">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-small text-muted-foreground">
                  {tr("dialogue.text20")}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {t.questions.map((q) => (
                    <li key={q.es}>
                      <Button variant="ghost"
                        type="button"
                        onClick={() => setInput(q[lang])}
                        className="focus-mist rounded-full border border-border/70 px-3.5 py-2 text-left text-micro text-muted-foreground transition-colors hover:border-bronze/50 hover:text-foreground"
                      >
                        {q[lang]}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 space-y-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl border border-border/50 bg-card/60 px-4 py-3 text-small text-foreground"
                      : "max-w-[95%] text-small leading-relaxed text-foreground/90"
                  }
                >
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <RichText text={m.content} />
                  )}
                </div>
              ))}
              {busy === "dialogar" && (
                <p className="text-micro uppercase tracking-[0.3em] text-muted-foreground pneuma-breathe">
                  {tr("dialogue.text21")}
                </p>
              )}
            </div>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                aria-label={tr("dialogue.yourQuestion")}
                disabled={Boolean(busy)}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                maxLength={2000}
                placeholder={tr("dialogue.text22")}
                className="focus-mist w-full resize-y rounded-md border border-border bg-background/70 px-4 py-3 text-body leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
              />
              <Button variant="ghost"
                type="submit"
                disabled={Boolean(busy) || loading || !session || !input.trim()}
                className="btn-gold focus-mist mt-3 px-6 py-2.5 text-small disabled:cursor-not-allowed disabled:opacity-40"
              >
                {tr("dialogue.text23")}
              </Button>
            </form>
          </section>
        )}

        {/* Contrastar */}
        {mode === "contrastar" && (
          <section className="mt-8">
            <label className="block font-serif text-subtitle font-light text-foreground">
              {tr("dialogue.yourQuestion")}
            </label>
            <textarea
              aria-label={tr("dialogue.yourQuestion")}
              disabled={Boolean(busy)}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              maxLength={800}
              placeholder={tr("dialogue.text24")}
              className="focus-mist mt-3 w-full resize-y rounded-md border border-border bg-background/70 px-4 py-3 text-body leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
            />

            <div className="mt-5">
              <TraditionBrowser
                mode="multi"
                selected={picks}
                onToggle={togglePick}
                onOpen={() => {}}
                maxSelect={3}
                disabled={Boolean(busy)}
              />
            </div>

            <Button variant="ghost"
              type="button"
              onClick={runContrast}
              disabled={Boolean(busy) || loading || !session || question.trim().length < 3 || picks.length < 2}
              className="btn-gold focus-mist mt-6 px-6 py-2.5 text-small disabled:cursor-not-allowed disabled:opacity-40"
            >
              {tr("dialogue.text26")}
            </Button>

            {busy === "contrastar" && (
              <p className="mt-4 text-micro uppercase tracking-[0.3em] text-muted-foreground pneuma-breathe">
                {tr("dialogue.text27")}
              </p>
            )}

            {contrast && (
              <div className="mt-8 min-w-0">
                <RichText text={contrast} />
              </div>
            )}
          </section>
        )}

        {/* Confrontar */}
        {mode === "confrontar" && (
          <section className="mt-8">
            <label className="block font-serif text-subtitle font-light text-foreground">
              {tr("dialogue.thesis")}
            </label>
            <textarea
              aria-label={tr("dialogue.thesis")}
              disabled={Boolean(busy)}
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={tr("dialogue.text28")}
              className="focus-mist mt-3 w-full resize-y rounded-md border border-border bg-background/70 px-4 py-3 text-body leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
            />
            <Button variant="ghost"
              type="button"
              onClick={runConfront}
              disabled={Boolean(busy) || loading || !session || thesis.trim().length < 3}
              className="btn-gold focus-mist mt-5 px-6 py-2.5 text-small disabled:cursor-not-allowed disabled:opacity-40"
            >
              {tr("dialogue.text29")}
            </Button>

            {busy === "confrontar" && (
              <p className="mt-4 text-micro uppercase tracking-[0.3em] text-muted-foreground pneuma-breathe">
                {tr("dialogue.text30")}
              </p>
            )}

            {confront && (
              <div className="mt-8 min-w-0">
                <RichText text={confront} />
              </div>
            )}
          </section>
        )}

        {error && (
          <p className="mt-8 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-small text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Ficha plegada por defecto */}
        <section className="mt-16 border-t border-border/60 pt-6">
          <Button variant="ghost"
            type="button"
            onClick={() => setFichaOpen((v) => !v)}
            aria-expanded={fichaOpen}
            aria-controls={`tradition-ficha-${id}`}
            className="focus-mist flex w-full items-center justify-between gap-4 text-left"
          >
            <span className="label">{tr("dialogue.text31")}</span>
            <span aria-hidden="true" className={`text-muted-foreground transition-transform duration-200 ${fichaOpen ? "rotate-180" : ""}`}>
              ▾
            </span>
          </Button>

          {fichaOpen && (
            <div id={`tradition-ficha-${id}`} className="mt-6">
              <h3 className="font-serif text-heading font-light text-foreground">
                {tr("dialogue.text32")}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {t.concepts.map((c) => (
                  <li key={c}>
                    <Link
                      to="/explorador"
                      search={{ q: c }}
                      className="focus-mist inline-block rounded-full border border-border/70 px-3 py-1 text-micro text-muted-foreground transition-colors hover:border-bronze/50 hover:text-foreground"
                    >
                      {c} ↗
                    </Link>
                  </li>
                ))}
              </ul>

              <dl className="mt-8 space-y-6">
                <div>
                  <dt className="label">{tr("dialogue.text33")}</dt>
                  <dd className="mt-2 space-y-1">
                    {t.premises.map((p) => (
                      <p key={p} className="text-small text-muted-foreground">— {p}</p>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="label">{tr("dialogue.text34")}</dt>
                  <dd className="mt-2 text-small text-muted-foreground">{t.method}</dd>
                </div>
                <div>
                  <dt className="label">{tr("dialogue.text35")}</dt>
                  <dd className="mt-2 text-small text-muted-foreground">{t.authors.join(" · ")}</dd>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="label">{tr("dialogue.text36")}</dt>
                    <dd className="mt-2 space-y-1">
                      {t.tensions.map((x) => (
                        <p key={x} className="text-small text-muted-foreground">— {x}</p>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="label">{tr("dialogue.text37")}</dt>
                    <dd className="mt-2 space-y-1">
                      {t.objections.map((x) => (
                        <p key={x} className="text-small text-muted-foreground">— {x}</p>
                      ))}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function RichText({ text }: { text: string }) {
  return (
    <div className="ontology-response min-w-0">
    <ReactMarkdown
      components={{
        h1: (props) => <h2 className="font-serif text-heading font-light text-foreground">{props.children}</h2>,
        h2: (props) => <h2 className="font-serif text-heading font-light text-foreground">{props.children}</h2>,
        h3: (props) => <h3 className="mt-4 font-serif text-subtitle font-light text-foreground">{props.children}</h3>,
        p: (props) => <p className="mt-3 text-small leading-relaxed text-foreground/90">{props.children}</p>,
        ul: (props) => <ul className="mt-3 list-disc space-y-1 pl-5 text-small text-foreground/90">{props.children}</ul>,
        ol: (props) => <ol className="mt-3 list-decimal space-y-1 pl-5 text-small text-foreground/90">{props.children}</ol>,
        strong: (props) => <strong className="font-semibold text-foreground">{props.children}</strong>,
        em: (props) => <em className="italic">{props.children}</em>,
      }}
    >
      {text}
    </ReactMarkdown>
    </div>
  );
}
