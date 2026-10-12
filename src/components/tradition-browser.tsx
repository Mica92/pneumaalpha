import { useMemo, useState } from "react";
import {
  TRADITIONS,
  TRADITION_FAMILIES,
  type TraditionFamilyId,
} from "@/lib/traditions";
import { useI18n } from "@/lib/i18n";

const PAGE_SIZE = 8;

export type TraditionBrowserProps = {
  mode: "single" | "multi";
  selected: string[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  maxSelect?: number;
};

/**
 * Buscador + filtro por familia + listado compacto paginado de corrientes.
 * Reutilizado por el catálogo (selección única) y por Contrastar (multiselección).
 */
export function TraditionBrowser({
  mode,
  selected,
  onToggle,
  onOpen,
  maxSelect = 3,
}: TraditionBrowserProps) {
  const { lang } = useI18n();
  const es = lang === "es";
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<"all" | TraditionFamilyId>("all");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    return TRADITIONS.filter((t) => family === "all" || t.family === family)
      .filter((t) => {
        if (!q) return true;
        const hay = `${t.name.es} ${t.name.en} ${t.tagline.es} ${t.tagline.en} ${t.concepts.join(" ")}`.toLocaleLowerCase(lang);
        return hay.includes(q);
      })
      .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang));
  }, [query, family, lang]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const items = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const pickFamily = (f: "all" | TraditionFamilyId) => {
    setFamily(f);
    setPage(0);
  };

  const search = (v: string) => {
    setQuery(v);
    setPage(0);
  };

  return (
    <div>
      {/* Buscador + filtro */}
      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="tradition-search">
          {es ? "Buscar corriente" : "Search tradition"}
        </label>
        <input
          id="tradition-search"
          type="search"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder={es ? "Buscar corriente: estoicismo, libertad…" : "Search tradition: stoicism, freedom…"}
          className="focus-mist w-full rounded-md border border-border bg-background/70 px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-bronze/60"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => pickFamily("all")}
            aria-pressed={family === "all"}
            className={`focus-mist rounded-full border px-3 py-1 text-micro transition-colors ${
              family === "all"
                ? "border-bronze/60 bg-bronze/12 text-foreground"
                : "border-border/70 text-muted-foreground hover:border-bronze/40 hover:text-foreground"
            }`}
          >
            {es ? "Todas" : "All"}
          </button>
          {TRADITION_FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => pickFamily(f.id)}
              aria-pressed={family === f.id}
              className={`focus-mist rounded-full border px-3 py-1 text-micro transition-colors ${
                family === f.id
                  ? "border-bronze/60 bg-bronze/12 text-foreground"
                  : "border-border/70 text-muted-foreground hover:border-bronze/40 hover:text-foreground"
              }`}
            >
              {f.name[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Contador + paginación */}
      <div className="mt-5 flex items-center justify-between gap-4 border-b border-border/60 pb-3">
        <p className="text-micro text-muted-foreground">
          {total} {es ? "corrientes" : "traditions"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="focus-mist rounded-full border border-border/70 px-3 py-1 text-micro text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← {es ? "Anterior" : "Prev"}
          </button>
          <span className="text-micro text-muted-foreground">
            {safePage + 1}/{pages}
          </span>
          <button
            type="button"
            disabled={safePage >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            className="focus-mist rounded-full border border-border/70 px-3 py-1 text-micro text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {es ? "Siguiente" : "Next"} →
          </button>
        </div>
      </div>

      {/* Listado */}
      {items.length === 0 ? (
        <p className="mt-6 text-small text-muted-foreground">
          {es ? "No hay corrientes que coincidan." : "No matching traditions."}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border/50">
          {items.map((t) => {
            const on = selected.includes(t.id);
            return (
              <li key={t.id}>
                {mode === "multi" ? (
                  <button
                    type="button"
                    onClick={() => onToggle(t.id)}
                    aria-pressed={on}
                    disabled={!on && selected.length >= maxSelect}
                    className="focus-mist flex w-full items-center justify-between gap-4 py-3.5 text-left disabled:cursor-not-allowed"
                  >
                    <span>
                      <span className="font-serif text-subtitle font-light text-foreground">
                        {t.name[lang]}
                      </span>
                      <span className="mt-0.5 block text-micro text-muted-foreground">
                        {t.tagline[lang]}
                      </span>
                    </span>
                    <span aria-hidden="true" className={`shrink-0 text-bronze ${on ? "" : "opacity-20"}`}>
                      ✓
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpen(t.id)}
                    className="focus-mist group flex w-full items-center justify-between gap-4 py-3.5 text-left"
                  >
                    <span>
                      <span className="font-serif text-subtitle font-light text-foreground group-hover:text-bronze-bright">
                        {t.name[lang]}
                      </span>
                      <span className="mt-0.5 block text-micro text-muted-foreground">
                        {t.tagline[lang]}
                      </span>
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-bronze opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
