import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { CTA, type L } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import { Eyebrow, IndexNumber, PageHero, Reveal, SectionHeading } from "@/components/institutional/primitives";
import { FeatureShowcase } from "@/components/institutional/feature-showcase";

export const Route = createFileRoute("/_site/plataforma")({
  component: PlatformPage,
  head: () =>
    institutionalHead({
      path: "/plataforma",
      title: "Plataforma — Kionas: exploración, diálogo y reflexión filosófica",
      description:
        "Conoce las herramientas reales de Kionas: explorar preguntas, comparar perspectivas, diálogos con corrientes filosóficas, ideas, mapa de conexiones y editorial. Qué incluye hoy y qué todavía no.",
      jsonLd: [breadcrumb("Plataforma", "/plataforma")],
    }),
});

const AVAILABLE: { title: L; body: L }[] = [
  { title: { es: "Español e inglés", en: "Spanish and English" }, body: { es: "Toda la experiencia está disponible en ambos idiomas.", en: "The whole experience is available in both languages." } },
  { title: { es: "Sin cuenta obligatoria", en: "No mandatory account" }, body: { es: "Se puede comenzar sin registrarse; el acceso con Google es opcional.", en: "You can start without signing up; Google sign-in is optional." } },
  { title: { es: "Web e instalable", en: "Web and installable" }, body: { es: "Funciona en el navegador, en escritorio y móvil, y puede instalarse como aplicación.", en: "Works in the browser on desktop and mobile, and can be installed as an app." } },
  { title: { es: "Perspectivas editoriales", en: "Editorial perspectives" }, body: { es: "Construidas a partir de obra publicada; no pretenden ser la persona histórica.", en: "Built from published work; they do not claim to be the historical person." } },
];

const NOT_YET: L[] = [
  { es: "Integraciones con plataformas de gestión del aprendizaje (LMS).", en: "Integrations with learning management systems (LMS)." },
  { es: "Inicio de sesión institucional único (SSO).", en: "Institutional single sign-on (SSO)." },
  { es: "Paneles de seguimiento por curso o cohorte.", en: "Course or cohort tracking dashboards." },
  { es: "Rúbricas de evaluación integradas.", en: "Built-in assessment rubrics." },
];

const IS_NOT: L[] = [
  { es: "Un chatbot que entrega respuestas definitivas.", en: "A chatbot that delivers definitive answers." },
  { es: "Una aplicación de autoayuda o un servicio de terapia.", en: "A self-help app or a therapy service." },
  { es: "Un sustituto del trabajo docente ni del juicio propio.", en: "A substitute for teaching or for one’s own judgement." },
];

function PlatformPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  return (
    <>
      <PageHero
        eyebrow={es ? "Plataforma" : "Platform"}
        title={es ? "Herramientas para pensar, no para dejar de hacerlo." : "Tools for thinking, not for ceasing to think."}
        lead={
          es
            ? "Kionas reúne en un mismo entorno la exploración de preguntas, el diálogo con tradiciones filosóficas y la lectura. Todo lo que aparece aquí existe hoy y puede probarse."
            : "Kionas brings together question exploration, dialogue with philosophical traditions and reading in a single environment. Everything shown here exists today and can be tried."
        }
      >
        <Button asChild variant="institutional" size="xl">
          <Link to="/app">{CTA.enter[lang]}</Link>
        </Button>
        <Button asChild variant="institutionalOutline" size="xl">
          <Link to="/contacto">{CTA.demo[lang]}</Link>
        </Button>
      </PageHero>

      <section aria-labelledby="tools-title" className="py-20 md:py-24">
        <div className="inst-container">
          <Reveal>
            <SectionHeading
              id="tools-title"
              eyebrow={es ? "Funcionalidades" : "Features"}
              title={es ? "Seis maneras de entrar en una pregunta." : "Six ways into a question."}
              lead={es ? "Selecciona una herramienta para ver su pantalla real." : "Select a tool to see its real screen."}
            />
          </Reveal>
          <div className="mt-12">
            <FeatureShowcase keys={["explorar", "perspectivas", "dialogos", "ideas", "mapa", "editorial"]} />
          </div>
        </div>
      </section>

      <section aria-labelledby="today-title" className="border-t border-border bg-card py-20 md:py-24">
        <div className="inst-container">
          <SectionHeading id="today-title" eyebrow={es ? "Disponible hoy" : "Available today"} title={es ? "Lo que ya incluye." : "What it already includes."} />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {AVAILABLE.map((a, i) => (
              <li key={a.title.en} className="bg-background p-7">
                <IndexNumber n={i + 1} />
                <h3 className="inst-h3 mt-4">{a.title[lang]}</h3>
                <p className="mt-2 text-small text-muted-foreground">{a.body[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="honest-title" className="border-t border-border py-20 md:py-24">
        <div className="inst-container grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <Eyebrow>{es ? "Transparencia" : "Transparency"}</Eyebrow>
            <h2 id="honest-title" className="inst-title mt-4 text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">
              {es ? "Lo que todavía no ofrecemos." : "What we do not offer yet."}
            </h2>
            <p className="mt-4 text-body text-muted-foreground">
              {es
                ? "Preferimos decirlo con claridad antes de una conversación institucional. Si alguno de estos puntos es decisivo para tu institución, conversémoslo."
                : "We prefer to say this clearly before an institutional conversation. If any of these points is decisive for your institution, let’s talk."}
            </p>
            <ul className="mt-8 border-t border-border">
              {NOT_YET.map((n) => (
                <li key={n.en} className="flex gap-4 border-b border-border py-4 text-small text-ink">
                  <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-sage-line" />
                  {n[lang]}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-secondary/60 p-8 md:p-10">
            <h2 className="inst-title text-[clamp(1.6rem,1.3rem+1.2vw,2.25rem)]">{es ? "Lo que Kionas no es." : "What Kionas is not."}</h2>
            <ul className="mt-6 space-y-4">
              {IS_NOT.map((n) => (
                <li key={n.en} className="flex gap-3 text-body text-ink">
                  <span aria-hidden="true" className="text-brass">—</span>
                  {n[lang]}
                </li>
              ))}
            </ul>
            <Link to="/metodologia" className="inst-link mt-8 inline-flex items-center gap-2 text-small">
              {CTA.methodology[lang]} <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
