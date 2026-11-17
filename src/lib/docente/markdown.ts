import {
  asDoc,
  asExam,
  asMap,
  toStudentDoc,
  toStudentExam,
  type ExamContent,
  type Lang,
  type MaterialKind,
} from "./model";
import { NODE_KIND_LABELS, QUESTION_TYPE_LABELS, RELATION_LABELS } from "./catalog";
import { asResearch, matrixToMarkdown } from "./research";

export type Variant = "teacher" | "student";

export type PrintMeta = {
  title: string;
  kind: MaterialKind;
  language: Lang;
  concept?: string;
  discipline?: string;
  subject?: string;
  level?: string;
};

const L = (lang: Lang, es: string, en: string) => (lang === "es" ? es : en);

/** One Markdown source drives the print view, the PDF and the DOCX, so the three never drift. */
export function materialToMarkdown(meta: PrintMeta, content: unknown, variant: Variant): string {
  const lang = meta.language;
  const out: string[] = [];
  const metaLine = [meta.subject, meta.discipline, meta.level].filter(Boolean).join(" · ");
  if (meta.kind === "exam") return examToMarkdown(meta, asExam(content), variant);

  out.push(`# ${meta.title || L(lang, "Sin título", "Untitled")}`);
  if (metaLine) out.push(`*${metaLine}*`);
  if (variant === "teacher") out.push(`> ${L(lang, "Versión docente", "Teacher version")}`);

  if (meta.kind === "map") {
    const m = asMap(content);
    const byId = new Map(m.nodes.map((n) => [n.id, n]));
    out.push(`## ${L(lang, "Nodos", "Nodes")}`);
    for (const n of m.nodes) {
      out.push(`- **${n.label}** (${NODE_KIND_LABELS[n.kind]?.[lang] ?? n.kind})${n.note ? ` — ${n.note}` : ""}`);
    }
    const explored = m.nodes.filter((n) => n.detail?.definition);
    if (explored.length) {
      out.push(`## ${L(lang, "Nodos explorados", "Explored nodes")}`);
      for (const n of explored) {
        const d = n.detail!;
        const parts = [`### ${n.label}`, d.definition];
        const list = (t: string, xs: string[]) => xs.length && parts.push(`**${t}**\n\n${xs.map((x) => `- ${x}`).join("\n")}`);
        list(L(lang, "Interpretaciones", "Interpretations"), d.interpretations);
        list(L(lang, "Autores", "Authors"), d.authors);
        list(L(lang, "Objeciones", "Objections"), d.objections);
        list(L(lang, "Aplicaciones", "Applications"), d.applications);
        list(L(lang, "Preguntas de discusión", "Discussion questions"), d.questions);
        list(L(lang, "Bibliografía sugerida (verificar)", "Suggested bibliography (verify)"), d.bibliography);
        out.push(parts.join("\n\n"));
      }
    }
    out.push(`## ${L(lang, "Relaciones", "Relations")}`);
    for (const e of m.edges) {
      const a = byId.get(e.from)?.label;
      const b = byId.get(e.to)?.label;
      if (a && b) out.push(`- ${a} *${RELATION_LABELS[e.relation]?.[lang] ?? e.relation}* ${b}`);
    }
    return out.join("\n\n");
  }

  // Research is teacher-only preparation: it never has a student version.
  const research = meta.kind === "research" ? asResearch(content) : null;
  const doc = research ? research : variant === "student" ? toStudentDoc(asDoc(content)) : asDoc(content);
  if (research?.matrix) out.push(matrixToMarkdown(research.matrix, lang));
  for (const s of doc.sections) {
    const minutes = s.minutes ? ` (${s.minutes} min)` : "";
    out.push(`## ${s.title}${minutes}`);
    if (s.body.trim()) out.push(s.body.trim());
    if (s.sources.length > 0) {
      const refs = s.sources
        .map((r) =>
          variant === "teacher" && r.status === "pending"
            ? `- ${r.text} — *${L(lang, "pendiente de verificación", "pending verification")}*`
            : variant === "teacher" && r.status === "provided"
              ? `- ${r.text} — *${L(lang, "fuente proporcionada por el docente", "source provided by the teacher")}*`
              : `- ${r.text}`,
        )
        .join("\n");
      out.push(`**${L(lang, "Fuentes", "Sources")}**\n\n${refs}`);
    }
  }
  return out.join("\n\n");
}

