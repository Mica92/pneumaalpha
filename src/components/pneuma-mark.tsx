/**
 * Kionas mark — faceted origami swan.
 * Stable bronze facets tie the mark to the architectural editorial system.
 */
type Props = {
  className?: string;
  withWordmark?: boolean;
  size?: number;
};

export function PneumaMark({ className = "", withWordmark = false, size = 28 }: Props) {
  const label = "Kionas";

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
        <path d="M37 41 L13 6 L26 34 Z" className="fill-bronze-soft" />
        <path d="M37 41 L26 34 L30 12 Z" className="fill-bronze" />
        <path d="M37 41 L30 12 L10 16 Z" className="fill-bronze-bright" />
        <path d="M37 41 L10 16 L20 33 Z" className="fill-foreground/80" />
        <path d="M37 41 L20 33 L7 27 Z" className="fill-bronze-soft" />
        <path d="M37 41 L7 27 L18 38 Z" className="fill-foreground/70" />
        <path d="M37 41 L18 38 L9 39 Z" className="fill-bronze" />
        <path d="M37 41 L9 39 L20 45 Z" className="fill-bronze-bright" />

        {/* body */}
        <path d="M37 41 L20 45 L18 52 L30 58 Z" className="fill-bronze-soft" />
        <path d="M37 41 L30 58 L45 57 Z" className="fill-bronze" />
        <path d="M37 41 L45 57 L50 46 Z" className="fill-bronze-bright" />
        <path d="M37 41 L50 46 L52 40 Z" className="fill-bronze" />

        {/* neck */}
        <path
          d="M49 47 C44 30 44 16 52 14 C59 12 61 20 56 23"
          className="stroke-bronze-soft"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M50 45 C46 31 47 19 52.5 17.5"
          className="stroke-foreground/75"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* head + beak */}
        <path d="M55 17 L60 20 L56 24 Z" className="fill-bronze" />
        <path d="M56 23 L62 27 L55 26 Z" className="fill-bronze-soft" />
      </svg>
      {withWordmark && (
        <span
          aria-hidden="true"
          className="whitespace-nowrap font-serif text-subtitle font-medium tracking-[0.14em] text-foreground"
        >
          Kion<span className="text-bronze">as</span>
        </span>
      )}
    </span>
  );
}
