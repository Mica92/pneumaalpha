import { useI18n } from "@/lib/i18n";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { portraitOf, portraitFocus, profileOf } from "@/lib/portraits";

type Props = {
  philosopher: PhilosopherId;
  open: boolean;
  onClose: () => void;
};

/** Ficha del filósofo: retrato, datos y temas de experticia. */
export function PhilosopherProfilePanel({ philosopher, open, onClose }: Props) {
  const { lang } = useI18n();
  const meta = PHILOSOPHERS[philosopher];
  const profile = profileOf(philosopher);
  const portrait = portraitOf(philosopher);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label={lang === "es" ? "Cerrar ficha" : "Close profile"}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${lang === "es" ? "Ficha de" : "Profile of"} ${meta.name}`}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card/95 shadow-mist"
      >
        <div className="relative">
          {portrait ? (
            <img
              src={portrait}
              alt={`${lang === "es" ? "Retrato de" : "Portrait of"} ${meta.name}`}
              className={`h-72 w-full object-cover ${portraitFocus(philosopher)} grayscale brightness-125 contrast-105`}
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center">
              <span className="font-display text-6xl text-mist" aria-hidden="true">
                {meta.glyph}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <button
            onClick={onClose}
            aria-label={lang === "es" ? "Cerrar" : "Close"}
            className="focus-mist absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background/70 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">✕</span>
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="font-display text-subtitle font-light tracking-tight text-foreground">
              {meta.name}
            </h2>
            <p className="mt-1 text-micro uppercase tracking-[0.25em] text-muted-foreground">
              {meta.subtitle[lang]}
            </p>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6">
          {profile && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-micro tracking-widest text-muted-foreground">
              <span>{profile.years}</span>
              <span>{profile.origin[lang]}</span>
            </div>
          )}

          <p className="text-small leading-relaxed text-foreground/80">
            {profile ? profile.bio[lang] : meta.blurb[lang]}
          </p>

          {profile && (
            <section>
              <h3 className="font-display text-micro uppercase tracking-[0.35em] text-mist">
                {lang === "es" ? "Temas de experticia" : "Areas of expertise"}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.expertise.map((topic) => (
                  <li
                    key={topic.en}
                    className="rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-micro text-foreground/75"
                  >
                    {topic[lang]}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
