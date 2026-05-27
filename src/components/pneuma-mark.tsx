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
        {/* Lighter chevron — sky blue */}
        <path
          d="M28 14 L14 32 L28 50"
          stroke="#3DB4F2"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Darker chevron — indigo */}
        <path
          d="M50 14 L30 32 L50 50"
          stroke="#4F6BFF"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>
      {withWordmark && (
        <>
          <span
            aria-hidden
            className="h-6 w-px bg-border"
          />
          <span className="font-display text-base font-semibold tracking-[0.3em] text-foreground">
            PNEUMAA
          </span>
        </>
      )}

    </span>
  );
}