function examToMarkdown(meta: PrintMeta, exam: ExamContent, variant: Variant): string {
  const lang = meta.language;
  const e = variant === "student" ? toStudentExam(exam) : exam;
  const out: string[] = [];
  const v = e.variant === "B" ? ` — ${L(lang, "Forma B", "Form B")}` : "";
  out.push(`# ${meta.title || L(lang, "Examen", "Exam")}${v}`);
  const metaLine = [meta.subject, meta.discipline, meta.level].filter(Boolean).join(" · ");
  if (metaLine) out.push(`*${metaLine}*`);
  if (variant === "student") {
    out.push(
      [
        `| ${L(lang, "Nombre", "Name")} | |`,
        "|---|---|",
        `| ${L(lang, "Fecha", "Date")} | |`,
        `| ${L(lang, "Tiempo", "Time")} | ${e.durationMin} min |`,
        `| ${L(lang, "Puntaje total", "Total points")} | ${e.totalPoints} |`,
      ].join("\n"),
    );
  } else {
    out.push(`> ${L(lang, "Versión docente · pauta de corrección. No entregar a estudiantes.", "Teacher version · marking guide. Do not hand out to students.")}`);
    out.push(`**${L(lang, "Tiempo", "Time")}:** ${e.durationMin} min · **${L(lang, "Puntaje total", "Total points")}:** ${e.totalPoints}`);
  }
  if (e.instructions.trim()) out.push(`## ${L(lang, "Instrucciones", "Instructions")}\n\n${e.instructions.trim()}`);

  e.questions.forEach((q, i) => {
    const pts = `${q.points} ${L(lang, q.points === 1 ? "punto" : "puntos", q.points === 1 ? "point" : "points")}`;
    const typeLabel = variant === "teacher" ? ` · ${QUESTION_TYPE_LABELS[q.type]?.[lang] ?? q.type}` : "";
    out.push(`## ${L(lang, "Pregunta", "Question")} ${i + 1} (${pts}${typeLabel})`);
    if (q.caseText.trim()) out.push(q.caseText.trim().split("\n").map((l) => `> ${l}`).join("\n"));
    out.push(q.prompt.trim());
    if (q.options.length > 0) {
      out.push(
        q.options
          .map((o, j) => {
            const letter = String.fromCharCode(97 + j);
            const mark = variant === "teacher" && q.correctOption === j ? ` **← ${L(lang, "correcta", "correct")}**` : "";
            return `${letter}) ${o}${mark}`;
          })
          .join("  \n"),
      );
    }
    if (variant === "student") {
      if (q.options.length === 0 && q.answerLines > 0) {
        out.push(Array.from({ length: q.answerLines }, () => "\\_".repeat(70)).join("  \n"));
      }
      return;
    }
    if (q.answerGuide.trim()) out.push(`**${L(lang, "Respuesta orientativa", "Guidance answer")}:** ${q.answerGuide.trim()}`);
    if (q.rubric.length > 0) {
      const rows = q.rubric
        .map((c) => `| ${cell(c.criterion)} | ${cell(c.descriptor)} | ${c.points} |`)
        .join("\n");
      out.push(
        `| ${L(lang, "Criterio", "Criterion")} | ${L(lang, "Descriptor de desempeño", "Performance descriptor")} | ${L(lang, "Puntos", "Points")} |\n|---|---|---|\n${rows}`,
      );
    }
    if (q.teacherNotes.trim()) out.push(`*${L(lang, "Observaciones", "Notes")}:* ${q.teacherNotes.trim()}`);
  });
  if (variant === "teacher" && e.bibliography.trim()) {
    out.push(`## ${L(lang, "Bibliografía", "Bibliography")}\n\n${e.bibliography.trim()}`);
  }
  return out.join("\n\n");
}

function cell(s: string) {
  return s.replace(/\|/g, "/").replace(/\n+/g, " ");
}

/** Plain-text digest of a material, used as context when generating from it. */
export function materialDigest(meta: PrintMeta, content: unknown, maxChars = 14000): string {
  const md = materialToMarkdown(meta, content, "teacher");
  return md.length > maxChars ? `${md.slice(0, maxChars)}\n…` : md;
}
