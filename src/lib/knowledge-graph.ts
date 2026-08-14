// Conocimiento Universal — red de ideas, filósofos, movimientos e ideologías.
// Dataset estático y bilingüe. Los ids son estables; `chat` enlaza con una mente viva.

import type { LocalizedString, PhilosopherId } from "./philosophers";

export type NodeKind = "philosopher" | "idea" | "movement" | "ideology";

export type GraphNode = {
  id: string;
  label: string;
  kind: NodeKind;
  era?: string;
  note: LocalizedString;
  chat?: PhilosopherId;
};

export type LinkKind = "influence" | "opposition" | "belongs" | "develops";

export type GraphLink = {
  source: string;
  target: string;
  kind: LinkKind;
};

export const KIND_LABEL: Record<NodeKind, LocalizedString> = {
  philosopher: { es: "Filósofo", en: "Philosopher" },
  idea: { es: "Idea", en: "Idea" },
  movement: { es: "Movimiento", en: "Movement" },
  ideology: { es: "Ideología", en: "Ideology" },
};

export const LINK_LABEL: Record<LinkKind, LocalizedString> = {
  influence: { es: "influye en", en: "influences" },
  opposition: { es: "se opone a", en: "opposes" },
  belongs: { es: "pertenece a", en: "belongs to" },
  develops: { es: "desarrolla", en: "develops" },
};

const P = (
  id: string,
  label: string,
  era: string,
  es: string,
  en: string,
  chat?: PhilosopherId,
): GraphNode => ({ id, label, kind: "philosopher", era, note: { es, en }, chat });

const N = (
  id: string,
  label: string,
  kind: NodeKind,
  es: string,
  en: string,
  era?: string,
): GraphNode => ({ id, label, kind, era, note: { es, en } });

