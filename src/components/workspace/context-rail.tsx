import { Link } from "@tanstack/react-router";
import {
  KIND_LABEL,
  KIND_TONE,
  REFLECTION_STATES,
  STATE_LABEL,
  type Reflection,
  type ReflectionState,
  type ThoughtObject,
} from "@/lib/workspace.shared";

const COPY = {
  es: {
    thisReflection: "Esta reflexión",
    state: "Estado",
    objects: "Lo que ha aparecido",
    empty: "Todavía no has guardado nada de esta reflexión.",
    map: "Tu mapa",
    open: "Abrir el mapa",
    memory: "Memoria",
    decision: "Registrar decisión",
    patterns: "Kionas observa",
    inThree: "En varias reflexiones",
  },
  en: {
    thisReflection: "This reflection",
    state: "State",
    objects: "What has surfaced",
    empty: "You haven't kept anything from this reflection yet.",
    map: "Your map",
    open: "Open the map",
    memory: "Memory",
    decision: "Record a decision",
    patterns: "Kionas notices",
    inThree: "Across several reflections",
  },
} as const;

type Props = {
  lang: "es" | "en";
  reflection: Reflection | null;
  objects: ThoughtObject[];
  patterns: { term: string; count: number }[];
  onState: (state: ReflectionState) => void;
  onOpenMemory: () => void;
  onOpenDecision: () => void;
};

export function ContextRail({
  lang,
  reflection,
  objects,
  patterns,
  onState,
  onOpenMemory,
  onOpenDecision,
}: Props) {
  const c = COPY[lang];
  const counts = objects.reduce<Record<string, number>>((acc, o) => {
    acc[o.kind] = (acc[o.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <aside className="hidden w-[15rem] shrink-0 border-r border-border/40 px-5 py-8 lg:block">
      <div className="sticky top-28 space-y-7">
        <section className="space-y-2">
          <h2 className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
            {c.thisReflection}
          </h2>
          <p className="font-display text-small leading-snug text-foreground/90">
            {reflection?.title || (lang === "es" ? "Sin título todavía" : "Untitled so far")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
            {c.state}
          </h2>
          <ul className="space-y-1">
            {REFLECTION_STATES.map((s) => {
              const active = reflection?.state === s;
              return (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => onState(s)}
                    aria-current={active || undefined}
                    className={`focus-mist w-full rounded-md px-2 py-1 text-left text-micro transition-colors ${
                      active
                        ? "bg-bronze/10 text-bronze"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {STATE_LABEL[s][lang]}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
            {c.objects}
          </h2>
          {objects.length === 0 ? (
            <p className="text-micro leading-relaxed text-muted-foreground">{c.empty}</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(counts).map(([kind, n]) => (
                <li key={kind} className="flex items-baseline justify-between text-micro">
                  <span className={KIND_TONE[kind as keyof typeof KIND_TONE]}>
                    {KIND_LABEL[kind as keyof typeof KIND_LABEL][lang]}
                  </span>
                  <span className="text-muted-foreground">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {patterns.length > 0 && (
          <section className="space-y-2">
            <h2 className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
              {c.patterns}
            </h2>
            <ul className="space-y-1">
              {patterns.map((p) => (
                <li key={p.term} className="text-micro text-keep">
                  {p.term} · {p.count}
                </li>
              ))}
            </ul>
            <p className="text-micro leading-relaxed text-muted-foreground">{c.inThree}</p>
          </section>
        )}

        <section className="space-y-2 border-t border-border/40 pt-5">
          <button
            type="button"
            onClick={onOpenDecision}
            className="focus-mist block text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {c.decision}
          </button>
          <button
            type="button"
            onClick={onOpenMemory}
            className="focus-mist block text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {c.memory}
          </button>
          <Link
            to="/mi-mapa"
            className="focus-mist block text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {c.open}
          </Link>
        </section>
      </div>
    </aside>
  );
}
