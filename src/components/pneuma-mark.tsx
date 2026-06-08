/**
 * Pneumalpha mark — chevron glyph adapted to the "Arrival fog" palette.
 * Two stacked angle shapes (mist + foreground) pointing inward, like a breath
 * folding back on itself. Used as the brand logo across nav and auth.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const label = "Pneumalpha";
  return (
    <span
      className={`inline-flex items-center gap-3 ${className}`}
      role="img"
      aria-label={label}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        {/* Outer chevron — mist (softer tone) */}
        <path
          d="M28 14 L14 32 L28 50"
          stroke="var(--mist)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
        {/* Inner chevron — foreground (crisper) */}
        <path
          d="M50 14 L30 32 L50 50"
          stroke="var(--foreground)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <>
          <span aria-hidden="true" className="h-6 w-px bg-border" />
          <span
            aria-hidden="true"
            className="font-display text-base font-bold tracking-[0.22em] text-foreground"
          >
            PNEUMALPHA
          </span>
        </>
      )}
    </span>
  );
}
