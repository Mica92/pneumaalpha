import heideggerScene from "@/assets/scenes/heidegger.jpg";
import schopenhauerScene from "@/assets/scenes/schopenhauer.jpg";
import jamesScene from "@/assets/scenes/james.jpg";
import nietzscheScene from "@/assets/scenes/nietzsche.jpg";
import marxScene from "@/assets/scenes/marx.jpg";
import benthamScene from "@/assets/scenes/bentham.jpg";
import pohlenzScene from "@/assets/scenes/pohlenz.jpg";
import rationalismScene from "@/assets/scenes/rationalism.jpg";
import pascalScene from "@/assets/scenes/pascal.jpg";
import kierkegaardScene from "@/assets/scenes/kierkegaard.jpg";
import yannarasScene from "@/assets/scenes/yannaras.jpg";
import levinasScene from "@/assets/scenes/levinas.jpg";
import maimonidesScene from "@/assets/scenes/maimonides.jpg";
import aquinasScene from "@/assets/scenes/aquinas.jpg";
import eckhartScene from "@/assets/scenes/eckhart.jpg";
import kantScene from "@/assets/scenes/kant.jpg";
import hegelScene from "@/assets/scenes/hegel.jpg";
import spenglerScene from "@/assets/scenes/spengler.jpg";
import jungerScene from "@/assets/scenes/junger.jpg";
import type { PhilosopherId } from "@/lib/philosophers";

/**
 * Fondos cinematográficos del chat: el lugar de cada mente, sin personas.
 * Mismo lenguaje visual que los retratos (archivo B/N, grano analógico).
 */
export const SCENES: Partial<Record<PhilosopherId, string>> = {
  heidegger: heideggerScene,
  schopenhauer: schopenhauerScene,
  james: jamesScene,
  nietzsche: nietzscheScene,
  marx: marxScene,
  bentham: benthamScene,
  pohlenz: pohlenzScene,
  rationalism: rationalismScene,
  pascal: pascalScene,
  kierkegaard: kierkegaardScene,
  yannaras: yannarasScene,
  levinas: levinasScene,
  maimonides: maimonidesScene,
  aquinas: aquinasScene,
  eckhart: eckhartScene,
  kant: kantScene,
  hegel: hegelScene,
  spengler: spenglerScene,
  junger: jungerScene,
};

export function sceneOf(id: string): string | undefined {
  return SCENES[id as PhilosopherId];
}
