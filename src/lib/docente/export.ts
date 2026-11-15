/**
 * Browser-only exporters. Import this module dynamically from click handlers:
 * PDF and DOCX are built from the same Markdown as the print view, so text,
 * headings, lists and tables stay real and editable (never page images).
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, RootContent, PhrasingContent, ListItem } from "mdast";

export type PageSize = "A4" | "LETTER";

function parse(md: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(md) as Root;
}

export function safeFilename(title: string, suffix: string, ext: string) {
  const base = (title || "kionas")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return `${base || "kionas"}-${suffix}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ───────────── DOCX ───────────── */

export async function markdownToDocxBlob(md: string, size: PageSize, title: string): Promise<Blob> {
  const docx = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    LevelFormat,
    AlignmentType,
    BorderStyle,
  } = docx;
  type Run = InstanceType<typeof TextRun>;
  type Block = InstanceType<typeof Paragraph> | InstanceType<typeof Table>;

  const inline = (nodes: PhrasingContent[], st: { bold?: boolean; italics?: boolean; strike?: boolean } = {}): Run[] =>
    nodes.flatMap((n): Run[] => {
      switch (n.type) {
        case "text":
          return [new TextRun({ text: n.value, ...st })];
        case "strong":
          return inline(n.children, { ...st, bold: true });
        case "emphasis":
          return inline(n.children, { ...st, italics: true });
        case "delete":
          return inline(n.children, { ...st, strike: true });
        case "inlineCode":
          return [new TextRun({ text: n.value, font: "Courier New", ...st })];
        case "link":
          return inline(n.children as PhrasingContent[], st);
        case "break":
          return [new TextRun({ text: "", break: 1 })];
        default:
          return "value" in n && typeof n.value === "string" ? [new TextRun({ text: n.value, ...st })] : [];
      }
    });

  const headingLevel = [HeadingLevel.TITLE, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5];

  const block = (n: RootContent, ctx: { level: number; quote: boolean }): Block[] => {
    switch (n.type) {
      case "heading":
        return [new Paragraph({ heading: headingLevel[Math.min(5, n.depth - 1)], children: inline(n.children), spacing: { before: 240, after: 120 } })];
      case "paragraph":
        return [
          new Paragraph({
            children: inline(n.children, ctx.quote ? { italics: true } : {}),
            spacing: { after: 140, line: 300 },
            indent: ctx.quote ? { left: 567 } : undefined,
            border: ctx.quote ? { left: { style: BorderStyle.SINGLE, size: 8, color: "B89A62", space: 8 } } : undefined,
          }),
        ];
      case "blockquote":
        return n.children.flatMap((c) => block(c, { ...ctx, quote: true }));
      case "list":
        return n.children.flatMap((item: ListItem) =>
          item.children.flatMap((c, i): Block[] => {
            if (c.type === "paragraph" && i === 0) {
              return [
                new Paragraph({
                  children: inline(c.children),
                  ...(n.ordered ? { numbering: { reference: "ordered", level: Math.min(ctx.level, 2) } } : { bullet: { level: Math.min(ctx.level, 2) } }),
                  spacing: { after: 80 },
                }),
              ];
            }
            if (c.type === "list") return block(c, { ...ctx, level: ctx.level + 1 });
            return block(c, ctx);
          }),
        );
      case "table": {
        const cols = Math.max(1, ...n.children.map((r) => r.children.length));
        return [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: n.children.map(
              (row, ri) =>
                new TableRow({
                  tableHeader: ri === 0,
                  children: Array.from({ length: cols }, (_, ci) => {
                    const cell = row.children[ci];
                    return new TableCell({
                      width: { size: Math.floor(100 / cols), type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: cell ? inline(cell.children, ri === 0 ? { bold: true } : {}) : [] })],
                    });
                  }),
                }),
            ),
          }),
          new Paragraph({ children: [] }),
        ];
      }
      case "thematicBreak":
        return [new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 1 } } })];
      case "code":
        return n.value.split("\n").map((l) => new Paragraph({ children: [new TextRun({ text: l, font: "Courier New" })] }));
      default:
        return [];
    }
  };

  const root = parse(md);
  const children = root.children.flatMap((c) => block(c, { level: 0, quote: false }));
  const page = size === "A4" ? { width: 11906, height: 16838 } : { width: 12240, height: 15840 };
  const doc = new Document({
    title,
    creator: "Kionas Docente",
    styles: {
      default: { document: { run: { font: "Georgia", size: 22 } } },
    },
    numbering: {
      config: [
        {
          reference: "ordered",
          levels: [0, 1, 2].map((level) => ({
            level,
            format: level === 1 ? LevelFormat.LOWER_LETTER : LevelFormat.DECIMAL,
            text: level === 1 ? `%${level + 1})` : `%${level + 1}.`,
            alignment: AlignmentType.START,
            style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 300 } } },
          })),
        },
      ],
    },
    sections: [{ properties: { page: { size: page, margin: { top: 1134, bottom: 1134, left: 1247, right: 1247 } } }, children }],
  });
  return Packer.toBlob(doc);
}

