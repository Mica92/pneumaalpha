/**
 * Kionas Docente — Source Desk: client-safe rules for the teacher's private sources.
 * Page markers, quote location, integrity and citations live here so the browser,
 * the server and the tests agree. No I/O.
 */
import type { Lang } from "./model";

export const SOURCE_ORIGINS = ["pasted", "txt", "pdf", "docx", "doi", "url"] as const;
export type SourceOrigin = (typeof SOURCE_ORIGINS)[number];
export const INTEGRITY = ["verified", "provided", "pending"] as const;
export type Integrity = (typeof INTEGRITY)[number];

export const INTEGRITY_LABELS: Record<Integrity, { es: string; en: string; hint: { es: string; en: string } }> = {
  verified: {
    es: "Fuente verificada",
    en: "Verified source",
    hint: { es: "Consultaste el documento y comprobaste sus datos.", en: "You consulted the document and checked its details." },
  },
  provided: {
    es: "Fuente proporcionada",
    en: "Provided source",
    hint: { es: "Documento aportado por ti; su autenticidad externa no está comprobada.", en: "Document you provided; its external authenticity is not checked." },
  },
  pending: {
    es: "Referencia pendiente",
    en: "Pending reference",
    hint: { es: "Mencionada, pero no recuperada ni verificada.", en: "Mentioned, but not retrieved or verified." },
  },
};

export const ORIGIN_LABELS: Record<SourceOrigin, { es: string; en: string }> = {
  pasted: { es: "Texto pegado", en: "Pasted text" },
  txt: { es: "Archivo TXT", en: "TXT file" },
  pdf: { es: "PDF", en: "PDF" },
  docx: { es: "Word (DOCX)", en: "Word (DOCX)" },
  doi: { es: "Referencia DOI", en: "DOI reference" },
  url: { es: "Enlace bibliográfico", en: "Bibliographic link" },
};

/** Stored text is capped; analyses send at most MODEL_CHARS to the model. */
export const MAX_BODY_CHARS = 400_000;
export const MODEL_CHARS = 60_000;

/** A document with its own text is "provided"; a bare DOI or link is only a pending reference. */
export function defaultIntegrity(origin: SourceOrigin, hasBody: boolean): Integrity {
  if (origin === "doi" || origin === "url") return hasBody ? "provided" : "pending";
  return "provided";
}

/**
 * "Verified" is a teacher declaration and needs a consulted document plus checked details.
 * The AI never sets it, and recognising a reference is never enough.
 */
export function canMarkVerified(s: { title: string; authors: string; body: string; consulted: boolean; detailsChecked: boolean }): boolean {
  return s.consulted && s.detailsChecked && s.title.trim().length > 0 && s.authors.trim().length > 0;
}

/** Accepts "10.x/y", "doi:10.x/y" or a doi.org URL; returns the bare lower-case DOI or null. */
export function normalizeDoi(input: string): string | null {
  const t = input.trim().replace(/^doi:\s*/i, "").replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  return /^10\.\d{4,9}\/\S+$/.test(t) ? t.toLowerCase() : null;
}

/* ───────── Page markers ───────── */

const MARKER = /\[\[p\. (\d+)\]\]/g;
export const pageMarker = (n: number) => `[[p. ${n}]]`;

/** Joins extracted pages with explicit markers so the model and the quote checker can refer to them. */
export function joinPages(pages: string[]): string {
  return pages.map((p, i) => `${pageMarker(i + 1)}\n${p.trim()}`).join("\n\n");
}

export function splitPages(body: string): { page: number | null; text: string }[] {
  const out: { page: number | null; text: string }[] = [];
  let last = 0;
  let page: number | null = null;
  for (const m of body.matchAll(MARKER)) {
    const chunk = body.slice(last, m.index);
    if (chunk.trim() || out.length > 0 || page !== null) out.push({ page, text: chunk });
    page = Number(m[1]);
    last = (m.index ?? 0) + m[0].length;
  }
  out.push({ page, text: body.slice(last) });
  return out.filter((p) => p.text.trim().length > 0);
}

