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
import cioranScene from "@/assets/scenes/cioran.jpg";
import rousseauScene from "@/assets/scenes/rousseau.jpg";
import burkeScene from "@/assets/scenes/burke.jpg";
import emersonScene from "@/assets/scenes/emerson.jpg";
import thoreauScene from "@/assets/scenes/thoreau.jpg";
import stirnerScene from "@/assets/scenes/stirner.jpg";
import bakuninScene from "@/assets/scenes/bakunin.jpg";
import arendtScene from "@/assets/scenes/arendt.jpg";
import negrihardtScene from "@/assets/scenes/negrihardt.jpg";
import randScene from "@/assets/scenes/rand.jpg";
import gadamerScene from "@/assets/scenes/gadamer.jpg";
import ibnkhaldunScene from "@/assets/scenes/ibnkhaldun.jpg";
import nishidaScene from "@/assets/scenes/nishida.jpg";
import iqbalScene from "@/assets/scenes/iqbal.jpg";
import eliadeScene from "@/assets/scenes/eliade.jpg";
import evolaScene from "@/assets/scenes/evola.jpg";
import jabriScene from "@/assets/scenes/jabri.jpg";
import quoistScene from "@/assets/scenes/quoist.jpg";
import sartreScene from "@/assets/scenes/sartre.jpg";
import camusScene from "@/assets/scenes/camus.jpg";
import berlinScene from "@/assets/scenes/berlin.jpg";
import bostromScene from "@/assets/scenes/bostrom.jpg";
import krishnamurtiScene from "@/assets/scenes/krishnamurti.jpg";
import zubiriScene from "@/assets/scenes/zubiri.jpg";
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
  cioran: cioranScene,
  rousseau: rousseauScene,
  burke: burkeScene,
  emerson: emersonScene,
  thoreau: thoreauScene,
  stirner: stirnerScene,
  bakunin: bakuninScene,
  arendt: arendtScene,
  negrihardt: negrihardtScene,
  rand: randScene,
  gadamer: gadamerScene,
  ibnkhaldun: ibnkhaldunScene,
  nishida: nishidaScene,
  iqbal: iqbalScene,
  eliade: eliadeScene,
  evola: evolaScene,
  jabri: jabriScene,
  quoist: quoistScene,
  sartre: sartreScene,
  camus: camusScene,
  berlin: berlinScene,
  bostrom: bostromScene,
  krishnamurti: krishnamurtiScene,
  zubiri: zubiriScene,
};

export function sceneOf(id: string): string | undefined {
  return SCENES[id as PhilosopherId];
}