/* ───────────── PDF ───────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfNode = any;

async function loadPdfMake() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any = await import("pdfmake/build/pdfmake");
  const pdfMake = mod.default ?? mod;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fonts: any = await import("pdfmake/build/vfs_fonts");
  const vfs = fonts.default?.pdfMake?.vfs ?? fonts.pdfMake?.vfs ?? fonts.default ?? fonts;
  if (typeof pdfMake.addVirtualFileSystem === "function") pdfMake.addVirtualFileSystem(vfs);
  else pdfMake.vfs = vfs;
  return pdfMake;
}

function pdfInline(nodes: PhrasingContent[], st: Record<string, unknown> = {}): PdfNode[] {
  return nodes.flatMap((n): PdfNode[] => {
    switch (n.type) {
      case "text":
        return [{ text: n.value, ...st }];
      case "strong":
        return pdfInline(n.children, { ...st, bold: true });
      case "emphasis":
        return pdfInline(n.children, { ...st, italics: true });
      case "delete":
        return pdfInline(n.children, { ...st, decoration: "lineThrough" });
      case "inlineCode":
        return [{ text: n.value, ...st, background: "#eeeeee" }];
      case "link":
        return pdfInline(n.children as PhrasingContent[], { ...st, link: n.url, color: "#6b5a35" });
      case "break":
        return [{ text: "\n" }];
      default:
        return "value" in n && typeof n.value === "string" ? [{ text: n.value, ...st }] : [];
    }
  });
}

function pdfBlock(n: RootContent): PdfNode[] {
  switch (n.type) {
    case "heading":
      return [{ text: pdfInline(n.children), style: `h${Math.min(4, n.depth)}` }];
    case "paragraph":
      return [{ text: pdfInline(n.children), margin: [0, 0, 0, 7], lineHeight: 1.3 }];
    case "blockquote":
      return [
        {
          table: { widths: [2, "*"], body: [[{ text: "", fillColor: "#B89A62" }, { stack: n.children.flatMap(pdfBlock), italics: true, color: "#444444" }]] },
          layout: { hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: (i: number) => (i === 1 ? 10 : 0), paddingTop: () => 2, paddingBottom: () => 2 },
          margin: [0, 2, 0, 8],
        },
      ];
    case "list": {
      const items = n.children.map((item: ListItem) => ({ stack: item.children.flatMap(pdfBlock) }));
      return [{ [n.ordered ? "ol" : "ul"]: items, margin: [0, 0, 0, 8] }];
    }
    case "table": {
      const cols = Math.max(1, ...n.children.map((r) => r.children.length));
      return [
        {
          table: {
            headerRows: 1,
            widths: Array.from({ length: cols }, () => "*"),
            body: n.children.map((row, ri) =>
              Array.from({ length: cols }, (_, ci) => {
                const cell = row.children[ci];
                return { text: cell ? pdfInline(cell.children, ri === 0 ? { bold: true } : {}) : "", fontSize: 9.5 };
              }),
            ),
          },
          layout: "lightHorizontalLines",
          margin: [0, 2, 0, 10],
        },
      ];
    }
    case "thematicBreak":
      return [{ canvas: [{ type: "line", x1: 0, y1: 4, x2: 480, y2: 4, lineWidth: 0.5, lineColor: "#999999" }], margin: [0, 6, 0, 10] }];
    case "code":
      return [{ text: n.value, fontSize: 9, margin: [0, 0, 0, 8] }];
    default:
      return [];
  }
}

function pdfDoc(content: PdfNode[], size: PageSize, title: string): PdfNode {
  return {
    info: { title, creator: "Kionas Docente" },
    pageSize: size,
    pageMargins: [58, 56, 58, 60],
    content,
    defaultStyle: { fontSize: 10.5, color: "#1a1a1a" },
    styles: {
      h1: { fontSize: 20, bold: true, margin: [0, 0, 0, 8] },
      h2: { fontSize: 14, bold: true, margin: [0, 14, 0, 6], color: "#3d3420" },
      h3: { fontSize: 12, bold: true, margin: [0, 10, 0, 4] },
      h4: { fontSize: 11, bold: true, margin: [0, 8, 0, 4] },
    },
    footer: (page: number, pages: number) => ({
      columns: [
        { text: "Kionas Docente", fontSize: 8, color: "#888888", margin: [58, 0, 0, 0] },
        { text: `${page} / ${pages}`, alignment: "right", fontSize: 8, color: "#888888", margin: [0, 0, 58, 0] },
      ],
    }),
  };
}

export async function markdownToPdfBlob(md: string, size: PageSize, title: string, extra: PdfNode[] = []): Promise<Blob> {
  const pdfMake = await loadPdfMake();
  const root = parse(md);
  const content = [...root.children.flatMap(pdfBlock), ...extra];
  return new Promise<Blob>((resolve, reject) => {
    try {
      pdfMake.createPdf(pdfDoc(content, size, title)).getBlob((b: Blob) => resolve(b));
    } catch (e) {
      reject(e);
    }
  });
}

/* ───────────── Maps ───────────── */

export async function svgToPngBlob(svg: string, width: number, height: number, scale = 2): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG_LOAD_FAILED"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG_FAILED"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function mapToPdfBlob(svg: string, md: string, size: PageSize, title: string): Promise<Blob> {
  const width = size === "A4" ? 595 - 116 : 612 - 116;
  return markdownToPdfBlob(`# ${title}`, size, title, [
    { svg, width, margin: [0, 6, 0, 14] },
    ...parse(md).children.slice(1).flatMap(pdfBlock),
  ]);
}