function fold(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/[“”«»„"]/g, '"')
    .replace(/[‘’‚']/g, "'")
    .replace(/[‐-―−-]/g, "-")
    .replace(/-\s*\n\s*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Finds a quote in the document. Returns null when it is not there (the quote is then discarded),
 * otherwise the page it starts on — never a page the document does not show.
 */
export function locateQuote(body: string, quote: string): { page: number | null } | null {
  const q = fold(quote.replace(/^["“«]+|["”»]+$/g, ""));
  if (q.length < 12) return null;
  for (const p of splitPages(body)) {
    if (fold(p.text).includes(q)) return { page: p.page };
  }
  return fold(body.replace(MARKER, " ")).includes(q) ? { page: null } : null;
}

/** Cuts the text sent to the model at a page boundary when possible and says how far it got. */
export function excerptForModel(body: string, max = MODEL_CHARS): { text: string; truncated: boolean; lastPage: number | null } {
  if (body.length <= max) {
    const pages = [...body.matchAll(MARKER)];
    return { text: body, truncated: false, lastPage: pages.length ? Number(pages[pages.length - 1][1]) : null };
  }
  let cut = body.slice(0, max);
  const markers = [...cut.matchAll(MARKER)];
  const lastMarker = markers[markers.length - 1];
  if (lastMarker && (lastMarker.index ?? 0) > max * 0.6) cut = cut.slice(0, lastMarker.index);
  const kept = [...cut.matchAll(MARKER)];
  return { text: cut, truncated: true, lastPage: kept.length ? Number(kept[kept.length - 1][1]) : null };
}

/** True when a PDF probably has no text layer (scanned) or extracted very little. */
export function looksUnreadable(body: string, pageCount: number): boolean {
  const chars = body.replace(MARKER, "").replace(/\s+/g, "").length;
  return pageCount > 0 ? chars / pageCount < 80 : chars < 40;
}

/* ───────── Citations ───────── */

export type SourceMeta = { title: string; authors: string; year: string; container: string; doi: string; url: string };

/** Bibliography line built only from the teacher's metadata — never from model output. */
export function formatCitation(s: SourceMeta, lang: Lang): string {
  const parts = [
    s.authors.trim() || (lang === "es" ? "Autor sin indicar" : "Author not given"),
    s.year.trim() ? `(${s.year.trim()})` : "",
    s.title.trim() ? `*${s.title.trim()}*` : lang === "es" ? "*Sin título*" : "*Untitled*",
    s.container.trim(),
    s.doi.trim() ? `https://doi.org/${s.doi.trim()}` : s.url.trim(),
  ].filter(Boolean);
  return parts.join(". ").replace(/\.\./g, ".");
}

/* ───────── Analyses ───────── */

export const SOURCE_OPS = [
  { id: "summary", es: "Resumir", en: "Summarise" },
  { id: "theses", es: "Identificar tesis", en: "Identify theses" },
  { id: "concepts", es: "Extraer conceptos", en: "Extract concepts" },
  { id: "arguments", es: "Detectar argumentos", en: "Detect arguments" },
  { id: "quotes", es: "Localizar citas", en: "Locate quotations" },
  { id: "questions", es: "Generar preguntas", en: "Generate questions" },
  { id: "gaps", es: "Vacíos de información", en: "Information gaps" },
] as const;
export type SourceOp = (typeof SOURCE_OPS)[number]["id"];

export type AnalysisItem = { text: string; detail: string; page: number | null; group?: string };
export type SourceAnalysis = {
  intro: string;
  items: AnalysisItem[];
  generatedAt: string;
  truncated: boolean;
  lastPage: number | null;
  /** Quotations the model proposed that are not in the document (discarded). */
  dropped?: number;
};

/** Keeps only quotations that really appear in the document and takes their page from the document itself. */
export function verifyQuotes(body: string, items: { text: string; detail: string }[]): { items: AnalysisItem[]; dropped: number } {
  const out: AnalysisItem[] = [];
  let dropped = 0;
  for (const it of items) {
    const hit = locateQuote(body, it.text);
    if (!hit) {
      dropped++;
      continue;
    }
    out.push({ text: it.text.trim().replace(/^["“«]+|["”»]+$/g, ""), detail: it.detail.trim(), page: hit.page });
  }
  return { items: out, dropped };
}
