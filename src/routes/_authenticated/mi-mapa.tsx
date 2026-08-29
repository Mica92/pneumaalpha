import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  AtlasCanvas,
  type AtlasViewLink,
  type AtlasViewNode,
} from "@/components/atlas/atlas-canvas";
import { AtlasPanel } from "@/components/atlas/atlas-panel";
import { useI18n } from "@/lib/i18n";
import { useJourney } from "@/lib/atlas/use-journey";
import {
  ATLAS_RELATIONS,
  ENTITY_BY_ID,
  expansionOf,
  suggestionsFrom,
  type EntityKind,
} from "@/lib/atlas";

export const Route = createFileRoute("/_authenticated/mi-mapa")({
  component: PersonalMapPage,
  head: () => ({
    meta: [
      { title: "Tu Mapa Filosófico — Pneum" },
      {
        name: "description",
        content:
          "El mapa de tu propio recorrido: las mentes, ideas y preguntas que has explorado, y hacia dónde podrías seguir.",
      },
      { property: "og:title", content: "Tu Mapa Filosófico — Pneum" },
      {
        property: "og:description",
        content: "Tu recorrido intelectual, dibujado como una constelación que crece contigo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const SELF_ID = "__self__";

const COPY = {
  kicker: { es: "Tu constelación", en: "Your constellation" },
  title: { es: "Tu Mapa Filosófico", en: "Your Philosophical Map" },
  sub: {
    es: "Cada conversación deja una huella. Este mapa crece contigo: muestra lo que has explorado y hacia dónde se abre.",
    en: "Every conversation leaves a trace. This map grows with you: what you have explored, and where it opens next.",
  },
  you: { es: "Tú", en: "You" },
  youNote: {
    es: "El centro de tu recorrido. Todo lo que exploras se conecta aquí.",
    en: "The center of your journey. Everything you explore connects here.",
  },
  emptyTitle: { es: "Tu mapa está vacío", en: "Your map is empty" },
  emptyBody: {
    es: "Empieza una conversación o añade un nodo desde el mapa universal, y tu constelación comenzará a formarse.",
    en: "Start a conversation or add a node from the universal map, and your constellation will begin to form.",
  },
  goExplore: { es: "Ir al mapa universal", en: "Go to the universal map" },
  next: { es: "Siguientes pasos", en: "Next steps" },
  loading: { es: "Cargando tu mapa…", en: "Loading your map…" },
  remove: { es: "Quitar del mapa", en: "Remove from map" },
} as const;

function PersonalMapPage() {
  const { lang } = useI18n();
  const { nodes: journey, isLoading, add, remove } = useJourney();
  const [selected, setSelected] = useState<string | null>(null);

  const byId = useMemo(() => new Map(journey.map((n) => [n.entityId, n])), [journey]);

  const viewNodes: AtlasViewNode[] = useMemo(() => {
    const maxCount = Math.max(1, ...journey.map((n) => n.count));
    const list: AtlasViewNode[] = [
      { id: SELF_ID, kind: "self", label: COPY.you[lang], weight: 1, pinned: true },
    ];
    for (const n of journey) {
      const e = ENTITY_BY_ID.get(n.entityId);
      if (!e) continue;
      list.push({
        id: n.entityId,
        kind: e.kind,
        label: e.label[lang],
        weight: n.count / maxCount,
        visited: true,
      });
    }
    return list;
  }, [journey, lang]);

  const viewLinks: AtlasViewLink[] = useMemo(() => {
    const present = new Set(viewNodes.map((n) => n.id));
    const links: AtlasViewLink[] = journey
      .filter((n) => present.has(n.entityId))
      .map((n) => ({ source: SELF_ID, target: n.entityId, kind: "relatedTo" as const }));
    for (const r of ATLAS_RELATIONS) {
      if (present.has(r.source) && present.has(r.target)) {
        links.push({ source: r.source, target: r.target, kind: r.kind });
      }
    }
    return links;
  }, [journey, viewNodes]);

  const suggestions = useMemo(() => {
    const owned = new Set(journey.map((n) => n.entityId));
    const out = new Map<string, { id: string; label: string; kind: EntityKind; from: string }>();
    for (const n of journey.slice(0, 6)) {
      for (const s of suggestionsFrom(n.entityId, owned, 2)) {
        if (owned.has(s.id) || out.has(s.id)) continue;
        const source = ENTITY_BY_ID.get(n.entityId);
        out.set(s.id, {
          id: s.id,
          label: s.label[lang],
          kind: s.kind,
          from: source ? source.label[lang] : "",
        });
      }
      if (out.size >= 6) break;
    }
    if (out.size === 0) {
      for (const n of journey.slice(0, 3)) {
        for (const e of expansionOf(n.entityId, 3)) {
          if (!owned.has(e.id) && !out.has(e.id)) {
            out.set(e.id, {
              id: e.id,
              label: e.entity.label[lang],
              kind: e.entity.kind,
              from: ENTITY_BY_ID.get(n.entityId)?.label[lang] ?? "",
            });
          }
        }
      }
    }
    return [...out.values()].slice(0, 6);
  }, [journey, lang]);

  const handleSelect = useCallback((id: string | null) => {
    setSelected(id === SELF_ID ? null : id);
  }, []);

  const entity = selected ? (ENTITY_BY_ID.get(selected) ?? null) : null;
  const record = selected ? byId.get(selected) : undefined;

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mb-8 mt-14">
          <p className="label text-primary">{COPY.kicker[lang]}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-title font-light text-foreground">
            {COPY.title[lang]}
          </h1>
          <p className="mt-5 max-w-2xl text-small leading-relaxed text-muted-foreground md:text-base">
            {COPY.sub[lang]}
          </p>
        </header>

        {isLoading ? (
          <p className="text-small text-muted-foreground">{COPY.loading[lang]}</p>
        ) : journey.length === 0 ? (
          <div className="card-editorial max-w-xl p-8">
            <h2 className="font-serif text-subtitle font-light text-foreground">
              {COPY.emptyTitle[lang]}
            </h2>
            <p className="mt-3 text-small leading-relaxed text-muted-foreground">
              {COPY.emptyBody[lang]}
            </p>
            <Link to="/explorar" className="btn-gold mt-6 inline-flex">
              {COPY.goExplore[lang]}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
              <AtlasCanvas
                nodes={viewNodes}
                links={viewLinks}
                focus={selected}
                onSelect={handleSelect}
                className="relative h-[62vh] min-h-[420px] w-full overflow-hidden rounded-xl border border-border bg-card/30 backdrop-blur-sm md:h-[72vh]"
              />

              {entity ? (
                <div className="flex flex-col gap-2">
                  <AtlasPanel
                    entity={entity}
                    onSelect={handleSelect}
                    onClose={() => setSelected(null)}
                    reason={record?.reason ?? undefined}
                    count={record?.count}
                  />
                  {record && (
                    <button
                      type="button"
                      onClick={() => {
                        remove(entity.id);
                        setSelected(null);
                      }}
                      className="self-start text-micro text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {COPY.remove[lang]}
                    </button>
                  )}
                </div>
              ) : (
                <aside className="card-editorial flex flex-col justify-center gap-3 p-6">
                  <p className="label text-muted-foreground">{COPY.you[lang]}</p>
                  <p className="text-small leading-relaxed text-muted-foreground">
                    {COPY.youNote[lang]}
                  </p>
                </aside>
              )}
            </div>

            {suggestions.length > 0 && (
              <section className="mt-10">
                <p className="label text-primary">{COPY.next[lang]}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        add(
                          s.id,
                          s.kind,
                          lang === "es" ? `Sugerido desde ${s.from}.` : `Suggested from ${s.from}.`,
                        )
                      }
                      className="card-editorial p-4 text-left transition-colors hover:border-primary/50"
                    >
                      <p className="font-serif text-lg font-light text-foreground">{s.label}</p>
                      <p className="mt-1 text-micro text-muted-foreground">
                        {lang === "es" ? `Desde ${s.from}` : `From ${s.from}`}
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
