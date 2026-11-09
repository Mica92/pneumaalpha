/**
 * Evidencia externa citada en la web institucional.
 * Fuente única para la portada y /evidencia: cada cifra lleva población, año,
 * fuente verificable y advertencia de interpretación. Ninguna cifra describe resultados de Kionas.
 */
import type { L } from "@/lib/institutional-content";

export type EvidenceKind =
  | "assessment" // evaluación estandarizada
  | "meta-analysis"
  | "field-experiment"
  | "survey" // autoinforme
  | "report"
  | "trial"; // ensayo controlado a gran escala

export const KIND_LABEL: Record<EvidenceKind, L> = {
  assessment: { es: "Evaluación internacional estandarizada", en: "International standardised assessment" },
  "meta-analysis": { es: "Metaanálisis", en: "Meta-analysis" },
  "field-experiment": { es: "Experimento de campo", en: "Field experiment" },
  survey: { es: "Encuesta de autoinforme", en: "Self-report survey" },
  report: { es: "Informe institucional", en: "Institutional report" },
  trial: { es: "Ensayo controlado aleatorizado", en: "Randomised controlled trial" },
};

export type SourceId = "pisa2025" | "wei2025" | "bishop2026" | "oecd2022" | "deo2026" | "clemente" | "neh2014" | "eef2021";

export type Source = {
  id: SourceId;
  author: string;
  year: string;
  title: string;
  venue: L;
  kind: EvidenceKind;
  url: string;
  short: L; // cita breve visible bajo cada indicador
};

export const SOURCES: Record<SourceId, Source> = {
  pisa2025: {
    id: "pisa2025",
    author: "OECD",
    year: "2026",
    title: "PISA 2025 Results (Volume I): Chile — Country note",
    venue: { es: "OCDE, publicado el 8 de septiembre de 2026", en: "OECD, published 8 September 2026" },
    kind: "assessment",
    url: "https://www.oecd.org/en/publications/pisa-2025-results-volume-i-country-notes_2d4ff9ea-en/chile_9226f5cb-en.html",
    short: { es: "OCDE, PISA 2025", en: "OECD, PISA 2025" },
  },
  wei2025: {
    id: "wei2025",
    author: "Wei, C. & Chen, L.",
    year: "2025",
    title: "The Effects of Philosophy for Children on Children’s Cognitive Development: A Three-Level Meta-Analysis",
    venue: { es: "Journal of Intelligence, 13(10), 130", en: "Journal of Intelligence, 13(10), 130" },
    kind: "meta-analysis",
    url: "https://pubmed.ncbi.nlm.nih.gov/41149769/",
    short: { es: "Wei & Chen, Journal of Intelligence, 2025", en: "Wei & Chen, Journal of Intelligence, 2025" },
  },
  bishop2026: {
    id: "bishop2026",
    author: "Bishop, M., Feltz, A. & Conway, P.",
    year: "2026",
    title: "Critical thinking classes can reduce common biases: Results from a field experiment",
    venue: { es: "Journal of Experimental Psychology: Applied", en: "Journal of Experimental Psychology: Applied" },
    kind: "field-experiment",
    url: "https://doi.org/10.1037/xap0000571",
    short: { es: "Bishop, Feltz & Conway, 2026", en: "Bishop, Feltz & Conway, 2026" },
  },
  oecd2022: {
    id: "oecd2022",
    author: "OECD",
    year: "2022",
    title: "Does Higher Education Teach Students to Think Critically?",
    venue: { es: "OCDE, iniciativa internacional CLA+", en: "OECD, CLA+ International Initiative" },
    kind: "report",
    url: "https://www.oecd.org/en/publications/does-higher-education-teach-students-to-think-critically_cc9fa6aa-en.html",
    short: { es: "OCDE, 2022", en: "OECD, 2022" },
  },
  deo2026: {
    id: "deo2026",
    author: "OECD",
    year: "2026",
    title: "OECD Digital Education Outlook 2026",
    venue: { es: "OCDE", en: "OECD" },
    kind: "report",
    url: "https://www.oecd.org/en/publications/oecd-digital-education-outlook-2026_062a7394-en.html",
    short: { es: "OECD Digital Education Outlook, 2026", en: "OECD Digital Education Outlook, 2026" },
  },
  clemente: {
    id: "clemente",
    author: "Clemente Course in the Humanities",
    year: "2011 · 2017",
    title: "About",
    venue: { es: "Sitio oficial del programa; encuestas a participantes", en: "Programme’s official site; participant surveys" },
    kind: "survey",
    url: "https://www.clementecourse.org/about",
    short: { es: "Clemente Course, encuestas 2011 y 2017", en: "Clemente Course, 2011 and 2017 surveys" },
  },
  neh2014: {
    id: "neh2014",
    author: "National Endowment for the Humanities",
    year: "2014",
    title: "The Clemente Course in the Humanities — National Humanities Medal",
    venue: { es: "NEH", en: "NEH" },
    kind: "report",
    url: "https://www.neh.gov/about/awards/national-humanities-medals/the-clemente-course-in-the-humanities",
    short: { es: "NEH, Medalla Nacional de Humanidades 2014", en: "NEH, 2014 National Humanities Medal" },
  },
  eef2021: {
    id: "eef2021",
    author: "Education Endowment Foundation",
    year: "2021",
    title: "Philosophy for Children: Effectiveness trial",
    venue: { es: "EEF, Reino Unido (finalizado en noviembre de 2021)", en: "EEF, United Kingdom (completed November 2021)" },
    kind: "trial",
    url: "https://educationendowmentfoundation.org.uk/Projects-and-Evaluation/Projects/Philosophy-for-Children-Effectiveness-Trial",
    short: { es: "Education Endowment Foundation, 2021", en: "Education Endowment Foundation, 2021" },
  },
};

