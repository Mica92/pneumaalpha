import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { Maximize2, Minus, Plus, Redo2, Undo2 } from "lucide-react";
import {
  ARGUMENT_NODE_KINDS,
  ARGUMENT_RELATIONS,
  NODE_KINDS,
  RELATIONS,
  cleanEdges,
  edgeLogic,
  hiddenByCollapse,
  layoutArgument,
  layoutRadial,
  searchNodes,
  uid,
  type EdgeLogic,
  type MapContent,
  type MapEdge,
  type MapNode,
  type NodeDetail,
  type NodeKind,
  type Relation,
} from "@/lib/docente/model";
import { EDGE_LOGIC_LABELS, NODE_ACTIONS, NODE_KIND_LABELS, RELATION_LABELS, type NodeAction } from "@/lib/docente/catalog";
import { expandMapNode, exploreMapNode } from "@/lib/docente/docente-ai.functions";
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
  premise: "fill-card stroke-glacier",
  inference: "fill-bronze/10 stroke-bronze/80",
  conclusion: "fill-bronze/25 stroke-bronze",
};

const LOGIC_STROKE: Record<EdgeLogic, string> = {
  support: "stroke-sage",
  contradiction: "stroke-tension",
  question: "stroke-bronze-bright",
  conceptual: "stroke-muted-foreground",
};
const LOGIC_FILL: Record<EdgeLogic, string> = {
  support: "fill-sage",
  contradiction: "fill-tension",
  question: "fill-bronze-bright",
  conceptual: "fill-muted-foreground",
};
const LOGICS = Object.keys(LOGIC_STROKE) as EdgeLogic[];

type View = { x: number; y: number; w: number; h: number };
const FULL: View = { x: 0, y: 0, w: MAP_W, h: MAP_H };

function zoomView(v: View, factor: number, cx = v.x + v.w / 2, cy = v.y + v.h / 2): View {
  const w = Math.min(MAP_W * 2, Math.max(MAP_W / 5, v.w * factor));
  const h = (w / MAP_W) * MAP_H;
  return { x: cx - ((cx - v.x) * w) / v.w, y: cy - ((cy - v.y) * h) / v.h, w, h };
}

/* ───────────────────────── Canvas (shared by editor and presentation) ───────────────────────── */

type CanvasProps = {
  map: MapContent;
  view: View;
  setView: (v: View | ((v: View) => View)) => void;
  selected?: string | null;
  connectFrom?: string | null;
  proposedIds?: Set<string>;
  dimmedNodes?: Set<string>;
  hidden?: Set<string>;
  hiddenCount?: Map<string, number>;
  highlight?: Set<string>;
  logicFilter?: EdgeLogic | "";
  onNodeClick?: (id: string) => void;
  onBackgroundClick?: () => void;
  onDragStart?: (id: string) => void;
  onDrag?: (id: string, x: number, y: number) => void;
  className?: string;
  label: string;
};

