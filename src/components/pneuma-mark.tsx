/**
 * PneumAlpha mark — chevron glyph in the "Dark editorial" palette.
 * Two stacked angle shapes (bronze + paper) folding inward, like a breath
 * turning back on itself. Used as the brand logo across nav, footer and auth.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const label = "PneumAlpha";
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
        <path
          d="M28 14 L14 32 L28 50"
          stroke="var(--bronze)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />
        <path
          d="M50 14 L30 32 L50 50"
          stroke="var(--foreground)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span
          aria-hidden="true"
          className="font-serif text-subtitle font-medium tracking-[0.14em] text-foreground"
        >
          Pneum<span className="text-bronze">Alpha</span>
        </span>
      )}
    </span>
  );
}
