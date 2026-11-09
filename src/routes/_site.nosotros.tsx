import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CTA, VISION } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import { Eyebrow, IndexNumber, PageHero, Reveal } from "@/components/institutional/primitives";

export const Route = createFileRoute("/_site/nosotros")({
  component: AboutPage,
  head: () =>
    institutionalHead({
      path: "/nosotros",
      title: "Nosotros — Propósito, visión y origen de Kionas",
      description:
        "Kionas nació de una convicción: muchos problemas difíciles están mal formulados. Propósito, visión, origen y criterio editorial de una plataforma de filosofía aplicada.",
      jsonLd: [breadcrumb("Nosotros", "/nosotros")],
    }),
});

const VALUE_KEYS = [1, 2, 3, 4, 5] as const;

function AboutPage() {
  const { lang, t } = useI18n();
  const es = lang === "es";
  return (
    <>
      <PageHero
        eyebrow={es ? "Nosotros" : "About"}
        title={t("about.title")}
        lead={
          es
            ? "Kionas es una plataforma de filosofía aplicada e inteligencia artificial, operada por Kionas IA desde Santiago de Chile."
            : "Kionas is an applied philosophy and artificial intelligence platform, operated by Kionas IA from Santiago, Chile."
        }
      />

      <section aria-labelledby="origin-title" className="py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Eyebrow>{es ? "Origen" : "Origin"}</Eyebrow>
            <h2 id="origin-title" className="inst-title mt-4 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">
              {es ? "Por qué existe Kionas." : "Why Kionas exists."}
            </h2>
          </div>
          <div className="space-y-5 text-lead text-ink">
            <p>{t("about.intro.p1")}</p>
            <p>{t("about.intro.p2")}</p>
            <p>{t("about.intro.p3")}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="purpose-title" className="border-t border-border bg-card py-20 md:py-24">
        <div className="inst-container grid gap-10 md:grid-cols-2 md:gap-16">
          <Reveal>
            <Eyebrow>{t("about.mission.title")}</Eyebrow>
            <h2 id="purpose-title" className="inst-title mt-4 text-[clamp(1.7rem,1.3rem+1.4vw,2.4rem)]">
              {t("about.mission.p1")}
            </h2>
            <p className="mt-5 text-body text-muted-foreground">{t("about.mission.p2")}</p>
          </Reveal>
          <Reveal>
            <Eyebrow>{t("about.vision.title")}</Eyebrow>
            <h2 className="inst-title mt-4 text-[clamp(1.7rem,1.3rem+1.4vw,2.4rem)]">{VISION.title[lang]}</h2>
            <p className="mt-5 text-body text-muted-foreground">{VISION.lead[lang]}</p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="how-title" className="border-t border-border py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div>
            <Eyebrow>{t("about.what.title")}</Eyebrow>
            <h2 id="how-title" className="inst-title mt-4 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">
              {es ? "Perspectivas editoriales, no personas digitalizadas." : "Editorial perspectives, not digitised people."}
            </h2>
          </div>
          <div className="space-y-5 text-body text-ink">
            <p>{t("about.what.p1")}</p>
            <p>{t("about.what.p2")}</p>
            <p>{t("about.what.p3")}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="criteria-title" className="border-t border-border bg-secondary/50 py-20 md:py-24">
        <div className="inst-container">
          <Eyebrow>{t("about.values.title")}</Eyebrow>
          <h2 id="criteria-title" className="sr-only">
            {t("about.values.title")}
          </h2>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {VALUE_KEYS.map((n) => (
              <li key={n} className="bg-card p-6">
                <IndexNumber n={n} />
                <h3 className="inst-h3 mt-3">{t(`about.values.${n}.h`)}</h3>
                <p className="mt-2 text-small text-muted-foreground">{t(`about.values.${n}.p`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="inst-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <h2 className="inst-title max-w-xl text-[clamp(1.7rem,1.3rem+1.4vw,2.4rem)]">
            {es ? "Construyamos juntos experiencias para pensar mejor." : "Let’s build experiences for thinking better together."}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="institutional" size="xl">
              <Link to="/contacto">{CTA.demo[lang]}</Link>
            </Button>
            <Button asChild variant="institutionalOutline" size="xl">
              <Link to="/app">{CTA.enter[lang]}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
