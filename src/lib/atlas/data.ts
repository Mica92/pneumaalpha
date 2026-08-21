// Capas nuevas del atlas: grandes dominios y preguntas humanas.
// Los ids de miembros apuntan a entidades ya existentes en knowledge-graph.ts.

import type { LocalizedString } from "@/lib/philosophers";

export type DomainSeed = {
  id: string;
  label: LocalizedString;
  note: LocalizedString;
  members: string[];
};

export const DOMAINS: DomainSeed[] = [
  {
    id: "d_existence",
    label: { es: "Existencia", en: "Existence" },
    note: {
      es: "Estar aquí sin haberlo pedido, y tener que hacer algo con ello.",
      en: "Being here without having asked, and having to do something with it.",
    },
    members: [
      "heidegger",
      "kierkegaard",
      "nietzsche",
      "pascal",
      "sartre",
      "existentialism",
      "being",
      "dasein",
      "angst",
      "freedom",
      "leap_faith",
      "nihilism",
      "transcendence",
    ],
  },
  {
    id: "d_moral",
    label: { es: "Moral", en: "Morality" },
    note: {
      es: "De dónde vienen el bien y el mal, y quién decide.",
      en: "Where good and evil come from, and who decides.",
    },
    members: [
      "nietzsche",
      "kant",
      "bentham",
      "mill",
      "levinas",
      "aquinas",
      "categorical_imp",
      "greatest_happiness",
      "utilitarianism",
      "natural_law",
      "other_face",
      "god_dead",
    ],
  },
  {
    id: "d_politics",
    label: { es: "Política", en: "Politics" },
    note: {
      es: "Cómo se organiza el poder y qué hace con nosotros.",
      en: "How power is organised and what it does to us.",
    },
    members: [
      "marx",
      "hobbes",
      "rawls",
      "schmitt",
      "gramsci",
      "burke",
      "liberalism",
      "socialism",
      "conservatism",
      "anarchism",
      "class_struggle",
      "sovereignty",
      "state_of_exception",
      "democracy",
      "friend_enemy",
    ],
  },
  {
    id: "d_knowledge",
    label: { es: "Conocimiento", en: "Knowledge" },
    note: {
      es: "Hasta dónde podemos saber, y con qué derecho.",
      en: "How far we can know, and by what right.",
    },
    members: [
      "kant",
      "descartes",
      "hume",
      "locke",
      "wittgenstein",
      "husserl",
      "empiricism",
      "rationalism",
      "phenomenology",
      "analytic",
      "cogito",
      "metaphysics_crit",
      "language_limits",
      "positivism",
    ],
  },
  {
    id: "d_reality",
    label: { es: "Realidad", en: "Reality" },
    note: {
      es: "Qué hay realmente detrás de lo que aparece.",
      en: "What is really there behind what appears.",
    },
    members: [
      "plato",
      "aristotle",
      "spinoza",
      "leibniz",
      "hegel",
      "rationalism_mind",
      "substance",
      "dialectic",
      "idealism_ger",
      "platonism",
      "being",
      "will",
    ],
  },
  {
    id: "d_religion",
    label: { es: "Religión", en: "Religion" },
    note: {
      es: "Lo que se cree, se reza y se calla frente a lo sagrado.",
      en: "What is believed, prayed and left unsaid before the sacred.",
    },
    members: [
      "aquinas",
      "maimonides",
      "augustine",
      "eckhart",
      "yannaras",
      "christianity",
      "judaism",
      "islam",
      "buddhism",
      "hinduism",
      "taoism",
      "mysticism",
      "faith",
      "negative_theology",
      "theosis",
      "sacred",
    ],
  },
  {
    id: "d_ethics",
    label: { es: "Ética", en: "Ethics" },
    note: {
      es: "Cómo vivir bien cuando nadie te obliga a hacerlo.",
      en: "How to live well when nobody forces you to.",
    },
    members: [
      "pohlenz",
      "epictetus",
      "aristotle",
      "bentham",
      "levinas",
      "stoicism",
      "apatheia",
      "natural_law",
      "common_good",
      "justice",
    ],
  },
  {
    id: "d_aesthetics",
    label: { es: "Estética", en: "Aesthetics" },
    note: {
      es: "La forma, el estilo y la fuerza sensible de una época.",
      en: "Form, style and the sensuous force of an age.",
    },
    members: [
      "nietzsche",
      "junger",
      "spengler",
      "dostoevsky",
      "romanticism",
      "vitalism",
      "decadence",
      "eternal_return",
      "modernity",
    ],
  },
  {
    id: "d_society",
    label: { es: "Sociedad", en: "Society" },
    note: {
      es: "Lo que la vida en común hace con el individuo.",
      en: "What life in common does to the individual.",
    },
    members: [
      "marx",
      "smith",
      "arendt",
      "foucault",
      "burke",
      "alienation",
      "capitalism",
      "power_knowledge",
      "technology",
      "tradition",
      "communitarianism",
      "progress",
      "total_mobilization",
    ],
  },
  {
    id: "d_mind",
    label: { es: "Mente", en: "Mind" },
    note: {
      es: "Cómo aparece el mundo desde dentro de una conciencia.",
      en: "How the world appears from inside a consciousness.",
    },
    members: [
      "husserl",
      "wittgenstein",
      "james",
      "heidegger",
      "phenomenology",
      "pragmatism",
      "hermeneutics",
      "structuralism",
      "language_limits",
      "interpretation",
      "dasein",
      "difference",
    ],
  },
];

