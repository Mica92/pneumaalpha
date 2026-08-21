import { useEffect, useState } from "react";
import neuralBg from "@/assets/neural-bg.jpg";

/**
 * Global background: one neural-network image, tinted with a different hue
 * on every visit. Mounted once in __root so every page shares it.
 * The tint is chosen after hydration to avoid SSR mismatches.
 */
const TINTS = [
  "oklch(0.62 0.17 250)", // azul
  "oklch(0.68 0.16 350)", // rosa
  "oklch(0.78 0.15 95)", // amarillo
  "oklch(0.66 0.14 160)", // verde
  "oklch(0.60 0.16 300)", // violeta
  "oklch(0.72 0.16 60)", // ámbar
  "oklch(0.70 0.13 200)", // cian
];

export function NeuralBackground() {
  const [tint, setTint] = useState<string | null>(null);

  useEffect(() => {
    setTint(TINTS[Math.floor(Math.random() * TINTS.length)]);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <img
        src={neuralBg}
        alt=""
        width={1920}
        height={1280}
        loading="lazy"
        className="h-full w-full object-cover opacity-[0.45] grayscale"
      />
      {tint && (
        // The tint layer is clipped by the image itself, so only the bright
        // network lines and nodes take colour; the surrounding field stays ink.
        <div
          className="absolute inset-0 opacity-90 mix-blend-screen"
          style={{
            backgroundColor: tint,
            maskImage: `url(${neuralBg})`,
            WebkitMaskImage: `url(${neuralBg})`,
            maskSize: "cover",
            WebkitMaskSize: "cover",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskMode: "luminance",
            WebkitMaskComposite: "source-over",
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/65 to-background/85" />
    </div>
  );
}
