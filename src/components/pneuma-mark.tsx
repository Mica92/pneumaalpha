import { useTint } from "@/lib/tint";

/**
 * PneumAlpha mark — flat pixel-art apple silhouette.
 * A single ink: the visit tint (the same hue that colours the neural
 * background). No outline, no specular highlight, no bottom shade — the flat
 * silhouette stays legible at 16-28px and matches the dark editorial style.
 * Before hydration it falls back to the bronze brand token.
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
  const leaf = `color-mix(in oklab, ${base} 60%, transparent)`;
  const stem = `color-mix(in oklab, ${base} 45%, transparent)`;
  const label = "PneumAlpha";

  const px: React.ReactElement[] = [];
  const push = (x: number, y: number, fill: string, key: string) => {
    px.push(<rect key={key} x={x} y={y} width={1} height={1} fill={fill} />);
  };

  // Flat body
  BODY_ROWS.forEach((span, y) => {
    const spans: Array<[number, number]> = [];
    if (span) spans.push(span);
    if (y === 5) spans.push(RIGHT_HUMP);
    spans.forEach(([x0, x1], si) => {
      for (let x = x0; x <= x1; x++) push(x, y, base, `b${y}-${si}-${x}`);
    });
  });

  // Stem
  STEM.forEach(([x, y], i) => push(x, y, stem, `s${i}`));
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
