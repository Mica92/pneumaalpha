import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listRelated, markSourceSynced, type Material, type MaterialSummary } from "@/lib/docente/docente.functions";
import { KIND_LABELS } from "@/lib/docente/catalog";
import { getConversion, isSourceNewer } from "@/lib/docente/conversions";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "./material-list";

/** Source + derived materials, and a notice when the source changed after this material was created. */
export function RelatedMaterials({ material }: { material: Material }) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const fetchRelated = useServerFn(listRelated);
  const markSynced = useServerFn(markSourceSynced);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["docente-related", material.id],
    queryFn: () => fetchRelated({ data: { id: material.id } }),
  });
  const source = q.data?.source ?? null;
  const derived = q.data?.derived ?? [];
  if (!source && derived.length === 0) return null;
  const outdated = source ? isSourceNewer(source.updated_at, material.source_synced_at) : false;
  const conv = getConversion(material.conversion);

  async function confirmSynced() {
    setBusy(true);
    setErr(null);
    try {
      await markSynced({ data: { id: material.id } });
      await qc.invalidateQueries({ queryKey: ["docente-material", material.id] });
      await qc.invalidateQueries({ queryKey: ["docente-related", material.id] });
    } catch (e) {
      setErr(errorText(e, tr));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label={tr("Materiales relacionados", "Related materials")} className="mt-6 rounded-md border border-border px-4 py-3">
      <h2 className="label mb-2">{tr("Materiales relacionados", "Related materials")}</h2>
      {source && (
        <div className="mb-2">
          <p className="text-micro text-muted-foreground">
            {conv ? `${conv.label[lang]} · ` : ""}
            {tr("Original", "Source")}
          </p>
          <Row m={source} lang={lang} />
          {outdated && (
            <div role="status" className="mt-2 rounded-sm border border-bronze/50 bg-muted/40 px-3 py-2 text-small">
              <p className="text-foreground">
                {tr(
                  "El original cambió después de crear este material. Este material no se actualiza solo.",
                  "The source changed after this material was created. This material is never updated automatically.",
                )}
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                <Link to="/docente/material/$id" params={{ id: source.id }} className="focus-mist underline">
                  {tr("Ver el original", "Open the source")}
                </Link>
                <button type="button" onClick={confirmSynced} disabled={busy} className="focus-mist underline disabled:opacity-50">
                  {busy ? "…" : tr("Ya lo revisé: marcar al día", "Reviewed: mark as up to date")}
                </button>
              </div>
              {err && <p className="mt-1 text-destructive">{err}</p>}
            </div>
          )}
        </div>
      )}
      {derived.length > 0 && (
        <div>
          <p className="text-micro text-muted-foreground">{tr("Creados a partir de este", "Created from this")}</p>
          <ul>
            {derived.map((d) => (
              <li key={d.id}>
                <Row m={d} lang={lang} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Row({ m, lang }: { m: MaterialSummary; lang: "es" | "en" }) {
  const conv = getConversion(m.conversion);
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 py-0.5 text-small">
      <span className="label w-16 shrink-0">{KIND_LABELS[m.kind][lang]}</span>
      <Link to="/docente/material/$id" params={{ id: m.id }} className="focus-mist font-serif text-base text-foreground hover:text-bronze-bright">
        {m.title || m.concept}
      </Link>
      {conv && <span className="text-micro text-muted-foreground">{conv.label[lang]}</span>}
      <span className="text-micro text-muted-foreground tabular-nums">{formatDate(m.created_at, lang)}</span>
    </p>
  );
}
