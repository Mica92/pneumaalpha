/**
 * Contenido del sitio institucional de Kionas (ES/EN).
 * Regla editorial: solo capacidades verificadas en el producto. Nada de clientes,
 * universidades asociadas, testimonios, certificaciones, integraciones ni cifras de impacto.
 */
export type L = { es: string; en: string };

export const INST_NAV: { to: "/plataforma" | "/soluciones" | "/instituciones" | "/metodologia" | "/nosotros"; label: L }[] = [
  { to: "/plataforma", label: { es: "Plataforma", en: "Platform" } },
  { to: "/soluciones", label: { es: "Soluciones", en: "Solutions" } },
  { to: "/instituciones", label: { es: "Instituciones", en: "Institutions" } },
  { to: "/metodologia", label: { es: "Metodología", en: "Methodology" } },
  { to: "/nosotros", label: { es: "Nosotros", en: "About" } },
];

export const CTA = {
  demo: { es: "Solicitar demostración", en: "Request a demo" },
  enter: { es: "Ingresar a Kionas", en: "Enter Kionas" },
  platform: { es: "Conocer la plataforma", en: "Explore the platform" },
  solutions: { es: "Explorar soluciones", en: "Explore solutions" },
  pilot: { es: "Conversemos sobre un piloto", en: "Let’s talk about a pilot" },
  methodology: { es: "Leer la metodología", en: "Read the methodology" },
} satisfies Record<string, L>;

export const BRAND_LINE: L = {
  es: "Plataforma de filosofía aplicada e inteligencia artificial para explorar, desarrollar y ejercitar capacidades de pensamiento.",
  en: "An applied philosophy and artificial intelligence platform to explore, develop and exercise thinking skills.",
};

/* ---------------- Home ---------------- */

export const HERO = {
  eyebrow: { es: "Kionas · Inteligencia para el pensamiento", en: "Kionas · Intelligence for thinking" },
  title: {
    es: "El pensamiento crítico se desarrolla. Kionas lo convierte en experiencia.",
    en: "Critical thinking is developed. Kionas turns it into an experience.",
  },
  lead: {
    es: "Kionas integra filosofía aplicada e inteligencia artificial para explorar ideas, contrastar perspectivas y ejercitar el razonamiento en experiencias educativas.",
    en: "Kionas brings together applied philosophy and artificial intelligence to explore ideas, contrast perspectives and exercise reasoning in educational experiences.",
  },
  tag: {
    es: "Para universidades, colegios y formación profesional · Español e inglés",
    en: "For universities, schools and professional training · Spanish and English",
  },
  caption: {
    es: "Captura real de Kionas: el punto de partida de una exploración.",
    en: "Real Kionas screenshot: where an exploration begins.",
  },
} satisfies Record<string, L>;

export const CHALLENGE = {
  eyebrow: { es: "El desafío educativo", en: "The educational challenge" },
  title: {
    es: "Acceder a información no es lo mismo que saber pensar.",
    en: "Accessing information is not the same as knowing how to think.",
  },
  lead: {
    es: "En una educación atravesada por la inteligencia artificial, comprender, argumentar y cuestionar adquiere una nueva relevancia.",
    en: "In an education shaped by artificial intelligence, understanding, arguing and questioning take on new relevance.",
  },
  items: [
    {
      title: { es: "Analizar ideas con profundidad", en: "Analyse ideas in depth" },
      body: {
        es: "Distinguir conceptos, reconocer supuestos y no quedarse en la primera formulación.",
        en: "Distinguish concepts, recognise assumptions and look past the first formulation.",
      },
    },
    {
      title: { es: "Contrastar argumentos y perspectivas", en: "Contrast arguments and perspectives" },
      body: {
        es: "Poner una misma pregunta frente a tradiciones distintas y ver dónde se tensionan.",
        en: "Place the same question before different traditions and see where they pull apart.",
      },
    },
    {
      title: { es: "Construir criterios propios", en: "Build one’s own judgement" },
      body: {
        es: "Llegar a una interpretación fundamentada sin delegar el juicio en la tecnología.",
        en: "Reach a well-grounded interpretation without delegating judgement to technology.",
      },
    },
  ],
};

