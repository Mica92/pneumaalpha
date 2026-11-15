import { NODE_KIND_LABELS, RELATION_LABELS } from "./catalog";
import { edgeLogic, type EdgeLogic, type MapContent, type MapNode, type NodeKind } from "./model";

export const MAP_W = 1200;
export const MAP_H = 800;

export function nodeSize(n: Pick<MapNode, "label" | "kind">) {
  const chars = Math.min(n.label.length, 40);
  const w = Math.max(110, Math.min(260, chars * 7.4 + 36));
  const lines = Math.max(1, Math.ceil((chars * 7.4) / (w - 30)));
  const h = (n.kind === "central" ? 54 : 40) + (lines - 1) * 16;
  return { w, h };
}

export function wrapLabel(label: string, maxChars = 30): string[] {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

/** Point where the segment from the node centre towards (tx,ty) leaves its rectangle. */
export function edgeAnchor(n: MapNode, tx: number, ty: number) {
  const { w, h } = nodeSize(n);
  const dx = tx - n.x;
  const dy = ty - n.y;
  if (dx === 0 && dy === 0) return { x: n.x, y: n.y };
  const sx = Math.abs(dx) / (w / 2);
  const sy = Math.abs(dy) / (h / 2);
  const s = Math.max(sx, sy);
  return { x: n.x + dx / s, y: n.y + dy / s };
}

const PRINT: Record<NodeKind, { fill: string; stroke: string }> = {
  central: { fill: "#F3EBDD", stroke: "#8A6D3B" },
  concept: { fill: "#FFFFFF", stroke: "#5B5B60" },
  author: { fill: "#EEF2F4", stroke: "#3F5A6B" },
  school: { fill: "#EEF2F4", stroke: "#3F5A6B" },
  discipline: { fill: "#F1F3EC", stroke: "#5D6B4A" },
  question: { fill: "#FFFFFF", stroke: "#8A6D3B" },
  case: { fill: "#F1F3EC", stroke: "#5D6B4A" },
  objection: { fill: "#F7ECEA", stroke: "#8C4A3F" },
  premise: { fill: "#FFFFFF", stroke: "#3F5A6B" },
  inference: { fill: "#F3EBDD", stroke: "#8A6D3B" },
  conclusion: { fill: "#F3EBDD", stroke: "#8A6D3B" },
};

/** Print colours per logical reading of a relation (support / contradiction / questioning). */
const EDGE_PRINT: Record<EdgeLogic, string> = {
  support: "#4F6A45",
  contradiction: "#8C4A3F",
  question: "#8A6D3B",
  conceptual: "#7A7A80",
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Standalone SVG with fixed print colours (light background) for PNG/PDF export. */
export function mapToSvg(map: MapContent, lang: "es" | "en"): string {
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  const edges = map.edges
    .map((e) => {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) return "";
      const p = edgeAnchor(a, b.x, b.y);
      const q = edgeAnchor(b, a.x, a.y);
      const mx = (p.x + q.x) / 2;
      const my = (p.y + q.y) / 2;
      const label = RELATION_LABELS[e.relation][lang];
      const logic = edgeLogic(e.relation);
      const dash = logic === "contradiction" || logic === "question" ? ' stroke-dasharray="6 4"' : "";
      return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" stroke="${EDGE_PRINT[logic]}" stroke-width="1.4"${dash} marker-end="url(#arrow-${logic})"/>
<rect x="${mx - label.length * 3.1 - 6}" y="${my - 9}" width="${label.length * 6.2 + 12}" height="16" rx="3" fill="#FFFFFF" opacity="0.92"/>
<text x="${mx}" y="${my + 3}" text-anchor="middle" font-size="10.5" fill="#55555A" font-family="Helvetica, Arial, sans-serif">${esc(label)}</text>`;
    })
    .join("\n");
  const nodes = map.nodes
    .map((n) => {
      const { w, h } = nodeSize(n);
      const c = PRINT[n.kind];
      const lines = wrapLabel(n.label);
      const fs = n.kind === "central" ? 17 : 13.5;
      const start = n.y - ((lines.length - 1) * (fs + 2)) / 2 + fs / 3;
      const text = lines
        .map((l, i) => `<tspan x="${n.x}" y="${start + i * (fs + 2)}">${esc(l)}</tspan>`)
        .join("");
      const kind = n.kind === "central" || n.kind === "concept" ? "" : `<text x="${n.x}" y="${n.y - h / 2 - 5}" text-anchor="middle" font-size="9.5" fill="#7A7A80" font-family="Helvetica, Arial, sans-serif" letter-spacing="0.6">${esc(NODE_KIND_LABELS[n.kind][lang].toUpperCase())}</text>`;
      return `<rect x="${n.x - w / 2}" y="${n.y - h / 2}" width="${w}" height="${h}" rx="${n.kind === "question" ? h / 2 : 6}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${n.kind === "central" ? 2 : 1.2}"/>
${kind}<text text-anchor="middle" font-size="${fs}" fill="#1C1C20" font-family="Georgia, 'Times New Roman', serif">${text}</text>`;
    })
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_W}" height="${MAP_H}" viewBox="0 0 ${MAP_W} ${MAP_H}">
<defs>${(Object.keys(EDGE_PRINT) as EdgeLogic[]).map((k) => `<marker id="arrow-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${EDGE_PRINT[k]}"/></marker>`).join("")}</defs>
<rect width="100%" height="100%" fill="#FFFFFF"/>
${edges}
${nodes}
</svg>`;
}
