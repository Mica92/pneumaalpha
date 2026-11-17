/**
 * Browser-only text extraction for Source Desk imports. Load with `await import()` from an
 * event handler — never statically from a route — so PDF/DOCX libraries stay out of SSR.
 * Files are read locally; only the extracted text is stored.
 */
import { MAX_BODY_CHARS, joinPages, looksUnreadable, type SourceOrigin } from "./sources";

export type Extracted = { origin: SourceOrigin; title: string; body: string; pageCount: number; note: string };

const MAX_FILE_BYTES = 25 * 1024 * 1024;

function baseTitle(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 200);
}

function cap(body: string, lang: "es" | "en"): { body: string; note: string } {
  if (body.length <= MAX_BODY_CHARS) return { body, note: "" };
  return {
    body: body.slice(0, MAX_BODY_CHARS),
    note: lang === "es" ? "El documento era muy extenso: se guardó solo la primera parte del texto." : "The document was very long: only the first part of the text was kept.",
  };
}

export async function extractFile(file: File, lang: "es" | "en"): Promise<Extracted> {
  if (file.size > MAX_FILE_BYTES) throw new Error("FILE_TOO_LARGE");
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt") || name.endsWith(".md") || file.type === "text/plain") {
    const c = cap(await file.text(), lang);
    return { origin: "txt", title: baseTitle(file.name), body: c.body, pageCount: 0, note: c.note };
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const res = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    const c = cap(res.value.replace(/\n{3,}/g, "\n\n"), lang);
    const empty = c.body.trim().length < 40;
    return {
      origin: "docx",
      title: baseTitle(file.name),
      body: c.body,
      pageCount: 0,
      note: [c.note, empty ? (lang === "es" ? "No se pudo extraer texto de este documento." : "No text could be extracted from this document.") : ""].filter(Boolean).join(" "),
    };
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: string[] = [];
    let title = "";
    try {
      const meta = await doc.getMetadata();
      const t = (meta.info as { Title?: unknown } | undefined)?.Title;
      if (typeof t === "string") title = t.trim();
    } catch {
      /* metadata is optional */
    }
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      let text = "";
      for (const it of tc.items as { str?: string; hasEOL?: boolean }[]) {
        if (typeof it.str !== "string") continue;
        text += it.str + (it.hasEOL ? "\n" : " ");
      }
      pages.push(text.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n"));
    }
    const joined = joinPages(pages);
    const c = cap(joined, lang);
    const unreadable = looksUnreadable(c.body, doc.numPages);
    const note = [
      c.note,
      unreadable
        ? lang === "es"
          ? "Este PDF casi no contiene texto extraíble (puede ser un documento escaneado). Los análisis no serán fiables."
          : "This PDF has almost no extractable text (it may be scanned). Analyses will not be reliable."
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    return { origin: "pdf", title: title || baseTitle(file.name), body: c.body, pageCount: doc.numPages, note };
  }
  throw new Error("UNSUPPORTED_FILE");
}
