import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalCopy } from "@/components/legal-page";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => {
    const title = "Política de privacidad — Pneum";
    const description =
      "Cómo Kionas IA recopila, utiliza, comparte y protege tus datos en Pneum: categorías, bases legales, destinatarios, retención y tus derechos.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
    };
  },
});

const ES: LegalCopy = {
  kicker: "Documento · Confianza",
  title: "Política de privacidad",
  updated: "Última actualización: 31 de agosto de 2026",
  intro:
    "Pneum es operado por Kionas IA, responsable del tratamiento de tus datos personales. Aquí explicamos, sin rodeos, qué recogemos, con qué finalidad y base legal, con quién lo compartimos y qué control conservas.",
  sections: [
    {
      h: "1. Responsable del tratamiento",
      p: "Kionas IA, proveedor del servicio Pneum (también presentado como “Pneum Alpha”), actúa como responsable (data controller) de los datos descritos en esta política. Contacto: privacy@pneumaalpha.app.",
    },
    {
      h: "2. Datos que recogemos",
      p: "· Identidad y cuenta: correo electrónico y, si entras con Google, nombre y foto de perfil.\n· Contenido: los mensajes que escribes, las respuestas generadas, tus notas, rutas y preferencias (idioma, tono, filósofo).\n· Suscripción: plan contratado, estado, fechas de periodo e identificadores de la transacción entregados por Paddle. No recibimos ni almacenamos los datos de tu tarjeta.\n· Uso y técnica: eventos de uso, dispositivo, navegador, dirección IP y registros de errores.\n· Comunicaciones: mensajes de soporte y, si te suscribes, tu número de WhatsApp para el boletín.",
    },
    {
      h: "3. Finalidades y bases legales",
      p: "· Crear y mantener tu cuenta y prestar el servicio — ejecución del contrato.\n· Generar respuestas mediante modelos de lenguaje y conservar la continuidad de la conversación — ejecución del contrato.\n· Gestionar suscripciones, accesos y facturación — ejecución del contrato y obligación legal.\n· Seguridad, prevención de fraude y abuso — interés legítimo.\n· Analítica y mejora del producto — interés legítimo (métricas agregadas).\n· Boletín y comunicaciones de marketing — consentimiento, revocable en cualquier momento.",
    },
    {
      h: "4. Con quién compartimos",
      p: "· Proveedores de infraestructura: alojamiento, base de datos, autenticación y proveedores de modelos de lenguaje, que tratan los datos por cuenta nuestra.\n· Paddle.com, nuestro Comerciante Registrado (Merchant of Record), para la venta, la gestión de suscripciones, los pagos, el cumplimiento tributario y la facturación.\n· Asesores profesionales (legales, contables) cuando sea necesario.\n· Autoridades, cuando la ley lo exija.\nNo vendemos tus datos, no los usamos para publicidad de terceros y no entrenamos modelos con tus conversaciones.",
    },
    {
      h: "5. Transferencias internacionales",
      p: "Nuestros proveedores pueden tratar datos fuera de tu país, incluidos Estados Unidos y la Unión Europea. En esos casos aplicamos salvaguardas contractuales adecuadas (cláusulas contractuales tipo o decisiones de adecuación).",
    },
    {
      h: "6. Conservación",
      p: "Conservamos tus conversaciones mientras tu cuenta esté activa; puedes borrarlas cuando quieras desde la interfaz. Tras la eliminación de la cuenta borramos o anonimizamos los datos en un plazo máximo de 90 días, salvo los registros de facturación que debemos conservar por obligación legal.",
    },
    {
      h: "7. Seguridad",
      p: "Aplicamos medidas técnicas y organizativas apropiadas: cifrado en tránsito y en reposo, control de accesos y políticas de seguridad a nivel de fila, de modo que solo tú puedas leer tus conversaciones.",
    },
    {
      h: "8. Tus derechos",
      p: "Puedes solicitar acceso, rectificación, eliminación, limitación, portabilidad y oposición al tratamiento, así como retirar tu consentimiento en cualquier momento. Escríbenos a privacy@pneumaalpha.app y responderemos en el plazo de un mes. Si resides en el EEE o el Reino Unido, también puedes reclamar ante tu autoridad de protección de datos.",
    },
    {
      h: "9. Cookies y almacenamiento local",
      p: "Usamos cookies y almacenamiento local esenciales para mantener tu sesión y tus preferencias, y cookies analíticas propias para medir el uso de forma agregada. Puedes borrarlas desde tu navegador; sin las esenciales el servicio no funciona correctamente.",
    },
    {
      h: "10. Menores",
      p: "Pneum no está dirigido a menores de 16 años. Si crees que un menor nos ha enviado datos, contáctanos para retirarlos.",
    },
    {
      h: "11. Cambios y contacto",
      p: "Si esta política cambia, actualizaremos la fecha de la cabecera y anunciaremos en la aplicación los cambios sustantivos. Para cualquier asunto de privacidad: privacy@pneumaalpha.app.",
    },
  ],
  back: "← Volver al inicio",
};

