import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalCopy } from "@/components/legal-page";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/uso-de-ia")({
  component: AiUsePage,
  head: () => {
    const title = "Política de uso aceptable de IA — Pneum";
    const description =
      "Cómo Pneum genera sus respuestas, qué usos están prohibidos, cómo moderamos el contenido y qué límites de seguridad aplicamos al diálogo filosófico.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}/uso-de-ia` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/uso-de-ia` }],
    };
  },
});

const ES: LegalCopy = {
  kicker: "Documento · Uso de IA",
  title: "Política de uso aceptable de inteligencia artificial",
  updated: "Última actualización: 2 de septiembre de 2026",
  intro:
    "Pneum es un producto editorial y educativo de filosofía operado por Kionas IA. La inteligencia artificial es la interfaz que permite estudiar el pensamiento de autores históricos de dominio público; no es un compañero virtual, ni un asistente personal de propósito general, ni un servicio de consejo profesional. Esta política describe cómo se generan las respuestas, qué usos están prohibidos y cómo moderamos el servicio.",
  sections: [
    {
      h: "1. Cómo se generan las respuestas",
      p: "Cada “conciencia” de Pneum es un personaje editorial construido por nuestro equipo a partir de la obra publicada de un autor histórico de dominio público (por ejemplo Heidegger, Kierkegaard, Arendt o los estoicos). Escribimos un guion documentado —vocabulario, preocupaciones, método, límites— y ese guion instruye a un modelo de lenguaje de terceros que redacta la respuesta.\n\nEl resultado es una interpretación pedagógica, no una cita literal ni una declaración del autor real. Las respuestas se generan automáticamente y pueden contener errores; el usuario ve siempre el aviso correspondiente y debe verificar cualquier afirmación relevante.",
    },
    {
      h: "2. Solo autores históricos, nunca personas vivas",
      p: "Solo reconstruimos el pensamiento de figuras históricas fallecidas cuya obra es de dominio público o de cita legítima. No creamos ni permitimos personajes de personas vivas, figuras públicas contemporáneas, celebridades, políticos en ejercicio ni personas conocidas por el usuario. No producimos deepfakes, imitaciones de voz ni suplantaciones de identidad.",
    },
    {
      h: "3. Lo que Pneum no es",
      p: "· No es un compañero virtual, novio o novia digital, ni un servicio de acompañamiento emocional o romántico. No existe roleplay íntimo, sexual ni de pareja.\n· No es asesoría psicológica, psiquiátrica, médica, legal, financiera ni de inversión.\n· No es una herramienta de citas, de apuestas, de contenido para adultos ni de generación de imágenes.\n· No es un asistente de propósito general: el sistema está acotado al dominio filosófico y humanístico.",
    },
    {
      h: "4. Usos prohibidos",
      p: "Está prohibido usar Pneum para:\n· Generar o solicitar contenido ilegal, contenido sexual, contenido sexual que involucre a menores, o material violento, extremista, de odio o acosador.\n· Suplantar personas reales, crear deepfakes o difundir desinformación.\n· Obtener instrucciones para dañar a personas, fabricar armas, drogas o malware, o vulnerar sistemas informáticos.\n· Solicitar diagnóstico o tratamiento médico, psicológico, legal o financiero, o tomar decisiones reguladas sin supervisión humana.\n· Eludir los filtros y salvaguardas del sistema (jailbreaking, inyección de instrucciones), automatizar el servicio, hacer scraping o revenderlo.\n· Introducir datos personales sensibles de terceros sin base legal.",
    },
    {
      h: "5. Seguridad y bienestar del usuario",
      p: "El diálogo filosófico puede tocar temas existenciales. Si un mensaje sugiere riesgo de autolesión, suicidio o daño a terceros, el sistema interrumpe el registro filosófico, entrega un mensaje de apoyo y deriva explícitamente a servicios de ayuda profesional y líneas de emergencia locales. Pneum nunca ofrece técnicas de autolesión, dietas, dosis, tratamientos ni sustitutos de atención clínica.",
    },
    {
      h: "6. Moderación y cumplimiento",
      p: "Aplicamos filtros sobre las entradas y las salidas del modelo, además de los filtros de seguridad del proveedor del modelo. Podemos rechazar una respuesta, retirar contenido, limitar funciones, suspender o cerrar cuentas cuando exista incumplimiento o riesgo. Las infracciones graves o reiteradas conllevan la terminación definitiva del acceso, sin reembolso de periodos ya consumidos más allá de lo previsto en la Política de Reembolsos.\n\nPuedes reportar una respuesta problemática escribiendo a soporte@pneumaalpha.app; revisamos cada reporte.",
    },
    {
      h: "7. Edad mínima",
      p: "El servicio está dirigido a personas mayores de 18 años. No está diseñado para menores de edad y no recogemos deliberadamente sus datos. Si detectamos una cuenta de un menor, la cerramos y eliminamos sus datos.",
    },
    {
      h: "8. Tus contenidos y tus derechos",
      p: "No reclamamos propiedad sobre los textos que escribes; conservas tus derechos y nos concedes una licencia limitada para procesarlos y prestarte el servicio. Los mensajes se envían a proveedores de modelos de lenguaje que actúan como encargados del tratamiento. Puedes exportar o eliminar tus conversaciones desde tu perfil o pidiéndolo a privacy@pneumaalpha.app. El detalle está en la Política de privacidad.",
    },
    {
      h: "9. Contacto",
      p: "Kionas IA · soporte@pneumaalpha.app · Santiago, Chile. Los pedidos y pagos son procesados por Paddle.com como Comerciante Registrado.",
    },
  ],
  back: "← Volver al inicio",
};

