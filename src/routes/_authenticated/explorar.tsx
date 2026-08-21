import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AtlasCanvas, type AtlasViewLink, type AtlasViewNode } from "@/components/atlas/atlas-canvas";
import { AtlasPanel } from "@/components/atlas/atlas-panel";
import { useI18n } from "@/lib/i18n";
import { useJourney } from "@/lib/atlas/use-journey";
import {
  ATLAS_RELATIONS,
  DOMAINS,
  ENTITY_BY_ID,
  expansionOf,
  degreeOf,
  kindLabel,
  searchAtlas,
  type EntityKind,
} from "@/lib/atlas";

export const Route = createFileRoute("/_authenticated/explorar")({
  component: ExplorePage,
  head: () => ({
    meta: [
      { title: "Explora el Pensamiento Humano — PneumaA" },
      {
        name: "description",
        content:
          "Un mapa vivo del pensamiento: dominios, filósofos, conceptos y preguntas conectados por influencia, oposición y desarrollo.",
      },
      { property: "og:title", content: "Explora el Pensamiento Humano — PneumaA" },
      {
        property: "og:description",
        content: "Navega el conocimiento filosófico como un territorio y conversa desde cada nodo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const COPY = {
  kicker: { es: "Cartografía", en: "Cartography" },
  title: { es: "Explora el Pensamiento Humano", en: "Explore Human Thought" },
  sub: {
    es: "Empieza por un gran dominio. Cada nodo abre lo que lo rodea: quién lo pensó, contra quién, y qué pregunta lo sostiene.",
    en: "Start from a great domain. Each node opens what surrounds it: who thought it, against whom, and which question sustains it.",
  },
  search: { es: "Buscar una idea, un filósofo, una pregunta…", en: "Search an idea, a thinker…" },
  domains: { es: "Dominios", en: "Domains" },
  reset: { es: "Volver al inicio", en: "Back to start" },
  empty: {
    es: "Toca un dominio para desplegar su territorio. Toca una línea para leer la relación entre dos mentes.",
    en: "Tap a domain to unfold its territory. Tap a line to read the relation between two minds.",
  },
  hint: { es: "Cómo leerlo", en: "How to read it" },
} as const;

const MAX_NODES = 90;

function ExplorePage() {
  const { lang } = useI18n();
  const { nodes: journeyNodes, add } = useJourney();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(DOMAINS.map((d) => d.id)));
  const [selected, setSelected] = useState<string | null>(null);
  const [relation, setRelation] = useState<{ source: string; target: string } | null>(null);
  const [query, setQuery] = useState("");

  const visitedIds = useMemo(
    () => new Set(journeyNodes.map((n) => n.entityId)),
    [journeyNodes],
  );

  const visible = useMemo(() => {
    const ids = new Set<string>(DOMAINS.map((d) => d.id));
    for (const id of expanded) {
      ids.add(id);
      for (const n of expansionOf(id, 8)) {
        if (ids.size >= MAX_NODES) break;
        ids.add(n.id);
      }
    }
    if (selected) ids.add(selected);
    return ids;
  }, [expanded, selected]);

  const viewNodes: AtlasViewNode[] = useMemo(
    () =>
      [...visible].flatMap((id) => {
        const e = ENTITY_BY_ID.get(id);
        if (!e) return [];
        return [
          {
            id,
            kind: e.kind,
            label: e.label[lang],
            weight: Math.min(1, degreeOf(id) / 24),
            visited: visitedIds.has(id),
          },
        ];
      }),
    [visible, lang, visitedIds],
  );

  const viewLinks: AtlasViewLink[] = useMemo(
    () =>
      ATLAS_RELATIONS.filter((r) => visible.has(r.source) && visible.has(r.target)).map((r) => ({
        source: r.source,
        target: r.target,
        kind: r.kind,
      })),
    [visible],
  );

  const handleSelect = useCallback((id: string | null) => {
    setRelation(null);
    setSelected(id);
    if (id) setExpanded((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const handleLink = useCallback((source: string, target: string) => {
    setSelected(null);
    setRelation({ source, target });
  }, []);

  const entity = selected ? (ENTITY_BY_ID.get(selected) ?? null) : null;
  const results = useMemo(() => searchAtlas(query, lang, 6), [query, lang]);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mb-8 mt-14">
          <p className="label text-primary">{COPY.kicker[lang]}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-light leading-[1.05] text-foreground md:text-6xl">
            {COPY.title[lang]}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {COPY.sub[lang]}
          </p>
        </header>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-sm">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={COPY.search[lang]}
              aria-label={COPY.search[lang]}
              className="h-10 w-full rounded-md border border-border bg-card/40 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
            />
            {results.length > 0 && query.trim() && (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-background/95 backdrop-blur">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelect(r.id);
                        setQuery("");
                      }}
                      className="flex w-full flex-col px-3 py-2 text-left transition-colors hover:bg-card/70"
                    >
                      <span className="text-sm text-foreground">{r.label[lang]}</span>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {kindLabel(r.kind as EntityKind, lang)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            className="btn-ghost-gold"
            onClick={() => {
              setExpanded(new Set(DOMAINS.map((d) => d.id)));
              setSelected(null);
              setRelation(null);
            }}
          >
            {COPY.reset[lang]}
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
          <AtlasCanvas
            nodes={viewNodes}
            links={viewLinks}
            focus={selected}
            onSelect={handleSelect}
            onSelectLink={handleLink}
            className="relative h-[64vh] min-h-[440px] w-full overflow-hidden rounded-xl border border-border bg-card/30 backdrop-blur-sm md:h-[76vh]"
          />

          {entity || relation ? (
            <AtlasPanel
              entity={entity}
              relation={relation}
              onSelect={handleSelect}
              onClose={() => {
                setSelected(null);
                setRelation(null);
              }}
              onAdd={
                entity
                  ? (id) => {
                      const e = ENTITY_BY_ID.get(id);
                      add(
                        id,
                        e?.kind ?? "concept",
                        lang === "es"
                          ? "Lo añadiste desde el mapa universal."
                          : "You added it from the universal map.",
                      );
                    }
                  : undefined
              }
            />
          ) : (
            <aside className="card-editorial flex flex-col justify-center gap-3 p-6">
              <p className="label text-muted-foreground">{COPY.hint[lang]}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{COPY.empty[lang]}</p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
                {viewNodes.length} / {ATLAS_RELATIONS.length}
              </p>
            </aside>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
