/**
 * Stage E client-safe rules: Teaching Insights KPIs, teacher preferences,
 * institutional templates, library tags and review decisions.
 * Only the teacher's own preparation work is measured — never student data.
 */
import type { MaterialKind } from "./model";

type L = { es: string; en: string };

/* ───────── Preferences & templates ───────── */

export const TEMPLATES = ["academic", "editorial", "seminar", "institutional"] as const;
export type Template = (typeof TEMPLATES)[number];
export const TEMPLATE_LABELS: Record<Template, L & { hint: L }> = {
  academic: { es: "Académico", en: "Academic", hint: { es: "Institución y curso en una línea discreta bajo el título.", en: "Institution and course in a discreet line under the title." } },
  editorial: { es: "Editorial", en: "Editorial", hint: { es: "Solo curso y docente; el título manda.", en: "Course and teacher only; the title leads." } },
  seminar: { es: "Seminario", en: "Seminar", hint: { es: "Encabezado de seminario con curso y docente.", en: "Seminar heading with course and teacher." } },
  institutional: { es: "Documento institucional", en: "Institutional document", hint: { es: "Tabla con institución, facultad, curso y docente.", en: "Table with institution, faculty, course and teacher." } },
};

export type Preferences = {
  institution: string;
  faculty: string;
  course: string;
  teacher_name: string;
  template: Template;
  show_header: boolean;
  default_discipline: string;
  default_level: string;
  default_language: "es" | "en";
  hourly_rate: number | null;
  currency: string;
  track_time: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = {
  institution: "",
  faculty: "",
  course: "",
  teacher_name: "",
  template: "academic",
  show_header: true,
  default_discipline: "",
  default_level: "",
  default_language: "es",
  hourly_rate: null,
  currency: "CLP",
  track_time: true,
};

/** Header fields typed by the teacher. Nothing is ever filled in for them (no invented affiliations). */
export type PrintHeader = { template: Template; institution: string; faculty: string; course: string; teacher: string };

export function headerFromPreferences(p: Preferences | null | undefined): PrintHeader | undefined {
  if (!p || !p.show_header) return undefined;
  const h = { template: p.template, institution: p.institution.trim(), faculty: p.faculty.trim(), course: p.course.trim(), teacher: p.teacher_name.trim() };
  return h.institution || h.faculty || h.course || h.teacher ? h : undefined;
}

/** Markdown lines placed above the title. Empty fields are omitted, never replaced by placeholders. */
export function headerMarkdown(h: PrintHeader | undefined, lang: "es" | "en"): string[] {
  if (!h) return [];
  const t = (es: string, en: string) => (lang === "es" ? es : en);
  const inst = [h.institution, h.faculty].filter(Boolean).join(" · ");
  const course = [h.course, h.teacher].filter(Boolean).join(" · ");
  switch (h.template) {
    case "institutional": {
      const rows = [
        [t("Institución", "Institution"), h.institution],
        [t("Facultad", "Faculty"), h.faculty],
        [t("Curso", "Course"), h.course],
        [t("Docente", "Teacher"), h.teacher],
      ].filter(([, v]) => v);
      if (!rows.length) return [];
      const [first, ...rest] = rows;
      return [[`| **${first[0]}** | ${first[1]} |`, "|---|---|", ...rest.map(([k, v]) => `| **${k}** | ${v} |`)].join("\n")];
    }
    case "editorial":
      return course ? [`*${course}*`] : [];
    case "seminar":
      return [inst && `**${inst}**`, course && `${t("Seminario", "Seminar")} · ${course}`].filter(Boolean) as string[];
    default:
      return [[inst, course].filter(Boolean).join(" — ")].filter(Boolean).map((x) => `*${x}*`);
  }
}

/* ───────── Library tags ───────── */

/** Lowercase-insensitive dedupe, trimmed, max 20 tags of 40 chars. */
export function normalizeTags(tags: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of Array.isArray(tags) ? tags : []) {
    if (typeof raw !== "string") continue;
    const t = raw.replace(/^#/, "").replace(/\s+/g, " ").trim().slice(0, 40);
    const k = t.toLocaleLowerCase();
    if (!t || seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= 20) break;
  }
  return out;
}

export function parseTagInput(s: string): string[] {
  return normalizeTags(s.split(","));
}

/* ───────── Review decisions ───────── */

export const DECISIONS = ["pending", "addressed", "dismissed"] as const;
export type Decision = (typeof DECISIONS)[number];
export const DECISION_LABELS: Record<Decision, L> = {
  pending: { es: "Pendiente", en: "Pending" },
  addressed: { es: "Corregida", en: "Addressed" },
  dismissed: { es: "Descartada", en: "Dismissed" },
};

/** Counts the teacher's decisions on non-"ok" observations of a review. "ok" findings need no decision. */
export function reviewCounts(findings: { dimension: string; status: string }[], decisions: Record<string, string>) {
  let pending = 0;
  let addressed = 0;
  let dismissed = 0;
  for (const f of findings) {
    if (f.status === "ok") continue;
    const d = decisions[f.dimension];
    if (d === "addressed") addressed++;
    else if (d === "dismissed") dismissed++;
    else pending++;
  }
  return { pending, addressed, dismissed };
}

/* ───────── Teaching Insights ───────── */

export type InsightMaterial = {
  id: string;
  kind: MaterialKind;
  review_status: "draft" | "reviewed";
  source_material_id: string | null;
  conversion: string;
  created_at: string;
  ready_at: string | null;
  archived_at: string | null;
};
export type WorkRow = { material_id: string; day: string; seconds: number };

export type Insights = {
  created: number;
  createdByKind: Partial<Record<MaterialKind, number>>;
  reused: number;
  reusedBy: { duplicated: number; converted: number };
  ready: Partial<Record<MaterialKind, number>>;
  mapsCreated: number;
  trackedSeconds: number;
  trackedByKind: Partial<Record<MaterialKind, number>>;
  /** Median active seconds until "ready", only over ready materials with tracked time. */
  medianToReady: Partial<Record<MaterialKind, { seconds: number; n: number }>>;
};

export function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

/**
 * KPIs over a period. Materials count when created in the period; time counts when logged in it.
 * `sinceIso` null = all time. No savings percentage is computed: there is no valid baseline.
 */
export function computeInsights(materials: InsightMaterial[], work: WorkRow[], sinceIso: string | null): Insights {
  const since = sinceIso ? sinceIso.slice(0, 10) : null;
  const inPeriod = (iso: string | null) => Boolean(iso) && (!since || iso!.slice(0, 10) >= since);
  const byId = new Map(materials.map((m) => [m.id, m]));
  const created = materials.filter((m) => inPeriod(m.created_at));
  const inc = <K extends string>(o: Partial<Record<K, number>>, k: K, by = 1) => (o[k] = (o[k] ?? 0) + by);

  const createdByKind: Insights["createdByKind"] = {};
  let duplicated = 0;
  let converted = 0;
  for (const m of created) {
    inc(createdByKind, m.kind);
    if (m.source_material_id) {
      if (m.conversion) converted++;
      else duplicated++;
    }
  }
  const ready: Insights["ready"] = {};
  for (const m of materials) if (m.review_status === "reviewed" && inPeriod(m.ready_at)) inc(ready, m.kind);

  let trackedSeconds = 0;
  const trackedByKind: Insights["trackedByKind"] = {};
  const perMaterial = new Map<string, number>();
  for (const w of work) {
    const m = byId.get(w.material_id);
    perMaterial.set(w.material_id, (perMaterial.get(w.material_id) ?? 0) + w.seconds);
    if (!m || (since && w.day < since)) continue;
    trackedSeconds += w.seconds;
    inc(trackedByKind, m.kind, w.seconds);
  }
  const toReady: Partial<Record<MaterialKind, number[]>> = {};
  for (const m of materials) {
    const s = perMaterial.get(m.id) ?? 0;
    if (m.review_status !== "reviewed" || !inPeriod(m.ready_at) || s < 60) continue;
    (toReady[m.kind] ??= []).push(s);
  }
  const medianToReady: Insights["medianToReady"] = {};
  for (const [k, xs] of Object.entries(toReady) as [MaterialKind, number[]][]) medianToReady[k] = { seconds: median(xs), n: xs.length };

  return {
    created: created.length,
    createdByKind,
    reused: duplicated + converted,
    reusedBy: { duplicated, converted },
    ready,
    mapsCreated: createdByKind.map ?? 0,
    trackedSeconds,
    trackedByKind,
    medianToReady,
  };
}

/** Estimated cost of the teacher's own time — an estimate, never "savings". Null without a rate. */
export function estimatedCost(seconds: number, hourlyRate: number | null | undefined): number | null {
  if (hourlyRate === null || hourlyRate === undefined || !Number.isFinite(hourlyRate) || hourlyRate < 0) return null;
  return Math.round((seconds / 3600) * hourlyRate);
}

export function formatDuration(seconds: number, lang: "es" | "en"): string {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Counts references still pending verification inside a material's content (sections and research). */
export function countPendingRefs(content: unknown): number {
  const c = (content ?? {}) as { sections?: { sources?: { status?: string }[] }[] };
  if (!Array.isArray(c.sections)) return 0;
  return c.sections.reduce((n, s) => n + (Array.isArray(s?.sources) ? s.sources.filter((r) => r?.status === "pending").length : 0), 0);
}

/* ───────── Active-time tracking ───────── */

/** Max seconds credited per flush and idle threshold: time only counts while the teacher is active. */
export const WORK_FLUSH_MAX = 300;
export const WORK_IDLE_MS = 90_000;

/** Seconds to credit for one tick: only when the tab is visible and there was activity recently. */
export function creditTick(now: number, lastActivity: number, visible: boolean, tickMs: number): number {
  return visible && now - lastActivity <= WORK_IDLE_MS ? Math.round(tickMs / 1000) : 0;
}

/* ───────── Traceability ───────── */

export function conceptKey(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** Other non-archived materials on the same concept, excluding the ones already linked. */
export function sameConcept<T extends { id: string; concept: string; archived_at: string | null }>(m: { id: string; concept: string }, all: T[], exclude: string[] = [], max = 8): T[] {
  const k = conceptKey(m.concept);
  if (!k) return [];
  const skip = new Set([m.id, ...exclude]);
  return all.filter((x) => !skip.has(x.id) && !x.archived_at && conceptKey(x.concept) === k).slice(0, max);
}
