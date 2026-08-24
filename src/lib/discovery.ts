// Capa de descubrimiento: convierte los datos existentes de filósofos en
// entradas accesibles para alguien que no sabe nada de filosofía.
// Fuente de verdad: src/lib/philosophers.ts y src/lib/portraits.ts.

import type { LocalizedString, PhilosopherId } from "@/lib/philosophers";

export type Lang = "es" | "en";

/* ── Pregunta central de cada mente ─────────────────────────────── */

export const CENTRAL_QUESTIONS: Record<PhilosopherId, LocalizedString> = {
  heidegger: {
    es: "¿Qué significa realmente vivir una vida propia?",
    en: "What does it really mean to live a life of your own?",
  },
  schopenhauer: {
    es: "¿Por qué queremos aquello que muchas veces nos hace sufrir?",
    en: "Why do we want what so often makes us suffer?",
  },
  james: {
    es: "¿Qué cambia en tu vida si una idea es verdadera?",
    en: "What changes in your life if an idea is true?",
  },
  nietzsche: {
    es: "¿Qué pasaría si dejaras de vivir según valores heredados?",
    en: "What if you stopped living by inherited values?",
  },
  marx: {
    es: "¿Cuánto de tu vida está determinado por la sociedad?",
    en: "How much of your life is decided by society?",
  },
  bentham: {
    es: "¿Y si lo correcto fuera simplemente lo que reduce más sufrimiento?",
    en: "What if the right thing is simply what reduces the most suffering?",
  },
  pohlenz: {
    es: "¿Qué depende de ti y qué no?",
    en: "What depends on you, and what does not?",
  },
  rationalism: {
    es: "¿Puede la razón sola llegar hasta el fondo de las cosas?",
    en: "Can reason alone reach the bottom of things?",
  },
  pascal: {
    es: "¿Por qué no soportamos quedarnos quietos con nosotros mismos?",
    en: "Why can't we bear to sit still with ourselves?",
  },
  kierkegaard: {
    es: "¿Estás dispuesto a elegir sin garantías?",
    en: "Are you willing to choose without guarantees?",
  },
  yannaras: {
    es: "¿Existimos de verdad fuera de la relación con otro?",
    en: "Do we truly exist outside our relation to another?",
  },
  levinas: {
    es: "¿Qué te exige el rostro del otro antes de que digas nada?",
    en: "What does the face of the other demand before you say a word?",
  },
  maimonides: {
    es: "¿Se puede pensar a Dios sin convertirlo en un ídolo?",
    en: "Can we think God without turning God into an idol?",
  },
  aquinas: {
    es: "¿Pueden la fe y la razón decir lo mismo?",
    en: "Can faith and reason say the same thing?",
  },
  eckhart: {
    es: "¿Qué queda de ti cuando sueltas todo lo que crees ser?",
    en: "What remains of you when you let go of all you think you are?",
  },
  kant: {
    es: "¿Podrías querer que todos hicieran lo mismo que tú?",
    en: "Could you want everyone to do what you are doing?",
  },
  hegel: {
    es: "¿Y si la contradicción fuera el motor y no el error?",
    en: "What if contradiction were the engine and not the mistake?",
  },
  spengler: {
    es: "¿Y si nuestra época estuviera en su invierno?",
    en: "What if our era were already in its winter?",
  },
  junger: {
    es: "¿Cómo conservar la libertad interior dentro de la máquina?",
    en: "How do you keep inner freedom inside the machine?",
  },
  cioran: {
    es: "¿Y si nada tuviera sentido y eso, en el fondo, te aliviara?",
    en: "What if nothing had meaning — and that, deep down, relieved you?",
  },
  rousseau: {
    es: "¿Cuánto de lo que eres lo eres para los demás?",
    en: "How much of who you are, are you for other people?",
  },
  burke: {
    es: "Antes de cambiar algo, ¿sabes por qué ha durado tanto?",
    en: "Before changing something, do you know why it has lasted?",
  },
  emerson: {
    es: "¿Qué estás imitando que no te pertenece?",
    en: "What are you imitating that isn't yours?",
  },
  thoreau: {
    es: "¿Cuántas horas de tu vida cuesta lo que posees?",
    en: "How many hours of your life does what you own cost?",
  },
  stirner: {
    es: "Eso que crees que debes hacer, ¿quién te lo mandó?",
    en: "That thing you think you must do — who ordered it?",
  },
  bakunin: {
    es: "¿Quién manda sobre ti, y hace falta que siga mandando?",
    en: "Who rules over you, and must he keep ruling?",
  },
  arendt: {
    es: "¿Qué haces tú para sostener el mundo que compartes?",
    en: "What do you do to hold up the world you share?",
  },
  negrihardt: {
    es: "¿Quién se queda con lo que produces cuando trabajas?",
    en: "Who keeps what you produce when you work?",
  },
  rand: {
    es: "¿Estás viviendo tu vida o pidiendo permiso para vivirla?",
    en: "Are you living your life, or asking permission to live it?",
  },
  gadamer: {
    es: "¿Y si el otro tuviera razón en algo que no quieres oír?",
    en: "What if the other person were right about something you'd rather not hear?",
  },
  ibnkhaldun: {
    es: "¿Qué mantiene unido a tu grupo — y cuánto le queda?",
    en: "What holds your group together — and how long will it last?",
  },
  nishida: {
    es: "¿Qué había antes de que separaras el que mira y lo mirado?",
    en: "What was there before you split the seer from the seen?",
  },
  iqbal: {
    es: "¿Qué te haría más fuerte por dentro, no sólo más tranquilo?",
    en: "What would make you stronger inside, not merely calmer?",
  },
  eliade: {
    es: "¿Qué momentos de tu vida siguen siendo sagrados para ti?",
    en: "Which moments of your life are still sacred to you?",
  },
  evola: {
    es: "Si tu época se derrumba, ¿en qué te sostienes tú?",
    en: "If your age collapses, what do you stand on?",
  },
  jabri: {
    es: "¿Qué heredaste sin haberlo examinado nunca?",
    en: "What did you inherit and never once examine?",
  },
  quoist: {
    es: "¿A quién le estás dando tu tiempo, de verdad?",
    en: "Who are you actually giving your time to?",
  },
}  sartre: {
    es: "¿Qué excusa llevas años repitiéndote?",
    en: "What excuse have you been repeating to yourself for years?",
  },
  camus: {
    es: "Si nada tuviera sentido, ¿qué seguirías haciendo igual?",
    en: "If nothing had meaning, what would you still keep doing?",
  },
  berlin: {
    es: "¿Entre qué dos cosas buenas estás obligado a elegir?",
    en: "Which two good things are you being forced to choose between?",
  },
  bostrom: {
    es: "¿Qué llamas tú realidad, exactamente?",
    en: "What exactly do you call reality?",
  },
  krishnamurti: {
    es: "¿Puedes mirar tu miedo sin querer cambiarlo?",
    en: "Can you look at your fear without wanting to change it?",
  },
  zubiri: {
    es: "¿Qué es lo que de verdad estás sintiendo, antes de interpretarlo?",
    en: "What are you actually sensing, before you interpret it?",
  },
};

