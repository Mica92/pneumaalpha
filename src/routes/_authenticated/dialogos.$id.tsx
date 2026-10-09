import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { traditionById, TRADITION_LIST } from "@/lib/traditions";
import { dialogar, contrastar, confrontar } from "@/lib/dialogos.functions";

export const Route = createFileRoute("/_authenticated/dialogos/$id")({
  loader: ({ params }: { params: { id: string } }) => {
    if (!traditionById(params.id)) throw notFound();
    return { id: params.id };
  },
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
type Tab = "dialogar" | "contrastar" | "confrontar";

function DialogoPage() {
  const { id } = Route.useLoaderData();
  const { lang } = useI18n();
  const es = lang === "es";
  const t = traditionById(id)!;

  const dialogarFn = useServerFn(dialogar);
  const contrastarFn = useServerFn(contrastar);
  const confrontarFn = useServerFn(confrontar);

  const [tab, setTab] = useState<Tab>("dialogar");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modo 1 — dialogar
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");

  // Modo 2 — contrastar
  const [question, setQuestion] = useState("");
  const [picks, setPicks] = useState<string[]>([id]);
  const [contrast, setContrast] = useState<string | null>(null);

  // Modo 3 — confrontar
  const [thesis, setThesis] = useState("");
  const [confront, setConfront] = useState<string | null>(null);

  const togglePick = (tid: string) => {
    setPicks((prev) =>
      prev.includes(tid)
        ? prev.filter((p) => p !== tid)
        : prev.length >= 3
          ? prev
          : [...prev, tid],
    );
  };

  const send = async () => {
    if (!input.trim() || busy) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await dialogarFn({ data: { tradition: id, messages: next, language: lang } });
      setMessages([...next, { role: "assistant", content: res.text }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const runContrast = async () => {
    if (question.trim().length < 3 || picks.length < 2 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await contrastarFn({
        data: { question: question.trim(), traditions: picks, language: lang },
      });
      setContrast(res.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const runConfront = async () => {
    if (thesis.trim().length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await confrontarFn({
        data: { thesis: thesis.trim(), tradition: id, language: lang },
      });
      setConfront(res.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const tabs: { key: Tab; es: string; en: string }[] = [
    { key: "dialogar", es: "Dialogar", en: "Converse" },
    { key: "contrastar", es: "Contrastar", en: "Compare" },
    { key: "confrontar", es: "Confrontar", en: "Confront" },
  ];

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-14">
        <Link
          to="/dialogos"
          className="focus-mist text-micro text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {es ? "Todos los diálogos" : "All dialogues"}
        </Link>

        <p className="label mt-8">{es ? "Diálogos filosóficos" : "Philosophical dialogues"}</p>
        <h1 className="mt-3 font-serif text-display font-light text-foreground">{t.name[lang]}</h1>
        <p className="mt-4 font-serif text-subtitle font-light italic text-bronze-bright">
          {t.tagline[lang]}
        </p>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              aria-pressed={tab === tb.key}
              className={`focus-mist rounded-full border px-4 py-1.5 text-micro uppercase tracking-[0.2em] transition-colors ${
                tab === tb.key
                  ? "border-bronze/60 text-bronze"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb[lang]}
            </button>
          ))}
        </div>

        {/* Modo 1 — Dialogar */}
        {tab === "dialogar" && (
          <section className="mt-8">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-small text-muted-foreground">
                  {es
                    ? "Empieza con una de estas preguntas, o escribe la tuya:"
                    : "Start with one of these questions, or write your own:"}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {t.questions.map((q) => (
                    <li key={q.es}>
                      <button
                        type="button"
                        onClick={() => setInput(q[lang])}
                        className="focus-mist rounded-full border border-border/70 px-3.5 py-2 text-left text-micro text-muted-foreground transition-colors hover:border-bronze/50 hover:text-foreground"
                      >
                        {q[lang]}
                      </button>
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
                      : "max-w-[95%] rounded-2xl px-1 py-1 text-small leading-relaxed text-foreground/90"
                  }
                >
                  {m.role === "user" && (
                    <p className="mb-1 font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
                      {es ? "Tú" : "You"}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
              {busy && (
                <p className="text-micro uppercase tracking-[0.3em] text-muted-foreground pneuma-breathe">
                  {es ? "Pensando…" : "Thinking…"}
                </p>
              )}
            </div>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder={
                  es
                    ? "Tu pregunta, desde esta forma de pensar…"
                    : "Your question, from this way of thinking…"
                }
                className="focus-mist w-full resize-y rounded-md border border-border bg-background/70 px-4 py-3 text-body leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="btn-gold focus-mist mt-3 px-6 py-2.5 text-small disabled:cursor-not-allowed disabled:opacity-40"
              >
                {es ? "Pensar" : "Think"}
              </button>
            </form>
          </section>
        )}

        {/* Modo 2 — Contrastar */}
        {tab === "contrastar" && (
          <section className="mt-8">
            <label className="block font-serif text-subtitle font-light text-foreground">
              {es ? "Tu pregunta" : "Your question"}
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              placeholder={es ? "¿Qué significa ser libre?" : "What does it mean to be free?"}
              className="focus-mist mt-3 w-full resize-y rounded-md border border-border bg-background/70 px-4 py-3 text-body leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
            />

            <p className="mt-6 text-micro uppercase tracking-[0.25em] text-muted-foreground">
              {es ? "Tradiciones a contrastar (2–3)" : "Traditions to compare (2–3)"}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TRADITION_LIST.map((tr) => {
                const on = picks.includes(tr.id);
                return (
                  <li key={tr.id}>
                    <button
                      type="button"
                      onClick={() => togglePick(tr.id)}
                      aria-pressed={on}
                      className={`focus-mist rounded-full border px-3.5 py-1.5 text-micro transition-colors ${
                        on
                          ? "border-bronze/60 bg-bronze/10 text-bronze"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tr.name[lang]}
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={runContrast}
              disabled={busy || question.trim().length < 3 || picks.length < 2}
              className="btn-gold focus-mist mt-5 px-6 py-2.5 text-small disabled:cursor-not-allowed disabled:opacity-40"
            >
              {es ? "Contrastar" : "Compare"}
            </button>

            {contrast && (
              <div className="mt-8 rounded-xl border border-border/60 bg-card/40 p-6">
                <p className="whitespace-pre-wrap text-small leading-relaxed text-foreground/90">
                  {contrast}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Modo 3 — Confrontar */}
        {tab === "confrontar" && (
          <section className="mt-8">
            <label className="block font-serif text-subtitle font-light text-foreground">
              {es ? "Tu tesis, creencia o argumento" : "Your thesis, belief or argument"}
            </label>
            <textarea
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={4}
              placeholder={
                es
                  ? "Ej.: «Ser libre es poder hacer lo que quiera.»"
                  : "E.g. «Being free is being able to do whatever I want.»"
              }
              className="focus-mist mt-3 w-full resize-y rounded-md border border-border bg-background/70 px-4 py-3 text-body leading-relaxed text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
            />
            <button
              type="button"
              onClick={runConfront}
              disabled={busy || thesis.trim().length < 3}
              className="btn-gold focus-mist mt-5 px-6 py-2.5 text-small disabled:cursor-not-allowed disabled:opacity-40"
            >
              {es ? "Poner a prueba" : "Test it"}
            </button>

            {confront && (
              <div className="mt-8 rounded-xl border border-border/60 bg-card/40 p-6">
                <p className="whitespace-pre-wrap text-small leading-relaxed text-foreground/90">
                  {confront}
                </p>
              </div>
            )}
          </section>
        )}

        {error && (
          <p className="mt-8 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-small text-destructive">
            {error}
          </p>
        )}

        {/* Ficha de la tradición */}
        <section className="mt-16 border-t border-border/60 pt-10">
          <h2 className="label">{es ? "Ficha de la tradición" : "Tradition card"}</h2>

          <h3 className="mt-5 font-serif text-heading font-light text-foreground">
            {es ? "Conceptos centrales" : "Central concepts"}
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
              <dt className="label">{es ? "Premisas" : "Premises"}</dt>
              <dd className="mt-2 space-y-1">
                {t.premises.map((p) => (
                  <p key={p} className="text-small text-muted-foreground">
                    — {p}
                  </p>
                ))}
              </dd>
            </div>
            <div>
              <dt className="label">{es ? "Método" : "Method"}</dt>
              <dd className="mt-2 text-small text-muted-foreground">{t.method}</dd>
            </div>
            <div>
              <dt className="label">{es ? "Referencias" : "References"}</dt>
              <dd className="mt-2 text-small text-muted-foreground">{t.authors.join(" · ")}</dd>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="label">{es ? "Tensiones internas" : "Internal tensions"}</dt>
                <dd className="mt-2 space-y-1">
                  {t.tensions.map((x) => (
                    <p key={x} className="text-small text-muted-foreground">
                      — {x}
                    </p>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="label">{es ? "Objeciones" : "Objections"}</dt>
                <dd className="mt-2 space-y-1">
                  {t.objections.map((x) => (
                    <p key={x} className="text-small text-muted-foreground">
                      — {x}
                    </p>
                  ))}
                </dd>
              </div>
            </div>
          </dl>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
