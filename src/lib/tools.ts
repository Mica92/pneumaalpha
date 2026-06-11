// Kit de herramientas filosóficas — modo alternativo al diálogo con un filósofo.
// Respuestas simuladas (no IA) por herramienta. Bilingüe ES/EN.

import type { LocalizedString } from "@/lib/philosophers";

export type ToolId = "socratic" | "occam" | "charity" | "epoche";

export type PhilTool = {
  id: ToolId;
  emoji: string;
  name: LocalizedString;
  tagline: LocalizedString; // ≤ 30 chars
  intro: LocalizedString;   // primera línea al abrir
  transition: LocalizedString; // mensaje sistema al cambiar a esta herramienta
  // Sugerencia de primera pregunta para arrancar más hondo (botón "Empezar guiado").
  firstQuestion: LocalizedString;
  // Guía paso a paso: una secuencia de prompts/preguntas que el usuario puede
  // tocar para avanzar hacia mejores respuestas con el método activo.
  guide: { es: string[]; en: string[] };
  responses: { es: string[]; en: string[] };
};

export const TOOLS: PhilTool[] = [
  {
    id: "socratic",
    emoji: "🧠",
    name: { es: "Método socrático", en: "Socratic method" },
    tagline: { es: "Cuestiona tus creencias", en: "Question your beliefs" },
    intro: {
      es: "Comencemos por una pregunta. ¿Qué creencia tuya quieres examinar hoy?",
      en: "Let's begin with a question. Which of your beliefs would you like to examine today?",
    },
    transition: {
      es: "Ahora aplicaré el **método socrático**. Cuéntame tu inquietud desde este enfoque — y prepárate para que te pregunte.",
      en: "I will now apply the **Socratic method**. Tell me your concern from this lens — and be ready for questions.",
    },
    firstQuestion: {
      es: "Hay una creencia que sostengo desde hace tiempo y no sé si es mía o heredada. ¿Por dónde empiezo a examinarla?",
      en: "There's a belief I've held for a long time and I don't know if it's mine or inherited. Where do I start examining it?",
    },
    guide: {
      es: [
        "Nombra en una frase la creencia que quieres examinar.",
        "¿Qué evidencias concretas la sostienen?",
        "¿Qué evidencias la contradicen y has preferido ignorar?",
        "Formula la creencia opuesta. ¿Qué tendría de cierto?",
        "Reescribe tu creencia con lo que aprendiste en estos pasos.",
      ],
      en: [
        "Name in one sentence the belief you want to examine.",
        "What concrete evidence supports it?",
        "What evidence contradicts it that you've preferred to ignore?",
        "State the opposite belief. What might be true in it?",
        "Rewrite your belief with what you learned in these steps.",
      ],
    },
    responses: {
      es: [
        "¿Qué pruebas tienes de que eso es cierto?",
        "¿Cómo llegaste a esa conclusión?",
        "¿Qué alternativas podrías considerar?",
        "Si alguien sostuviera lo contrario, ¿qué argumento usaría?",
        "¿Estás describiendo lo que es, o lo que temes que sea?",
        "¿De dónde aprendiste a pensar así sobre esto?",
        "¿Qué pasaría si esa creencia fuera falsa?",
        "¿Distingues entre lo que sientes y lo que sabes?",
        "¿Qué supuesto está debajo de esa afirmación?",
        "¿Qué cambiaría en tu vida si dejaras de creer eso?",
        "¿Esa idea te sirve, o sólo te protege?",
      ],
      en: [
        "What evidence do you have that this is true?",
        "How did you arrive at that conclusion?",
        "What alternatives could you consider?",
        "If someone held the opposite, what argument would they use?",
        "Are you describing what is, or what you fear it might be?",
        "Where did you learn to think this way about it?",
        "What would happen if that belief were false?",
        "Do you distinguish between what you feel and what you know?",
        "What assumption lies beneath that statement?",
        "What would change in your life if you stopped believing this?",
        "Does that idea serve you, or only protect you?",
      ],
    },
  },
  {
    id: "occam",
    emoji: "🪒",
    name: { es: "Navaja de Occam", en: "Occam's razor" },
    tagline: { es: "Encuentra la solución simple", en: "Find the simplest answer" },
    intro: {
      es: "Cuéntame la situación. Buscaremos juntos la explicación más simple que la sostenga.",
      en: "Tell me the situation. Together we will look for the simplest explanation that holds it.",
    },
    transition: {
      es: "Ahora aplicaré la **navaja de Occam**. Cuéntame tu inquietud — quitaremos lo que sobre.",
      en: "I will now apply **Occam's razor**. Tell me your concern — we will cut what doesn't belong.",
    },
    firstQuestion: {
      es: "Estoy dándole vueltas a una situación con demasiadas interpretaciones posibles. ¿Cómo encuentro la explicación más simple?",
      en: "I'm overthinking a situation with too many possible interpretations. How do I find the simplest explanation?",
    },
    guide: {
      es: [
        "Describe la situación en una sola frase, sin adjetivos.",
        "Enumera todas las explicaciones posibles que se te ocurren.",
        "¿Cuál de ellas exige menos suposiciones?",
        "Tacha las que requieren coincidencias, intenciones ocultas o conspiraciones.",
        "Con lo que queda, ¿cuál es la acción mínima que cambia algo hoy?",
      ],
      en: [
        "Describe the situation in a single sentence, without adjectives.",
        "List every possible explanation you can think of.",
        "Which of them requires the fewest assumptions?",
        "Cross out the ones requiring coincidences, hidden motives or conspiracies.",
        "With what remains, what's the smallest action that changes something today?",
      ],
    },
    responses: {
      es: [
        "Estás añadiendo causas que no necesitas. ¿Cuál es la explicación más simple?",
        "Si quitas las interpretaciones, ¿qué hecho desnudo queda?",
        "Hay dos hipótesis: la simple y la dramática. La simple casi siempre acierta.",
        "¿Qué pasaría si la respuesta no fuera tan compleja como parece?",
        "Reduce el problema a una sola frase. Hazlo ahora.",
        "Lo que llamas 'todo está conectado' suele ser sólo una coincidencia.",
        "Antes de buscar el motivo oculto, descarta el motivo obvio.",
        "¿Cuál es la acción mínima que cambiaría la situación?",
        "Las explicaciones largas tranquilizan, pero rara vez son verdaderas.",
        "Si eliminaras la mitad de los detalles, ¿el problema seguiría existiendo?",
        "Probablemente nadie está conspirando. Probablemente todos están distraídos.",
      ],
      en: [
        "You're adding causes you don't need. What is the simplest explanation?",
        "If you remove the interpretations, what bare fact remains?",
        "There are two hypotheses: the simple one and the dramatic one. The simple one is usually right.",
        "What if the answer were not as complex as it seems?",
        "Reduce the problem to a single sentence. Do it now.",
        "What you call 'everything is connected' is often just coincidence.",
        "Before looking for the hidden motive, rule out the obvious one.",
        "What is the smallest action that would change the situation?",
        "Long explanations comfort us, but they're rarely true.",
        "If you removed half the details, would the problem still exist?",
        "Probably no one is conspiring. Probably everyone is distracted.",
      ],
    },
  },
  {
    id: "charity",
    emoji: "🤝",
    name: { es: "Principio de caridad", en: "Principle of charity" },
    tagline: { es: "Interpreta con generosidad", en: "Interpret generously" },
    intro: {
      es: "Cuéntame qué te molestó. Reformulemos la otra parte en su versión más razonable.",
      en: "Tell me what bothered you. Let's reframe the other side in its most reasonable form.",
    },
    transition: {
      es: "Ahora aplicaré el **principio de caridad**. Cuéntame tu inquietud — interpretaré lo que te ocurre en su versión más fuerte.",
      en: "I will now apply the **principle of charity**. Tell me your concern — I'll interpret it in its strongest form.",
    },
    responses: {
      es: [
        "Antes de juzgar, intentemos esto: ¿cuál sería la intención más generosa detrás de lo que hizo?",
        "Esa persona también está librando una batalla que no ves.",
        "Tu queja, en su versión más fuerte, es legítima. Y aun así, hay otra lectura.",
        "Si interpretaras sus palabras con cariño, ¿qué dirían?",
        "Reformúlalo: en lugar de 'no le importo', prueba 'no supo cómo mostrarlo'.",
        "¿Qué versión de la historia te haría perder menos energía?",
        "El otro no es un personaje. Es alguien que también se defiende como puede.",
        "¿Y si lo que te dijo no fue contra ti, sino desde su propio miedo?",
        "La caridad no es ingenuidad. Es exigirte ver con más nitidez antes de condenar.",
        "Prueba a explicar lo que pasó como lo explicaría alguien que lo quiere bien.",
        "Si tú estuvieras en su lugar, con sus heridas, ¿qué habrías hecho distinto?",
      ],
      en: [
        "Before judging, try this: what would be the most generous intention behind what they did?",
        "That person is also fighting a battle you can't see.",
        "Your complaint, in its strongest form, is legitimate. And still, there is another reading.",
        "If you interpreted their words with care, what would they say?",
        "Reframe it: instead of 'they don't care about me', try 'they didn't know how to show it'.",
        "Which version of the story would cost you less energy?",
        "The other is not a character. They are someone defending themselves as they can.",
        "What if what they said wasn't against you, but from their own fear?",
        "Charity is not naïveté. It's demanding clearer sight before condemning.",
        "Try to explain what happened as someone who loves them would explain it.",
        "If you were in their place, with their wounds, what would you have done differently?",
      ],
    },
  },
  {
    id: "epoche",
    emoji: "⏸️",
    name: { es: "Epojé", en: "Epoché" },
    tagline: { es: "Suspende el juicio", en: "Suspend judgment" },
    intro: {
      es: "Detente un momento. No respondas todavía. ¿Qué estás sintiendo, sin nombrarlo aún?",
      en: "Pause for a moment. Don't answer yet. What are you feeling, before you name it?",
    },
    transition: {
      es: "Ahora aplicaré la **epojé**. Cuéntame tu inquietud — y antes de juzgarla, sólo la miraremos.",
      en: "I will now apply **epoché**. Tell me your concern — and before judging it, we will only look.",
    },
    responses: {
      es: [
        "Suspende, por un instante, la necesidad de tener razón.",
        "No es necesario decidir ahora. Observa lo que aparece, sin moverte.",
        "Lo que llamas certeza, ¿no será sólo una reacción rápida?",
        "Deja la pregunta abierta. Aún no es el momento de cerrarla.",
        "¿Qué pasaría si no opinaras de esto durante un día entero?",
        "Antes de explicarte lo que sientes, simplemente quédate con ello.",
        "La emoción no exige acción inmediata. Sólo atención.",
        "Pon entre paréntesis tu juicio. Mira la situación como si la vieras por primera vez.",
        "¿Qué hay aquí que no estás dispuesto a ver todavía?",
        "Respira. Una vez más. Lo que ahora parece urgente, mañana tendrá otro tamaño.",
        "Suspender no es huir. Es dejar que la cosa se muestre sola.",
      ],
      en: [
        "Suspend, for an instant, the need to be right.",
        "There's no need to decide now. Observe what appears, without moving.",
        "What you call certainty — might it just be a fast reaction?",
        "Leave the question open. It isn't yet time to close it.",
        "What would happen if you held no opinion on this for a whole day?",
        "Before explaining what you feel, simply stay with it.",
        "Emotion does not demand immediate action. Only attention.",
        "Bracket your judgment. See the situation as if for the first time.",
        "What is here that you are not yet willing to see?",
        "Breathe. Once more. What feels urgent now will have a different size tomorrow.",
        "Suspending isn't fleeing. It's letting the thing show itself.",
      ],
    },
  },
];

export const TOOL_MAP: Record<ToolId, PhilTool> = TOOLS.reduce(
  (acc, t) => ((acc[t.id] = t), acc),
  {} as Record<ToolId, PhilTool>,
);

export const isToolId = (s: string): s is ToolId =>
  s === "socratic" || s === "occam" || s === "charity" || s === "epoche";

// Pick a response that doesn't repeat the previous one when possible.
export function pickToolResponse(
  toolId: ToolId,
  lang: "es" | "en",
  previous?: string,
): string {
  const pool = TOOL_MAP[toolId].responses[lang];
  if (pool.length === 0) return "";
  if (pool.length === 1) return pool[0];
  let idx = Math.floor(Math.random() * pool.length);
  if (previous && pool[idx] === previous) idx = (idx + 1) % pool.length;
  return pool[idx];
}
