import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/nosotros")({
  component: NosotrosPage,
  head: () => ({
    meta: [
      { title: "PneumAlpha — Nosotros" },
      {
        name: "description",
        content:
          "Somos un grupo de ciudadanos convencidos de que la tecnología debe estar al servicio de la conciencia humana. Entrenamos inteligencias artificiales con el pensamiento de grandes filósofos para que cualquiera pueda pensar, decidir y vivir mejor.",
      },
      { property: "og:title", content: "PneumAlpha — Nosotros" },
      {
        property: "og:description",
        content:
          "Somos un grupo de ciudadanos convencidos de que la tecnología debe estar al servicio de la conciencia humana. Entrenamos inteligencias artificiales con el pensamiento de grandes filósofos para que cualquiera pueda pensar, decidir y vivir mejor.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pneumaalpha.lovable.app/nosotros" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://pneumaalpha.lovable.app/nosotros" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "PneumAlpha",
          url: "https://pneumaalpha.lovable.app",
          description:
            "Conocimiento al servicio de la conciencia: inteligencia artificial entrenada con grandes filósofos para ayudar a cada persona a pensar, decidir y vivir mejor.",
        }),
      },
    ],
  }),
});

const VALUES = [1, 2, 3, 4, 5] as const;

function NosotrosPage() {
  const { lang, t } = useI18n();

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mt-10 mb-12 md:mt-16 md:mb-16">
          <p className="label text-bronze">{t("about.kicker")}</p>
          <h1 className="mt-5 font-serif text-title font-light text-foreground">
            {t("about.title")}
          </h1>
        </header>

        <article className="space-y-14">
          <section aria-labelledby="about-us-heading" className="card-editorial p-6 md:p-10">
            <h2 id="about-us-heading" className="sr-only">
              {t("about.kicker")}
            </h2>
            <div className="space-y-5 text-small leading-relaxed text-foreground/85 md:text-base">
              <p>{t("about.intro.p1")}</p>
              <p>{t("about.intro.p2")}</p>
              <p>{t("about.intro.p3")}</p>
            </div>
          </section>

          <section aria-labelledby="what-heading">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <h2
                id="what-heading"
                className="font-display text-micro uppercase tracking-[0.35em] text-muted-foreground"
              >
                {t("about.what.title")}
              </h2>
            </div>
            <div className="card-editorial p-6 md:p-10">
              <div className="space-y-5 text-small leading-relaxed text-foreground/85 md:text-base">
                <p>{t("about.what.p1")}</p>
                <p>{t("about.what.p2")}</p>
                <p>{t("about.what.p3")}</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="mission-heading">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <h2
                id="mission-heading"
                className="font-display text-micro uppercase tracking-[0.35em] text-muted-foreground"
              >
                {t("about.mission.title")}
              </h2>
            </div>
            <div className="card-editorial p-6 md:p-10">
              <div className="space-y-5 text-small leading-relaxed text-foreground/85 md:text-base">
                <p>{t("about.mission.p1")}</p>
                <p>{t("about.mission.p2")}</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="vision-heading">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <h2
                id="vision-heading"
                className="font-display text-micro uppercase tracking-[0.35em] text-muted-foreground"
              >
                {t("about.vision.title")}
              </h2>
            </div>
            <div className="card-editorial p-6 md:p-10">
              <div className="space-y-5 text-small leading-relaxed text-foreground/85 md:text-base">
                <p>{t("about.vision.p1")}</p>
                <p>{t("about.vision.p2")}</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="values-heading">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <h2
                id="values-heading"
                className="font-display text-micro uppercase tracking-[0.35em] text-muted-foreground"
              >
                {t("about.values.title")}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {VALUES.map((n) => (
                <article key={n} className="card-editorial p-6 md:p-7">
                  <h3 className="font-serif text-subtitle font-light text-foreground">
                    {t(`about.values.${n}.h`)}
                  </h3>
                  <div className="rule-hairline my-4" />
                  <p className="text-small leading-relaxed text-foreground/85">
                    {t(`about.values.${n}.p`)}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="flex justify-center pt-6">
            <Link
              to="/umbral"
              className="btn-gold rounded-full px-6 py-2.5 text-small"
              aria-label={lang === "es" ? "Volver al inicio" : "Back to home"}
            >
              {lang === "es" ? "Volver al umbral" : "Back to threshold"}
            </Link>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