export function centralQuestion(id: PhilosopherId, lang: Lang): string {
  return CENTRAL_QUESTIONS[id][lang];
}

/* ── ¿Qué estás buscando? — seis puertas de entrada ─────────────── */

export type CategoryId = "self" | "bonds" | "world" | "living" | "reality" | "learn";

export type Category = {
  id: CategoryId;
  glyph: string;
  title: LocalizedString;
  tags: LocalizedString;
  philosophers: PhilosopherId[];
  seed: LocalizedString;
};

export const CATEGORIES: Category[] = [
  {
    id: "self",
    glyph: "◎",
    title: { es: "Entenderme", en: "Understand myself" },
    tags: {
      es: "Identidad · sentido · existencia · libertad",
      en: "Identity · meaning · existence · freedom",
    },
    philosophers: ["heidegger", "kierkegaard", "nietzsche", "pascal", "james"],
    seed: {
      es: "Quiero entender quién soy y qué estoy haciendo con mi vida.",
      en: "I want to understand who I am and what I'm doing with my life.",
    },
  },
  {
    id: "bonds",
    glyph: "❥",
    title: { es: "Relaciones", en: "Relationships" },
    tags: { es: "Amor · deseo · amistad · soledad", en: "Love · desire · friendship · solitude" },
    philosophers: ["levinas", "schopenhauer", "yannaras", "kierkegaard", "eckhart"],
    seed: {
      es: "Quiero pensar mis vínculos: el amor, el deseo y la soledad.",
      en: "I want to think through my bonds: love, desire and solitude.",
    },
  },
  {
    id: "world",
    glyph: "⚔",
    title: { es: "Cuestionar el mundo", en: "Question the world" },
    tags: { es: "Política · poder · sociedad · justicia", en: "Politics · power · society · justice" },
    philosophers: ["marx", "hegel", "bentham", "spengler", "junger"],
    seed: {
      es: "Quiero entender el poder, la sociedad y qué sería justo.",
      en: "I want to understand power, society and what would be just.",
    },
  },
  {
    id: "living",
    glyph: "❖",
    title: { es: "Vivir mejor", en: "Live better" },
    tags: { es: "Felicidad · virtud · disciplina · propósito", en: "Happiness · virtue · discipline · purpose" },
    philosophers: ["pohlenz", "bentham", "james", "aquinas", "eckhart"],
    seed: {
      es: "Quiero aprender a vivir mejor, con más calma y más sentido.",
      en: "I want to learn to live better, with more calm and more meaning.",
    },
  },
  {
    id: "reality",
    glyph: "◈",
    title: { es: "Entender la realidad", en: "Understand reality" },
    tags: { es: "Dios · verdad · conocimiento · conciencia", en: "God · truth · knowledge · consciousness" },
    philosophers: ["kant", "rationalism", "aquinas", "maimonides", "hegel"],
    seed: {
      es: "Quiero entender qué es real y hasta dónde podemos conocer.",
      en: "I want to understand what is real and how far we can know.",
    },
  },
  {
    id: "learn",
    glyph: "❍",
    title: { es: "Aprender filosofía", en: "Learn philosophy" },
    tags: { es: "Autores · conceptos · escuelas · historia", en: "Authors · concepts · schools · history" },
    philosophers: ["kant", "hegel", "rationalism", "heidegger", "nietzsche"],
    seed: {
      es: "Explícame tus ideas centrales como si nunca hubiera leído filosofía.",
      en: "Explain your central ideas as if I had never read philosophy.",
    },
  },
];

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/* ── Filosofía para problemas reales ────────────────────────────── */

