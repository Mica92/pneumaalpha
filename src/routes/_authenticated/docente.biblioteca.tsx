import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { MaterialRow } from "@/components/docente/material-list";
import { inputCls } from "@/components/docente/config-fields";
import { CollectionActions, NewCollection, useCollections } from "@/components/docente/collections";
import { deleteMaterial, duplicateMaterial, listMaterials, type MaterialSummary } from "@/lib/docente/docente.functions";
import { setArchived } from "@/lib/docente/library.functions";
import { KIND_LABELS } from "@/lib/docente/catalog";
import { MATERIAL_KINDS, type MaterialKind } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LibSearch = { q?: string; kind?: MaterialKind; col?: string; archived?: boolean; fav?: boolean; tag?: string };

export const Route = createFileRoute("/_authenticated/docente/biblioteca")({
  validateSearch: (s: Record<string, unknown>): LibSearch => ({
    q: typeof s.q === "string" ? s.q.slice(0, 200) : undefined,
    kind: typeof s.kind === "string" && (MATERIAL_KINDS as readonly string[]).includes(s.kind) ? (s.kind as MaterialKind) : undefined,
    col: typeof s.col === "string" && /^[0-9a-f-]{36}$/i.test(s.col) ? s.col : undefined,
    archived: s.archived === true || s.archived === 1 || s.archived === "1" || s.archived === "true" ? true : undefined,
    fav: s.fav === true || s.fav === 1 || s.fav === "1" || s.fav === "true" ? true : undefined,
    tag: typeof s.tag === "string" && s.tag.trim() ? s.tag.slice(0, 40) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Mi biblioteca — Kionas Docente" },
      { name: "description", content: "Busca, filtra y reutiliza tus guías, exámenes, mapas y clases." },
      { property: "og:title", content: "Mi biblioteca — Kionas Docente" },
      { property: "og:description", content: "Tus materiales académicos privados en un solo lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Library,
});

function norm(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function Library() {
  const tr = useTr();
  const { lang } = useI18n();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/docente/biblioteca" });
  const qc = useQueryClient();
  const fetchList = useServerFn(listMaterials);
  const dup = useServerFn(duplicateMaterial);
  const del = useServerFn(deleteMaterial);
  const archive = useServerFn(setArchived);
  const { data: collections } = useCollections();
  const [showNewCol, setShowNewCol] = useState(false);
  const activeCol = collections?.find((c) => c.id === search.col) ?? null;
  const [discipline, setDiscipline] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "title">("updated");
  const [err, setErr] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["docente-materials"],
    queryFn: () => fetchList({ data: { limit: 200 } }) as Promise<MaterialSummary[]>,
  });

  const allTags = useMemo(() => {
    const count = new Map<string, number>();
    for (const m of data ?? []) for (const t of m.tags ?? []) count.set(t, (count.get(t) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 30);
  }, [data]);
  const disciplines = useMemo(() => [...new Set((data ?? []).map((m) => m.discipline).filter(Boolean))].sort(), [data]);
  const items = useMemo(() => {
    const q = norm(search.q ?? "").trim();
    const inCol = activeCol ? new Set(activeCol.material_ids) : null;
    const list = (data ?? []).filter(
      (m) =>
        Boolean(m.archived_at) === Boolean(search.archived) &&
        (!inCol || inCol.has(m.id)) &&
        (!search.kind || m.kind === search.kind) &&
        (!search.fav || m.favorite) &&
        (!search.tag || (m.tags ?? []).includes(search.tag)) &&
        (!discipline || m.discipline === discipline) &&
        (!q || norm([m.title, m.concept, m.discipline, m.subject, ...(m.tags ?? [])].join(" ")).includes(q)),
    );
    return [...list].sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : sort === "created" ? b.created_at.localeCompare(a.created_at) : b.updated_at.localeCompare(a.updated_at),
    );
  }, [data, search.q, search.kind, search.archived, search.fav, search.tag, activeCol, discipline, sort]);

  async function act(fn: () => Promise<unknown>) {
    setErr(null);
    try {
      await fn();
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
    } catch (e) {
      setErr(errorText(e, lang));
    }
  }

  return (
    <DocenteShell>
      <PageHeading
        eyebrow="04 · Library"
        title={tr("Mi biblioteca", "My library")}
        lead={tr("Tus materiales son privados. Búscalos, duplícalos o úsalos como base de otros.", "Your materials are private. Search, duplicate or reuse them as a base for others.")}
      />
      <div className="flex flex-wrap items-end gap-3">
        <input
          type="search"
          aria-label={tr("Buscar", "Search")}
          placeholder={tr("Buscar por título, concepto, disciplina…", "Search by title, concept, discipline…")}
          value={search.q ?? ""}
          onChange={(e) => void navigate({ search: (s) => ({ ...s, q: e.target.value || undefined }), replace: true })}
          className={cn(inputCls, "min-w-56 flex-1")}
        />
        <select aria-label={tr("Disciplina", "Discipline")} value={discipline} onChange={(e) => setDiscipline(e.target.value)} className={cn(inputCls, "w-auto")}>
          <option value="">{tr("Todas las disciplinas", "All disciplines")}</option>
          {disciplines.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select aria-label={tr("Orden", "Sort")} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={cn(inputCls, "w-auto")}>
          <option value="updated">{tr("Editados recientemente", "Recently edited")}</option>
          <option value="created">{tr("Creados recientemente", "Recently created")}</option>
          <option value="title">{tr("Título (A–Z)", "Title (A–Z)")}</option>
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label={tr("Tipo", "Type")}>
        {[undefined, ...MATERIAL_KINDS].map((k) => (
          <button
            key={k ?? "all"}
            type="button"
            aria-pressed={search.kind === k}
            onClick={() => void navigate({ search: (s) => ({ ...s, kind: k }), replace: true })}
            className={cn(
              "focus-mist rounded-full border px-3 py-1 text-micro",
              search.kind === k ? "border-bronze text-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {k ? KIND_LABELS[k][lang] : tr("Todo", "All")}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5" role="group" aria-label={tr("Favoritos y etiquetas", "Favourites and tags")}>
        <button
          type="button"
          aria-pressed={Boolean(search.fav)}
          onClick={() => void navigate({ search: (s) => ({ ...s, fav: s.fav ? undefined : true }), replace: true })}
          className={cn("focus-mist rounded-full border px-3 py-1 text-micro", search.fav ? "border-bronze text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
        >
          ★ {tr("Favoritos", "Favourites")}
        </button>
        {allTags.map(([t, n]) => (
          <button
            key={t}
            type="button"
            aria-pressed={search.tag === t}
            onClick={() => void navigate({ search: (s) => ({ ...s, tag: s.tag === t ? undefined : t }), replace: true })}
            className={cn("focus-mist rounded-full border px-3 py-1 text-micro", search.tag === t ? "border-bronze text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
          >
            #{t} <span className="tabular-nums opacity-70">{n}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5" role="group" aria-label={tr("Colecciones", "Collections")}>
        <span className="label mr-1">{tr("Colecciones", "Collections")}</span>
        {collections?.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={search.col === c.id}
            onClick={() => void navigate({ search: (s) => ({ ...s, col: s.col === c.id ? undefined : c.id }), replace: true })}
            className={cn(
              "focus-mist rounded-full border px-3 py-1 text-micro",
              search.col === c.id ? "border-bronze text-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {c.name} <span className="tabular-nums opacity-70">{c.material_ids.length}</span>
          </button>
        ))}
        <button type="button" onClick={() => setShowNewCol((x) => !x)} className="focus-mist rounded-full border border-dashed border-border px-3 py-1 text-micro text-muted-foreground hover:text-foreground" aria-expanded={showNewCol}>
          + {tr("Nueva", "New")}
        </button>
        <button
          type="button"
          aria-pressed={Boolean(search.archived)}
          onClick={() => void navigate({ search: (s) => ({ ...s, archived: s.archived ? undefined : true }), replace: true })}
          className={cn(
            "focus-mist ml-auto rounded-full border px-3 py-1 text-micro",
            search.archived ? "border-bronze text-foreground" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {tr("Archivados", "Archived")}
        </button>
      </div>
      {showNewCol && (
        <div className="mt-3 max-w-xl">
          <NewCollection
            onCreated={(id) => {
              setShowNewCol(false);
              void navigate({ search: (s) => ({ ...s, col: id }), replace: true });
            }}
          />
        </div>
      )}
      {activeCol && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="font-serif text-xl text-foreground">{activeCol.name}</p>
          <CollectionActions c={activeCol} onDeleted={() => void navigate({ search: (s) => ({ ...s, col: undefined }), replace: true })} />
        </div>
      )}

      {err && <p role="alert" className="mt-4 text-small text-destructive">{err}</p>}
      {isLoading && <p className="mt-6 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
      {error && <p className="mt-6 text-small text-destructive">{tr("No se pudo cargar la biblioteca.", "Could not load the library.")}</p>}
      {data && items.length === 0 && (
        <div className="mt-8 text-small text-muted-foreground">
          {activeCol && activeCol.material_ids.length === 0 ? (
            <p>{tr("Esta colección está vacía. Abre un material y elige «Colecciones» en «Más».", "This collection is empty. Open a material and choose “Collections” under “More”.")}</p>
          ) : search.archived ? (
            <p>{tr("No hay materiales archivados.", "No archived materials.")}</p>
          ) : data.length === 0 ? (
            <p>
              {tr("Aún no tienes materiales.", "You have no materials yet.")}{" "}
              <Link to="/docente/guias/nueva" search={{ concept: undefined, from: undefined }} className="underline">
                {tr("Crea tu primera guía", "Create your first guide")}
              </Link>
            </p>
          ) : (
            <p>{tr("Ningún material coincide con la búsqueda.", "No material matches the search.")}</p>
          )}
        </div>
      )}
      {items.length > 0 && (
        <>
          <p className="mt-6 text-micro text-muted-foreground">{tr(`${items.length} materiales`, `${items.length} materials`)}</p>
          <ul className="mt-2">
            {items.map((m) => (
              <MaterialRow
                key={m.id}
                m={m}
                actions={
                  <span className="flex shrink-0 gap-2 text-micro">
                    <button type="button" className="focus-mist text-muted-foreground hover:text-foreground" onClick={() => act(() => dup({ data: { id: m.id, titleSuffix: tr(" (copia)", " (copy)") } }))}>
                      {tr("Duplicar", "Duplicate")}
                    </button>
                    <button type="button" className="focus-mist text-muted-foreground hover:text-foreground" onClick={() => act(() => archive({ data: { id: m.id, archived: !m.archived_at } }))}>
                      {m.archived_at ? tr("Restaurar", "Restore") : tr("Archivar", "Archive")}
                    </button>
                    <button
                      type="button"
                      className="focus-mist text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (window.confirm(tr(`¿Eliminar «${m.title}»?`, `Delete “${m.title}”?`))) void act(() => del({ data: { id: m.id } }));
                      }}
                    >
                      {tr("Eliminar", "Delete")}
                    </button>
                  </span>
                }
              />
            ))}
          </ul>
        </>
      )}
    </DocenteShell>
  );
}