export type QuestionSeed = {
  id: string;
  label: LocalizedString;
  note: LocalizedString;
  related: string[];
};

export const QUESTIONS: QuestionSeed[] = [
  {
    id: "q_free",
    label: { es: "¿Somos realmente libres?", en: "Are we really free?" },
    note: {
      es: "Todo el mundo dice elegir. La pregunta es cuánto de esa elección ya venía decidido.",
      en: "Everyone claims to choose. The question is how much of that choice was already decided.",
    },
    related: ["spinoza", "kant", "nietzsche", "sartre", "freedom", "will", "substance"],
  },
  {
    id: "q_meaning",
    label: {
      es: "¿Qué hace que una vida tenga sentido?",
      en: "What makes a life meaningful?",
    },
    note: {
      es: "Nadie entrega el sentido hecho. Hay que encontrarlo, heredarlo o inventarlo.",
      en: "Nobody hands meaning over ready-made. It must be found, inherited or invented.",
    },
    related: ["aristotle", "heidegger", "nietzsche", "kierkegaard", "dasein", "nihilism", "faith"],
  },
  {
    id: "q_suffer",
    label: { es: "¿Por qué sufrimos?", en: "Why do we suffer?" },
    note: {
      es: "El dolor no es un accidente del vivir: casi todas las filosofías empiezan explicándolo.",
      en: "Pain is no accident of living: nearly every philosophy begins by explaining it.",
    },
    related: ["buddhism", "schopenhauer", "nietzsche", "pohlenz", "suffering", "will", "apatheia"],
  },
  {
    id: "q_god",
    label: { es: "¿Se puede pensar a Dios?", en: "Can God be thought?" },
    note: {
      es: "Creer y entender no son lo mismo, y llevan siglos discutiendo.",
      en: "Believing and understanding are not the same, and have argued for centuries.",
    },
    related: [
      "aquinas",
      "maimonides",
      "pascal",
      "eckhart",
      "negative_theology",
      "faith",
      "god_dead",
    ],
  },
  {
    id: "q_just",
    label: { es: "¿Qué sería una sociedad justa?", en: "What would a just society be?" },
    note: {
      es: "Repartir libertad, riqueza y poder: nadie ha encontrado todavía la fórmula.",
      en: "Sharing freedom, wealth and power: nobody has found the formula yet.",
    },
    related: ["rawls", "marx", "bentham", "burke", "justice", "class_struggle", "equality"],
  },
  {
    id: "q_know",
    label: { es: "¿Podemos conocer el mundo tal como es?", en: "Can we know the world as it is?" },
    note: {
      es: "Entre el mundo y nosotros hay siempre un ojo, una lengua, una época.",
      en: "Between the world and us there is always an eye, a language, an era.",
    },
    related: ["kant", "descartes", "hume", "husserl", "cogito", "metaphysics_crit", "phenomenology"],
  },
  {
    id: "q_other",
    label: { es: "¿Qué le debo al otro?", en: "What do I owe the other?" },
    note: {
      es: "Antes de cualquier contrato, alguien te mira. Ahí empieza la ética.",
      en: "Before any contract, someone looks at you. Ethics begins there.",
    },
    related: ["levinas", "yannaras", "kant", "hobbes", "other_face", "person_communion", "justice"],
  },
  {
    id: "q_death",
    label: { es: "¿Cómo vivir sabiendo que vas a morir?", en: "How to live knowing you will die?" },
    note: {
      es: "La finitud no es un tema más: es lo que da urgencia a todo lo demás.",
      en: "Finitude is not one topic among others: it makes everything else urgent.",
    },
    related: ["heidegger", "epictetus", "pascal", "eckhart", "angst", "apatheia", "transcendence"],
  },
  {
    id: "q_work",
    label: { es: "¿Por qué el trabajo nos vacía?", en: "Why does work empty us out?" },
    note: {
      es: "Pasamos ahí la mayor parte de la vida despierta y casi nunca lo pensamos.",
      en: "We spend most of our waking life there and almost never think about it.",
    },
    related: ["marx", "junger", "heidegger", "alienation", "technology", "capitalism"],
  },
  {
    id: "q_truth",
    label: { es: "¿Existe la verdad o solo interpretaciones?", en: "Is there truth, or only readings?" },
    note: {
      es: "Una sospecha moderna que sigue sin resolverse.",
      en: "A modern suspicion that remains unresolved.",
    },
    related: [
      "nietzsche",
      "foucault",
      "wittgenstein",
      "hegel",
      "interpretation",
      "power_knowledge",
      "language_limits",
    ],
  },
  {
    id: "q_change",
    label: { es: "¿Puede cambiar de verdad una persona?", en: "Can a person really change?" },
    note: {
      es: "Todos lo intentamos; la filosofía discute si es posible y a qué precio.",
      en: "We all try; philosophy argues whether it is possible, and at what cost.",
    },
    related: ["nietzsche", "kierkegaard", "pohlenz", "eckhart", "will_to_power", "leap_faith"],
  },
  {
    id: "q_tech",
    label: { es: "¿Nos está transformando la técnica?", en: "Is technology transforming us?" },
    note: {
      es: "No es solo una herramienta: organiza cómo vemos el mundo entero.",
      en: "Not just a tool: it organises how we see the whole world.",
    },
    related: ["heidegger", "junger", "spengler", "foucault", "technology", "total_mobilization"],
  },
];
