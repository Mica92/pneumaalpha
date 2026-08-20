export type LocalizedString = { es: string; en: string };

export type PodcastBook = {
  id: string;
  title: LocalizedString;
  author: string;
  year: number;
  glyph: string;
  blurb: LocalizedString;
  themes: LocalizedString[];
  /** Philosopher ids from src/lib/philosophers.ts that resonate with the work. */
  voices: string[];
};

/** Ten classics with the greatest philosophical yield. */
export const PODCAST_BOOKS: PodcastBook[] = [
  {
    id: "steppenwolf",
    title: { es: "El lobo estepario", en: "Steppenwolf" },
    author: "Hermann Hesse",
    year: 1927,
    glyph: "✦",
    blurb: {
      es: "Un hombre partido en dos —burgués y bestia— busca en el teatro mágico una forma de vivir con su propia multiplicidad.",
      en: "A man split in two —bourgeois and beast— searches the magic theatre for a way to live with his own multiplicity.",
    },
    themes: [
      { es: "Identidad múltiple", en: "Multiple identity" },
      { es: "Nihilismo burgués", en: "Bourgeois nihilism" },
      { es: "Individuación", en: "Individuation" },
    ],
    voices: ["nietzsche", "schopenhauer", "kierkegaard"],
  },
  {
    id: "brothers-karamazov",
    title: { es: "Los hermanos Karamázov", en: "The Brothers Karamazov" },
    author: "Fiódor Dostoyevski",
    year: 1880,
    glyph: "✟",
    blurb: {
      es: "Parricidio, fe y libertad: si Dios no existe, ¿todo está permitido? El Gran Inquisidor como juicio a la humanidad.",
      en: "Parricide, faith and freedom: if God does not exist, is everything permitted? The Grand Inquisitor as a trial of humanity.",
    },
    themes: [
      { es: "Teodicea", en: "Theodicy" },
      { es: "Libertad y culpa", en: "Freedom and guilt" },
      { es: "Fe frente a razón", en: "Faith versus reason" },
    ],
    voices: ["kierkegaard", "yannaras", "levinas"],
  },
  {
    id: "the-trial",
    title: { es: "El proceso", en: "The Trial" },
    author: "Franz Kafka",
    year: 1925,
    glyph: "⚖",
    blurb: {
      es: "Un acusado sin acusación: la ley se vuelve un aparato mudo y el sentido se disuelve en el procedimiento.",
      en: "An accused without an accusation: the law becomes a mute apparatus and meaning dissolves into procedure.",
    },
    themes: [
      { es: "Burocracia y poder", en: "Bureaucracy and power" },
      { es: "Culpa sin ley", en: "Guilt without law" },
      { es: "Absurdo", en: "Absurdity" },
    ],
    voices: ["heidegger", "levinas", "bentham"],
  },
  {
    id: "moby-dick",
    title: { es: "Moby Dick", en: "Moby-Dick" },
    author: "Herman Melville",
    year: 1851,
    glyph: "☤",
    blurb: {
      es: "La ballena blanca como pantalla del sentido: obsesión, voluntad y el silencio de una naturaleza que no responde.",
      en: "The white whale as a screen for meaning: obsession, will and the silence of a nature that does not answer.",
    },
    themes: [
      { es: "Voluntad y obsesión", en: "Will and obsession" },
      { es: "Sublime y naturaleza", en: "The sublime and nature" },
      { es: "Símbolo vacío", en: "Empty symbol" },
    ],
    voices: ["schopenhauer", "nietzsche", "spengler"],
  },
  {
    id: "don-quixote",
    title: { es: "Don Quijote de la Mancha", en: "Don Quixote" },
    author: "Miguel de Cervantes",
    year: 1605,
    glyph: "◈",
    blurb: {
      es: "El primer moderno: un hombre que decide que la realidad se ajuste a su relato, y paga el precio de la lucidez final.",
      en: "The first modern: a man who decides reality must fit his story, and pays the price of final lucidity.",
    },
    themes: [
      { es: "Realidad y ficción", en: "Reality and fiction" },
      { es: "Idealismo práctico", en: "Practical idealism" },
      { es: "Locura y verdad", en: "Madness and truth" },
    ],
    voices: ["rationalism", "pascal", "james"],
  },
  {
    id: "crime-and-punishment",
    title: { es: "Crimen y castigo", en: "Crime and Punishment" },
    author: "Fiódor Dostoyevski",
    year: 1866,
    glyph: "⚒",
    blurb: {
      es: "El hombre extraordinario que se autoriza a matar: utilitarismo llevado al límite y el retorno físico de la conciencia.",
      en: "The extraordinary man who authorizes himself to kill: utilitarianism pushed to the limit and the bodily return of conscience.",
    },
    themes: [
      { es: "Utilitarismo", en: "Utilitarianism" },
      { es: "Conciencia moral", en: "Moral conscience" },
      { es: "Redención", en: "Redemption" },
    ],
    voices: ["bentham", "nietzsche", "kierkegaard"],
  },
  {
    id: "the-stranger",
    title: { es: "El extranjero", en: "The Stranger" },
    author: "Albert Camus",
    year: 1942,
    glyph: "∴",
    blurb: {
      es: "Meursault no finge: la indiferencia del mundo se vuelve escándalo social y el absurdo se convierte en método.",
      en: "Meursault does not pretend: the world's indifference becomes a social scandal and the absurd becomes a method.",
    },
    themes: [
      { es: "Absurdo", en: "The absurd" },
      { es: "Autenticidad", en: "Authenticity" },
      { es: "Muerte y sentido", en: "Death and meaning" },
    ],
    voices: ["heidegger", "nietzsche", "pohlenz"],
  },
  {
    id: "the-magic-mountain",
    title: { es: "La montaña mágica", en: "The Magic Mountain" },
    author: "Thomas Mann",
    year: 1924,
    glyph: "❋",
    blurb: {
      es: "Un sanatorio suspendido en el tiempo donde Europa discute consigo misma: humanismo, autoridad, enfermedad y eros.",
      en: "A sanatorium suspended in time where Europe argues with itself: humanism, authority, illness and eros.",
    },
    themes: [
      { es: "Tiempo y duración", en: "Time and duration" },
      { es: "Ilustración vs. autoridad", en: "Enlightenment vs. authority" },
      { es: "Decadencia europea", en: "European decadence" },
    ],
    voices: ["spengler", "hegel", "kant"],
  },
  {
    id: "frankenstein",
    title: { es: "Frankenstein", en: "Frankenstein" },
    author: "Mary Shelley",
    year: 1818,
    glyph: "✶",
    blurb: {
      es: "La criatura pide razones a su creador: técnica sin responsabilidad, y el rostro del otro exigiendo reconocimiento.",
      en: "The creature demands reasons from its creator: technology without responsibility, and the face of the other demanding recognition.",
    },
    themes: [
      { es: "Técnica y responsabilidad", en: "Technology and responsibility" },
      { es: "Reconocimiento", en: "Recognition" },
      { es: "Límites de la ciencia", en: "Limits of science" },
    ],
    voices: ["levinas", "heidegger", "junger"],
  },
  {
    id: "the-death-of-ivan-ilyich",
    title: { es: "La muerte de Iván Ilich", en: "The Death of Ivan Ilyich" },
    author: "León Tolstói",
    year: 1886,
    glyph: "Ω",
    blurb: {
      es: "Una vida correcta descubierta como falsa en el umbral de la muerte: la agonía como último acto de honestidad.",
      en: "A correct life revealed as false at death's threshold: agony as a final act of honesty.",
    },
    themes: [
      { es: "Ser-para-la-muerte", en: "Being-toward-death" },
      { es: "Vida inauténtica", en: "Inauthentic life" },
      { es: "Consuelo estoico", en: "Stoic consolation" },
    ],
    voices: ["heidegger", "pohlenz", "kierkegaard"],
  },
];

export const isPodcastBookId = (id: string): boolean => PODCAST_BOOKS.some((b) => b.id === id);

export const getPodcastBook = (id: string): PodcastBook | undefined =>
  PODCAST_BOOKS.find((b) => b.id === id);
