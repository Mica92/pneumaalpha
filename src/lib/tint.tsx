import { createContext, useContext, useEffect, useState } from "react";

/**
 * Global visit tint: one hue chosen per visit, shared by the neural background
 * and the brand mark so both always read as the same colour.
 * Chosen after hydration to avoid SSR mismatches.
 */
export const TINTS = [
  "oklch(0.62 0.17 250)", // azul
  "oklch(0.68 0.16 350)", // rosa
  "oklch(0.78 0.15 95)", // amarillo
  "oklch(0.66 0.14 160)", // verde
  "oklch(0.60 0.16 300)", // violeta
  "oklch(0.72 0.16 60)", // ámbar
  "oklch(0.70 0.13 200)", // cian
];

const TintContext = createContext<string | null>(null);

export function useTint() {
  return useContext(TintContext);
}

export function TintProvider({ children }: { children: React.ReactNode }) {
  const [tint, setTint] = useState<string | null>(null);

  useEffect(() => {
    const picked = TINTS[Math.floor(Math.random() * TINTS.length)];
    setTint(picked);
    document.documentElement.style.setProperty("--tint", picked);
  }, []);

  return <TintContext.Provider value={tint}>{children}</TintContext.Provider>;
}
