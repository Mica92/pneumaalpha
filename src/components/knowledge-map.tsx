import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GRAPH_LINKS,
  GRAPH_NODES,
  KIND_LABEL,
  NODE_BY_ID,
  type GraphNode,
  type NodeKind,
} from "@/lib/knowledge-graph";
import { useI18n } from "@/lib/i18n";

type Sim = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  deg: number;
};

const KIND_ORDER: NodeKind[] = ["philosopher", "idea", "movement", "ideology", "religion"];

const KIND_VAR: Record<NodeKind, string> = {
  philosopher: "--glacier-bright",
  idea: "--foreground",
  movement: "--sage",
  ideology: "--glacier",
  religion: "--mist",
};

export const KIND_DOT: Record<NodeKind, string> = {
  philosopher: "bg-glacier-bright",
  idea: "bg-foreground",
  movement: "bg-sage",
  ideology: "bg-glacier",
  religion: "bg-mist",
};

function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

export function KnowledgeMap({
  selected,
  onSelect,
  activeKinds,
  query,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  activeKinds: Set<NodeKind>;
  query: string;
}) {
  const { lang } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  const viewRef = useRef({ x: 0, y: 0, k: 0.85 });
  const dragRef = useRef<{ mode: "none" | "pan" | "node"; id?: string; px: number; py: number }>({
    mode: "none",
    px: 0,
    py: 0,
  });
  const stateRef = useRef<{ nodes: Map<string, Sim>; alpha: number }>({
    nodes: new Map(),
    alpha: 1,
  });
  const selectedRef = useRef<string | null>(selected);
  const hoverRef = useRef<string | null>(null);
  const kindsRef = useRef(activeKinds);
  const queryRef = useRef(query);

  selectedRef.current = selected;
  hoverRef.current = hover;
  kindsRef.current = activeKinds;
  queryRef.current = query;

  // adjacency for highlight
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of GRAPH_LINKS) {
      if (!m.has(l.source)) m.set(l.source, new Set());
      if (!m.has(l.target)) m.set(l.target, new Set());
      m.get(l.source)!.add(l.target);
      m.get(l.target)!.add(l.source);
    }
    return m;
  }, []);

  // init positions once
  if (stateRef.current.nodes.size === 0) {
    const deg = new Map<string, number>();
    for (const l of GRAPH_LINKS) {
      deg.set(l.source, (deg.get(l.source) ?? 0) + 1);
      deg.set(l.target, (deg.get(l.target) ?? 0) + 1);
    }
    GRAPH_NODES.forEach((n, i) => {
      const a = (i / GRAPH_NODES.length) * Math.PI * 2;
      const rad = 260 + ((i * 37) % 180);
      const d = deg.get(n.id) ?? 1;
      stateRef.current.nodes.set(n.id, {
        id: n.id,
        x: Math.cos(a) * rad,
        y: Math.sin(a) * rad,
        vx: 0,
        vy: 0,
        r: 5 + Math.min(9, d * 0.9),
        deg: d,
      });
    });
  }

  const reheat = useCallback(() => {
    stateRef.current.alpha = Math.max(stateRef.current.alpha, 0.5);
  }, []);

  useEffect(() => {
    reheat();
  }, [selected, reheat]);

  // main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;

    // canvas cannot read CSS custom properties — resolve them once.
    const cs = getComputedStyle(document.documentElement);
    const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    const palette = {
      foreground: v("--foreground", "#e8eef2"),
      background: v("--background", "#0b0f12"),
      glacier: v("--glacier", "#3a4a55"),
      glacierBright: v("--glacier-bright", "#a8c4d6"),
      sage: v("--sage", "#9dc3ae"),
      mist: v("--mist", "#a8b8c2"),
    };
    const kindColor: Record<NodeKind, string> = {
      philosopher: palette.glacierBright,
      idea: palette.foreground,
      movement: palette.sage,
      ideology: palette.glacier,
      religion: palette.mist,
    };
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const nodes = stateRef.current.nodes;

    const step = () => {
      const s = stateRef.current;
      if (s.alpha > 0.004) {
        const list = [...nodes.values()];
        // repulsion
        for (let i = 0; i < list.length; i++) {
          const a = list[i];
          for (let j = i + 1; j < list.length; j++) {
            const b = list[j];
            let dx = b.x - a.x;
            let dy = b.y - a.y;
            let d2 = dx * dx + dy * dy;
            if (d2 < 1) {
              dx = (Math.random() - 0.5) * 2;
              dy = (Math.random() - 0.5) * 2;
              d2 = 4;
            }
            const f = 3800 / d2;
            const d = Math.sqrt(d2);
            const fx = (dx / d) * f;
            const fy = (dy / d) * f;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
        // springs
        for (const l of GRAPH_LINKS) {
          const a = nodes.get(l.source);
          const b = nodes.get(l.target);
          if (!a || !b) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const target = l.kind === "opposition" ? 210 : 130;
          const f = (d - target) * 0.02;
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
        // centering + integrate
        for (const n of list) {
          n.vx -= n.x * 0.004;
          n.vy -= n.y * 0.004;
          n.vx *= 0.82;
          n.vy *= 0.82;
          n.x += n.vx * s.alpha;
          n.y += n.vy * s.alpha;
        }
        s.alpha *= 0.992;
      }

      // ─ render ─
      const view = viewRef.current;
      const sel = selectedRef.current;
      const hov = hoverRef.current;
      const focus = hov ?? sel;
      const near = focus ? (adjacency.get(focus) ?? new Set<string>()) : null;
      const kinds = kindsRef.current;
      const q = queryRef.current.trim().toLowerCase();

      const visible = (id: string) => {
        const n = NODE_BY_ID.get(id);
        if (!n) return false;
        if (!kinds.has(n.kind)) return false;
        if (q && !n.label.toLowerCase().includes(q)) return false;
        return true;
      };

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2 + view.x, h / 2 + view.y);
      ctx.scale(view.k, view.k);

      // links
      for (const l of GRAPH_LINKS) {
        const a = nodes.get(l.source);
        const b = nodes.get(l.target);
        if (!a || !b) continue;
        if (!visible(l.source) || !visible(l.target)) continue;
        const active = focus ? l.source === focus || l.target === focus : false;
        ctx.globalAlpha = focus ? (active ? 0.75 : 0.06) : 0.18;
        ctx.strokeStyle =
          l.kind === "opposition" ? palette.sage : active ? palette.glacierBright : palette.mist;
        ctx.lineWidth = (active ? 1.2 : 0.7) / view.k;
        if (l.kind === "opposition") ctx.setLineDash([4 / view.k, 4 / view.k]);
        else ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // nodes
      for (const n of GRAPH_NODES) {
        const p = nodes.get(n.id);
        if (!p || !visible(n.id)) continue;
        const isFocus = focus === n.id;
        const isNear = near ? near.has(n.id) : false;
        const dim = focus ? !isFocus && !isNear : false;
        ctx.globalAlpha = dim ? 0.16 : 1;

        if (isFocus) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 8 / view.k, 0, Math.PI * 2);
          ctx.fillStyle = palette.glacier;
          ctx.globalAlpha = 0.18;
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = kindColor[n.kind];
        ctx.globalAlpha = dim ? 0.16 : n.kind === "idea" ? 0.75 : 0.95;
        ctx.fill();
        ctx.globalAlpha = dim ? 0.16 : 1;
        ctx.lineWidth = 1 / view.k;
        ctx.strokeStyle = palette.background;
        ctx.stroke();

        // labels
        const showLabel = view.k > 0.75 || p.deg >= 5 || isFocus || isNear;
        if (showLabel) {
          ctx.globalAlpha = dim ? 0.12 : isFocus || isNear ? 0.95 : 0.55;
          ctx.fillStyle = palette.foreground;
          ctx.font = `${(isFocus ? 13 : 11) / view.k}px Manrope, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(n.label, p.x, p.y + p.r + 4 / view.k);
        }
      }

      ctx.restore();
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // ── pointer helpers ──
    const toWorld = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const view = viewRef.current;
      return {
        x: (clientX - rect.left - rect.width / 2 - view.x) / view.k,
        y: (clientY - rect.top - rect.height / 2 - view.y) / view.k,
      };
    };
    const pick = (clientX: number, clientY: number) => {
      const { x, y } = toWorld(clientX, clientY);
      let best: string | null = null;
      let bestD = Infinity;
      for (const n of GRAPH_NODES) {
        if (!kindsRef.current.has(n.kind)) continue;
        const p = nodes.get(n.id);
        if (!p) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < p.r + 10 / viewRef.current.k && d < bestD) {
          bestD = d;
          best = n.id;
        }
      }
      return best;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const view = viewRef.current;
      const next = clamp(view.k * Math.exp(-dy * 0.0015), 0.25, 3);
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left - rect.width / 2;
      const py = e.clientY - rect.top - rect.height / 2;
      const ratio = next / view.k;
      view.x = px - (px - view.x) * ratio;
      view.y = py - (py - view.y) * ratio;
      view.k = next;
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const id = pick(e.clientX, e.clientY);
      dragRef.current = {
        mode: id ? "node" : "pan",
        id: id ?? undefined,
        px: e.clientX,
        py: e.clientY,
      };
    };
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (d.mode === "none") {
        const id = pick(e.clientX, e.clientY);
        setHover((prev) => (prev === id ? prev : id));
        canvas.style.cursor = id ? "pointer" : "grab";
        return;
      }
      const dx = e.clientX - d.px;
      const dy = e.clientY - d.py;
      d.px = e.clientX;
      d.py = e.clientY;
      if (d.mode === "pan") {
        viewRef.current.x += dx;
        viewRef.current.y += dy;
        canvas.style.cursor = "grabbing";
      } else if (d.id) {
        const p = nodes.get(d.id);
        if (p) {
          p.x += dx / viewRef.current.k;
          p.y += dy / viewRef.current.k;
          p.vx = 0;
          p.vy = 0;
        }
        stateRef.current.alpha = Math.max(stateRef.current.alpha, 0.35);
      }
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      const moved = Math.abs(e.clientX - d.px) + Math.abs(e.clientY - d.py);
      if (d.mode === "node" && d.id && moved < 6) onSelect(d.id);
      if (d.mode === "pan" && moved < 6) onSelect(null);
      dragRef.current = { mode: "none", px: 0, py: 0 };
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", () => setHover(null));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [adjacency, onSelect]);

  const zoomBy = (factor: number) => {
    const view = viewRef.current;
    view.k = clamp(view.k * factor, 0.25, 3);
  };
  const reset = () => {
    viewRef.current = { x: 0, y: 0, k: 0.85 };
    reheat();
  };

  const hoverNode: GraphNode | undefined = hover ? NODE_BY_ID.get(hover) : undefined;

  return (
    <div
      ref={wrapRef}
      className="relative h-[62vh] min-h-[420px] w-full overflow-hidden rounded-xl border border-border bg-card/40 backdrop-blur-sm md:h-[70vh]"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        style={{ cursor: "grab" }}
      />

      {/* zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        {[
          { label: "+", fn: () => zoomBy(1.25) },
          { label: "−", fn: () => zoomBy(0.8) },
          { label: "◎", fn: reset },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.fn}
            className="h-8 w-8 rounded-md border border-border bg-background/70 text-sm text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            {b.label}
          </button>
        ))}
      </div>

      {hoverNode && (
        <div className="pointer-events-none absolute left-4 top-4 max-w-xs rounded-lg border border-border bg-background/85 p-3 backdrop-blur">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {KIND_LABEL[hoverNode.kind][lang]}
            {hoverNode.era ? ` · ${hoverNode.era}` : ""}
          </p>
          <p className="mt-1 font-display text-sm text-foreground">{hoverNode.label}</p>
        </div>
      )}
    </div>
  );
}
