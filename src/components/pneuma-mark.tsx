/**
 * PNEUMALPHA mark — stacked chevron blades pointing right.
 * Adapted to the "Arrival fog" palette: mist on top, glacier shadow below.
 * Wordmark uses Sora bold (font-display) for consistency with the brand.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 32 }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        {/* Upper chevron blade — mist */}
        <path
          d="M30 6 L52 6 L30 28 L8 28 Z"
          fill="var(--mist)"
        />
        {/* Lower chevron blade — mist (slightly dimmed) */}
        <path
          d="M30 32 L52 32 L30 54 L8 54 Z"
          fill="var(--mist)"
          opacity="0.92"
        />
        {/* Shadow triangle at the tip — glacier */}
        <path
          d="M30 54 L41 43 L52 54 Z"
          fill="var(--glacier)"
          opacity="0.55"
        />
      </svg>
      {withWordmark && (
        <span className="font-display text-base font-bold tracking-[0.22em] text-foreground">
          PNEUMALPHA
        </span>
      )}
    </span>
  );
}
