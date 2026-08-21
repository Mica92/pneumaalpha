import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { portraitFocus, portraitOf, profileOf } from "@/lib/portraits";
import { CATEGORIES, centralQuestion } from "@/lib/discovery";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PhilosopherCard } from "@/components/philosopher-card";
import { useI18n } from "@/lib/i18n";
import { recordPhilosopher } from "@/lib/journey";

export const Route = createFileRoute("/_authenticated/filosofos/$id")({
  loader: ({ params }) => {
    if (!(params.id in PHILOSOPHERS)) throw notFound();
    return { id: params.id as PhilosopherId };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Perfil no disponible — PneumaA" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = PHILOSOPHERS[loaderData.id];
    const title = `${p.name} — ${p.subtitle.es} | PneumaA`;
    const description = p.blurb.es;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: PhilosopherProfilePage,
});

function PhilosopherProfilePage() {
  const { id } = Route.useLoaderData();
  const { lang } = useI18n();
  const es = lang === "es";
  const p = PHILOSOPHERS[id];
  const profile = profileOf(id);
  const portrait = portraitOf(id);

  useEffect(() => {
    recordPhilosopher(id);
  }, [id]);

  const related = CATEGORIES.filter((c) => c.philosophers.includes(id))
    .flatMap((c) => c.philosophers)
    .filter((x) => x !== id)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .slice(0, 3);

  const fallback = PHILOSOPHER_LIST.filter((x) => x.id !== id)
    .slice(0, 3)
    .map((x) => x.id);
  const suggestions = related.length > 0 ? related : fallback;

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
          <Link
            to="/filosofos"
            className="focus-mist text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {es ? "Todos los filósofos" : "All philosophers"}
          </Link>

          <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-14">
            <div>
              <div className="overflow-hidden rounded-md border border-border/70 bg-secondary">
                {portrait ? (
                  <img
                    src={portrait}
                    alt={`${p.name}, ${profile?.years ?? ""}`}
                    className={`aspect-[3/4] w-full object-cover ${portraitFocus(id)} opacity-85 grayscale`}
                  />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center font-serif text-6xl text-bronze">
                    {p.glyph}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                {profile?.years && <p>{profile.years}</p>}
                {profile?.origin && <p>{profile.origin[lang]}</p>}
              </div>
            </div>

            <div>
              <p className="label">{p.subtitle[lang]}</p>
              <h1 className="mt-3 font-serif text-5xl font-light leading-none text-foreground md:text-7xl">
                {p.name}
              </h1>

              <p className="mt-8 font-serif text-2xl font-light italic leading-snug text-bronze-bright md:text-3xl">
                {centralQuestion(id, lang)}
              </p>

              <section className="mt-10">
                <h2 className="label">{es ? "Quién es" : "Who they are"}</h2>
                <p className="mt-3 text-base leading-relaxed text-foreground/90">{p.blurb[lang]}</p>
                {profile?.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {profile.bio[lang]}
                  </p>
                )}
              </section>

              {profile?.expertise && profile.expertise.length > 0 && (
                <section className="mt-10">
                  <h2 className="label">{es ? "De qué puedes hablar" : "What you can talk about"}</h2>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {profile.expertise.map((e) => (
                      <li
                        key={e.en}
                        className="rounded-md border border-border/60 px-3 py-2 text-sm text-muted-foreground"
                      >
                        {e[lang]}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/$philosopher"
                  params={{ philosopher: id }}
                  className="btn-gold focus-mist px-6 py-3 text-sm"
                >
                  {es ? `Conversar con ${p.name}` : `Talk with ${p.name}`}
                </Link>
                <Link to="/rutas" className="btn-ghost-gold focus-mist px-5 py-3 text-sm">
                  {es ? "Ver rutas filosóficas" : "See philosophical paths"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <h2 className="label">{es ? "Si te interesa esta mente" : "If this mind speaks to you"}</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((sid) => (
              <li key={sid}>
                <PhilosopherCard id={sid} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
