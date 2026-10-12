import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SITE_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { explorarPalabra, type ExploracionResult } from "@/lib/ontologia.functions";
import { ONTOLOGIA } from "@/lib/ontologia";
import { Button } from "@/components/ui/button";
import { OntologicalResponse } from "@/components/ontological-response";

export const Route = createFileRoute("/_authenticated/explorador")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: ExploradorPage,
  head: () => ({
    meta: [
      { title: "Explorador ontológico — Kionas" },
      {
        name: "description",
        content:
          "Descubre qué significa una palabra y qué distinciones aparecen al examinar sus expresiones en griego y en latín. Una investigación del significado, no un diccionario histórico.",
      },
      { property: "og:title", content: "Explorador ontológico — Kionas" },
      {
        property: "og:description",
        content: "El significado de una palabra, distinguido a través de sus expresiones griegas y latinas.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/explorador` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/explorador` }],
  }),
});

function ExploradorPage() {
  const { lang, t } = useI18n();
  const es = lang === "es";
  const { q } = Route.useSearch();
  const fn = useServerFn(explorarPalabra);

  const [word, setWord] = useState(q ?? "");
  const [result, setResult] = useState<ExploracionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (w: string) => {
    const clean = w.trim();
    if (clean.length < 2 || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fn({ data: { palabra: clean, language: lang } });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (q && q.trim().length >= 2) run(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-14">
        <p className="label">{es ? "Explorador ontológico" : "Ontological explorer"}</p>
        <h1 className="mt-4 font-serif text-display font-light text-foreground">
          {es ? "¿Qué quieres decir con esta palabra?" : "What do you mean by this word?"}
        </h1>
        <p className="lead mt-5 max-w-2xl">
          {es
            ? "Escribe una palabra y descubre qué distinciones se revelan al examinar sus expresiones en griego y en latín. No es un diccionario histórico: es una investigación del significado."
            : "Type a word and discover the distinctions that emerge when examining its Greek and Latin expressions. Not a historical dictionary: an inquiry into meaning."}
        </p>

        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            run(word);
          }}
        >
          <div className="flex gap-3">
            <input
              aria-label={t("ontology.word")}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={es ? "amor, libertad, justicia, verdad…" : "love, freedom, justice, truth…"}
              className="focus-mist min-w-0 w-full rounded-md border border-border bg-background/70 px-4 py-3 text-body text-foreground transition-colors placeholder:text-muted-foreground/70 hover:border-bronze/60"
            />
            <Button
              type="submit"
              disabled={busy || word.trim().length < 2}
              className="btn-gold focus-mist h-auto shrink-0 px-4 py-3 text-small shadow-none sm:px-5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {es ? "Explorar" : "Explore"}
            </Button>
          </div>
        </form>

        <ul className="mt-4 flex flex-wrap gap-2">
          {ONTOLOGIA.map((c) => (
            <li key={c.id}>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setWord(c.palabra);
                  run(c.palabra);
                }}
                className="focus-mist text-micro text-muted-foreground hover:text-foreground"
              >
                {c.palabra}
              </Button>
            </li>
          ))}
        </ul>

        {busy && (
          <p className="mt-10 text-micro uppercase tracking-[0.3em] text-muted-foreground pneuma-breathe">
            {es ? "Explorando…" : "Exploring…"}
          </p>
        )}

        {error && (
          <p className="mt-8 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-small text-destructive">
            {error}
          </p>
        )}

        <div aria-live="polite" aria-busy={busy}>
          {result?.source === "ia" && <OntologicalResponse text={result.text} />}
          {result?.source === "curado" && <ConceptoCard concept={result.concept} lang={lang} />}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ConceptoCard({ concept, lang }: { concept: NonNullable<ExploracionResult & { source: "curado" }>["concept"]; lang: "es" | "en" }) {
  const { t } = useI18n();

  return (
    <article className="ontology-response mt-12 min-w-0 border-t border-border/70 pt-8">
      <p className="!mt-0 text-micro text-muted-foreground">{t("ontology.meaning")}</p>
      <h2 className="!mt-2 !border-0 !pt-0 capitalize">{concept.palabra}</h2>
      <p>{concept.definicion}</p>

      <section>
        <h2>{t("ontology.greek")}</h2>
        <ul className="ontology-terms">
          {concept.griego.map((t) => (
            <Termino key={t.nombre} termino={t} lang={lang} />
          ))}
        </ul>
      </section>

      <section>
        <h2>{t("ontology.latin")}</h2>
        <ul className="ontology-terms">
          {concept.latin.map((t) => (
            <Termino key={t.nombre} termino={t} lang={lang} />
          ))}
        </ul>
      </section>

      <section>
        <h2>{t("ontology.synthesis")}</h2>
        <p>{concept.sintesis}</p>
      </section>

      {concept.pregunta && (
        <section>
          <h2>{t("ontology.question")}</h2>
          <blockquote><p>{concept.pregunta}</p></blockquote>
        </section>
      )}
    </article>
  );
}

function Termino({
  termino,
  lang,
}: {
  termino: { nombre: string; grafia: string; significado: string; distincion: string; ejemplo?: string };
  lang: "es" | "en";
}) {
  const { t } = useI18n();
  return (
    <li>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="!mt-0">{termino.nombre}</h3>
        <span className="font-serif text-small text-bronze-bright">{termino.grafia}</span>
      </div>
      <p>{termino.significado}</p>
      <p className="!text-muted-foreground">
        <strong>{t("ontology.distinction")}: </strong>
        {termino.distincion}
      </p>
      {termino.ejemplo && (
        <p className="!text-muted-foreground">
          <strong>{t("ontology.example")}: </strong>
          {termino.ejemplo}
        </p>
      )}
    </li>
  );
}