/* ---------------- PISA 2025 · Chile ---------------- */

export type Metric = {
  id: string;
  value: string;
  label: L;
  micro: L;
  population: L;
  source: SourceId;
};

const PISA_POP: L = { es: "Estudiantes de 15 años", en: "15-year-old students" };

/** Indicadores de la portada (sección «El desafío educativo»). */
export const CHALLENGE_METRICS: Metric[] = [
  {
    id: "pisa-math",
    value: "59%",
    label: {
      es: "de los estudiantes de 15 años en Chile no alcanzó el nivel básico de matemáticas.",
      en: "of 15-year-old students in Chile did not reach the baseline level in mathematics.",
    },
    micro: { es: "Promedio OCDE: 35% · PISA 2025", en: "OECD average: 35% · PISA 2025" },
    population: PISA_POP,
    source: "pisa2025",
  },
  {
    id: "pisa-reading",
    value: "38%",
    label: {
      es: "de los estudiantes chilenos no alcanzó el nivel básico de lectura.",
      en: "of Chilean students did not reach the baseline level in reading.",
    },
    micro: { es: "Promedio OCDE: 31% · PISA 2025", en: "OECD average: 31% · PISA 2025" },
    population: PISA_POP,
    source: "pisa2025",
  },
  {
    id: "pisa-ai",
    value: "51%",
    label: {
      es: "de los estudiantes chilenos declaró usar chatbots de IA al menos semanalmente para aprender.",
      en: "of Chilean students reported using AI chatbots at least weekly to help them learn.",
    },
    micro: { es: "Promedio OCDE: 46% · PISA 2025", en: "OECD average: 46% · PISA 2025" },
    population: PISA_POP,
    source: "pisa2025",
  },
];

/** Datos exactos para las barras comparativas (porcentaje de estudiantes, escala 0–100). */
export const PISA_COMPARISON: { id: string; label: L; chile: number; oecd: number }[] = [
  { id: "math", label: { es: "Alcanzó al menos el nivel 2 en matemáticas", en: "Reached at least Level 2 in mathematics" }, chile: 41, oecd: 65 },
  { id: "reading", label: { es: "Alcanzó al menos el nivel 2 en lectura", en: "Reached at least Level 2 in reading" }, chile: 62, oecd: 69 },
  { id: "ai", label: { es: "Usa chatbots de IA para aprender al menos una vez a la semana", en: "Uses AI chatbots to learn at least once a week" }, chile: 51, oecd: 46 },
];

