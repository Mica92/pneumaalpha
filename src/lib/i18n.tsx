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
  "app.name": { es: "PneumaA", en: "PneumaA" },
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

  "auth.title.signin": { es: "Bienvenido a PneumaA", en: "Welcome to PneumaA" },
  "auth.title.signup": { es: "Crea tu lugar en PneumaA", en: "Create your place in PneumaA" },
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
  "chat.cleared": { es: "La conversación ha sido borrada.", en: "The conversation has been cleared." },
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
  "tools.guide.done": { es: "¡Listo! Terminaste el ejercicio.", en: "Done! You finished the exercise." },

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
      className={`inline-flex items-center rounded-md border border-border bg-card/40 p-0.5 text-[10px] uppercase tracking-widest ${className}`}
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