export type FeatureKey = "explorar" | "perspectivas" | "ideas" | "mapa" | "editorial" | "dialogos";

export const FEATURES: {
  key: FeatureKey;
  to: "/explorar" | "/comparar" | "/ideas" | "/conocimiento" | "/editorial" | "/dialogos";
  title: L;
  body: L;
  shot: "explorar" | "comparar" | "ideas" | "conocimiento" | "editorial" | "dialogos";
  shotAlt: L;
}[] = [
  {
    key: "explorar",
    to: "/explorar",
    title: { es: "Explorar", en: "Explore" },
    body: {
      es: "Se parte de una pregunta o un problema propio y Kionas propone la perspectiva filosófica más pertinente para examinarlo.",
      en: "Start from a question or problem and Kionas suggests the most relevant philosophical perspective to examine it.",
    },
    shot: "explorar",
    shotAlt: { es: "Pantalla Explorar de Kionas con un campo para escribir una pregunta", en: "Kionas Explore screen with a field to write a question" },
  },
  {
    key: "perspectivas",
    to: "/comparar",
    title: { es: "Perspectivas", en: "Perspectives" },
    body: {
      es: "Una misma pregunta, respondida en paralelo desde varios pensadores, para examinar y contrastar interpretaciones.",
      en: "One question, answered side by side by several thinkers, to examine and contrast interpretations.",
    },
    shot: "comparar",
    shotAlt: { es: "Pantalla Comparar perspectivas con selección de pensadores", en: "Compare perspectives screen with thinker selection" },
  },
  {
    key: "ideas",
    to: "/ideas",
    title: { es: "Ideas", en: "Ideas" },
    body: {
      es: "Conceptos como libertad, poder o sentido, explicados en lenguaje claro y con las preguntas que abren.",
      en: "Concepts such as freedom, power or meaning, explained in plain language with the questions they open.",
    },
    shot: "ideas",
    shotAlt: { es: "Catálogo de ideas de Kionas con tarjetas de conceptos", en: "Kionas idea catalogue with concept cards" },
  },
  {
    key: "mapa",
    to: "/conocimiento",
    title: { es: "Mapa", en: "Map" },
    body: {
      es: "Una red navegable de filósofos, ideas y movimientos conectados por influencia y oposición.",
      en: "A navigable network of philosophers, ideas and movements connected by influence and opposition.",
    },
    shot: "conocimiento",
    shotAlt: { es: "Red de ideas de Kionas con nodos conectados", en: "Kionas idea network with connected nodes" },
  },
  {
    key: "editorial",
    to: "/editorial",
    title: { es: "Editorial", en: "Editorial" },
    body: {
      es: "Lecturas seleccionadas: preguntas, conceptos, ensayos e investigaciones para pensar con más precisión.",
      en: "Selected readings: questions, concepts, essays and research to think more precisely.",
    },
    shot: "editorial",
    shotAlt: { es: "Portada de la sección Editorial de Kionas", en: "Kionas Editorial section front page" },
  },
  {
    key: "dialogos",
    to: "/dialogos",
    title: { es: "Diálogos", en: "Dialogues" },
    body: {
      es: "Conversaciones con corrientes filosóficas en tres modos: dialogar, contrastar o confrontar una tesis.",
      en: "Conversations with philosophical traditions in three modes: converse, contrast or confront a thesis.",
    },
    shot: "dialogos",
    shotAlt: { es: "Catálogo de diálogos filosóficos por corriente", en: "Philosophical dialogues catalogue by tradition" },
  },
];

export const PLATFORM = {
  eyebrow: { es: "La plataforma", en: "The platform" },
  title: { es: "Una plataforma. Distintas maneras de pensar.", en: "One platform. Different ways of thinking." },
  lead: {
    es: "Kionas conecta exploración conceptual, diálogo y reflexión en una experiencia intelectual integrada.",
    en: "Kionas connects conceptual exploration, dialogue and reflection in one integrated intellectual experience.",
  },
  realShot: { es: "Captura real", en: "Real screenshot" },
  open: { es: "Abrir en Kionas", en: "Open in Kionas" },
} satisfies Record<string, L>;