export const PISA_CAVEAT: L = {
  es: "PISA evalúa a estudiantes de 15 años en matemáticas, lectura y ciencias; no es una prueba específica de pensamiento crítico. Estas brechas tienen causas múltiples y no se deben a la ausencia de formación filosófica.",
  en: "PISA assesses 15-year-olds in mathematics, reading and science; it is not a specific test of critical thinking. These gaps have multiple causes and are not due to an absence of philosophical education.",
};

/* ---------------- Estudios ---------------- */

export type Study = {
  id: string;
  headline: string; // número protagonista
  headlineUnit: L;
  secondary: L;
  title: L;
  body: L;
  indicator: L;
  indicatorNote: L;
  population: L;
  source: SourceId;
  caveat: L;
};

export const STUDIES: Study[] = [
  {
    id: "p4c-meta",
    headline: "33",
    headlineUnit: { es: "estudios", en: "studies" },
    secondary: { es: "4.568 participantes · 53 tamaños de efecto", en: "4,568 participants · 53 effect sizes" },
    title: { es: "Filosofía y desarrollo cognitivo", en: "Philosophy and cognitive development" },
    body: {
      es: "Un metaanálisis internacional de 2025 identificó un efecto global favorable de los programas Philosophy for Children sobre capacidades cognitivas evaluadas, con efectos observados en razonamiento, pensamiento crítico y creatividad.",
      en: "A 2025 international meta-analysis found a favourable overall effect of Philosophy for Children programmes on the cognitive abilities assessed, with effects observed in reasoning, critical thinking and creativity.",
    },
    indicator: { es: "Hedges’ g = 0,59", en: "Hedges’ g = 0.59" },
    indicatorNote: {
      es: "Tamaño de efecto estandarizado (IC 95%: 0,43–0,75); no representa un porcentaje de mejora.",
      en: "Standardised effect size (95% CI: 0.43–0.75); it does not represent a percentage improvement.",
    },
    population: {
      es: "Niños y niñas en etapa escolar · 33 estudios experimentales y cuasiexperimentales",
      en: "School-age children · 33 experimental and quasi-experimental studies",
    },
    source: "wei2025",
    caveat: {
      es: "Los propios autores observaron que las muestras pequeñas tendían a reportar efectos mayores. Son programas escolares presenciales: sus resultados no se trasladan automáticamente a universidades ni a una plataforma digital.",
      en: "The authors themselves observed that smaller samples tended to report larger effects. These are in-person school programmes: their results do not automatically transfer to universities or to a digital platform.",
    },
  },
  {
    id: "debiasing",
    headline: "397",
    headlineUnit: { es: "estudiantes", en: "students" },
    secondary: { es: "Efectos observados durante al menos 16 meses", en: "Effects observed for at least 16 months" },
    title: { es: "La enseñanza del pensamiento crítico puede reducir sesgos", en: "Teaching critical thinking can reduce biases" },
    body: {
      es: "Un experimento universitario encontró efectos importantes en cuatro errores de juicio y razonamiento después de un curso específicamente diseñado para trabajar estas capacidades.",
      en: "A university experiment found substantial effects on four errors of judgement and reasoning after a course specifically designed to work on these skills.",
    },
    indicator: { es: "Cohen’s d > 0,80", en: "Cohen’s d > 0.80" },
    indicatorNote: {
      es: "Tamaño de efecto estandarizado; no significa 80% de mejora.",
      en: "Standardised effect size; it does not mean an 80% improvement.",
    },
    population: {
      es: "Estudiantes universitarios de pregrado · cursos de pensamiento crítico frente a otros cursos de filosofía",
      en: "Undergraduate students · critical thinking classes compared with other philosophy classes",
    },
    source: "bishop2026",
    caveat: {
      es: "El efecto corresponde a cursos diseñados expresamente para estos sesgos; no a cualquier curso de filosofía ni a Kionas.",
      en: "The effect corresponds to classes designed specifically around these biases; not to any philosophy course, nor to Kionas.",
    },
  },
];

