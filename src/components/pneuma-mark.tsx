import { useTint } from "@/lib/tint";

/**
 * PneumAlpha mark — a luminous triangle (delta) with a central stem:
 * an amber node above, a blue node below, joined by a thin spine.
 * The triangle and lower node follow the visit tint, exactly like the
 * neural background, so logo and backdrop always share the same hue;
 * the amber node stays as a fixed warm accent.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const label = "PneumAlpha";
  const tint = useTint() ?? "var(--bronze)";
  const soft = `color-mix(in oklab, ${tint} 60%, transparent)`;
  const amber = "#F0A35C";
  const amberSoft = "color-mix(in oklab, #F0A35C 55%, transparent)";

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
        {/* triangle outline */}
        <path
          d="M32 6 L58 54 L6 54 Z"
          stroke={tint}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* inner diagonal to the base node */}
        <line x1="32" y1="38" x2="12" y2="50.5" stroke={soft} strokeWidth="2" strokeLinecap="round" />
        {/* central spine */}
        <line x1="32" y1="22" x2="32" y2="38" stroke={soft} strokeWidth="2" strokeLinecap="round" />
        {/* amber node (fixed warm accent) */}
        <circle cx="32" cy="19" r="6.5" fill={amberSoft} />
        <circle cx="32" cy="19" r="4" fill={amber} />
        {/* blue node (tinted, like the background) */}
        <circle cx="32" cy="41" r="7" fill={soft} />
        <circle cx="32" cy="41" r="4.5" fill={tint} />
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
