import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { NODE_KINDS, RELATIONS, cleanEdges, layoutRadial, uid, type MapContent, type MapEdge, type MapNode, type NodeKind, type Relation } from "@/lib/docente/model";
import { NODE_ACTIONS, NODE_KIND_LABELS, RELATION_LABELS, type NodeAction } from "@/lib/docente/catalog";
import { expandMapNode } from "@/lib/docente/docente-ai.functions";
import { MAP_H, MAP_W, edgeAnchor, nodeSize, wrapLabel } from "@/lib/docente/map-svg";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Field, inputCls } from "./config-fields";

export type MapMeta = { concept: string; discipline: string; language: "es" | "en" };

const KIND_CLS: Record<NodeKind, string> = {
  central: "fill-bronze/20 stroke-bronze",
  concept: "fill-card stroke-muted-foreground/60",
  author: "fill-glacier/15 stroke-glacier",
  school: "fill-glacier/10 stroke-glacier/80",
  discipline: "fill-sage/15 stroke-sage",
  question: "fill-card stroke-bronze-bright",
  case: "fill-sage/10 stroke-sage/80",
  objection: "fill-tension/15 stroke-tension",
};

export function MapEditor({
  content,
  setContent,
  meta,
}: {
  content: MapContent;
  setContent: (u: (prev: MapContent) => MapContent) => void;
  meta: MapMeta;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [relation, setRelation] = useState<Relation>("relates");
  const [proposal, setProposal] = useState<{ nodes: MapNode[]; edges: MapEdge[] } | null>(null);
  const [aiAction, setAiAction] = useState<NodeAction>("deepen");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const expand = useServerFn(expandMapNode);

  const byId = new Map(content.nodes.map((n) => [n.id, n]));
  const sel = selected ? byId.get(selected) ?? null : null;

  function toSvg(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }

  function patchNode(id: string, p: Partial<MapNode>) {
    setContent((c) => ({ ...c, nodes: c.nodes.map((n) => (n.id === id ? { ...n, ...p } : n)) }));
  }

  function clickNode(id: string) {
    if (connectFrom && connectFrom !== id) {
      setContent((c) => {
        if (c.edges.some((e) => e.from === connectFrom && e.to === id)) return c;
        return { ...c, edges: [...c.edges, { id: uid("e"), from: connectFrom, to: id, relation }] };
      });
      setConnectFrom(null);
      setSelected(id);
      return;
    }
    setSelected(id);
  }

  function addNode(kind: NodeKind = "concept") {
    const base = sel ?? content.nodes[0];
    const angle = Math.random() * Math.PI * 2;
    const n: MapNode = {
      id: uid("n"),
      label: tr("Nuevo nodo", "New node"),
      kind,
      note: "",
      x: Math.round(Math.min(MAP_W - 80, Math.max(80, (base?.x ?? MAP_W / 2) + Math.cos(angle) * 180))),
      y: Math.round(Math.min(MAP_H - 50, Math.max(50, (base?.y ?? MAP_H / 2) + Math.sin(angle) * 140))),
    };
    setContent((c) => ({
      nodes: [...c.nodes, n],
      edges: base ? [...c.edges, { id: uid("e"), from: base.id, to: n.id, relation: "relates" }] : c.edges,
    }));
    setSelected(n.id);
  }

  function removeNode(id: string) {
    setContent((c) => cleanEdges({ ...c, nodes: c.nodes.filter((n) => n.id !== id) }));
    setSelected(null);
  }

  async function askAi() {
    if (!sel) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await expand({
        data: {
          concept: meta.concept,
          discipline: meta.discipline,
          language: meta.language,
          nodeId: sel.id,
          nodeLabel: sel.label,
          nodeNote: sel.note,
          action: aiAction,
          existingLabels: content.nodes.map((n) => n.label).slice(0, 200),
        },
      });
      const placed = r.nodes.map((n, i) => {
        const a = (i / Math.max(1, r.nodes.length)) * Math.PI * 2 + Math.PI / 6;
        return {
          ...n,
          x: Math.round(Math.min(MAP_W - 90, Math.max(90, sel.x + Math.cos(a) * 200))),
          y: Math.round(Math.min(MAP_H - 50, Math.max(50, sel.y + Math.sin(a) * 150))),
        };
      });
      setProposal({ nodes: placed, edges: r.edges });
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(false);
    }
  }

  const shown = proposal ? { nodes: [...content.nodes, ...proposal.nodes], edges: [...content.edges, ...proposal.edges] } : content;
  const shownById = new Map(shown.nodes.map((n) => [n.id, n]));
  const proposedIds = new Set(proposal?.nodes.map((n) => n.id) ?? []);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => addNode()} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro">
            {tr("Añadir nodo", "Add node")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(tr("¿Reordenar todos los nodos alrededor del concepto central?", "Rearrange all nodes around the central concept?")))
                setContent((c) => layoutRadial(c, MAP_W, MAP_H));
            }}
            className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro"
          >
            {tr("Ordenar automáticamente", "Auto-arrange")}
          </button>
          {connectFrom && (
            <span className="self-center text-micro text-bronze-bright">
              {tr("Elige el nodo de destino…", "Pick the target node…")}{" "}
              <button type="button" className="underline" onClick={() => setConnectFrom(null)}>
                {tr("Cancelar", "Cancel")}
              </button>
            </span>
          )}
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card/40">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="block h-auto w-full touch-none select-none"
            role="img"
            aria-label={tr("Mapa conceptual editable", "Editable concept map")}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              const p = toSvg(e);
              d.moved = true;
              patchNode(d.id, {
                x: Math.round(Math.min(MAP_W - 20, Math.max(20, p.x - d.dx))),
                y: Math.round(Math.min(MAP_H - 20, Math.max(20, p.y - d.dy))),
              });
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerLeave={() => {
              drag.current = null;
            }}
            onClick={(e) => {
              if (e.target === svgRef.current) setSelected(null);
            }}
          >
            <defs>
              <marker id="arrow-ui" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
              </marker>
            </defs>
            {shown.edges.map((e) => {
              const a = shownById.get(e.from);
              const b = shownById.get(e.to);
              if (!a || !b) return null;
              const p = edgeAnchor(a, b.x, b.y);
              const q = edgeAnchor(b, a.x, a.y);
              const label = RELATION_LABELS[e.relation][lang];
              const proposed = proposedIds.has(a.id) || proposedIds.has(b.id);
              return (
                <g key={e.id} className={proposed ? "opacity-60" : ""}>
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    className="stroke-muted-foreground"
                    strokeWidth={1.4}
                    strokeDasharray={e.relation === "opposes" || e.relation === "questions" || proposed ? "6 4" : undefined}
                    markerEnd="url(#arrow-ui)"
                  />
                  <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 4} textAnchor="middle" className="fill-muted-foreground" fontSize={11}>
                    {label}
                  </text>
                </g>
              );
            })}
            {shown.nodes.map((n) => {
              const { w, h } = nodeSize(n);
              const lines = wrapLabel(n.label);
              const fs = n.kind === "central" ? 17 : 13.5;
              const start = n.y - ((lines.length - 1) * (fs + 2)) / 2 + fs / 3;
              const proposed = proposedIds.has(n.id);
              return (
                <g
                  key={n.id}
                  className={cn("cursor-grab", proposed && "opacity-70")}
                  tabIndex={proposed ? -1 : 0}
                  role="button"
                  aria-label={n.label}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      clickNode(n.id);
                    }
                  }}
                  onPointerDown={(e) => {
                    if (proposed) return;
                    const p = toSvg(e);
                    drag.current = { id: n.id, dx: p.x - n.x, dy: p.y - n.y, moved: false };
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (proposed) return;
                    clickNode(n.id);
                  }}
                >
                  <rect
                    x={n.x - w / 2}
                    y={n.y - h / 2}
                    width={w}
                    height={h}
                    rx={n.kind === "question" ? h / 2 : 6}
                    className={cn(KIND_CLS[n.kind], selected === n.id && "stroke-foreground", connectFrom === n.id && "stroke-bronze-bright")}
                    strokeWidth={selected === n.id ? 2.4 : n.kind === "central" ? 2 : 1.2}
                    strokeDasharray={proposed ? "5 3" : undefined}
                  />
                  <text textAnchor="middle" fontSize={fs} className="pointer-events-none fill-foreground font-serif">
                    {lines.map((l, i) => (
                      <tspan key={i} x={n.x} y={start + i * (fs + 2)}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="mt-2 text-micro text-muted-foreground">
          {tr(
            "Arrastra los nodos para moverlos. Selecciona un nodo para editarlo, conectarlo o ampliarlo con IA.",
            "Drag nodes to move them. Select a node to edit, connect or expand it with AI.",
          )}
        </p>
        {proposal && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-bronze/50 p-3">
            <span className="text-small text-foreground">
              {tr(`${proposal.nodes.length} nodos propuestos (en línea discontinua).`, `${proposal.nodes.length} proposed nodes (dashed).`)}
            </span>
            <button
              type="button"
              onClick={() => {
                setContent((c) => cleanEdges({ nodes: [...c.nodes, ...proposal.nodes], edges: [...c.edges, ...proposal.edges] }));
                setProposal(null);
              }}
              className="btn-gold focus-mist px-3 py-1.5 text-small"
            >
              {tr("Añadir al mapa", "Add to map")}
            </button>
            <button type="button" onClick={() => setProposal(null)} className="btn-ghost-gold focus-mist px-3 py-1.5 text-small">
              {tr("Descartar", "Discard")}
            </button>
          </div>
        )}
      </div>

      <aside className="space-y-5">
        {!sel ? (
          <p className="text-small text-muted-foreground">{tr("Selecciona un nodo del mapa.", "Select a node on the map.")}</p>
        ) : (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <Field label={tr("Texto del nodo", "Node text")} htmlFor="nd-label">
              <input id="nd-label" value={sel.label} maxLength={160} onChange={(e) => patchNode(sel.id, { label: e.target.value })} className={inputCls} />
            </Field>
            <Field label={tr("Tipo", "Type")} htmlFor="nd-kind">
              <select id="nd-kind" value={sel.kind} onChange={(e) => patchNode(sel.id, { kind: e.target.value as NodeKind })} className={inputCls}>
                {NODE_KINDS.map((k) => (
                  <option key={k} value={k}>{NODE_KIND_LABELS[k][lang]}</option>
                ))}
              </select>
            </Field>
            <Field label={tr("Nota", "Note")} htmlFor="nd-note">
              <textarea id="nd-note" value={sel.note} maxLength={1200} onChange={(e) => patchNode(sel.id, { note: e.target.value })} className={cn(inputCls, "min-h-20")} />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label={tr("Relación", "Relation")} value={relation} onChange={(e) => setRelation(e.target.value as Relation)} className={cn(inputCls, "w-auto py-1.5")}>
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>{RELATION_LABELS[r][lang]}</option>
                ))}
              </select>
              <button type="button" onClick={() => setConnectFrom(sel.id)} className="btn-ghost-gold focus-mist px-3 py-1.5 text-micro">
                {tr("Conectar con…", "Connect to…")}
              </button>
            </div>
            <div className="border-t border-border/60 pt-3">
              <p className="mb-2 text-micro text-muted-foreground">{tr("Ampliar con IA", "Expand with AI")}</p>
              <div className="flex gap-2">
                <select aria-label={tr("Acción", "Action")} value={aiAction} onChange={(e) => setAiAction(e.target.value as NodeAction)} className={cn(inputCls, "py-1.5")}>
                  {NODE_ACTIONS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label[lang]}</option>
                  ))}
                </select>
                <button type="button" onClick={askAi} disabled={busy} className="btn-ghost-gold focus-mist shrink-0 px-3 py-1.5 text-micro disabled:opacity-50">
                  {busy ? "…" : tr("Proponer", "Propose")}
                </button>
              </div>
              {err && <p role="alert" className="mt-2 text-small text-destructive">{err}</p>}
            </div>
            <button type="button" onClick={() => removeNode(sel.id)} className="text-micro text-muted-foreground underline hover:text-destructive">
              {tr("Eliminar nodo", "Delete node")}
            </button>
          </div>
        )}

        <div>
          <p className="label">{tr("Relaciones", "Relations")} ({content.edges.length})</p>
          <ul className="mt-2 max-h-80 space-y-1.5 overflow-auto pr-1">
            {content.edges.map((e) => (
              <li key={e.id} className="flex items-center gap-1.5 text-micro">
                <span className="min-w-0 flex-1 truncate text-foreground" title={byId.get(e.from)?.label}>{byId.get(e.from)?.label}</span>
                <select
                  aria-label={tr("Relación", "Relation")}
                  value={e.relation}
                  onChange={(ev) => setContent((c) => ({ ...c, edges: c.edges.map((x) => (x.id === e.id ? { ...x, relation: ev.target.value as Relation } : x)) }))}
                  className="focus-mist rounded border border-border bg-transparent px-1 text-micro text-muted-foreground"
                >
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>{RELATION_LABELS[r][lang]}</option>
                  ))}
                </select>
                <span className="min-w-0 flex-1 truncate text-foreground" title={byId.get(e.to)?.label}>{byId.get(e.to)?.label}</span>
                <button type="button" onClick={() => setContent((c) => ({ ...c, edges: c.edges.filter((x) => x.id !== e.id) }))} className="text-muted-foreground hover:text-destructive" aria-label={tr("Quitar relación", "Remove relation")}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
