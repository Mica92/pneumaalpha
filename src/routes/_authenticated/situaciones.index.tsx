import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageAtmosphere } from "@/components/page-atmosphere";
import { useI18n } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SITUATIONS } from "@/lib/situations";

const TITLE = `Empieza por la situación que estás viviendo — ${SITE_NAME}`;
const DESCRIPTION =
  "Seis situaciones reales por las que entrar a Pneum: una decisión difícil, cambiar de trabajo, entender una relación, justificar algo ya decidido, examinar una idea o entender un conflicto.";

export const Route = createFileRoute("/_authenticated/situaciones/")({
  component: SituationsIndex,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/situaciones` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/situaciones` }],
  }),
});

function SituationsIndex() {
  const { lang } = useI18n();
  const es = lang === "es";

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <PageAtmosphere variant="archive" />
        <header className="relative">
          <p className="label">{es ? "Situaciones" : "Situations"}</p>
          <h1 className="balance mt-4 max-w-2xl font-serif text-title font-light text-foreground">
            {es
              ? "Empieza por la situación que estás viviendo"
              : "Start from the situation you are in"}
          </h1>
          <p className="measure mt-5 text-body leading-relaxed text-muted-foreground">
            {es
              ? "No necesitas una pregunta bien formulada. Elige lo que más se parezca a lo tuyo y Pneum se encarga de encontrar la pregunta que hay debajo."
              : "You do not need a well-formed question. Pick whatever is closest to your case and Pneum will find the question underneath."}
          </p>
        </header>

        <ul className="relative mt-12 grid gap-4 md:grid-cols-2">
          {SITUATIONS.map((s) => (
            <li key={s.id}>
              <Link
                to="/situaciones/$id"
                params={{ id: s.id }}
                className="card-editorial focus-mist flex h-full flex-col p-6"
              >
                <h2 className="font-serif text-subtitle font-light leading-snug text-foreground">
                  {s.title[lang]}
                </h2>
                <p className="mt-3 text-small leading-relaxed text-muted-foreground">
                  {s.claim[lang]}
                </p>
                <span className="mt-6 text-micro uppercase tracking-[0.25em] text-bronze-bright">
                  {es ? "Pensarlo" : "Think it"} →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
