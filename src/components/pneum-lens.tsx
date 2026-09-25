import { useState } from "react";
import { Bookmark, ChevronDown, Diamond } from "lucide-react";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import type { LensReading } from "@/lib/lens.functions";

type Props = {
  reading: LensReading | null;
  loading?: boolean;
  lang: "es" | "en";
  /** Opens a contrast with the current perspective plus the chosen one. */
  onContrast?: (id: PhilosopherId) => void;
  /** Continues the conversation with a question from the lens. */
  onAsk?: (text: string) => void;
  /** Saves an emerging line into the personal library. */
  onSave?: (text: string) => void;
};

const COPY = {
  es: {
    title: "Kionas Lens",
    reading: "Leyendo lo que está emergiendo…",
    stake: "En juego",
    tension: "Tensión",
    perspectives: "Otras perspectivas",
    open: "Pregunta abierta",
    fresh: "Nueva pregunta",
    contrast: "Ver contraste",
    explore: "Explorar",
    save: "Guardar",
    empty: "Cuando la conversación avance, aquí aparecerá lo que está en juego.",
  },
  en: {
    title: "Kionas Lens",
    reading: "Reading what is emerging…",
    stake: "At stake",
    tension: "Tension",
    perspectives: "Other perspectives",
    open: "Open question",
    fresh: "New question",
    contrast: "See contrast",
    explore: "Explore",
    save: "Save",
    empty: "As the conversation unfolds, what is at stake will appear here.",
  },
} as const;

function hasContent(r: LensReading | null): boolean {
  if (!r) return false;
  return Boolean(
    r.concepts.length || r.tension || r.perspectives.length || r.openQuestion || r.newQuestion,
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
      {children}
    </h3>
  );
}

export function PneumLensBody({ reading, loading, lang, onContrast, onAsk, onSave }: Props) {
  const c = COPY[lang];

  if (loading && !hasContent(reading)) {
    return (
      <p className="text-micro uppercase tracking-[0.25em] text-muted-foreground">{c.reading}</p>
    );
  }
  if (!hasContent(reading)) {
    return <p className="text-small leading-relaxed text-muted-foreground">{c.empty}</p>;
  }
  const r = reading!;

  return (
    <div className="space-y-6">
      {r.concepts.length > 0 && (
        <section className="space-y-2">
          <Label>{c.stake}</Label>
          <ul className="flex flex-wrap gap-x-2 gap-y-1 font-display text-small text-foreground/90">
            {r.concepts.map((concept, i) => (
              <li key={concept}>
                {concept}
                {i < r.concepts.length - 1 && (
                  <span className="pl-2 text-muted-foreground/60">·</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.tension && (
        <section className="space-y-2">
          <Label>{c.tension}</Label>
          <p className="font-display text-small leading-relaxed text-foreground/90">{r.tension}</p>
        </section>
      )}

      {r.perspectives.length > 0 && (
        <section className="space-y-2">
          <Label>{c.perspectives}</Label>
          <ul className="space-y-3">
            {r.perspectives.map((p) => (
              <li key={p.philosopher} className="space-y-1">
                <p className="font-display text-small text-foreground/90">
                  {PHILOSOPHERS[p.philosopher]?.name ?? p.philosopher}
                </p>
                {p.angle && (
                  <p className="text-micro leading-relaxed text-muted-foreground">{p.angle}</p>
                )}
                {onContrast && (
                  <button
                    type="button"
                    onClick={() => onContrast(p.philosopher)}
                    className="focus-mist text-micro uppercase tracking-[0.25em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    {c.contrast}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {r.openQuestion && (
        <section className="space-y-2">
          <Label>{c.open}</Label>
          <p className="font-display text-small leading-relaxed text-foreground/90">
            {r.openQuestion}
          </p>
        </section>
      )}

      {r.newQuestion && (
        <section className="space-y-3 border-t border-border/40 pt-5">
          <Label>{c.fresh}</Label>
          <p className="font-display text-body leading-relaxed text-foreground">{r.newQuestion}</p>
          <div className="flex flex-wrap gap-3">
            {onAsk && (
              <button
                type="button"
                onClick={() => onAsk(r.newQuestion!)}
                className="focus-mist rounded-full border border-foreground/20 px-3.5 py-1.5 text-micro uppercase tracking-[0.25em] text-foreground/90 transition-colors hover:border-foreground/40"
              >
                {c.explore}
              </button>
            )}
            {onSave && (
              <button
                type="button"
                onClick={() => onSave(r.newQuestion!)}
                className="focus-mist inline-flex items-center gap-2 rounded-full border border-foreground/10 px-3.5 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bookmark aria-hidden size={13} strokeWidth={1.5} />
                {c.save}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/** Right rail on wide screens. */
export function PneumLensRail(props: Props) {
  const c = COPY[props.lang];
  if (!hasContent(props.reading) && !props.loading) return null;
  return (
    <aside
      aria-label={c.title}
      className="hidden w-80 shrink-0 overflow-y-auto border-l border-border/40 px-6 py-8 lg:block"
    >
      <div className="mb-6 flex items-center gap-2">
        <Diamond aria-hidden size={13} strokeWidth={1.5} className="text-muted-foreground" />
        <h2 className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
          {c.title}
        </h2>
      </div>
      <PneumLensBody {...props} />
    </aside>
  );
}

/** Collapsible block for narrow screens. */
export function PneumLensSheet(props: Props) {
  const [open, setOpen] = useState(false);
  const c = COPY[props.lang];
  if (!hasContent(props.reading) && !props.loading) return null;
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-mist flex w-full items-center justify-between border-y border-border/40 bg-card/50 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
          <Diamond aria-hidden size={13} strokeWidth={1.5} />
          {c.title}
        </span>
        <ChevronDown
          aria-hidden
          size={16}
          strokeWidth={1.5}
          className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-b border-border/40 bg-card/30 px-4 py-6">
          <PneumLensBody {...props} />
        </div>
      )}
    </div>
  );
}
