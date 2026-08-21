// Atlas — índice único del conocimiento navegable.
// Se deriva de los datos ya existentes (philosophers, knowledge-graph, discovery)
// y añade las capas nuevas: dominios y preguntas.

import { GRAPH_LINKS, GRAPH_NODES } from "@/lib/knowledge-graph";
import { CENTRAL_QUESTIONS } from "@/lib/discovery";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { DOMAINS, QUESTIONS } from "./data";
import {
  KIND_LABEL,
  RELATION_LABEL,
  RELATION_NOTE,
  type AtlasEntity,
  type AtlasRelation,
  type EntityKind,
  type Lang,
  type RelationKind,
} from "./types";

export * from "./types";
export { DOMAINS, QUESTIONS } from "./data";

/* ── Entidades ───────────────────────────────────────────────────── */

const entities: AtlasEntity[] = [];
const relations: AtlasRelation[] = [];

for (const d of DOMAINS) {
  entities.push({ id: d.id, kind: "domain", label: d.label, note: d.note });
}

for (const n of GRAPH_NODES) {
  const kind: EntityKind =
    n.kind === "philosopher" ? "philosopher" : n.kind === "idea" ? "concept" : "school";
  entities.push({
    id: n.id,
    kind,
    label: { es: n.label, en: n.label },
    note: n.note,
    ...(n.era ? { era: n.era } : {}),
    ...(n.chat ? { chat: n.chat } : {}),
  });
}

for (const q of QUESTIONS) {
  entities.push({ id: q.id, kind: "question", label: q.label, note: q.note });
}

export const ATLAS_ENTITIES: AtlasEntity[] = entities;
export const ENTITY_BY_ID = new Map(entities.map((e) => [e.id, e]));

/* ── Relaciones ──────────────────────────────────────────────────── */

const REL_FROM_LINK: Record<string, RelationKind> = {
  influence: "influenced",
  opposition: "opposedTo",
  belongs: "belongsTo",
  develops: "developed",
};

for (const l of GRAPH_LINKS) {
  if (!ENTITY_BY_ID.has(l.source) || !ENTITY_BY_ID.has(l.target)) continue;
  relations.push({
    source: l.source,
    target: l.target,
    kind: REL_FROM_LINK[l.kind] ?? "relatedTo",
  });
}

for (const d of DOMAINS) {
  for (const m of d.members) {
    if (ENTITY_BY_ID.has(m)) relations.push({ source: d.id, target: m, kind: "explores" });
  }
}

for (const q of QUESTIONS) {
  for (const m of q.related) {
    if (ENTITY_BY_ID.has(m)) relations.push({ source: q.id, target: m, kind: "explores" });
  }
}

export const ATLAS_RELATIONS: AtlasRelation[] = relations;

/* ── Adyacencia ──────────────────────────────────────────────────── */

export type Neighbor = {
  id: string;
  entity: AtlasEntity;
  kind: RelationKind;
  direction: "out" | "in";
};

const adjacency = new Map<string, Neighbor[]>();

for (const r of relations) {
  const a = ENTITY_BY_ID.get(r.source);
  const b = ENTITY_BY_ID.get(r.target);
  if (!a || !b) continue;
  if (!adjacency.has(r.source)) adjacency.set(r.source, []);
  if (!adjacency.has(r.target)) adjacency.set(r.target, []);
  adjacency.get(r.source)!.push({ id: r.target, entity: b, kind: r.kind, direction: "out" });
  adjacency.get(r.target)!.push({ id: r.source, entity: a, kind: r.kind, direction: "in" });
}

export function neighborsOf(id: string): Neighbor[] {
  return adjacency.get(id) ?? [];
}

export function degreeOf(id: string): number {
  return adjacency.get(id)?.length ?? 0;
}

export function relationBetween(a: string, b: string): AtlasRelation | undefined {
  return relations.find(
    (r) => (r.source === a && r.target === b) || (r.source === b && r.target === a),
  );
}

export function relationLabel(kind: RelationKind, lang: Lang): string {
  return RELATION_LABEL[kind][lang];
}

export function relationNote(kind: RelationKind, lang: Lang): string {
  return RELATION_NOTE[kind][lang];
}

