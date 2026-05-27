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

  "lang.label": { es: "Idioma", en: "Language" },
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
