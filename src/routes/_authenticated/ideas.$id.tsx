import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { IDEAS, ideaById } from "@/lib/discovery";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PhilosopherCard } from "@/components/philosopher-card";
import { useI18n } from "@/lib/i18n";
import { recordIdea } from "@/lib/journey";

export const Route = createFileRoute("/_authenticated/ideas/$id")({
  loader: ({ params }) => {
    const idea = ideaById(params.id);
    if (!idea) throw notFound();
    return { id: idea.id };
  },
  head: ({ loaderData }) => {
    const idea = loaderData ? ideaById(loaderData.id) : undefined;
    if (!idea) {
      return {
        meta: [{ title: "Idea no disponible — PneumAlpha" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${idea.title.es} — Grandes ideas | PneumAlpha`;
    return {
      meta: [
        { title },
        { name: "description", content: idea.explanation.es.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: idea.short.es },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: IdeaPage,
});

function IdeaPage() {
  const { id } = Route.useLoaderData();
  const { lang } = useI18n();
  const es = lang === "es";
  const idea = ideaById(id)!;

  useEffect(() => {
    recordIdea(id);
  }, [id]);

  const others = IDEAS.filter((i) => i.id !== id).slice(0, 4);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <article className="mx-auto max-w-3xl px-5 pt-12 md:px-8 md:pt-20">
          <Link
            to="/ideas"
            className="focus-mist text-micro text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {es ? "Todas las ideas" : "All ideas"}
          </Link>
          <p className="label mt-8">{es ? "Gran idea" : "Great idea"}</p>
          <h1 className="mt-3 font-serif text-5xl font-light leading-none text-foreground md:text-7xl">
            {idea.title[lang]}
          </h1>
          <p className="mt-5 font-serif text-subtitle font-light italic text-bronze-bright">
            {idea.short[lang]}
          </p>
          <p className="mt-8 text-lg leading-relaxed text-foreground/90">
            {idea.explanation[lang]}
          </p>

          <section className="mt-12">
            <h2 className="label">{es ? "Preguntas para ti" : "Questions for you"}</h2>
            <ul className="mt-4 space-y-3">
              {idea.questions.map((q) => (
                <li
                  key={q.en}
                  className="rule-hairline pt-3 font-serif text-subtitle font-light text-foreground"
                >
                  {q[lang]}
                </li>
              ))}
            </ul>
          </section>
        </article>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="label">{es ? "Quiénes la pensaron" : "Who thought it"}</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {idea.philosophers.map((pid) => (
              <li key={pid}>
                <PhilosopherCard id={pid} />
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
          <h2 className="label">{es ? "Seguir explorando" : "Keep exploring"}</h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.id}>
                <Link
                  to="/ideas/$id"
                  params={{ id: o.id }}
                  className="btn-ghost-gold focus-mist px-4 py-2 text-small"
                >
                  {o.title[lang]}
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