export const GRAPH_NODES: GraphNode[] = [
  // ── Filósofos vivos en la plataforma ──────────────────────────────
  P("heidegger", "Martin Heidegger", "1889–1976",
    "Pregunta por el sentido del Ser; el Dasein, la angustia y la técnica como destino.",
    "Asks the question of the meaning of Being; Dasein, anxiety, technology as destiny.", "heidegger"),
  P("schopenhauer", "Arthur Schopenhauer", "1788–1860",
    "El mundo como voluntad ciega y representación; el sufrimiento como estructura.",
    "The world as blind will and representation; suffering as structure.", "schopenhauer"),
  P("nietzsche", "Friedrich Nietzsche", "1844–1900",
    "Voluntad de poder, muerte de Dios, transvaloración de todos los valores.",
    "Will to power, death of God, revaluation of all values.", "nietzsche"),
  P("marx", "Karl Marx", "1818–1883",
    "Materialismo histórico, alienación del trabajo, crítica de la economía política.",
    "Historical materialism, alienation of labour, critique of political economy.", "marx"),
  P("james", "William James", "1842–1910",
    "Pragmatismo, corriente de conciencia, voluntad de creer.",
    "Pragmatism, stream of consciousness, the will to believe.", "james"),
  P("bentham", "Jeremy Bentham", "1748–1832",
    "Cálculo de placer y dolor: la mayor felicidad para el mayor número.",
    "Calculus of pleasure and pain: the greatest happiness for the greatest number.", "bentham"),
  P("pohlenz", "Max Pohlenz", "1872–1962",
    "Filólogo del estoicismo: la Stoa como movimiento espiritual completo.",
    "Philologist of Stoicism: the Stoa as a complete spiritual movement.", "pohlenz"),
  P("pascal", "Blaise Pascal", "1623–1662",
    "Razones del corazón, la apuesta, la miseria y grandeza del hombre.",
    "Reasons of the heart, the wager, the misery and greatness of man.", "pascal"),
  P("kierkegaard", "Søren Kierkegaard", "1813–1855",
    "El individuo ante Dios, la angustia, el salto de fe.",
    "The single individual before God, anxiety, the leap of faith.", "kierkegaard"),
  P("yannaras", "Christos Yannaras", "1935–2024",
    "Persona y comunión desde la teología ortodoxa frente al individualismo occidental.",
    "Person and communion from Orthodox theology against Western individualism.", "yannaras"),
  P("levinas", "Emmanuel Levinas", "1906–1995",
    "El rostro del Otro como origen de la ética, anterior a la ontología.",
    "The face of the Other as the origin of ethics, prior to ontology.", "levinas"),
  P("maimonides", "Maimónides", "1138–1204",
    "Guía de perplejos: teología negativa y razón aristotélica en clave judía.",
    "Guide for the Perplexed: negative theology and Aristotelian reason in Jewish key.", "maimonides"),
  P("aquinas", "Tomás de Aquino", "1225–1274",
    "Síntesis de fe y razón; ser, analogía, ley natural.",
    "Synthesis of faith and reason; being, analogy, natural law.", "aquinas"),
  P("rationalism_mind", "Racionalismo (Descartes · Spinoza · Leibniz)", "s. XVII",
    "La razón como fuente última del conocimiento cierto.",
    "Reason as the ultimate source of certain knowledge.", "rationalism"),

  // ── Otros filósofos del ecosistema ────────────────────────────────
  P("socrates", "Sócrates", "470–399 a.C.", "La pregunta como método; saber que no se sabe.", "The question as method; knowing that one does not know."),
  P("plato", "Platón", "427–347 a.C.", "Las Ideas como realidad verdadera; el alma y la ciudad justa.", "Ideas as true reality; the soul and the just city."),
  P("aristotle", "Aristóteles", "384–322 a.C.", "Sustancia, potencia y acto, virtud como término medio.", "Substance, potency and act, virtue as the mean."),
  P("epictetus", "Epicteto", "50–135", "Lo que depende de nosotros y lo que no.", "What is up to us and what is not."),
  P("augustine", "Agustín de Hipona", "354–430", "Interioridad, tiempo, gracia y voluntad.", "Interiority, time, grace and will."),
  P("descartes", "René Descartes", "1596–1650", "Duda metódica y el cogito como primer suelo firme.", "Methodical doubt and the cogito as first firm ground."),
  P("spinoza", "Baruch Spinoza", "1632–1677", "Una sola sustancia: Dios o Naturaleza.", "One single substance: God or Nature."),
  P("leibniz", "G. W. Leibniz", "1646–1716", "Mónadas, razón suficiente, armonía preestablecida.", "Monads, sufficient reason, pre-established harmony."),
  P("hume", "David Hume", "1711–1776", "Todo conocimiento nace de la impresión; crítica de la causalidad.", "All knowledge comes from impressions; critique of causality."),
  P("locke", "John Locke", "1632–1704", "Mente como tabla rasa; propiedad y consentimiento.", "Mind as blank slate; property and consent."),
  P("kant", "Immanuel Kant", "1724–1804", "Condiciones de posibilidad de la experiencia; imperativo categórico.", "Conditions of possible experience; the categorical imperative."),
  P("hegel", "G. W. F. Hegel", "1770–1831", "El espíritu se despliega dialécticamente en la historia.", "Spirit unfolds dialectically in history."),
  P("mill", "John Stuart Mill", "1806–1873", "Utilitarismo cualificado y libertad individual.", "Qualified utilitarianism and individual liberty."),
  P("husserl", "Edmund Husserl", "1859–1938", "Volver a las cosas mismas: la fenomenología.", "Back to the things themselves: phenomenology."),
  P("sartre", "Jean-Paul Sartre", "1905–1980", "La existencia precede a la esencia; libertad y condena.", "Existence precedes essence; freedom and condemnation."),
  P("arendt", "Hannah Arendt", "1906–1975", "Acción, pluralidad, banalidad del mal.", "Action, plurality, the banality of evil."),
  P("foucault", "Michel Foucault", "1926–1984", "Saber y poder: cómo se producen los sujetos.", "Knowledge and power: how subjects are produced."),
  P("wittgenstein", "Ludwig Wittgenstein", "1889–1951", "Los límites de mi lenguaje son los límites de mi mundo.", "The limits of my language are the limits of my world."),
  P("rawls", "John Rawls", "1921–2002", "Justicia como equidad tras el velo de ignorancia.", "Justice as fairness behind the veil of ignorance."),
  P("smith", "Adam Smith", "1723–1790", "Simpatía moral y división del trabajo.", "Moral sympathy and division of labour."),
  P("burke", "Edmund Burke", "1729–1797", "Prudencia, tradición y desconfianza de la abstracción revolucionaria.", "Prudence, tradition and distrust of revolutionary abstraction."),
  P("dostoevsky", "F. Dostoievski", "1821–1881", "La libertad como abismo moral y religioso.", "Freedom as moral and religious abyss."),

  // ── Movimientos ───────────────────────────────────────────────────
  N("stoicism", "Estoicismo", "movement", "Vivir conforme a la naturaleza y la razón; dominio de lo que depende de uno.", "Living according to nature and reason; mastery of what is up to us.", "s. III a.C.–II d.C."),
  N("platonism", "Platonismo", "movement", "Primacía de lo inteligible sobre lo sensible.", "Primacy of the intelligible over the sensible.", "s. IV a.C."),
  N("scholasticism", "Escolástica", "movement", "Razón y revelación articuladas en disputa ordenada.", "Reason and revelation articulated in ordered disputation.", "s. XI–XV"),
  N("rationalism", "Racionalismo", "movement", "El conocimiento cierto procede de la razón, no de los sentidos.", "Certain knowledge proceeds from reason, not the senses.", "s. XVII"),
  N("empiricism", "Empirismo", "movement", "Toda idea proviene de la experiencia sensible.", "Every idea derives from sense experience.", "s. XVII–XVIII"),
  N("idealism_ger", "Idealismo alemán", "movement", "El sujeto constituye el mundo; historia como despliegue del espíritu.", "The subject constitutes the world; history as unfolding of spirit.", "s. XVIII–XIX"),
  N("phenomenology", "Fenomenología", "movement", "Describir la experiencia tal como se da a la conciencia.", "Describing experience exactly as it gives itself to consciousness.", "s. XX"),
  N("existentialism", "Existencialismo", "movement", "El existente concreto antes que el sistema.", "The concrete existing individual before the system.", "s. XIX–XX"),
  N("pragmatism", "Pragmatismo", "movement", "El significado de una idea es su efecto práctico.", "The meaning of an idea is its practical effect.", "s. XIX–XX"),
  N("utilitarianism", "Utilitarismo", "movement", "Lo correcto es lo que maximiza el bienestar agregado.", "The right is what maximises aggregate welfare.", "s. XVIII–XIX"),
  N("nihilism", "Nihilismo", "movement", "Los valores supremos se desvalorizan.", "The highest values devalue themselves.", "s. XIX"),
  N("structuralism", "Estructuralismo / postestructuralismo", "movement", "Los sujetos son efectos de estructuras y discursos.", "Subjects as effects of structures and discourses.", "s. XX"),
  N("analytic", "Filosofía analítica", "movement", "Claridad lógica y análisis del lenguaje.", "Logical clarity and analysis of language.", "s. XX"),
  N("orthodox_theo", "Teología ortodoxa", "movement", "Persona, apófasis y comunión eclesial.", "Person, apophasis and ecclesial communion.", "s. IV–"),

  // ── Ideologías políticas ──────────────────────────────────────────
  N("liberalism", "Liberalismo", "ideology", "Libertad individual, derechos, límites al poder.", "Individual liberty, rights, limits on power."),
  N("socialism", "Socialismo", "ideology", "Propiedad social de los medios de producción.", "Social ownership of the means of production."),
  N("communism", "Comunismo", "ideology", "Abolición de clases y del Estado tras la revolución.", "Abolition of classes and the state after revolution."),
  N("anarchism", "Anarquismo", "ideology", "Rechazo de toda autoridad coercitiva.", "Rejection of all coercive authority."),
  N("conservatism", "Conservadurismo", "ideology", "Continuidad, tradición y reforma prudente.", "Continuity, tradition and prudent reform."),
  N("social_democracy", "Socialdemocracia", "ideology", "Mercado corregido por redistribución y derechos sociales.", "Markets corrected by redistribution and social rights."),
  N("republicanism", "Republicanismo", "ideology", "Libertad como no-dominación y virtud cívica.", "Freedom as non-domination and civic virtue."),
  N("technocracy", "Tecnocracia", "ideology", "Gobierno por criterio experto y eficiencia.", "Rule by expert criteria and efficiency."),

  // ── Ideas / conceptos ─────────────────────────────────────────────
  N("being", "Ser", "idea", "Aquello por lo que un ente es, y no más bien nada.", "That by which a being is, rather than nothing."),
  N("dasein", "Dasein", "idea", "El ente que se pregunta por su propio ser.", "The being for whom its own being is a question."),
  N("angst", "Angustia", "idea", "Apertura a la finitud y a la nada.", "Openness to finitude and to nothingness."),
  N("technology", "Técnica (Gestell)", "idea", "El mundo revelado como reserva disponible.", "The world revealed as standing reserve."),
  N("will", "Voluntad", "idea", "Impulso ciego que sostiene y desgarra el mundo.", "Blind impulse that sustains and tears the world."),
  N("will_to_power", "Voluntad de poder", "idea", "Todo viviente busca acrecentar su potencia.", "Every living thing seeks to increase its power."),
  N("eternal_return", "Eterno retorno", "idea", "Querer la propia vida infinitas veces.", "Willing one's own life infinitely many times."),
  N("god_dead", "Muerte de Dios", "idea", "El fundamento suprasensible ha perdido fuerza vinculante.", "The suprasensible ground has lost binding force."),
  N("alienation", "Alienación", "idea", "El trabajador se vuelve extraño a su obra y a sí mismo.", "The worker becomes foreign to his work and to himself."),
  N("class_struggle", "Lucha de clases", "idea", "La historia como conflicto de intereses materiales.", "History as conflict of material interests."),
  N("dialectic", "Dialéctica", "idea", "Contradicción que impulsa el movimiento del pensar y de la historia.", "Contradiction driving the movement of thought and history."),
  N("freedom", "Libertad", "idea", "Capacidad de comenzar algo nuevo; también carga.", "Capacity to begin something new; also a burden."),
  N("justice", "Justicia", "idea", "Reparto correcto de bienes, cargas y reconocimiento.", "Right distribution of goods, burdens and recognition."),
  N("suffering", "Sufrimiento", "idea", "Experiencia límite que interroga todo sentido.", "Limit experience that interrogates all meaning."),
  N("faith", "Fe", "idea", "Confianza que excede lo demostrable.", "Trust exceeding the demonstrable."),
  N("other_face", "El Otro (rostro)", "idea", "Interpelación ética irreductible a concepto.", "Ethical summons irreducible to concept."),
  N("natural_law", "Ley natural", "idea", "Orden moral inscrito en la naturaleza racional.", "Moral order inscribed in rational nature."),
  N("cogito", "Cogito", "idea", "Pienso, luego existo: certeza inicial.", "I think, therefore I am: initial certainty."),
  N("substance", "Sustancia", "idea", "Lo que existe por sí y sostiene los accidentes.", "What exists in itself and sustains accidents."),
  N("categorical_imp", "Imperativo categórico", "idea", "Obra según una máxima universalizable.", "Act on a maxim you can universalise."),
  N("social_contract", "Contrato social", "idea", "La autoridad legítima nace del consentimiento.", "Legitimate authority arises from consent."),
  N("power_knowledge", "Poder-saber", "idea", "El saber produce y disciplina sujetos.", "Knowledge produces and disciplines subjects."),
  N("language_limits", "Límites del lenguaje", "idea", "Lo que no puede decirse debe callarse.", "What cannot be said must be passed over in silence."),
  N("greatest_happiness", "Mayor felicidad", "idea", "Criterio agregativo de lo correcto.", "Aggregative criterion of rightness."),
  N("apatheia", "Apatheia", "idea", "Serenidad frente a lo que no depende de nosotros.", "Serenity before what does not depend on us."),
  N("leap_faith", "Salto de fe", "idea", "Decisión sin garantía racional.", "Decision without rational guarantee."),
  N("person_communion", "Persona y comunión", "idea", "Existir es existir en relación.", "To exist is to exist in relation."),
];

