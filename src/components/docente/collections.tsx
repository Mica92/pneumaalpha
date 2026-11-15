import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SUGGESTED_COLLECTIONS } from "@/lib/docente/catalog";
import { createCollection, deleteCollection, listCollections, setCollectionMember, updateCollection, type Collection } from "@/lib/docente/library.functions";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { inputCls } from "./config-fields";

export const COLLECTIONS_KEY = ["docente-collections"] as const;

export function useCollections() {
  const fetchCols = useServerFn(listCollections);
  return useQuery({ queryKey: COLLECTIONS_KEY, queryFn: () => fetchCols() as Promise<Collection[]> });
}

/** Create-collection inline form with suggested names. */
export function NewCollection({ materialId, onCreated }: { materialId?: string; onCreated?: (id: string) => void }) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const create = useServerFn(createCollection);
  const { data } = useCollections();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const existing = new Set((data ?? []).map((c) => c.name.toLowerCase()));
  const suggestions = SUGGESTED_COLLECTIONS.map((s) => s[lang]).filter((s) => !existing.has(s.toLowerCase())).slice(0, 4);

  async function submit(n = name) {
    if (!n.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await create({ data: { name: n.trim(), description: "", materialId } });
      setName("");
      await qc.invalidateQueries({ queryKey: COLLECTIONS_KEY });
      onCreated?.(r.id);
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder={tr("Nueva colección…", "New collection…")} aria-label={tr("Nombre de la colección", "Collection name")} className={cn(inputCls, "py-1.5 text-small")} />
        <button type="submit" disabled={busy || !name.trim()} className="btn-ghost-gold focus-mist shrink-0 px-3 py-1.5 text-micro disabled:opacity-50">
          {busy ? "…" : tr("Crear", "Create")}
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button key={s} type="button" disabled={busy} onClick={() => submit(s)} className="focus-mist rounded-full border border-border px-2.5 py-0.5 text-micro text-muted-foreground hover:border-bronze hover:text-foreground">
              + {s}
            </button>
          ))}
        </div>
      )}
      {err && <p role="alert" className="mt-2 text-small text-destructive">{err}</p>}
    </div>
  );
}

/** Which of my collections contain this material. */
export function CollectionsPanel({ materialId }: { materialId: string }) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const { data, isLoading } = useCollections();
  const setMember = useServerFn(setCollectionMember);
  const [err, setErr] = useState<string | null>(null);

  async function toggle(c: Collection, member: boolean) {
    setErr(null);
    qc.setQueryData<Collection[]>(COLLECTIONS_KEY, (old) =>
      old?.map((x) => (x.id === c.id ? { ...x, material_ids: member ? [...x.material_ids, materialId] : x.material_ids.filter((m) => m !== materialId) } : x)),
    );
    try {
      await setMember({ data: { collectionId: c.id, materialId, member } });
    } catch (e) {
      setErr(errorText(e, lang));
      await qc.invalidateQueries({ queryKey: COLLECTIONS_KEY });
    }
  }

  return (
    <section className="mt-4 rounded-md border border-border p-4" aria-label={tr("Colecciones", "Collections")}>
      <p className="text-small font-medium text-foreground">{tr("Colecciones", "Collections")}</p>
      <p className="mt-1 text-micro text-muted-foreground">{tr("Un material puede estar en varias colecciones. Son privadas.", "A material can belong to several collections. They are private.")}</p>
      {isLoading && <p className="mt-2 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {data?.map((c) => (
          <li key={c.id}>
            <label className="flex items-center gap-2 text-small text-foreground">
              <input type="checkbox" checked={c.material_ids.includes(materialId)} onChange={(e) => toggle(c, e.target.checked)} />
              {c.name}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <NewCollection materialId={materialId} />
      </div>
      {err && <p role="alert" className="mt-2 text-small text-destructive">{err}</p>}
    </section>
  );
}

/** Rename / delete a collection (materials are kept). */
export function CollectionActions({ c, onDeleted }: { c: Collection; onDeleted: () => void }) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const upd = useServerFn(updateCollection);
  const del = useServerFn(deleteCollection);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-3 text-micro">
      <button
        type="button"
        className="focus-mist text-muted-foreground underline hover:text-foreground"
        onClick={async () => {
          const name = window.prompt(tr("Nuevo nombre", "New name"), c.name);
          if (!name?.trim() || name.trim() === c.name) return;
          try {
            await upd({ data: { id: c.id, name: name.trim(), description: c.description } });
            await qc.invalidateQueries({ queryKey: COLLECTIONS_KEY });
          } catch (e) {
            setErr(errorText(e, lang));
          }
        }}
      >
        {tr("Renombrar", "Rename")}
      </button>
      <button
        type="button"
        className="focus-mist text-muted-foreground underline hover:text-destructive"
        onClick={async () => {
          if (!window.confirm(tr(`¿Eliminar la colección «${c.name}»? Sus materiales se conservan en la biblioteca.`, `Delete the collection “${c.name}”? Its materials stay in the library.`))) return;
          try {
            await del({ data: { id: c.id } });
            await qc.invalidateQueries({ queryKey: COLLECTIONS_KEY });
            onDeleted();
          } catch (e) {
            setErr(errorText(e, lang));
          }
        }}
      >
        {tr("Eliminar colección", "Delete collection")}
      </button>
      {err && <span role="alert" className="text-destructive">{err}</span>}
    </span>
  );
}
