import neuralBg from "@/assets/neural-bg.jpg";
import { useTint } from "@/lib/tint";

/**
 * Global background: one neural-network image, tinted with a different hue
 * on every visit. Mounted once in __root so every page shares it.
 * The hue comes from the shared visit tint, so the brand mark matches it.
 */
export function NeuralBackground() {
  const tint = useTint();

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
