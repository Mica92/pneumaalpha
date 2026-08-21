import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { portraitFocus, portraitOf } from "@/lib/portraits";
import { IDEAS, ROUTES } from "@/lib/discovery";
import { getJourney, journeyPhilosophers, type JourneyEntry } from "@/lib/journey";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/recorrido")({
  component: JourneyPage,
  head: () => ({
    meta: [
      { title: "Mi recorrido — PneumAlpha" },
      {
        name: "description",
        content:
          "Las mentes con las que has hablado, las ideas que exploraste y las rutas que empezaste: tu recorrido intelectual en PneumAlpha.",
      },
      { property: "og:title", content: "Mi recorrido — PneumAlpha" },
      {
        property: "og:description",
        content: "Tu historial de pensamiento, guardado en tu propio navegador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function JourneyPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  const [minds, setMinds] = useState<JourneyEntry[]>([]);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);

  useEffect(() => {
    setMinds(journeyPhilosophers());
    const j = getJourney();
    setIdeas(j.ideas);
    setRoutes(j.routes);
  }, []);

  const empty = minds.length === 0 && ideas.length === 0 && routes.length === 0;

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <p className="label">{es ? "Mi recorrido" : "My journey"}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-light leading-[1.08] text-foreground md:text-6xl">
            {es ? "Lo que has estado pensando" : "What you have been thinking"}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {es
              ? "Este registro vive solo en tu navegador. Nadie más lo ve."
              : "This record lives only in your browser. No one else sees it."}
          </p>
        </div>

        {empty ? (
          <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
            <div className="card-editorial p-10 text-center">
              <p className="font-serif text-2xl font-light text-foreground">
                {es ? "Tu recorrido está en blanco." : "Your journey is still blank."}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {es
                  ? "Empieza por una idea o por una mente; aquí quedará el rastro."
                  : "Start with an idea or a mind; the trace will appear here."}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link to="/filosofos" className="btn-gold focus-mist px-5 py-3 text-sm">
                  {es ? "Ver filósofos" : "See philosophers"}
                </Link>
                <Link to="/ideas" className="btn-ghost-gold focus-mist px-5 py-3 text-sm">
                  {es ? "Ver ideas" : "See ideas"}
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <div className="mx-auto max-w-6xl space-y-14 px-5 py-14 md:px-8">
            {minds.length > 0 && (
              <section>
                <h2 className="label">{es ? "Mentes visitadas" : "Minds visited"}</h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {minds.map((m) => {
                    const p = PHILOSOPHERS[m.philosopher];
                    if (!p) return null;
                    const portrait = portraitOf(m.philosopher);
                    return (
                      <li key={m.philosopher}>
                        <Link
                          to="/$philosopher"
                          params={{ philosopher: m.philosopher }}
                          className="card-editorial focus-mist flex items-center gap-4 p-4"
                        >
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-secondary">
                            {portrait && (
                              <img
                                src={portrait}
                                alt={p.name}
                                loading="lazy"
                                className={`h-full w-full object-cover ${portraitFocus(m.philosopher)} opacity-80 grayscale`}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif text-xl font-light text-foreground">
                              {p.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.subtitle[lang]}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {ideas.length > 0 && (
              <section>
                <h2 className="label">{es ? "Ideas exploradas" : "Ideas explored"}</h2>
                <ul className="mt-5 flex flex-wrap gap-3">
                  {ideas.map((id) => {
                    const idea = IDEAS.find((i) => i.id === id);
                    if (!idea) return null;
                    return (
                      <li key={id}>
                        <Link
                          to="/ideas/$id"
                          params={{ id }}
                          className="btn-ghost-gold focus-mist px-4 py-2 text-sm"
                        >
                          {idea.title[lang]}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {routes.length > 0 && (
              <section>
                <h2 className="label">{es ? "Rutas empezadas" : "Paths started"}</h2>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {routes.map((id) => {
                    const r = ROUTES.find((x) => x.id === id);
                    if (!r) return null;
                    return (
                      <li key={id}>
                        <Link
                          to="/rutas/$id"
                          params={{ id }}
                          className="card-editorial focus-mist block p-5"
                        >
                          <p className="font-serif text-xl font-light text-foreground">
                            {r.question[lang]}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {r.steps.length} {es ? "conversaciones" : "conversations"}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
