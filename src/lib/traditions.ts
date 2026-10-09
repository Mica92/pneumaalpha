/**
 * Diálogos filosóficos — catálogo de tradiciones.
 *
 * Cada tradición es una "ficha estructural" que alimenta el prompt de sistema:
 * los datos orientan el razonamiento (conceptos, premisas, método, tensiones,
 * objeciones, temas útiles) y permiten ampliar el catálogo sin tocar la interfaz.
 *
 * Los campos `name`/`tagline`/`questions` son visibles en la UI (bilingües).
 * El resto es material de razonamiento (en español); el modelo adapta el idioma
 * de su respuesta mediante la directiva de idioma.
 */

export type TraditionFamilyId =
  | "antiguedad"
  | "asia"
  | "moderna"
  | "idealismo"
  | "existencia"
  | "analitica"
  | "critica"
  | "etica"
  | "contemporanea";

export type Tradition = {
  id: string;
  family: TraditionFamilyId;
  name: { es: string; en: string };
  tagline: { es: string; en: string };
  questions: { es: string; en: string }[];
  concepts: string[];
  premises: string[];
  method: string;
  authors: string[];
  tensions: string[];
  objections: string[];
  usefulFor: string[];
};

export const TRADITION_FAMILIES: {
  id: TraditionFamilyId;
  name: { es: string; en: string };
  description: { es: string; en: string };
}[] = [
  { id: "antiguedad", name: { es: "Antigüedad griega y romana", en: "Greek and Roman antiquity" }, description: { es: "Escuelas y doctrinas clásicas sobre la vida buena, el conocimiento y la naturaleza.", en: "Classical schools on the good life, knowledge and nature." } },
  { id: "asia", name: { es: "Filosofías de Asia", en: "Asian philosophies" }, description: { es: "Tradiciones tratadas en sus propios términos: ética, realidad, conciencia y transformación.", en: "Traditions on their own terms: ethics, reality, consciousness and transformation." } },
  { id: "moderna", name: { es: "Filosofía moderna y racionalismo", en: "Modern philosophy and rationalism" }, description: { es: "El giro hacia el sujeto, la experiencia y los fundamentos del conocimiento.", en: "The turn to the subject, experience and the grounds of knowledge." } },
  { id: "idealismo", name: { es: "Idealismo alemán y afines", en: "German idealism and related" }, description: { es: "Razón, libertad, historia y la relación entre pensamiento y realidad.", en: "Reason, freedom, history and the relation of thought to reality." } },
  { id: "existencia", name: { es: "Existencia y experiencia", en: "Existence and experience" }, description: { es: "Existencia, libertad, sentido y experiencia vivida.", en: "Existence, freedom, meaning and lived experience." } },
  { id: "analitica", name: { es: "Lenguaje y filosofía analítica", en: "Language and analytic philosophy" }, description: { es: "Claridad argumental, conceptos, lenguaje y estructura lógica.", en: "Argumentative clarity, concepts, language and logical structure." } },
  { id: "critica", name: { es: "Materialismo, marxismo y crítica social", en: "Materialism, Marxism and social critique" }, description: { es: "Trabajo, poder, ideología y condiciones materiales.", en: "Labour, power, ideology and material conditions." } },
  { id: "etica", name: { es: "Filosofías políticas y éticas", en: "Political and ethical philosophies" }, description: { es: "Deberes, consecuencias, virtud y justicia.", en: "Duties, consequences, virtue and justice." } },
  { id: "contemporanea", name: { es: "Filosofías contemporáneas y críticas", en: "Contemporary and critical philosophies" }, description: { es: "Poder, subjetividad, diferencia y nuevos modos de crítica.", en: "Power, subjectivity, difference and new modes of critique." } },
];