export const STEPS = {
  eyebrow: { es: "Cómo funciona", en: "How it works" },
  title: { es: "Del concepto a la reflexión.", en: "From concept to reflection." },
  note: {
    es: "Cuatro movimientos intelectuales, no un recorrido obligatorio: cada persona entra por donde su pregunta lo pide.",
    en: "Four intellectual movements, not a mandatory path: each person enters wherever their question calls for.",
  },
  items: [
    { title: { es: "Explorar", en: "Explore" }, body: { es: "Comenzar con una idea, una pregunta o un problema.", en: "Begin with an idea, a question or a problem." } },
    { title: { es: "Dialogar", en: "Dialogue" }, body: { es: "Examinar la pregunta desde distintas tradiciones y perspectivas.", en: "Examine the question from different traditions and perspectives." } },
    { title: { es: "Contrastar", en: "Contrast" }, body: { es: "Reconocer tensiones, supuestos y argumentos alternativos.", en: "Recognise tensions, assumptions and alternative arguments." } },
    { title: { es: "Reflexionar", en: "Reflect" }, body: { es: "Construir una interpretación propia más fundamentada.", en: "Build one’s own better-grounded interpretation." } },
  ],
};

export const SEGMENTS = [
  {
    key: "universidades",
    title: { es: "Universidades", en: "Universities" },
    body: {
      es: "Apoyar experiencias de razonamiento, argumentación y diálogo en diferentes carreras.",
      en: "Support reasoning, argumentation and dialogue experiences across degree programmes.",
    },
  },
  {
    key: "colegios",
    title: { es: "Colegios", en: "Schools" },
    body: {
      es: "Explorar conceptos y preguntas complejas mediante experiencias adaptadas al contexto educativo.",
      en: "Explore concepts and complex questions through experiences adapted to the school context.",
    },
  },
  {
    key: "formacion",
    title: { es: "Formación profesional", en: "Professional training" },
    body: {
      es: "Analizar problemas, decisiones y supuestos desde perspectivas interdisciplinarias.",
      en: "Analyse problems, decisions and assumptions from interdisciplinary perspectives.",
    },
  },
] as const;

export const SOLUTIONS_HOME = {
  eyebrow: { es: "Soluciones", en: "Solutions" },
  title: { es: "El pensamiento atraviesa todas las disciplinas.", en: "Thinking runs through every discipline." },
  examplesLabel: { es: "Ejemplos ilustrativos de aplicación", en: "Illustrative examples of use" },
  examplesNote: {
    es: "Ejemplos de uso posibles; no describen implementaciones en instituciones específicas.",
    en: "Possible uses; they do not describe implementations at specific institutions.",
  },
} satisfies Record<string, L>;

export const DISCIPLINES: { area: L; example: L }[] = [
  {
    area: { es: "Ingeniería", en: "Engineering" },
    example: {
      es: "Examinar los supuestos éticos de una decisión técnica: seguridad, riesgo y responsabilidad.",
      en: "Examine the ethical assumptions behind a technical decision: safety, risk and responsibility.",
    },
  },
  {
    area: { es: "Ciencias", en: "Sciences" },
    example: {
      es: "Discutir qué cuenta como evidencia y dónde termina una explicación científica.",
      en: "Discuss what counts as evidence and where a scientific explanation ends.",
    },
  },
  {
    area: { es: "Humanidades", en: "Humanities" },
    example: {
      es: "Leer un concepto —justicia, libertad— desde tradiciones que lo entienden de forma opuesta.",
      en: "Read a concept —justice, freedom— through traditions that understand it in opposite ways.",
    },
  },
  {
    area: { es: "Ciencias sociales", en: "Social sciences" },
    example: {
      es: "Contrastar interpretaciones de un problema público antes de proponer una política.",
      en: "Contrast interpretations of a public problem before proposing a policy.",
    },
  },
];

