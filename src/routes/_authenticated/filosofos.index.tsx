import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { profileOf } from "@/lib/portraits";
import { CATEGORIES, type CategoryId } from "@/lib/discovery";
import { PhilosopherCard } from "@/components/philosopher-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/filosofos/")({
  component: PhilosophersIndex,
  head: () => ({
    meta: [
      { title: "Filósofos — PneumaA" },
      {
        name: "description",
        content:
          "Diecinueve conciencias filosóficas reconstruidas: quién es cada una, qué pregunta la mueve y de qué puedes hablar con ella.",
      },
      { property: "og:title", content: "Filósofos — PneumaA" },
      {
        property: "og:description",
        content: "Explora las mentes por tema, época o pregunta central y empieza a conversar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PhilosophersIndex() {
  const { lang } = useI18n();
  const es = lang === "es";
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool =
      cat === "all"
        ? PHILOSOPHER_LIST.map((p) => p.id)
        : (CATEGORIES.find((c) => c.id === cat)?.philosophers ?? []);
    return pool.filter((id) => {
      if (!q) return true;
      const p = PHILOSOPHER_LIST.find((x) => x.id === id);
      if (!p) return false;
      const profile = profileOf(id);
      const hay = [
        p.name,
        p.subtitle[lang],
        p.blurb[lang],
        profile?.years ?? "",
        ...(profile?.expertise ?? []).map((e) => e[lang]),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    }) as PhilosopherId[];
  }, [query, cat, lang]);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <p className="label">{es ? "Las mentes" : "The minds"}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-light leading-[1.08] text-foreground md:text-6xl">
            {es ? "Diecinueve maneras de pensar tu vida" : "Nineteen ways to think your life"}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {es
              ? "No necesitas saber quiénes son. Elige la pregunta que te inquieta y encontrarás a alguien que lleva siglos dándole vueltas."
              : "You don't need to know who they are. Pick the question that unsettles you and you'll find someone who has been circling it for centuries."}
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <label className="sr-only" htmlFor="philosopher-search">
              {es ? "Buscar filósofo o tema" : "Search philosopher or theme"}
            </label>
            <input
              id="philosopher-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                es ? "Buscar: libertad, muerte, poder…" : "Search: freedom, death, power…"
              }
              className="focus-mist w-full max-w-md rounded-md border border-border/70 bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70"
            />

            <div className="flex flex-wrap gap-2">
              <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
                {es ? "Todos" : "All"}
              </FilterChip>
              {CATEGORIES.map((c) => (
                <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                  <span aria-hidden="true" className="mr-1.5 text-bronze">
                    {c.glyph}
                  </span>
                  {c.title[lang]}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {es ? "Ninguna mente coincide con esa búsqueda." : "No mind matches that search."}
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((id) => (
                <li key={id}>
                  <PhilosopherCard id={id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-mist rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? "border-bronze/60 bg-bronze/12 text-foreground"
          : "border-border/70 text-muted-foreground hover:border-bronze/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
