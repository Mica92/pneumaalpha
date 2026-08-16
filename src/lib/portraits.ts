import heideggerPortrait from "@/assets/heidegger-portrait.jpg.asset.json";
import schopenhauerPortrait from "@/assets/portraits/schopenhauer.jpg.asset.json";
import jamesPortrait from "@/assets/portraits/james.jpg.asset.json";
import nietzschePortrait from "@/assets/portraits/nietzsche.jpg.asset.json";
import marxPortrait from "@/assets/portraits/marx.jpg.asset.json";
import benthamPortrait from "@/assets/portraits/bentham.jpg.asset.json";
import pohlenzPortrait from "@/assets/portraits/pohlenz.jpg.asset.json";
import rationalismPortrait from "@/assets/portraits/rationalism.jpg.asset.json";
import pascalPortrait from "@/assets/portraits/pascal.jpg.asset.json";
import kierkegaardPortrait from "@/assets/portraits/kierkegaard.jpg.asset.json";
import yannarasPortrait from "@/assets/portraits/yannaras.jpg.asset.json";
import levinasPortrait from "@/assets/portraits/levinas.jpg.asset.json";
import maimonidesPortrait from "@/assets/portraits/maimonides.jpg.asset.json";
import aquinasPortrait from "@/assets/portraits/aquinas.jpg.asset.json";
import eckhartPortrait from "@/assets/portraits/eckhart.jpg";
import kantPortrait from "@/assets/portraits/kant.jpg";
import hegelPortrait from "@/assets/portraits/hegel.jpg";
import spenglerPortrait from "@/assets/portraits/spengler.jpg";
import jungerPortrait from "@/assets/portraits/junger.jpg";
import type { PhilosopherId } from "@/lib/philosophers";
import type { LocalizedString } from "@/lib/philosophers";

/** Cinematic archival portraits, keyed by philosopher id. */
export const PORTRAITS: Partial<Record<PhilosopherId, string>> = {
  heidegger: heideggerPortrait.url,
  schopenhauer: schopenhauerPortrait.url,
  james: jamesPortrait.url,
  nietzsche: nietzschePortrait.url,
  marx: marxPortrait.url,
  bentham: benthamPortrait.url,
  pohlenz: pohlenzPortrait.url,
  rationalism: rationalismPortrait.url,
  pascal: pascalPortrait.url,
  kierkegaard: kierkegaardPortrait.url,
  yannaras: yannarasPortrait.url,
  levinas: levinasPortrait.url,
  maimonides: maimonidesPortrait.url,
  aquinas: aquinasPortrait.url,
  eckhart: eckhartPortrait,
  kant: kantPortrait,
  hegel: hegelPortrait,
  spengler: spenglerPortrait,
  junger: jungerPortrait,
};

export function portraitOf(id: string): string | undefined {
  return PORTRAITS[id as PhilosopherId];
}

/** Encuadre del retrato: baja el recorte donde el rostro queda muy abajo. */
const PORTRAIT_FOCUS: Partial<Record<PhilosopherId, string>> = {
  pohlenz: "object-[50%_35%]",
  schopenhauer: "object-[50%_35%]",
  rationalism: "object-[50%_28%]",
};

export function portraitFocus(id: string): string {
  return PORTRAIT_FOCUS[id as PhilosopherId] ?? "object-top";
}


export type PhilosopherProfile = {
  years: string;
  origin: LocalizedString;
  bio: LocalizedString;
  expertise: LocalizedString[];
};