export function MapCanvas({
  map,
  view,
  setView,
  selected,
  connectFrom,
  proposedIds,
  dimmedNodes,
  hidden,
  hiddenCount,
  highlight,
  logicFilter,
  onNodeClick,
  onBackgroundClick,
  onDragStart,
  onDrag,
  className,
  label,
}: CanvasProps) {
  const { lang } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number; started: boolean } | null>(null);
  const pan = useRef<{ cx: number; cy: number; v: View } | null>(null);
  const byId = new Map(map.nodes.map((n) => [n.id, n]));

  const toSvg = (e: { clientX: number; clientY: number }) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain wheel keeps scrolling the page
      e.preventDefault();
      const ctm = el.getScreenCTM();
      const p = ctm ? new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse()) : null;
      setView((v) => zoomView(v, e.deltaY > 0 ? 1.12 : 1 / 1.12, p?.x, p?.y));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setView]);

  return (
    <svg
      ref={svgRef}
      viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
      className={cn("block h-auto w-full touch-none select-none", pan.current ? "cursor-grabbing" : "cursor-default", className)}
      role="img"
      aria-label={label}
      onPointerDown={(e) => {
        if (e.target === svgRef.current || (e.target as Element).getAttribute("data-bg") === "1") {
          pan.current = { cx: e.clientX, cy: e.clientY, v: view };
          (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
        }
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (d && onDrag) {
          if (!d.started) {
            d.started = true;
            onDragStart?.(d.id);
          }
          const p = toSvg(e);
          onDrag(d.id, Math.round(Math.min(MAP_W - 20, Math.max(20, p.x - d.dx))), Math.round(Math.min(MAP_H - 20, Math.max(20, p.y - d.dy))));
          return;
        }
        const pn = pan.current;
        const el = svgRef.current;
        if (pn && el) {
          const k = pn.v.w / el.clientWidth;
          setView({ ...pn.v, x: pn.v.x - (e.clientX - pn.cx) * k, y: pn.v.y - (e.clientY - pn.cy) * k });
        }
      }}
      onPointerUp={(e) => {
        const wasPan = pan.current && (Math.abs(e.clientX - pan.current.cx) > 3 || Math.abs(e.clientY - pan.current.cy) > 3);
        if (pan.current && !wasPan) onBackgroundClick?.();
        drag.current = null;
        pan.current = null;
      }}
      onPointerLeave={() => {
        drag.current = null;
        pan.current = null;
      }}
    >
      <defs>
        {LOGICS.map((k) => (
          <marker key={k} id={`arrow-ui-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className={LOGIC_FILL[k]} />
          </marker>
        ))}
      </defs>
      <rect data-bg="1" x={-MAP_W} y={-MAP_H} width={MAP_W * 3} height={MAP_H * 3} className="fill-transparent" />
      {map.edges.map((e) => {
        const a = byId.get(e.from);
        const b = byId.get(e.to);
        if (!a || !b || hidden?.has(a.id) || hidden?.has(b.id)) return null;
        const p = edgeAnchor(a, b.x, b.y);
        const q = edgeAnchor(b, a.x, a.y);
        const logic = edgeLogic(e.relation);
        const proposed = proposedIds?.has(a.id) || proposedIds?.has(b.id);
        const dim = (logicFilter && logic !== logicFilter) || dimmedNodes?.has(a.id) || dimmedNodes?.has(b.id);
        return (
          <g key={e.id} className={cn("transition-opacity", dim ? "opacity-15" : proposed ? "opacity-60" : "")}>
            <line
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              className={LOGIC_STROKE[logic]}
              strokeWidth={logic === "conceptual" ? 1.2 : 1.6}
              strokeDasharray={logic === "contradiction" || logic === "question" || proposed ? "6 4" : undefined}
              markerEnd={`url(#arrow-ui-${logic})`}
            />
            <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 4} textAnchor="middle" className="pointer-events-none fill-muted-foreground" fontSize={11}>
              {RELATION_LABELS[e.relation][lang]}
            </text>
          </g>
        );
      })}
      {map.nodes.map((n) => {
        if (hidden?.has(n.id)) return null;
        const { w, h } = nodeSize(n);
        const lines = wrapLabel(n.label);
        const fs = n.kind === "central" || n.kind === "conclusion" ? 17 : 13.5;
        const start = n.y - ((lines.length - 1) * (fs + 2)) / 2 + fs / 3;
        const proposed = proposedIds?.has(n.id);
        const dim = dimmedNodes?.has(n.id);
        const lit = highlight?.has(n.id);
        const more = hiddenCount?.get(n.id) ?? 0;
        return (
          <g
            key={n.id}
            className={cn(onDrag ? "cursor-grab" : "cursor-pointer", "transition-opacity", proposed && "opacity-70", dim && "opacity-25")}
            tabIndex={proposed || !onNodeClick ? -1 : 0}
            role="button"
            aria-label={n.label}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNodeClick?.(n.id);
              }
            }}
            onPointerDown={(e) => {
              if (proposed || !onDrag) return;
              e.stopPropagation();
              const p = toSvg(e);
              drag.current = { id: n.id, dx: p.x - n.x, dy: p.y - n.y, started: false };
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!proposed) onNodeClick?.(n.id);
            }}
          >
            {lit && <rect x={n.x - w / 2 - 6} y={n.y - h / 2 - 6} width={w + 12} height={h + 12} rx={10} className="fill-none stroke-bronze-bright" strokeWidth={2} />}
            <rect
              x={n.x - w / 2}
              y={n.y - h / 2}
              width={w}
              height={h}
              rx={n.kind === "question" ? h / 2 : 6}
              className={cn(KIND_CLS[n.kind], selected === n.id && "stroke-foreground", connectFrom === n.id && "stroke-bronze-bright")}
              strokeWidth={selected === n.id ? 2.4 : n.kind === "central" || n.kind === "conclusion" ? 2 : 1.2}
              strokeDasharray={proposed ? "5 3" : undefined}
            />
            <text textAnchor="middle" fontSize={fs} className="pointer-events-none fill-foreground font-serif">
              {lines.map((l, i) => (
                <tspan key={i} x={n.x} y={start + i * (fs + 2)}>
                  {l}
                </tspan>
              ))}
            </text>
            {more > 0 && (
              <g className="pointer-events-none">
                <circle cx={n.x + w / 2} cy={n.y - h / 2} r={11} className="fill-bronze stroke-background" strokeWidth={1.5} />
                <text x={n.x + w / 2} y={n.y - h / 2 + 4} textAnchor="middle" fontSize={11} className="fill-background font-sans">
                  +{more}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ZoomControls({ setView }: { setView: (v: View | ((v: View) => View)) => void }) {
  const tr = useTr();
  const b = "focus-mist grid h-8 w-8 place-items-center rounded border border-border bg-background/80 text-muted-foreground hover:text-foreground";
  return (
    <div className="absolute right-2 top-2 flex gap-1">
      <button type="button" className={b} onClick={() => setView((v) => zoomView(v, 1 / 1.25))} aria-label={tr("Acercar", "Zoom in")}><Plus className="h-4 w-4" /></button>
      <button type="button" className={b} onClick={() => setView((v) => zoomView(v, 1.25))} aria-label={tr("Alejar", "Zoom out")}><Minus className="h-4 w-4" /></button>
      <button type="button" className={b} onClick={() => setView(FULL)} aria-label={tr("Ver todo el mapa", "Fit whole map")}><Maximize2 className="h-4 w-4" /></button>
    </div>
  );
}

/* ───────────────────────── Editor ───────────────────────── */

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
  const [view, setView] = useState<View>(FULL);
  const [selected, setSelected] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const argumentMode = content.mode === "argument";
  const [relation, setRelation] = useState<Relation>(argumentMode ? "grounds" : "relates");
  const [proposal, setProposal] = useState<{ nodes: MapNode[]; edges: MapEdge[] } | null>(null);
  const [detailProposal, setDetailProposal] = useState<{ nodeId: string; detail: NodeDetail } | null>(null);
  const [aiAction, setAiAction] = useState<NodeAction>("deepen");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<NodeKind | "">("");
  const [logicFilter, setLogicFilter] = useState<EdgeLogic | "">("");
  const [presenting, setPresenting] = useState(false);
  const expand = useServerFn(expandMapNode);
  const explore = useServerFn(exploreMapNode);

  /* Undo / redo — local to this editing session. Text edits within ~1 s coalesce into one step. */
  const past = useRef<MapContent[]>([]);
  const future = useRef<MapContent[]>([]);
  const lastKey = useRef({ key: "", t: 0 });
  const [, bump] = useState(0);
  const contentRef = useRef(content);
  contentRef.current = content;
  const pushHistory = useCallback((key = "") => {
    const now = Date.now();
    if (!(key && key === lastKey.current.key && now - lastKey.current.t < 1000)) {
      past.current.push(contentRef.current);
      if (past.current.length > 60) past.current.shift();
      future.current = [];
      bump((x) => x + 1);
    }
    lastKey.current = { key, t: now };
  }, []);
  const edit = useCallback(
    (u: (prev: MapContent) => MapContent, key = "") => {
      pushHistory(key);
      setContent(u);
    },
    [pushHistory, setContent],
  );
  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    future.current.push(contentRef.current);
    lastKey.current = { key: "", t: 0 };
    setContent(() => prev);
    bump((x) => x + 1);
  }, [setContent]);
  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current.push(contentRef.current);
    lastKey.current = { key: "", t: 0 };
    setContent(() => next);
    bump((x) => x + 1);
  }, [setContent]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const byId = new Map(content.nodes.map((n) => [n.id, n]));
  const sel = selected ? byId.get(selected) ?? null : null;

  const hidden = useMemo(() => hiddenByCollapse(content), [content]);
  const hiddenCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of content.edges) {
      for (const [hub, leaf] of [
        [e.from, e.to],
        [e.to, e.from],
      ]) {
        if (hidden.has(leaf) && byId.get(hub)?.collapsed) m.set(hub, (m.get(hub) ?? 0) + 1);
      }
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, hidden]);
  const matches = useMemo(() => searchNodes(content, query), [content, query]);
  const dimmed = useMemo(() => {
    const d = new Set<string>();
    for (const n of content.nodes) {
      if ((query.trim() && !matches.has(n.id)) || (kindFilter && n.kind !== kindFilter)) d.add(n.id);
    }
    return d;
  }, [content.nodes, matches, query, kindFilter]);

  function patchNode(id: string, p: Partial<MapNode>, key = "") {
    edit((c) => ({ ...c, nodes: c.nodes.map((n) => (n.id === id ? { ...n, ...p } : n)) }), key);
  }

  function clickNode(id: string) {
    if (connectFrom && connectFrom !== id) {
      edit((c) => {
        if (c.edges.some((e) => e.from === connectFrom && e.to === id)) return c;
        return { ...c, edges: [...c.edges, { id: uid("e"), from: connectFrom, to: id, relation }] };
      });
      setConnectFrom(null);
      setSelected(id);
      return;
    }
    setSelected(id);
  }

  function placeNear(base: MapNode | undefined, i = Math.random() * 8, total = 8) {
    const angle = (i / total) * Math.PI * 2 + Math.PI / 6;
    return {
      x: Math.round(Math.min(MAP_W - 80, Math.max(80, (base?.x ?? MAP_W / 2) + Math.cos(angle) * 190))),
      y: Math.round(Math.min(MAP_H - 50, Math.max(50, (base?.y ?? MAP_H / 2) + Math.sin(angle) * 140))),
    };
  }

  function addNode(kind: NodeKind = argumentMode ? "premise" : "concept", label = tr("Nuevo nodo", "New node"), rel?: Relation, note = "") {
    const base = sel ?? content.nodes[0];
    const n: MapNode = { id: uid("n"), label: label.slice(0, 160), kind, note, ...placeNear(base) };
    const r: Relation = rel ?? (argumentMode ? (kind === "premise" ? "grounds" : kind === "objection" ? "opposes" : "infers") : "relates");
    edit((c) => ({
      ...c,
      nodes: [...c.nodes, n],
      edges: base ? [...c.edges, argumentMode && kind === "premise" ? { id: uid("e"), from: n.id, to: base.id, relation: r } : { id: uid("e"), from: base.id, to: n.id, relation: r }] : c.edges,
    }));
    return n.id;
  }

  function removeNode(id: string) {
    edit((c) => cleanEdges({ ...c, nodes: c.nodes.filter((n) => n.id !== id) }));
    setSelected(null);
  }

  function setMode(argument: boolean) {
    edit((c) => {
      const next: MapContent = { ...c, mode: argument ? "argument" : "concept" };
      return argument ? layoutArgument(next, MAP_W, MAP_H) : next;
    });
    setRelation(argument ? "grounds" : "relates");
  }

  async function askAi() {
    if (!sel) return;
    setBusy("expand");
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
      setProposal({ nodes: r.nodes.map((n, i) => ({ ...n, ...placeNear(sel, i, Math.max(1, r.nodes.length)) })), edges: r.edges });
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(null);
    }
  }

  async function exploreNode() {
    if (!sel) return;
    setBusy("explore");
    setErr(null);
    try {
      const neighbours = content.edges
        .filter((e) => e.from === sel.id || e.to === sel.id)
        .map((e) => byId.get(e.from === sel.id ? e.to : e.from)?.label ?? "")
        .filter(Boolean)
        .slice(0, 40);
      const detail = await explore({
        data: { concept: meta.concept, discipline: meta.discipline, language: meta.language, nodeLabel: sel.label, nodeNote: sel.note, nodeKind: sel.kind, neighbours },
      });
      setDetailProposal({ nodeId: sel.id, detail });
    } catch (e) {
      setErr(errorText(e, lang));
    } finally {
      setBusy(null);
    }
  }

  const shown = proposal ? { ...content, nodes: [...content.nodes, ...proposal.nodes], edges: [...content.edges, ...proposal.edges] } : content;
  const proposedIds = new Set(proposal?.nodes.map((n) => n.id) ?? []);
  const kinds = argumentMode ? ARGUMENT_NODE_KINDS : NODE_KINDS;
  const relations = argumentMode ? ARGUMENT_RELATIONS : RELATIONS;
  const nonLogical = argumentMode ? content.edges.filter((e) => edgeLogic(e.relation) === "conceptual" && e.relation !== "presupposes") : [];
  const detailShown = detailProposal && sel && detailProposal.nodeId === sel.id ? detailProposal.detail : sel?.detail;
  const tool = "btn-ghost-gold focus-mist px-3 py-1.5 text-micro disabled:opacity-40";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_21rem]">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded border border-border" role="group" aria-label={tr("Tipo de mapa", "Map type")}>
            {[false, true].map((arg) => (
              <button
                key={String(arg)}
                type="button"
                aria-pressed={argumentMode === arg}
                onClick={() => argumentMode !== arg && setMode(arg)}
                className={cn("focus-mist px-3 py-1.5 text-micro", argumentMode === arg ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {arg ? tr("Argumentativo", "Argument") : tr("Conceptual", "Concept")}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setSelected(addNode())} className={tool}>
            {tr("Añadir nodo", "Add node")}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(argumentMode ? tr("¿Ordenar de premisas a conclusión?", "Arrange from premises to conclusion?") : tr("¿Reordenar todos los nodos alrededor del concepto central?", "Rearrange all nodes around the central concept?")))
                edit((c) => (argumentMode ? layoutArgument(c, MAP_W, MAP_H) : layoutRadial(c, MAP_W, MAP_H)));
            }}
            className={tool}
          >
            {tr("Ordenar automáticamente", "Auto-arrange")}
          </button>
          <button type="button" onClick={undo} disabled={past.current.length === 0} className={cn(tool, "px-2")} aria-label={tr("Deshacer", "Undo")} title={tr("Deshacer (Ctrl+Z)", "Undo (Ctrl+Z)")}>
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={redo} disabled={future.current.length === 0} className={cn(tool, "px-2")} aria-label={tr("Rehacer", "Redo")} title={tr("Rehacer (Ctrl+Shift+Z)", "Redo (Ctrl+Shift+Z)")}>
            <Redo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setPresenting(true)} className={tool}>
            {tr("Presentar", "Present")}
          </button>
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("Buscar en el mapa…", "Search the map…")}
            aria-label={tr("Buscar en el mapa", "Search the map")}
            className={cn(inputCls, "w-48 py-1.5 text-micro")}
          />
          {query.trim() && <span className="text-micro text-muted-foreground tabular-nums">{matches.size}</span>}
          <select aria-label={tr("Filtrar por tipo de nodo", "Filter by node type")} value={kindFilter} onChange={(e) => setKindFilter(e.target.value as NodeKind | "")} className={cn(inputCls, "w-auto py-1.5 text-micro")}>
            <option value="">{tr("Todos los nodos", "All nodes")}</option>
            {NODE_KINDS.filter((k) => content.nodes.some((n) => n.kind === k)).map((k) => (
              <option key={k} value={k}>{NODE_KIND_LABELS[k][lang]}</option>
            ))}
          </select>
          <select aria-label={tr("Filtrar relaciones", "Filter relations")} value={logicFilter} onChange={(e) => setLogicFilter(e.target.value as EdgeLogic | "")} className={cn(inputCls, "w-auto py-1.5 text-micro")}>
            <option value="">{tr("Todas las relaciones", "All relations")}</option>
            {LOGICS.map((k) => (
              <option key={k} value={k}>{EDGE_LOGIC_LABELS[k][lang]}</option>
            ))}
          </select>
          {connectFrom && (
            <span className="text-micro text-bronze-bright">
              {tr("Elige el nodo de destino…", "Pick the target node…")}{" "}
              <button type="button" className="underline" onClick={() => setConnectFrom(null)}>
                {tr("Cancelar", "Cancel")}
              </button>
            </span>
          )}
        </div>
        <div className="relative overflow-hidden rounded-lg border border-border bg-card/40">
          <MapCanvas
            map={shown}
            view={view}
            setView={setView}
            selected={selected}
            connectFrom={connectFrom}
            proposedIds={proposedIds}
            dimmedNodes={dimmed}
            hidden={hidden}
            hiddenCount={hiddenCount}
            highlight={query.trim() ? matches : undefined}
            logicFilter={logicFilter}
            onNodeClick={clickNode}
            onBackgroundClick={() => setSelected(null)}
            onDragStart={(id) => pushHistory(`drag-${id}-${Date.now()}`)}
            onDrag={(id, x, y) => setContent((c) => ({ ...c, nodes: c.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) }))}
            label={tr("Mapa editable", "Editable map")}
          />
          <ZoomControls setView={setView} />
        </div>
        <Legend />
        <p className="mt-1 text-micro text-muted-foreground">
          {tr(
            "Arrastra los nodos para moverlos y el fondo para desplazarte; Ctrl + rueda para acercar. Selecciona un nodo para editarlo, explorarlo o ampliarlo.",
            "Drag nodes to move them and the background to pan; Ctrl + wheel to zoom. Select a node to edit, explore or expand it.",
          )}
        </p>
        {argumentMode && (
          <p className="mt-2 rounded-md border border-border px-3 py-2 text-small text-muted-foreground">
            {tr(
              "Modo argumentativo: premisas → inferencias → conclusión. Que dos ideas estén cerca no las vuelve una relación lógica: usa «fundamenta» o «permite inferir» para el apoyo, «se opone a» para la contradicción y «cuestiona» para la duda.",
              "Argument mode: premises → inferences → conclusion. Being close is not a logical relation: use “grounds” or “leads to” for support, “opposes” for contradiction and “questions” for doubt.",
            )}
            {nonLogical.length > 0 && (
              <span className="mt-1 block text-bronze-bright">
                {tr(`${nonLogical.length} relación(es) solo conceptual(es): revísalas en la lista.`, `${nonLogical.length} relation(s) are only conceptual: review them in the list.`)}
              </span>
            )}
          </p>
        )}
        {proposal && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-bronze/50 p-3">
            <span className="text-small text-foreground">
              {tr(`${proposal.nodes.length} nodos propuestos (en línea discontinua).`, `${proposal.nodes.length} proposed nodes (dashed).`)}
            </span>
            <button
              type="button"
              onClick={() => {
                edit((c) => cleanEdges({ ...c, nodes: [...c.nodes, ...proposal.nodes], edges: [...c.edges, ...proposal.edges] }));
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

      <aside className="min-w-0 space-y-5">
        {!sel ? (
          <p className="text-small text-muted-foreground">{tr("Selecciona un nodo del mapa.", "Select a node on the map.")}</p>
        ) : (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <Field label={tr("Texto del nodo", "Node text")} htmlFor="nd-label">
              <input id="nd-label" value={sel.label} maxLength={160} onChange={(e) => patchNode(sel.id, { label: e.target.value }, `label-${sel.id}`)} className={inputCls} />
            </Field>
            <Field label={tr("Tipo", "Type")} htmlFor="nd-kind">
              <select id="nd-kind" value={sel.kind} onChange={(e) => patchNode(sel.id, { kind: e.target.value as NodeKind })} className={inputCls}>
                {(kinds.includes(sel.kind) ? kinds : [sel.kind, ...kinds]).map((k) => (
                  <option key={k} value={k}>{NODE_KIND_LABELS[k][lang]}</option>
                ))}
              </select>
            </Field>
            <Field label={tr("Nota", "Note")} htmlFor="nd-note">
              <textarea id="nd-note" value={sel.note} maxLength={1200} onChange={(e) => patchNode(sel.id, { note: e.target.value }, `note-${sel.id}`)} className={cn(inputCls, "min-h-20")} />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label={tr("Relación", "Relation")} value={relation} onChange={(e) => setRelation(e.target.value as Relation)} className={cn(inputCls, "w-auto py-1.5")}>
                {relations.map((r) => (
                  <option key={r} value={r}>{RELATION_LABELS[r][lang]}</option>
                ))}
              </select>
              <button type="button" onClick={() => setConnectFrom(sel.id)} className={tool}>
                {tr("Conectar con…", "Connect to…")}
              </button>
            </div>
            <label className="flex items-center gap-2 text-micro text-muted-foreground">
              <input type="checkbox" checked={Boolean(sel.collapsed)} onChange={(e) => patchNode(sel.id, { collapsed: e.target.checked || undefined })} />
              {tr("Contraer sus ramas (oculta los nodos que solo cuelgan de este)", "Collapse its branches (hides nodes hanging only from this one)")}
            </label>

            <div className="border-t border-border/60 pt-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-micro text-muted-foreground">{tr("Explorar este nodo", "Explore this node")}</p>
                <button type="button" onClick={exploreNode} disabled={busy !== null} className={tool}>
                  {busy === "explore" ? "…" : sel.detail ? tr("Volver a explorar", "Explore again") : tr("Explorar", "Explore")}
                </button>
              </div>
              {detailShown && (
                <NodeDetailView
                  detail={detailShown}
                  onAdd={(label, kind, rel) => addNode(kind, label, rel)}
                />
              )}
              {detailProposal && detailProposal.nodeId === sel.id && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-gold focus-mist px-3 py-1.5 text-micro"
                    onClick={() => {
                      patchNode(sel.id, { detail: detailProposal.detail });
                      setDetailProposal(null);
                    }}
                  >
                    {tr("Guardar en el nodo", "Keep on this node")}
                  </button>
                  <button type="button" className={tool} onClick={() => setDetailProposal(null)}>
                    {tr("Descartar", "Discard")}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-border/60 pt-3">
              <p className="mb-2 text-micro text-muted-foreground">{tr("Ampliar con IA", "Expand with AI")}</p>
              <div className="flex gap-2">
                <select aria-label={tr("Acción", "Action")} value={aiAction} onChange={(e) => setAiAction(e.target.value as NodeAction)} className={cn(inputCls, "py-1.5")}>
                  {NODE_ACTIONS.map((a) => (
                    <option key={a.id} value={a.id}>{a.label[lang]}</option>
                  ))}
                </select>
                <button type="button" onClick={askAi} disabled={busy !== null} className={cn(tool, "shrink-0")}>
                  {busy === "expand" ? "…" : tr("Proponer", "Propose")}
                </button>
              </div>
            </div>
            {err && <p role="alert" className="text-small text-destructive">{err}</p>}
            <button type="button" onClick={() => removeNode(sel.id)} className="text-micro text-muted-foreground underline hover:text-destructive">
              {tr("Eliminar nodo", "Delete node")}
            </button>
          </div>
        )}

        <div>
          <p className="label">{tr("Relaciones", "Relations")} ({content.edges.length})</p>
          <ul className="mt-2 max-h-80 space-y-1.5 overflow-auto pr-1">
            {content.edges.map((e) => {
              const flagged = nonLogical.includes(e);
              return (
                <li key={e.id} className={cn("flex items-center gap-1.5 text-micro", flagged && "rounded bg-bronze/10 px-1")}>
                  <span className="min-w-0 flex-1 truncate text-foreground" title={byId.get(e.from)?.label}>{byId.get(e.from)?.label}</span>
                  <select
                    aria-label={tr("Relación", "Relation")}
                    value={e.relation}
                    onChange={(ev) => edit((c) => ({ ...c, edges: c.edges.map((x) => (x.id === e.id ? { ...x, relation: ev.target.value as Relation } : x)) }))}
                    className="focus-mist rounded border border-border bg-transparent px-1 text-micro text-muted-foreground"
                  >
                    {(relations.includes(e.relation) ? relations : [e.relation, ...relations]).map((r) => (
                      <option key={r} value={r}>{RELATION_LABELS[r][lang]}</option>
                    ))}
                  </select>
                  <span className="min-w-0 flex-1 truncate text-foreground" title={byId.get(e.to)?.label}>{byId.get(e.to)?.label}</span>
                  <button type="button" onClick={() => edit((c) => ({ ...c, edges: c.edges.filter((x) => x.id !== e.id) }))} className="text-muted-foreground hover:text-destructive" aria-label={tr("Quitar relación", "Remove relation")}>✕</button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {presenting && <MapPresentation map={content} onClose={() => setPresenting(false)} />}
    </div>
  );
}

function Legend() {
  const { lang } = useI18n();
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-micro text-muted-foreground" aria-label="Legend">
      {LOGICS.map((k) => (
        <li key={k} className="flex items-center gap-1.5">
          <svg width="22" height="6" aria-hidden="true">
            <line x1="0" y1="3" x2="22" y2="3" className={LOGIC_STROKE[k]} strokeWidth={2} strokeDasharray={k === "contradiction" || k === "question" ? "5 3" : undefined} />
          </svg>
          {EDGE_LOGIC_LABELS[k][lang]}
        </li>
      ))}
    </ul>
  );
}

function NodeDetailView({ detail, onAdd }: { detail: NodeDetail; onAdd?: (label: string, kind: NodeKind, rel: Relation) => void }) {
  const tr = useTr();
  const groups: { key: keyof NodeDetail; title: string; kind?: NodeKind; rel?: Relation; trim?: boolean }[] = [
    { key: "interpretations", title: tr("Interpretaciones", "Interpretations") },
    { key: "authors", title: tr("Autores", "Authors"), kind: "author", rel: "develops", trim: true },
    { key: "related", title: tr("Conceptos relacionados", "Related concepts"), kind: "concept", rel: "relates" },
    { key: "objections", title: tr("Objeciones", "Objections"), kind: "objection", rel: "opposes" },
    { key: "applications", title: tr("Aplicaciones", "Applications"), kind: "case", rel: "applies" },
    { key: "bibliography", title: tr("Bibliografía sugerida (verificar)", "Suggested bibliography (verify)") },
    { key: "questions", title: tr("Preguntas de discusión", "Discussion questions"), kind: "question", rel: "questions" },
  ];
  return (
    <div className="mt-3 max-h-[28rem] space-y-3 overflow-auto pr-1 text-small">
      {detail.definition && <p className="text-foreground">{detail.definition}</p>}
      {groups.map((g) => {
        const items = detail[g.key] as string[];
        if (!items?.length) return null;
        return (
          <div key={g.key}>
            <p className="label">{g.title}</p>
            <ul className="mt-1 space-y-1">
              {items.map((it, i) => (
                <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                  <span className="min-w-0 flex-1">{it}</span>
                  {onAdd && g.kind && g.rel && (
                    <button
                      type="button"
                      className="focus-mist shrink-0 rounded px-1 text-micro text-bronze-bright hover:bg-muted"
                      onClick={() => onAdd(g.trim ? it.split(":")[0] : it, g.kind!, g.rel!)}
                      aria-label={tr(`Añadir «${it}» al mapa`, `Add “${it}” to the map`)}
                      title={tr("Añadir al mapa", "Add to map")}
                    >
                      +
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Presentation ───────────────────────── */

/** Order for walking a map in class: central/conclusion first, then breadth-first along relations. */
function presentationOrder(map: MapContent): MapNode[] {
  const start = map.nodes.find((n) => n.kind === "central" || n.kind === "conclusion") ?? map.nodes[0];
  if (!start) return [];
  const seen = new Set([start.id]);
  const order = [start];
  for (let i = 0; i < order.length; i++) {
    for (const e of map.edges) {
      const other = e.from === order[i].id ? e.to : e.to === order[i].id ? e.from : null;
      const n = other ? map.nodes.find((x) => x.id === other) : undefined;
      if (n && !seen.has(n.id)) {
        seen.add(n.id);
        order.push(n);
      }
    }
  }
  for (const n of map.nodes) if (!seen.has(n.id)) order.push(n);
  return order;
}

export function MapPresentation({ map, onClose }: { map: MapContent; onClose: () => void }) {
  const tr = useTr();
  const { lang } = useI18n();
  const order = useMemo(() => presentationOrder(map), [map]);
  const [i, setI] = useState(0);
  const [view, setView] = useState<View>(FULL);
  const focus = order[i];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") setI((x) => Math.min(order.length - 1, x + 1));
      if (e.key === "ArrowLeft" || e.key === "PageUp") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => undefined);
    };
  }, [order.length, onClose]);
  const near = useMemo(() => {
    const s = new Set<string>();
    if (!focus) return s;
    s.add(focus.id);
    for (const e of map.edges) {
      if (e.from === focus.id) s.add(e.to);
      if (e.to === focus.id) s.add(e.from);
    }
    return s;
  }, [focus, map.edges]);
  const dimmed = new Set(map.nodes.filter((n) => !near.has(n.id)).map((n) => n.id));
  // Portal: page containers use transforms, which would trap a fixed overlay below the site header.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={tr("Presentación del mapa", "Map presentation")} className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-3 text-small text-muted-foreground">
        <span className="tabular-nums">{order.length ? i + 1 : 0} / {order.length}</span>
        <button type="button" onClick={onClose} className="focus-mist ml-auto underline">
          {tr("Salir (Esc)", "Exit (Esc)")}
        </button>
      </div>
      <div className="grid min-h-0 flex-1 gap-6 overflow-auto p-6 lg:grid-cols-[1fr_24rem]">
        <div className="relative min-h-0">
          <MapCanvas map={map} view={view} setView={setView} dimmedNodes={dimmed} highlight={focus ? new Set([focus.id]) : undefined} onNodeClick={(id) => setI(Math.max(0, order.findIndex((n) => n.id === id)))} label={tr("Mapa en presentación", "Map in presentation")} />
          <ZoomControls setView={setView} />
        </div>
        {focus && (
          <div className="self-start">
            <p className="label">{NODE_KIND_LABELS[focus.kind][lang]}</p>
            <h2 className="mt-2 font-serif text-display font-light text-foreground">{focus.label}</h2>
            {focus.note && <p className="mt-4 text-body text-foreground">{focus.note}</p>}
            {focus.detail?.definition && <p className="mt-4 text-body text-muted-foreground">{focus.detail.definition}</p>}
            {focus.detail?.questions.length ? (
              <ul className="mt-4 space-y-1 text-small text-muted-foreground">
                {focus.detail.questions.map((q, k) => <li key={k}>— {q}</li>)}
              </ul>
            ) : null}
          </div>
        )}
      </div>
      <div className="flex justify-between border-t border-border/60 px-6 py-3">
        <PresBtn disabled={i === 0} onClick={() => setI((x) => Math.max(0, x - 1))}>← {tr("Anterior", "Previous")}</PresBtn>
        <PresBtn disabled={i >= order.length - 1} onClick={() => setI((x) => Math.min(order.length - 1, x + 1))}>{tr("Siguiente", "Next")} →</PresBtn>
      </div>
    </div>,
    document.body,
  );
}

function PresBtn({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-ghost-gold focus-mist px-4 py-2 text-small disabled:opacity-40">
      {children}
    </button>
  );
}