export type RealProblem = {
  id: string;
  text: LocalizedString;
  philosophers: PhilosopherId[];
};

export const REAL_PROBLEMS: RealProblem[] = [
  {
    id: "lost",
    text: { es: "No sé qué hacer con mi vida.", en: "I don't know what to do with my life." },
    philosophers: ["heidegger", "nietzsche", "kierkegaard"],
  },
  {
    id: "fear",
    text: { es: "Tengo miedo de fracasar.", en: "I'm afraid of failing." },
    philosophers: ["nietzsche", "pohlenz", "kierkegaard"],
  },
  {
    id: "someone",
    text: { es: "No puedo dejar de pensar en alguien.", en: "I can't stop thinking about someone." },
    philosophers: ["schopenhauer", "levinas", "kierkegaard"],
  },
  {
    id: "work",
    text: { es: "No encuentro sentido a mi trabajo.", en: "My work feels meaningless." },
    philosophers: ["marx", "heidegger", "junger"],
  },
  {
    id: "better",
    text: { es: "Quiero aprender a vivir mejor.", en: "I want to learn to live better." },
    philosophers: ["pohlenz", "bentham", "eckhart"],
  },
  {
    id: "alone",
    text: { es: "Me siento solo, incluso rodeado de gente.", en: "I feel alone, even around people." },
    philosophers: ["pascal", "yannaras", "levinas"],
  },
];

