import heideggerPortrait from "@/assets/heidegger-portrait.jpg";
import type { PhilosopherId } from "@/lib/philosophers";

/** Cinematic archival portraits, keyed by philosopher id. */
export const PORTRAITS: Partial<Record<PhilosopherId, string>> = {
  heidegger: heideggerPortrait,
};

export function portraitOf(id: string): string | undefined {
  return PORTRAITS[id as PhilosopherId];
}
