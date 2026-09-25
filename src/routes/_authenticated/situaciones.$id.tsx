import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageAtmosphere } from "@/components/page-atmosphere";
import { AskLink } from "@/components/ask-link";
import { useI18n } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SITUATIONS, situationById } from "@/lib/situations";

export const Route = createFileRoute("/_authenticated/situaciones/$id")({
  component: SituationPage,
  head: ({ params }) => {
    const s = situationById(params.id as string);
    if (!s) return { meta: [{ title: SITE_NAME }] };
    const title = `${s.title.es} — ${SITE_NAME}`;
    const url = `${SITE_URL}/situaciones/${s.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: s.meta.es },
        { property: "og:title", content: title },
        { property: "og:description", content: s.meta.es },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function SituationPage() {
  const { id } = useParams({ from: "/_authenticated/situaciones/$id" });
  const { lang } = useI18n();
  const es = lang === "es";
  const situation = situationById(id);

  if (!situation) {
    return (
      <>
        <SiteNav />
        <main className="route-enter relative z-10 mx-auto max-w-3xl px-5 py-24 md:px-8">
          <h1 className="font-serif text-title font-light text-foreground">
            {es ? "Esta situación no existe" : "This situation does not exist"}
          </h1>
          <Link to="/situaciones" className="btn-ghost-gold mt-8 inline-block px-5 py-2.5 text-small">
            {es ? "Ver todas las situaciones" : "See all situations"}
          </Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  const others = SITUATIONS.filter((s) => s.id !== situation.id).slice(0, 3);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <PageAtmosphere variant="study" />

        <header className="relative">
          <p className="label">{es ? "Situación" : "Situation"}</p>
          <h1 className="balance mt-4 font-serif text-title font-light text-foreground">
            {situation.title[lang]}
          </h1>
          <p className="mt-5 font-serif text-subtitle font-light leading-snug text-bronze-bright">
            “{situation.claim[lang]}”
          </p>
        </header>

        <section className="relative mt-12">
          <p className="text-body leading-relaxed text-muted-foreground">{situation.body[lang]}</p>
        </section>

        <section className="relative mt-12">
          <p className="label">{es ? "Lo que suele estar en juego" : "What is usually at stake"}</p>
          <ul className="mt-5 flex flex-col divide-y divide-border/60 border-y border-border/60">
            {situation.tensions.map((tension) => (
              <li key={tension.en} className="py-4 font-serif text-subtitle font-light text-foreground">
                {tension[lang]}
              </li>
            ))}
          </ul>
        </section>

        <section className="relative mt-12 border border-bronze/40 bg-bronze/5 p-7">
          <p className="label">{es ? "Empezar" : "Begin"}</p>
          <p className="mt-3 font-serif text-subtitle font-light leading-snug text-foreground">
            {situation.starter[lang]}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <AskLink
              to="/oraculo"
              text={situation.starter[lang]}
              className="btn-gold focus-mist px-6 py-3 text-small"
            >
              {es ? "Pensar con Kionas" : "Think with Kionas"}
            </AskLink>
            <Link to="/oraculo" className="btn-ghost-gold focus-mist px-5 py-3 text-small">
              {es ? "Escribir mi propia pregunta" : "Write my own question"}
            </Link>
          </div>
        </section>

        <section className="relative mt-16">
          <p className="label">{es ? "Otras situaciones" : "Other situations"}</p>
          <ul className="mt-5 flex flex-col divide-y divide-border/60 border-y border-border/60">
            {others.map((s) => (
              <li key={s.id}>
                <Link
                  to="/situaciones/$id"
                  params={{ id: s.id }}
                  className="focus-mist block py-4 text-small text-muted-foreground transition-colors hover:text-foreground"
                >
                  {s.title[lang]} →
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
