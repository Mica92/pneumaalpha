import { useTint } from "@/lib/tint";

/**
 * PneumAlpha mark — 8-bit pixel-art apple (Mario Bros style).
 * The apple body takes the visit tint (the same hue that colours the neural
 * background); the leaf is a green-shifted mix of it so it always reads as an
 * apple. Before hydration it falls back to the bronze brand token.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

/** Horizontal spans of the apple body, row by row (16x16 grid). */
const BODY_ROWS: Array<[number, number] | null> = [
  null, // 0
  null, // 1
  null, // 2
  null, // 3
  null, // 4 — stem / leaf rows above
  [4, 6], // 5 (left hump) — second hump added below
  [3, 12],
  [2, 13],
  [2, 13],
  [1, 14],
  [1, 14],
  [2, 13],
  [2, 13],
  [3, 12],
  [4, 11],
  [6, 9],
];

/** Extra span for the notched top-right hump. */
const RIGHT_HUMP: [number, number] = [9, 11];

const HIGHLIGHT = [
  [4, 7],
  [5, 7],
  [4, 8],
  [3, 9],
  [4, 9],
];

const LEAF = [
  [9, 3],
  [10, 3],
  [11, 3],
  [9, 4],
  [10, 4],
  [11, 4],
  [12, 4],
  [10, 5],
  [11, 5],
];

const STEM = [
  [8, 1],
  [8, 2],
  [8, 3],
  [8, 4],
];

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const tint = useTint();
  const base = tint ?? "var(--bronze)";
  const body = base;
  const shade = `color-mix(in oklab, ${base} 62%, black)`;
  const light = `color-mix(in oklab, ${base} 55%, white)`;
  const outline = "color-mix(in oklab, var(--ink) 82%, black)";
  const leaf = `color-mix(in oklab, ${base} 45%, oklch(0.62 0.16 145))`;
  const label = "PneumAlpha";

  const px: React.ReactElement[] = [];
  const push = (x: number, y: number, fill: string, key: string) => {
    px.push(<rect key={key} x={x} y={y} width={1} height={1} fill={fill} />);
  };

  // Body + outline
  BODY_ROWS.forEach((span, y) => {
    const spans: Array<[number, number]> = [];
    if (span) spans.push(span);
    if (y === 5) spans.push(RIGHT_HUMP);
    spans.forEach(([x0, x1], si) => {
      for (let x = x0; x <= x1; x++) {
        const prev = y > 0 ? BODY_ROWS[y - 1] : null;
        const next = y < 15 ? BODY_ROWS[y + 1] : null;
        const inPrev =
          (prev && x >= prev[0] && x <= prev[1]) ||
          (y === 6 && x >= RIGHT_HUMP[0] && x <= RIGHT_HUMP[1]);
        const inNext = next && x >= next[0] && x <= next[1];
        const edge = x === x0 || x === x1 || !inPrev || !inNext;
        push(x, y, edge ? outline : y >= 12 ? shade : body, `b${y}-${si}-${x}`);
      }
    });
  });

  // Specular highlight (pixel blocks, top-left)
  HIGHLIGHT.forEach(([x, y], i) => push(x, y, light, `h${i}`));
  // Stem
  STEM.forEach(([x, y], i) => push(x, y, outline, `s${i}`));
  // Leaf
  LEAF.forEach(([x, y], i) => push(x, y, leaf, `l${i}`));

  return (
    <span className={`inline-flex items-center gap-3 ${className}`} role="img" aria-label={label}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        shapeRendering="crispEdges"
        className="shrink-0"
      >
        {px}
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
