import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Pneum — Política de privacidad / Privacy policy" },
      {
        name: "description",
        content:
          "Cómo Pneum recopila, utiliza y protege tus datos al conversar con conciencias filosóficas reconstruidas.",
      },
      { property: "og:title", content: "Pneum — Privacy" },
      {
        property: "og:description",
        content: "Cómo Pneum trata tus datos, mensajes y memoria conversacional.",
      },
      { property: "og:url", content: "https://pneumaalpha.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://pneumaalpha.lovable.app/privacy" }],
  }),
});

const COPY = {
  es: {
    kicker: "Documento · Confianza",
    title: "Política de privacidad",
    updated: "Última actualización: 10 de junio de 2026",
    intro:
      "En Pneum tratamos tu silencio y tu palabra con el mismo cuidado. Esta política describe, sin rodeos, qué datos recogemos, por qué, y qué control tienes sobre ellos.",
    sections: [
      {
        h: "1. Datos que recogemos",
        p: "Al crear una cuenta guardamos tu correo electrónico y, si entras con Google, tu nombre y foto de perfil. Mientras conversas, guardamos los mensajes que envías y las respuestas de los interlocutores filosóficos para que cada uno pueda mantener su propia memoria de ti.",
      },
      {
        h: "2. Cómo usamos tus datos",
        p: "Tus mensajes se envían a un modelo de lenguaje para generar las respuestas. Conservamos el historial únicamente para que la conversación tenga continuidad. No vendemos tus datos, no los usamos para publicidad y no entrenamos modelos con ellos.",
      },
      {
        h: "3. Almacenamiento y seguridad",
        p: "Los datos se almacenan en infraestructura cifrada en tránsito y en reposo. El acceso está restringido por políticas de seguridad a nivel de fila: solo tú puedes leer tus conversaciones.",
      },
      {
        h: "4. Terceros",
        p: "Utilizamos proveedores para autenticación, base de datos e inferencia de modelos de lenguaje. Solo reciben los datos estrictamente necesarios para prestar el servicio y están sujetos a sus propios compromisos de privacidad.",
      },
      {
        h: "5. Tus derechos",
        p: "Puedes borrar cualquier conversación desde la propia interfaz. Si deseas eliminar tu cuenta y todos sus datos asociados, escríbenos y procederemos sin demora.",
      },
      {
        h: "6. Menores",
        p: "Pneum no está dirigido a menores de 16 años. Si crees que un menor nos ha enviado datos, contáctanos para retirarlos.",
      },
      {
        h: "7. Cambios",
        p: "Si esta política cambia, actualizaremos la fecha en la cabecera. Los cambios sustantivos se anunciarán dentro de la aplicación.",
      },
      {
        h: "8. Contacto",
        p: "Para cualquier asunto de privacidad: privacy@pneumaalpha.app.",
      },
    ],
    back: "← Volver al umbral",
  },
  en: {
    kicker: "Document · Trust",
    title: "Privacy policy",
    updated: "Last updated: June 10, 2026",
    intro:
      "At Pneum we treat your silence and your word with equal care. This policy describes, plainly, what data we collect, why, and what control you keep over it.",
    sections: [
      {
        h: "1. Data we collect",
        p: "When you create an account we store your email address and, if you sign in with Google, your name and profile picture. While you converse, we store the messages you send and the replies of the philosophical interlocutors so each one can keep its own memory of you.",
      },
      {
        h: "2. How we use your data",
        p: "Your messages are sent to a language model to generate the replies. We keep the history only so the conversation has continuity. We do not sell your data, we do not use it for advertising, and we do not train models with it.",
      },
      {
        h: "3. Storage and security",
        p: "Data is stored on infrastructure encrypted in transit and at rest. Access is restricted by row-level security policies: only you can read your conversations.",
      },
      {
        h: "4. Third parties",
        p: "We rely on providers for authentication, database, and language-model inference. They only receive the data strictly required to deliver the service and are bound by their own privacy commitments.",
      },
      {
        h: "5. Your rights",
        p: "You can delete any conversation directly from the interface. If you want to delete your account and all associated data, write to us and we will proceed without delay.",
      },
      {
        h: "6. Minors",
        p: "Pneum is not directed to children under 16. If you believe a minor has sent us data, contact us so we can remove it.",
      },
      {
        h: "7. Changes",
        p: "If this policy changes, we will update the date in the header. Substantive changes will be announced in-app.",
      },
      {
        h: "8. Contact",
        p: "For any privacy matter: privacy@pneumaalpha.app.",
      },
    ],
    back: "← Back to threshold",
  },
} as const;

function PrivacyPage() {
  const { lang } = useI18n();
  const c = COPY[lang];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12 md:px-10 md:py-20">
      <header className="flex items-center justify-between border-b border-border/60 pb-6">
        <Link to="/" aria-label="Pneum">
          <PneumaMark withWordmark />
        </Link>
        <LanguageSelector />
      </header>

      <article className="mt-12 space-y-10">
        <div>
          <p className="font-mono text-micro uppercase tracking-[0.35em] text-muted-foreground">
            {c.kicker}
          </p>
          <h1 className="mt-4 font-display text-title font-light text-foreground">
            {c.title}
          </h1>
          <p className="mt-3 text-micro uppercase tracking-[0.25em] text-muted-foreground">
            {c.updated}
          </p>
          <p className="mt-8 text-base leading-relaxed text-foreground/80">{c.intro}</p>
        </div>

        <div className="space-y-8">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-display text-lg font-light text-foreground">{s.h}</h2>
              <p className="mt-2 text-body text-foreground/70">
                {s.p}
              </p>
            </section>
          ))}
        </div>
      </article>

      <footer className="mt-16 flex items-center justify-between border-t border-border/60 pt-6 text-micro uppercase tracking-[0.3em] text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          {c.back}
        </Link>
        <span>Pneum · {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
