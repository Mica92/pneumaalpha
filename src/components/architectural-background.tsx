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
        className="h-full w-full object-cover opacity-[0.2] grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/82 to-background/96" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/65 via-transparent to-background/65" />
    </div>
  );
}
