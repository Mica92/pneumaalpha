import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DocenteShell } from "@/components/docente/shell";
import { MaterialRow } from "@/components/docente/material-list";
import { listMaterials, type MaterialSummary } from "@/lib/docente/docente.functions";
import { useTr } from "@/lib/docente/use-docente";
import type { MaterialKind } from "@/lib/docente/model";

export const Route = createFileRoute("/_authenticated/docente/")({
  head: () => ({
    meta: [
      { title: "Panel — Kionas Docente" },
      { name: "description", content: "Tu panel de Kionas Docente: crea guías, exámenes y mapas y recupera tus materiales recientes." },
      { property: "og:title", content: "Panel — Kionas Docente" },
      { property: "og:description", content: "Crea y recupera guías, exámenes y mapas conceptuales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocenteHome,
});

function DocenteHome() {
  const tr = useTr();
  const navigate = useNavigate();
  const [concept, setConcept] = useState("");
  const fetchList = useServerFn(listMaterials);
  const { data: raw, isLoading, error } = useQuery({
    queryKey: ["docente-materials"],
    queryFn: () => fetchList({ data: { limit: 100 } }) as Promise<MaterialSummary[]>,
  });
  const c = concept.trim() || undefined;

  const data = raw?.filter((m) => !m.archived_at);
  const byKind = (k: MaterialKind) => (data ?? []).filter((m) => m.kind === k).slice(0, 4);

  return (
    <DocenteShell>
      <header className="mb-10">
        <p className="label">Kionas Docente</p>
        <h1 className="mt-2 font-serif text-title font-light text-foreground">
          {tr("Tu espacio de investigación, creación y enseñanza.", "Your space for research, creation and teaching.")}
        </h1>
      </header>

      <section aria-labelledby="today" className="rounded-lg border border-border bg-card/70 p-5 md:p-7">
        <label id="today" htmlFor="today-input" className="font-serif text-2xl text-foreground">
          {tr("¿Qué quieres trabajar hoy?", "What do you want to work on today?")}
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void navigate({ to: "/docente/investigar", search: { q: c } });
          }}
        >
          <input
            id="today-input"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            maxLength={200}
            placeholder={tr("Explora un concepto, pregunta, autor o problema académico…", "Explore a concept, question, author or academic problem…")}
            className="focus-mist mt-4 w-full border-b border-border bg-transparent py-3 font-serif text-xl text-foreground placeholder:text-muted-foreground/60"
          />
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" className="btn-gold focus-mist px-4 py-2 text-small">
              {tr("Investigar", "Research")}
            </button>
            <Link to="/docente/guias/nueva" search={{ concept: c }} className="btn-ghost-gold focus-mist px-4 py-2 text-small">
              {tr("Crear guía", "Create guide")}
            </Link>
            <Link to="/docente/examenes/nuevo" search={{ concept: c }} className="btn-ghost-gold focus-mist px-4 py-2 text-small">
              {tr("Crear examen", "Create exam")}
            </Link>
            <Link to="/docente/mapas/nuevo" search={{ concept: c }} className="btn-ghost-gold focus-mist px-4 py-2 text-small">
              {tr("Crear mapa", "Create map")}
            </Link>
            <Link to="/docente/clases/nueva" search={{ concept: c }} className="btn-ghost-gold focus-mist px-4 py-2 text-small">
              {tr("Preparar clase", "Plan a class")}
            </Link>
          </div>
        </form>
      </section>

      <section className="mt-12" aria-labelledby="recent">
        <div className="flex items-baseline justify-between">
          <h2 id="recent" className="font-serif text-2xl text-foreground">
            {tr("Mis materiales recientes", "My recent materials")}
          </h2>
          <Link to="/docente/biblioteca" className="focus-mist text-small text-muted-foreground hover:text-foreground">
            {tr("Ver todo", "See all")}
          </Link>
        </div>
        {isLoading && <p className="mt-4 text-small text-muted-foreground">{tr("Cargando…", "Loading…")}</p>}
        {error && <p className="mt-4 text-small text-destructive">{tr("No se pudieron cargar tus materiales.", "Could not load your materials.")}</p>}
        {data && data.length === 0 && (
          <p className="mt-4 max-w-xl text-small text-muted-foreground">
            {tr(
              "Aún no tienes materiales. Escribe un concepto arriba para investigarlo o crear tu primera guía.",
              "You have no materials yet. Type a concept above to research it or create your first guide.",
            )}
          </p>
        )}
        {data && data.length > 0 && (
          <ul className="mt-3">
            {data.slice(0, 6).map((m) => (
              <MaterialRow key={m.id} m={m} />
            ))}
          </ul>
        )}
      </section>

      {data && data.length > 0 && (
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <KindColumn title={tr("Investigaciones guardadas", "Saved research")} items={byKind("research")} kind="research" />
          <KindColumn title={tr("Guías guardadas", "Saved guides")} items={byKind("guide")} kind="guide" />
          <KindColumn title={tr("Mapas en desarrollo", "Maps in progress")} items={byKind("map")} kind="map" />
          <KindColumn title={tr("Exámenes creados", "Exams created")} items={byKind("exam")} kind="exam" />
          <KindColumn title={tr("Programas de asignatura", "Syllabi")} items={byKind("curriculum")} kind="curriculum" />
          <KindColumn title={tr("Clases planificadas", "Planned classes")} items={byKind("class")} kind="class" />
        </div>
      )}

      <p className="mt-16 text-small text-muted-foreground">
        <Link to="/" className="focus-mist underline-offset-4 hover:text-foreground hover:underline">
          {tr("Ir a la aplicación Kionas →", "Go to the Kionas app →")}
        </Link>
      </p>
    </DocenteShell>
  );
}

function KindColumn({ title, items, kind }: { title: string; items: MaterialSummary[]; kind: MaterialKind }) {
  const tr = useTr();
  return (
    <section>
      <h3 className="label">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-small text-muted-foreground">{tr("Ninguno todavía.", "None yet.")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((m) => (
            <li key={m.id}>
              <Link to="/docente/material/$id" params={{ id: m.id }} className="focus-mist font-serif text-lg text-foreground hover:text-bronze-bright">
                {m.title || m.concept}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/docente/biblioteca" search={{ kind }} className="focus-mist mt-3 inline-block text-micro text-muted-foreground hover:text-foreground">
        {tr("Ver en la biblioteca", "View in library")}
      </Link>
    </section>
  );
}
