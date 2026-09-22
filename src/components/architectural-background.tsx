import architectureBg from "@/assets/architecture-global.jpg";

/**
 * Global architectural atmosphere. Mounted once so every page shares the
 * same stable visual foundation without competing with reading surfaces.
 */
export function ArchitecturalBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={architectureBg}
        alt=""
        width={1920}
        height={1088}
        className="h-full w-full object-cover opacity-[0.55] grayscale-[0.25] brightness-125 contrast-105 saturate-[1.15]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/45 to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
    </div>
  );
}
