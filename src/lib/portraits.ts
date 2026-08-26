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
import cioranPortrait from "@/assets/portraits/cioran.jpg";
import rousseauPortrait from "@/assets/portraits/rousseau.jpg";
import burkePortrait from "@/assets/portraits/burke.jpg";
import emersonPortrait from "@/assets/portraits/emerson.jpg";
import thoreauPortrait from "@/assets/portraits/thoreau.jpg";
import stirnerPortrait from "@/assets/portraits/stirner.jpg";
import bakuninPortrait from "@/assets/portraits/bakunin.jpg";
import arendtPortrait from "@/assets/portraits/arendt.jpg";
import negrihardtPortrait from "@/assets/portraits/negrihardt.jpg";
import randPortrait from "@/assets/portraits/rand.jpg";
import gadamerPortrait from "@/assets/portraits/gadamer.jpg";
import ibnkhaldunPortrait from "@/assets/portraits/ibnkhaldun.jpg";
import nishidaPortrait from "@/assets/portraits/nishida.jpg";
import iqbalPortrait from "@/assets/portraits/iqbal.jpg";
import eliadePortrait from "@/assets/portraits/eliade.jpg";
import evolaPortrait from "@/assets/portraits/evola.jpg";
import jabriPortrait from "@/assets/portraits/jabri.jpg";
import quoistPortrait from "@/assets/portraits/quoist.jpg";
import sartrePortrait from "@/assets/portraits/sartre.jpg";
import camusPortrait from "@/assets/portraits/camus.jpg";
import berlinPortrait from "@/assets/portraits/berlin.jpg";
import bostromPortrait from "@/assets/portraits/bostrom.jpg";
import krishnamurtiPortrait from "@/assets/portraits/krishnamurti.jpg";
import zubiriPortrait from "@/assets/portraits/zubiri.jpg";
import wollstonecraftPortrait from "@/assets/portraits/wollstonecraft.jpg";
import astellPortrait from "@/assets/portraits/astell.jpg";
import millPortrait from "@/assets/portraits/mill.jpg";
import weilPortrait from "@/assets/portraits/weil.jpg";
import kuschPortrait from "@/assets/portraits/kusch.jpg";
import gianniniPortrait from "@/assets/portraits/giannini.jpg";
import derridaPortrait from "@/assets/portraits/derrida.jpg";
import poretePortrait from "@/assets/portraits/porete.jpg";
import marinellaPortrait from "@/assets/portraits/marinella.jpg";
import deshoulieresPortrait from "@/assets/portraits/deshoulieres.jpg";
import sablePortrait from "@/assets/portraits/sable.jpg";
import hildebrandPortrait from "@/assets/portraits/hildebrand.jpg";
import ziemieckaPortrait from "@/assets/portraits/ziemiecka.jpg";
import steinPortrait from "@/assets/portraits/stein.jpg";
import anscombePortrait from "@/assets/portraits/anscombe.jpg";
import lipmanPortrait from "@/assets/portraits/lipman.jpg";
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
  cioran: cioranPortrait,
  rousseau: rousseauPortrait,
  burke: burkePortrait,
  emerson: emersonPortrait,
  thoreau: thoreauPortrait,
  stirner: stirnerPortrait,
  bakunin: bakuninPortrait,
  arendt: arendtPortrait,
  negrihardt: negrihardtPortrait,
  rand: randPortrait,
  gadamer: gadamerPortrait,
  ibnkhaldun: ibnkhaldunPortrait,
  nishida: nishidaPortrait,
  iqbal: iqbalPortrait,
  eliade: eliadePortrait,
  evola: evolaPortrait,
  jabri: jabriPortrait,
  quoist: quoistPortrait,
  sartre: sartrePortrait,
  camus: camusPortrait,
  berlin: berlinPortrait,
  bostrom: bostromPortrait,
  krishnamurti: krishnamurtiPortrait,
  zubiri: zubiriPortrait,
  wollstonecraft: wollstonecraftPortrait,
  astell: astellPortrait,
  mill: millPortrait,
  weil: weilPortrait,
  kusch: kuschPortrait,
  giannini: gianniniPortrait,
  derrida: derridaPortrait,
  porete: poretePortrait,
  marinella: marinellaPortrait,
  deshoulieres: deshoulieresPortrait,
  sable: sablePortrait,
  hildebrand: hildebrandPortrait,
  ziemiecka: ziemieckaPortrait,
  stein: steinPortrait,
  anscombe: anscombePortrait,
  lipman: lipmanPortrait,
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
      {
        es: "Método escolástico: objeción y respuesta",
        en: "Scholastic method: objection and reply",
      },
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

  cioran: {
    years: "1911 – 1995",
    origin: { es: "Rășinari, Rumanía", en: "Rășinari, Romania" },
    bio: {
      es: "Escribió en rumano y luego en francés desde una buhardilla parisina. Insomne crónico, hizo del fragmento y el aforismo su forma de pensar: el nacimiento como catástrofe, el fracaso como maestro, la lucidez sin consuelo — y, pese a todo, una alegría negra que le mantuvo escribiendo.",
      en: "He wrote in Romanian and then in French from a Paris attic. A chronic insomniac, he made the fragment and the aphorism his way of thinking: birth as catastrophe, failure as teacher, lucidity without consolation — and, despite it all, a black joy that kept him writing.",
    },
    expertise: [
      { es: "Pesimismo y lucidez", en: "Pessimism and lucidity" },
      { es: "El insomnio como método", en: "Insomnia as method" },
      { es: "El sinsentido y el suicidio como idea", en: "Meaninglessness and suicide as an idea" },
      { es: "Desarraigo y exilio", en: "Rootlessness and exile" },
      { es: "Mística sin Dios", en: "Mysticism without God" },
      { es: "El aforismo como forma", en: "The aphorism as form" },
    ],
  },

  rousseau: {
    years: "1712 – 1778",
    origin: { es: "Ginebra, Suiza", en: "Geneva, Switzerland" },
    bio: {
      es: "Autor del Discurso sobre la desigualdad, El contrato social, Emilio y Las confesiones. Sostuvo que el hombre nace bueno y la sociedad lo corrompe, que la desigualdad nació con la propiedad y que sólo es libre quien obedece la ley que se ha dado a sí mismo.",
      en: "Author of the Discourse on Inequality, The Social Contract, Emile and the Confessions. He held that man is born good and society corrupts him, that inequality began with property, and that only those who obey the law they give themselves are free.",
    },
    expertise: [
      { es: "Bondad natural y sociedad", en: "Natural goodness and society" },
      { es: "Origen de la desigualdad", en: "The origin of inequality" },
      { es: "Contrato social y voluntad general", en: "Social contract and general will" },
      { es: "Educación (Emilio)", en: "Education (Emile)" },
      { es: "Autenticidad frente a la máscara social", en: "Authenticity against the social mask" },
      { es: "Confesión e interioridad", en: "Confession and inwardness" },
    ],
  },

  burke: {
    years: "1729 – 1797",
    origin: { es: "Dublín, Irlanda", en: "Dublin, Ireland" },
    bio: {
      es: "Orador y parlamentario, autor de las Reflexiones sobre la Revolución en Francia. Defendió a las colonias americanas y denunció los abusos coloniales en la India, pero combatió la política deducida de abstracciones: la sociedad es un pacto entre generaciones y se reforma con prudencia.",
      en: "Orator and MP, author of the Reflections on the Revolution in France. He defended the American colonies and denounced colonial abuse in India, yet fought politics deduced from abstractions: society is a compact between generations, reformed with prudence.",
    },
    expertise: [
      { es: "Tradición y prudencia política", en: "Tradition and political prudence" },
      { es: "Reforma frente a revolución", en: "Reform against revolution" },
      { es: "Cuerpos intermedios y costumbre", en: "Intermediate bodies and custom" },
      { es: "Lo sublime y lo bello", en: "The sublime and the beautiful" },
      { es: "Rendición de cuentas del poder", en: "Accountability of power" },
    ],
  },

  emerson: {
    years: "1803 – 1882",
    origin: { es: "Boston, EE. UU.", en: "Boston, USA" },
    bio: {
      es: "Padre del trascendentalismo norteamericano. Dejó el púlpito para escribir Naturaleza, Confianza en uno mismo y Compensación: hay una relación directa entre cada alma y el universo, y la conformidad es la muerte del carácter.",
      en: "Father of American transcendentalism. He left the pulpit to write Nature, Self-Reliance and Compensation: there is a direct relation between each soul and the universe, and conformity is the death of character.",
    },
    expertise: [
      { es: "Confianza en uno mismo", en: "Self-reliance" },
      { es: "Naturaleza y espíritu", en: "Nature and spirit" },
      { es: "Intuición y Over-Soul", en: "Intuition and the Over-Soul" },
      { es: "Compensación: toda acción tiene precio", en: "Compensation: every act has its price" },
      { es: "Inconformismo y carácter", en: "Nonconformity and character" },
    ],
  },

  thoreau: {
    years: "1817 – 1862",
    origin: { es: "Concord, EE. UU.", en: "Concord, USA" },
    bio: {
      es: "Vivió dos años junto a la laguna de Walden para reducir la vida a lo esencial. Escribió Walden y Desobediencia civil, texto que inspiró a Gandhi y a King: la conciencia está por encima de la ley injusta, y el precio de una cosa es la vida que cuesta.",
      en: "He lived two years by Walden Pond to reduce life to essentials. He wrote Walden and Civil Disobedience, which inspired Gandhi and King: conscience stands above unjust law, and the price of a thing is the life it costs.",
    },
    expertise: [
      { es: "Simplicidad voluntaria", en: "Voluntary simplicity" },
      { es: "Vida deliberada y esencial", en: "Deliberate, essential living" },
      { es: "Desobediencia civil", en: "Civil disobedience" },
      { es: "Naturaleza y observación", en: "Nature and observation" },
      { es: "Economía de la vida y el tiempo", en: "The economy of life and time" },
    ],
  },

  stirner: {
    years: "1806 – 1856",
    origin: { es: "Bayreuth, Alemania", en: "Bayreuth, Germany" },
    bio: {
      es: "Autor de El único y su propiedad (1844). Llamó espectros a Dios, el Estado, la Moral y la Humanidad: ideas fijas que exigen sacrificios. Frente a ellas propuso la propiedad de sí y la asociación libre de egoístas.",
      en: "Author of The Ego and Its Own (1844). He called God, the State, Morality and Humanity spooks: fixed ideas demanding sacrifice. Against them he proposed ownness and the free union of egoists.",
    },
    expertise: [
      { es: "El Único y la propiedad de sí", en: "The Unique One and ownness" },
      { es: "Crítica de los ideales (espectros)", en: "Critique of ideals (spooks)" },
      { es: "Egoísmo consciente", en: "Conscious egoism" },
      { es: "Insurrección frente a revolución", en: "Insurrection against revolution" },
      { es: "Crítica de la moral y el deber", en: "Critique of morality and duty" },
    ],
  },

  bakunin: {
    years: "1814 – 1876",
    origin: { es: "Priamújino, Rusia", en: "Pryamukhino, Russia" },
    bio: {
      es: "Revolucionario errante y fundador del anarquismo colectivista. Preso en Rusia y deportado a Siberia, se fugó dando la vuelta al mundo. En la Internacional se opuso a Marx y anticipó que la dictadura del proletariado sería una nueva casta de burócratas.",
      en: "Wandering revolutionary and founder of collectivist anarchism. Jailed in Russia and exiled to Siberia, he escaped around the world. In the International he opposed Marx and foresaw that the dictatorship of the proletariat would become a new caste of bureaucrats.",
    },
    expertise: [
      { es: "Crítica de toda autoridad", en: "Critique of all authority" },
      { es: "Libertad e igualdad juntas", en: "Freedom and equality together" },
      { es: "Federalismo desde abajo", en: "Federalism from below" },
      { es: "Dios y el Estado", en: "God and the State" },
      { es: "Polémica con el socialismo autoritario", en: "Against authoritarian socialism" },
    ],
  },

  arendt: {
    years: "1906 – 1975",
    origin: { es: "Hannover, Alemania", en: "Hanover, Germany" },
    bio: {
      es: "Apátrida durante dieciocho años, después teórica política en Nueva York. Escribió Los orígenes del totalitarismo, La condición humana y Eichmann en Jerusalén, donde acuñó la banalidad del mal: no monstruos, sino incapacidad de pensar.",
      en: "Stateless for eighteen years, later a political theorist in New York. She wrote The Origins of Totalitarianism, The Human Condition and Eichmann in Jerusalem, coining the banality of evil: not monsters, but the inability to think.",
    },
    expertise: [
      { es: "Totalitarismo y sociedad de masas", en: "Totalitarianism and mass society" },
      { es: "Acción, natalidad y esfera pública", en: "Action, natality and the public realm" },
      { es: "La banalidad del mal", en: "The banality of evil" },
      { es: "Poder frente a violencia", en: "Power versus violence" },
      { es: "El derecho a tener derechos", en: "The right to have rights" },
      { es: "Pensar y juzgar", en: "Thinking and judging" },
    ],
  },

  negrihardt: {
    years: "1933 – 2023 · 1960 –",
    origin: { es: "Padua, Italia · Washington, EE. UU.", en: "Padua, Italy · Washington, USA" },
    bio: {
      es: "Antonio Negri, del obrerismo italiano y la cárcel, y Michael Hardt, teórico literario norteamericano, escribieron juntos Imperio, Multitud, Commonwealth y Asamblea: el poder global ya no tiene centro, y frente a él aparece la multitud que produce lo común.",
      en: "Antonio Negri, from Italian operaismo and prison, and Michael Hardt, an American literary theorist, wrote Empire, Multitude, Commonwealth and Assembly together: global power no longer has a centre, and facing it stands the multitude that produces the common.",
    },
    expertise: [
      { es: "Imperio: poder global sin centro", en: "Empire: global power without a centre" },
      { es: "Multitud y singularidades", en: "Multitude and singularities" },
      { es: "Trabajo inmaterial y afectivo", en: "Immaterial and affective labour" },
      { es: "Lo común frente a público y privado", en: "The common beyond public and private" },
      { es: "Biopolítica desde abajo", en: "Biopolitics from below" },
    ],
  },

  rand: {
    years: "1905 – 1982",
    origin: { es: "San Petersburgo, Rusia", en: "Saint Petersburg, Russia" },
    bio: {
      es: "Emigró a Estados Unidos tras la revolución bolchevique. Novelista de El manantial y La rebelión de Atlas y fundadora del objetivismo: la realidad es objetiva, la razón es el único medio de conocimiento y el interés propio racional es una virtud.",
      en: "She emigrated to the United States after the Bolshevik revolution. Novelist of The Fountainhead and Atlas Shrugged and founder of Objectivism: reality is objective, reason is the only means of knowledge, and rational self-interest is a virtue.",
    },
    expertise: [
      { es: "Objetivismo y razón", en: "Objectivism and reason" },
      { es: "Egoísmo racional", en: "Rational self-interest" },
      { es: "Productividad y creación", en: "Productiveness and creation" },
      { es: "Individuo frente a colectivo", en: "Individual versus collective" },
      { es: "Ética del capitalismo", en: "The ethics of capitalism" },
    ],
  },

  gadamer: {
    years: "1900 – 2002",
    origin: { es: "Marburgo, Alemania", en: "Marburg, Germany" },
    bio: {
      es: "Autor de Verdad y método (1960). Mostró que comprender no es aplicar un método sino el modo mismo de existir: partimos siempre de prejuicios heredados y entendemos cuando nuestro horizonte se funde con el del otro, en el diálogo.",
      en: "Author of Truth and Method (1960). He showed that understanding is not applying a method but the very way we exist: we always begin from inherited prejudices and understand when our horizon fuses with another's, in dialogue.",
    },
    expertise: [
      { es: "Hermenéutica filosófica", en: "Philosophical hermeneutics" },
      { es: "Prejuicio y tradición", en: "Prejudice and tradition" },
      { es: "Fusión de horizontes", en: "Fusion of horizons" },
      { es: "Diálogo y pregunta", en: "Dialogue and questioning" },
      { es: "Arte, juego y verdad", en: "Art, play and truth" },
    ],
  },

  ibnkhaldun: {
    years: "1332 – 1406",
    origin: { es: "Túnez", en: "Tunis" },
    bio: {
      es: "Magistrado y consejero de sultanes, escribió la Muqaddima, donde fundó una ciencia de la civilización. Su concepto de 'asabiyya —la cohesión de grupo— explica el ascenso y la caída cíclica de las dinastías en tres o cuatro generaciones.",
      en: "A judge and adviser to sultans, he wrote the Muqaddima, founding a science of civilization. His concept of 'asabiyya — group cohesion — explains the cyclical rise and fall of dynasties over three or four generations.",
    },
    expertise: [
      { es: "'Asabiyya: cohesión de grupo", en: "'Asabiyya: group cohesion" },
      { es: "Ciclos de auge y decadencia", en: "Cycles of rise and decline" },
      { es: "Ciudad y desierto", en: "City and desert" },
      { es: "Economía, oficios e impuestos", en: "Economy, crafts and taxation" },
      { es: "Método histórico y crítica de fuentes", en: "Historical method and source criticism" },
    ],
  },

  nishida: {
    years: "1870 – 1945",
    origin: { es: "Kanazawa, Japón", en: "Kanazawa, Japan" },
    bio: {
      es: "Fundador de la Escuela de Kioto y autor de Indagación sobre el bien. Practicante de zazen, partió de la experiencia pura —anterior a la división entre sujeto y objeto— y desarrolló la lógica del lugar (basho) y la nada absoluta.",
      en: "Founder of the Kyoto School and author of An Inquiry into the Good. A zazen practitioner, he began from pure experience — prior to the split of subject and object — and developed the logic of place (basho) and absolute nothingness.",
    },
    expertise: [
      { es: "Experiencia pura", en: "Pure experience" },
      { es: "Lugar (basho) y nada absoluta", en: "Place (basho) and absolute nothingness" },
      { es: "Zen y filosofía occidental", en: "Zen and Western philosophy" },
      { es: "Autoidentidad de los contradictorios", en: "Self-identity of contradictories" },
      { es: "Acción-intuición y vida cotidiana", en: "Action-intuition and daily life" },
    ],
  },

  iqbal: {
    years: "1877 – 1938",
    origin: { es: "Sialkot, Punyab", en: "Sialkot, Punjab" },
    bio: {
      es: "Poeta en persa y urdu y filósofo formado en Cambridge y Múnich. En La reconstrucción del pensamiento religioso en el islam defendió el ijtihad —volver a pensar la tradición— y en su poesía elaboró el khudi: el yo creador que se fortalece.",
      en: "A poet in Persian and Urdu and a philosopher trained in Cambridge and Munich. In The Reconstruction of Religious Thought in Islam he defended ijtihad — rethinking tradition — and in his poetry elaborated khudi: the creative self that grows strong.",
    },
    expertise: [
      { es: "Khudi: el yo creador", en: "Khudi: the creative self" },
      { es: "Amor ('ishq) como energía", en: "Love ('ishq) as energy" },
      { es: "Ijtihad y reforma del pensamiento", en: "Ijtihad and reform of thought" },
      { es: "Islam y modernidad", en: "Islam and modernity" },
      { es: "Poesía filosófica", en: "Philosophical poetry" },
    ],
  },

  eliade: {
    years: "1907 – 1986",
    origin: { es: "Bucarest, Rumanía", en: "Bucharest, Romania" },
    bio: {
      es: "Historiador de las religiones formado en la India y profesor en Chicago. Estudió cómo lo sagrado irrumpe en el mundo —la hierofanía—, el mito del eterno retorno, la iniciación y el chamanismo, y mostró los mitos escondidos en la vida moderna.",
      en: "A historian of religions trained in India and professor in Chicago. He studied how the sacred breaks into the world — hierophany — along with the myth of eternal return, initiation and shamanism, revealing the myths hidden in modern life.",
    },
    expertise: [
      { es: "Lo sagrado y lo profano", en: "The sacred and the profane" },
      { es: "Mito del eterno retorno", en: "The myth of eternal return" },
      { es: "Ritos de iniciación", en: "Rites of initiation" },
      { es: "Chamanismo y éxtasis", en: "Shamanism and ecstasy" },
      { es: "Símbolos en la vida moderna", en: "Symbols in modern life" },
    ],
  },

  evola: {
    years: "1898 – 1974",
    origin: { es: "Roma, Italia", en: "Rome, Italy" },
    bio: {
      es: "Pintor dadaísta en su juventud y después pensador tradicionalista. En Revuelta contra el mundo moderno leyó la historia como involución cíclica, y en Cabalgar el tigre propuso al hombre diferenciado: mantenerse en pie mientras el ciclo se agota.",
      en: "A Dadaist painter in his youth and later a traditionalist thinker. In Revolt Against the Modern World he read history as cyclical involution, and in Ride the Tiger he proposed the differentiated man: standing firm while the cycle exhausts itself.",
    },
    expertise: [
      { es: "Tradición y ciclos cósmicos", en: "Tradition and cosmic cycles" },
      { es: "Crítica del mundo moderno", en: "Critique of the modern world" },
      { es: "El hombre diferenciado", en: "The differentiated man" },
      { es: "Ascesis y desapego", en: "Ascesis and detachment" },
      { es: "Esoterismo, hermetismo y despertar", en: "Esotericism, hermeticism and awakening" },
    ],
  },

  jabri: {
    years: "1935 – 2010",
    origin: { es: "Figuig, Marruecos", en: "Figuig, Morocco" },
    bio: {
      es: "Filósofo marroquí, autor de la Crítica de la razón árabe. Distinguió tres sistemas de conocimiento heredados —bayan, 'irfan y burhan— y propuso recuperar el racionalismo crítico de Averroes para leer la tradición sin repetirla ni abandonarla.",
      en: "Moroccan philosopher, author of the Critique of Arab Reason. He distinguished three inherited systems of knowledge — bayan, 'irfan and burhan — and proposed recovering Averroes' critical rationalism to read tradition without repeating or abandoning it.",
    },
    expertise: [
      { es: "Crítica de la razón árabe", en: "Critique of Arab reason" },
      { es: "Bayan, 'irfan y burhan", en: "Bayan, 'irfan and burhan" },
      { es: "Averroísmo y racionalismo", en: "Averroism and rationalism" },
      { es: "Lectura crítica de la tradición", en: "Critical reading of tradition" },
      { es: "Razón política y poder", en: "Political reason and power" },
    ],
  },

  quoist: {
    years: "1921 – 1997",
    origin: { es: "Le Havre, Francia", en: "Le Havre, France" },
    bio: {
      es: "Sacerdote y sociólogo francés, autor de Oraciones, traducido a decenas de lenguas. Trabajó con jóvenes y obreros y escribió plegarias hechas de vida cotidiana: el tiempo, el trabajo, el amor y el otro como lugar del encuentro con Dios.",
      en: "French priest and sociologist, author of Prayers, translated into dozens of languages. He worked with young people and workers and wrote prayers made of daily life: time, work, love and the other as the place of encounter with God.",
    },
    expertise: [
      { es: "Oración desde lo cotidiano", en: "Prayer out of daily life" },
      { es: "Amor y entrega concreta", en: "Love as concrete self-giving" },
      { es: "El uso del tiempo", en: "The use of time" },
      { es: "Trabajo y justicia social", en: "Work and social justice" },
      { es: "Acompañamiento y escucha", en: "Accompaniment and listening" },
    ],
  },

  sartre: {
    years: "1905 – 1980",
    origin: { es: "París, Francia", en: "Paris, France" },
    bio: {
      es: "Filósofo, novelista y dramaturgo francés, figura central del existencialismo. Sostuvo que la existencia precede a la esencia: nadie nace con un destino escrito, y por eso estamos condenados a ser libres y responsables de lo que hacemos con lo que nos hicieron.",
      en: "French philosopher, novelist and playwright, the central figure of existentialism. He held that existence precedes essence: nobody is born with a written destiny, so we are condemned to be free and responsible for what we make of what was made of us.",
    },
    expertise: [
      { es: "Libertad y responsabilidad", en: "Freedom and responsibility" },
      { es: "Mala fe y autoengaño", en: "Bad faith and self-deception" },
      { es: "La mirada del otro", en: "The gaze of the other" },
      { es: "Angustia y contingencia", en: "Anguish and contingency" },
      { es: "Compromiso político y literatura", en: "Political commitment and literature" },
    ],
  },

  camus: {
    years: "1913 – 1960",
    origin: { es: "Mondovi, Argelia francesa", en: "Mondovi, French Algeria" },
    bio: {
      es: "Escritor y pensador francoargelino, Nobel de Literatura. Del choque entre nuestra sed de sentido y el silencio del mundo no dedujo el suicidio ni el nihilismo, sino la rebeldía lúcida: vivir sin consuelo y sin resignación, con el cuerpo, el sol y los otros.",
      en: "French-Algerian writer and thinker, Nobel laureate. From the clash between our thirst for meaning and the world's silence he drew neither suicide nor nihilism, but lucid revolt: living without consolation and without resignation, with the body, the sun and others.",
    },
    expertise: [
      { es: "El absurdo y Sísifo", en: "The absurd and Sisyphus" },
      { es: "La rebeldía y sus límites", en: "Revolt and its limits" },
      { es: "Decencia sin heroísmo", en: "Decency without heroism" },
      { es: "Mediterráneo, cuerpo y luz", en: "Mediterranean, body and light" },
      { es: "Crítica del terror ideológico", en: "Critique of ideological terror" },
    ],
  },

  berlin: {
    years: "1909 – 1997",
    origin: { es: "Riga, Letonia", en: "Riga, Latvia" },
    bio: {
      es: "Historiador de las ideas y filósofo político de Oxford. Defendió el pluralismo de valores: los bienes humanos son varios y a veces incompatibles, y quien promete un mundo donde todos encajan acaba justificando la coerción.",
      en: "Oxford historian of ideas and political philosopher. He defended value pluralism: human goods are many and sometimes incompatible, and whoever promises a world where all of them fit ends up justifying coercion.",
    },
    expertise: [
      { es: "Pluralismo de valores", en: "Value pluralism" },
      { es: "Libertad negativa y positiva", en: "Negative and positive liberty" },
      { es: "El erizo y el zorro", en: "The hedgehog and the fox" },
      { es: "Crítica del determinismo histórico", en: "Critique of historical determinism" },
      { es: "Contra-Ilustración y romanticismo", en: "Counter-Enlightenment and romanticism" },
    ],
  },

  bostrom: {
    years: "1797 – 1866",
    origin: { es: "Piteå, Suecia", en: "Piteå, Sweden" },
    bio: {
      es: "Profesor en Upsala y el filósofo sueco más influyente del siglo XIX. Su idealismo racional sostiene que sólo existen personas: el mundo material es la percepción confusa que un espíritu finito tiene de otros espíritus, y Dios es el sistema eterno de todos ellos.",
      en: "Professor at Uppsala and the most influential Swedish philosopher of the 19th century. His rational idealism holds that only persons exist: the material world is the confused perception a finite spirit has of other spirits, and God is their eternal system.",
    },
    expertise: [
      { es: "Idealismo racional", en: "Rational idealism" },
      { es: "Personalismo metafísico", en: "Metaphysical personalism" },
      { es: "Tiempo, espacio y percepción", en: "Time, space and perception" },
      { es: "Crítica de Hegel", en: "Critique of Hegel" },
      { es: "Filosofía del Estado y del derecho", en: "Philosophy of state and law" },
    ],
  },

  krishnamurti: {
    years: "1895 – 1986",
    origin: { es: "Madanapalle, India", en: "Madanapalle, India" },
    bio: {
      es: "Educado como futuro maestro del mundo por la Sociedad Teosófica, en 1929 disolvió la organización creada para él: la verdad es una tierra sin caminos. Habló durante sesenta años sin doctrina ni discípulos, invitando a mirar el propio condicionamiento sin autoridad alguna.",
      en: "Raised as the future world teacher by the Theosophical Society, in 1929 he dissolved the organisation built for him: truth is a pathless land. He spoke for sixty years without doctrine or disciples, inviting people to look at their own conditioning without any authority.",
    },
    expertise: [
      { es: "Atención sin elección", en: "Choiceless awareness" },
      { es: "El observador y lo observado", en: "The observer and the observed" },
      { es: "Miedo, deseo y soledad", en: "Fear, desire and loneliness" },
      { es: "Condicionamiento y autoridad", en: "Conditioning and authority" },
      { es: "Educación y libertad interior", en: "Education and inner freedom" },
    ],
  },

  zubiri: {
    years: "1898 – 1983",
    origin: { es: "San Sebastián, España", en: "San Sebastián, Spain" },
    bio: {
      es: "Filósofo español formado con Ortega, Husserl y Heidegger, y lector atento de la física y la biología de su tiempo. Propuso la inteligencia sentiente: sentir e inteligir son dos momentos de un mismo acto, y lo primero que aprehendemos es la cosa como realidad.",
      en: "Spanish philosopher trained with Ortega, Husserl and Heidegger, and a close reader of the physics and biology of his time. He proposed sentient intelligence: sensing and understanding are two moments of one act, and what we first apprehend is the thing as reality.",
    },
    expertise: [
      { es: "Inteligencia sentiente", en: "Sentient intelligence" },
      { es: "Realidad y aprehensión", en: "Reality and apprehension" },
      { es: "Esencia y sustantividad", en: "Essence and substantivity" },
      { es: "Religación y experiencia de Dios", en: "Religation and the experience of God" },
      { es: "La persona como suidad", en: "The person as suity" },
    ],
  },

  wollstonecraft: {
    years: "1759 – 1797",
    origin: { es: "Londres, Inglaterra", en: "London, England" },
    bio: {
      es: "Escritora y educadora inglesa, autora de la Vindicación de los derechos de la mujer (1792). Sostuvo que la aparente inferioridad femenina era obra de una educación diseñada para agradar, y reclamó para la mujer la condición de criatura racional. Vivió el amor, la miseria y la Revolución francesa con la misma intensidad con que escribió.",
      en: "English writer and educator, author of A Vindication of the Rights of Woman (1792). She argued that women's apparent inferiority was the product of an education designed to please, and claimed for women the status of rational creatures. She lived love, poverty and the French Revolution as intensely as she wrote.",
    },
    expertise: [
      { es: "Derechos y educación de la mujer", en: "Women's rights and education" },
      { es: "Virtud y libertad", en: "Virtue and liberty" },
      { es: "Crítica a Rousseau", en: "A critique of Rousseau" },
      { es: "Matrimonio y dependencia", en: "Marriage and dependence" },
      { es: "Razón contra sensibilidad", en: "Reason against sensibility" },
    ],
  },

  astell: {
    years: "1666 – 1731",
    origin: { es: "Newcastle / Chelsea, Inglaterra", en: "Newcastle / Chelsea, England" },
    bio: {
      es: "Primera filósofa feminista inglesa, cartesiana y anglicana. Propuso un retiro académico para mujeres donde pudieran formar el entendimiento y la amistad. Su pregunta —si todos los hombres nacen libres, ¿cómo es que todas las mujeres nacen esclavas?— sigue sin respuesta cómoda.",
      en: "The first English feminist philosopher, a Cartesian and an Anglican. She proposed an academic retreat for women where understanding and friendship could be formed. Her question — if all men are born free, how is it that all women are born slaves? — still has no comfortable answer.",
    },
    expertise: [
      { es: "Educación de las mujeres", en: "Women's education" },
      { es: "Autoconocimiento cartesiano", en: "Cartesian self-knowledge" },
      { es: "Amistad y comunidad", en: "Friendship and community" },
      { es: "Matrimonio y obediencia", en: "Marriage and obedience" },
      { es: "Fe anglicana y razón", en: "Anglican faith and reason" },
    ],
  },

  mill: {
    years: "1806 – 1873",
    origin: { es: "Londres, Inglaterra", en: "London, England" },
    bio: {
      es: "Educado por su padre en un experimento pedagógico severo, sufrió a los veinte años una crisis que le enseñó que la razón sola no basta. Formuló el principio del daño, defendió la libertad de opinión como condición de toda verdad viva y denunció la sujeción de la mujer.",
      en: "Raised by his father in a severe pedagogical experiment, at twenty he suffered a crisis that taught him reason alone is not enough. He formulated the harm principle, defended freedom of opinion as the condition of any living truth, and denounced the subjection of women.",
    },
    expertise: [
      { es: "Principio del daño", en: "The harm principle" },
      { es: "Libertad de expresión", en: "Freedom of expression" },
      { es: "Utilitarismo cualitativo", en: "Qualitative utilitarianism" },
      { es: "Tiranía de la mayoría", en: "Tyranny of the majority" },
      { es: "La sujeción de la mujer", en: "The subjection of women" },
    ],
  },

  weil: {
    years: "1909 – 1943",
    origin: { es: "París, Francia", en: "Paris, France" },
    bio: {
      es: "Filósofa y obrera, judía atraída por Cristo y ajena a toda pertenencia. Trabajó en fábrica y en el campo para pensar desde la desgracia y no sobre ella. Murió en Inglaterra a los treinta y cuatro años, negándose a comer más que sus compatriotas ocupados.",
      en: "Philosopher and factory worker, a Jew drawn to Christ and belonging nowhere. She worked in factories and fields in order to think from affliction rather than about it. She died in England at thirty-four, refusing to eat more than her occupied compatriots.",
    },
    expertise: [
      { es: "La atención pura", en: "Pure attention" },
      { es: "Desgracia y fuerza", en: "Affliction and force" },
      { es: "Desarraigo y trabajo", en: "Uprootedness and labour" },
      { es: "Gravedad y gracia", en: "Gravity and grace" },
      { es: "Justicia y necesidad", en: "Justice and necessity" },
    ],
  },

  kusch: {
    years: "1922 – 1979",
    origin: { es: "Buenos Aires / Maimará, Argentina", en: "Buenos Aires / Maimará, Argentina" },
    bio: {
      es: "Filósofo argentino que abandonó la cátedra porteña para pensar desde el altiplano. Distinguió el ser alguien europeo del estar aquí americano y buscó un pensamiento seminal, arraigado en el suelo, el rito y la vida popular.",
      en: "Argentine philosopher who left the Buenos Aires chair to think from the high plateau. He distinguished the European drive to be someone from the American mode of being here, seeking a seminal thought rooted in soil, ritual and popular life.",
    },
    expertise: [
      { es: "Ser alguien / estar aquí", en: "Being someone / being here" },
      { es: "Hedor y pulcritud", en: "Stench and neatness" },
      { es: "Geocultura", en: "Geoculture" },
      { es: "Pensamiento popular andino", en: "Andean popular thought" },
      { es: "Crítica al intelectual colonizado", en: "Critique of the colonised intellectual" },
    ],
  },

  giannini: {
    years: "1927 – 2014",
    origin: { es: "Santiago, Chile", en: "Santiago, Chile" },
    bio: {
      es: "Filósofo chileno de la vida cotidiana. Mostró que el itinerario común —domicilio, calle, trabajo— tiene una estructura moral, y que la reflexión es literalmente un regreso sobre lo vivido. Enseñó durante décadas con humor y una paciencia socrática.",
      en: "Chilean philosopher of everyday life. He showed that the ordinary itinerary — home, street, work — has a moral structure, and that reflection is literally a return upon what has been lived. He taught for decades with humour and Socratic patience.",
    },
    expertise: [
      { es: "La vida cotidiana", en: "Everyday life" },
      { es: "La calle y el otro", en: "The street and the other" },
      { es: "La reflexión como regreso", en: "Reflection as return" },
      { es: "Hábito y transgresión", en: "Habit and transgression" },
      { es: "Ética situada", en: "Situated ethics" },
    ],
  },

  derrida: {
    years: "1930 – 2004",
    origin: { es: "El Biar, Argelia / París", en: "El Biar, Algeria / Paris" },
    bio: {
      es: "Judío argelino en Francia, inventó la deconstrucción: no una destrucción, sino la lectura que muestra lo que un texto excluye para poder decirse. Différance, huella y suplemento reorganizaron la filosofía, la literatura y el derecho del siglo XX.",
      en: "An Algerian Jew in France, he devised deconstruction: not a destruction but a reading that shows what a text excludes in order to speak. Différance, trace and supplement reshaped twentieth-century philosophy, literature and law.",
    },
    expertise: [
      { es: "Différance y huella", en: "Différance and trace" },
      { es: "Metafísica de la presencia", en: "Metaphysics of presence" },
      { es: "Escritura y suplemento", en: "Writing and supplement" },
      { es: "Hospitalidad y don", en: "Hospitality and gift" },
      { es: "Justicia indeconstruible", en: "Undeconstructible justice" },
    ],
  },

  porete: {
    years: "† 1310",
    origin: { es: "Hainaut / París", en: "Hainaut / Paris" },
    bio: {
      es: "Beguina del Hainaut, autora del Espejo de las almas simples. Escribió en lengua vulgar una mística del alma aniquilada, libre de la propia voluntad y aun de las virtudes. Fue quemada en la Plaza de Grève por negarse a retractarse.",
      en: "A beguine from Hainaut, author of The Mirror of Simple Souls. In the vernacular she wrote a mysticism of the annihilated soul, freed from its own will and even from the virtues. She was burned at the Place de Grève for refusing to recant.",
    },
    expertise: [
      { es: "El alma aniquilada", en: "The annihilated soul" },
      { es: "Amor sobre la Razón", en: "Love above Reason" },
      { es: "Los siete estados", en: "The seven states" },
      { es: "Iglesia grande e Iglesia pequeña", en: "The great and the little Church" },
      { es: "Mística vernácula", en: "Vernacular mysticism" },
    ],
  },

  marinella: {
    years: "1571 – 1653",
    origin: { es: "Venecia, Italia", en: "Venice, Italy" },
    bio: {
      es: "Erudita veneciana, hija de médico, respondió con La nobleza y excelencia de las mujeres a la misoginia docta de su tiempo. Usó a Platón, Aristóteles y la historia para desmontar el prejuicio, con ironía cortesana y sin pedir permiso.",
      en: "A Venetian scholar, daughter of a physician, she answered the learned misogyny of her age with The Nobility and Excellence of Women. She used Plato, Aristotle and history to dismantle prejudice, with courtly irony and without asking permission.",
    },
    expertise: [
      { es: "Excelencia de las mujeres", en: "The excellence of women" },
      { es: "Vicios de los hombres", en: "The defects of men" },
      { es: "Belleza neoplatónica", en: "Neoplatonic beauty" },
      { es: "Educación negada", en: "Denied education" },
      { es: "Polémica renacentista", en: "Renaissance polemic" },
    ],
  },

  deshoulieres: {
    years: "1638 – 1694",
    origin: { es: "París, Francia", en: "Paris, France" },
    bio: {
      es: "Poeta francesa llamada la décima musa, lectora de Gassendi y del epicureísmo. Sus idilios oponen a la vanidad de la corte la sabiduría muda de la naturaleza. Escribió con gracia sobre el desengaño y soportó con humor una larga enfermedad.",
      en: "French poet known as the tenth muse, a reader of Gassendi and of Epicureanism. Her idylls set the mute wisdom of nature against the vanity of the court. She wrote gracefully about disillusion and bore a long illness with humour.",
    },
    expertise: [
      { es: "Escepticismo y desengaño", en: "Scepticism and disillusion" },
      { es: "La naturaleza como maestra", en: "Nature as teacher" },
      { es: "Placer moderado", en: "Moderate pleasure" },
      { es: "El salón y el ingenio", en: "The salon and wit" },
      { es: "Poesía filosófica", en: "Philosophical poetry" },
    ],
  },

  sable: {
    years: "1598 – 1678",
    origin: { es: "París, Francia", en: "Paris, France" },
    bio: {
      es: "Anfitriona de uno de los salones más agudos de París y ligada a Port-Royal. Convirtió la máxima en un género: frases breves que desnudan el amor propio escondido tras la virtud. La Rochefoucauld pulió sus máximas discutiéndolas con ella.",
      en: "Hostess of one of the sharpest salons in Paris and close to Port-Royal. She turned the maxim into a genre: brief sentences that lay bare the self-love hidden behind virtue. La Rochefoucauld polished his maxims by arguing them with her.",
    },
    expertise: [
      { es: "Amor propio", en: "Self-love" },
      { es: "El arte de la máxima", en: "The art of the maxim" },
      { es: "Amistad y conversación", en: "Friendship and conversation" },
      { es: "Jansenismo", en: "Jansenism" },
      { es: "Moral de salón", en: "Salon morality" },
    ],
  },

  hildebrand: {
    years: "1923 – 2022",
    origin: { es: "Bruselas / Nueva York", en: "Brussels / New York" },
    bio: {
      es: "Filósofa católica belga, profesora durante treinta y siete años en Hunter College, donde defendió el realismo de los valores frente al relativismo dominante. Continuó y difundió la obra de su marido, Dietrich von Hildebrand.",
      en: "Belgian Catholic philosopher, for thirty-seven years a professor at Hunter College, where she defended the realism of values against the prevailing relativism. She continued and spread the work of her husband, Dietrich von Hildebrand.",
    },
    expertise: [
      { es: "Reverencia", en: "Reverence" },
      { es: "Valores objetivos", en: "Objective values" },
      { es: "El corazón como centro", en: "The heart as centre" },
      { es: "Amor esponsal", en: "Spousal love" },
      { es: "Crítica del relativismo", en: "Critique of relativism" },
    ],
  },

  ziemiecka: {
    years: "1815 – 1869",
    origin: { es: "Varsovia, Polonia", en: "Warsaw, Poland" },
    bio: {
      es: "Considerada la primera filósofa polaca, editó la revista Pielgrzym y buscó una filosofía cristiana capaz de resistir tanto al idealismo alemán como al fideísmo. Escribió sobre educación y sobre el deber moral en una nación sin Estado.",
      en: "Regarded as the first Polish woman philosopher, she edited the journal Pielgrzym and sought a Christian philosophy able to resist both German idealism and fideism. She wrote on education and on moral duty in a nation without a state.",
    },
    expertise: [
      { es: "Filosofía cristiana", en: "Christian philosophy" },
      { es: "Razón y revelación", en: "Reason and revelation" },
      { es: "Crítica del idealismo alemán", en: "Critique of German idealism" },
      { es: "Educación de la mujer", en: "Women's education" },
      { es: "Nación y providencia", en: "Nation and providence" },
    ],
  },

  stein: {
    years: "1891 – 1942",
    origin: { es: "Breslau / Auschwitz", en: "Breslau / Auschwitz" },
    bio: {
      es: "Judía de Breslau, asistente de Husserl y autora de una tesis sobre la empatía. Convertida al catolicismo, entró en el Carmelo como Teresa Benedicta de la Cruz y unió fenomenología y tomismo. Fue deportada y asesinada en Auschwitz en 1942.",
      en: "A Jew from Breslau, Husserl's assistant and author of a dissertation on empathy. Converted to Catholicism, she entered Carmel as Teresa Benedicta of the Cross and joined phenomenology to Thomism. She was deported and murdered at Auschwitz in 1942.",
    },
    expertise: [
      { es: "Empatía", en: "Empathy" },
      { es: "Persona e individualidad", en: "Person and individuality" },
      { es: "Ser finito y eterno", en: "Finite and eternal being" },
      { es: "La mujer y su vocación", en: "Woman and her vocation" },
      { es: "Ciencia de la cruz", en: "Science of the cross" },
    ],
  },

  anscombe: {
    years: "1919 – 2001",
    origin: { es: "Cambridge / Oxford, Inglaterra", en: "Cambridge / Oxford, England" },
    bio: {
      es: "Alumna, amiga y traductora de Wittgenstein, católica y madre de siete hijos. Su libro Intención refundó la filosofía de la acción, y su ensayo sobre la filosofía moral moderna abrió el camino a la ética de la virtud contemporánea.",
      en: "Wittgenstein's student, friend and translator, a Catholic and mother of seven. Her book Intention refounded the philosophy of action, and her essay on modern moral philosophy opened the way to contemporary virtue ethics.",
    },
    expertise: [
      { es: "Intención y acción", en: "Intention and action" },
      { es: "Contra el consecuencialismo", en: "Against consequentialism" },
      { es: "Doble efecto", en: "Double effect" },
      { es: "Wittgenstein y el lenguaje", en: "Wittgenstein and language" },
      { es: "Causalidad y primera persona", en: "Causality and the first person" },
    ],
  },

  lipman: {
    years: "1922 – 2010",
    origin: { es: "Nueva Jersey, EE. UU.", en: "New Jersey, USA" },
    bio: {
      es: "Profesor estadounidense que, al ver a sus alumnos incapaces de razonar, creó Filosofía para Niños. Escribió novelas filosóficas para el aula y propuso la comunidad de indagación: pensar juntos, pedir razones y cuidar la pregunta.",
      en: "American professor who, on finding his students unable to reason, created Philosophy for Children. He wrote philosophical novels for the classroom and proposed the community of inquiry: thinking together, asking for reasons, caring for the question.",
    },
    expertise: [
      { es: "Comunidad de indagación", en: "Community of inquiry" },
      { es: "Pensamiento crítico y creativo", en: "Critical and creative thinking" },
      { es: "Caring thinking", en: "Caring thinking" },
      { es: "Novela filosófica", en: "The philosophical novel" },
      { es: "Educación democrática", en: "Democratic education" },
    ],
  },
};

export function profileOf(id: string): PhilosopherProfile | undefined {
  return PROFILES[id as PhilosopherId];
}
