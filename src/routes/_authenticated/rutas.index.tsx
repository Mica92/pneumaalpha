import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { ROUTES } from "@/lib/discovery";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/rutas/")({
  component: RoutesIndex,
  head: () => ({
    meta: [
      { title: "Rutas filosóficas — Pneum" },
      {
        name: "description",
        content:
          "Recorridos guiados de cuatro conversaciones: vivir bien, el sufrimiento, la libertad, el amor y la justicia.",
      },
      { property: "og:title", content: "Rutas filosóficas — Pneum" },
      {
        property: "og:description",
        content: "Una gran pregunta, cuatro mentes, un recorrido con sentido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/rutas` }],
  }),
});

function RoutesIndex() {
  const { lang } = useI18n();
  const es = lang === "es";

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <p className="label">{es ? "Rutas filosóficas" : "Philosophical paths"}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-title font-light text-foreground">
            {es ? "Una pregunta, cuatro mentes" : "One question, four minds"}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {es
              ? "Cada ruta es un recorrido de cuatro conversaciones breves. Al final, la pregunta sigue abierta — pero tú ya no eres el mismo que la hizo."
              : "Each path is a sequence of four short conversations. At the end the question stays open — but you are no longer the one who asked it."}
          </p>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <ul className="grid gap-6 md:grid-cols-2">
            {ROUTES.map((r) => (
              <li key={r.id}>
                <Link
                  to="/rutas/$id"
                  params={{ id: r.id }}
                  className="card-editorial focus-mist flex h-full flex-col p-7"
                >
                  <p className="label">
                    {r.steps.length} {es ? "conversaciones" : "conversations"}
                  </p>
                  <h2 className="mt-3 font-serif text-heading font-light text-foreground">
                    {r.question[lang]}
                  </h2>
                  <p className="mt-4 text-small leading-relaxed text-muted-foreground">
                    {r.intro[lang]}
                  </p>
                  <ol className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-micro text-bronze-bright">
                    {r.steps.map((s, i) => (
                      <li key={s.philosopher}>
                        {i > 0 && <span className="mr-2 text-muted-foreground/50">→</span>}
                        {PHILOSOPHERS[s.philosopher]?.name}
                      </li>
                    ))}
                  </ol>
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