export const METHOD_HOME = {
  eyebrow: { es: "Nuestro enfoque", en: "Our approach" },
  title: { es: "La tecnología al servicio del juicio humano.", en: "Technology in service of human judgement." },
  lead: {
    es: "Kionas utiliza la filosofía como método para interrogar ideas, hacer visibles los supuestos y ampliar las perspectivas desde las cuales comprendemos el mundo.",
    en: "Kionas uses philosophy as a method to question ideas, make assumptions visible and widen the perspectives from which we understand the world.",
  },
  quote: {
    es: "Una buena pregunta no cierra la conversación: la vuelve más precisa.",
    en: "A good question does not close the conversation: it makes it more precise.",
  },
  quoteSource: { es: "Principio editorial de Kionas", en: "Kionas editorial principle" },
};

export const PRINCIPLES: { title: L; body: L }[] = [
  {
    title: { es: "Preguntas antes que respuestas cerradas", en: "Questions before closed answers" },
    body: {
      es: "La plataforma devuelve tensiones y preguntas mejor formuladas, no veredictos.",
      en: "The platform returns tensions and better-formed questions, not verdicts.",
    },
  },
  {
    title: { es: "Diálogo antes que aceptación pasiva", en: "Dialogue before passive acceptance" },
    body: {
      es: "Cada perspectiva puede ser interrogada, contrastada y confrontada.",
      en: "Every perspective can be questioned, contrasted and confronted.",
    },
  },
  {
    title: { es: "Reflexión antes que conclusiones automáticas", en: "Reflection before automatic conclusions" },
    body: {
      es: "La interpretación final es siempre de la persona que piensa.",
      en: "The final interpretation always belongs to the person thinking.",
    },
  },
];

export const PILOT_HOME = {
  eyebrow: { es: "Colaboración académica", en: "Academic collaboration" },
  title: {
    es: "De una experiencia piloto a una decisión basada en evidencia.",
    en: "From a pilot experience to an evidence-based decision.",
  },
  lead: {
    es: "Trabajamos hacia experiencias piloto que permitan explorar la adopción de Kionas, recoger retroalimentación y evaluar su aplicación en contextos educativos reales.",
    en: "We are working towards pilot experiences that make it possible to explore adopting Kionas, gather feedback and evaluate its use in real educational settings.",
  },
  measuresTitle: { es: "Mediciones propuestas", en: "Proposed measures" },
  measuresNote: {
    es: "Sujetas a validación y diseño conjunto con cada institución.",
    en: "Subject to validation and joint design with each institution.",
  },
};

export const PILOT_STAGES: { title: L; body: L }[] = [
  {
    title: { es: "Definición conjunta", en: "Joint definition" },
    body: {
      es: "Caso de uso, objetivos, participantes y criterios de evaluación acordados con la institución.",
      en: "Use case, objectives, participants and evaluation criteria agreed with the institution.",
    },
  },
  {
    title: { es: "Implementación acotada", en: "Bounded implementation" },
    body: {
      es: "Uso en un curso o grupo definido, con acompañamiento al equipo docente.",
      en: "Use in a defined course or group, with support for the teaching team.",
    },
  },
  {
    title: { es: "Revisión de resultados", en: "Review of results" },
    body: {
      es: "Lectura conjunta de lo observado y evaluación de oportunidades de continuidad.",
      en: "Joint reading of what was observed and evaluation of opportunities to continue.",
    },
  },
];

export const MEASURES: L[] = [
  { es: "Participación y uso", en: "Participation and use" },
  { es: "Actividades completadas", en: "Activities completed" },
  { es: "Calidad argumentativa mediante rúbricas definidas con la institución", en: "Argumentative quality through rubrics defined with the institution" },
  { es: "Percepción de estudiantes y docentes", en: "Student and teacher perception" },
  { es: "Cambios pre/post cuando exista un diseño evaluativo apropiado", en: "Pre/post changes where an appropriate evaluation design exists" },
];

export const VISION = {
  title: { es: "Una educación que enseñe a pensar, no solo a responder.", en: "An education that teaches how to think, not only how to answer." },
  lead: {
    es: "Creemos en una tecnología que amplía las capacidades intelectuales de las personas sin sustituir su autonomía.",
    en: "We believe in technology that expands people’s intellectual capacities without replacing their autonomy.",
  },
} satisfies Record<string, L>;