const EN: LegalCopy = {
  kicker: "Document · Trust",
  title: "Privacy notice",
  updated: "Last updated: August 31, 2026",
  intro:
    "Pneum is operated by Kionas IA, the controller of your personal data. This notice explains plainly what we collect, for what purpose and legal basis, who we share it with, and what control you keep.",
  sections: [
    {
      h: "1. Data controller",
      p: "Kionas IA, provider of the Pneum service (also presented as “Pneum Alpha”), acts as data controller for the data described here. Contact: privacy@pneumaalpha.app.",
    },
    {
      h: "2. Data we collect",
      p: "· Identity and account: email address and, if you sign in with Google, name and profile picture.\n· Content: the messages you write, the generated replies, your notes, paths and preferences (language, tone, philosopher).\n· Subscription: plan, status, period dates and transaction identifiers provided by Paddle. We never receive or store your card details.\n· Usage and technical data: usage events, device, browser, IP address and error logs.\n· Communications: support messages and, if you subscribe, your WhatsApp number for the newsletter.",
    },
    {
      h: "3. Purposes and legal bases",
      p: "· Creating and maintaining your account and delivering the service — performance of contract.\n· Generating replies through language models and keeping conversation continuity — performance of contract.\n· Managing subscriptions, access and invoicing — contract and legal obligation.\n· Security, fraud and abuse prevention — legitimate interests.\n· Analytics and product improvement — legitimate interests (aggregated metrics).\n· Newsletter and marketing messages — consent, withdrawable at any time.",
    },
    {
      h: "4. Who we share it with",
      p: "· Infrastructure providers: hosting, database, authentication and language-model providers, processing data on our behalf.\n· Paddle.com, our Merchant of Record, for the sale, subscription management, payments, tax compliance and invoicing.\n· Professional advisers (legal, accounting) where necessary.\n· Authorities, where required by law.\nWe do not sell your data, we do not use it for third-party advertising, and we do not train models on your conversations.",
    },
    {
      h: "5. International transfers",
      p: "Our providers may process data outside your country, including the United States and the European Union. Where that happens we rely on appropriate safeguards (standard contractual clauses or adequacy decisions).",
    },
    {
      h: "6. Retention",
      p: "We keep your conversations while your account is active; you can delete them from the interface at any time. After account deletion we erase or anonymise data within 90 days, except billing records we must retain by law.",
    },
    {
      h: "7. Security",
      p: "We apply appropriate technical and organisational measures: encryption in transit and at rest, access controls and row-level security policies, so that only you can read your conversations.",
    },
    {
      h: "8. Your rights",
      p: "You may request access, rectification, erasure, restriction, portability and objection, and withdraw consent at any time. Write to privacy@pneumaalpha.app and we will reply within one month. If you are in the EEA or the UK you may also complain to your supervisory authority.",
    },
    {
      h: "9. Cookies and local storage",
      p: "We use essential cookies and local storage to keep your session and preferences, plus first-party analytics cookies to measure usage in aggregate. You can clear them in your browser; without the essential ones the service will not work properly.",
    },
    {
      h: "10. Minors",
      p: "Pneum is not directed to children under 16. If you believe a minor has sent us data, contact us so we can remove it.",
    },
    {
      h: "11. Changes and contact",
      p: "If this notice changes we will update the date in the header and announce substantive changes in-app. For any privacy matter: privacy@pneumaalpha.app.",
    },
  ],
  back: "← Back to home",
};

function PrivacyPage() {
  return <LegalPage copy={{ es: ES, en: EN }} />;
}