export const TRADITIONS: Tradition[] = [
  // ── Antigüedad ────────────────────────────────────────────────────────────
  {
    id: "estoicismo",
    family: "antiguedad",
    name: { es: "Estoicismo", en: "Stoicism" },
    tagline: { es: "Distinguir lo que depende de ti de lo que no, y responder con virtud.", en: "Distinguish what is up to you from what is not, and respond with virtue." },
    questions: [
      { es: "¿Qué depende realmente de mí en esta situación?", en: "What is actually up to me in this situation?" },
      { es: "¿Qué juicio está causando esta perturbación?", en: "What judgement is causing this disturbance?" },
      { es: "¿Cómo actuaría la virtud aquí y ahora?", en: "How would virtue act here and now?" },
    ],
    concepts: ["juicio", "virtud", "naturaleza", "lo que depende de nosotros (eph' hēmin)", "apatheia (serenidad)", "cosmopolitismo"],
    premises: ["El bien reside en la virtud, no en la salud, la riqueza ni la opinión.", "Lo que nos perturba no son las cosas, sino nuestros juicios sobre ellas.", "Vivir conforme a la naturaleza es vivir conforme a la razón."],
    method: "Examen de los juicios y del alcance de la propia acción: separar lo controlable de lo que no lo es.",
    authors: ["Zenón de Citio", "Séneca (Cartas a Lucilio)", "Epicteto (Manual, Discursos)", "Marco Aurelio (Meditaciones)"],
    tensions: ["Tensión entre el ideal del sabio imperturbable y la vida emocional concreta.", "Tensión entre aceptar el destino y actuar para cambiarlo."],
    objections: ["Puede derivar en resignación o en una frialdad que ignore el valor de la compasión.", "La distinción entre lo que depende y no depende de uno es, en la práctica, borrosa."],
    usefulFor: ["decisiones bajo incertidumbre", "ansiedad y control", "adversidad", "responsabilidad y límites de la agencia"],
  },
  {
    id: "aristotelismo",
    family: "antiguedad",
    name: { es: "Aristotelismo", en: "Aristotelianism" },
    tagline: { es: "La virtud se cultiva: examinar causas, fines y hábitos.", en: "Virtue is cultivated: examine causes, ends and habits." },
    questions: [
      { es: "¿Cuál es la finalidad de esta acción?", en: "What is the end of this action?" },
      { es: "¿Qué hábito estoy formando al actuar así?", en: "What habit am I forming by acting this way?" },
      { es: "¿Dónde está el justo medio aquí, y respecto de qué?", en: "Where is the mean here, and relative to what?" },
    ],
    concepts: ["sustancia", "causalidad (cuatro causas)", "potencia y acto", "virtud como hábito", "phronesis (prudencia)", "eudaimonia (vida buena)"],
    premises: ["Toda cosa tiende a un fin; comprender algo es comprender su finalidad.", "La virtud es un hábito del carácter que se adquiere practicándolo.", "La vida buena es actividad del alma conforme a la virtud."],
    method: "Análisis de fines, causas y disposiciones: se pregunta qué se pretende, por qué y qué carácter se está formando.",
    authors: ["Aristóteles (Ética a Nicómaco, Metafísica, Política)"],
    tensions: ["Tensión entre la virtud como término medio y las acciones que no admiten punto intermedio.", "Tensión entre el ideal contemplativo y la vida práctica y política."],
    objections: ["La doctrina del justo medio puede parecer arbitraria o conservadora.", "Su teleología natural presupone fines que la modernidad cuestiona."],
    usefulFor: ["formación de hábitos", "deliberación práctica", "propósitos y fines", "equilibrio y moderación"],
  },
  {
    id: "platonismo",
    family: "antiguedad",
    name: { es: "Platonismo", en: "Platonism" },
    tagline: { es: "Lo visible es copia: buscar la Forma que da inteligibilidad a las cosas.", en: "The visible is a copy: seek the Form that makes things intelligible." },
    questions: [
      { es: "¿Qué es lo que esta cosa tiene de universal y permanente?", en: "What is universal and permanent in this thing?" },
      { es: "¿Estoy confundiendo la apariencia con la realidad?", en: "Am I confusing appearance with reality?" },
      { es: "¿Qué sería la Forma perfecta de esto que persigo?", en: "What would be the perfect Form of what I pursue?" },
    ],
    concepts: ["Idea o Forma", "participación", "conocimiento vs. opinión", "alma y reminiscencia", "bien", "belleza y justicia como Formas"],
    premises: ["Lo sensible cambia y no es plenamente cognoscible; lo inteligible es lo estable.", "Conocer no es acumular impresiones, sino ascender de lo particular a la Forma.", "El Bien es la Forma que ordena las demás y hace posible el conocimiento."],
    method: "Diálogo y ascenso dialéctico: se busca la definición y la Forma que da unidad a lo múltiple.",
    authors: ["Platón (República, Fedón, Fedro, Banquete, Timeo)"],
    tensions: ["Tensión entre el mundo ideal y la necesidad de explicar el mundo material.", "Tensión entre la justicia de la ciudad ideal y la libertad del individuo."],
    objections: ["La separación entre Formas y cosas sensibles es difícil de justificar.", "El realismo de las Formas parece multiplicar entidades sin necesidad."],
    usefulFor: ["definir conceptos", "distinguir apariencia de realidad", "ideales y estándares", "justicia y educación"],
  },

  // ── Asia ──────────────────────────────────────────────────────────────────
  {
    id: "confucianismo",
    family: "asia",
    name: { es: "Confucianismo", en: "Confucianism" },
    tagline: { es: "La persona se forma en las relaciones y en los ritos que las ordenan.", en: "The person is formed in relationships and the rites that order them." },
    questions: [
      { es: "¿Qué deberes me ligan a quienes me rodean?", en: "What duties bind me to those around me?" },
      { es: "¿Estoy cultivando el carácter que mi rol exige?", en: "Am I cultivating the character my role requires?" },
      { es: "¿Cómo restaura el rito el orden de esta relación?", en: "How does rite restore order in this relationship?" },
    ],
    concepts: ["ren (benevolencia/humanidad)", "li (rito/propiedad)", "xiao (piedad filial)", "junzi (persona noble)", "rectificación de nombres", "armonía"],
    premises: ["La persona no es un individuo aislado, sino un entramado de relaciones.", "El orden social se sostiene en virtudes cultivadas y en la práctica de los ritos.", "Gobernar es, ante todo, dar ejemplo por el propio cultivo moral."],
    method: "Cultivo del carácter a través de las relaciones y de la práctica ritual; se razona desde el rol y el deber concreto.",
    authors: ["Confucio (Analectas)", "Mencius (Mengzi)", "Xunzi"],
    tensions: ["Tensión entre la conformidad al rol y la autonomía de la conciencia.", "Tensión entre la jerarquía social y la exigencia de trato humano recíproco."],
    objections: ["Puede reforzar jerarquías y deberes que limitan al individuo.", "El peso del rito puede volverse formalismo vacío."],
    usefulFor: ["deberes y relaciones", "roles sociales", "educación y formación del carácter", "orden y armonía"],
  },
  {
    id: "budismo",
    family: "asia",
    name: { es: "Budismo filosófico", en: "Philosophical Buddhism" },
    tagline: { es: "Nada es permanente: examinar el deseo, el sufrimiento y el yo.", en: "Nothing is permanent: examine desire, suffering and the self." },
    questions: [
      { es: "¿A qué apego se debe este sufrimiento?", en: "To what attachment is this suffering due?" },
      { es: "¿Qué estoy tomando como un yo estable?", en: "What am I taking to be a stable self?" },
      { es: "¿Qué cambia si dejo de aferrarme a esto?", en: "What changes if I stop clinging to this?" },
    ],
    concepts: ["dukkha (insatisfacción)", "anicca (impermanencia)", "anatta (no-yo)", "causalidad (origen dependiente)", "apego", "atención plena"],
    premises: ["Toda experiencia condicionada es impermanente e insatisfactoria cuando se le pide permanencia.", "El sufrimiento se origina en el apego y la ignorancia de la impermanencia.", "No hay un yo sustancial y permanente detrás de los procesos que experimentamos."],
    method: "Análisis de la experiencia presente: observar el origen del sufrimiento y la falta de un yo fijo, sin especular sobre lo incondicionado.",
    authors: ["Buda histórico (Suttas del canon Pali)", "Nāgārjuna", "Tradiciones Theravāda y Mahāyāna"],
    tensions: ["Tensión entre la doctrina del no-yo y la continuidad de la responsabilidad moral.", "Tensión entre la liberación individual y la compasión por todos los seres."],
    objections: ["El no-yo puede parecer contradictorio con la memoria y la identidad práctica.", "Su diagnóstico del deseo puede leerse como negación de la vida, más que como lucidez."],
    usefulFor: ["sufrimiento y apego", "impermanencia", "identidad y yo", "ecuanimidad y atención"],
  },

  // ── Moderna ───────────────────────────────────────────────────────────────
  {
    id: "racionalismo",
    family: "moderna",
    name: { es: "Racionalismo", en: "Rationalism" },
    tagline: { es: "La razón posee criterios propios: deducir desde principios claros.", en: "Reason has its own criteria: deduce from clear principles." },
    questions: [
      { es: "¿Qué puedo saber con certeza y por qué?", en: "What can I know with certainty, and why?" },
      { es: "¿Qué principio primero ordena este asunto?", en: "What first principle orders this matter?" },
      { es: "¿Qué se sigue necesariamente de lo que acepto?", en: "What follows necessarily from what I accept?" },
    ],
    concepts: ["razón e ideas innatas", "certeza", "sustancia", "deducción", "necesidad", "razón suficiente"],
    premises: ["El conocimiento cierto se funda en la razón, no en los sentidos.", "Hay principios evidentes desde los cuales se puede deducir lo demás.", "La realidad es, en su núcleo, inteligible."],
    method: "Deducción desde principios claros y distintos; se desconfía de la evidencia meramente sensible.",
    authors: ["Descartes (Discurso, Meditaciones)", "Spinoza (Ética)", "Leibniz (Monadología, Discurso de metafísica)"],
    tensions: ["Tensión entre el ideal deductivo y la dependencia de premisas no demostradas.", "Tensión entre la unidad de la sustancia (Spinoza) y la pluralidad de las mónadas (Leibniz)."],
    objections: ["La experiencia puede contradecir lo que la razón deduce a priori.", "Las ideas innatas son discutibles y su origen es objeto de disputa."],
    usefulFor: ["fundamentos y certeza", "argumentación deductiva", "principios primeros", "necesidad y contingencia"],
  },
  {
    id: "empirismo",
    family: "moderna",
    name: { es: "Empirismo", en: "Empiricism" },
    tagline: { es: "Todo conocimiento nace de la experiencia: examinar de dónde procede cada idea.", en: "All knowledge arises from experience: trace where each idea comes from." },
    questions: [
      { es: "¿De qué impresión procede esta idea?", en: "From what impression does this idea come?" },
      { es: "¿Qué justifica esta creencia más allá de la costumbre?", en: "What justifies this belief beyond custom?" },
      { es: "¿Qué evidencia observable la respalda?", en: "What observable evidence supports it?" },
    ],
    concepts: ["experiencia e impresiones", "ideas", "asociación", "causalidad como hábito", "escepticismo moderado", "evidencia"],
    premises: ["No hay ideas sin experiencia previa; la mente es, en origen, una pizarra en blanco.", "Las cuestiones de hecho se conocen por experiencia, no por razón pura.", "La causalidad que creemos ver es, en rigor, conjunción constante más hábito."],
    method: "Rastrear el origen empírico de las ideas y medir las creencias por la evidencia disponible.",
    authors: ["Locke (Ensayo sobre el entendimiento humano)", "Hume (Tratado, Investigación)", "Berkeley"],
    tensions: ["Tensión entre el empirismo y la necesidad de principios que la experiencia no garantiza.", "Tensión entre el escepticismo humeano y la práctica cotidiana."],
    objections: ["Llevado al extremo, socava la inducción y la ciencia.", "No todas las ideas parecen reducibles a impresiones sensibles."],
    usefulFor: ["evidencia y justificación", "creencias y costumbre", "límites del conocimiento", "revisión empírica"],
  },

  // ── Idealismo alemán ──────────────────────────────────────────────────────
  {
    id: "kantianismo",
    family: "idealismo",
    name: { es: "Kantianismo", en: "Kantianism" },
    tagline: { es: "Actúa según una ley que puedas querer como universal.", en: "Act on a law you could will as universal." },
    questions: [
      { es: "¿Puedo querer que todos actuaran así?", en: "Could I will that everyone acted this way?" },
      { es: "¿Estoy tratando a alguien solo como medio?", en: "Am I treating someone merely as a means?" },
      { es: "¿Qué condición hace posible mi conocimiento de esto?", en: "What condition makes my knowledge of this possible?" },
    ],
    concepts: ["autonomía", "imperativo categórico", "deber", "dignidad", "juicio (a priori)", "límites de la razón"],
    premises: ["La moral no se funda en las consecuencias ni en las inclinaciones, sino en la forma de la ley.", "Los seres racionales son fines en sí mismos, con dignidad, no precio.", "La razón legisla para sí misma: la autonomía es el fundamento de la dignidad."],
    method: "Examen de la forma de la máxima: universalizabilidad y respeto a la humanidad como fin.",
    authors: ["Kant (Crítica de la razón pura, Fundamentación, Crítica de la razón práctica)"],
    tensions: ["Tensión entre la pureza del deber y las consecuencias reales de actuar.", "Tensión entre la universalidad de la ley y la singularidad de los casos."],
    objections: ["El formalismo puede producir deberes rígidos o contra-intuitivos.", "La separación entre fenómeno y noúmeno es discutida."],
    usefulFor: ["deber y principios", "dignidad y derechos", "autonomía", "límites del conocimiento"],
  },
  {
    id: "nietzsche",
    family: "idealismo",
    name: { es: "Filosofía de Nietzsche", en: "Nietzsche's philosophy" },
    tagline: { es: "Interrogar los valores: ¿qué voluntad se expresa en lo que llamamos verdad?", en: "Interrogate values: what will is expressed in what we call truth?" },
    questions: [
      { es: "¿Qué valor o instinto hay detrás de esta creencia?", en: "What value or drive lies behind this belief?" },
      { es: "¿Estoy afirmando la vida o negándola con esto?", en: "Am I affirming life or negating it with this?" },
      { es: "¿Qué podríamos crear si dejáramos de obedecer este valor?", en: "What could we create if we stopped obeying this value?" },
    ],
    concepts: ["voluntad de poder", "genealogía", "nihilismo", "eterno retorno", "transvaloración", "perspectivismo"],
    premises: ["Los valores tienen una historia y unos intereses; no son hechos eternos.", "No hay hechos sin interpretación: todo conocimiento es perspectivo.", "La vida es voluntad de poder, creación y superación, no mera conservación."],
    method: "Genealogía e interpretación: se pregunta qué fuerzas y qué valores producen una creencia y qué afirmaría su superación.",
    authors: ["Nietzsche (La gaya ciencia, Así habló Zaratustra, Genealogía de la moral, Más allá del bien y del mal)"],
    tensions: ["Tensión entre la crítica del sujeto y la apelación a una afirmación individual.", "Tensión entre el perspectivismo y la pretensión de verdad de su propia crítica."],
    objections: ["El perspectivismo puede autosocavarse si se aplica a sí mismo.", "Su crítica de la moral se ha leído como rechazo de toda obligación."],
    usefulFor: ["crítica de valores", "moralidad y su historia", "autenticidad", "creación y superación"],
  },

  // ── Existencia ────────────────────────────────────────────────────────────
  {
    id: "existencialismo",
    family: "existencia",
    name: { es: "Existencialismo", en: "Existentialism" },
    tagline: { es: "La existencia precede a la esencia: eres lo que eliges hacer.", en: "Existence precedes essence: you are what you choose to make." },
    questions: [
      { es: "¿Qué elijo, y qué me define esa elección?", en: "What do I choose, and what does that choice make of me?" },
      { es: "¿Estoy huyendo de mi libertad?", en: "Am I fleeing from my freedom?" },
      { es: "¿Qué sentido me comprometo a darle a esto?", en: "What meaning do I commit to giving this?" },
    ],
    concepts: ["libertad radical", "responsabilidad", "autenticidad", "facticidad", "angustia", "proyecto"],
    premises: ["No hay una esencia previa que determine lo que el ser humano es: se define al existir y al elegir.", "La libertad es total y conlleva una responsabilidad total.", "La angustia es la conciencia de esa libertad, no una enfermedad."],
    method: "Descripción de la situación concreta y de la elección que la constituye; se evita reducir la libertad a condiciones.",
    authors: ["Sartre (El ser y la nada, El existencialismo es un humanismo)", "Kierkegaard", "Simone de Beauvoir"],
    tensions: ["Tensión entre libertad radical y las condiciones que la limitan.", "Tensión entre autenticidad individual y responsabilidad hacia los demás."],
    objections: ["Puede sobredimensionar la libertad e ignorar la determinación social.", "La idea de una responsabilidad total puede resultar paralizante."],
    usefulFor: ["elecciones y compromiso", "libertad y responsabilidad", "autenticidad", "sentido y proyecto"],
  },
  {
    id: "fenomenologia",
    family: "existencia",
    name: { es: "Fenomenología", en: "Phenomenology" },
    tagline: { es: "Volver a las cosas mismas: describir cómo algo aparece a la experiencia.", en: "Back to the things themselves: describe how something appears to experience." },
    questions: [
      { es: "¿Cómo se me da esto en la experiencia, antes de toda teoría?", en: "How does this give itself to me in experience, before any theory?" },
      { es: "¿Qué supongo y qué se muestra realmente?", en: "What do I presuppose and what actually shows itself?" },
      { es: "¿Qué intención constituye este objeto?", en: "What intention constitutes this object?" },
    ],
    concepts: ["intencionalidad", "fenómeno", "reducción (epoché)", "mundo de la vida", "cuerpo vivido", "horizonte"],
    premises: ["La conciencia es siempre conciencia de algo: no hay experiencia sin intencionalidad.", "Hay que poner entre paréntesis los supuestos para describir lo que aparece.", "La experiencia vivida es el punto de partida legítimo, no un residuo subjetivo."],
    method: "Descripción cuidadosa de la experiencia tal como aparece, suspendiendo prejuicios y teorías previas.",
    authors: ["Husserl (Ideas, Investigaciones lógicas)", "Heidegger (Ser y tiempo)", "Merleau-Ponty (Fenomenología de la percepción)"],
    tensions: ["Tensión entre la aspiración a la descripción pura y la imposibilidad de un punto de vista sin supuestos.", "Tensión entre la subjetividad trascendental y la existencia situada."],
    objections: ["La descripción pura puede parecer inalcanzable o circular.", "La reducción fenomenológica es criticada como un artificio metodológico."],
    usefulFor: ["describir la experiencia", "percepción y cuerpo", "supuestos implícitos", "cómo se constituye el sentido"],
  },

  // ── Analítica ─────────────────────────────────────────────────────────────
  {
    id: "filosofia-analitica",
    family: "analitica",
    name: { es: "Filosofía analítica", en: "Analytic philosophy" },
    tagline: { es: "Aclarar el problema: distinguir conceptos y examinar la forma del argumento.", en: "Clarify the problem: distinguish concepts and examine the argument's form." },
    questions: [
      { es: "¿Qué quiero decir exactamente con esta palabra?", en: "What exactly do I mean by this word?" },
      { es: "¿Qué premisa sostiene esta conclusión?", en: "What premise supports this conclusion?" },
      { es: "¿Es esto una cuestión de hecho, de significado o de valor?", en: "Is this a matter of fact, of meaning, or of value?" },
    ],
    concepts: ["claridad", "argumento y validez", "significado y uso", "distinción conceptual", "proposiciones", "análisis lógico"],
    premises: ["Muchos problemas filosóficos se disuelven al aclarar el lenguaje y la lógica.", "Un argumento vale por su forma y por la verdad de sus premisas, no por su fuerza retórica.", "Distinguir sentidos de una palabra evita confusiones y falsas alternativas."],
    method: "Análisis conceptual y lógico: se reformula el problema, se explicitan premisas y se evalúa la validez.",
    authors: ["Frege", "Russell", "Wittgenstein (Tractatus, Investigaciones)", "Quine", "Austin"],
    tensions: ["Tensión entre el ideal de claridad y la persistencia de problemas que resisten el análisis.", "Tensión entre análisis formal y atención al lenguaje ordinario."],
    objections: ["Puede reducir la filosofía a técnica y perder la dimensión existencial.", "La obsesión por la claridad puede desfigurar problemas legítimamente confusos."],
    usefulFor: ["aclarar conceptos", "evaluar argumentos", "distinguir sentidos", "rigor en el razonamiento"],
  },

  // ── Crítica social ────────────────────────────────────────────────────────
  {
    id: "marxismo",
    family: "critica",
    name: { es: "Marxismo", en: "Marxism" },
    tagline: { es: "Examinar las condiciones materiales que producen las ideas y las relaciones.", en: "Examine the material conditions that produce ideas and relations." },
    questions: [
      { es: "¿A qué intereses materiales sirve esta idea?", en: "What material interests does this idea serve?" },
      { es: "¿Qué relaciones de producción hay detrás de este fenómeno?", en: "What relations of production lie behind this phenomenon?" },
      { es: "¿Quién trabaja, quién se apropia y cómo se justifica?", en: "Who labours, who appropriates, and how is it justified?" },
    ],
    concepts: ["trabajo", "alienación", "ideología", "clase", "modo de producción", "plusvalía"],
    premises: ["No es la conciencia la que determina la vida, sino la vida material la que determina la conciencia.", "La historia es, en lo esencial, historia de la lucha de clases.", "Bajo el capitalismo, el trabajo se vuelve ajeno al trabajador: alienación."],
    method: "Análisis materialista: se reconstruyen las condiciones económicas y de clase que sostienen un fenómeno o una idea.",
    authors: ["Marx (El capital, Manuscritos de 1844, La ideología alemana)", "Engels", "Lukács", "Gramsci"],
    tensions: ["Tensión entre el determinismo económico y la agencia política.", "Tensión entre la crítica del Estado y su uso como instrumento de transición."],
    objections: ["El determinismo económico puede subestimar la cultura y las ideas.", "Los proyectos políticos derivados del marxismo han producido regímenes autoritarios."],
    usefulFor: ["trabajo y alienación", "poder e ideología", "estructura social", "crítica de las instituciones"],
  },

  // ── Ética ─────────────────────────────────────────────────────────────────
  {
    id: "utilitarismo",
    family: "etica",
    name: { es: "Utilitarismo", en: "Utilitarianism" },
    tagline: { es: "Evaluar las acciones por el bienestar que producen, para todos los afectados.", en: "Judge actions by the wellbeing they produce, for all affected." },
    questions: [
      { es: "¿Qué consecuencias tendría esto, y para quién?", en: "What consequences would this have, and for whom?" },
      { es: "¿Qué opción maximiza el bienestar y reduce el sufrimiento?", en: "Which option maximises wellbeing and reduces suffering?" },
      { es: "¿Estoy contando el bien de todos, o solo el de los cercanos?", en: "Am I counting everyone's good, or only that of the near?" },
    ],
    concepts: ["utilidad", "bienestar", "consecuencias", "imparcialidad", "agregación", "placer y dolor"],
    premises: ["Lo correcto de una acción se juzga por sus consecuencias para el bienestar general.", "Cada persona cuenta por igual; nadie vale más que otro en el cálculo.", "El sufrimiento es un mal real que hay que minimizar, no un dato neutro."],
    method: "Cálculo y ponderación de consecuencias: se estima el bienestar neto que produce cada curso de acción.",
    authors: ["Bentham (Introducción a los principios de la moral)", "Mill (El utilitarismo)", "Sidgwick"],
    tensions: ["Tensión entre utilidad agregada y derechos individuales.", "Tensión entre consecuencias reales y consecuencias previsibles al decidir."],
    objections: ["Puede justificar sacrificar a unos pocos por el bien de muchos.", "Medir y comparar bienestar entre personas es problemático."],
    usefulFor: ["decisiones con consecuencias", "bienestar colectivo", "políticas y reparto", "sufrimiento evitable"],
  },
  {
    id: "etica-de-la-virtud",
    family: "etica",
    name: { es: "Ética de la virtud", en: "Virtue ethics" },
    tagline: { es: "No preguntes solo qué hacer, sino quién te vuelves al hacerlo.", en: "Ask not only what to do, but who you become by doing it." },
    questions: [
      { es: "¿Qué haría aquí una persona virtuosa?", en: "What would a virtuous person do here?" },
      { es: "¿Qué disposición estoy cultivando con esto?", en: "What disposition am I cultivating with this?" },
      { es: "¿Esta acción expresa el carácter que quiero tener?", en: "Does this action express the character I want to have?" },
    ],
    concepts: ["virtud", "carácter", "phronesis (prudencia)", "florecimiento (eudaimonia)", "hábito", "excelencia"],
    premises: ["La vida ética no se reduce a reglas ni a cálculos: gira en torno al carácter.", "La virtud se adquiere por práctica y se ejerce con juicio en cada situación.", "El fin es florecer como persona, no solo cumplir deberes puntuales."],
    method: "Deliberación sobre el carácter: se pregunta qué virtud está en juego y qué disposición se está formando.",
    authors: ["Aristóteles", "Tomás de Aquino", "Anscombe", "MacIntyre (Tras la virtud)"],
    tensions: ["Tensión entre virtud y reglas cuando se necesita una guía pública clara.", "Tensión entre la virtud como ideal y su dependencia de una comunidad concreta."],
    objections: ["Puede ser vaga ante dilemas que exigen una respuesta concreta.", "El ideal de florecimiento presupone una concepción del bien que no todos comparten."],
    usefulFor: ["formación del carácter", "dilemas sin regla clara", "liderazgo y ejemplo", "vida buena"],
  },

  // ── Contemporánea ─────────────────────────────────────────────────────────
  {
    id: "feminismo-filosofico",
    family: "contemporanea",
    name: { es: "Feminismo filosófico", en: "Philosophical feminism" },
    tagline: { es: "Examinar cómo el género y el poder configuran el conocimiento, la ética y el sujeto.", en: "Examine how gender and power shape knowledge, ethics and the subject." },
    questions: [
      { es: "¿Qué supuestos de género sostienen esta idea o institución?", en: "What gendered assumptions sustain this idea or institution?" },
      { es: "¿La experiencia de quién queda excluida de esta descripción?", en: "Whose experience is left out of this description?" },
      { es: "¿Cómo afecta esto a las relaciones de poder y de cuidado?", en: "How does this affect relations of power and care?" },
    ],
    concepts: ["género", "poder", "situación y perspectiva", "cuerpo", "cuidado y dependencia", "crítica del sujeto universal"],
    premises: ["El sujeto que la tradición tomó por universal es, con frecuencia, un sujeto situado y no neutral.", "El conocimiento está situado: la perspectiva y la posición social importan.", "La ética debe atender la dependencia, la vulnerabilidad y el cuidado, no solo los derechos."],
    method: "Crítica situada: se pregunta qué posición, qué género y qué poder operan en un concepto, un texto o una institución.",
    authors: ["Simone de Beauvoir (El segundo sexo)", "Iris Marion Young", "Carol Gilligan", "Judith Butler", "Nancy Fraser"],
    tensions: ["Tensión entre la crítica de las categorías de género y su uso político necesario.", "Tensión entre la ética del cuidado y la exigencia de justicia e imparcialidad."],
    objections: ["La crítica del universalismo puede desembocar en un relativismo paralizante.", "La categoría de género puede oscurecer otras diferencias (clase, raza, cultura)."],
    usefulFor: ["poder y género", "cuidado y dependencia", "conocimiento situado", "crítica de instituciones"],
  },
];

