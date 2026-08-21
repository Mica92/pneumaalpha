import { useCallback, useEffect, useRef, useState } from "react";
import type { EntityKind, RelationKind } from "@/lib/atlas";

export type AtlasViewNode = {
  id: string;
  kind: EntityKind;
  label: string;
  /** 0–1: importancia relativa (grado, frecuencia de exploración…). */
  weight?: number;
  /** Nodo fijado al centro (nodo TÚ). */
  pinned?: boolean;
  /** Ya visitado por el usuario: se marca con un halo. */
  visited?: boolean;
};

export type AtlasViewLink = {
  source: string;
  target: string;
  kind: RelationKind;
};

type Sim = { id: string; x: number; y: number; vx: number; vy: number; r: number };

type Props = {
  nodes: AtlasViewNode[];
  links: AtlasViewLink[];
  focus: string | null;
  onSelect: (id: string | null) => void;
  onSelectLink?: (source: string, target: string) => void;
  className?: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const BASE_R: Record<EntityKind, number> = {
  self: 16,
  domain: 15,
  school: 11,
  philosopher: 8,
  concept: 7,
  question: 9,
};

function drawShape(
  ctx: CanvasRenderingContext2D,
  kind: EntityKind,
  x: number,
  y: number,
  r: number,
) {
  ctx.beginPath();
  if (kind === "concept") {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (kind === "question") {
    const w = r * 2.4;
    const h = r * 1.25;
    const rad = h / 2;
    ctx.moveTo(x - w / 2 + rad, y - h / 2);
    ctx.lineTo(x + w / 2 - rad, y - h / 2);
    ctx.arc(x + w / 2 - rad, y, rad, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x - w / 2 + rad, y + h / 2);
    ctx.arc(x - w / 2 + rad, y, rad, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
  } else if (kind === "school") {
    const s = r * 1.7;
    const rad = r * 0.35;
    ctx.moveTo(x - s / 2 + rad, y - s / 2);
    ctx.arcTo(x + s / 2, y - s / 2, x + s / 2, y + s / 2, rad);
    ctx.arcTo(x + s / 2, y + s / 2, x - s / 2, y + s / 2, rad);
    ctx.arcTo(x - s / 2, y + s / 2, x - s / 2, y - s / 2, rad);
    ctx.arcTo(x - s / 2, y - s / 2, x + s / 2, y - s / 2, rad);
    ctx.closePath();
  } else {
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
}

export function AtlasCanvas({ nodes, links, focus, onSelect, onSelectLink, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  const viewRef = useRef({ x: 0, y: 0, k: 0.95 });
  const simRef = useRef(new Map<string, Sim>());
  const alphaRef = useRef(1);
  const nodesRef = useRef(nodes);
  const linksRef = useRef(links);
  const focusRef = useRef(focus);
  const hoverRef = useRef<string | null>(null);
  const appearRef = useRef(new Map<string, number>());
  const dragRef = useRef<{ mode: "none" | "pan" | "node"; id?: string; px: number; py: number }>({
    mode: "none",
    px: 0,
    py: 0,
  });

  nodesRef.current = nodes;
  linksRef.current = links;
  focusRef.current = focus;
  hoverRef.current = hover;

  const reheat = useCallback(() => {
    alphaRef.current = Math.max(alphaRef.current, 0.6);
  }, []);

  // Alta y baja de nodos: aparición progresiva desde el nodo que los trajo.
  useEffect(() => {
    const sim = simRef.current;
    const now = performance.now();
    const present = new Set(nodes.map((n) => n.id));
    for (const id of [...sim.keys()]) if (!present.has(id)) sim.delete(id);
    nodes.forEach((n, i) => {
      if (sim.has(n.id)) return;
      const parent = links.find((l) => l.target === n.id || l.source === n.id);
      const anchorId = parent ? (parent.source === n.id ? parent.target : parent.source) : null;
      const anchor = anchorId ? sim.get(anchorId) : undefined;
      const a = (i / Math.max(1, nodes.length)) * Math.PI * 2 + Math.random();
      const rad = anchor ? 60 + Math.random() * 40 : 180 + Math.random() * 120;
      sim.set(n.id, {
        id: n.id,
        x: (anchor?.x ?? 0) + Math.cos(a) * rad,
        y: (anchor?.y ?? 0) + Math.sin(a) * rad,
        vx: 0,
        vy: 0,
        r: BASE_R[n.kind] * (0.85 + (n.weight ?? 0.3) * 0.7),
      });
      appearRef.current.set(n.id, now);
    });
    for (const n of nodes) {
      const p = sim.get(n.id);
      if (p) p.r = BASE_R[n.kind] * (0.85 + (n.weight ?? 0.3) * 0.7);
    }
    reheat();
  }, [nodes, links, reheat]);

  useEffect(() => {
    reheat();
  }, [focus, reheat]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(document.documentElement);
    const v = (name: string, fallback: string) => {
      const raw = cs.getPropertyValue(name).trim();
      if (!raw) return fallback;
      return raw.startsWith("oklch") || raw.startsWith("#") || raw.startsWith("rgb")
        ? raw
        : `oklch(${raw})`;
    };
    const palette = {
      fg: v("--foreground", "#f2efe8"),
      bg: v("--background", "#0b0b0d"),
      accent: v("--primary", "#b89a62"),
      muted: v("--muted-foreground", "#8d8a83"),
      border: v("--border", "#26262a"),
    };
    const colorFor = (kind: EntityKind) =>
      kind === "philosopher" || kind === "self"
        ? palette.accent
        : kind === "concept"
          ? palette.fg
          : kind === "question"
            ? palette.accent
            : palette.muted;

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

    const step = () => {
      const sim = simRef.current;
      const list = [...sim.values()];
      const currentNodes = nodesRef.current;
      const nodeById = new Map(currentNodes.map((n) => [n.id, n]));

      if (alphaRef.current > 0.004 && list.length) {
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
            const f = 5200 / d2;
            const d = Math.sqrt(d2);
            const fx = (dx / d) * f;
            const fy = (dy / d) * f;
            a.vx -= fx;
            a.vy -= fy;
            b.vx += fx;
            b.vy += fy;
          }
        }
        for (const l of linksRef.current) {
          const a = sim.get(l.source);
          const b = sim.get(l.target);
          if (!a || !b) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const target = l.kind === "opposedTo" ? 220 : 140;
          const f = (d - target) * 0.022;
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
        for (const n of list) {
          const meta = nodeById.get(n.id);
          if (meta?.pinned) {
            n.x = 0;
            n.y = 0;
            n.vx = 0;
            n.vy = 0;
            continue;
          }
          n.vx -= n.x * 0.005;
          n.vy -= n.y * 0.005;
          n.vx *= 0.8;
          n.vy *= 0.8;
          n.x += n.vx * alphaRef.current;
          n.y += n.vy * alphaRef.current;
        }
        alphaRef.current *= 0.99;
      }

      // ── render ──
      const view = viewRef.current;
      const f = hoverRef.current ?? focusRef.current;
      const nearIds = new Set<string>();
      if (f) {
        for (const l of linksRef.current) {
          if (l.source === f) nearIds.add(l.target);
          if (l.target === f) nearIds.add(l.source);
        }
      }

      // cámara: acercarse suavemente al nodo con foco
      if (focusRef.current) {
        const p = sim.get(focusRef.current);
        if (p) {
          view.x += (-p.x * view.k - view.x) * 0.05;
          view.y += (-p.y * view.k - view.y) * 0.05;
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2 + view.x, h / 2 + view.y);
      ctx.scale(view.k, view.k);

      const now = performance.now();
      const appearOf = (id: string) => {
        const t = appearRef.current.get(id);
        if (t === undefined) return 1;
        return clamp((now - t) / 650, 0, 1);
      };

      for (const l of linksRef.current) {
        const a = sim.get(l.source);
        const b = sim.get(l.target);
        if (!a || !b) continue;
        const active = f ? l.source === f || l.target === f : false;
        const t = Math.min(appearOf(l.source), appearOf(l.target));
        ctx.globalAlpha = (f ? (active ? 0.7 : 0.07) : 0.2) * t;
        ctx.strokeStyle = active ? palette.accent : palette.border;
        ctx.lineWidth = (active ? 1.1 : 0.7) / view.k;
        ctx.setLineDash(l.kind === "opposedTo" ? [4 / view.k, 4 / view.k] : []);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      for (const n of currentNodes) {
        const p = sim.get(n.id);
        if (!p) continue;
        const isFocus = f === n.id;
        const isNear = nearIds.has(n.id);
        const dim = f ? !isFocus && !isNear : false;
        const t = appearOf(n.id);
        const r = p.r * (0.6 + 0.4 * t) * (isFocus ? 1.25 : 1);
        const color = colorFor(n.kind);

        if (isFocus || n.kind === "self" || n.visited) {
          ctx.globalAlpha = (isFocus ? 0.2 : 0.12) * t;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 10 / view.k, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }

        ctx.globalAlpha = (dim ? 0.15 : 1) * t;
        drawShape(ctx, n.kind, p.x, p.y, r);
        if (n.kind === "concept" || n.kind === "question") {
          ctx.fillStyle = palette.bg;
          ctx.fill();
          ctx.lineWidth = 1.2 / view.k;
          ctx.strokeStyle = color;
          ctx.stroke();
        } else {
          ctx.fillStyle = color;
          ctx.fill();
          ctx.lineWidth = 1 / view.k;
          ctx.strokeStyle = palette.bg;
          ctx.stroke();
        }

        const showLabel =
          view.k > 0.6 || isFocus || isNear || n.kind === "domain" || n.kind === "self";
        if (showLabel) {
          ctx.globalAlpha = (dim ? 0.1 : isFocus || isNear ? 0.96 : 0.6) * t;
          ctx.fillStyle = palette.fg;
          const size = n.kind === "domain" || n.kind === "self" ? 13 : isFocus ? 12.5 : 10.5;
          const family =
            n.kind === "domain" || n.kind === "self" || n.kind === "philosopher"
              ? '"Cormorant Garamond", Georgia, serif'
              : "Manrope, system-ui, sans-serif";
          ctx.font = `${size / view.k}px ${family}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const label = n.label.length > 34 ? `${n.label.slice(0, 32)}…` : n.label;
          ctx.fillText(label, p.x, p.y + r + 6 / view.k);
        }
      }

      ctx.restore();
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

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
      for (const n of nodesRef.current) {
        const p = simRef.current.get(n.id);
        if (!p) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < p.r + 12 / viewRef.current.k && d < bestD) {
          bestD = d;
          best = n.id;
        }
      }
      return best;
    };
    const pickLink = (clientX: number, clientY: number) => {
      const { x, y } = toWorld(clientX, clientY);
      for (const l of linksRef.current) {
        const a = simRef.current.get(l.source);
        const b = simRef.current.get(l.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len2 = dx * dx + dy * dy || 1;
        const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / len2, 0, 1);
        const d = Math.hypot(a.x + dx * t - x, a.y + dy * t - y);
        if (d < 6 / viewRef.current.k) return l;
      }
      return null;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const view = viewRef.current;
      const next = clamp(view.k * Math.exp(-dy * 0.0015), 0.3, 3);
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
        ...(id ? { id } : {}),
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
        const p = simRef.current.get(d.id);
        if (p) {
          p.x += dx / viewRef.current.k;
          p.y += dy / viewRef.current.k;
          p.vx = 0;
          p.vy = 0;
        }
        alphaRef.current = Math.max(alphaRef.current, 0.3);
      }
    };
    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      const moved = Math.abs(e.clientX - d.px) + Math.abs(e.clientY - d.py);
      if (d.mode === "node" && d.id && moved < 6) onSelect(d.id);
      if (d.mode === "pan" && moved < 6) {
        const l = pickLink(e.clientX, e.clientY);
        if (l && onSelectLink) onSelectLink(l.source, l.target);
        else onSelect(null);
      }
      dragRef.current = { mode: "none", px: 0, py: 0 };
      canvas.style.cursor = "grab";
    };
    const onLeave = () => setHover(null);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [onSelect, onSelectLink]);

  const zoomBy = (factor: number) => {
    viewRef.current.k = clamp(viewRef.current.k * factor, 0.3, 3);
  };
  const reset = () => {
    viewRef.current = { x: 0, y: 0, k: 0.95 };
    reheat();
  };

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} className="block h-full w-full touch-none" style={{ cursor: "grab" }} />
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        {[
          { label: "+", fn: () => zoomBy(1.25), aria: "Zoom in" },
          { label: "−", fn: () => zoomBy(0.8), aria: "Zoom out" },
          { label: "◎", fn: reset, aria: "Reset view" },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.fn}
            aria-label={b.aria}
            className="h-8 w-8 rounded-md border border-border bg-background/70 text-sm text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
