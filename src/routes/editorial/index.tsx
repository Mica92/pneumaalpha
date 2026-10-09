import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { EditorialShell } from "@/components/editorial/editorial-shell";
import { EditorialModerationQueue } from "@/components/editorial/moderation-queue";
import { EDITORIAL_ARTICLES, EDITORIAL_CATEGORIES, getEditorialCategory } from "@/lib/editorial";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site";

const SearchSchema = z.object({ categoria: z.string().optional(), q: z.string().optional() });

export const Route = createFileRoute("/editorial/")({
  validateSearch: (search: Record<string, unknown>) => SearchSchema.parse(search),
  component: EditorialIndex,
  head: () => {
    const title = "Editorial — Kionas.app";
    const description =
      "Filosofía, conceptos, ensayos, investigaciones, preguntas y podcast para estructurar y comprender tu pensamiento con mayor claridad.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}/editorial` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/editorial` }],
    };
  },
});

function EditorialIndex() {
  const { lang } = useI18n();
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.q ?? "");
  const category = getEditorialCategory(search.categoria ?? "");

  useEffect(() => {
    track("editorial_viewed", { surface: "index", category: category?.id ?? "all" });
  }, [category?.id]);

  const articles = useMemo(
    () =>
      EDITORIAL_ARTICLES.filter(
        (a) =>
          (!category || a.category === category.id) &&
          (!query.trim() ||
            `${a.title[lang]} ${a.dek[lang]}`
              .toLocaleLowerCase(lang)
              .includes(query.trim().toLocaleLowerCase(lang))),
      ),
    [category, query, lang],
  );

  const lead =
    category?.description[lang] ??
    (lang === "es"
      ? "Una publicación para pensar con más precisión: preguntas, conceptos, ensayos, investigaciones y perspectivas que regresan a tu experiencia."
      : "A publication for thinking more precisely: questions, concepts, essays, research and perspectives that return to your experience.");

  const [featured, ...rest] = articles;

  return (
    <EditorialShell>
      {/* Cabecera visual */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 120% at 15% 0%, color-mix(in oklab, var(--bronze) 14%, transparent), transparent 55%), radial-gradient(90% 90% at 85% 100%, color-mix(in oklab, var(--bronze) 9%, transparent), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-28">
          <p className="label">{lang === "es" ? "Publicación de Kionas.app" : "A Kionas.app publication"}</p>
          <h1 className="mt-5 max-w-4xl font-serif text-display font-light text-foreground">
            {category?.name[lang] ??
              (lang === "es" ? "Ideas para ver mejor lo que estás pensando." : "Ideas for seeing your thinking more clearly.")}
          </h1>
          <p className="lead mt-6 max-w-2xl">{lead}</p>
          <label className="mt-10 block max-w-xl">
            <span className="sr-only">{lang === "es" ? "Buscar en Editorial" : "Search Editorial"}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={100}
              placeholder={lang === "es" ? "Buscar una pregunta, concepto o autor…" : "Search a question, concept or author…"}
              className="focus-mist w-full border-x-0 border-t-0 border-b border-border bg-transparent px-0 py-3 text-body text-foreground placeholder:text-muted-foreground"
            />
          </label>
        </div>
      </section>

      {/* Categorías */}
      {!category && !query && (
        <section className="border-b border-border bg-card/25">
          <div className="mx-auto grid max-w-6xl md:grid-cols-2 lg:grid-cols-4">
            {EDITORIAL_CATEGORIES.map((c, i) => (
              <Link
                key={c.id}
                to="/editorial"
                search={{ categoria: c.id }}
                onClick={() => track("editorial_category_selected", { category: c.id })}
                className={`focus-mist p-6 md:p-8 ${i % 4 !== 0 ? "lg:border-l lg:border-border" : ""}`}
              >
                <p className="label">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-3 font-serif text-subtitle font-light text-foreground">{c.name[lang]}</h2>
                <p className="mt-3 text-small leading-relaxed text-muted-foreground">{c.description[lang]}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Lecturas */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex items-end justify-between border-b border-border pb-4">
          <h2 className="font-serif text-title font-light text-foreground">
            {lang === "es" ? "Lecturas" : "Readings"}
          </h2>
          <span className="text-micro text-muted-foreground">{articles.length}</span>
        </div>

        {articles.length === 0 ? (
          <p className="text-small text-muted-foreground">
            {lang === "es" ? "No encontramos lecturas con esos términos." : "No readings match those terms."}
          </p>
        ) : (
          <>
            {featured && (
              <article className="mb-16 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                <Link
                  to="/editorial/$category/$article"
                  params={{ category: featured.category, article: featured.slug }}
                  className="focus-mist group block"
                >
                  <p className="label">
                    {lang === "es" ? "Lectura destacada" : "Featured reading"} ·{" "}
                    {getEditorialCategory(featured.category)?.name[lang]}
                  </p>
                  <h3 className="mt-4 max-w-2xl font-serif text-display font-light leading-tight text-foreground group-hover:text-bronze-bright">
                    {featured.title[lang]}
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">{featured.dek[lang]}</p>
                  <span className="mt-6 block text-micro text-bronze">{lang === "es" ? "Leer →" : "Read →"}</span>
                </Link>
                {featured.image ? (
                  <img
                    src={featured.image.src}
                    alt={featured.image.alt[lang]}
                    className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-border/60 bg-gradient-to-br from-card/40 to-transparent"
                  >
                    <span className="font-serif text-6xl text-bronze/50">◈</span>
                  </div>
                )}
              </article>
            )}

            <ol className="grid gap-x-10 gap-y-2 md:grid-cols-2">
              {rest.map((a) => (
                <li key={a.slug} className="border-b border-border py-7">
                  <Link
                    to="/editorial/$category/$article"
                    params={{ category: a.category, article: a.slug }}
                    className="focus-mist group block"
                  >
                    {a.image && (
                      <img
                        src={a.image.src}
                        alt={a.image.alt[lang]}
                        className="mb-4 aspect-[16/9] w-full rounded-lg border border-border object-cover"
                      />
                    )}
                    <p className="label">
                      {getEditorialCategory(a.category)?.name[lang]} · {a.readingMinutes} min
                    </p>
                    <h3 className="mt-3 font-serif text-title font-light leading-tight text-foreground group-hover:text-bronze-bright">
                      {a.title[lang]}
                    </h3>
                    <p className="mt-3 text-small leading-relaxed text-muted-foreground">{a.dek[lang]}</p>
                    <span className="mt-5 block text-micro text-bronze">{lang === "es" ? "Leer →" : "Read →"}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <EditorialModerationQueue />
    </EditorialShell>
  );
}
