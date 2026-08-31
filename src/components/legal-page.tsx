import { Link } from "@tanstack/react-router";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";

export type LegalSection = { h: string; p: string };

export type LegalCopy = {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
  back: string;
};

export function LegalPage({ copy }: { copy: { es: LegalCopy; en: LegalCopy } }) {
  const { lang } = useI18n();
  const c = copy[lang];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12 md:px-10 md:py-20">
      <header className="flex items-center justify-between border-b border-border/60 pb-6">
        <Link to="/" aria-label="Pneum">
          <PneumaMark withWordmark />
        </Link>
        <LanguageSelector />
      </header>

      <article className="mt-12 space-y-10">
        <div>
          <p className="font-mono text-micro uppercase tracking-[0.35em] text-muted-foreground">
            {c.kicker}
          </p>
          <h1 className="mt-4 font-display text-title font-light text-foreground">{c.title}</h1>
          <p className="mt-3 text-micro uppercase tracking-[0.25em] text-muted-foreground">
            {c.updated}
          </p>
          <p className="mt-8 text-base leading-relaxed text-foreground/80">{c.intro}</p>
        </div>

        <div className="space-y-8">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-lg font-light text-foreground">{s.h}</h2>
              <p className="mt-2 whitespace-pre-line text-body text-foreground/70">{s.p}</p>
            </section>
          ))}
        </div>
      </article>

      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6 text-micro uppercase tracking-[0.3em] text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          {c.back}
        </Link>
        <nav className="flex flex-wrap gap-4">
          <Link to="/terminos" className="transition-colors hover:text-foreground">
            {lang === "es" ? "Términos" : "Terms"}
          </Link>
          <Link to="/reembolsos" className="transition-colors hover:text-foreground">
            {lang === "es" ? "Reembolsos" : "Refunds"}
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            {lang === "es" ? "Privacidad" : "Privacy"}
          </Link>
        </nav>
      </footer>
    </main>
  );
}
