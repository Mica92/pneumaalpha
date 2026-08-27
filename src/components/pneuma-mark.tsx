import { useTint } from "@/lib/tint";

/**
 * PneumAlpha mark — two overlapping serif "lambda" strokes:
 * a small neutral-gray stroke behind, and a large stroke in front
 * painted with the visit tint, exactly like the neural background,
 * so logo and backdrop always share the same hue.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const label = "PneumAlpha";
  const tint = useTint() ?? "var(--bronze)";
  const gray = "color-mix(in oklab, var(--muted-foreground) 75%, transparent)";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} role="img" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        {/* small gray stroke (back-left lambda) */}
        <path
          d="M10 54 L24 16 L36 44"
          stroke={gray}
          strokeWidth="4.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* large tinted stroke (front lambda) */}
        <path
          d="M26 56 L40 8 L54 56"
          stroke={tint}
          strokeWidth="5.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <span
          aria-hidden="true"
          className="font-serif text-subtitle font-medium tracking-[0.14em] text-foreground"
        >
          Pneum<span style={{ color: tint }}>Alpha</span>
        </span>
      )}
    </span>
  );
}
