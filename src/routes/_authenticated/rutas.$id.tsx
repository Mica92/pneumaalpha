import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { routeById } from "@/lib/discovery";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { portraitFocus, portraitOf, profileOf } from "@/lib/portraits";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";
import { recordRoute } from "@/lib/journey";

export const Route = createFileRoute("/_authenticated/rutas/$id")({
  loader: ({ params }) => {
    const r = routeById(params.id);
    if (!r) throw notFound();
    return { id: r.id };
  },
  head: ({ loaderData }) => {
    const r = loaderData ? routeById(loaderData.id) : undefined;
    if (!r) {
      return {
        meta: [{ title: "Ruta no disponible — Pneuma Alpha" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${r.question.es} — Ruta filosófica | Pneuma Alpha`;
    return {
      meta: [
        { title },
        { name: "description", content: r.intro.es },
        { property: "og:title", content: title },
        { property: "og:description", content: r.intro.es },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: RoutePage,
});

function RoutePage() {
  const { id } = Route.useLoaderData();
  const { lang } = useI18n();
  const es = lang === "es";
  const route = routeById(id)!;

  useEffect(() => {
    recordRoute(id);
  }, [id]);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-3xl px-5 pt-12 md:px-8 md:pt-20">
          <Link
            to="/rutas"
            className="focus-mist text-micro text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {es ? "Todas las rutas" : "All paths"}
          </Link>
          <p className="label mt-8">
            {route.steps.length} {es ? "conversaciones" : "conversations"}
          </p>
          <h1 className="mt-3 font-serif text-title font-light text-foreground">
            {route.question[lang]}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {route.intro[lang]}
          </p>
        </div>

        <ol className="mx-auto mt-12 max-w-3xl space-y-4 px-5 pb-20 md:px-8">
          {route.steps.map((step, i) => {
            const p = PHILOSOPHERS[step.philosopher];
            const portrait = portraitOf(step.philosopher);
            return (
              <li key={step.philosopher} className="card-editorial flex gap-5 p-5">
                <div className="hidden h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-secondary sm:block">
                  {portrait ? (
                    <img
                      src={portrait}
                      alt={p.name}
                      loading="lazy"
                      className={`h-full w-full object-cover ${portraitFocus(step.philosopher)} opacity-75 grayscale`}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="label">
                    {es ? "Paso" : "Step"} {i + 1} · {profileOf(step.philosopher)?.years ?? ""}
                  </p>
                  <h2 className="mt-1.5 font-serif text-subtitle font-light text-foreground">
                    {p.name}
                  </h2>
                  <p className="mt-1 text-small text-muted-foreground">{step.note[lang]}</p>
                  <p className="mt-3 font-serif text-lg italic text-bronze-bright">
                    {step.prompt[lang]}
                  </p>
                  <Link
                    to="/$philosopher"
                    params={{ philosopher: step.philosopher }}
                    search={{ q: step.prompt[lang] }}
                    className="btn-gold focus-mist mt-4 px-4 py-2 text-micro"
                  >
                    {es ? "Empezar este paso" : "Start this step"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}
