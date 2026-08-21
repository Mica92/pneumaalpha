import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import {
  ENTITY_BY_ID,
  contextPrompt,
  expansionOf,
  kindLabel,
  nearestChat,
  philosopherName,
  relationBetween,
  relationLabel,
  relationNote,
  suggestionsFrom,
  type AtlasEntity,
} from "@/lib/atlas";
import { PORTRAITS } from "@/lib/portraits";

const COPY = {
  close: { es: "Cerrar", en: "Close" },
  talk: { es: "Conversar", en: "Talk" },
  talkAbout: { es: "Hablar con", en: "Talk with" },
  explore: { es: "Explorar ideas", en: "Explore ideas" },
  connections: { es: "Conexiones", en: "Connections" },
  alsoExplore: { es: "También podrías explorar", en: "You could also explore" },
  why: { es: "¿Por qué aparece aquí?", en: "Why is it here?" },
  relation: { es: "Relación intelectual", en: "Intellectual relation" },
  exploreRelation: { es: "Explorar esta relación", en: "Explore this relation" },
  times: { es: "conversaciones", en: "conversations" },
  addToMap: { es: "Añadir a mi mapa", en: "Add to my map" },
} as const;

type Props = {
  entity: AtlasEntity | null;
  relation?: { source: string; target: string } | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onAdd?: (id: string) => void;
  /** Motivo por el que el nodo está en el mapa personal. */
  reason?: string | undefined;
  /** Número de conversaciones registradas con esta mente. */
  count?: number | undefined;
};

export function AtlasPanel({ entity, relation, onSelect, onClose, onAdd, reason, count }: Props) {
  const { lang } = useI18n();

  if (relation) {
    const a = ENTITY_BY_ID.get(relation.source);
    const b = ENTITY_BY_ID.get(relation.target);
    const rel = relationBetween(relation.source, relation.target);
    if (!a || !b || !rel) return null;
    return (
      <Shell onClose={onClose}>
        <p className="label text-primary">{COPY.relation[lang]}</p>
        <h2 className="mt-3 font-serif text-2xl font-light leading-tight text-foreground">
          {a.label[lang]} <span className="text-primary">→</span> {b.label[lang]}
        </h2>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {relationLabel(rel.kind, lang)}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {relationNote(rel.kind, lang)}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn-ghost-gold" onClick={() => onSelect(a.id)}>
            {a.label[lang]}
          </button>
          <button type="button" className="btn-ghost-gold" onClick={() => onSelect(b.id)}>
            {b.label[lang]}
          </button>
        </div>
      </Shell>
    );
  }

  if (!entity) return null;

  const chat = nearestChat(entity.id);
  const portrait = entity.chat ? PORTRAITS[entity.chat] : undefined;
  const neighbours = expansionOf(entity.id, 10);
  const suggestions = suggestionsFrom(entity.id, new Set(neighbours.map((n) => n.id)), 3);
  const prompt = contextPrompt(entity.id, lang);

  return (
    <Shell onClose={onClose}>
      <div className="flex items-start gap-4">
        {portrait && (
          <img
            src={portrait}
            alt={entity.label[lang]}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-full object-cover grayscale"
          />
        )}
        <div>
          <p className="label text-primary">
            {kindLabel(entity.kind, lang)}
            {entity.era ? ` · ${entity.era}` : ""}
          </p>
          <h2 className="mt-2 font-serif text-2xl font-light leading-tight text-foreground">
            {entity.label[lang]}
          </h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{entity.note[lang]}</p>

      {reason && (
        <div className="mt-5 rounded-lg border border-border/70 bg-background/40 p-3">
          <p className="label text-muted-foreground">{COPY.why[lang]}</p>
          <p className="mt-1 text-sm text-foreground/85">{reason}</p>
        </div>
      )}

      {typeof count === "number" && count > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {count} {COPY.times[lang]}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {chat && (
          <Link
            to="/$philosopher"
            params={{ philosopher: chat }}
            search={{ q: prompt }}
            className="btn-gold"
          >
            {entity.chat ? COPY.talk[lang] : `${COPY.talkAbout[lang]} ${philosopherName(chat)}`}
          </Link>
        )}
        {onAdd && (
          <button type="button" className="btn-ghost-gold" onClick={() => onAdd(entity.id)}>
            {COPY.addToMap[lang]}
          </button>
        )}
      </div>

      <p className="label mt-8 text-muted-foreground">
        {COPY.connections[lang]} · {neighbours.length}
      </p>
      <ul className="mt-2 space-y-1">
        {neighbours.map((n) => (
          <li key={`${n.id}-${n.kind}-${n.direction}`}>
            <button
              type="button"
              onClick={() => onSelect(n.id)}
              className="group flex w-full flex-col gap-0.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-background/40"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {n.direction === "out"
                  ? relationLabel(n.kind, lang)
                  : `← ${relationLabel(n.kind, lang)}`}
              </span>
              <span className="text-sm text-foreground/85 group-hover:text-foreground">
                {n.entity.label[lang]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {suggestions.length > 0 && (
        <>
          <p className="label mt-8 text-muted-foreground">{COPY.alsoExplore[lang]}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
              >
                {s.label[lang]}
              </button>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const { lang } = useI18n();
  return (
    <aside className="card-editorial relative flex max-h-[70vh] flex-col overflow-y-auto p-5 md:max-h-[76vh]">
      <button
        type="button"
        onClick={onClose}
        aria-label={COPY.close[lang]}
        className="absolute right-3 top-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ✕
      </button>
      {children}
    </aside>
  );
}