export const BIASES: { title: L; body: L }[] = [
  { title: { es: "Costos hundidos", en: "Sunk costs" }, body: { es: "Seguir invirtiendo en algo solo porque ya se invirtió.", en: "Continuing to invest in something only because one already has." } },
  { title: { es: "Correlación y causalidad", en: "Correlation and causation" }, body: { es: "Inferir que una cosa causa otra porque aparecen juntas.", en: "Inferring that one thing causes another because they appear together." } },
  { title: { es: "Regresión a la media", en: "Regression to the mean" }, body: { es: "Ignorar que los valores extremos tienden a moderarse por sí solos.", en: "Ignoring that extreme values tend to moderate on their own." } },
  { title: { es: "Costos de oportunidad", en: "Opportunity costs" }, body: { es: "Pasar por alto lo que se deja de hacer al elegir una opción.", en: "Overlooking what is given up when choosing an option." } },
];

/* ---------------- Clemente Course (autoinforme) ---------------- */

export const CLEMENTE: { value: string; label: L; year: string }[] = [
  { value: "87%", label: { es: "atribuyó al programa un papel importante en el desarrollo de capacidades analíticas profundas.", en: "credited the programme with a major role in developing in-depth analytical skills." }, year: "2017" },
  { value: "99%", label: { es: "declaró que el programa le ayudó a mejorar su escritura.", en: "said the programme helped them improve their writing." }, year: "2011" },
  { value: "81%", label: { es: "atribuyó al programa un papel importante en su preparación académica para estudios universitarios.", en: "credited the programme with a major role in preparing them academically for college coursework." }, year: "2017" },
];

/* ---------------- Glosario visible ---------------- */

export const GLOSSARY: { term: L; body: L }[] = [
  {
    term: { es: "Hedges’ g y Cohen’s d", en: "Hedges’ g and Cohen’s d" },
    body: {
      es: "Miden cuántas desviaciones estándar separan al grupo que recibió la intervención del grupo de comparación. Permiten comparar estudios distintos, pero no son porcentajes: g = 0,59 no significa 59% de mejora.",
      en: "They measure how many standard deviations separate the group that received the intervention from the comparison group. They allow different studies to be compared, but they are not percentages: g = 0.59 does not mean a 59% improvement.",
    },
  },
  {
    term: { es: "Nivel 2 en PISA", en: "PISA Level 2" },
    body: {
      es: "La OCDE lo considera el nivel básico de competencia: por ejemplo, en lectura, identificar la idea principal de un texto de extensión moderada.",
      en: "The OECD considers it the baseline level of proficiency: in reading, for example, identifying the main idea of a text of moderate length.",
    },
  },
  {
    term: { es: "Autoinforme", en: "Self-report" },
    body: {
      es: "Lo que los participantes declaran en una encuesta. Recoge percepciones valiosas, pero no mide directamente un cambio en sus capacidades.",
      en: "What participants state in a survey. It captures valuable perceptions, but it does not directly measure a change in their abilities.",
    },
  },
  {
    term: { es: "Comparación experimental", en: "Experimental comparison" },
    body: {
      es: "Un diseño que compara a quienes reciben una intervención con un grupo que no la recibe, para aislar mejor su efecto. Un metaanálisis combina muchos de estos estudios.",
      en: "A design that compares those who receive an intervention with a group that does not, to better isolate its effect. A meta-analysis combines many such studies.",
    },
  },
];

/* ---------------- Puente hacia los pilotos ---------------- */

export const PILOT_FLOW: L[] = [
  { es: "Diseño pedagógico", en: "Pedagogical design" },
  { es: "Piloto Kionas", en: "Kionas pilot" },
  { es: "Medición", en: "Measurement" },
  { es: "Decisión", en: "Decision" },
];

export const PILOT_INDICATORS: L[] = [
  { es: "Calidad argumentativa", en: "Quality of argumentation" },
  { es: "Identificación de supuestos", en: "Identifying assumptions" },
  { es: "Contraste de perspectivas", en: "Contrasting perspectives" },
  { es: "Reconocimiento de errores de razonamiento", en: "Recognising reasoning errors" },
  { es: "Participación y finalización", en: "Participation and completion" },
  { es: "Percepción de estudiantes y docentes", en: "Student and teacher perceptions" },
];

