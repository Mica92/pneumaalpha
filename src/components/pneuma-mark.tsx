import { useTint } from "@/lib/tint";

/**
 * PneumAlpha mark — apple drawn as an open outline, with a neural seed
 * (five-node star) at its core. Both take the visit tint, the same hue that
 * colours the neural background, so the mark always matches the page.
 * Before hydration it falls back to the bronze brand token.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

const NODES: Array<[number, number]> = [
  [32, 23],
  [44.4, 32],
  [39.6, 46.5],
  [24.4, 46.5],
  [19.6, 32],
];

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const tint = useTint();
  const base = tint ?? "var(--bronze)";
  const shell = `color-mix(in oklab, ${base} 55%, transparent)`;
  const leaf = `color-mix(in oklab, ${base} 38%, transparent)`;
  const label = "PneumAlpha";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} role="img" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        {/* apple shell */}
        <path
          d="M32 16 C 26 7, 12 8, 9 23 C 6 39, 14 58, 32 58 C 50 58, 58 39, 55 23 C 52 8, 38 7, 32 16"
          fill="none"
          stroke={shell}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* leaf */}
        <path
          d="M35 11 C 43 4, 51 3.5, 56 6 C 51.5 13.5, 43 15.5, 35 11 Z"
          fill={leaf}
        />
        {/* stem */}
        <path
          d="M32 16 C 32 10, 34 5.5, 40 4.5"
          fill="none"
          stroke={shell}
          strokeWidth={4}
          strokeLinecap="round"
        />
        {/* neural seed */}
        <g stroke={base} strokeWidth={3.4} strokeLinecap="round">
          {NODES.map(([x, y], i) => (
            <line key={`e${i}`} x1={32} y1={36} x2={x} y2={y} />
          ))}
        </g>
        <circle cx={32} cy={36} r={5.2} fill={base} />
        {NODES.map(([x, y], i) => (
          <circle key={`n${i}`} cx={x} cy={y} r={3.4} fill={base} />
        ))}
      </svg>
      {withWordmark && (
        <span
          aria-hidden="true"
          className="font-serif text-subtitle font-medium tracking-[0.14em] text-foreground"
        >
          Pneum<span style={{ color: base }}>Alpha</span>
        </span>
      )}
    </span>
  );
}
