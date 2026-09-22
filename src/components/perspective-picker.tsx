import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { profileOf } from "@/lib/portraits";
import {
  ERA_LABELS,
  FACETS,
  FAMILY_LABELS,
  LEVEL_LABELS,
  LEVEL_ORDER,
  MOVEMENT_LABELS,
  POLITICS_LABELS,
  POLITICS_ORDER,
  REGION_LABELS,
  REGION_ORDER,
  TRADITION_LABELS,
  TRADITION_ORDER,
  eraOf,
  politicsOf,
  regionOf,
  traditionOf,
  type EraId,
  type FamilyId,
  type LevelId,
  type MovementId,
  type PoliticsId,
  type RegionId,
  type TraditionId,
} from "@/lib/discovery";
import { useI18n } from "@/lib/i18n";

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

export function PerspectivePicker({
  selected,
  max,
  onToggle,
  disabled = false,
  idPrefix = "picker",
}: {
  selected: PhilosopherId[];
  max: number;
  onToggle: (id: PhilosopherId) => void;
  disabled?: boolean;
  idPrefix?: string;
}) {
  const { lang } = useI18n();
  const es = lang === "es";

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortId>("az");
  const [families, setFamilies] = useState<FamilyId[]>([]);
  const [movements, setMovements] = useState<MovementId[]>([]);
  const [levels, setLevels] = useState<LevelId[]>([]);
  const [eras, setEras] = useState<EraId[]>([]);
  const [politics, setPolitics] = useState<PoliticsId[]>([]);
  const [regions, setRegions] = useState<RegionId[]>([]);
  const [traditions, setTraditions] = useState<TraditionId[]>([]);

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

  const regionIds = useMemo(
    () => REGION_ORDER.filter((r) => PHILOSOPHER_LIST.some((p) => regionOf(p.id) === r)),
    [],
  );
  const traditionIds = useMemo(
    () => TRADITION_ORDER.filter((t) => PHILOSOPHER_LIST.some((p) => traditionOf(p.id) === t)),
    [],
  );

  const toggleFilter = <T,>(list: T[], set: (v: T[]) => void, value: T) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const activeCount =
    (sort === "az" ? 0 : 1) +
    families.length +
    movements.length +
    levels.length +
    eras.length +
    politics.length +
    regions.length +
    traditions.length;

  const dirty = query !== "" || activeCount > 0;

  const clearAll = () => {
    setQuery("");
    setSort("az");
    setFamilies([]);
    setMovements([]);
    setLevels([]);
    setEras([]);
    setPolitics([]);
    setRegions([]);
    setTraditions([]);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = PHILOSOPHER_LIST.map((p) => p.id).filter((id) => {
      const facet = FACETS[id];
      const pol = politicsOf(id);
      const reg = regionOf(id);
      const trad = traditionOf(id);
      if (families.length && !families.some((f) => facet?.families.includes(f))) return false;
      if (movements.length && !movements.some((m) => facet?.movements.includes(m))) return false;
      if (levels.length && !levels.includes(facet?.level)) return false;
      if (eras.length && !eras.includes(eraOf(id))) return false;
      if (politics.length && (!pol || !politics.includes(pol))) return false;
      if (regions.length && (!reg || !regions.includes(reg))) return false;
      if (traditions.length && (!trad || !traditions.includes(trad))) return false;
      if (!q) return true;
      const p = PHILOSOPHER_LIST.find((x) => x.id === id);
      if (!p) return false;
      const profile = profileOf(id);
      const hay = [
        p.name,
        p.subtitle[lang],
        ...(profile?.expertise ?? []).map((e) => e[lang]),
        ...(facet?.families ?? []).map((f) => FAMILY_LABELS[f][lang]),
        ...(facet?.movements ?? []).map((m) => MOVEMENT_LABELS[m][lang]),
        pol ? POLITICS_LABELS[pol][lang] : "",
        reg ? REGION_LABELS[reg][lang] : "",
        trad ? TRADITION_LABELS[trad][lang] : "",
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
  }, [query, lang, sort, families, movements, levels, eras, politics, regions, traditions]);

  const panelId = `${idPrefix}-filters`;
  const hidden = selected.filter((id) => !results.includes(id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="sr-only" htmlFor={`${idPrefix}-search`}>
          {es ? "Buscar perspectiva" : "Search perspective"}
        </label>
        <input
          id={`${idPrefix}-search`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={es ? "Buscar: libertad, poder, duelo…" : "Search: freedom, power, grief…"}
          className="page-form focus-mist w-full max-w-sm px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground/70"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
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
        id={panelId}
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

          <FilterGroup label={es ? "Movimiento" : "Movement"}>
            {movementIds.map((m) => (
              <FilterChip
                key={m}
                active={movements.includes(m)}
                onClick={() => toggleFilter(movements, setMovements, m)}
              >
                {MOVEMENT_LABELS[m][lang]}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup
            label={es ? "Origen" : "Origin"}
            hint={
              es
                ? "Lectura orientativa del origen cultural."
                : "Indicative reading of cultural origin."
            }
          >
            {regionIds.map((r) => (
              <FilterChip
                key={r}
                active={regions.includes(r)}
                onClick={() => toggleFilter(regions, setRegions, r)}
              >
                {REGION_LABELS[r][lang]}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup
            label={es ? "Religión o tradición" : "Religion or tradition"}
            hint={
              es
                ? "Sólo perspectivas con una tradición reconocible."
                : "Only perspectives with a recognisable tradition."
            }
          >
            {traditionIds.map((t) => (
              <FilterChip
                key={t}
                active={traditions.includes(t)}
                onClick={() => toggleFilter(traditions, setTraditions, t)}
              >
                {TRADITION_LABELS[t][lang]}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup
            label={es ? "Espectro político" : "Political spectrum"}
            hint={
              es
                ? "Lectura orientativa; sólo perspectivas con carga política."
                : "Indicative reading; only politically charged perspectives."
            }
          >
            {POLITICS_ORDER.map((p) => (
              <FilterChip
                key={p}
                active={politics.includes(p)}
                onClick={() => toggleFilter(politics, setPolitics, p)}
              >
                {POLITICS_LABELS[p][lang]}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label={es ? "Ámbito" : "Field"}>
            {FAMILY_IDS.map((f) => (
              <FilterChip
                key={f}
                active={families.includes(f)}
                onClick={() => toggleFilter(families, setFamilies, f)}
              >
                {FAMILY_LABELS[f][lang]}
              </FilterChip>
            ))}
          </FilterGroup>

          <FilterGroup label={es ? "Época" : "Era"}>
            {ERA_IDS.map((e) => (
              <FilterChip
                key={e}
                active={eras.includes(e)}
                onClick={() => toggleFilter(eras, setEras, e)}
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
                onClick={() => toggleFilter(levels, setLevels, l)}
              >
                {LEVEL_LABELS[l][lang]}
              </FilterChip>
            ))}
          </FilterGroup>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p aria-live="polite" className="text-micro text-muted-foreground">
          {results.length} {es ? "perspectivas" : "perspectives"}
        </p>
        {dirty && (
          <button
            type="button"
            onClick={clearAll}
            className="focus-mist text-micro uppercase tracking-[0.2em] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {es ? "Limpiar filtros" : "Clear filters"}
          </button>
        )}
      </div>

      <ul className="flex flex-wrap gap-2">
        {[...hidden, ...results].map((id) => {
          const p = PHILOSOPHER_LIST.find((x) => x.id === id);
          if (!p) return null;
          const active = selected.includes(id);
          const blocked = !active && selected.length >= max;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onToggle(id)}
                disabled={blocked || disabled}
                aria-pressed={active}
                className={`focus-mist rounded-full border px-3 py-1.5 text-micro transition-colors disabled:opacity-30 ${
                  active
                    ? "border-bronze bg-bronze/15 text-foreground"
                    : "border-border/70 text-muted-foreground hover:border-bronze/50 hover:text-foreground"
                }`}
              >
                <span aria-hidden="true" className="mr-1.5">
                  {p.glyph}
                </span>
                {p.name}
              </button>
            </li>
          );
        })}
      </ul>

      {results.length === 0 && hidden.length === 0 && (
        <p className="text-small text-muted-foreground">
          {es
            ? "Ninguna perspectiva coincide con estos filtros."
            : "No perspective matches these filters."}
        </p>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
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
  children: ReactNode;
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