/** Ficha del filósofo: datos biográficos y temas de experticia. */
export const PROFILES: Partial<Record<PhilosopherId, PhilosopherProfile>> = {
  heidegger: {
    years: "1889 – 1976",
    origin: { es: "Messkirch, Alemania", en: "Messkirch, Germany" },
    bio: {
      es: "Autor de Ser y Tiempo (1927). Reabrió la pregunta por el sentido del Ser y pensó la existencia humana como Dasein: un ente arrojado al mundo, finito, atravesado por el cuidado y la angustia. En su obra tardía interrogó la técnica como destino y el lenguaje como morada del Ser.",
      en: "Author of Being and Time (1927). He reopened the question of the meaning of Being and thought human existence as Dasein: a finite being thrown into the world, traversed by care and anxiety. His later work interrogated technology as destiny and language as the house of Being.",
    },
    expertise: [
      { es: "La pregunta por el Ser", en: "The question of Being" },
      { es: "Dasein y ser-en-el-mundo", en: "Dasein and being-in-the-world" },
      { es: "Angustia y finitud", en: "Anxiety and finitude" },
      { es: "Ser-para-la-muerte", en: "Being-toward-death" },
      { es: "La técnica (Gestell)", en: "Technology (Gestell)" },
      { es: "Lenguaje y poesía", en: "Language and poetry" },
      { es: "Aletheia: verdad como desocultamiento", en: "Aletheia: truth as unconcealment" },
      { es: "Habitar, morada y arraigo", en: "Dwelling and rootedness" },
    ],
  },

  schopenhauer: {
    years: "1788 – 1860",
    origin: { es: "Danzig, Prusia", en: "Danzig, Prussia" },
    bio: {
      es: "Autor de El mundo como voluntad y representación (1818). Pensó el fondo del mundo como una Voluntad ciega e insaciable que se manifiesta en todo lo vivo, y vio en el deseo la raíz del sufrimiento. Propuso el arte, la compasión y la ascesis como vías de alivio.",
      en: "Author of The World as Will and Representation (1818). He conceived the ground of the world as a blind, insatiable Will manifest in all living things, and saw desire as the root of suffering. Art, compassion and asceticism were his paths of relief.",
    },
    expertise: [
      { es: "Voluntad y representación", en: "Will and representation" },
      { es: "Pesimismo filosófico", en: "Philosophical pessimism" },
      { es: "Deseo, tedio y sufrimiento", en: "Desire, boredom and suffering" },
      { es: "Estética y música", en: "Aesthetics and music" },
      { es: "Compasión como base de la ética", en: "Compassion as the basis of ethics" },
      { es: "Ascetismo y negación de la voluntad", en: "Asceticism and denial of the will" },
      { es: "Influencia del budismo y el Vedanta", en: "Buddhist and Vedanta influence" },
    ],
  },

  james: {
    years: "1842 – 1910",
    origin: { es: "Nueva York, EE. UU.", en: "New York, USA" },
    bio: {
      es: "Padre del pragmatismo y de la psicología científica en América. Autor de Principios de psicología (1890) y Las variedades de la experiencia religiosa (1902). Midió las ideas por sus consecuencias vividas y defendió la voluntad de creer frente a la duda paralizante.",
      en: "Father of pragmatism and of scientific psychology in America. Author of Principles of Psychology (1890) and The Varieties of Religious Experience (1902). He measured ideas by their lived consequences and defended the will to believe against paralyzing doubt.",
    },
    expertise: [
      { es: "Pragmatismo: la verdad que funciona", en: "Pragmatism: truth that works" },
      { es: "Flujo de conciencia", en: "Stream of consciousness" },
      { es: "Hábito y formación del carácter", en: "Habit and character" },
      { es: "Experiencia religiosa", en: "Religious experience" },
      { es: "Voluntad de creer", en: "The will to believe" },
      { es: "Emoción y cuerpo", en: "Emotion and the body" },
      { es: "Empirismo radical", en: "Radical empiricism" },
    ],
  },

  nietzsche: {
    years: "1844 – 1900",
    origin: { es: "Röcken, Alemania", en: "Röcken, Germany" },
    bio: {
      es: "Filólogo y filósofo del martillo. Diagnosticó la muerte de Dios y el nihilismo europeo, y opuso a la moral del resentimiento una afirmación trágica de la vida: voluntad de poder, eterno retorno, transvaloración de todos los valores.",
      en: "Philologist and philosopher with a hammer. He diagnosed the death of God and European nihilism, opposing the morality of resentment with a tragic affirmation of life: will to power, eternal return, revaluation of all values.",
    },
    expertise: [
      { es: "Muerte de Dios y nihilismo", en: "Death of God and nihilism" },
      { es: "Genealogía de la moral", en: "Genealogy of morals" },
      { es: "Voluntad de poder", en: "Will to power" },
      { es: "Eterno retorno", en: "Eternal recurrence" },
      { es: "Apolíneo y dionisíaco", en: "Apollonian and Dionysian" },
      { es: "Amor fati y afirmación", en: "Amor fati and affirmation" },
      { es: "Crítica de la cultura moderna", en: "Critique of modern culture" },
    ],
  },

  marx: {
    years: "1818 – 1883",
    origin: { es: "Tréveris, Alemania", en: "Trier, Germany" },
    bio: {
      es: "Autor de El Capital y coautor del Manifiesto Comunista. Analizó la sociedad desde las condiciones materiales de producción: el trabajo, la mercancía, la plusvalía y la alienación. Su método busca las relaciones de poder que se esconden bajo lo que parece natural.",
      en: "Author of Capital and co-author of the Communist Manifesto. He analyzed society from the material conditions of production: labour, commodity, surplus value and alienation. His method uncovers the power relations hidden beneath what looks natural.",
    },
    expertise: [
      { es: "Materialismo histórico", en: "Historical materialism" },
      { es: "Alienación del trabajo", en: "Alienation of labour" },
      { es: "Plusvalía y explotación", en: "Surplus value and exploitation" },
      { es: "Fetichismo de la mercancía", en: "Commodity fetishism" },
      { es: "Ideología y clase", en: "Ideology and class" },
      { es: "Crítica de la economía política", en: "Critique of political economy" },
      { es: "Praxis y transformación", en: "Praxis and transformation" },
    ],
  },

  bentham: {
    years: "1748 – 1832",
    origin: { es: "Londres, Inglaterra", en: "London, England" },
    bio: {
      es: "Fundador del utilitarismo. Sostuvo que la naturaleza puso al hombre bajo el gobierno del placer y el dolor, y que la medida de lo correcto es la mayor felicidad del mayor número. Reformador legal incansable, calculó consecuencias donde otros invocaban costumbres.",
      en: "Founder of utilitarianism. He held that nature placed humankind under the governance of pleasure and pain, and that the measure of right is the greatest happiness of the greatest number. A tireless legal reformer, he calculated consequences where others invoked custom.",
    },
    expertise: [
      { es: "Principio de utilidad", en: "Principle of utility" },
      { es: "Cálculo felicífico", en: "Felicific calculus" },
      { es: "Placer y dolor como medida", en: "Pleasure and pain as measure" },
      { es: "Reforma legal y penal", en: "Legal and penal reform" },
      { es: "Panóptico y vigilancia", en: "Panopticon and surveillance" },
      { es: "Crítica de los derechos naturales", en: "Critique of natural rights" },
      { es: "Ética de las consecuencias", en: "Ethics of consequences" },
    ],
  },

  pohlenz: {
    years: "1872 – 1962",
    origin: { es: "Hannover, Alemania", en: "Hanover, Germany" },
    bio: {
      es: "Filólogo clásico de Gotinga y autor de Die Stoa, la historia de referencia del estoicismo. Reconstruyó con rigor filológico el movimiento entero: de Zenón y Crisipo a Epicteto y Marco Aurelio, mostrando la ética estoica como una física y una lógica vividas.",
      en: "Classical philologist at Göttingen and author of Die Stoa, the reference history of Stoicism. He reconstructed the whole movement with philological rigour, from Zeno and Chrysippus to Epictetus and Marcus Aurelius, showing Stoic ethics as a lived physics and logic.",
    },
    expertise: [
      { es: "Historia del estoicismo", en: "History of Stoicism" },
      { es: "Zenón, Crisipo y la Estoa antigua", en: "Zeno, Chrysippus and the early Stoa" },
      { es: "Epicteto y Marco Aurelio", en: "Epictetus and Marcus Aurelius" },
      { es: "Lo que depende de nosotros", en: "What is up to us" },
      { es: "Logos, naturaleza y destino", en: "Logos, nature and fate" },
      { es: "Pasiones y apatheia", en: "Passions and apatheia" },
      { es: "Fuentes y filología clásica", en: "Sources and classical philology" },
    ],
  },

  rationalism: {
    years: "s. XVII – XVIII",
    origin: { es: "Europa continental", en: "Continental Europe" },
    bio: {
      es: "Voz colectiva del racionalismo moderno: Descartes, Spinoza, Leibniz y Malebranche. Confía en que la razón, ordenada geométricamente, alcanza verdades necesarias sobre Dios, la mente y la naturaleza. Duda metódica, sustancia, mónadas y necesidad se cruzan en un mismo taller de ideas claras y distintas.",
      en: "Collective voice of modern rationalism: Descartes, Spinoza, Leibniz and Malebranche. It trusts that reason, ordered geometrically, reaches necessary truths about God, mind and nature. Methodic doubt, substance, monads and necessity meet in one workshop of clear and distinct ideas.",
    },
    expertise: [
      { es: "Duda metódica y cogito", en: "Methodic doubt and the cogito" },
      { es: "Ideas claras y distintas", en: "Clear and distinct ideas" },
      { es: "Sustancia y atributos (Spinoza)", en: "Substance and attributes (Spinoza)" },
      { es: "Necesidad, libertad y afectos", en: "Necessity, freedom and affects" },
      { es: "Mónadas y armonía preestablecida", en: "Monads and pre-established harmony" },
      { es: "Ocasionalismo (Malebranche)", en: "Occasionalism (Malebranche)" },
      { es: "Dualismo mente-cuerpo", en: "Mind-body dualism" },
      { es: "Método geométrico", en: "The geometric method" },
    ],
  },

  pascal: {
    years: "1623 – 1662",
    origin: { es: "Clermont-Ferrand, Francia", en: "Clermont-Ferrand, France" },
    bio: {
      es: "Matemático, físico y autor de los Pensamientos. Midió con exactitud el vacío y la probabilidad, y con la misma exactitud la miseria y la grandeza del hombre. Distinguió el espíritu de geometría del espíritu de fineza: el corazón tiene razones que la razón no conoce.",
      en: "Mathematician, physicist and author of the Pensées. He measured the vacuum and probability with precision, and with the same precision the misery and greatness of humankind. He distinguished the geometric spirit from the spirit of finesse: the heart has reasons reason does not know.",
    },
    expertise: [
      { es: "Grandeza y miseria del hombre", en: "Greatness and misery of man" },
      { es: "Divertissement: la huida de sí", en: "Divertissement: flight from oneself" },
      { es: "La apuesta", en: "The wager" },
      { es: "Razones del corazón", en: "Reasons of the heart" },
      { es: "Espíritu de fineza y de geometría", en: "Finesse and geometry" },
      { es: "Infinito y silencio de los espacios", en: "Infinity and the silence of space" },
      { es: "Fe, gracia y jansenismo", en: "Faith, grace and Jansenism" },
    ],
  },

  kierkegaard: {
    years: "1813 – 1855",
    origin: { es: "Copenhague, Dinamarca", en: "Copenhagen, Denmark" },
    bio: {
      es: "Padre del existencialismo, escribió bajo seudónimos para obligar al lector a decidir por sí mismo. Pensó la angustia como vértigo de la libertad, la desesperación como enfermedad del yo, y la fe como salto que ningún sistema puede justificar.",
      en: "Father of existentialism, he wrote under pseudonyms to force readers to decide for themselves. He thought anxiety as the dizziness of freedom, despair as the sickness of the self, and faith as a leap no system can justify.",
    },
    expertise: [
      { es: "Angustia y libertad", en: "Anxiety and freedom" },
      { es: "Desesperación y el yo", en: "Despair and the self" },
      { es: "Estadios: estético, ético, religioso", en: "Stages: aesthetic, ethical, religious" },
      { es: "Salto de fe", en: "The leap of faith" },
      { es: "Subjetividad como verdad", en: "Subjectivity as truth" },
      { es: "Ironía socrática", en: "Socratic irony" },
      { es: "Crítica de la cristiandad", en: "Critique of Christendom" },
    ],
  },

  yannaras: {
    years: "1935 – 2024",
    origin: { es: "Atenas, Grecia", en: "Athens, Greece" },
    bio: {
      es: "Filósofo ortodoxo griego que leyó a Heidegger desde los Padres. Contrapuso a la metafísica occidental una ontología de la relación: la persona existe como éros y comunión, y la verdad se verifica en el encuentro, no en la certeza individual.",
      en: "Greek Orthodox philosopher who read Heidegger through the Church Fathers. Against Western metaphysics he set an ontology of relation: the person exists as eros and communion, and truth is verified in encounter, not in individual certainty.",
    },
    expertise: [
      { es: "Persona y relación", en: "Person and relation" },
      { es: "Éros como modo de ser", en: "Eros as a mode of being" },
      { es: "Teología apofática", en: "Apophatic theology" },
      { es: "Crítica de la religión como ideología", en: "Critique of religion as ideology" },
      { es: "Comunión frente a individualismo", en: "Communion versus individualism" },
      { es: "Ortodoxia y modernidad griega", en: "Orthodoxy and Greek modernity" },
      { es: "Nihilismo occidental", en: "Western nihilism" },
    ],
  },

  levinas: {
    years: "1906 – 1995",
    origin: { es: "Kaunas, Lituania", en: "Kaunas, Lithuania" },
    bio: {
      es: "Sobreviviente del siglo, hizo de la ética la filosofía primera. El rostro del otro me interpela antes de todo saber y me hace responsable sin haberlo elegido. Frente a la totalidad, pensó el infinito; frente al ser, la bondad.",
      en: "A survivor of his century, he made ethics first philosophy. The face of the other addresses me before all knowledge and makes me responsible without my choosing it. Against totality he thought infinity; against being, goodness.",
    },
    expertise: [
      { es: "El rostro del otro", en: "The face of the other" },
      { es: "Ética como filosofía primera", en: "Ethics as first philosophy" },
      { es: "Responsabilidad infinita", en: "Infinite responsibility" },
      { es: "Totalidad e infinito", en: "Totality and infinity" },
      { es: "Alteridad y hospitalidad", en: "Alterity and hospitality" },
      { es: "Il y a: el ser anónimo", en: "Il y a: anonymous being" },
      { es: "Judaísmo y talmud", en: "Judaism and Talmud" },
    ],
  },

  maimonides: {
    years: "1138 – 1204",
    origin: { es: "Córdoba, al-Ándalus", en: "Córdoba, al-Andalus" },
    bio: {
      es: "Médico, jurista y autor de la Guía de perplejos. Conjugó la Torá con Aristóteles para quienes no pueden renunciar ni a la fe ni a la razón. Enseñó la vía negativa: de Dios sabemos mejor lo que no es, y la perfección humana está en el entendimiento y la justicia.",
      en: "Physician, jurist and author of the Guide for the Perplexed. He joined Torah with Aristotle for those who can renounce neither faith nor reason. He taught the negative way: of God we better know what He is not, and human perfection lies in understanding and justice.",
    },
    expertise: [
      { es: "Guía de perplejos", en: "Guide for the Perplexed" },
      { es: "Teología negativa", en: "Negative theology" },
      { es: "Fe y razón (Aristóteles)", en: "Faith and reason (Aristotle)" },
      { es: "Providencia y mal", en: "Providence and evil" },
      { es: "Ley, halajá y ética del término medio", en: "Law, halakhah and the middle way" },
      { es: "Profecía e imaginación", en: "Prophecy and imagination" },
      { es: "Medicina del alma y del cuerpo", en: "Medicine of soul and body" },
    ],
  },

  aquinas: {
    years: "1225 – 1274",
    origin: { es: "Aquino, Reino de Sicilia", en: "Aquino, Kingdom of Sicily" },
    bio: {
      es: "Fraile dominico y autor de la Suma Teológica. Ordenó el pensamiento cristiano con las herramientas de Aristóteles: distinguió esencia y existencia, naturaleza y gracia, y sostuvo que la razón no destruye la fe sino que la prepara. Piensa por objeciones y respuestas.",
      en: "Dominican friar and author of the Summa Theologiae. He ordered Christian thought with Aristotle's tools: distinguishing essence and existence, nature and grace, and holding that reason does not destroy faith but prepares it. He thinks through objections and replies.",
    },
    expertise: [
      { es: "Las cinco vías", en: "The five ways" },
      { es: "Esencia y existencia (actus essendi)", en: "Essence and existence (actus essendi)" },
      { es: "Ley natural y ley eterna", en: "Natural law and eternal law" },
      { es: "Virtudes y felicidad (beatitudo)", en: "Virtues and happiness (beatitudo)" },
      { es: "Naturaleza y gracia", en: "Nature and grace" },
      { es: "Analogía del ser", en: "Analogy of being" },
      { es: "Método escolástico: objeción y respuesta", en: "Scholastic method: objection and reply" },
      { es: "Aristotelismo cristiano", en: "Christian Aristotelianism" },
    ],
  },

  eckhart: {
    years: "c. 1260 – 1328",
    origin: { es: "Turingia, Sacro Imperio", en: "Thuringia, Holy Roman Empire" },
    bio: {
      es: "Dominico, maestro en teología de París y predicador en lengua vulgar. Enseñó el desasimiento: soltar cosas, imágenes y hasta la idea de Dios para que el Verbo nazca en el fondo del alma. Vivir sin porqué, como la rosa que florece sin razón.",
      en: "Dominican, master of theology in Paris and preacher in the vernacular. He taught detachment: releasing things, images and even the idea of God so the Word may be born in the ground of the soul. To live without why, as the rose blooms without reason.",
    },
    expertise: [
      { es: "Desasimiento (Abgeschiedenheit)", en: "Detachment (Abgeschiedenheit)" },
      { es: "El fondo del alma y la chispa", en: "The ground of the soul and the spark" },
      { es: "Nacimiento de Dios en el alma", en: "The birth of God in the soul" },
      { es: "Teología negativa", en: "Negative theology" },
      { es: "Vivir sin porqué", en: "Living without why" },
      { es: "Mística renana", en: "Rhineland mysticism" },
      { es: "Acción y contemplación", en: "Action and contemplation" },
    ],
  },

  kant: {
    years: "1724 – 1804",
    origin: { es: "Königsberg, Prusia", en: "Königsberg, Prussia" },
    bio: {
      es: "Autor de las tres Críticas. Realizó el giro copernicano: los objetos se rigen por nuestras formas de conocer. Trazó los límites de la razón teórica y fundó la moral en la autonomía: obrar por deber, según máximas universalizables, tratando a la humanidad como fin.",
      en: "Author of the three Critiques. He carried out the Copernican turn: objects conform to our forms of knowing. He drew the limits of theoretical reason and founded morality on autonomy: acting from duty, on universalizable maxims, treating humanity as an end.",
    },
    expertise: [
      { es: "Crítica de la razón pura", en: "Critique of Pure Reason" },
      { es: "Fenómeno y cosa en sí", en: "Phenomenon and thing-in-itself" },
      { es: "Imperativo categórico", en: "The categorical imperative" },
      { es: "Autonomía y dignidad", en: "Autonomy and dignity" },
      { es: "Juicio estético y sublime", en: "Aesthetic judgment and the sublime" },
      { es: "Ilustración y minoría de edad", en: "Enlightenment and immaturity" },
      { es: "Paz perpetua y derecho cosmopolita", en: "Perpetual peace and cosmopolitan right" },
    ],
  },

  hegel: {
    years: "1770 – 1831",
    origin: { es: "Stuttgart, Württemberg", en: "Stuttgart, Württemberg" },
    bio: {
      es: "Autor de la Fenomenología del espíritu y la Ciencia de la lógica. Pensó lo real como proceso: cada figura de la conciencia se rompe en su propia contradicción y es superada (aufgehoben) en otra más concreta. La libertad no es un punto de partida: es un resultado histórico.",
      en: "Author of the Phenomenology of Spirit and the Science of Logic. He thought the real as process: each figure of consciousness breaks on its own contradiction and is sublated into a more concrete one. Freedom is not a starting point but a historical result.",
    },
    expertise: [
      { es: "Dialéctica y Aufhebung", en: "Dialectic and Aufhebung" },
      { es: "Amo y esclavo, reconocimiento", en: "Master and slave, recognition" },
      { es: "Fenomenología del espíritu", en: "Phenomenology of Spirit" },
      { es: "Lógica: ser, nada, devenir", en: "Logic: being, nothing, becoming" },
      { es: "Eticidad, sociedad civil y Estado", en: "Ethical life, civil society and the State" },
      { es: "Filosofía de la historia", en: "Philosophy of history" },
      { es: "Arte, religión y saber absoluto", en: "Art, religion and absolute knowing" },
    ],
  },

  spengler: {
    years: "1880 – 1936",
    origin: { es: "Blankenburg, Alemania", en: "Blankenburg, Germany" },
    bio: {
      es: "Autor de La decadencia de Occidente. Propuso una morfología comparada de las culturas: cada una es un organismo con estaciones, y la civilización es su invierno — urbe, dinero, técnica y cesarismo. Miró la historia con ojo fisonómico, no causal.",
      en: "Author of The Decline of the West. He proposed a comparative morphology of cultures: each is an organism with seasons, and civilization is its winter — city, money, technics and Caesarism. He read history physiognomically, not causally.",
    },
    expertise: [
      { es: "Morfología de las culturas", en: "Morphology of cultures" },
      { es: "Cultura y civilización", en: "Culture and civilization" },
      { es: "El alma fáustica", en: "The Faustian soul" },
      { es: "Destino frente a causalidad", en: "Destiny versus causality" },
      { es: "Dinero, urbe y cesarismo", en: "Money, the city and Caesarism" },
      { es: "El hombre y la técnica", en: "Man and technics" },
      { es: "Pesimismo histórico", en: "Historical pessimism" },
    ],
  },

  junger: {
    years: "1895 – 1998",
    origin: { es: "Heidelberg, Alemania", en: "Heidelberg, Germany" },
    bio: {
      es: "Escritor, entomólogo y testigo de un siglo. De Tempestades de acero a Sobre los acantilados de mármol y Eumeswil: describió la movilización total, la figura del Trabajador y propuso el Rebelde y el Anarca — la soberanía interior frente a un mundo administrado.",
      en: "Writer, entomologist and witness of a century. From Storm of Steel to On the Marble Cliffs and Eumeswil: he described total mobilization, the figure of the Worker, and proposed the Rebel and the Anarch — inner sovereignty against an administered world.",
    },
    expertise: [
      { es: "Movilización total y técnica", en: "Total mobilization and technics" },
      { es: "La figura del Trabajador", en: "The figure of the Worker" },
      { es: "El Rebelde y la emboscadura", en: "The Rebel and the forest passage" },
      { es: "El Anarca y la soberanía interior", en: "The Anarch and inner sovereignty" },
      { es: "Experiencia de la guerra", en: "The experience of war" },
      { es: "Mirada del naturalista", en: "The naturalist's gaze" },
      { es: "Tiempo, sueño y percepción", en: "Time, dream and perception" },
    ],
  },
};

export function profileOf(id: string): PhilosopherProfile | undefined {
  return PROFILES[id as PhilosopherId];
}
