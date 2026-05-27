/**
 * PneumaA mark — chevron glyph adapted to the "Arrival fog" palette.
 * Two stacked angle shapes (mist + glacier) pointing inward, like a breath
 * folding back on itself. Used as the brand logo across nav and auth.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
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
        {/* Lighter chevron — mist */}
        <path
          d="M40 14 L24 32 L40 50"
          stroke="oklch(0.82 0.018 230)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* Darker chevron — glacier, offset inward */}
        <path
          d="M52 14 L36 32 L52 50"
          stroke="oklch(0.55 0.030 228)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
      </svg>
      {withWordmark && (
        <>
          <span
            aria-hidden
            className="h-6 w-px bg-border"
          />
          <span className="font-display text-base font-light tracking-[0.3em] text-foreground">
            PNEUMA
          </span>
        </>
      )}
    </span>
  );
}
