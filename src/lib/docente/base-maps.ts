/**
 * Kionas base maps: starting points for ten core concepts.
 * Editorial drafts pending review — never presented as validated material.
 * Authors are only thinkers registered in Kionas (checked in base-maps.test.ts).
 */
import { layoutRadial, uid, type MapContent, type MapEdge, type MapNode, type NodeKind, type Relation } from "./model";

type L = { es: string; en: string };
/** [key, kind, label es, label en, note es, note en] */
type N = [string, NodeKind, string, string, string?, string?];
type E = [string, string, Relation];
export type BaseMap = { id: string; concept: L; lead: L; nodes: N[]; edges: E[] };

export const BASE_MAPS: BaseMap[] = [
  {
    id: "libertad",
    concept: { es: "Libertad", en: "Freedom" },
    lead: { es: "Libertad negativa y positiva, autonomía, determinismo y responsabilidad.", en: "Negative and positive liberty, autonomy, determinism and responsibility." },
    nodes: [
      ["c", "central", "Libertad", "Freedom"],
      ["neg", "concept", "Libertad negativa", "Negative liberty", "Ausencia de interferencia de otros.", "Absence of interference by others."],
      ["pos", "concept", "Libertad positiva", "Positive liberty", "Ser dueño de sí: autogobierno.", "Being one's own master: self-government."],
      ["berlin", "author", "Isaiah Berlin", "Isaiah Berlin", "Dos conceptos de libertad (1958).", "Two Concepts of Liberty (1958)."],
      ["kant", "author", "Immanuel Kant", "Immanuel Kant", "Libertad como autonomía de la voluntad.", "Freedom as autonomy of the will."],
      ["sartre", "author", "Jean-Paul Sartre", "Jean-Paul Sartre", "Estamos condenados a ser libres.", "We are condemned to be free."],
      ["mill", "author", "John Stuart Mill", "John Stuart Mill", "Sobre la libertad: el principio del daño.", "On Liberty: the harm principle."],
      ["det", "concept", "Determinismo", "Determinism", "Todo evento tiene causas suficientes.", "Every event has sufficient causes."],
      ["resp", "concept", "Responsabilidad", "Responsibility"],
      ["q", "question", "¿Es compatible la libertad con la causalidad?", "Is freedom compatible with causality?"],
      ["law", "discipline", "Derecho: libertades fundamentales", "Law: fundamental freedoms"],
      ["obj", "objection", "La libertad podría ser una ilusión psicológica", "Freedom might be a psychological illusion"],
    ],
    edges: [["c", "neg", "distinguishes"], ["c", "pos", "distinguishes"], ["berlin", "neg", "develops"], ["berlin", "pos", "develops"], ["kant", "c", "grounds"], ["sartre", "c", "develops"], ["mill", "neg", "grounds"], ["det", "c", "questions"], ["c", "resp", "grounds"], ["q", "det", "relates"], ["law", "c", "applies"], ["obj", "c", "opposes"]],
  },
  {
    id: "justicia",
    concept: { es: "Justicia", en: "Justice" },
    lead: { es: "Justicia como armonía, distribución, utilidad y crítica.", en: "Justice as harmony, distribution, utility and critique." },
    nodes: [
      ["c", "central", "Justicia", "Justice"],
      ["plato", "author", "Platón", "Plato", "República: justicia como armonía de las partes.", "Republic: justice as harmony of the parts."],
      ["arist", "author", "Aristóteles", "Aristotle", "Ética a Nicómaco V: justicia distributiva y correctiva.", "Nicomachean Ethics V: distributive and corrective justice."],
      ["dist", "concept", "Justicia distributiva", "Distributive justice"],
      ["corr", "concept", "Justicia correctiva", "Corrective justice"],
      ["mill", "author", "John Stuart Mill", "John Stuart Mill", "El utilitarismo: justicia y utilidad.", "Utilitarianism: justice and utility."],
      ["marx", "author", "Karl Marx", "Karl Marx", "Crítica del programa de Gotha: según sus necesidades.", "Critique of the Gotha Programme: according to needs."],
      ["hayek", "author", "Friedrich Hayek", "Friedrich Hayek", "Crítica de la idea de «justicia social».", "Critique of the idea of 'social justice'."],
      ["eq", "concept", "Igualdad", "Equality"],
      ["q", "question", "¿Qué se le debe a cada uno?", "What is owed to each person?"],
      ["case", "case", "Caso hipotético: reparto de vacunas escasas", "Hypothetical case: allocating scarce vaccines"],
    ],
    edges: [["plato", "c", "develops"], ["arist", "dist", "develops"], ["arist", "corr", "develops"], ["c", "dist", "distinguishes"], ["c", "corr", "distinguishes"], ["mill", "c", "grounds"], ["marx", "dist", "questions"], ["hayek", "dist", "opposes"], ["dist", "eq", "presupposes"], ["q", "c", "questions"], ["case", "dist", "applies"]],
  },
  {
    id: "verdad",
    concept: { es: "Verdad", en: "Truth" },
    lead: { es: "Correspondencia, coherencia, pragmatismo, desocultamiento y perspectivismo.", en: "Correspondence, coherence, pragmatism, unconcealment and perspectivism." },
    nodes: [
      ["c", "central", "Verdad", "Truth"],
      ["corr", "concept", "Teoría de la correspondencia", "Correspondence theory", "Verdad como adecuación entre juicio y realidad.", "Truth as agreement between judgement and reality."],
      ["coh", "concept", "Teoría de la coherencia", "Coherence theory"],
      ["arist", "author", "Aristóteles", "Aristotle", "Metafísica: decir de lo que es que es.", "Metaphysics: to say of what is that it is."],
      ["james", "author", "William James", "William James", "Pragmatismo: la verdad como lo que funciona en la experiencia.", "Pragmatism: truth as what works in experience."],
      ["heid", "author", "Heidegger", "Heidegger", "Verdad como alétheia, desocultamiento.", "Truth as aletheia, unconcealment."],
      ["nietz", "author", "Nietzsche", "Nietzsche", "Perspectivismo: no hay hechos sin interpretación.", "Perspectivism: no facts without interpretation."],
      ["doxa", "concept", "Opinión (doxa)", "Opinion (doxa)"],
      ["sci", "discipline", "Ciencias: contrastación empírica", "Sciences: empirical testing"],
      ["q", "question", "¿Puede la verdad depender de una perspectiva?", "Can truth depend on a perspective?"],
    ],
    edges: [["c", "corr", "distinguishes"], ["c", "coh", "distinguishes"], ["arist", "corr", "grounds"], ["james", "c", "develops"], ["heid", "c", "develops"], ["nietz", "c", "questions"], ["c", "doxa", "distinguishes"], ["sci", "corr", "applies"], ["q", "nietz", "relates"]],
  },
  {
    id: "conocimiento",
    concept: { es: "Conocimiento", en: "Knowledge" },
    lead: { es: "Creencia, justificación, razón, experiencia y escepticismo.", en: "Belief, justification, reason, experience and scepticism." },
    nodes: [
      ["c", "central", "Conocimiento", "Knowledge"],
      ["plato", "author", "Platón", "Plato", "Teeteto: ¿creencia verdadera con explicación?", "Theaetetus: true belief with an account?"],
      ["kant", "author", "Immanuel Kant", "Immanuel Kant", "Crítica de la razón pura: condiciones de posibilidad del conocimiento.", "Critique of Pure Reason: conditions of possible knowledge."],
      ["just", "concept", "Justificación", "Justification"],
      ["exp", "concept", "Experiencia", "Experience"],
      ["reason", "concept", "Razón", "Reason"],
      ["rat", "school", "Racionalismo", "Rationalism"],
      ["emp", "school", "Empirismo", "Empiricism"],
      ["skep", "objection", "Escepticismo: ¿podemos saber algo con certeza?", "Scepticism: can we know anything for certain?"],
      ["q", "question", "¿Qué distingue saber de creer?", "What distinguishes knowing from believing?"],
      ["neuro", "discipline", "Neurociencia: percepción y memoria", "Neuroscience: perception and memory"],
    ],
    edges: [["c", "just", "presupposes"], ["plato", "c", "develops"], ["kant", "c", "grounds"], ["rat", "reason", "grounds"], ["emp", "exp", "grounds"], ["rat", "emp", "opposes"], ["kant", "rat", "distinguishes"], ["skep", "c", "questions"], ["q", "just", "relates"], ["neuro", "exp", "applies"]],
  },
  {
    id: "identidad",
    concept: { es: "Identidad", en: "Identity" },
    lead: { es: "Identidad personal, reconocimiento, devenir y construcción social.", en: "Personal identity, recognition, becoming and social construction." },
    nodes: [
      ["c", "central", "Identidad", "Identity"],
      ["pers", "concept", "Identidad personal", "Personal identity", "Qué hace que alguien siga siendo la misma persona.", "What makes someone remain the same person."],
      ["mem", "concept", "Memoria", "Memory"],
      ["recog", "concept", "Reconocimiento", "Recognition"],
      ["hegel", "author", "G. W. F. Hegel", "G. W. F. Hegel", "Fenomenología del espíritu: la autoconciencia requiere reconocimiento.", "Phenomenology of Spirit: self-consciousness requires recognition."],
      ["kierk", "author", "Søren Kierkegaard", "Søren Kierkegaard", "Llegar a ser sí mismo como tarea.", "Becoming oneself as a task."],
      ["beauv", "author", "Simone de Beauvoir", "Simone de Beauvoir", "El segundo sexo: no se nace mujer, se llega a serlo.", "The Second Sex: one is not born a woman."],
      ["bauman", "author", "Zygmunt Bauman", "Zygmunt Bauman", "Identidades líquidas en la modernidad tardía.", "Liquid identities in late modernity."],
      ["psy", "discipline", "Psicología: autoconcepto", "Psychology: self-concept"],
      ["obj", "objection", "El yo podría ser solo una construcción", "The self might be a mere construction"],
      ["q", "question", "¿Elegimos quiénes somos?", "Do we choose who we are?"],
    ],
    edges: [["c", "pers", "distinguishes"], ["pers", "mem", "presupposes"], ["hegel", "recog", "develops"], ["c", "recog", "presupposes"], ["kierk", "c", "develops"], ["beauv", "c", "questions"], ["bauman", "c", "develops"], ["psy", "pers", "applies"], ["obj", "pers", "opposes"], ["q", "c", "questions"]],
  },
  {
    id: "poder",
    concept: { es: "Poder", en: "Power" },
    lead: { es: "Poder, violencia, autoridad y legitimidad.", en: "Power, violence, authority and legitimacy." },
    nodes: [
      ["c", "central", "Poder", "Power"],
      ["arendt", "author", "Hannah Arendt", "Hannah Arendt", "Sobre la violencia: el poder surge de actuar en concierto.", "On Violence: power arises from acting in concert."],
      ["viol", "concept", "Violencia", "Violence"],
      ["auth", "concept", "Autoridad", "Authority"],
      ["legit", "concept", "Legitimidad", "Legitimacy"],
      ["nietz", "author", "Nietzsche", "Nietzsche", "Voluntad de poder.", "Will to power."],
      ["marx", "author", "Karl Marx", "Karl Marx", "Poder de clase y medios de producción.", "Class power and the means of production."],
      ["rouss", "author", "Jean-Jacques Rousseau", "Jean-Jacques Rousseau", "El contrato social: voluntad general.", "The Social Contract: the general will."],
      ["pol", "discipline", "Ciencia política", "Political science"],
      ["case", "case", "Caso hipotético: un algoritmo decide becas", "Hypothetical case: an algorithm awards grants"],
      ["q", "question", "¿Cuándo es legítimo obedecer?", "When is obedience legitimate?"],
    ],
    edges: [["arendt", "c", "develops"], ["c", "viol", "distinguishes"], ["arendt", "viol", "distinguishes"], ["c", "auth", "relates"], ["legit", "auth", "grounds"], ["nietz", "c", "develops"], ["marx", "c", "questions"], ["rouss", "legit", "grounds"], ["pol", "c", "applies"], ["case", "legit", "questions"], ["q", "legit", "relates"]],
  },
  {
    id: "responsabilidad",
    concept: { es: "Responsabilidad", en: "Responsibility" },
    lead: { es: "Voluntariedad, imputación, culpa y responsabilidad por el otro.", en: "Voluntariness, imputation, guilt and responsibility for the other." },
    nodes: [
      ["c", "central", "Responsabilidad", "Responsibility"],
      ["arist", "author", "Aristóteles", "Aristotle", "Ética a Nicómaco III: acto voluntario e involuntario.", "Nicomachean Ethics III: voluntary and involuntary acts."],
      ["sartre", "author", "Jean-Paul Sartre", "Jean-Paul Sartre", "Somos responsables de lo que hacemos de nosotros.", "We are responsible for what we make of ourselves."],
      ["levinas", "author", "Emmanuel Levinas", "Emmanuel Levinas", "Totalidad e infinito: responsabilidad ante el rostro del otro.", "Totality and Infinity: responsibility before the face of the other."],
      ["arendt", "author", "Hannah Arendt", "Hannah Arendt", "Eichmann en Jerusalén: juicio y responsabilidad personal.", "Eichmann in Jerusalem: judgement and personal responsibility."],
      ["free", "concept", "Libertad", "Freedom"],
      ["imp", "concept", "Imputabilidad", "Imputability"],
      ["guilt", "concept", "Culpa", "Guilt"],
      ["law", "discipline", "Derecho penal", "Criminal law"],
      ["case", "case", "Caso hipotético: decisión médica bajo incertidumbre", "Hypothetical case: a medical decision under uncertainty"],
      ["q", "question", "¿Se puede ser responsable sin haber elegido?", "Can one be responsible without having chosen?"],
    ],
    edges: [["c", "free", "presupposes"], ["arist", "imp", "grounds"], ["sartre", "c", "develops"], ["levinas", "c", "develops"], ["arendt", "c", "develops"], ["c", "guilt", "distinguishes"], ["law", "imp", "applies"], ["case", "c", "applies"], ["q", "free", "questions"]],
  },
  {
    id: "causalidad",
    concept: { es: "Causalidad", en: "Causality" },
    lead: { es: "Causas, razón suficiente, determinismo y correlación.", en: "Causes, sufficient reason, determinism and correlation." },
    nodes: [
      ["c", "central", "Causalidad", "Causality"],
      ["arist", "author", "Aristóteles", "Aristotle", "Física II: las cuatro causas.", "Physics II: the four causes."],
      ["kant", "author", "Immanuel Kant", "Immanuel Kant", "La causalidad como categoría del entendimiento.", "Causality as a category of the understanding."],
      ["schop", "author", "Schopenhauer", "Schopenhauer", "Sobre la cuádruple raíz del principio de razón suficiente.", "On the Fourfold Root of the Principle of Sufficient Reason."],
      ["emp", "school", "Empirismo: causalidad como hábito", "Empiricism: causality as habit"],
      ["det", "concept", "Determinismo", "Determinism"],
      ["corr", "concept", "Correlación", "Correlation", "Que dos variables covaríen no implica que una cause la otra.", "Covariation does not imply that one causes the other."],
      ["will", "concept", "Libre albedrío", "Free will"],
      ["stats", "discipline", "Estadística y epidemiología: inferencia causal", "Statistics and epidemiology: causal inference"],
      ["q", "question", "¿Observamos causas o solo sucesiones?", "Do we observe causes or only sequences?"],
    ],
    edges: [["arist", "c", "develops"], ["kant", "c", "grounds"], ["schop", "c", "develops"], ["emp", "c", "questions"], ["kant", "emp", "opposes"], ["c", "det", "grounds"], ["c", "corr", "distinguishes"], ["det", "will", "questions"], ["stats", "corr", "applies"], ["q", "emp", "relates"]],
  },
  {
    id: "conciencia",
    concept: { es: "Conciencia", en: "Consciousness" },
    lead: { es: "Intencionalidad, experiencia subjetiva, empatía y correlatos neuronales.", en: "Intentionality, subjective experience, empathy and neural correlates." },
    nodes: [
      ["c", "central", "Conciencia", "Consciousness"],
      ["int", "concept", "Intencionalidad", "Intentionality", "La conciencia es siempre conciencia de algo.", "Consciousness is always consciousness of something."],
      ["subj", "concept", "Experiencia subjetiva", "Subjective experience"],
      ["mb", "concept", "Problema mente-cuerpo", "Mind–body problem"],
      ["james", "author", "William James", "William James", "Principios de psicología: la corriente de conciencia.", "The Principles of Psychology: the stream of consciousness."],
      ["sartre", "author", "Jean-Paul Sartre", "Jean-Paul Sartre", "El ser y la nada: la conciencia como para-sí.", "Being and Nothingness: consciousness as for-itself."],
      ["stein", "author", "Edith Stein", "Edith Stein", "Sobre el problema de la empatía.", "On the Problem of Empathy."],
      ["neuro", "discipline", "Neurociencia: correlatos neuronales", "Neuroscience: neural correlates"],
      ["red", "objection", "Reduccionismo: la conciencia es solo actividad cerebral", "Reductionism: consciousness is only brain activity"],
      ["q", "question", "¿Podría una máquina ser consciente?", "Could a machine be conscious?"],
    ],
    edges: [["c", "int", "presupposes"], ["c", "subj", "distinguishes"], ["c", "mb", "relates"], ["james", "c", "develops"], ["sartre", "int", "develops"], ["stein", "subj", "develops"], ["neuro", "mb", "applies"], ["red", "subj", "opposes"], ["q", "mb", "questions"]],
  },
  {
    id: "etica",
    concept: { es: "Ética", en: "Ethics" },
    lead: { es: "Virtud, deber, consecuencias y alteridad.", en: "Virtue, duty, consequences and otherness." },
    nodes: [
      ["c", "central", "Ética", "Ethics"],
      ["virt", "school", "Ética de la virtud", "Virtue ethics"],
      ["deon", "school", "Deontología", "Deontology"],
      ["util", "school", "Utilitarismo", "Utilitarianism"],
      ["arist", "author", "Aristóteles", "Aristotle", "Ética a Nicómaco: virtud y vida buena.", "Nicomachean Ethics: virtue and the good life."],
      ["kant", "author", "Immanuel Kant", "Immanuel Kant", "Fundamentación: el imperativo categórico.", "Groundwork: the categorical imperative."],
      ["bentham", "author", "Jeremy Bentham", "Jeremy Bentham", "Principio de utilidad.", "Principle of utility."],
      ["anscombe", "author", "Elizabeth Anscombe", "Elizabeth Anscombe", "La filosofía moral moderna (1958).", "Modern Moral Philosophy (1958)."],
      ["levinas", "author", "Emmanuel Levinas", "Emmanuel Levinas", "La ética como filosofía primera.", "Ethics as first philosophy."],
      ["bio", "discipline", "Ética profesional y bioética", "Professional ethics and bioethics"],
      ["q", "question", "¿Qué hace correcta una acción?", "What makes an action right?"],
    ],
    edges: [["c", "virt", "distinguishes"], ["c", "deon", "distinguishes"], ["c", "util", "distinguishes"], ["arist", "virt", "grounds"], ["kant", "deon", "grounds"], ["bentham", "util", "grounds"], ["deon", "util", "opposes"], ["anscombe", "virt", "develops"], ["levinas", "c", "develops"], ["bio", "c", "applies"], ["q", "c", "questions"]],
  },
];

/** Builds an editable map in the teacher's language. Fresh ids every time, so copies never collide. */
export function buildBaseMap(b: BaseMap, lang: "es" | "en"): MapContent {
  const ids = new Map<string, string>();
  const nodes: MapNode[] = b.nodes.map(([key, kind, les, len, nes, nen]) => {
    const id = uid("n");
    ids.set(key, id);
    return { id, label: lang === "es" ? les : len, kind, note: (lang === "es" ? nes : nen) ?? "", x: 0, y: 0 };
  });
  const edges: MapEdge[] = b.edges
    .filter(([f, t]) => ids.has(f) && ids.has(t))
    .map(([f, t, relation]) => ({ id: uid("e"), from: ids.get(f)!, to: ids.get(t)!, relation }));
  return layoutRadial({ nodes, edges });
}
