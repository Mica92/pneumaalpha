import archiveImage from "@/assets/architecture-archive.jpg";
import domeImage from "@/assets/architecture-dome.jpg";
import studyImage from "@/assets/architecture-study.jpg";

const IMAGES = {
  archive: archiveImage,
  dome: domeImage,
  study: studyImage,
} as const;

export function PageAtmosphere({ variant }: { variant: keyof typeof IMAGES }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[32rem] w-screen -translate-x-1/2 overflow-hidden border-b border-border/30"
    >
      <img
        src={IMAGES[variant]}
        alt=""
        width={1920}
        height={1088}
        loading="lazy"
        className="h-full w-full object-cover grayscale-[0.35] opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-background/78 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
    </div>
  );
}