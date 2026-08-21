import { createFileRoute, Link } from "@tanstack/react-router";
import { IDEAS } from "@/lib/discovery";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/ideas/")({
  component: IdeasIndex,
  head: () => ({
    meta: [
      { title: "Grandes ideas — PneumaA" },
      {
        name: "description",
        content:
          "Existencia, voluntad, libertad, poder, virtud, sentido: las ideas que atraviesan la filosofía, explicadas en lenguaje simple.",
      },
      { property: "og:title", content: "Grandes ideas — PneumaA" },
      {
        property: "og:description",
        content:
          "Entra por la idea, no por el autor. Cada concepto abre las mentes que lo pensaron.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function IdeasIndex() {
  const { lang } = useI18n();
  const es = lang === "es";

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <p className="label">{es ? "Grandes ideas" : "Great ideas"}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-light leading-[1.08] text-foreground md:text-6xl">
            {es ? "Entra por la idea, no por el autor" : "Enter through the idea, not the author"}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {es
              ? "Cada concepto explicado en lenguaje llano, con las mentes que lo pensaron y las preguntas que abre en tu vida."
              : "Each concept in plain language, with the minds that thought it and the questions it opens in your life."}
          </p>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {IDEAS.map((idea) => (
              <li key={idea.id}>
                <Link
                  to="/ideas/$id"
                  params={{ id: idea.id }}
                  className="card-editorial focus-mist flex h-full flex-col p-6"
                >
                  <h2 className="font-serif text-3xl font-light text-foreground">
                    {idea.title[lang]}
                  </h2>
                  <p className="mt-2 text-sm text-bronze-bright">{idea.short[lang]}</p>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {idea.explanation[lang]}
                  </p>
                  <p className="mt-auto pt-5 text-[11px] text-muted-foreground/80">
                    {idea.philosophers.map((p) => PHILOSOPHERS[p]?.name).join(" · ")}
                  </p>
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
