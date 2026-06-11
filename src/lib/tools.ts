// Herramientas de autoayuda — ejercicios guiados, claros y útiles.
// Conservamos los mismos IDs para no romper rutas existentes,
// pero el lenguaje y el enfoque son cotidianos, no filosóficos.

import type { LocalizedString } from "@/lib/philosophers";

export type ToolId = "socratic" | "occam" | "charity" | "epoche";

export type PhilTool = {
  id: ToolId;
  emoji: string;
  name: LocalizedString;
  tagline: LocalizedString; // ≤ 30 chars
  intro: LocalizedString;
  transition: LocalizedString;
  firstQuestion: LocalizedString;
  guide: { es: string[]; en: string[] };
  responses: { es: string[]; en: string[] };
};

export const TOOLS: PhilTool[] = [
  {
    id: "socratic",
    emoji: "💭",
    name: { es: "Pensar más claro", en: "Think it through" },
    tagline: { es: "Ordena lo que piensas", en: "Sort out your thoughts" },
    intro: {
      es: "Cuéntame qué te está dando vueltas en la cabeza. Vamos a ordenarlo juntos, paso a paso.",
      en: "Tell me what's been going around in your head. Let's sort it out together, step by step.",
    },
    transition: {
      es: "Cambiemos a **Pensar más claro**. Cuéntame qué te ronda y te ayudo a ordenarlo.",
      en: "Let's switch to **Think it through**. Tell me what's on your mind and I'll help you sort it.",
    },
    firstQuestion: {
      es: "Hay algo que me repito todo el tiempo y ya no sé si es verdad. ¿Me ayudas a verlo con calma?",
      en: "There's something I keep telling myself and I don't know if it's true anymore. Can you help me look at it calmly?",
    },
    guide: {
      es: [
        "En una frase corta, ¿qué es lo que te repites?",
        "¿Qué pasó hoy o esta semana que te hizo pensarlo?",
        "¿Qué pruebas tienes de que es cierto? ¿Y de que no lo es?",
        "Si tu mejor amigo te dijera lo mismo, ¿qué le responderías?",
        "Reescribe esa frase de una forma más justa contigo.",
      ],
      en: [
        "In one short sentence, what do you keep telling yourself?",
        "What happened today or this week that triggered it?",
        "What proof do you have it's true? And that it isn't?",
        "If your best friend said the same thing, what would you reply?",
        "Rewrite that sentence in a way that's fairer to you.",
      ],
    },
    responses: {
      es: [
        "Vamos despacio. ¿Puedes decirlo en una frase corta?",
        "¿Eso es un hecho, o más bien algo que estás temiendo?",
        "¿Qué te hace pensar que es así? Cuéntame un ejemplo concreto.",
        "Si fuera al revés, ¿qué cambiaría para ti hoy?",
        "¿Es algo que crees tú, o algo que te dijeron y aceptaste?",
        "Si tu mejor amigo te contara esto mismo, ¿qué le dirías?",
        "¿Qué parte de esto depende de ti, y qué parte no?",
        "Probemos algo: di la misma idea, pero con más cariño hacia ti.",
        "¿Estás describiendo lo que pasó, o lo que sentiste que pasó?",
        "¿Esto te ayuda a moverte, o sólo te deja dando vueltas?",
        "Si dejaras de creerlo por una semana, ¿qué harías distinto?",
      ],
      en: [
        "Let's slow down. Can you say it in one short sentence?",
        "Is that a fact, or more something you're afraid of?",
        "What makes you think so? Tell me one concrete example.",
        "If it were the opposite, what would change for you today?",
        "Is it something you actually believe, or something you were told and accepted?",
        "If your best friend told you this, what would you say back?",
        "What part of this depends on you, and what part doesn't?",
        "Let's try something: say the same idea, but kinder to yourself.",
        "Are you describing what happened, or what it felt like?",
        "Does this help you move, or does it just keep you spinning?",
        "If you stopped believing it for a week, what would you do differently?",
      ],
    },
  },
  {
    id: "occam",
    emoji: "✂️",
    name: { es: "Simplificar", en: "Keep it simple" },
    tagline: { es: "Quita lo que sobra", en: "Cut what's extra" },
    intro: {
      es: "Cuéntame la situación sin filtros. Vamos a quitarle el ruido y quedarnos con lo importante.",
      en: "Tell me the situation, no filter. We'll strip the noise and keep what matters.",
    },
    transition: {
      es: "Cambiemos a **Simplificar**. Cuéntamelo y vamos a quitar lo que sobra.",
      en: "Let's switch to **Keep it simple**. Tell me, and we'll cut what's extra.",
    },
    firstQuestion: {
      es: "Llevo días dándole vueltas a algo y no logro decidir. ¿Me ayudas a simplificarlo?",
      en: "I've been spinning on something for days and can't decide. Can you help me simplify it?",
    },
    guide: {
      es: [
        "Cuéntame qué pasa, en una sola frase, sin justificar nada.",
        "Anota todas las posibles explicaciones que se te han ocurrido.",
        "¿Cuál de ellas necesita menos suposiciones? Suele ser la verdadera.",
        "Tacha las que dependen de adivinar qué piensa el otro.",
        "Con lo que queda, ¿cuál es el primer paso pequeño que sí puedes dar hoy?",
      ],
      en: [
        "Tell me what's going on, in one sentence, no justifying.",
        "List every possible explanation you've considered.",
        "Which one needs the fewest assumptions? That's usually the real one.",
        "Cross out the ones that depend on guessing what someone else thinks.",
        "With what's left, what's one small step you can actually take today?",
      ],
    },
    responses: {
      es: [
        "Le estás dando muchas vueltas. ¿Cuál es la explicación más simple?",
        "Quita las interpretaciones por un momento. ¿Qué pasó, de verdad?",
        "¿Es un problema, o son varios problemas mezclados?",
        "Si tuvieras que resumirlo a alguien en 10 segundos, ¿qué dirías?",
        "Casi siempre la respuesta sencilla acierta más que la dramática.",
        "Antes de buscar segundas intenciones, prueba la opción obvia.",
        "¿Cuál es la acción más pequeña que cambiaría algo hoy?",
        "Las explicaciones largas tranquilizan, pero rara vez son ciertas.",
        "Si quitaras la mitad de los detalles, ¿el problema seguiría siendo un problema?",
        "Probablemente nadie está conspirando. Probablemente todos están ocupados.",
        "Vamos a separar lo urgente, lo importante y lo que sólo te pesa.",
      ],
      en: [
        "You're overthinking it. What's the simplest explanation?",
        "Drop the interpretations for a second. What actually happened?",
        "Is it one problem, or several problems tangled together?",
        "If you had to sum it up in 10 seconds, what would you say?",
        "The simple answer is right more often than the dramatic one.",
        "Before assuming bad intentions, try the obvious option.",
        "What's the smallest action that would change something today?",
        "Long explanations feel comforting, but they're rarely true.",
        "If you removed half the details, would it still be a problem?",
        "Probably no one's conspiring. Probably everyone is just busy.",
        "Let's separate what's urgent, what's important, and what just weighs on you.",
      ],
    },
  },
  {
    id: "charity",
    emoji: "🤝",
    name: { es: "Ver al otro", en: "See the other side" },
    tagline: { es: "Salir del enojo", en: "Step out of anger" },
    intro: {
      es: "Cuéntame qué te dolió. Sin minimizarlo. Después, intentaremos verlo desde la otra parte.",
      en: "Tell me what hurt you. Without minimizing it. Then we'll try to see it from the other side.",
    },
    transition: {
      es: "Cambiemos a **Ver al otro**. Cuéntame qué pasó y miramos la situación desde fuera.",
      en: "Let's switch to **See the other side**. Tell me what happened and we'll look at it from outside.",
    },
    firstQuestion: {
      es: "Alguien me hizo algo que me dolió y no puedo dejar de darle vueltas. ¿Cómo lo veo sin tanta rabia?",
      en: "Someone did something that hurt me and I can't stop thinking about it. How do I see it without so much anger?",
    },
    guide: {
      es: [
        "Cuenta lo que pasó como se lo contarías a un amigo, con tu queja completa.",
        "Ahora cuéntalo como lo contaría la otra persona, en su mejor versión.",
        "¿Qué pudo estar sintiendo el otro, aunque lo expresara mal?",
        "¿Qué parte de tu reacción viene de algo viejo, no de hoy?",
        "Después de mirarlo así, ¿qué quieres hacer con esto?",
      ],
      en: [
        "Tell what happened like you'd tell a friend — full complaint included.",
        "Now tell it as the other person would, in their best version.",
        "What might the other person have been feeling, even if poorly expressed?",
        "What part of your reaction comes from something old, not today?",
        "After looking at it this way, what do you want to do with it?",
      ],
    },
    responses: {
      es: [
        "Antes de juzgar, prueba esto: ¿cuál sería la intención más generosa detrás de lo que hizo?",
        "Esa persona también está peleando una batalla que tú no ves.",
        "Tu enojo es legítimo. Y aun así, puede haber otra lectura.",
        "Si lo dicho fuera dicho con cariño, ¿qué querría decir?",
        "Cambia 'no le importo' por 'no supo cómo demostrarlo'. ¿Se siente distinto?",
        "¿Qué versión de la historia te cuesta menos cargar?",
        "El otro no es el malo de la película. Es alguien que también se defiende como puede.",
        "¿Y si lo que te dijo no fue contra ti, sino desde su propio miedo?",
        "Entender no es justificar. Es dejar de gastarte tanto.",
        "Si tú estuvieras en su lugar, con su historia, ¿qué habrías hecho?",
        "¿Quieres tener razón, o quieres estar en paz? A veces no es lo mismo.",
      ],
      en: [
        "Before you judge, try this: what would be the most generous intention behind what they did?",
        "That person is also fighting a battle you don't see.",
        "Your anger is valid. And still, there might be another reading.",
        "If what was said had been said with care, what would it mean?",
        "Swap 'they don't care about me' for 'they didn't know how to show it'. Does it feel different?",
        "Which version of the story costs you less to carry?",
        "The other isn't the villain. They're someone defending themselves as they can.",
        "What if what they said wasn't against you, but from their own fear?",
        "Understanding isn't justifying. It's just spending less of yourself.",
        "If you were in their place, with their history, what would you have done?",
        "Do you want to be right, or do you want to be at peace? Sometimes it's not the same.",
      ],
    },
  },
  {
    id: "epoche",
    emoji: "⏸️",
    name: { es: "Pausa", en: "Pause" },
    tagline: { es: "Respira antes de actuar", en: "Breathe before acting" },
    intro: {
      es: "Antes de decidir nada, paremos. ¿Qué estás sintiendo justo ahora, en el cuerpo?",
      en: "Before deciding anything, let's stop. What are you feeling right now, in your body?",
    },
    transition: {
      es: "Cambiemos a **Pausa**. No hay que resolver nada todavía. Sólo mirar.",
      en: "Let's switch to **Pause**. Nothing to solve yet. Just look.",
    },
    firstQuestion: {
      es: "Siento que necesito reaccionar ya y tengo miedo de equivocarme. ¿Me ayudas a parar un momento?",
      en: "I feel I need to react right now and I'm scared of getting it wrong. Can you help me pause for a moment?",
    },
    guide: {
      es: [
        "Respira hondo una vez. ¿Dónde sientes la tensión en el cuerpo?",
        "Nombra la emoción principal con una sola palabra.",
        "¿Qué estabas a punto de hacer o decir? Déjalo en pausa.",
        "Si esperaras 24 horas, ¿qué cambiaría?",
        "Decide sólo lo siguiente: ¿qué necesitas ahora — descanso, hablar, o información?",
      ],
      en: [
        "Take one deep breath. Where do you feel the tension in your body?",
        "Name the main emotion with a single word.",
        "What were you about to do or say? Put it on pause.",
        "If you waited 24 hours, what would change?",
        "Decide only the next thing: what do you need now — rest, to talk, or information?",
      ],
    },
    responses: {
      es: [
        "Para. No tienes que decidir nada ahora mismo.",
        "Respira. Una vez más. Lo urgente casi nunca es tan urgente.",
        "¿Qué sientes en el cuerpo? Empieza por ahí, no por la cabeza.",
        "Antes de explicarte lo que sientes, sólo quédate con eso un momento.",
        "La emoción no te pide actuar. Te pide atención.",
        "¿Qué pasaría si dejaras esto reposar un día entero?",
        "Si reaccionas ahora, ¿lo harás desde la calma o desde el miedo?",
        "Pon entre paréntesis tu primera reacción. ¿Qué queda debajo?",
        "Lo que ahora se ve enorme, mañana tendrá otro tamaño.",
        "Parar no es huir. Es hacer espacio para responder mejor.",
        "Antes de mandar ese mensaje, espera. ¿Sigue siendo lo que quieres decir?",
      ],
      en: [
        "Stop. You don't have to decide anything right now.",
        "Breathe. One more time. What feels urgent almost never is.",
        "What do you feel in your body? Start there, not in your head.",
        "Before explaining what you feel, just stay with it for a moment.",
        "The emotion isn't asking you to act. It's asking for attention.",
        "What would happen if you let this rest for a whole day?",
        "If you react now, will it come from calm or from fear?",
        "Bracket your first reaction. What's underneath it?",
        "What looks huge now will have a different size tomorrow.",
        "Pausing isn't fleeing. It's making space to respond better.",
        "Before sending that message, wait. Is it still what you want to say?",
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
