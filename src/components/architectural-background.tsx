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
        className="h-full w-full object-cover opacity-[0.38] grayscale-[0.55] brightness-110 contrast-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/62 to-background/88" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/45 via-transparent to-background/45" />
    </div>
  );
}
