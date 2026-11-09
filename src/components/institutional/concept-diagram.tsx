import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Diagrama conceptual (esquemático, no es una pantalla del producto):
 * una pregunta examinada desde tres tradiciones que existen en Kionas.
 */
export function ConceptDiagram({ className }: { className?: string }) {
  const { lang } = useI18n();
  const es = lang === "es";
  const question = es ? "¿Qué es actuar con libertad?" : "What is it to act freely?";
  const nodes = es
    ? [
        { x: 46, y: 150, label: "Estoicismo", note: "lo que depende de mí" },
        { x: 180, y: 182, label: "Existencialismo", note: "elegir sin garantías" },
        { x: 314, y: 150, label: "Budismo filosófico", note: "el deseo que ata" },
      ]
    : [
        { x: 46, y: 150, label: "Stoicism", note: "what depends on me" },
        { x: 180, y: 182, label: "Existentialism", note: "choosing without guarantees" },
        { x: 314, y: 150, label: "Philosophical Buddhism", note: "the desire that binds" },
      ];

  return (
    <figure
      className={cn("rounded-lg border border-border bg-card p-5 shadow-inst", className)}
      aria-label={
        es
          ? "Diagrama conceptual: una pregunta examinada desde tres tradiciones filosóficas"
          : "Conceptual diagram: one question examined from three philosophical traditions"
      }
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="inst-eyebrow text-[0.625rem]">{es ? "Diagrama conceptual" : "Conceptual diagram"}</p>
        <p className="text-[0.6875rem] text-muted-foreground">
          {es ? "Una pregunta · tres tradiciones" : "One question · three traditions"}
        </p>
      </div>
      <svg viewBox="0 0 360 230" className="mt-3 h-auto w-full" role="img" aria-hidden="true">
        <g className="stroke-sage-line" strokeWidth="1" fill="none">
          {nodes.map((n) => (
            <path key={n.label} d={`M180 46 C180 ${(46 + n.y) / 2}, ${n.x} ${(46 + n.y) / 2 - 10}, ${n.x} ${n.y - 14}`} />
          ))}
          <path d="M60 150 Q180 120 300 150" strokeDasharray="2 4" className="stroke-brass" />
        </g>
        <g>
          <rect x="70" y="20" width="220" height="40" rx="20" className="fill-navy" />
          <text x="180" y="45" textAnchor="middle" className="fill-ivory font-serif" fontSize="15">
            {question}
          </text>
        </g>
        {nodes.map((n) => (
          <g key={n.label}>
            <circle cx={n.x} cy={n.y - 6} r="5" className="fill-card stroke-navy" strokeWidth="1.5" />
            <text x={n.x} y={n.y + 14} textAnchor="middle" className="fill-navy font-sans" fontSize="10.5" fontWeight="600">
              {n.label}
            </text>
            <text x={n.x} y={n.y + 28} textAnchor="middle" className="fill-sage-blue font-sans" fontSize="9.5">
              {n.note}
            </text>
          </g>
        ))}
        <text x="180" y="128" textAnchor="middle" className="fill-bronze font-sans" fontSize="9" letterSpacing="1.4">
          {es ? "TENSIÓN" : "TENSION"}
        </text>
      </svg>
    </figure>
  );
}