/* ── Grandes ideas ───────────────────────────────────────────────── */

export type Idea = {
  id: string;
  title: LocalizedString;
  short: LocalizedString;
  explanation: LocalizedString;
  philosophers: PhilosopherId[];
  questions: LocalizedString[];
};

export const IDEAS: Idea[] = [
  {
    id: "existencia",
    title: { es: "Existencia", en: "Existence" },
    short: { es: "Estar aquí, sin haberlo pedido.", en: "Being here, without having asked." },
    explanation: {
      es: "Nadie eligió nacer, ni su época, ni su cuerpo, ni su familia. La filosofía de la existencia parte de ese hecho: estamos arrojados a una vida que igual tenemos que hacer nuestra. Pensar la existencia es preguntarse qué haces con lo que no elegiste.",
      en: "Nobody chose to be born, nor their era, body or family. Philosophy of existence starts there: we are thrown into a life we still have to make our own. To think existence is to ask what you do with what you did not choose.",
    },
    philosophers: ["heidegger", "kierkegaard", "pascal", "nietzsche"],
    questions: [
      { es: "¿Qué parte de mi vida siento que no elegí?", en: "What part of my life feels unchosen?" },
      { es: "¿Vivo como yo o como se espera de mí?", en: "Do I live as myself or as expected?" },
      { es: "¿Qué haría distinto si supiera que el tiempo es corto?", en: "What would I change if I knew time was short?" },
    ],
  },
  {
    id: "voluntad",
    title: { es: "Voluntad", en: "Will" },
    short: { es: "La fuerza que quiere en nosotros.", en: "The force that wants in us." },
    explanation: {
      es: "Antes de razonar, ya queremos. Hay un impulso que nos empuja a desear, competir, buscar, poseer. Unos lo vieron como la raíz del sufrimiento; otros, como la energía que crea valores y formas de vida.",
      en: "Before we reason, we already want. An impulse pushes us to desire, compete, seek, possess. Some saw it as the root of suffering; others as the energy that creates values and ways of life.",
    },
    philosophers: ["schopenhauer", "nietzsche", "junger"],
    questions: [
      { es: "¿Deseo esto o me enseñaron a desearlo?", en: "Do I want this, or was I taught to want it?" },
      { es: "¿Qué pasa cuando por fin consigo lo que quería?", en: "What happens when I finally get what I wanted?" },
      { es: "¿Puedo querer sin sufrir?", en: "Can I want without suffering?" },
    ],
  },
  {
    id: "libertad",
    title: { es: "Libertad", en: "Freedom" },
    short: { es: "¿Elegimos o solo creemos elegir?", en: "Do we choose, or only believe we do?" },
    explanation: {
      es: "Sentimos que decidimos, pero casi todo nos precede: la lengua, la clase, la época, los hábitos. La pregunta filosófica no es solo si somos libres, sino qué tipo de libertad merece ese nombre.",
      en: "We feel we decide, yet almost everything precedes us: language, class, era, habit. The philosophical question isn't only whether we are free, but which kind of freedom deserves the name.",
    },
    philosophers: ["kant", "rationalism", "hegel", "kierkegaard"],
    questions: [
      { es: "¿Cuándo fue la última vez que elegí de verdad?", en: "When did I last truly choose?" },
      { es: "¿La libertad es hacer lo que quiero o poder no hacerlo?", en: "Is freedom doing what I want, or being able not to?" },
      { es: "¿Puedo ser libre dentro de una rutina?", en: "Can I be free inside a routine?" },
    ],
  },
  {
    id: "poder",
    title: { es: "Poder", en: "Power" },
    short: { es: "Quién decide lo que parece normal.", en: "Who decides what looks normal." },
    explanation: {
      es: "El poder no es solo el que manda: es lo que hace que ciertas cosas parezcan naturales, inevitables o justas. Pensar el poder es mirar quién gana con que las cosas sean como son.",
      en: "Power isn't only who commands: it is what makes certain things look natural, inevitable or fair. To think power is to see who benefits from things being as they are.",
    },
    philosophers: ["marx", "nietzsche", "hegel", "spengler"],
    questions: [
      { es: "¿Quién se beneficia de que yo piense así?", en: "Who benefits from me thinking this way?" },
      { es: "¿Cuánto de mi tiempo me pertenece?", en: "How much of my time belongs to me?" },
      { es: "¿Qué es hoy inevitable y hace un siglo no existía?", en: "What is inevitable today and did not exist a century ago?" },
    ],
  },
  {
    id: "virtud",
    title: { es: "Virtud", en: "Virtue" },
    short: { es: "El carácter como oficio diario.", en: "Character as a daily craft." },
    explanation: {
      es: "La virtud no es ser bueno de nacimiento, sino entrenar una forma de reaccionar: con calma, con medida, con coraje. Es la idea de que vivir bien se aprende, como se aprende un oficio.",
      en: "Virtue is not being born good, but training a way of reacting: with calm, measure, courage. The idea is that living well is learned, like a craft.",
    },
    philosophers: ["pohlenz", "aquinas", "bentham", "kant"],
    questions: [
      { es: "¿Qué hábito me está formando sin que lo note?", en: "Which habit is shaping me without my noticing?" },
      { es: "¿Qué depende de mí en esto que me angustia?", en: "What depends on me in what worries me?" },
      { es: "¿Cómo distingo lo correcto de lo cómodo?", en: "How do I tell right from comfortable?" },
    ],
  },
  {
    id: "sentido",
    title: { es: "Sentido", en: "Meaning" },
    short: { es: "Por qué seguimos, aun sin razones.", en: "Why we go on, even without reasons." },
    explanation: {
      es: "El sentido no siempre se encuentra: a veces se construye, se hereda o se pierde. Preguntar por el sentido es preguntar qué sostiene tu vida cuando nada te obliga a seguir.",
      en: "Meaning isn't always found: sometimes it is built, inherited or lost. To ask about meaning is to ask what holds your life up when nothing forces you to go on.",
    },
    philosophers: ["heidegger", "nietzsche", "pascal", "eckhart"],
    questions: [
      { es: "¿Qué me sostiene cuando todo se vuelve gris?", en: "What holds me up when everything turns grey?" },
      { es: "¿Necesito una razón última para vivir?", en: "Do I need an ultimate reason to live?" },
      { es: "¿Dónde siento que el tiempo no se pierde?", en: "Where do I feel time is not wasted?" },
    ],
  },
  {
    id: "dios",
    title: { es: "Dios", en: "God" },
    short: { es: "Lo que excede toda explicación.", en: "What exceeds every explanation." },
    explanation: {
      es: "Creas o no, la pregunta por Dios atraviesa la historia del pensamiento: es la pregunta por un fundamento, por lo absoluto, por aquello que no depende de nosotros. También por el silencio cuando no responde.",
      en: "Believer or not, the question of God runs through the history of thought: the question of a ground, of the absolute, of what does not depend on us — and of the silence when it does not answer.",
    },
    philosophers: ["aquinas", "maimonides", "eckhart", "pascal", "yannaras"],
    questions: [
      { es: "¿Puedo pensar lo absoluto sin reducirlo?", en: "Can I think the absolute without reducing it?" },
      { es: "¿Qué haría con una certeza así?", en: "What would I do with such a certainty?" },
      { es: "¿La fe es un salto o una conclusión?", en: "Is faith a leap or a conclusion?" },
    ],
  },
  {
    id: "otro",
    title: { es: "El otro", en: "The other" },
    short: { es: "Alguien que no puedo reducir a mí.", en: "Someone I cannot reduce to myself." },
    explanation: {
      es: "Toda ética empieza cuando aparece alguien que no soy yo y que no puedo controlar ni explicar del todo. La relación con el otro no es un añadido a la vida: para algunos pensadores, es su origen.",
      en: "All ethics begins when someone appears who is not me and whom I cannot fully control or explain. Relation to the other is not an addition to life: for some thinkers, it is its origin.",
    },
    philosophers: ["levinas", "yannaras", "hegel", "schopenhauer"],
    questions: [
      { es: "¿Escucho o espero mi turno para hablar?", en: "Do I listen, or wait for my turn to speak?" },
      { es: "¿Qué debo a quien no elegí?", en: "What do I owe someone I did not choose?" },
      { es: "¿Puedo amar sin querer poseer?", en: "Can I love without wanting to possess?" },
    ],
  },
];

