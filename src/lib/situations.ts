import type { LocalizedString } from "@/lib/discovery";

/**
 * Entradas por situación: puertas de entrada al producto desde la vida real,
 * no segmentos de audiencia. Cada una tiene página propia e indexable.
 */
export type Situation = {
  id: string;
  title: LocalizedString;
  /** Frase corta que la persona reconoce como suya. */
  claim: LocalizedString;
  /** Qué suele estar ocurriendo debajo. */
  body: LocalizedString;
  /** Tensiones que Pneum suele encontrar en esta situación. */
  tensions: LocalizedString[];
  /** Pregunta con la que se abre el Oráculo. */
  starter: LocalizedString;
  /** Meta descripción de la página. */
  meta: LocalizedString;
};

export const SITUATIONS: Situation[] = [
  {
    id: "decision-dificil",
    title: { es: "Tengo que tomar una decisión difícil", en: "I have a hard decision to make" },
    claim: {
      es: "Llevo días dándole vueltas y no avanzo.",
      en: "I have been turning it over for days and I am not moving.",
    },
    body: {
      es: "Cuando una decisión no avanza, rara vez falta información: suele faltar claridad sobre qué se está poniendo en juego. Pneum toma la decisión tal como la estás formulando, muestra los supuestos que la sostienen y la confronta con perspectivas que valorarían cosas distintas.",
      en: "When a decision stalls, information is rarely what is missing: what is missing is clarity about what is at stake. Pneum takes the decision as you are formulating it, shows the assumptions holding it up and sets it against perspectives that would value different things.",
    },
    tensions: [
      { es: "Seguridad frente a sentido", en: "Security against meaning" },
      { es: "Lo que quieres frente a lo que debes", en: "What you want against what you owe" },
      { es: "Decidir ahora frente a decidir bien", en: "Deciding now against deciding well" },
    ],
    starter: {
      es: "Tengo que tomar una decisión y no logro decidirme.",
      en: "I have a decision to make and I cannot settle it.",
    },
    meta: {
      es: "Piensa una decisión difícil desde perspectivas que no están de acuerdo entre sí. Supuestos, tensiones y una pregunta mejor antes de decidir.",
      en: "Think a hard decision through perspectives that disagree with each other. Assumptions, tensions and a better question before you decide.",
    },
  },
  {
    id: "cambiar-de-trabajo",
    title: { es: "No sé si debo cambiar de trabajo", en: "I do not know whether to change jobs" },
    claim: {
      es: "Quiero irme, pero también quiero quedarme.",
      en: "I want to leave, and I also want to stay.",
    },
    body: {
      es: "La pregunta casi nunca es solo laboral. Debajo suele haber ideas sobre identidad, libertad, riesgo y qué cuenta como una vida bien empleada. Pneum separa esas capas y te muestra cuál es la que realmente estás decidiendo.",
      en: "The question is almost never only about work. Underneath there are usually ideas about identity, freedom, risk and what counts as a well-spent life. Pneum separates those layers and shows you which one you are actually deciding.",
    },
    tensions: [
      { es: "Identidad y ocupación", en: "Identity and occupation" },
      { es: "Riesgo y responsabilidad", en: "Risk and responsibility" },
      { es: "Sentido del trabajo", en: "The meaning of work" },
    ],
    starter: {
      es: "Quiero renunciar, pero necesito el sueldo.",
      en: "I want to quit, but I need the salary.",
    },
    meta: {
      es: "Pensar si cambiar de trabajo sin recibir otro consejo: supuestos, tensiones y perspectivas filosóficas confrontadas.",
      en: "Think through changing jobs without getting another piece of advice: assumptions, tensions and philosophical perspectives in contrast.",
    },
  },
  {
    id: "entender-una-relacion",
    title: { es: "Estoy intentando entender una relación", en: "I am trying to understand a relationship" },
    claim: {
      es: "No sé qué está pasando realmente entre nosotros.",
      en: "I do not know what is really happening between us.",
    },
    body: {
      es: "Las relaciones se piensan mal cuando se discuten solo en términos de quién tiene razón. Pneum trabaja sobre lo que estás dando por supuesto: qué esperabas, qué reconoces en el otro y qué estás llamando amor, deber o costumbre.",
      en: "Relationships are thought through badly when they are argued only in terms of who is right. Pneum works on what you are assuming: what you expected, what you recognise in the other person and what you are calling love, duty or habit.",
    },
    tensions: [
      { es: "Reconocimiento y deseo", en: "Recognition and desire" },
      { es: "Libertad y compromiso", en: "Freedom and commitment" },
      { es: "Lo dicho y lo esperado", en: "What is said and what is expected" },
    ],
    starter: {
      es: "Quiero entender qué está pasando en esta relación.",
      en: "I want to understand what is happening in this relationship.",
    },
    meta: {
      es: "Examinar una relación con más claridad: supuestos, expectativas y perspectivas distintas sobre amor, reconocimiento y libertad.",
      en: "Examine a relationship with more clarity: assumptions, expectations and different perspectives on love, recognition and freedom.",
    },
  },
  {
    id: "justificando-una-decision",
    title: {
      es: "Creo que estoy justificando algo que ya decidí",
      en: "I think I am justifying something I already decided",
    },
    claim: {
      es: "Busco razones, no estoy pensando.",
      en: "I am looking for reasons, not thinking.",
    },
    body: {
      es: "Buscar argumentos para una conclusión que ya tienes es distinto de examinarla. Pneum expone el supuesto que sostiene tu conclusión y lo pone frente a perspectivas que partirían de otro lugar, para que la decisión quede examinada y no solo defendida.",
      en: "Looking for arguments for a conclusion you already hold is different from examining it. Pneum exposes the assumption holding your conclusion up and sets it against perspectives that would start elsewhere, so the decision is examined and not only defended.",
    },
    tensions: [
      { es: "Razón y racionalización", en: "Reason and rationalisation" },
      { es: "Coherencia y honestidad", en: "Consistency and honesty" },
      { es: "Lo cómodo y lo verdadero", en: "The comfortable and the true" },
    ],
    starter: {
      es: "Creo que ya decidí y solo estoy buscando razones.",
      en: "I think I already decided and I am only looking for reasons.",
    },
    meta: {
      es: "Distinguir pensar de justificar: Pneum expone el supuesto detrás de una conclusión que ya tomaste.",
      en: "Tell thinking apart from justifying: Pneum exposes the assumption behind a conclusion you already reached.",
    },
  },
  {
    id: "examinar-una-idea",
    title: { es: "Quiero examinar una idea", en: "I want to examine an idea" },
    claim: {
      es: "Suena bien, pero quiero saber si se sostiene.",
      en: "It sounds right, but I want to know whether it holds.",
    },
    body: {
      es: "Sirve para una tesis, un argumento público, un texto ajeno o una convicción propia. Pneum identifica conceptos, supuestos y saltos, y contrasta la idea con tradiciones que la someterían a pruebas distintas.",
      en: "Useful for a thesis, a public argument, someone else's text or a conviction of your own. Pneum identifies concepts, assumptions and gaps, and contrasts the idea with traditions that would test it differently.",
    },
    tensions: [
      { es: "Evidencia y persuasión", en: "Evidence and persuasion" },
      { es: "Definición y uso", en: "Definition and use" },
      { es: "Principio y consecuencia", en: "Principle and consequence" },
    ],
    starter: {
      es: "Quiero examinar esta idea y ver si se sostiene.",
      en: "I want to examine this idea and see whether it holds.",
    },
    meta: {
      es: "Examinar una idea o un argumento: conceptos, supuestos, saltos y tradiciones que lo pondrían a prueba.",
      en: "Examine an idea or argument: concepts, assumptions, gaps and traditions that would put it to the test.",
    },
  },
  {
    id: "entender-un-conflicto",
    title: { es: "Quiero entender un conflicto", en: "I want to understand a conflict" },
    claim: {
      es: "Cada parte tiene razones y no avanzamos.",
      en: "Each side has reasons and we are not moving.",
    },
    body: {
      es: "Un conflicto rara vez se resuelve repitiendo posiciones. Pneum separa la posición del supuesto que la sostiene y muestra dónde está la contradicción real, que casi nunca está donde se discute.",
      en: "A conflict is rarely resolved by repeating positions. Pneum separates the position from the assumption holding it up and shows where the real contradiction is, which is almost never where the argument happens.",
    },
    tensions: [
      { es: "Justicia y poder", en: "Justice and power" },
      { es: "Interés y principio", en: "Interest and principle" },
      { es: "Lo individual y lo común", en: "The individual and the common" },
    ],
    starter: {
      es: "Quiero entender el conflicto que tengo con alguien.",
      en: "I want to understand the conflict I am having with someone.",
    },
    meta: {
      es: "Entender un conflicto desde sus supuestos: dónde está la contradicción real y qué perspectivas la iluminan.",
      en: "Understand a conflict from its assumptions: where the real contradiction lies and which perspectives illuminate it.",
    },
  },
];

export function situationById(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id);
}
