import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell, PageHeading } from "@/components/docente/shell";
import { MaterialRow } from "@/components/docente/material-list";
import { inputCls } from "@/components/docente/config-fields";
import { deleteMaterial, duplicateMaterial, listMaterials, type MaterialSummary } from "@/lib/docente/docente.functions";
import { KIND_LABELS } from "@/lib/docente/catalog";
import { MATERIAL_KINDS, type MaterialKind } from "@/lib/docente/model";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LibSearch = { q?: string; kind?: MaterialKind };

export const Route = createFileRoute("/_authenticated/docente/biblioteca")({
  validateSearch: (s: Record<string, unknown>): LibSearch => ({
    q: typeof s.q === "string" ? s.q.slice(0, 200) : undefined,
    kind: typeof s.kind === "string" && (MATERIAL_KINDS as readonly string[]).includes(s.kind) ? (s.kind as MaterialKind) : undefined,
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
  const [discipline, setDiscipline] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "title">("updated");
  const [err, setErr] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["docente-materials"],
    queryFn: () => fetchList({ data: { limit: 200 } }) as Promise<MaterialSummary[]>,
  });

  const disciplines = useMemo(() => [...new Set((data ?? []).map((m) => m.discipline).filter(Boolean))].sort(), [data]);
  const items = useMemo(() => {
    const q = norm(search.q ?? "").trim();
    const list = (data ?? []).filter(
      (m) =>
        (!search.kind || m.kind === search.kind) &&
        (!discipline || m.discipline === discipline) &&
        (!q || norm([m.title, m.concept, m.discipline, m.subject].join(" ")).includes(q)),
    );
    return [...list].sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : sort === "created" ? b.created_at.localeCompare(a.created_at) : b.updated_at.localeCompare(a.updated_at),
    );
  }, [data, search.q, search.kind, discipline, sort]);

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

      {err && <p role="alert" className="mt-4 text-small text-destructive">{err}</p>}
      {isLoading && <p className="mt-6 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
      {error && <p className="mt-6 text-small text-destructive">{tr("No se pudo cargar la biblioteca.", "Could not load the library.")}</p>}
      {data && items.length === 0 && (
        <div className="mt-8 text-small text-muted-foreground">
          {data.length === 0 ? (
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