export function ideaById(id: string): Idea | undefined {
  return IDEAS.find((i) => i.id === id);
}

/* ── Rutas filosóficas ───────────────────────────────────────────── */

export type RouteStep = {
  philosopher: PhilosopherId;
  note: LocalizedString;
  prompt: LocalizedString;
};

export type PhilosophyRoute = {
  id: string;
  question: LocalizedString;
  intro: LocalizedString;
  steps: RouteStep[];
};

export const ROUTES: PhilosophyRoute[] = [
  {
    id: "vivir-bien",
    question: { es: "¿Qué significa vivir bien?", en: "What does it mean to live well?" },
    intro: {
      es: "Cuatro respuestas distintas a la misma pregunta: dominar lo que depende de ti, medir el placer, probar las ideas en la vida, o inventar tus propios valores.",
      en: "Four different answers to one question: master what depends on you, measure pleasure, test ideas in life, or invent your own values.",
    },
    steps: [
      {
        philosopher: "pohlenz",
        note: { es: "El estoicismo: distinguir lo que depende de ti.", en: "Stoicism: telling apart what depends on you." },
        prompt: { es: "¿Cómo distingo lo que depende de mí de lo que no?", en: "How do I tell what depends on me from what doesn't?" },
      },
      {
        philosopher: "bentham",
        note: { es: "El cálculo: menos sufrimiento, más bienestar.", en: "The calculus: less suffering, more well-being." },
        prompt: { es: "¿Se puede medir si una vida va bien?", en: "Can we measure whether a life is going well?" },
      },
      {
        philosopher: "james",
        note: { es: "El pragmatismo: una idea vale por lo que hace.", en: "Pragmatism: an idea is worth what it does." },
        prompt: { es: "¿Cómo sé si una creencia mía me sirve?", en: "How do I know if one of my beliefs works?" },
      },
      {
        philosopher: "nietzsche",
        note: { es: "La ruptura: crear tus propios valores.", en: "The rupture: creating your own values." },
        prompt: { es: "¿Y si mis valores no fueran míos?", en: "What if my values weren't mine?" },
      },
    ],
  },
  {
    id: "sufrimiento",
    question: { es: "¿Por qué sufrimos?", en: "Why do we suffer?" },
    intro: {
      es: "Del deseo insaciable a la angustia de la libertad, cuatro modos de mirar el dolor sin anestesiarlo.",
      en: "From insatiable desire to the anxiety of freedom: four ways of looking at pain without anaesthetising it.",
    },
    steps: [
      {
        philosopher: "schopenhauer",
        note: { es: "El deseo como raíz.", en: "Desire as the root." },
        prompt: { es: "¿Por qué nunca me basta lo que consigo?", en: "Why is what I get never enough?" },
      },
      {
        philosopher: "pohlenz",
        note: { es: "El juicio que añadimos al golpe.", en: "The judgement we add to the blow." },
        prompt: { es: "¿Cuánto de mi dolor es lo que pienso sobre él?", en: "How much of my pain is what I think about it?" },
      },
      {
        philosopher: "kierkegaard",
        note: { es: "La angustia como vértigo de la libertad.", en: "Anxiety as the vertigo of freedom." },
        prompt: { es: "¿Por qué me angustia poder elegir?", en: "Why does being able to choose make me anxious?" },
      },
      {
        philosopher: "nietzsche",
        note: { es: "El dolor como material de una vida.", en: "Pain as material for a life." },
        prompt: { es: "¿Puede el sufrimiento hacerme más fuerte sin idealizarlo?", en: "Can suffering make me stronger without romanticising it?" },
      },
    ],
  },
  {
    id: "libertad",
    question: { es: "¿Somos realmente libres?", en: "Are we really free?" },
    intro: {
      es: "La razón, la ley moral, la historia y la decisión personal: cuatro pruebas para una misma sospecha.",
      en: "Reason, moral law, history and personal decision: four tests of the same suspicion.",
    },
    steps: [
      {
        philosopher: "rationalism",
        note: { es: "Libertad como comprensión de la necesidad.", en: "Freedom as understanding necessity." },
        prompt: { es: "¿Soy libre si entiendo por qué actúo así?", en: "Am I free if I understand why I act this way?" },
      },
      {
        philosopher: "kant",
        note: { es: "Autonomía: darse a sí mismo la ley.", en: "Autonomy: giving yourself the law." },
        prompt: { es: "¿Qué diferencia hay entre querer y deber?", en: "What's the difference between wanting and ought?" },
      },
      {
        philosopher: "hegel",
        note: { es: "Libertad conquistada en la historia.", en: "Freedom won within history." },
        prompt: { es: "¿Se puede ser libre solo, sin los demás?", en: "Can one be free alone, without others?" },
      },
      {
        philosopher: "kierkegaard",
        note: { es: "Elegirse a sí mismo sin garantías.", en: "Choosing yourself without guarantees." },
        prompt: { es: "¿Qué decisión estoy evitando tomar?", en: "Which decision am I avoiding?" },
      },
    ],
  },
  {
    id: "amor",
    question: { es: "¿Qué es el amor?", en: "What is love?" },
    intro: {
      es: "Deseo, entrega, responsabilidad y desprendimiento: cuatro caras de la misma palabra gastada.",
      en: "Desire, commitment, responsibility and detachment: four faces of the same worn word.",
    },
    steps: [
      {
        philosopher: "schopenhauer",
        note: { es: "El amor como astucia del deseo.", en: "Love as the cunning of desire." },
        prompt: { es: "¿Amo a esta persona o a lo que me provoca?", en: "Do I love this person or what they stir in me?" },
      },
      {
        philosopher: "kierkegaard",
        note: { es: "Amar como decisión repetida.", en: "Loving as a repeated decision." },
        prompt: { es: "¿Se puede prometer un sentimiento?", en: "Can a feeling be promised?" },
      },
      {
        philosopher: "levinas",
        note: { es: "El otro como responsabilidad.", en: "The other as responsibility." },
        prompt: { es: "¿Qué me exige alguien solo por estar ahí?", en: "What does someone demand of me just by being there?" },
      },
      {
        philosopher: "eckhart",
        note: { es: "Amar sin querer poseer.", en: "Loving without wanting to possess." },
        prompt: { es: "¿Puedo soltar sin dejar de querer?", en: "Can I let go without ceasing to love?" },
      },
    ],
  },
  {
    id: "justicia",
    question: { es: "¿Qué es una sociedad justa?", en: "What is a just society?" },
    intro: {
      es: "Del cálculo del bienestar a la crítica del trabajo y al diagnóstico de las civilizaciones.",
      en: "From the calculus of well-being to the critique of labour and the diagnosis of civilisations.",
    },
    steps: [
      {
        philosopher: "bentham",
        note: { es: "La mayor felicidad para el mayor número.", en: "The greatest happiness for the greatest number." },
        prompt: { es: "¿Se puede legislar el bienestar?", en: "Can well-being be legislated?" },
      },
      {
        philosopher: "kant",
        note: { es: "La dignidad como límite.", en: "Dignity as a limit." },
        prompt: { es: "¿Hay cosas que nunca deberían negociarse?", en: "Are there things that should never be negotiable?" },
      },
      {
        philosopher: "hegel",
        note: { es: "Las instituciones como libertad realizada.", en: "Institutions as realised freedom." },
        prompt: { es: "¿Necesito al Estado para ser libre?", en: "Do I need the State to be free?" },
      },
      {
        philosopher: "marx",
        note: { es: "Quién produce y quién decide.", en: "Who produces and who decides." },
        prompt: { es: "¿Por qué mi trabajo se siente ajeno?", en: "Why does my work feel alien to me?" },
      },
    ],
  },
];

