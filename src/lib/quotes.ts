import type { Language } from "@/lib/i18n";

export type QuoteThemeId =
  | "amor"
  | "muerte"
  | "tiempo"
  | "libertad"
  | "sufrimiento"
  | "sabiduria"
  | "fe"
  | "poder"
  | "soledad"
  | "destino";

export type Quote = {
  text: { es: string; en: string };
  author: string;
  theme: QuoteThemeId;
};

export const QUOTE_THEMES: {
  id: QuoteThemeId;
  label: { es: string; en: string };
  glyph: string;
}[] = [
  { id: "amor", label: { es: "Amor", en: "Love" }, glyph: "❧" },
  { id: "muerte", label: { es: "Muerte", en: "Death" }, glyph: "✠" },
  { id: "tiempo", label: { es: "Tiempo", en: "Time" }, glyph: "∴" },
  { id: "libertad", label: { es: "Libertad", en: "Freedom" }, glyph: "◈" },
  { id: "sufrimiento", label: { es: "Sufrimiento", en: "Suffering" }, glyph: "✦" },
  { id: "sabiduria", label: { es: "Sabiduría", en: "Wisdom" }, glyph: "Ω" },
  { id: "fe", label: { es: "Fe", en: "Faith" }, glyph: "✟" },
  { id: "poder", label: { es: "Poder", en: "Power" }, glyph: "☤" },
  { id: "soledad", label: { es: "Soledad", en: "Solitude" }, glyph: "❋" },
  { id: "destino", label: { es: "Destino", en: "Fate" }, glyph: "⧫" },
];

