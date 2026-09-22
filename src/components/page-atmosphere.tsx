/**
 * Section atmosphere. A hairline-lit band at the top of a page: no imagery,
 * only a faint wash so the header feels grounded without competing with text.
 */
type Variant = "archive" | "dome" | "study";

const TINT: Record<Variant, string> = {
  archive: "var(--bronze)",
  dome: "var(--tension)",
  study: "var(--keep)",
};

export function PageAtmosphere({ variant }: { variant: Variant }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-screen -translate-x-1/2 overflow-hidden"
      style={{
        background: `radial-gradient(70% 100% at 50% 0%, color-mix(in oklab, ${TINT[variant]} 13%, transparent) 0%, transparent 72%)`,
      }}
    />
  );
}