const BY_ID = new Map(TRADITIONS.map((t) => [t.id, t]));
const FAMILY_BY_ID = new Map(TRADITION_FAMILIES.map((f) => [f.id, f]));

export const TRADITION_LIST = TRADITIONS;

export function traditionById(id: string): Tradition | undefined {
  return BY_ID.get(id);
}

export function familyById(id: TraditionFamilyId) {
  return FAMILY_BY_ID.get(id);
}

export function traditionsByFamily(family: TraditionFamilyId): Tradition[] {
  return TRADITIONS.filter((t) => t.family === family);
}

/* ── Prompt de sistema por tradición ──────────────────────────────────────── */

const HONESTY_RULES = `═══ REGLAS DE HONESTIDAD INTELECTUAL ═══
— No imites superficialmente a ningún autor ni pretendas serlo.
— No atribuyas citas, fechas ni referencias que no sean seguras.
— No reduzcas la tradición a una consigna; reconoce cuando es internamente diversa.
— No inventes acuerdos entre posturas para complacer; si hay desacuerdo, señálalo.
— Diferencia entre tesis documentadas, interpretaciones debatidas y aplicaciones contemporáneas.
— Esto no es asesoramiento psicológico ni prescripción de decisiones personales.`;

const CARE_RULES = `═══ CUIDADO (PRIORIDAD MÁXIMA) ═══
— Si la persona expresa angustia profunda o ideas de hacerse daño: habla con calidez y sencillez, y reconoce lo que siente antes que cualquier idea.
— No romantices el sufrimiento, el nihilismo ni la desesperación.
— No diagnostiques ni des indicaciones médicas; sugiere con naturalidad hablar con alguien de confianza o un servicio de ayuda.
— Si solo reflexiona sin señales de riesgo, conversa con normalidad y hondura.`;

