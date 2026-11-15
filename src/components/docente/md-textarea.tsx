import { useEffect, useRef } from "react";
import { useTr } from "@/lib/docente/use-docente";
import { cn } from "@/lib/utils";

type Insert = { label: string; title: string; before: string; after?: string; placeholder?: string; block?: boolean };

/** Markdown textarea with a small formatting toolbar and auto height. */
export function MdTextarea({
  value,
  onChange,
  minRows = 6,
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  minRows?: number;
  ariaLabel: string;
  className?: string;
}) {
  const tr = useTr();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, minRows * 24)}px`;
  }, [value, minRows]);

  const tools: Insert[] = [
    { label: "B", title: tr("Negrita", "Bold"), before: "**", after: "**", placeholder: tr("texto", "text") },
    { label: "I", title: tr("Cursiva", "Italic"), before: "*", after: "*", placeholder: tr("texto", "text") },
    { label: "H", title: tr("Subtítulo", "Subheading"), before: "### ", placeholder: tr("Subtítulo", "Subheading"), block: true },
    { label: "•", title: tr("Lista", "List"), before: "- ", placeholder: tr("elemento", "item"), block: true },
    { label: "1.", title: tr("Lista numerada", "Numbered list"), before: "1. ", placeholder: tr("elemento", "item"), block: true },
    { label: "❝", title: tr("Cita", "Quote"), before: "> ", placeholder: tr("cita", "quote"), block: true },
    {
      label: "▦",
      title: tr("Tabla", "Table"),
      before: tr("| Columna A | Columna B |\n|---|---|\n| ", "| Column A | Column B |\n|---|---|\n| "),
      after: " | |",
      placeholder: "…",
      block: true,
    },
    { label: "?", title: tr("Insertar pregunta", "Insert question"), before: tr("**Pregunta:** ", "**Question:** "), placeholder: "…", block: true },
    { label: "✎", title: tr("Nota", "Note"), before: tr("> **Nota:** ", "> **Note:** "), placeholder: "…", block: true },
  ];

  function apply(t: Insert) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || t.placeholder || "";
    const prefix = t.block && start > 0 && value[start - 1] !== "\n" ? "\n\n" : "";
    const next = value.slice(0, start) + prefix + t.before + selected + (t.after ?? "") + value.slice(end);
    onChange(next);
    const caret = start + prefix.length + t.before.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret + selected.length);
    });
  }

  return (
    <div className={cn("rounded-md border border-border bg-input/40", className)}>
      <div role="toolbar" aria-label={tr("Formato", "Formatting")} className="flex flex-wrap gap-0.5 border-b border-border/70 px-1.5 py-1">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            aria-label={t.title}
            onClick={() => apply(t)}
            className="focus-mist h-7 min-w-7 rounded px-1.5 text-small text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-mist block w-full resize-none bg-transparent px-3 py-2.5 font-mono text-[0.875rem] leading-6 text-foreground"
        spellCheck
      />
    </div>
  );
}