export const CONTACT = {
  title: { es: "Exploremos cómo Kionas puede aportar a tu institución.", en: "Let’s explore how Kionas can contribute to your institution." },
  lead: {
    es: "Conversemos sobre tus desafíos académicos y las posibilidades de una experiencia piloto.",
    en: "Let’s talk about your academic challenges and the possibilities of a pilot experience.",
  },
} satisfies Record<string, L>;

export const FORM = {
  fullName: { es: "Nombre", en: "Name" },
  email: { es: "Correo institucional", en: "Institutional email" },
  institution: { es: "Institución u organización", en: "Institution or organisation" },
  jobTitle: { es: "Cargo", en: "Role" },
  country: { es: "País", en: "Country" },
  message: { es: "Mensaje breve", en: "Short message" },
  messageHint: { es: "Opcional. ¿Qué te gustaría explorar?", en: "Optional. What would you like to explore?" },
  interest: { es: "Me interesa", en: "I’m interested in" },
  interestDemo: { es: "Una demostración", en: "A demo" },
  interestPilot: { es: "Un piloto", en: "A pilot" },
  consent: {
    es: "Acepto que Kionas use estos datos solo para responder a esta solicitud.",
    en: "I agree that Kionas may use this data only to respond to this request.",
  },
  privacy: {
    es: "Guardamos tu solicitud de forma privada y separada de los datos de uso de la aplicación. No la compartimos con terceros.",
    en: "We store your request privately and separately from app usage data. We do not share it with third parties.",
  },
  privacyLink: { es: "Política de privacidad", en: "Privacy policy" },
  submit: { es: "Solicitar reunión", en: "Request a meeting" },
  sending: { es: "Enviando…", en: "Sending…" },
  required: { es: "obligatorio", en: "required" },
  errors: {
    es: "Revisa los campos marcados.",
    en: "Please check the highlighted fields.",
  },
  fieldError: {
    es: "Completa este campo.",
    en: "Please complete this field.",
  },
  emailError: { es: "Escribe un correo válido.", en: "Enter a valid email." },
  consentError: { es: "Necesitamos tu aceptación para responderte.", en: "We need your consent to reply." },
  rateLimited: {
    es: "Recibimos varias solicitudes desde tu conexión. Inténtalo de nuevo en una hora.",
    en: "We received several requests from your connection. Please try again in an hour.",
  },
  failure: {
    es: "No pudimos registrar tu solicitud. Inténtalo de nuevo en unos minutos.",
    en: "We could not record your request. Please try again in a few minutes.",
  },
  successTitle: { es: "Solicitud registrada", en: "Request received" },
  successBody: {
    es: "Gracias. Revisaremos tu mensaje y te escribiremos al correo indicado.",
    en: "Thank you. We will review your message and write to the email you provided.",
  },
  another: { es: "Enviar otra solicitud", en: "Send another request" },
} as const;

export const FOOTER = {
  groups: [
    {
      title: { es: "Kionas", en: "Kionas" },
      links: [
        { to: "/plataforma", label: { es: "Plataforma", en: "Platform" } },
        { to: "/soluciones", label: { es: "Soluciones", en: "Solutions" } },
        { to: "/instituciones", label: { es: "Instituciones", en: "Institutions" } },
        { to: "/metodologia", label: { es: "Metodología", en: "Methodology" } },
      ],
    },
    {
      title: { es: "Colaborar", en: "Collaborate" },
      links: [
        { to: "/pilotos", label: { es: "Pilotos", en: "Pilots" } },
        { to: "/nosotros", label: { es: "Nosotros", en: "About" } },
        { to: "/contacto", label: { es: "Contacto", en: "Contact" } },
        { to: "/app", label: { es: "Ingresar a Kionas", en: "Enter Kionas" } },
      ],
    },
    {
      title: { es: "Legal", en: "Legal" },
      links: [
        { to: "/privacy", label: { es: "Privacidad", en: "Privacy" } },
        { to: "/terminos", label: { es: "Términos", en: "Terms" } },
        { to: "/uso-de-ia", label: { es: "Uso de IA", en: "AI use" } },
      ],
    },
  ],
} as const;
