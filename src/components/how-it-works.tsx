import { useEffect, useState } from "react";

/** Se muestra una sola vez; el usuario puede ocultarlo para siempre. */
const STORAGE_KEY = "pneuma.concepts.dismissed";

const COPY = {
  es: {
    kicker: "Antes de empezar",
    title: "Cuatro palabras que conviene entender",
    close: "Entendido, ocultar",
    items: [
      {
        term: "Perspectiva",
        text: "Una forma de pensar puesta a tu servicio: 75 filósofos usados como instrumentos, no como la persona histórica.",
      },
      {
        term: "Mapa",
        text: "Los temas, valores y tensiones que aparecen en tus conversaciones, dibujados para que veas cómo piensas.",
      },
      {
        term: "Red",
        text: "Cómo se conectan las ideas y las mentes entre sí: por influencia, por oposición y por linaje.",
      },
      {
        term: "Recorrido",
        text: "El historial de lo que ya exploraste y una pista de hacia dónde podrías seguir.",
      },
    ],
  },
  en: {
    kicker: "Before you start",
    title: "Four words worth understanding",
    close: "Got it, hide",
    items: [
      {
        term: "Perspective",
        text: "A way of thinking at your service: 75 philosophers used as instruments, not as the historical person.",
      },
      {
        term: "Map",
        text: "The themes, values and tensions that surface in your conversations, drawn out so you can see how you think.",
      },
      {
        term: "Network",
        text: "How ideas and minds connect to one another: by influence, by opposition and by lineage.",
      },
      {
        term: "Journey",
        text: "The record of what you have explored and a hint of where you could go next.",
      },
    ],
  },
} as const;

export function HowItWorks({ lang }: { lang: "es" | "en" }) {
  // Arranca oculto para no desajustar la hidratación (localStorage no existe en SSR).
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const c = COPY[lang];

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  const reveal = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setDismissed(false);
  };

  if (dismissed) {
    return (
      <section className="border-y border-border/60 bg-card/20">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-5 py-2 md:px-8">
          <button
            type="button"
            onClick={reveal}
            className="focus-mist text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {lang === "es" ? "¿Qué significa cada palabra?" : "What does each word mean?"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-border/60 bg-card/25">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label">{c.kicker}</p>
            <h2 className="mt-2 font-serif text-heading font-light text-foreground">{c.title}</h2>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="focus-mist text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {c.close}
          </button>
        </div>

        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.items.map((it) => (
            <div key={it.term}>
              <dt className="font-serif text-subtitle font-light text-bronze-bright">{it.term}</dt>
              <dd className="measure mt-2 text-small leading-relaxed text-muted-foreground">{it.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
