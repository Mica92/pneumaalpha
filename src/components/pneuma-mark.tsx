import { useTint } from "@/lib/tint";

/**
 * Pneuma Alpha mark — faceted origami swan.
 * Every facet is painted from the visit tint (same hue as the neural
 * background), mixing toward white/black for the paper-fold shading,
 * so logo and backdrop always share the same colour.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const label = "Pneuma Alpha";
  const tint = useTint() ?? "var(--bronze)";

  const deep = `color-mix(in oklab, ${tint} 78%, #000)`;
  const dark = `color-mix(in oklab, ${tint} 92%, #000)`;
  const mid = tint;
  const light = `color-mix(in oklab, ${tint} 62%, #fff)`;
  const pale = `color-mix(in oklab, ${tint} 38%, #fff)`;

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
        {/* wing feathers, fanning from the pivot */}
        <path d="M37 41 L13 6 L26 34 Z" fill={deep} />
        <path d="M37 41 L26 34 L30 12 Z" fill={dark} />
        <path d="M37 41 L30 12 L10 16 Z" fill={pale} />
        <path d="M37 41 L10 16 L20 33 Z" fill={light} />
        <path d="M37 41 L20 33 L7 27 Z" fill={deep} />
        <path d="M37 41 L7 27 L18 38 Z" fill={pale} />
        <path d="M37 41 L18 38 L9 39 Z" fill={mid} />
        <path d="M37 41 L9 39 L20 45 Z" fill={light} />

        {/* body */}
        <path d="M37 41 L20 45 L18 52 L30 58 Z" fill={deep} />
        <path d="M37 41 L30 58 L45 57 Z" fill={mid} />
        <path d="M37 41 L45 57 L50 46 Z" fill={light} />
        <path d="M37 41 L50 46 L52 40 Z" fill={dark} />

        {/* neck */}
        <path
          d="M49 47 C44 30 44 16 52 14 C59 12 61 20 56 23"
          stroke={deep}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M50 45 C46 31 47 19 52.5 17.5"
          stroke={pale}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* head + beak */}
        <path d="M55 17 L60 20 L56 24 Z" fill={dark} />
        <path d="M56 23 L62 27 L55 26 Z" fill={deep} />
      </svg>
      {withWordmark && (
        <span
          aria-hidden="true"
          className="whitespace-nowrap font-serif text-subtitle font-medium tracking-[0.14em] text-foreground"
        >
          Pneuma <span style={{ color: tint }}>Alpha</span>
        </span>
      )}
    </span>
  );
}
