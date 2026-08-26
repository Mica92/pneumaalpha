import { useTint } from "@/lib/tint";

/**
 * PneumAlpha mark — a neural lattice: a diamond network of nodes and edges
 * with a luminous vertical spine. Both the network and the spine follow the
 * visit tint, exactly like the neural background, so logo and backdrop
 * always share the same hue.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

const SPINE: [number, number][] = [
  [32, 6],
  [32, 17],
  [32, 27],
  [32, 37],
  [32, 47],
  [32, 58],
];

const OUTER: [number, number][] = [
  [15, 17],
  [49, 17],
  [8, 29],
  [56, 29],
  [17, 31],
  [47, 31],
  [13, 43],
  [51, 43],
  [21, 50],
  [43, 50],
];

const EDGES: [number, number, number, number][] = [
  // top vertex fan
  [32, 6, 15, 17],
  [32, 6, 49, 17],
  [32, 6, 8, 29],
  [32, 6, 56, 29],
  [32, 6, 17, 31],
  [32, 6, 47, 31],
  // bottom vertex fan
  [32, 58, 8, 29],
  [32, 58, 56, 29],
  [32, 58, 13, 43],
  [32, 58, 51, 43],
  [32, 58, 21, 50],
  [32, 58, 43, 50],
  [32, 58, 17, 31],
  [32, 58, 47, 31],
  // lateral webbing
  [15, 17, 17, 31],
  [49, 17, 47, 31],
  [8, 29, 13, 43],
  [56, 29, 51, 43],
  [13, 43, 21, 50],
  [51, 43, 43, 50],
  [17, 31, 13, 43],
  [47, 31, 51, 43],
  [8, 29, 17, 31],
  [56, 29, 47, 31],
  // inner rhombus
  [17, 31, 32, 17],
  [47, 31, 32, 17],
  [17, 31, 32, 47],
  [47, 31, 32, 47],
];

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const label = "PneumAlpha";
  const tint = useTint() ?? "var(--bronze)";
  const soft = `color-mix(in oklab, ${tint} 55%, transparent)`;
  const faint = `color-mix(in oklab, ${tint} 32%, transparent)`;

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
        <g stroke={faint} strokeWidth="1.1" strokeLinecap="round">
          {EDGES.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        <line x1="32" y1="6" x2="32" y2="58" stroke={soft} strokeWidth="1.4" strokeLinecap="round" />
        {OUTER.map(([cx, cy], i) => (
          <circle key={`o${i}`} cx={cx} cy={cy} r="2.6" fill={soft} />
        ))}
        {SPINE.map(([cx, cy], i) => (
          <circle key={`s${i}`} cx={cx} cy={cy} r="3" fill={tint} />
        ))}
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