export const GRAPH_LINKS: GraphLink[] = [
  // Antigüedad
  { source: "socrates", target: "plato", kind: "influence" },
  { source: "plato", target: "aristotle", kind: "influence" },
  { source: "plato", target: "platonism", kind: "develops" },
  { source: "platonism", target: "augustine", kind: "influence" },
  { source: "aristotle", target: "substance", kind: "develops" },
  { source: "aristotle", target: "scholasticism", kind: "influence" },
  { source: "epictetus", target: "stoicism", kind: "belongs" },
  { source: "stoicism", target: "apatheia", kind: "develops" },
  { source: "pohlenz", target: "stoicism", kind: "develops" },
  { source: "stoicism", target: "freedom", kind: "develops" },

  // Medievo
  { source: "augustine", target: "aquinas", kind: "influence" },
  { source: "aristotle", target: "aquinas", kind: "influence" },
  { source: "maimonides", target: "aquinas", kind: "influence" },
  { source: "aquinas", target: "scholasticism", kind: "belongs" },
  { source: "maimonides", target: "scholasticism", kind: "influence" },
  { source: "aquinas", target: "natural_law", kind: "develops" },
  { source: "aquinas", target: "being", kind: "develops" },
  { source: "aquinas", target: "faith", kind: "develops" },
  { source: "maimonides", target: "faith", kind: "develops" },

  // Racionalismo / empirismo
  { source: "descartes", target: "rationalism", kind: "belongs" },
  { source: "spinoza", target: "rationalism", kind: "belongs" },
  { source: "leibniz", target: "rationalism", kind: "belongs" },
  { source: "rationalism_mind", target: "rationalism", kind: "develops" },
  { source: "descartes", target: "cogito", kind: "develops" },
  { source: "spinoza", target: "substance", kind: "develops" },
  { source: "scholasticism", target: "descartes", kind: "influence" },
  { source: "locke", target: "empiricism", kind: "belongs" },
  { source: "hume", target: "empiricism", kind: "belongs" },
  { source: "empiricism", target: "rationalism", kind: "opposition" },
  { source: "locke", target: "social_contract", kind: "develops" },
  { source: "locke", target: "liberalism", kind: "influence" },
  { source: "hume", target: "kant", kind: "influence" },
  { source: "pascal", target: "faith", kind: "develops" },
  { source: "pascal", target: "rationalism", kind: "opposition" },
  { source: "descartes", target: "pascal", kind: "influence" },

  // Ilustración y idealismo
  { source: "kant", target: "categorical_imp", kind: "develops" },
  { source: "kant", target: "idealism_ger", kind: "influence" },
  { source: "hegel", target: "idealism_ger", kind: "belongs" },
  { source: "hegel", target: "dialectic", kind: "develops" },
  { source: "kant", target: "liberalism", kind: "influence" },
  { source: "smith", target: "liberalism", kind: "influence" },
  { source: "burke", target: "conservatism", kind: "develops" },
  { source: "burke", target: "liberalism", kind: "opposition" },
  { source: "bentham", target: "utilitarianism", kind: "develops" },
  { source: "bentham", target: "greatest_happiness", kind: "develops" },
  { source: "mill", target: "utilitarianism", kind: "belongs" },
  { source: "mill", target: "liberalism", kind: "influence" },
  { source: "utilitarianism", target: "categorical_imp", kind: "opposition" },
  { source: "bentham", target: "justice", kind: "develops" },

  // Marx y la política moderna
  { source: "hegel", target: "marx", kind: "influence" },
  { source: "smith", target: "marx", kind: "influence" },
  { source: "marx", target: "alienation", kind: "develops" },
  { source: "marx", target: "class_struggle", kind: "develops" },
  { source: "marx", target: "dialectic", kind: "develops" },
  { source: "marx", target: "socialism", kind: "influence" },
  { source: "marx", target: "communism", kind: "influence" },
  { source: "socialism", target: "social_democracy", kind: "influence" },
  { source: "socialism", target: "liberalism", kind: "opposition" },
  { source: "communism", target: "anarchism", kind: "opposition" },
  { source: "anarchism", target: "liberalism", kind: "influence" },
  { source: "rawls", target: "justice", kind: "develops" },
  { source: "rawls", target: "social_democracy", kind: "influence" },
  { source: "rawls", target: "liberalism", kind: "belongs" },
  { source: "rawls", target: "utilitarianism", kind: "opposition" },
  { source: "arendt", target: "republicanism", kind: "influence" },
  { source: "arendt", target: "freedom", kind: "develops" },
  { source: "technocracy", target: "republicanism", kind: "opposition" },
  { source: "technology", target: "technocracy", kind: "influence" },

  // Schopenhauer / Nietzsche
  { source: "kant", target: "schopenhauer", kind: "influence" },
  { source: "schopenhauer", target: "will", kind: "develops" },
  { source: "schopenhauer", target: "suffering", kind: "develops" },
  { source: "schopenhauer", target: "nietzsche", kind: "influence" },
  { source: "nietzsche", target: "will_to_power", kind: "develops" },
  { source: "nietzsche", target: "eternal_return", kind: "develops" },
  { source: "nietzsche", target: "god_dead", kind: "develops" },
  { source: "nietzsche", target: "nihilism", kind: "develops" },
  { source: "nietzsche", target: "platonism", kind: "opposition" },
  { source: "nietzsche", target: "utilitarianism", kind: "opposition" },
  { source: "god_dead", target: "nihilism", kind: "influence" },

  // Existencialismo / fenomenología
  { source: "kierkegaard", target: "existentialism", kind: "influence" },
  { source: "kierkegaard", target: "leap_faith", kind: "develops" },
  { source: "kierkegaard", target: "angst", kind: "develops" },
  { source: "kierkegaard", target: "hegel", kind: "opposition" },
  { source: "dostoevsky", target: "existentialism", kind: "influence" },
  { source: "dostoevsky", target: "freedom", kind: "develops" },
  { source: "husserl", target: "phenomenology", kind: "develops" },
  { source: "husserl", target: "heidegger", kind: "influence" },
  { source: "heidegger", target: "phenomenology", kind: "belongs" },
  { source: "heidegger", target: "being", kind: "develops" },
  { source: "heidegger", target: "dasein", kind: "develops" },
  { source: "heidegger", target: "angst", kind: "develops" },
  { source: "heidegger", target: "technology", kind: "develops" },
  { source: "heidegger", target: "existentialism", kind: "influence" },
  { source: "heidegger", target: "sartre", kind: "influence" },
  { source: "sartre", target: "existentialism", kind: "belongs" },
  { source: "sartre", target: "freedom", kind: "develops" },
  { source: "heidegger", target: "levinas", kind: "influence" },
  { source: "levinas", target: "other_face", kind: "develops" },
  { source: "levinas", target: "heidegger", kind: "opposition" },
  { source: "levinas", target: "phenomenology", kind: "belongs" },
  { source: "yannaras", target: "orthodox_theo", kind: "belongs" },
  { source: "yannaras", target: "person_communion", kind: "develops" },
  { source: "heidegger", target: "yannaras", kind: "influence" },
  { source: "yannaras", target: "liberalism", kind: "opposition" },
  { source: "levinas", target: "person_communion", kind: "influence" },

  // Pragmatismo, analítica, postestructuralismo
  { source: "james", target: "pragmatism", kind: "develops" },
  { source: "james", target: "faith", kind: "develops" },
  { source: "pragmatism", target: "empiricism", kind: "influence" },
  { source: "wittgenstein", target: "analytic", kind: "belongs" },
  { source: "wittgenstein", target: "language_limits", kind: "develops" },
  { source: "analytic", target: "phenomenology", kind: "opposition" },
  { source: "nietzsche", target: "foucault", kind: "influence" },
  { source: "foucault", target: "structuralism", kind: "belongs" },
  { source: "foucault", target: "power_knowledge", kind: "develops" },
  { source: "marx", target: "foucault", kind: "influence" },
  { source: "foucault", target: "liberalism", kind: "opposition" },
  { source: "arendt", target: "heidegger", kind: "opposition" },
  { source: "heidegger", target: "arendt", kind: "influence" },
  { source: "augustine", target: "kierkegaard", kind: "influence" },
  { source: "pascal", target: "kierkegaard", kind: "influence" },
  { source: "spinoza", target: "nietzsche", kind: "influence" },
  { source: "aristotle", target: "rawls", kind: "influence" },
  { source: "suffering", target: "faith", kind: "influence" },
  { source: "angst", target: "freedom", kind: "influence" },
];

export const NODE_BY_ID = new Map(GRAPH_NODES.map((n) => [n.id, n]));

export function neighborsOf(id: string) {
  const out: { node: GraphNode; kind: LinkKind; direction: "out" | "in" }[] = [];
  for (const l of GRAPH_LINKS) {
    if (l.source === id) {
      const n = NODE_BY_ID.get(l.target);
      if (n) out.push({ node: n, kind: l.kind, direction: "out" });
    } else if (l.target === id) {
      const n = NODE_BY_ID.get(l.source);
      if (n) out.push({ node: n, kind: l.kind, direction: "in" });
    }
  }
  return out;
}