export function kindLabel(kind: EntityKind, lang: Lang): string {
  return KIND_LABEL[kind][lang];
}

export function labelOf(id: string, lang: Lang): string {
  const e = ENTITY_BY_ID.get(id);
  return e ? e.label[lang] : id;
}

/* ── Búsqueda ────────────────────────────────────────────────────── */

export function searchAtlas(query: string, lang: Lang, limit = 12): AtlasEntity[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { e: AtlasEntity; s: number }[] = [];
  for (const e of entities) {
    const label = `${e.label.es} ${e.label.en}`.toLowerCase();
    const note = `${e.note.es} ${e.note.en}`.toLowerCase();
    let s = -1;
    if (label.startsWith(q)) s = 0;
    else if (label.includes(q)) s = 1;
    else if (note.includes(q)) s = 3;
    if (s >= 0) scored.push({ e, s: s - Math.min(2, degreeOf(e.id) / 20) });
  }
  scored.sort((a, b) => a.s - b.s || a.e.label[lang].localeCompare(b.e.label[lang]));
  return scored.slice(0, limit).map((x) => x.e);
}

/* ── Expansión progresiva ────────────────────────────────────────── */

const KIND_PRIORITY: Record<EntityKind, number> = {
  self: 0,
  domain: 1,
  philosopher: 2,
  concept: 3,
  school: 4,
  question: 5,
};

/** Vecinos de un nodo, ordenados por relevancia y recortados. */
export function expansionOf(id: string, max = 8, allow?: Set<EntityKind>): Neighbor[] {
  const list = neighborsOf(id).filter((n) => (allow ? allow.has(n.entity.kind) : true));
  const seen = new Set<string>();
  const unique = list.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
  unique.sort(
    (a, b) =>
      KIND_PRIORITY[a.entity.kind] - KIND_PRIORITY[b.entity.kind] ||
      degreeOf(b.id) - degreeOf(a.id),
  );
  return unique.slice(0, max);
}

/** Sugerencias reales del grafo: a dos pasos, sin repetir lo ya visible. */
export function suggestionsFrom(id: string, exclude: Set<string>, limit = 3): AtlasEntity[] {
  const out: AtlasEntity[] = [];
  const seen = new Set<string>([id, ...exclude]);
  for (const n of expansionOf(id, 12)) {
    for (const m of expansionOf(n.id, 6)) {
      if (seen.has(m.id)) continue;
      seen.add(m.id);
      out.push(m.entity);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** Filósofo conversable más cercano a cualquier entidad. */
export function nearestChat(id: string): PhilosopherId | undefined {
  const e = ENTITY_BY_ID.get(id);
  if (e?.chat) return e.chat;
  for (const n of expansionOf(id, 20)) {
    if (n.entity.chat) return n.entity.chat;
  }
  for (const n of expansionOf(id, 20)) {
    for (const m of expansionOf(n.id, 20)) {
      if (m.entity.chat) return m.entity.chat;
    }
  }
  return undefined;
}

/** Prompt inicial contextual para abrir el chat desde un nodo. */
export function contextPrompt(id: string, lang: Lang): string {
  const e = ENTITY_BY_ID.get(id);
  if (!e) return "";
  const label = e.label[lang];
  if (e.kind === "question") return label;
  if (e.kind === "philosopher") {
    const chat = e.chat;
    if (chat && CENTRAL_QUESTIONS[chat as PhilosopherId]) {
      return CENTRAL_QUESTIONS[chat as PhilosopherId][lang];
    }
    return lang === "es"
      ? `Quiero entender lo esencial de tu pensamiento. ¿Por dónde empezamos?`
      : `I want to understand the core of your thought. Where do we start?`;
  }
  return lang === "es"
    ? `Quiero pensar contigo sobre ${label}. Empieza por lo esencial, sin tecnicismos.`
    : `I want to think with you about ${label}. Start with the essentials, no jargon.`;
}

export function philosopherName(id: PhilosopherId): string {
  return PHILOSOPHERS[id]?.name ?? id;
}

export const DOMAIN_IDS = DOMAINS.map((d) => d.id);
