import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { QUOTE_THEMES, pickQuote, type Quote, type QuoteThemeId } from "@/lib/quotes";

export function QuoteCard({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();
  const [theme, setTheme] = useState<QuoteThemeId | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  // Client-only first pick — avoids SSR/hydration mismatch on random content.
  useEffect(() => {
    setQuote(pickQuote(null));
  }, []);

  const refresh = () => setQuote((prev) => pickQuote(theme, prev ?? undefined));

  const pickTheme = (id: QuoteThemeId) => {
    const next = id === theme ? null : id;
    setTheme(next);
    setQuote((prev) => pickQuote(next, prev ?? undefined));
  };

  return (
    <section
      aria-label={t("quotes.aria")}
      className={`fade-up relative overflow-hidden rounded-xl border border-border/70 bg-card/50 p-6 backdrop-blur-sm md:p-8 ${className}`}
    >
      <div className="pointer-events-none absolute -top-24 right-8 h-56 w-56 rounded-full bg-mist/8 blur-3xl" />

      <div className="relative flex items-start justify-between gap-4">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          {t("quotes.kicker")}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="focus-mist shrink-0 rounded-full border border-border/70 bg-card/40 px-3.5 py-1.5 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-all hover:border-mist/40 hover:text-foreground"
        >
          {t("quotes.refresh")}
        </button>
      </div>

      <blockquote className="relative mt-6 min-h-[92px]">
        <p className="max-w-3xl font-display text-xl font-light leading-relaxed text-foreground/90 md:text-2xl">
          {quote ? `“${quote.text[lang]}”` : "…"}
        </p>
        {quote && (
          <footer className="mt-4 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            — {quote.author}
          </footer>
        )}
      </blockquote>

      <div className="relative mt-6 border-t border-border/60 pt-4">
        <p className="mb-3 font-display text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
          {t("quotes.themes")}
        </p>
        <div className="flex flex-wrap gap-2">
          {QUOTE_THEMES.map((th) => {
            const active = th.id === theme;
            return (
              <button
                key={th.id}
                type="button"
                aria-pressed={active}
                onClick={() => pickTheme(th.id)}
                className={`focus-mist flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-display text-[10px] uppercase tracking-[0.22em] transition-all ${
                  active
                    ? "border-mist/50 bg-mist/10 text-foreground"
                    : "border-border/70 bg-card/40 text-muted-foreground hover:border-mist/40 hover:text-foreground"
                }`}
              >
                <span aria-hidden="true" className="text-sm leading-none opacity-80">
                  {th.glyph}
                </span>
                {th.label[lang]}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
