/**
 * Quiet intelligence background. No imagery: a calm ink field with a warm
 * stone wash and an almost invisible grain, so reading surfaces stay silent.
 */
export function ArchitecturalBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background">
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, color-mix(in oklab, var(--bronze) 10%, transparent) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(90% 60% at 10% 110%, color-mix(in oklab, var(--tension) 16%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="noise-veil absolute inset-0" />
    </div>
  );
}
