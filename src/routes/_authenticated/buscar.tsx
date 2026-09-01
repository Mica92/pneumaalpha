import { SITE_URL } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PHILOSOPHER_LIST, PHILOSOPHERS } from "@/lib/philosophers";
import { profileOf } from "@/lib/portraits";
import { CATEGORIES, IDEAS, ROUTES, REAL_PROBLEMS, centralQuestion } from "@/lib/discovery";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/buscar")({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
  component: SearchPage,
  head: () => ({
    meta: [
      { title: "Buscar — Pneum" },
      {
        name: "description",
        content:
          "Busca entre las 19 mentes, las grandes ideas, las rutas filosóficas y las preguntas de la vida real.",
      },
      { property: "og:title", content: "Buscar — Pneum" },
      {
        property: "og:description",
        content: "Un solo buscador para filósofos, ideas, rutas y preguntas.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/buscar` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/buscar` }],
  }),
});

type Hit = {
  key: string;
  kind: string;
  title: string;
  sub: string;
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function SearchPage() {
  const { q } = Route.useSearch();
  const { lang } = useI18n();
  const es = lang === "es";
  const [query, setQuery] = useState(q ?? "");

  const hits = useMemo<Hit[]>(() => {
    const needle = norm(query.trim());
    if (needle.length < 2) return [];
    const out: Hit[] = [];
    const match = (...parts: string[]) => parts.some((p) => norm(p).includes(needle));

    for (const p of PHILOSOPHER_LIST) {
      const prof = profileOf(p.id);
      const themes = (prof?.expertise ?? []).map((e) => e[lang]).join(" · ");
      const themesAll = (prof?.expertise ?? []).flatMap((e) => [e.es, e.en]).join(" ");
      if (
        match(
          p.name,
          themesAll,
          centralQuestion(p.id, "es"),
          centralQuestion(p.id, "en"),
          prof?.bio?.es ?? "",
          prof?.bio?.en ?? "",
        )
      ) {
        out.push({
          key: `p-${p.id}`,
          kind: es ? "Filósofo" : "Philosopher",
          title: p.name,
          sub: themes || centralQuestion(p.id, lang),
          to: "/filosofos/$id",
          params: { id: p.id },
        });
      }
    }

    for (const idea of IDEAS) {
      if (
        match(
          idea.title.es,
          idea.title.en,
          idea.short.es,
          idea.short.en,
          idea.explanation.es,
          idea.explanation.en,
        )
      ) {
        out.push({
          key: `i-${idea.id}`,
          kind: es ? "Idea" : "Idea",
          title: idea.title[lang],
          sub: idea.short[lang],
          to: "/ideas/$id",
          params: { id: idea.id },
        });
      }
    }

    for (const r of ROUTES) {
      if (match(r.question.es, r.question.en, r.intro.es, r.intro.en)) {
        out.push({
          key: `r-${r.id}`,
          kind: es ? "Ruta" : "Path",
          title: r.question[lang],
          sub: r.steps.map((s) => PHILOSOPHERS[s.philosopher]?.name).join(" → "),
          to: "/rutas/$id",
          params: { id: r.id },
        });
      }
    }

    for (const c of CATEGORIES) {
      if (match(c.title.es, c.title.en, c.tags.es, c.tags.en)) {
        out.push({
          key: `c-${c.id}`,
          kind: es ? "Tema" : "Topic",
          title: c.title[lang],
          sub: c.tags[lang],
          to: "/oraculo",
          search: { q: c.seed[lang] },
        });
      }
    }

    for (const rp of REAL_PROBLEMS) {
      if (match(rp.text.es, rp.text.en)) {
        out.push({
          key: `q-${rp.id}`,
          kind: es ? "Pregunta" : "Question",
          title: rp.text[lang],
          sub: rp.philosophers.map((p) => PHILOSOPHERS[p]?.name).join(" · "),
          to: "/oraculo",
          search: { q: rp.text[lang] },
        });
      }
    }

    return out.slice(0, 40);
  }, [query, lang, es]);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-4xl px-5 pt-14 md:px-8 md:pt-20">
          <p className="label">{es ? "Buscador" : "Search"}</p>
          <h1 className="mt-3 font-serif text-title font-light text-foreground">
            {es ? "Busca en todo Pneum" : "Search all of Pneum"}
          </h1>

          <div className="mt-8">
            <label htmlFor="global-search" className="sr-only">
              {es ? "Buscar" : "Search"}
            </label>
            <input
              id="global-search"
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                es ? "Libertad, Nietzsche, el amor, la muerte…" : "Freedom, Nietzsche, love, death…"
              }
              className="focus-mist w-full rounded-xl border border-border bg-input px-5 py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <section className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-14" aria-live="polite">
          {query.trim().length >= 2 && hits.length === 0 && (
            <p className="text-small text-muted-foreground">
              {es ? "Nada por aquí. Prueba con otra palabra." : "Nothing here. Try another word."}
            </p>
          )}

          <ul className="divide-y divide-border/60">
            {hits.map((h) => (
              <li key={h.key}>
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={h.to as any}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  params={h.params as any}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  search={h.search as any}
                  className="focus-mist group flex items-baseline justify-between gap-6 py-5 transition-colors hover:bg-card/40"
                >
                  <span className="min-w-0">
                    <span className="label">{h.kind}</span>
                    <span className="mt-1 block truncate font-serif text-subtitle font-light text-foreground">
                      {h.title}
                    </span>
                    <span className="mt-1 block truncate text-small text-muted-foreground">
                      {h.sub}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-bronze-bright opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
