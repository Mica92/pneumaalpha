import { Link } from "@tanstack/react-router";
import { PneumaMark } from "@/components/pneuma-mark";
import { useI18n } from "@/lib/i18n";
import { BRAND_LINE, CTA, FOOTER } from "@/lib/institutional-content";
import { SITE_NAME } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function InstitutionalFooter() {
  const { lang } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="inst-dark mt-auto">
      <div className="inst-container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <PneumaMark size={28} withWordmark />
            <p className="mt-5 text-small leading-relaxed text-muted-foreground">{BRAND_LINE[lang]}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="institutional" size="sm" className="h-9 px-4">
                <Link to="/contacto">{CTA.demo[lang]}</Link>
              </Button>
              <Button asChild variant="institutionalOutline" size="sm" className="h-9 px-4">
                <Link to="/app">{CTA.enter[lang]}</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER.groups.map((g) => (
              <div key={g.title.en}>
                <p className="inst-eyebrow">{g.title[lang]}</p>
                <ul className="mt-4 space-y-2.5">
                  {g.links.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="text-small text-ink transition-colors hover:text-foreground hover:underline hover:decoration-brass hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                      >
                        {l.label[lang]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-micro text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {year} {SITE_NAME}. {lang === "es" ? "Santiago de Chile." : "Santiago, Chile."}
          </p>
          <p>{lang === "es" ? "Disponible en español e inglés." : "Available in Spanish and English."}</p>
        </div>
      </div>
    </footer>
  );
}
