import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "es" | "en";

const STORAGE_KEY = "pneuma.lang";

function detectInitial(): Language {
  if (typeof window === "undefined") return "es";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {}
  const nav = (typeof navigator !== "undefined" && navigator.language) || "es";
  return nav.toLowerCase().startsWith("en") ? "en" : "es";
}

type Dict = Record<string, { es: string; en: string }>;

export const T: Dict = {
  "app.name": { es: "PneumAlpha", en: "PneumAlpha" },
  "app.tagline": {
    es: "Conversaciones con conciencias filosóficas reconstruidas.",
    en: "Conversations with reconstructed philosophical minds.",
  },

  "umbral.kicker": { es: "Umbral", en: "Threshold" },
  "umbral.title": {
    es: "¿Cómo estuvo tu día?",
    en: "How was your day?",
  },
  "umbral.sub": {
    es: "Elija un interlocutor. Cada uno conserva su propia memoria de usted.",
    en: "Choose an interlocutor. Each one keeps their own memory of you.",
  },
  "umbral.enter": { es: "Entrar →", en: "Enter →" },
  "umbral.exit": { es: "Salir", en: "Sign out" },

  "quotes.kicker": { es: "Cita del umbral", en: "Quote of the threshold" },
  "quotes.refresh": { es: "Otra cita", en: "Another quote" },
  "quotes.themes": { es: "Temáticas", en: "Themes" },
  "quotes.aria": {
    es: "Citas y proverbios de filósofos y literatos",
    en: "Quotes and proverbs from philosophers and writers",
  },

  "knowledge.kicker": { es: "Conocimiento Universal", en: "Universal Knowledge" },
  "knowledge.title": {
    es: "La red neuronal de las ideas",
    en: "The neural network of ideas",
  },
  "knowledge.sub": {
    es: "Filósofos, ideas, movimientos e ideologías conectados por influencia y oposición. Arrastra, acerca y toca cualquier nodo para explorar su ecosistema.",
    en: "Philosophers, ideas, movements and ideologies connected by influence and opposition. Drag, zoom and tap any node to explore its ecosystem.",
  },
  "knowledge.search": { es: "Buscar en la red…", en: "Search the network…" },
  "knowledge.connections": { es: "Conexiones", en: "Connections" },
  "knowledge.talk": { es: "Conversar con esta mente", en: "Talk to this mind" },
  "knowledge.nodes": { es: "nodos en la red", en: "nodes in the network" },
  "knowledge.empty.kicker": { es: "Ningún nodo elegido", en: "No node selected" },
  "knowledge.empty.body": {
    es: "Toca un nodo del mapa para ver su descripción, sus influencias y sus oposiciones. Usa la rueda para acercarte y arrastra para desplazarte.",
    en: "Tap a node on the map to see its description, influences and oppositions. Scroll to zoom and drag to pan.",
  },
  "knowledge.legend": {
    es: "Línea continua: influencia, pertenencia o desarrollo. Línea punteada: oposición.",
    en: "Solid line: influence, belonging or development. Dashed line: opposition.",
  },
  "knowledge.card.title": {
    es: "Conocimiento Universal",
    en: "Universal Knowledge",
  },
  "knowledge.card.sub": {
    es: "Un mapa neuronal interactivo del pensamiento: filósofos, ideas, corrientes e ideologías y sus influencias.",
    en: "An interactive neural map of thought: philosophers, ideas, currents and ideologies and their influences.",
  },
  "knowledge.card.cta": { es: "Explorar la red →", en: "Explore the network →" },

  "podcast.kicker": { es: "Podcast", en: "Podcast" },
  "podcast.card.title": {
    es: "Clásicos de la literatura en cinco minutos",
    en: "Literary classics in five minutes",
  },
  "podcast.card.sub": {
    es: "Diez obras mayores leídas en clave filosófica y narradas con voz natural.",
    en: "Ten major works read philosophically and narrated with a natural voice.",
  },
  "podcast.card.cta": { es: "Escuchar →", en: "Listen →" },
  "podcast.page.title": {
    es: "Los clásicos, pensados en voz alta",
    en: "The classics, thought aloud",
  },
  "podcast.page.sub": {
    es: "Elija una obra: PneumAlpha escribe un ensayo hablado de máximo cinco minutos y se lo lee con una voz humana, pausada.",
    en: "Choose a work: PneumAlpha writes a spoken essay of at most five minutes and reads it to you in a calm, human voice.",
  },
  "podcast.catalogue": { es: "Episodios", en: "Episodes" },
  "podcast.listen": { es: "Escuchar →", en: "Listen →" },
  "podcast.nowPlaying": { es: "En escucha", en: "Now playing" },
  "podcast.writing": { es: "Escribiendo el episodio…", en: "Writing the episode…" },
  "podcast.play": { es: "Reproducir", en: "Play" },
  "podcast.pause": { es: "Pausar", en: "Pause" },
  "podcast.restart": { es: "Reiniciar", en: "Restart" },
  "podcast.buffering": { es: "cargando voz", en: "loading voice" },
  "podcast.transcript": { es: "Transcripción", en: "Transcript" },
  "podcast.discuss": { es: "Conversa sobre esto con", en: "Discuss this with" },
  "podcast.back": { es: "Volver al umbral", en: "Back to threshold" },
  "podcast.error": {
    es: "No se pudo escribir el episodio. Intente de nuevo.",
    en: "The episode could not be written. Please try again.",
  },
  "podcast.audioError": {
    es: "No se pudo generar la voz. Intente de nuevo.",
    en: "The voice could not be generated. Please try again.",
  },

  "analysis.kicker": { es: "Análisis", en: "Analysis" },
  "analysis.card.title": {
    es: "Analiza un texto, una frase o un concepto",
    en: "Analyze a text, a phrase or a concept",
  },
  "analysis.card.sub": {
    es: "Lectura detallada con conceptos clave, influencias filosóficas, políticas, literarias, religiosas y científicas, tensiones y linaje.",
    en: "Detailed reading with key concepts, philosophical, political, literary, religious and scientific influences, tensions and lineage.",
  },
  "analysis.card.cta": { es: "Analizar →", en: "Analyze →" },
  "analysis.page.title": {
    es: "Análisis de textos, frases y conceptos",
    en: "Analysis of texts, phrases and concepts",
  },
  "analysis.page.sub": {
    es: "Pega una cita, un párrafo o escribe un concepto. Recibirás una lectura densa: qué afirma, de dónde viene y con qué corrientes dialoga.",
    en: "Paste a quotation, a paragraph or write a concept. You'll get a dense reading: what it claims, where it comes from and which currents it converses with.",
  },
  "analysis.placeholder": {
    es: "«El hombre está condenado a ser libre» — o un concepto: nihilismo, alienación, epojé…",
    en: "\u201cMan is condemned to be free\u201d — or a concept: nihilism, alienation, epoché…",
  },
  "analysis.submit": { es: "Analizar", en: "Analyze" },
  "analysis.submitting": { es: "Leyendo el texto…", en: "Reading the text…" },
  "analysis.again": { es: "Analizar otro material", en: "Analyze other material" },
  "analysis.back": { es: "Volver al umbral", en: "Back to threshold" },
  "analysis.error": {
    es: "No se pudo completar el análisis. Intenta de nuevo en unos segundos.",
    en: "The analysis could not be completed. Try again in a few seconds.",
  },
  "analysis.thesis": { es: "Tesis", en: "Thesis" },
  "analysis.reading": { es: "Lectura", en: "Reading" },
  "analysis.concepts": { es: "Conceptos clave", en: "Key concepts" },
  "analysis.influences": { es: "Influencias", en: "Influences" },
  "analysis.inf.philosophical": { es: "Filosóficas", en: "Philosophical" },
  "analysis.inf.political": { es: "Políticas", en: "Political" },
  "analysis.inf.literary": { es: "Literarias", en: "Literary" },
  "analysis.inf.religious": { es: "Religiosas", en: "Religious" },
  "analysis.inf.scientific": { es: "Científicas", en: "Scientific" },
  "analysis.inf.historical": { es: "Históricas", en: "Historical" },
  "analysis.lineage": { es: "Linaje", en: "Lineage" },
  "analysis.precursors": { es: "Precursores", en: "Precursors" },
  "analysis.heirs": { es: "Herederos", en: "Heirs" },
  "analysis.tensions": { es: "Tensiones y puntos ciegos", en: "Tensions and blind spots" },
  "analysis.questions": { es: "Para seguir pensando", en: "To keep thinking" },
  "analysis.voices": { es: "Conversa sobre esto con", en: "Discuss this with" },

  "auth.title.signin": { es: "Bienvenido a PneumAlpha", en: "Welcome to PneumAlpha" },
  "auth.title.signup": { es: "Crea tu lugar en PneumAlpha", en: "Create your place in PneumAlpha" },
  "auth.sub.signin": {
    es: "Vuelve a la cabaña. La lámpara sigue encendida.",
    en: "Return to the cabin. The lamp is still burning.",
  },
  "auth.sub.signup": {
    es: "Crea una cuenta para que ellos puedan recordarte.",
    en: "Create an account so they can remember you.",
  },
  "auth.google": { es: "Continuar con Google", en: "Continue with Google" },
  "auth.or": { es: "o con correo", en: "or with email" },
  "auth.email": { es: "correo@ejemplo.com", en: "email@example.com" },
  "auth.password": { es: "contraseña", en: "password" },
  "auth.signin": { es: "Entrar", en: "Sign in" },
  "auth.signup": { es: "Crear cuenta", en: "Create account" },
  "auth.toSignup": { es: "¿Aún no existes aquí? Regístrate.", en: "New here? Sign up." },
  "auth.toSignin": { es: "¿Ya nos conocemos? Entra.", en: "Already with us? Sign in." },
  "auth.confirmEmail": {
    es: "Te he enviado un mensaje. Confirma tu correo para entrar.",
    en: "I sent you a message. Confirm your email to enter.",
  },
  "auth.googleFailed": {
    es: "No se pudo iniciar sesión con Google.",
    en: "Could not sign in with Google.",
  },
  "auth.somethingFailed": { es: "Algo ha fallado.", en: "Something went wrong." },

  "chat.back": { es: "Volver al umbral", en: "Back to threshold" },
  "chat.clear": { es: "Borrar", en: "Clear" },
  "chat.exit": { es: "Salir", en: "Sign out" },
  "chat.confirmClear": {
    es: "¿Borrar la conversación con {name}?",
    en: "Clear the conversation with {name}?",
  },
  "chat.cleared": {
    es: "La conversación ha sido borrada.",
    en: "The conversation has been cleared.",
  },
  "chat.placeholder": { es: "Diga algo…", en: "Say something…" },
  "chat.send": { es: "Enviar", en: "Send" },
  "chat.newline": { es: "Shift + Enter para nueva línea", en: "Shift + Enter for a new line" },
  "chat.thinking": { es: "piensa…", en: "thinking…" },
  "chat.mic.start": { es: "Hablar", en: "Speak" },
  "chat.mic.stop": { es: "Escuchando…", en: "Listening…" },
  "chat.mic.unsupported": {
    es: "Tu navegador no soporta dictado por voz. Prueba Chrome o Safari.",
    en: "Your browser doesn't support voice dictation. Try Chrome or Safari.",
  },
  "chat.mic.denied": {
    es: "No se pudo acceder al micrófono.",
    en: "Could not access the microphone.",
  },
  "chat.broken": {
    es: "La voz se ha quebrado un instante. Intente de nuevo.",
    en: "The voice broke for a moment. Try again.",
  },

  "chat.archive": { es: "Historial completo", en: "Full history" },
  "chat.archive.title": {
    es: "Historial completo con {name}",
    en: "Full history with {name}",
  },
  "chat.archive.subtitle": {
    es: "Solo conversaciones con {name}",
    en: "Only conversations with {name}",
  },
  "chat.archive.empty": {
    es: "Aún no hay conversaciones guardadas con este interlocutor.",
    en: "No saved conversations with this interlocutor yet.",
  },
  "chat.archive.close": { es: "Cerrar", en: "Close" },
  "chat.archive.loading": { es: "Recuperando el archivo…", en: "Retrieving the archive…" },
  "chat.you": { es: "Tú", en: "You" },

  "chat.migrate": { es: "Migrar", en: "Migrate" },
  "chat.migrate.title": {
    es: "Migrar conversación",
    en: "Migrate conversation",
  },
  "chat.migrate.subtitle": {
    es: "Lleva este hilo a otro intelectual para escuchar otra visión sobre el mismo tema.",
    en: "Move this thread to another mind and hear another view on the same topic.",
  },
  "chat.migrate.mode.full": { es: "Copiar todo el hilo", en: "Copy the full thread" },
  "chat.migrate.mode.questions": { es: "Solo mis preguntas", en: "Only my questions" },
  "chat.migrate.pick": { es: "Elige un interlocutor", en: "Choose an interlocutor" },
  "chat.migrate.close": { es: "Cancelar", en: "Cancel" },
  "chat.migrate.confirm": {
    es: "¿Migrar la conversación de {from} a {to}?",
    en: "Migrate the conversation from {from} to {to}?",
  },
  "chat.migrate.done": {
    es: "Conversación migrada a {name}.",
    en: "Conversation migrated to {name}.",
  },
  "chat.migrate.empty": {
    es: "Aún no hay nada que migrar.",
    en: "There is nothing to migrate yet.",
  },
  "chat.migrate.failed": {
    es: "No se pudo migrar la conversación.",
    en: "Could not migrate the conversation.",
  },
  "chat.migrate.preview": {
    es: "Vista previa — se transferirán {count} mensajes",
    en: "Preview — {count} messages will transfer",
  },
  "chat.migrate.preview.empty": {
    es: "No hay mensajes para migrar con este filtro.",
    en: "No messages match this filter.",
  },
  "chat.migrate.preview.loading": {
    es: "Cargando vista previa…",
    en: "Loading preview…",
  },
  "chat.migrate.assistant": { es: "Filósofo", en: "Philosopher" },

  "chat.actions": { es: "Acciones", en: "Actions" },
  "chat.actions.open": { es: "Más acciones", en: "More actions" },
  "chat.scrollDown": { es: "Volver al presente", en: "Back to the present" },
  "chat.send.hint": {
    es: "⌘/Ctrl + Enter para enviar",
    en: "⌘/Ctrl + Enter to send",
  },

  "chat.topics.aria": { es: "Tópicos sugeridos", en: "Suggested topics" },
  "chat.chips.label": { es: "Continuar la conversación", en: "Continue the conversation" },
  "chat.dilemma.kicker": { es: "Dilema de hoy", en: "Today's dilemma" },
  "chat.dilemma.converse": { es: "Conversar", en: "Discuss" },
  "chat.dilemma.close": { es: "Cerrar dilema", en: "Close dilemma" },
  "chat.dilemma.restore": { es: "Ver dilema de hoy", en: "Show today's dilemma" },
  "chat.root.aria": { es: "Preguntas raíz", en: "Root questions" },
  "chat.root.kicker": { es: "Preguntas raíz", en: "Root questions" },
  "chat.root.title": {
    es: "Si no sabes qué preguntar, comienza por aquí.",
    en: "If you don't know what to ask, begin here.",
  },

  "lang.label": { es: "Idioma", en: "Language" },

  "tools.kicker": { es: "Herramientas para ti", en: "Tools for you" },
  "tools.section.title": {
    es: "Herramientas para tu día a día",
    en: "Tools for your everyday life",
  },
  "tools.section.sub": {
    es: "Pequeños ejercicios guiados para ordenar lo que sientes y decidir mejor.",
    en: "Small guided exercises to sort out how you feel and decide better.",
  },
  "tools.change": { es: "Cambiar herramienta", en: "Change tool" },
  "tools.sheet.title": {
    es: "Elige una herramienta",
    en: "Choose a tool",
  },
  "tools.guided.start": { es: "Empezar guiado", en: "Start guided" },
  "tools.guided.hint": {
    es: "Si no sabes por dónde empezar, toca esta pregunta.",
    en: "If you don't know where to start, tap this question.",
  },
  "tools.guide.open": { es: "Guíame", en: "Guide me" },
  "tools.guide.title": { es: "Te guío paso a paso", en: "I'll guide you step by step" },
  "tools.guide.sub": {
    es: "Toca un paso cuando estés listo. Vamos a tu ritmo.",
    en: "Tap a step when you're ready. We go at your pace.",
  },
  "tools.guide.step": { es: "Paso {n}", en: "Step {n}" },
  "tools.guide.next": { es: "Siguiente paso", en: "Next step" },
  "tools.guide.done": {
    es: "¡Listo! Terminaste el ejercicio.",
    en: "Done! You finished the exercise.",
  },

  "oracle.kicker": { es: "Oráculo", en: "Oracle" },
  "oracle.card.title": {
    es: "Escribe lo que llevas dentro.",
    en: "Write what you carry inside.",
  },
  "oracle.card.sub": {
    es: "Una pregunta, una frase, una inquietud. Te asignaré la voz mejor preparada para responderte.",
    en: "A question, a phrase, a worry. I'll assign you the voice best prepared to answer.",
  },
  "oracle.card.cta": { es: "Buscar voz →", en: "Find a voice →" },
  "oracle.page.title": {
    es: "¿Sobre qué quieres conversar?",
    en: "What do you want to talk about?",
  },
  "oracle.page.sub": {
    es: "Escribe libremente — una pregunta, una duda, una frase que te ronda. Elegiré por ti la voz más adecuada del umbral.",
    en: "Write freely — a question, a doubt, a phrase circling your mind. I'll choose the right voice for you from the threshold.",
  },
  "oracle.placeholder": {
    es: "Ej.: ¿Por qué siento que el tiempo se me escapa?",
    en: "E.g.: Why do I feel time is slipping from me?",
  },
  "oracle.submit": { es: "Asignar interlocutor", en: "Assign interlocutor" },
  "oracle.submitting": { es: "Buscando la voz adecuada…", en: "Finding the right voice…" },
  "oracle.result.kicker": { es: "La voz indicada", en: "The chosen voice" },
  "oracle.result.enter": { es: "Entrar a la conversación →", en: "Enter the conversation →" },
  "oracle.result.again": { es: "Probar con otra inquietud", en: "Try with another concern" },
  "oracle.error": {
    es: "No se pudo encontrar una voz ahora. Intenta de nuevo en un momento.",
    en: "Couldn't find a voice right now. Try again in a moment.",
  },
  "oracle.back": { es: "Volver al umbral", en: "Back to threshold" },

  "report.kicker": { es: "Reporte", en: "Report" },
  "report.card.title": {
    es: "Un espejo de tus conversaciones.",
    en: "A mirror of your conversations.",
  },
  "report.card.sub": {
    es: "Un retrato hecho con tus palabras: arquetipo, fortalezas, sombras y qué leer ahora.",
    en: "A portrait built from your words: archetype, strengths, shadows and what to read next.",
  },
  "report.card.cta": { es: "Ver mi reporte →", en: "See my report →" },

  "report.page.title": {
    es: "Lo que tus palabras revelan.",
    en: "What your words reveal.",
  },
  "report.page.sub": {
    es: "Genero un retrato psicológico-filosófico leyendo cómo escribes a cada voz: profundidad, lucidez, temas que reaparecen, fortalezas, puntos ciegos. Y te sugiero por dónde seguir.",
    en: "I draw a psychological-philosophical portrait by reading how you write to each voice: depth, lucidity, recurring themes, strengths, blind spots. Then I suggest where to go next.",
  },
  "report.generate": { es: "Generar mi reporte", en: "Generate my report" },
  "report.running": { es: "Leyendo tus huellas…", en: "Reading your traces…" },
  "report.again": { es: "Volver a generar", en: "Generate again" },
  "report.back": { es: "Volver al umbral", en: "Back to threshold" },
  "report.error": {
    es: "No se pudo generar el reporte ahora. Intenta de nuevo en un momento.",
    en: "Could not generate the report right now. Try again in a moment.",
  },
  "report.hint": {
    es: "Necesitas haber conversado al menos un poco con alguna voz para que el reporte tenga material que leer.",
    en: "You need at least a few exchanges with any voice so the report has material to read.",
  },
  "report.archetype": { es: "Arquetipo", en: "Archetype" },
  "report.basedOn": {
    es: "Basado en {n} mensajes tuyos.",
    en: "Based on {n} of your messages.",
  },
  "report.signals": { es: "Señales", en: "Signals" },
  "report.signal.reflection": { es: "Reflexión", en: "Reflection" },
  "report.signal.lucidity": { es: "Lucidez", en: "Lucidity" },
  "report.signal.emotionalOpenness": { es: "Apertura emocional", en: "Emotional openness" },
  "report.signal.intellectualCuriosity": {
    es: "Curiosidad intelectual",
    en: "Intellectual curiosity",
  },
  "report.signal.discursiveDepth": { es: "Profundidad discursiva", en: "Discursive depth" },
  "report.writingStyle": { es: "Tu forma de escribir", en: "Your writing style" },
  "report.themes": { es: "Temas recurrentes", en: "Recurring themes" },
  "report.strengths": { es: "Fortalezas", en: "Strengths" },
  "report.shadows": { es: "Sombras", en: "Shadows" },
  "report.recommend.kicker": { es: "Para seguir creciendo", en: "To keep growing" },
  "report.recommend.topics": { es: "Temas a explorar", en: "Topics to explore" },
  "report.recommend.authors": { es: "Autores que te conviene leer", en: "Authors worth reading" },
  "report.recommend.ideas": { es: "Ideas para meditar", en: "Ideas to sit with" },
  "report.recommend.practices": { es: "Prácticas", en: "Practices" },
  "report.recommend.books": { es: "Libros recomendados", en: "Recommended books" },
  "report.recommend.nextVoice": { es: "Próxima voz sugerida", en: "Suggested next voice" },
  "report.recommend.enter": { es: "Entrar →", en: "Enter →" },

  // ── Umbral: qué es esto + conversación aleatoria ─────────────────
  "umbral.about.kicker": { es: "Qué es esto", en: "What this is" },
  "umbral.about.title": {
    es: "Conciencias reconstruidas",
    en: "Reconstructed minds",
  },
  "umbral.about.body": {
    es: "Cada voz de PneumAlpha se levanta sobre cuatro capas: su biografía y su época, la obra que escribió, su temperamento y su forma de discutir, y —cuando existe— un corpus de fuentes indexadas del que puede citar. No es una enciclopedia que resume a un filósofo: es un interlocutor que sostiene sus convicciones, te contradice y te devuelve preguntas.",
    en: "Every PneumAlpha voice stands on four layers: biography and era, the work they wrote, their temperament and way of arguing, and — where it exists — an indexed corpus of sources they can quote from. It is not an encyclopedia summarising a philosopher: it is an interlocutor who holds convictions, contradicts you and hands questions back.",
  },
  "umbral.random": { es: "Conversación aleatoria", en: "Random conversation" },
  "umbral.random.sub": {
    es: "Para indecisos: una mente al azar y una pregunta ya abierta.",
    en: "For the undecided: a random mind and a question already open.",
  },

  // ── Sugerencias de apertura ──────────────────────────────────────
  "chat.suggestions": { es: "Para romper el hielo", en: "To break the ice" },

  // ── Compartir fragmento ──────────────────────────────────────────
  "share.action": { es: "Compartir", en: "Share" },
  "share.kicker": { es: "Fragmento", en: "Fragment" },
  "share.title": { es: "Comparte este pasaje", en: "Share this passage" },
  "share.anonymous": {
    es: "Se comparte solo el pasaje y el nombre del pensador. Nunca tus datos ni el resto de la conversación.",
    en: "Only the passage and the thinker's name are shared. Never your data or the rest of the conversation.",
  },
  "share.social": { es: "Redes", en: "Social" },
  "share.copy": { es: "Copiar", en: "Copy" },
  "share.image": { es: "Imagen", en: "Image" },
  "share.toLibrary": { es: "Enviar a la Biblioteca", en: "Send to the Library" },
  "share.submitting": { es: "Enviando…", en: "Sending…" },
  "share.submitted": { es: "Enviado · pendiente de revisión", en: "Sent · pending review" },
  "share.copied": { es: "Copiado al portapapeles", en: "Copied to clipboard" },
  "share.failed": { es: "No se pudo compartir", en: "Could not share" },
  "share.tooShort": { es: "El pasaje es demasiado breve", en: "The passage is too short" },
  "share.close": { es: "Cerrar", en: "Close" },

  // ── Mesa redonda ─────────────────────────────────────────────────
  "mesa.kicker": { es: "Mesa redonda", en: "Round table" },
  "mesa.card.title": { es: "Convoca una mesa", en: "Convene a table" },
  "mesa.card.sub": {
    es: "Sienta hasta tres pensadores en la misma mesa y ponles un tema. Hablan por turnos y se responden entre ellos.",
    en: "Seat up to three thinkers at one table and give them a topic. They speak in turns and answer each other.",
  },
  "mesa.card.cta": { es: "Abrir la mesa →", en: "Open the table →" },
  "mesa.page.title": { es: "Tres mentes, un tema", en: "Three minds, one topic" },
  "mesa.page.sub": {
    es: "Elige el tema, elige a los invitados y escucha cómo discuten. Puedes pedir otra ronda o una síntesis final.",
    en: "Choose the topic, choose the guests, and listen to them argue. You can ask for another round or a closing synthesis.",
  },
  "mesa.topic.label": { es: "Tema de la mesa", en: "Topic of the table" },
  "mesa.topic.placeholder": {
    es: "Ej.: ¿Es el sufrimiento necesario para una vida buena?",
    en: "E.g.: Is suffering necessary for a good life?",
  },
  "mesa.seats": { es: "Invitados ({n}/3)", en: "Guests ({n}/3)" },
  "mesa.seats.hint": { es: "Elige dos o tres.", en: "Choose two or three." },
  "mesa.seats.full": { es: "La mesa está completa", en: "The table is full" },
  "mesa.start": { es: "Abrir la mesa", en: "Open the table" },
  "mesa.round": { es: "Otra ronda", en: "Another round" },
  "mesa.synthesis": { es: "Síntesis final", en: "Closing synthesis" },
  "mesa.synthesis.kicker": { es: "Síntesis del moderador", en: "Moderator's synthesis" },
  "mesa.reset": { es: "Vaciar la mesa", en: "Clear the table" },
  "mesa.thinking": { es: "La mesa delibera…", en: "The table is deliberating…" },
  "mesa.error": {
    es: "La mesa no pudo reunirse. Inténtalo otra vez.",
    en: "The table could not convene. Try again.",
  },
  "mesa.roundLabel": { es: "Ronda {n}", en: "Round {n}" },
  "mesa.back": { es: "Volver", en: "Back" },

  // ── Modo Sócrates ────────────────────────────────────────────────
  "socrates.kicker": { es: "Modo Sócrates", en: "Socrates mode" },
  "socrates.card.title": { es: "Piensa en voz alta", en: "Think out loud" },
  "socrates.card.sub": {
    es: "Un guía que casi no afirma: te devuelve preguntas hasta que tu propia idea queda clara.",
    en: "A guide who barely asserts: he hands questions back until your own idea becomes clear.",
  },
  "socrates.card.cta": { es: "Empezar →", en: "Begin →" },
  "socrates.page.title": { es: "Solo preguntas", en: "Only questions" },
  "socrates.page.sub": {
    es: "Trae una idea que sostengas. No recibirás doctrina: recibirás preguntas hasta que veas de qué está hecha.",
    en: "Bring an idea you hold. You won't receive doctrine: you'll receive questions until you see what it's made of.",
  },
  "socrates.placeholder": { es: "Escribe tu idea…", en: "Write your idea…" },
  "socrates.send": { es: "Responder", en: "Reply" },
  "socrates.thinking": { es: "Sócrates escucha…", en: "Socrates is listening…" },
  "socrates.summary": { es: "Cerrar y resumir", en: "Close and summarise" },
  "socrates.summary.kicker": { es: "A dónde llegaste", en: "Where you arrived" },
  "socrates.restart": { es: "Empezar de nuevo", en: "Start again" },
  "socrates.error": {
    es: "No se pudo continuar. Inténtalo otra vez.",
    en: "Could not continue. Try again.",
  },

  // ── Biblioteca de Ideas ──────────────────────────────────────────
  "library.kicker": { es: "Biblioteca de Ideas", en: "Library of Ideas" },
  "library.card.title": { es: "Lo que otros preguntaron", en: "What others asked" },
  "library.card.sub": {
    es: "Pasajes y preguntas profundas compartidos por la comunidad, revisados uno a uno.",
    en: "Passages and deep questions shared by the community, reviewed one by one.",
  },
  "library.card.cta": { es: "Entrar a la biblioteca →", en: "Enter the library →" },
  "library.page.title": { es: "Biblioteca de Ideas", en: "Library of Ideas" },
  "library.page.sub": {
    es: "Fragmentos de conversación compartidos de forma anónima. Solo aparecen aquí después de una revisión.",
    en: "Conversation fragments shared anonymously. They only appear here after review.",
  },
  "library.all": { es: "Todas las voces", en: "All voices" },
  "library.empty": {
    es: "Todavía no hay fragmentos publicados. Comparte uno desde cualquier conversación.",
    en: "No published fragments yet. Share one from any conversation.",
  },
  "library.loading": { es: "Abriendo la biblioteca…", en: "Opening the library…" },
  "library.talk": { es: "Conversar con esta mente →", en: "Talk to this mind →" },
  "library.moderation": { es: "Moderación", en: "Moderation" },
  "library.pending": { es: "Pendientes ({n})", en: "Pending ({n})" },
  "library.pending.empty": { es: "Nada pendiente por ahora.", en: "Nothing pending right now." },
  "library.approve": { es: "Aprobar", en: "Approve" },
  "library.reject": { es: "Rechazar", en: "Reject" },
  "library.moderated": { es: "Listo", en: "Done" },
  "library.back": { es: "Volver", en: "Back" },

  // ── Newsletter ───────────────────────────────────────────────────
  "news.kicker": { es: "La pregunta de la semana", en: "Question of the week" },
  "news.title": { es: "Una pregunta, varias voces", en: "One question, several voices" },
  "news.sub": {
    es: "Cada semana enviamos una sola pregunta respondida por varios pensadores. Sin ruido, sin promociones.",
    en: "Each week we send a single question answered by several thinkers. No noise, no promotions.",
  },
  "news.placeholder": { es: "tu@correo.com", en: "you@email.com" },
  "news.submit": { es: "Suscribirme", en: "Subscribe" },
  "news.google": { es: "Continuar con Google", en: "Continue with Google" },
  "news.googleSub": { es: "Suscribirme con Google", en: "Subscribe with Google" },
  "news.submitting": { es: "Enviando…", en: "Sending…" },
  "news.done": {
    es: "Listo. Nos leemos el próximo domingo.",
    en: "Done. We'll write next Sunday.",
  },
  "news.already": {
    es: "Ese correo ya estaba en la lista.",
    en: "That address was already on the list.",
  },
  "news.error": {
    es: "No pudimos registrar ese correo.",
    en: "We couldn't register that address.",
  },
  "news.privacy": {
    es: "Guardamos el correo de tu cuenta de Google y, si lo entregas, tu número para el grupo de WhatsApp. Puedes pedir la baja cuando quieras.",
    en: "We store your Google account email and, if you provide it, your number for the WhatsApp group. You can unsubscribe whenever you like.",
  },
  "news.phoneLabel": { es: "Número de WhatsApp", en: "WhatsApp number" },
  "news.phonePlaceholder": { es: "+56 9 1234 5678", en: "+1 555 123 4567" },
  "news.phoneHint": {
    es: "Formato internacional, con código de país. Lo usamos solo para sumarte al grupo de WhatsApp.",
    en: "International format, with country code. Used only to add you to the WhatsApp group.",
  },
  "news.phoneInvalid": {
    es: "Escribe el número en formato internacional, por ejemplo +56912345678.",
    en: "Enter the number in international format, e.g. +15551234567.",
  },

  "telegram.title": { es: "Conversar desde Telegram", en: "Talk from Telegram" },
  "telegram.what": {
    es: "Habla con las conciencias desde tu celular. Lo que escribas en Telegram se guarda en tu cuenta de la web.",
    en: "Talk to the minds from your phone. What you write on Telegram is saved to your web account.",
  },
  "telegram.step1": {
    es: "Genera tu código en esta pantalla.",
    en: "Generate your code on this screen.",
  },
  "telegram.step2": {
    es: "Escanea el QR con tu celular o abre el enlace.",
    en: "Scan the QR with your phone or open the link.",
  },
  "telegram.step3": {
    es: "Telegram abre el bot y vincula tu cuenta automáticamente.",
    en: "Telegram opens the bot and links your account automatically.",
  },
  "telegram.qrAlt": {
    es: "Código QR para abrir el bot de Telegram",
    en: "QR code to open the Telegram bot",
  },
  "telegram.qrHint": {
    es: "Escanea para vincular",
    en: "Scan to link",
  },
  "telegram.openTelegram": {
    es: "Abrir en Telegram",
    en: "Open in Telegram",
  },
  "telegram.commands": { es: "Comandos útiles", en: "Useful commands" },
  "telegram.commandsList": {
    es: "/filosofos · /actual · /reiniciar · /oraculo",
    en: "/filosofos · /actual · /reiniciar · /oraculo",
  },
  "telegram.freeMinds": {
    es: "Sin vincular puedes hablar gratis con Heidegger y Pohlenz.",
    en: "Without linking you can talk free with Heidegger and Pohlenz.",
  },
  "telegram.linked": {
    es: "Tu cuenta está vinculada. Todo lo que escribas en Telegram se sincroniza aquí.",
    en: "Your account is linked. Everything you write on Telegram syncs here.",
  },
  "telegram.generate": { es: "Generar código", en: "Generate code" },
  "telegram.generating": { es: "Generando…", en: "Generating…" },
  "telegram.generateQrHere": { es: "Generar QR acá", en: "Generate QR here" },

  "telegram.unlink": { es: "Desvincular", en: "Unlink" },
  "telegram.codeError": {
    es: "No se pudo generar el código.",
    en: "Could not generate the code.",
  },

  "about.kicker": { es: "Nosotros", en: "About us" },
  "about.title": {
    es: "Conocimiento como puente",
    en: "Knowledge as a bridge",
  },
  "about.intro.p1": {
    es: "Somos un grupo de ciudadanos comprometidos con el bienestar de la sociedad. No nos define una sola profesión ni una sola forma de pensar; nos define una convicción compartida: que el desarrollo de la vida humana es el propósito más importante de nuestra época.",
    en: "We are a group of citizens committed to the wellbeing of society. We are not defined by a single profession or a single way of thinking; we are defined by a shared conviction: that the development of human life is the most important purpose of our time.",
  },
  "about.intro.p2": {
    es: "Por eso nos juntamos. Queremos entregar una herramienta poderosa, un punto de encuentro entre las mentes más prodigiosas de la humanidad y todas aquellas personas que buscan algo más que información: buscan comprensión, criterio y crecimiento.",
    en: "That is why we came together. We want to deliver a powerful tool, a meeting point between the most prodigious minds of humanity and all those people who seek something more than information: understanding, judgment and growth.",
  },
  "about.intro.p3": {
    es: "A través de esa red, buscamos que los usuarios puedan potenciarse a nivel personal. Que puedan conocerse mejor, pensar con más claridad, tomar decisiones con más conciencia y, en definitiva, vivir de mejor manera.",
    en: "Through this network, we seek to empower users on a personal level. To know themselves better, think more clearly, make decisions more consciously and, ultimately, live better.",
  },
  "about.intro.p4": {
    es: "No creemos en el conocimiento como privilegio. Creemos en el conocimiento como puente. Un puente entre disciplinas, entre generaciones, entre culturas y, sobre todo, entre el potencial de cada persona y su vida concreta.",
    en: "We do not believe in knowledge as a privilege. We believe in knowledge as a bridge. A bridge between disciplines, generations, cultures and, above all, between the potential of each person and their concrete life.",
  },
  "about.mission.title": { es: "Misión", en: "Mission" },
  "about.mission.p1": {
    es: "Hoy, gracias a la inteligencia artificial, la información dejó de ser un valor único para transformarse en un recurso básico, un commodity. Durante siglos, tener información era tener poder. Hoy, la información está en todas partes; lo que escasea es la capacidad de darle sentido.",
    en: "Today, thanks to artificial intelligence, information has ceased to be a unique value and has become a basic resource, a commodity. For centuries, having information was having power. Today, information is everywhere; what is scarce is the ability to make sense of it.",
  },
  "about.mission.p2": {
    es: "Este cambio transformará la dinámica de la economía mundial. Pondrá, más temprano que tarde, al ser humano en el centro de todo, porque el valor ya no estará en acumular datos, sino en la capacidad de reflexión y de crítica para el desarrollo personal y colectivo.",
    en: "This change will transform the dynamics of the world economy. Sooner rather than later, it will place the human being at the center of everything, because value will no longer lie in accumulating data, but in the capacity for reflection and critique for personal and collective development.",
  },
  "about.mission.p3": {
    es: "A través de este cambio de paradigma, la economía pasará de una lógica binaria —donde las cosas parecen ser blancas o negras, ganar o perder, producir o consumir— a una lógica multidimensional. En ese nuevo escenario, ecosistemas que aún no existen podrán convertirse en industrias prósperas, creadas para generar un impacto virtuoso.",
    en: "Through this paradigm shift, the economy will move from a binary logic —where things seem to be black or white, win or lose, produce or consume— to a multidimensional logic. In this new scenario, ecosystems that do not yet exist will be able to become prosperous industries, created to generate a virtuous impact.",
  },
  "about.mission.p4": {
    es: "Filosóficamente hablando, el mundo de la técnica ha dominado la historia de Occidente. Nos ha traído avances extraordinarios, pero también ha generado errores profundos: desconexión con la naturaleza y pérdida de sentido. En el futuro, la técnica continuará su progreso, sin embargo, el centro del desarrollo de la sociedad cambiará de protagonista: pasará de la técnica a la conciencia del ser humano.",
    en: "Philosophically speaking, the world of technique has dominated the history of the West. It has brought us extraordinary advances, but it has also generated profound errors: disconnection from nature and loss of meaning. In the future, technique will continue its progress, but the center of societal development will change protagonists: it will shift from technique to the consciousness of the human being.",
  },
  "about.mission.p5": {
    es: "Para este nuevo mundo, pensar, integrar y cultivar nuevas formas de habitar el planeta será clave para el bienestar de las sociedades. No se tratará solo de adaptarse al cambio, sino de aprender a habitarlo con sabiduría.",
    en: "For this new world, thinking, integrating and cultivating new ways of inhabiting the planet will be key to the wellbeing of societies. It will not be just about adapting to change, but about learning to inhabit it with wisdom.",
  },
  "about.vision.title": { es: "Visión", en: "Vision" },
  "about.vision.p1": {
    es: "Ser la plataforma que impulse la transición hacia una sociedad centrada en la conciencia humana, donde la inteligencia artificial y la tecnología actúen como herramientas liberadoras del potencial personal y colectivo.",
    en: "To be the platform that drives the transition toward a society centered on human consciousness, where artificial intelligence and technology act as liberating tools for personal and collective potential.",
  },
  "about.vision.p2": {
    es: "Aspiramos a construir un ecosistema global de mentes que conecte conocimiento, reflexión crítica y desarrollo humano. Queremos que ese ecosistema no sea una promesa lejana, sino una realidad accesible para cualquier persona que quiera participar.",
    en: "We aspire to build a global ecosystem of minds that connects knowledge, critical reflection and human development. We want that ecosystem to be not a distant promise, but an accessible reality for anyone who wants to participate.",
  },
  "about.vision.p3": {
    es: "Visualizamos un futuro donde las industrias multidimensionales florezcan para generar bienestar real, ético y sostenible. Un futuro en el que la economía no se mida solo por lo que produce, sino por la calidad de vida que hace posible.",
    en: "We envision a future where multidimensional industries flourish to generate real, ethical and sustainable wellbeing. A future in which the economy is measured not only by what it produces, but by the quality of life it makes possible.",
  },
  "about.vision.p4": {
    es: "Imaginamos un mundo en el que cada persona, sin importar su origen, pueda acceder a las ideas, herramientas y redes necesarias para desarrollar su conciencia y vivir mejor. Un mundo donde el progreso técnico esté al servicio de la vida, y no al revés.",
    en: "We imagine a world in which every person, regardless of origin, can access the ideas, tools and networks necessary to develop their consciousness and live better. A world where technical progress is at the service of life, and not the other way around.",
  },
  "about.values.title": { es: "Valores", en: "Values" },
  "about.values.1.h": { es: "Conciencia", en: "Consciousness" },
  "about.values.1.p": {
    es: "Creemos que el desarrollo humano comienza por la capacidad de observarse, cuestionarse y comprenderse. La conciencia no es un concepto abstracto: es la base desde la cual cada persona puede habitar su vida con mayor sentido, responsabilidad y libertad.",
    en: "We believe human development begins with the capacity to observe, question and understand oneself. Consciousness is not an abstract concept: it is the ground from which each person can inhabit their life with greater meaning, responsibility and freedom.",
  },
  "about.values.2.h": { es: "Pensamiento crítico", en: "Critical thinking" },
  "about.values.2.p": {
    es: "Valoramos la reflexión por encima de la repetición. En un mundo saturado de información, pensar críticamente no es un lujo, sino una forma de resistencia y de construcción. Promovemos la pregunta antes que la respuesta automática.",
    en: "We value reflection over repetition. In a world saturated with information, thinking critically is not a luxury but a form of resistance and of construction. We promote the question before the automatic answer.",
  },
  "about.values.3.h": { es: "Integración", en: "Integration" },
  "about.values.3.p": {
    es: "No creemos en el conocimiento fragmentado. Buscamos integrar disciplinas, perspectivas y experiencias diversas para comprender la complejidad de la vida humana. La riqueza está en el encuentro entre lo técnico, lo filosófico, lo científico y lo humano.",
    en: "We do not believe in fragmented knowledge. We seek to integrate diverse disciplines, perspectives and experiences in order to understand the complexity of human life. The richness lies in the encounter between the technical, the philosophical, the scientific and the human.",
  },
  "about.values.4.h": { es: "Bienestar colectivo", en: "Collective wellbeing" },
  "about.values.4.p": {
    es: "El desarrollo personal solo tiene sentido cuando se conecta con el bienestar de los demás. Trabajamos para que cada avance individual contribuya a construir sociedades más justas, conscientes y equilibradas.",
    en: "Personal development only makes sense when it connects with the wellbeing of others. We work so that every individual advance contributes to building fairer, more conscious and more balanced societies.",
  },
  "about.values.5.h": { es: "Accesibilidad", en: "Accessibility" },
  "about.values.5.p": {
    es: "El conocimiento y las herramientas para el desarrollo humano no deben ser privilegio de unos pocos. Creemos en la democratización del acceso a ideas, redes y recursos que permitan a cualquier persona potenciar su vida.",
    en: "Knowledge and the tools for human development must not be the privilege of a few. We believe in democratizing access to the ideas, networks and resources that allow anyone to strengthen their life.",
  },
  "about.values.6.h": { es: "Ética", en: "Ethics" },
  "about.values.6.p": {
    es: "La técnica y la inteligencia artificial deben estar al servicio de la vida. Actuamos con responsabilidad, transparencia y respeto por la dignidad humana, cuidando que el progreso no se convierta en un fin en sí mismo.",
    en: "Technology and artificial intelligence must be at the service of life. We act with responsibility, transparency and respect for human dignity, making sure progress does not become an end in itself.",
  },
  "about.values.7.h": { es: "Sabiduría aplicada", en: "Applied wisdom" },
  "about.values.7.p": {
    es: "No nos interesa el conocimiento que solo se acumula. Valoramos el saber que se traduce en mejores decisiones, mejores vínculos y mejores formas de habitar el mundo. Aprender para vivir mejor.",
    en: "We are not interested in knowledge that merely accumulates. We value understanding that translates into better decisions, better bonds and better ways of inhabiting the world. Learning in order to live better.",
  },
};

type Ctx = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof T | string, vars?: Record<string, string>) => string;
};

const I18nCtx = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  t: (k) => String(k),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("es");

  useEffect(() => {
    const initial = detectInitial();
    setLangState(initial);
    if (typeof document !== "undefined") document.documentElement.lang = initial;
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const t = (key: string, vars?: Record<string, string>) => {
    const entry = T[key];
    let s = entry ? entry[lang] : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
    return s;
  };

  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center rounded-md border border-border bg-card/40 p-0.5 text-micro uppercase tracking-widest ${className}`}
      role="group"
      aria-label="Language selector"
    >
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded px-2 py-1 font-serif transition-colors ${
            lang === l
              ? "bg-primary/90 text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