export const EVIDENCE_COPY = {
  heroLink: { es: "Conoce la evidencia que inspira nuestro enfoque", en: "See the evidence that informs our approach" },
  challengeEyebrow: { es: "El desafío en cifras", en: "The challenge in figures" },
  challengeTitle: { es: "Los desafíos educativos también se expresan en los datos.", en: "Educational challenges also show up in the data." },
  challengeLead: {
    es: "La evaluación PISA 2025 muestra brechas persistentes en aprendizajes fundamentales y una creciente presencia de la inteligencia artificial en la vida escolar.",
    en: "The PISA 2025 assessment shows persistent gaps in foundational learning and a growing presence of artificial intelligence in school life.",
  },
  aiEyebrow: { es: "Educación en la era de la IA", en: "Education in the age of AI" },
  aiTitle: { es: "Responder mejor no siempre significa aprender más.", en: "Answering better does not always mean learning more." },
  aiBody: {
    es: "La OCDE advierte que el uso de IA generativa puede mejorar el desempeño en tareas sin asegurar aprendizajes equivalentes. El desafío es diseñar experiencias que mantengan activo el razonamiento del estudiante.",
    en: "The OECD warns that using generative AI can improve task performance without ensuring equivalent learning. The challenge is to design experiences that keep the student’s reasoning active.",
  },
  aiKionas: {
    es: "Por eso, Kionas propone utilizar la tecnología para explorar preguntas, examinar argumentos y contrastar perspectivas, en lugar de sustituir el juicio personal.",
    en: "That is why Kionas proposes using technology to explore questions, examine arguments and contrast perspectives, rather than replacing personal judgement.",
  },
  sectionEyebrow: { es: "Evidencia científica", en: "Scientific evidence" },
  sectionTitle: { es: "La filosofía también puede producir resultados medibles.", en: "Philosophy can also produce measurable results." },
  sectionLead: {
    es: "Distintas investigaciones han examinado el efecto de intervenciones filosóficas sobre el razonamiento, el pensamiento crítico y otras capacidades cognitivas. Sus hallazgos ofrecen una base para explorar nuevas aplicaciones educativas.",
    en: "Several studies have examined the effect of philosophical interventions on reasoning, critical thinking and other cognitive abilities. Their findings offer a basis for exploring new educational applications.",
  },
  sectionClose: {
    es: "Estos resultados corresponden a intervenciones educativas investigadas. Kionas busca evaluar su propio desempeño mediante pilotos institucionales.",
    en: "These results correspond to researched educational interventions. Kionas seeks to evaluate its own performance through institutional pilots.",
  },
  examine: { es: "Examinar estudio", en: "Examine study" },
  explore: { es: "Explorar la evidencia", en: "Explore the evidence" },
  viewSource: { es: "Ver fuente", en: "View source" },
  bridgeTitle: { es: "De la evidencia científica a la evaluación institucional.", en: "From scientific evidence to institutional evaluation." },
  bridgeBody: {
    es: "El siguiente paso consiste en examinar cómo estas experiencias pueden incorporarse a contextos educativos reales y qué resultados es posible observar y medir.",
    en: "The next step is to examine how these experiences can be brought into real educational settings and which results can be observed and measured.",
  },
  indicatorsBadge: {
    es: "Indicadores propuestos para evaluación · No son resultados obtenidos",
    en: "Proposed evaluation indicators · Not results obtained",
  },
  indicatorsNote: {
    es: "Cada evaluación se diseñaría con rúbricas explícitas, criterios consistentes y un diseño adecuado al tamaño y a las características de la cohorte. Lo que es posible medir depende del estado actual de la plataforma y del diseño acordado en cada piloto.",
    en: "Each evaluation would be designed with explicit rubrics, consistent criteria and a design suited to the size and characteristics of the cohort. What can be measured depends on the platform’s current state and on the design agreed for each pilot.",
  },
  bridgeCta: { es: "Diseñemos un piloto institucional", en: "Let’s design an institutional pilot" },
} satisfies Record<string, L>;