const EN: LegalCopy = {
  kicker: "Document · AI use",
  title: "Acceptable use policy for artificial intelligence",
  updated: "Last updated: September 2, 2026",
  intro:
    "Pneum is an editorial and educational philosophy product operated by Kionas IA. Artificial intelligence is the interface that lets you study the thought of historical, public-domain authors; it is not a virtual companion, a general-purpose assistant, or a professional advice service. This policy explains how answers are generated, which uses are prohibited, and how we moderate the service.",
  sections: [
    {
      h: "1. How answers are generated",
      p: "Each Pneum “mind” is an editorial persona written by our team from the published work of a deceased, public-domain author (for example Heidegger, Kierkegaard, Arendt or the Stoics). We author a documented script — vocabulary, concerns, method, limits — and that script instructs a third-party language model that drafts the reply.\n\nThe result is a pedagogical interpretation, not a literal quotation or a statement by the real author. Answers are generated automatically and may be inaccurate; users always see the corresponding notice and should verify any material claim.",
    },
    {
      h: "2. Historical authors only, never living people",
      p: "We only reconstruct the thought of deceased historical figures whose work is in the public domain or lawfully quotable. We do not create or allow personas of living people, contemporary public figures, celebrities, sitting politicians or people known to the user. We do not produce deepfakes, voice cloning or identity impersonation.",
    },
    {
      h: "3. What Pneum is not",
      p: "· Not a virtual companion, AI girlfriend/boyfriend, or emotional/romantic support service. No intimate, sexual or relationship roleplay exists.\n· Not psychological, psychiatric, medical, legal, financial or investment advice.\n· Not a dating, gambling, adult-content or image-generation tool.\n· Not a general-purpose assistant: the system is scoped to philosophy and the humanities.",
    },
    {
      h: "4. Prohibited uses",
      p: "You may not use Pneum to:\n· Generate or request unlawful content, sexual content, child sexual content, or violent, extremist, hateful or harassing material.\n· Impersonate real people, create deepfakes or spread disinformation.\n· Obtain instructions to harm people, build weapons, drugs or malware, or compromise computer systems.\n· Request medical, psychological, legal or financial diagnosis or treatment, or make regulated decisions without human oversight.\n· Bypass system safeguards (jailbreaking, prompt injection), automate, scrape or resell the service.\n· Submit sensitive personal data about third parties without a legal basis.",
    },
    {
      h: "5. User safety and wellbeing",
      p: "Philosophical dialogue can touch existential themes. If a message suggests risk of self-harm, suicide or harm to others, the system leaves the philosophical register, returns a supportive message and explicitly directs the user to professional help and local emergency lines. Pneum never provides self-harm techniques, diets, dosages, treatments or substitutes for clinical care.",
    },
    {
      h: "6. Moderation and enforcement",
      p: "We apply filters to model inputs and outputs, in addition to the model provider's own safety filters. We may refuse an answer, remove content, limit features, suspend or close accounts where there is breach or risk. Serious or repeated violations lead to permanent termination, without refund of consumed periods beyond what the Refund Policy provides.\n\nYou can report a problematic output at soporte@pneumaalpha.app; we review every report.",
    },
    {
      h: "7. Minimum age",
      p: "The service is intended for people aged 18 or over. It is not designed for minors and we do not knowingly collect their data. If we identify a minor's account we close it and delete the data.",
    },
    {
      h: "8. Your content and your rights",
      p: "We claim no ownership of the text you write; you keep your rights and grant us a limited licence to process it to provide the service. Messages are sent to language-model providers acting as processors. You can export or delete your conversations from your profile or by writing to privacy@pneumaalpha.app. Full detail is in the Privacy Policy.",
    },
    {
      h: "9. Contact",
      p: "Kionas IA · soporte@pneumaalpha.app · Santiago, Chile. Orders and payments are processed by Paddle.com as Merchant of Record.",
    },
  ],
  back: "← Back to home",
};

function AiUsePage() {
  return <LegalPage copy={{ es: ES, en: EN }} />;
}
