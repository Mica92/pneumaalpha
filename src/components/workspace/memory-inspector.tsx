import { KIND_LABEL, KIND_TONE, type ThoughtObject } from "@/lib/workspace.shared";

const COPY = {
  es: {
    title: "Memoria",
    lead: "Pneum actualmente entiende que…",
    empty: "Todavía no hay nada guardado. Nada entra aquí sin que tú lo decidas.",
    inMap: "En tu mapa",
    addMap: "Añadir al mapa",
    removeMap: "Quitar del mapa",
    mute: "No volver a utilizar",
    unmute: "Volver a utilizar",
    remove: "Eliminar",
    close: "Cerrar",
    trust: ["Tú controlas tu pensamiento.", "Tus datos son tuyos.", "Nada se guarda sin que tú lo elijas."],
  },
  en: {
    title: "Memory",
    lead: "Pneum currently understands that…",
    empty: "Nothing is stored yet. Nothing lands here unless you decide it.",
    inMap: "In your map",
    addMap: "Add to map",
    removeMap: "Remove from map",
    mute: "Stop using this",
    unmute: "Use this again",
    remove: "Delete",
    close: "Close",
    trust: ["You control your thinking.", "Your data is yours.", "Nothing is stored unless you choose it."],
  },
} as const;

type Props = {
  lang: "es" | "en";
  open: boolean;
  objects: ThoughtObject[];
  onClose: () => void;
  onToggleMap: (o: ThoughtObject) => void;
  onToggleMute: (o: ThoughtObject) => void;
  onDelete: (o: ThoughtObject) => void;
};

export function MemoryInspector({
  lang,
  open,
  objects,
  onClose,
  onToggleMap,
  onToggleMute,
  onDelete,
}: Props) {
  if (!open) return null;
  const c = COPY[lang];

  return (
    <div
      className="fade-up fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-xl"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-label={c.title}
        className="flex h-full w-full max-w-lg flex-col border-l border-border/60 bg-background/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-border/60 px-6 py-5">
          <h2 className="font-display text-subtitle font-light text-foreground">{c.title}</h2>
          <p className="mt-1 text-micro leading-relaxed text-muted-foreground">{c.lead}</p>
          <ul className="mt-4 space-y-1 border-l border-bronze/50 pl-3 text-micro text-muted-foreground">
            {c.trust.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {objects.length === 0 ? (
            <p className="text-small leading-relaxed text-muted-foreground">{c.empty}</p>
          ) : (
            <ul className="space-y-5">
              {objects.map((o) => (
                <li key={o.id} className="border-b border-border/40 pb-4 last:border-b-0">
                  <p
                    className={`font-display text-micro uppercase tracking-[0.25em] ${KIND_TONE[o.kind]}`}
                  >
                    {KIND_LABEL[o.kind][lang]}
                    {o.in_map ? ` · ${c.inMap}` : ""}
                  </p>
                  <p
                    className={`mt-1.5 text-small leading-relaxed ${o.muted ? "text-muted-foreground/60 line-through" : "text-foreground/90"}`}
                  >
                    {o.text}
                  </p>
                  {o.rationale && (
                    <p className="mt-1 text-micro leading-relaxed text-muted-foreground">
                      {o.rationale}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleMap(o)}
                      className="focus-mist text-micro uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                    >
                      {o.in_map ? c.removeMap : c.addMap}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleMute(o)}
                      className="focus-mist text-micro uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
                    >
                      {o.muted ? c.unmute : c.mute}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(o)}
                      className="focus-mist text-micro uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
                    >
                      {c.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-border/60 px-6 py-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="focus-mist text-micro uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            {c.close}
          </button>
        </footer>
      </aside>
    </div>
  );
}
