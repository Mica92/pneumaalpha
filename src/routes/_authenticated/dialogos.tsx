import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { TRADITION_FAMILIES, traditionsByFamily } from "@/lib/traditions";

export const Route = createFileRoute("/_authenticated/dialogos")({
  component: DialogosIndex,
  head: () => ({
    meta: [
      { title: "Diálogos filosóficos — Kionas" },
      {
        name: "description",
        content:
          "Investiga una pregunta desde distintas tradiciones filosóficas: dialogar con una corriente, contrastar dos o tres, o confrontar una tesis. Cada una razona con sus propios conceptos, premisas y método.",
      },
      { property: "og:title", content: "Diálogos filosóficos — Kionas" },
      {
        property: "og:description",
        content: "Una pregunta, muchas formas de pensar: tradiciones filosóficas que razonan desde sus propios conceptos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/dialogos` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/dialogos` }],
  }),
});

function DialogosIndex() {
  const { lang } = useI18n();
  const es = lang === "es";

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-16 md:px-8 md:pt-24">
        <p className="label">{es ? "Diálogos filosóficos" : "Philosophical dialogues"}</p>
        <h1 className="mt-4 max-w-3xl font-serif text-display font-light text-foreground">
          {es ? "Una pregunta, muchas formas de pensar" : "One question, many ways of thinking"}
        </h1>
        <p className="lead mt-6 max-w-2xl">
          {es
            ? "Examina una pregunta desde tradiciones filosóficas distintas. Cada corriente razona con sus propios conceptos, premisas y método: no es la misma respuesta con distinto tono."
            : "Examine a question from different philosophical traditions. Each school reasons with its own concepts, premises and method: not the same answer in a different tone."}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { es: "Dialogar", en: "Converse", d: { es: "Conversa desde una tradición específica.", en: "Converse from a specific tradition." } },
            { es: "Contrastar", en: "Compare", d: { es: "Compara dos o tres tradiciones sobre una misma pregunta.", en: "Compare two or three traditions on one question." } },
            { es: "Confrontar", en: "Confront", d: { es: "Pon a prueba una tesis desde una corriente.", en: "Test a thesis against a school." } },
          ].map((m) => (
            <div key={m.es} className="card-editorial p-5">
              <h2 className="font-serif text-subtitle font-normal text-foreground">{m[lang]}</h2>
              <p className="mt-2 text-small text-muted-foreground">{m.d[lang]}</p>
            </div>
          ))}
        </div>

        {TRADITION_FAMILIES.map((f) => {
          const ts = traditionsByFamily(f.id);
          if (ts.length === 0) return null;
          return (
            <section key={f.id} className="mt-16">
              <h2 className="font-serif text-heading font-light text-foreground">{f.name[lang]}</h2>
              <p className="mt-2 max-w-2xl text-small text-muted-foreground">{f.description[lang]}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ts.map((t) => (
                  <li key={t.id}>
                    <Link
                      to="/dialogos/$id"
                      params={{ id: t.id }}
                      className="card-editorial focus-mist block h-full p-6"
                    >
                      <h3 className="font-serif text-subtitle font-normal text-foreground">
                        {t.name[lang]}
                      </h3>
                      <p className="mt-2 text-small leading-relaxed text-muted-foreground">
                        {t.tagline[lang]}
                      </p>
                      <p className="mt-4 text-micro text-bronze-bright">
                        {t.concepts.slice(0, 3).join(" · ")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </>
  );
}