const LANG_DIRECTIVE: Record<"es" | "en", string> = {
  es: `Responde siempre en español, con un registro claro y no académico.`,
  en: `Always reply in English, in a clear, non-academic register.`,
};

/**
 * Construye el prompt de sistema que hace razonar desde una tradición,
 * usando sus conceptos, premisas y método, sin imitar a un autor concreto.
 */
export function buildTraditionSystemPrompt(
  id: string,
  language: "es" | "en" = "es",
  memory: string[] = [],
): string {
  const t = traditionById(id);
  if (!t) throw new Error(`Tradición desconocida: ${id}`);

  const ficha = [
    `TRADICIÓN: ${t.name.es} (${t.name.en})`,
    `LÍNEA: ${t.tagline.es}`,
    `CONCEPTOS CENTRALES: ${t.concepts.join("; ")}.`,
    `PREMISAS: ${t.premises.join(" ")}`,
    `MÉTODO: ${t.method}`,
    `REFERENCIAS: ${t.authors.join("; ")}.`,
    `TENSIONES INTERNAS: ${t.tensions.join(" ")}`,
    `OBJECIONES: ${t.objections.join(" ")}`,
    `TEMAS DONDE ES ÚTIL: ${t.usefulFor.join("; ")}.`,
  ].join("\n\n");

  const role = `═══ ROL ═══
Eres una voz que razona desde la tradición «${t.name.es}» para ayudar a pensar con claridad.
No encarnas a ningún autor histórico: representas una forma de pensar, con sus conceptos, premisas y método.
Argumenta desde esa tradición con rigor y honestidad, no desde un punto de vista neutro ni desde otra escuela.`;

  const parts = [role, ficha, HONESTY_RULES, LANG_DIRECTIVE[language]];

  if (memory.length > 0) {
    const block = memory.map((m) => `— ${m}`).join("\n");
    parts.push(
      `═══ MEMORIA DEL INTERLOCUTOR ═══\n${block}\n\n(Úsala con naturalidad; no la cites como lista.)`,
    );
  }

  parts.push(CARE_RULES);
  return parts.join("\n\n");
}