export const QUOTES: Quote[] = [
  // ── Amor ─────────────────────────────────────────────────────────
  {
    author: "Hermann Hesse",
    theme: "amor",
    text: {
      es: "El amor no está para hacernos felices. Creo que existe para mostrarnos cuánto podemos soportar.",
      en: "Love is not there to make us happy. I believe it exists to show us how much we can endure.",
    },
  },
  {
    author: "Hermann Hesse",
    theme: "amor",
    text: {
      es: "Ser amado no es nada; amar, eso lo es todo.",
      en: "To be loved is nothing; to love, that is everything.",
    },
  },
  {
    author: "Emmanuel Levinas",
    theme: "amor",
    text: {
      es: "El rostro del otro me ordena antes de que yo decida nada.",
      en: "The face of the other commands me before I decide anything.",
    },
  },
  {
    author: "Rainer Maria Rilke",
    theme: "amor",
    text: {
      es: "El amor consiste en esto: que dos soledades se protejan, se limiten y se saluden.",
      en: "Love consists in this: that two solitudes protect, border and salute each other.",
    },
  },
  {
    author: "Blaise Pascal",
    theme: "amor",
    text: {
      es: "El corazón tiene razones que la razón no conoce.",
      en: "The heart has its reasons of which reason knows nothing.",
    },
  },

  // ── Muerte ───────────────────────────────────────────────────────
  {
    author: "Martin Heidegger",
    theme: "muerte",
    text: {
      es: "Sólo quien se sabe mortal comprende de veras lo que significa existir.",
      en: "Only one who knows himself mortal truly understands what it means to exist.",
    },
  },
  {
    author: "Epicuro",
    theme: "muerte",
    text: {
      es: "Cuando nosotros somos, la muerte no está; cuando la muerte está, nosotros no somos.",
      en: "When we exist, death is not; when death is, we are not.",
    },
  },
  {
    author: "Marco Aurelio",
    theme: "muerte",
    text: {
      es: "No temas a la muerte: teme no haber comenzado nunca a vivir.",
      en: "Do not fear death: fear never having begun to live.",
    },
  },
  {
    author: "León Tolstói",
    theme: "muerte",
    text: {
      es: "Si vives con la muerte delante, tu vida cambia de peso.",
      en: "If you live with death before you, your life changes in weight.",
    },
  },

  // ── Tiempo ───────────────────────────────────────────────────────
  {
    author: "San Agustín",
    theme: "tiempo",
    text: {
      es: "¿Qué es, pues, el tiempo? Si nadie me lo pregunta, lo sé; si quiero explicarlo, lo ignoro.",
      en: "What then is time? If no one asks me, I know; if I wish to explain it, I know not.",
    },
  },
  {
    author: "Séneca",
    theme: "tiempo",
    text: {
      es: "No es que tengamos poco tiempo: es que perdemos mucho.",
      en: "It is not that we have too little time, but that we lose so much of it.",
    },
  },
  {
    author: "Jorge Luis Borges",
    theme: "tiempo",
    text: {
      es: "El tiempo es la sustancia de que estoy hecho.",
      en: "Time is the substance I am made of.",
    },
  },
  {
    author: "Heráclito",
    theme: "tiempo",
    text: {
      es: "Nadie se baña dos veces en el mismo río.",
      en: "No one bathes twice in the same river.",
    },
  },

  // ── Libertad ─────────────────────────────────────────────────────
  {
    author: "Baruch Spinoza",
    theme: "libertad",
    text: {
      es: "El hombre libre en nada piensa menos que en la muerte; su sabiduría es meditación de la vida.",
      en: "A free man thinks of nothing less than death; his wisdom is a meditation upon life.",
    },
  },
  {
    author: "Jean-Jacques Rousseau",
    theme: "libertad",
    text: {
      es: "El hombre nace libre, y en todas partes está encadenado.",
      en: "Man is born free, and everywhere he is in chains.",
    },
  },
  {
    author: "Fiódor Dostoievski",
    theme: "libertad",
    text: {
      es: "Nada hay más insoportable para el hombre que la libertad de elegir.",
      en: "Nothing is more unbearable for man than the freedom to choose.",
    },
  },
  {
    author: "Karl Marx",
    theme: "libertad",
    text: {
      es: "Los hombres hacen su historia, pero no la hacen en circunstancias elegidas por ellos.",
      en: "Men make their own history, but not under circumstances of their own choosing.",
    },
  },

  // ── Sufrimiento ──────────────────────────────────────────────────
  {
    author: "Arthur Schopenhauer",
    theme: "sufrimiento",
    text: {
      es: "La vida oscila como un péndulo entre el dolor y el hastío.",
      en: "Life swings like a pendulum between pain and boredom.",
    },
  },
  {
    author: "Friedrich Nietzsche",
    theme: "sufrimiento",
    text: {
      es: "Quien tiene un porqué para vivir puede soportar casi cualquier cómo.",
      en: "He who has a why to live can bear almost any how.",
    },
  },
  {
    author: "Søren Kierkegaard",
    theme: "sufrimiento",
    text: {
      es: "La angustia es el vértigo de la libertad.",
      en: "Anxiety is the dizziness of freedom.",
    },
  },
  {
    author: "Franz Kafka",
    theme: "sufrimiento",
    text: {
      es: "Un libro debe ser el hacha que rompa el mar helado dentro de nosotros.",
      en: "A book must be the axe for the frozen sea within us.",
    },
  },

  // ── Sabiduría ────────────────────────────────────────────────────
  {
    author: "Sócrates",
    theme: "sabiduria",
    text: {
      es: "Sólo sé que no sé nada.",
      en: "I know only that I know nothing.",
    },
  },
  {
    author: "Max Pohlenz",
    theme: "sabiduria",
    text: {
      es: "El estoico no huye del mundo: aprende a habitarlo con la razón erguida.",
      en: "The Stoic does not flee the world: he learns to inhabit it with upright reason.",
    },
  },
  {
    author: "Tomás de Aquino",
    theme: "sabiduria",
    text: {
      es: "Nada hay en el entendimiento que no haya estado antes en los sentidos.",
      en: "There is nothing in the intellect that was not first in the senses.",
    },
  },
  {
    author: "Michel de Montaigne",
    theme: "sabiduria",
    text: {
      es: "El mayor bien del mundo es saber ser uno mismo.",
      en: "The greatest thing in the world is to know how to belong to oneself.",
    },
  },
  {
    author: "Proverbio chino",
    theme: "sabiduria",
    text: {
      es: "El mejor momento para plantar un árbol fue hace veinte años; el segundo mejor es hoy.",
      en: "The best time to plant a tree was twenty years ago; the second best is today.",
    },
  },

  // ── Fe ───────────────────────────────────────────────────────────
  {
    author: "Blaise Pascal",
    theme: "fe",
    text: {
      es: "El silencio eterno de esos espacios infinitos me espanta.",
      en: "The eternal silence of these infinite spaces frightens me.",
    },
  },
  {
    author: "Søren Kierkegaard",
    theme: "fe",
    text: {
      es: "La fe comienza precisamente allí donde termina el pensar.",
      en: "Faith begins precisely where thinking leaves off.",
    },
  },
  {
    author: "Christos Yannaras",
    theme: "fe",
    text: {
      es: "La verdad no se posee: se vive como relación.",
      en: "Truth is not possessed: it is lived as relation.",
    },
  },
  {
    author: "Maimónides",
    theme: "fe",
    text: {
      es: "De Dios sabemos mejor lo que no es que lo que es.",
      en: "Of God we know better what He is not than what He is.",
    },
  },

  // ── Poder ────────────────────────────────────────────────────────
  {
    author: "Friedrich Nietzsche",
    theme: "poder",
    text: {
      es: "Quien lucha con monstruos debe cuidar de no convertirse él mismo en monstruo.",
      en: "He who fights monsters should see to it that he does not become one.",
    },
  },
  {
    author: "Jeremy Bentham",
    theme: "poder",
    text: {
      es: "La medida de lo justo es la mayor felicidad para el mayor número.",
      en: "The measure of right is the greatest happiness of the greatest number.",
    },
  },
  {
    author: "Karl Marx",
    theme: "poder",
    text: {
      es: "Las ideas dominantes de una época son las ideas de la clase dominante.",
      en: "The ruling ideas of each age are the ideas of its ruling class.",
    },
  },
  {
    author: "Nicolás Maquiavelo",
    theme: "poder",
    text: {
      es: "Los hombres olvidan antes la muerte de su padre que la pérdida de su patrimonio.",
      en: "Men sooner forget the death of their father than the loss of their patrimony.",
    },
  },

  // ── Soledad ──────────────────────────────────────────────────────
  {
    author: "Arthur Schopenhauer",
    theme: "soledad",
    text: {
      es: "La soledad es la suerte de todos los espíritus excelentes.",
      en: "Solitude is the lot of all outstanding minds.",
    },
  },
  {
    author: "Hermann Hesse",
    theme: "soledad",
    text: {
      es: "Cada hombre es más que él mismo: es también el punto único donde se cruzan los fenómenos del mundo.",
      en: "Each man is more than himself: he is also the unique point where the world's phenomena intersect.",
    },
  },
  {
    author: "Rainer Maria Rilke",
    theme: "soledad",
    text: {
      es: "Ten paciencia con todo lo no resuelto en tu corazón.",
      en: "Be patient toward all that is unsolved in your heart.",
    },
  },
  {
    author: "William James",
    theme: "soledad",
    text: {
      es: "La mayor arma contra el estrés es nuestra capacidad de elegir un pensamiento sobre otro.",
      en: "The greatest weapon against stress is our ability to choose one thought over another.",
    },
  },

  // ── Destino ──────────────────────────────────────────────────────
  {
    author: "Marco Aurelio",
    theme: "destino",
    text: {
      es: "Acepta lo que el destino teje; nada te ocurre que no seas capaz de soportar.",
      en: "Accept what fate weaves; nothing happens to you that you are unable to bear.",
    },
  },
  {
    author: "Epicteto",
    theme: "destino",
    text: {
      es: "No pretendas que las cosas ocurran como quieres; quiérelas como ocurren y vivirás en paz.",
      en: "Do not seek things to happen as you wish; wish them as they happen and you will live in peace.",
    },
  },
  {
    author: "Friedrich Nietzsche",
    theme: "destino",
    text: {
      es: "Amor fati: no querer que nada sea distinto, ni adelante, ni atrás, ni en toda la eternidad.",
      en: "Amor fati: to want nothing to be different, not forward, not backward, not in all eternity.",
    },
  },
  {
    author: "Proverbio árabe",
    theme: "destino",
    text: {
      es: "Confía en Dios, pero ata tu camello.",
      en: "Trust in God, but tie your camel.",
    },
  },
];

export function quotesForTheme(theme: QuoteThemeId | null): Quote[] {
  return theme ? QUOTES.filter((q) => q.theme === theme) : QUOTES;
}

export function pickQuote(theme: QuoteThemeId | null, avoid?: Quote): Quote {
  const pool = quotesForTheme(theme);
  const candidates = pool.length > 1 && avoid ? pool.filter((q) => q !== avoid) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function quoteText(q: Quote, lang: Language): string {
  return q.text[lang];
}
