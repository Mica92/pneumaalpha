import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { profileOf } from "@/lib/portraits";
import {
  CATEGORIES,
  ERA_LABELS,
  FACETS,
  FAMILY_LABELS,
  LEVEL_LABELS,
  LEVEL_ORDER,
  MOVEMENT_LABELS,
  POLITICS_LABELS,
  POLITICS_ORDER,
  eraOf,
  politicsOf,
  type CategoryId,
  type EraId,
  type FamilyId,
  type LevelId,
  type MovementId,
  type PoliticsId,
} from "@/lib/discovery";
import { PhilosopherCard } from "@/components/philosopher-card";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";

const COUNT = PHILOSOPHER_LIST.length;

export const Route = createFileRoute("/_authenticated/filosofos/")({
  component: PhilosophersIndex,
  head: () => ({
    meta: [
      { title: "Filósofos — Pneum" },
      {
        name: "description",
        content: `${COUNT} conciencias filosóficas reconstruidas: quién es cada una, qué pregunta la mueve y de qué puedes hablar con ella.`,
      },
      { property: "og:title", content: "Filósofos — Pneum" },
      {
        property: "og:description",
        content: "Explora las mentes por tema, época o pregunta central y empieza a conversar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type SortId = "az" | "za" | "era-asc" | "era-desc" | "level-asc" | "level-desc";

const SORTS: { id: SortId; label: { es: string; en: string } }[] = [
  { id: "az", label: { es: "A–Z", en: "A–Z" } },
  { id: "za", label: { es: "Z–A", en: "Z–A" } },
  { id: "era-asc", label: { es: "Época: antiguos primero", en: "Era: oldest first" } },
  { id: "era-desc", label: { es: "Época: recientes primero", en: "Era: newest first" } },
  { id: "level-asc", label: { es: "Principiantes primero", en: "Beginners first" } },
  { id: "level-desc", label: { es: "Avanzados primero", en: "Advanced first" } },
];

const FAMILY_IDS = Object.keys(FAMILY_LABELS) as FamilyId[];
const LEVEL_IDS = Object.keys(LEVEL_LABELS) as LevelId[];
const ERA_IDS = Object.keys(ERA_LABELS) as EraId[];

function PhilosophersIndex() {
  const { lang } = useI18n();
  const es = lang === "es";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortId>("az");
  const [families, setFamilies] = useState<FamilyId[]>([]);
  const [movements, setMovements] = useState<MovementId[]>([]);
  const [levels, setLevels] = useState<LevelId[]>([]);
  const [eras, setEras] = useState<EraId[]>([]);
  const [politics, setPolitics] = useState<PoliticsId[]>([]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const movementIds = useMemo(() => {
    const used = new Set<MovementId>();
    for (const p of PHILOSOPHER_LIST) {
      for (const m of FACETS[p.id]?.movements ?? []) used.add(m);
    }
    return (Object.keys(MOVEMENT_LABELS) as MovementId[]).filter((m) => used.has(m));
  }, []);

  const toggle = <T,>(list: T[], set: (v: T[]) => void, value: T) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const activeCount =
    (cat === "all" ? 0 : 1) +
    (sort === "az" ? 0 : 1) +
    families.length +
    movements.length +
    levels.length +
    eras.length +
    politics.length;

  const dirty = query !== "" || activeCount > 0;

  const clearAll = () => {
    setQuery("");
    setCat("all");
    setSort("az");
    setFamilies([]);
    setMovements([]);
    setLevels([]);
    setEras([]);
    setPolitics([]);
  };


  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool =
      cat === "all"
        ? PHILOSOPHER_LIST.map((p) => p.id)
        : (CATEGORIES.find((c) => c.id === cat)?.philosophers ?? []);

    const filtered = (pool as PhilosopherId[]).filter((id) => {
      const facet = FACETS[id];
      const pol = politicsOf(id);
      if (families.length && !families.some((f) => facet?.families.includes(f))) return false;
      if (movements.length && !movements.some((m) => facet?.movements.includes(m))) return false;
      if (levels.length && !levels.includes(facet?.level)) return false;
      if (eras.length && !eras.includes(eraOf(id))) return false;
      if (politics.length && (!pol || !politics.includes(pol))) return false;
      if (!q) return true;
      const p = PHILOSOPHER_LIST.find((x) => x.id === id);
      if (!p) return false;
      const profile = profileOf(id);
      const hay = [
        p.name,
        p.subtitle[lang],
        p.blurb[lang],
        profile?.years ?? "",
        ...(profile?.expertise ?? []).map((e) => e[lang]),
        ...(facet?.families ?? []).map((f) => FAMILY_LABELS[f][lang]),
        ...(facet?.movements ?? []).map((m) => MOVEMENT_LABELS[m][lang]),
        pol ? POLITICS_LABELS[pol][lang] : "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    const nameOf = (id: PhilosopherId) => PHILOSOPHER_LIST.find((x) => x.id === id)?.name ?? "";
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "az":
          return nameOf(a).localeCompare(nameOf(b), lang);
        case "za":
          return nameOf(b).localeCompare(nameOf(a), lang);
        case "era-asc":
          return (FACETS[a]?.year ?? 0) - (FACETS[b]?.year ?? 0);
        case "era-desc":
          return (FACETS[b]?.year ?? 0) - (FACETS[a]?.year ?? 0);
        case "level-asc":
          return (
            LEVEL_ORDER[FACETS[a]?.level ?? "mid"] - LEVEL_ORDER[FACETS[b]?.level ?? "mid"] ||
            nameOf(a).localeCompare(nameOf(b), lang)
          );
        case "level-desc":
          return (
            LEVEL_ORDER[FACETS[b]?.level ?? "mid"] - LEVEL_ORDER[FACETS[a]?.level ?? "mid"] ||
            nameOf(a).localeCompare(nameOf(b), lang)
          );
        default:
          return 0;
      }
    });
    return sorted;
  }, [query, cat, lang, sort, families, movements, levels, eras, politics]);

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10">
        <div className="mx-auto max-w-6xl px-5 pt-14 md:px-8 md:pt-20">
          <p className="label">{es ? "Las mentes" : "The minds"}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-title font-light text-foreground">
            {es
              ? `${COUNT} maneras de pensar tu vida`
              : `${COUNT} ways to think your life`}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            {es
              ? "No necesitas saber quiénes son. Elige la pregunta que te inquieta y encontrarás a alguien que lleva siglos dándole vueltas."
              : "You don't need to know who they are. Pick the question that unsettles you and you'll find someone who has been circling it for centuries."}
          </p>

          <div className="mt-10 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="sr-only" htmlFor="philosopher-search">
                {es ? "Buscar filósofo o tema" : "Search philosopher or theme"}
              </label>
              <input
                id="philosopher-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  es ? "Buscar: libertad, muerte, poder…" : "Search: freedom, death, power…"
                }
                className="focus-mist w-full max-w-md rounded-md border border-border/70 bg-input px-4 py-3 text-small text-foreground placeholder:text-muted-foreground/70"
              />

              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="philosopher-filters"
                className={`focus-mist inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-micro uppercase tracking-[0.22em] backdrop-blur-md transition-all ${
                  open || activeCount > 0
                    ? "border-bronze/60 bg-bronze/12 text-foreground shadow-[0_0_24px_-12px_var(--bronze)]"
                    : "border-border/70 bg-card/30 text-muted-foreground hover:border-bronze/40 hover:text-foreground"
                }`}
              >
                <span aria-hidden="true" className="text-bronze">
                  ◈
                </span>
                {es ? "Filtros" : "Filters"}
                {activeCount > 0 && (
                  <span className="rounded-full border border-bronze/50 bg-bronze/15 px-1.5 py-0.5 text-[0.65em] leading-none text-foreground">
                    {activeCount}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                >
                  ▾
                </span>
              </button>
            </div>

            <div
              id="philosopher-filters"
              hidden={!open}
              className="fade-up relative overflow-hidden rounded-xl border border-bronze/25 bg-background/55 p-5 backdrop-blur-xl md:p-6"
              style={{
                backgroundImage:
                  "radial-gradient(120% 100% at 0% 0%, color-mix(in oklab, var(--bronze) 8%, transparent), transparent 60%)",
              }}
            >
              <div className="rule-hairline absolute inset-x-0 top-0" aria-hidden="true" />
              <div className="grid gap-6 md:grid-cols-2">
                <FilterGroup label={es ? "Ordenar por" : "Sort by"}>
                  {SORTS.map((s) => (
                    <FilterChip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>
                      {s.label[lang]}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup label={es ? "Camino" : "Path"}>
                  <FilterChip active={cat === "all"} onClick={() => setCat("all")}>
                    {es ? "Todos" : "All"}
                  </FilterChip>
                  {CATEGORIES.map((c) => (
                    <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                      <span aria-hidden="true" className="mr-1.5 text-bronze">
                        {c.glyph}
                      </span>
                      {c.title[lang]}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup label={es ? "Ámbito" : "Field"}>
                  {FAMILY_IDS.map((f) => (
                    <FilterChip
                      key={f}
                      active={families.includes(f)}
                      onClick={() => toggle(families, setFamilies, f)}
                    >
                      {FAMILY_LABELS[f][lang]}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup
                  label={es ? "Posición política" : "Political position"}
                  hint={
                    es
                      ? "Lectura orientativa; sólo mentes con carga política."
                      : "Indicative reading; only politically charged minds."
                  }
                >
                  {POLITICS_ORDER.map((p) => (
                    <FilterChip
                      key={p}
                      active={politics.includes(p)}
                      onClick={() => toggle(politics, setPolitics, p)}
                    >
                      {POLITICS_LABELS[p][lang]}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup label={es ? "Movimiento" : "Movement"}>
                  {movementIds.map((m) => (
                    <FilterChip
                      key={m}
                      active={movements.includes(m)}
                      onClick={() => toggle(movements, setMovements, m)}
                    >
                      {MOVEMENT_LABELS[m][lang]}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup label={es ? "Época" : "Era"}>
                  {ERA_IDS.map((e) => (
                    <FilterChip
                      key={e}
                      active={eras.includes(e)}
                      onClick={() => toggle(eras, setEras, e)}
                    >
                      {ERA_LABELS[e][lang]}
                    </FilterChip>
                  ))}
                </FilterGroup>

                <FilterGroup label={es ? "Nivel" : "Level"}>
                  {LEVEL_IDS.map((l) => (
                    <FilterChip
                      key={l}
                      active={levels.includes(l)}
                      onClick={() => toggle(levels, setLevels, l)}
                    >
                      {LEVEL_LABELS[l][lang]}
                    </FilterChip>
                  ))}
                </FilterGroup>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p aria-live="polite" className="text-micro text-muted-foreground">
                {results.length} {es ? "mentes" : "minds"}
              </p>
              {dirty && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="focus-mist text-micro text-bronze underline-offset-4 hover:underline"
                >
                  {es ? "Limpiar filtros" : "Clear filters"}
                </button>
              )}
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          {results.length === 0 ? (
            <p className="text-small text-muted-foreground">
              {es ? "Ninguna mente coincide con esa búsqueda." : "No mind matches that search."}
            </p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((id) => (
                <li key={id}>
                  <PhilosopherCard id={id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="label">{label}</p>
      {hint && <p className="-mt-1 text-micro text-muted-foreground/70">{hint}</p>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}



function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-mist rounded-full border px-3.5 py-1.5 text-micro transition-colors ${
        active
          ? "border-bronze/60 bg-bronze/12 text-foreground"
          : "border-border/70 text-muted-foreground hover:border-bronze/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
