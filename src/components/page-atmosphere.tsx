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
        className="h-full w-full object-cover grayscale-[0.2] opacity-55 brightness-110 contrast-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/52 to-background/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/45 via-transparent to-background/45" />
    </div>
  );
}