export function routeById(id: string): PhilosophyRoute | undefined {
  return ROUTES.find((r) => r.id === id);
}

/* ── Modos de conversación ──────────────────────────────────────── */

export type ConversationMode = "dialogue" | "teacher" | "debate" | "mirror" | "provoke";

export const MODES: {
  id: ConversationMode;
  glyph: string;
  title: LocalizedString;
  hint: LocalizedString;
}[] = [
  {
    id: "dialogue",
    glyph: "◇",
    title: { es: "Conversación", en: "Conversation" },
    hint: { es: "Habla naturalmente con el filósofo.", en: "Talk naturally with the philosopher." },
  },
  {
    id: "teacher",
    glyph: "❍",
    title: { es: "Profesor", en: "Teacher" },
    hint: { es: "Aprende sus ideas de forma sencilla.", en: "Learn their ideas in plain language." },
  },
  {
    id: "debate",
    glyph: "⚔",
    title: { es: "Debate", en: "Debate" },
    hint: { es: "Deja que cuestione tus argumentos.", en: "Let them challenge your arguments." },
  },
  {
    id: "mirror",
    glyph: "◎",
    title: { es: "Reflexión", en: "Reflection" },
    hint: { es: "Usa sus ideas para mirar tu propia vida.", en: "Use their ideas to look at your own life." },
  },
  {
    id: "provoke",
    glyph: "✦",
    title: { es: "Provocación", en: "Provocation" },
    hint: { es: "Quiero que desafíe mis ideas.", en: "I want my ideas challenged." },
  },
];

