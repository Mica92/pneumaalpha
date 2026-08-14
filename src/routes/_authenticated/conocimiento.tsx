import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import { KnowledgeMap, KIND_DOT } from "@/components/knowledge-map";
import {
  GRAPH_NODES,
  KIND_LABEL,
  LINK_LABEL,
  NODE_BY_ID,
  neighborsOf,
  type NodeKind,
} from "@/lib/knowledge-graph";

export const Route = createFileRoute("/_authenticated/conocimiento")({
  component: KnowledgePage,
  head: () => ({
    meta: [
      { title: "PneumaA — Conocimiento Universal · red de ideas y filósofos" },
      {
        name: "description",
        content:
          "Mapa neuronal interactivo de filósofos, ideas, movimientos e ideologías: explora influencias, oposiciones y linajes del pensamiento.",
      },
      { property: "og:title", content: "PneumaA — Conocimiento Universal" },
      {
        property: "og:description",
        content:
          "Una red viva de ideas: filósofos, corrientes e ideologías conectados por influencia y oposición.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const KINDS: NodeKind[] = ["philosopher", "idea", "movement", "ideology"];

function KnowledgePage() {
  const { lang, t } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kinds, setKinds] = useState<Set<NodeKind>>(new Set(KINDS));

  const node = selected ? NODE_BY_ID.get(selected) ?? null : null;
  const links = useMemo(() => (selected ? neighborsOf(selected) : []), [selected]);

  const toggleKind = (k: NodeKind) => {
    setKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k) && next.size > 1) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  return (
    <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-6 py-10 md:px-10 md:py-14">
      <nav className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <PneumaMark withWordmark size={24} />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link
            to="/"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("chat.back")}
          </Link>
        </div>
      </nav>

      <header className="mt-14 mb-8">
        <p className="tracking-in font-display text-[10px] uppercase tracking-[0.35em] text-glacier-bright">
          {t("knowledge.kicker")}
        </p>
        <h1 className="fade-up mt-4 max-w-3xl font-display text-3xl font-light leading-[1.1] text-foreground md:text-5xl">
          {t("knowledge.title")}
        </h1>
        <p className="fade-up mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("knowledge.sub")}
        </p>
      </header>

      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("knowledge.search")}
          aria-label={t("knowledge.search")}
          className="h-9 w-full max-w-xs rounded-md border border-border bg-card/40 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-glacier md:w-64"
        />
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => {
            const on = kinds.has(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKind(k)}
                aria-pressed={on}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  on
                    ? "border-glacier/70 bg-card/70 text-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[k]} ${on ? "" : "opacity-40"}`} />
                {KIND_LABEL[k][lang]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <KnowledgeMap selected={selected} onSelect={setSelected} activeKinds={kinds} query={query} />

        {/* Detail panel */}
        <aside className="flex max-h-[70vh] flex-col overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          {node ? (
            <div className="flex flex-col overflow-y-auto p-5">
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-glacier-bright">
                {KIND_LABEL[node.kind][lang]}
                {node.era ? ` · ${node.era}` : ""}
              </p>
              <h2 className="mt-2 font-display text-xl font-light leading-tight text-foreground">
                {node.label}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{node.note[lang]}</p>

              {node.chat && (
                <Link
                  to="/$philosopher"
                  params={{ philosopher: node.chat }}
                  className="mt-4 inline-flex items-center justify-center rounded-md border border-glacier/60 bg-glacier/10 px-3 py-2 font-display text-[11px] uppercase tracking-[0.25em] text-glacier-bright transition-colors hover:bg-glacier/20 hover:text-foreground"
                >
                  {t("knowledge.talk")}
                </Link>
              )}

              <p className="mt-6 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {t("knowledge.connections")} · {links.length}
              </p>
              <ul className="mt-2 space-y-1">
                {links.map((l, i) => (
                  <li key={`${l.node.id}-${i}`}>
                    <button
                      type="button"
                      onClick={() => setSelected(l.node.id)}
                      className="group flex w-full flex-col gap-0.5 rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-background/40"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {l.direction === "out"
                          ? LINK_LABEL[l.kind][lang]
                          : `← ${LINK_LABEL[l.kind][lang]}`}
                      </span>
                      <span className="flex items-center gap-2 text-sm text-foreground/85 group-hover:text-foreground">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[l.node.kind]}`} />
                        {l.node.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-center gap-3 p-6">
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {t("knowledge.empty.kicker")}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("knowledge.empty.body")}</p>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
                {GRAPH_NODES.length} {t("knowledge.nodes")}
              </p>
            </div>
          )}
        </aside>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/70">{t("knowledge.legend")}</p>

      <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span>PneumaA · {new Date().getFullYear()}</span>
        <Link to="/privacy" className="transition-colors hover:text-foreground">
          {lang === "es" ? "Privacidad" : "Privacy"}
        </Link>
      </footer>
    </main>
  );
}
