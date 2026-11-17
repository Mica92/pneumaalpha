import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createMaterial } from "@/lib/docente/docente.functions";
import { CLAIM_KIND_LABELS, MATRIX_COLUMNS, MATRIX_LABELS, matrixToMap, type ConceptMatrix, type MatrixColumn } from "@/lib/docente/research";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Concept → Meaning → Variants → … → Applications. Every item can be researched further;
 * the whole matrix can become a linked concept map.
 */
export function ConceptMatrixView({
  matrix,
  onChange,
  materialId,
  discipline,
  language,
}: {
  matrix: ConceptMatrix;
  onChange: (m: ConceptMatrix | null) => void;
  materialId: string;
  discipline: string;
  language: "es" | "en";
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const create = useServerFn(createMaterial);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function remove(col: MatrixColumn, id: string) {
    onChange({ ...matrix, columns: { ...matrix.columns, [col]: matrix.columns[col].filter((x) => x.id !== id) } });
  }

  async function toMap() {
    setBusy(true);
    setErr(null);
    try {
      const { id } = await create({
        data: {
          kind: "map",
          title: `${matrix.concept} — ${tr("matriz conceptual", "concept matrix")}`,
          concept: matrix.concept,
          discipline,
          language,
          content: matrixToMap(matrix),
          config: { origin: "concept_matrix" },
          sourceMaterialId: materialId,
        },
      });
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
      await navigate({ to: "/docente/material/$id", params: { id } });
    } catch (e) {
      setErr(errorText(e, lang));
      setBusy(false);
    }
  }

  const cols = MATRIX_COLUMNS.filter((c) => (matrix.columns[c] ?? []).length > 0);
  return (
    <section aria-labelledby="matrix-title" className="mb-10 rounded-lg border border-border bg-card/50 p-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id="matrix-title" className="mr-auto font-serif text-2xl text-foreground">
          {tr("Matriz conceptual", "Concept matrix")}: <span className="text-bronze-bright">{matrix.concept}</span>
        </h2>
        <button type="button" onClick={toMap} disabled={busy} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro disabled:opacity-50">
          {busy ? "…" : tr("Crear mapa desde la matriz", "Create map from matrix")}
        </button>
        <button
          type="button"
          onClick={() => window.confirm(tr("¿Quitar la matriz de esta investigación?", "Remove the matrix from this research?")) && onChange(null)}
          className="focus-mist text-micro text-muted-foreground hover:text-destructive"
        >
          {tr("Quitar matriz", "Remove matrix")}
        </button>
      </div>
      {err && <p role="alert" className="mt-2 text-small text-destructive">{err}</p>}
      <p className="mt-1 text-micro text-muted-foreground">
        {tr("Cada etiqueta indica el tipo de afirmación. Abre un elemento para investigarlo por separado.", "Each tag shows the kind of claim. Open an item to research it separately.")}
      </p>
      <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cols.map((col, ci) => (
          <li key={col} className="min-w-0">
            <p className="label flex items-center gap-2">
              <span className="tabular-nums text-muted-foreground">{ci + 1}</span>
              {MATRIX_LABELS[col][lang]}
            </p>
            <ul className="mt-2 space-y-1.5">
              {matrix.columns[col].map((it) => {
                const isOpen = open === it.id;
                return (
                  <li key={it.id} className={cn("rounded border px-2.5 py-1.5", isOpen ? "border-bronze/60 bg-bronze/5" : "border-border/70")}>
                    <button type="button" onClick={() => setOpen(isOpen ? null : it.id)} aria-expanded={isOpen} className="focus-mist block w-full text-left">
                      <span className="block text-small text-foreground">{it.label}</span>
                      <span className="block text-micro text-muted-foreground">{CLAIM_KIND_LABELS[it.claim]?.[lang] ?? it.claim}</span>
                    </button>
                    {isOpen && (
                      <div className="mt-2 border-t border-border/60 pt-2">
                        {it.note && <p className="text-small text-muted-foreground">{it.note}</p>}
                        <div className="mt-2 flex flex-wrap gap-3 text-micro">
                          <Link
                            to="/docente/investigar"
                            search={{ q: `${it.label} (${MATRIX_LABELS[col][language].toLowerCase()} de ${matrix.concept})`, kind: "concept", discipline: discipline || undefined }}
                            className="focus-mist text-foreground underline"
                          >
                            {tr("Investigar", "Research")}
                          </Link>
                          <Link to="/docente/guias/nueva" search={{ concept: it.label }} className="focus-mist text-foreground underline">
                            {tr("Crear guía", "Create guide")}
                          </Link>
                          <button type="button" onClick={() => remove(col, it.id)} className="focus-mist text-muted-foreground hover:text-destructive">
                            {tr("Quitar", "Remove")}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