/** Directiva breve añadida al mensaje del usuario según el modo elegido. */
export const MODE_DIRECTIVE: Record<ConversationMode, LocalizedString> = {
  dialogue: { es: "", en: "" },
  teacher: {
    es: "(Modo profesor: explícamelo de forma sencilla, sin jerga, con un ejemplo cotidiano.)",
    en: "(Teacher mode: explain it simply, no jargon, with an everyday example.)",
  },
  debate: {
    es: "(Modo debate: cuestiona mis argumentos y señala sus puntos débiles.)",
    en: "(Debate mode: challenge my arguments and point out their weak spots.)",
  },
  mirror: {
    es: "(Modo reflexión: usa tus ideas para ayudarme a mirar mi propia situación.)",
    en: "(Reflection mode: use your ideas to help me look at my own situation.)",
  },
  provoke: {
    es: "(Modo provocación: sé incómodo, desafía mis certezas sin insultarme.)",
    en: "(Provocation mode: be uncomfortable, challenge my certainties without insulting me.)",
  },
};

/* ── Sugerencias contextuales dentro del chat ───────────────────── */

export const CHAT_ACTIONS: LocalizedString[] = [
  { es: "¿Qué quieres decir?", en: "What do you mean?" },
  { es: "Dame un ejemplo.", en: "Give me an example." },
  { es: "Cuestiona mi posición.", en: "Challenge my position." },
  { es: "Explícamelo de manera sencilla.", en: "Explain it simply." },
  { es: "¿Y esto qué tiene que ver con mi vida?", en: "What does this have to do with my life?" },
];
