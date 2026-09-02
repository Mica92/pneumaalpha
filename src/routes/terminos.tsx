import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalCopy } from "@/components/legal-page";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/terminos")({
  component: TermsPage,
  head: () => {
    const title = "Términos y condiciones — Pneum";
    const description =
      "Condiciones de uso de Pneum: quién vende el servicio, uso aceptable de la IA, pagos gestionados por Paddle, suspensión y responsabilidad.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/terminos` }],
    };
  },
});

const ES: LegalCopy = {
  kicker: "Documento · Acuerdo",
  title: "Términos y condiciones",
  updated: "Última actualización: 31 de agosto de 2026",
  intro:
    "Pneum es un servicio operado por Kionas IA. Al crear una cuenta, conversar con las conciencias filosóficas reconstruidas o contratar un plan, aceptas estos términos y celebras un contrato con Kionas IA.",
  sections: [
    {
      h: "1. Quiénes somos",
      p: "El servicio Pneum (también presentado como “Pneum Alpha”) es prestado por Kionas IA (“nosotros”). Contratas con Kionas IA. Contacto: soporte@pneumaalpha.app.",
    },
    {
      h: "2. Aceptación",
      p: "El uso continuado del servicio implica la aceptación de estos términos y de la Política de Privacidad y la Política de Reembolsos. Declaras tener al menos 18 años y ser mayor de edad en tu jurisdicción, o contar con autorización para vincular a la organización que representas. El servicio no está dirigido a menores de edad.",
    },
    {
      h: "3. Qué ofrecemos",
      p: "Pneum permite conversar con personajes filosóficos generados por inteligencia artificial, explorar un mapa de ideas, obtener análisis de textos, un reporte de tu pensamiento y contenidos en audio. Es un producto cultural y formativo: no es asesoría psicológica, médica, legal, financiera ni profesional de ningún tipo.",
    },
    {
      h: "4. Cuenta y credenciales",
      p: "Debes entregar información veraz y mantenerla actualizada. Eres responsable de la confidencialidad de tus credenciales y de toda la actividad realizada desde tu cuenta.",
    },
    {
      h: "5. Uso aceptable",
      p: "No puedes usar el servicio para fines ilegales, fraude, spam, acoso, infracción de derechos de terceros, ni para interferir con su seguridad (malware, sondeo, scraping, elusión de límites técnicos). Tampoco puedes revender, redistribuir ni realizar ingeniería inversa del servicio.",
    },
    {
      h: "6. Uso responsable de la inteligencia artificial",
      p: "Queda prohibido generar contenido ilegal, sexual con menores, de odio, violento, difamatorio, engañoso (incluidas suplantaciones o deepfakes de personas reales), instrucciones para dañar a otros, malware o intentos de eludir los filtros del sistema (jailbreaking).\n\nEres responsable de los textos que envías, de contar con los derechos sobre el contenido que introduces, del uso que das a los resultados y de verificar su exactitud. Las respuestas son generadas automáticamente y pueden contener errores, omisiones o afirmaciones inexactas; no deben usarse como sustituto de asesoría profesional ni en decisiones reguladas sin supervisión humana.\n\nEn la medida permitida por la ley, no reclamamos propiedad sobre los textos que introduces; conservas tus derechos y nos concedes una licencia limitada para procesarlos y prestarte el servicio. Si consideras que un resultado infringe tus derechos, escríbenos a soporte@pneumaalpha.app y atenderemos el reclamo; las infracciones reiteradas conllevan la terminación de la cuenta.\n\nNos reservamos el derecho a moderar: filtrar o rechazar respuestas, retirar contenido y restringir cuentas cuando exista riesgo o incumplimiento.\n\nPneum no reconstruye personas vivas ni figuras públicas contemporáneas: solo autores históricos de dominio público. No es un compañero virtual ni un servicio de acompañamiento emocional o romántico, y no ofrece contenido adulto. El detalle completo —incluidas las reglas de seguridad ante señales de crisis y el procedimiento de moderación— está en la Política de uso aceptable de IA, disponible en https://pneum.app/uso-de-ia, que forma parte integrante de estos términos.",
    },
    {
      h: "7. Propiedad intelectual",
      p: "El software, el diseño, los textos editoriales, las ilustraciones, la marca y demás elementos del servicio pertenecen a Kionas IA o a sus licenciantes. Te concedemos un derecho limitado, no exclusivo e intransferible de uso dentro del plan contratado.",
    },
    {
      h: "8. Planes, pagos e impuestos",
      p: "Ofrecemos un nivel gratuito limitado y planes de pago (mensual, semestral y vitalicio). Nuestro proceso de pedidos es realizado por nuestro revendedor en línea Paddle.com. Paddle.com es el Comerciante Registrado (Merchant of Record) de todos nuestros pedidos. Paddle atiende todas las consultas de servicio al cliente y gestiona las devoluciones.\n\nLa facturación, los impuestos, las renovaciones automáticas, la cancelación y los reembolsos se rigen además por los Términos del Comprador de Paddle: https://www.paddle.com/legal/checkout-buyer-terms. Las suscripciones se renuevan automáticamente al final de cada periodo hasta que las canceles; el plan vitalicio es un pago único y limitado en cupos.",
    },
    {
      h: "9. Disponibilidad del servicio",
      p: "Trabajamos para mantener el servicio disponible, pero no garantizamos un funcionamiento ininterrumpido ni libre de errores. Podemos modificar, suspender o descontinuar funcionalidades, avisando cuando el cambio sea sustantivo.",
    },
    {
      h: "10. Suspensión y terminación",
      p: "Podemos suspender o terminar tu acceso ante incumplimientos materiales de estos términos, falta de pago, riesgo de fraude o seguridad, o violaciones reiteradas o graves de las reglas de uso. Puedes cancelar cuando quieras; al terminar el acceso podrás exportar o solicitar la eliminación de tus datos.",
    },
    {
      h: "11. Garantías y responsabilidad",
      p: "En la máxima medida permitida por la ley, el servicio se presta “tal cual” y excluimos garantías implícitas de comerciabilidad o idoneidad para un fin determinado. No respondemos por daños indirectos, consecuentes o especiales (lucro cesante, pérdida de datos o de reputación). Nuestra responsabilidad total se limita a las sumas pagadas por ti en los 12 meses previos al hecho. Nada de esto excluye la responsabilidad por dolo, fraude, muerte o daño personal cuando la ley no lo permita.",
    },
    {
      h: "12. Indemnidad",
      p: "Nos mantendrás indemnes frente a reclamos de terceros derivados del contenido que introduces, del uso ilícito del servicio o del incumplimiento de estos términos.",
    },
    {
      h: "13. Ley aplicable y cambios",
      p: "Estos términos se rigen por la ley chilena y los tribunales de Santiago de Chile, sin perjuicio de los derechos irrenunciables que te correspondan como consumidor. Publicaremos cualquier cambio en esta página, actualizando la fecha de la cabecera.",
    },
  ],
  back: "← Volver al inicio",
};

const EN: LegalCopy = {
  kicker: "Document · Agreement",
  title: "Terms and conditions",
  updated: "Last updated: August 31, 2026",
  intro:
    "Pneum is a service operated by Kionas IA. By creating an account, talking to the reconstructed philosophical minds or purchasing a plan, you accept these terms and enter into an agreement with Kionas IA.",
  sections: [
    {
      h: "1. Who we are",
      p: "The Pneum service (also presented as “Pneum Alpha”) is provided by Kionas IA (“we”). You are contracting with Kionas IA. Contact: soporte@pneumaalpha.app.",
    },
    {
      h: "2. Acceptance",
      p: "Continued use of the service means you accept these terms, the Privacy Notice and the Refund Policy. You confirm you are at least 18 years old and of legal age in your jurisdiction, or authorised to bind the organisation you represent. The service is not directed to minors.",
    },
    {
      h: "3. What we offer",
      p: "Pneum lets you converse with AI-generated philosophical personas, explore a map of ideas, analyse texts, receive a report on your thinking and listen to audio content. It is a cultural and educational product: it is not psychological, medical, legal, financial or any other professional advice.",
    },
    {
      h: "4. Account and credentials",
      p: "You must provide accurate information and keep it up to date. You are responsible for keeping your credentials confidential and for all activity under your account.",
    },
    {
      h: "5. Acceptable use",
      p: "You may not use the service for unlawful purposes, fraud, spam, harassment, infringement of third-party rights, or to interfere with its security (malware, probing, scraping, circumventing technical limits). You may not resell, redistribute or reverse engineer the service.",
    },
    {
      h: "6. Responsible use of AI",
      p: "You may not generate unlawful content, child sexual content, hateful, violent, defamatory or deceptive material (including impersonation or deepfakes of real people), instructions to harm others, malware, or attempts to bypass system safeguards (jailbreaking).\n\nYou are responsible for the prompts you submit, for holding the rights to the content you input, for how you use the outputs and for verifying their accuracy. Outputs are generated automatically and may be inaccurate or incomplete; they are not a substitute for professional advice and must not be used in regulated decisions without human oversight.\n\nTo the extent permitted by law we claim no ownership of your inputs; you keep your rights and grant us a limited licence to process them in order to provide the service. If you believe an output infringes your rights, write to soporte@pneumaalpha.app and we will review the complaint; repeated infringement leads to account termination.\n\nWe reserve moderation rights: filtering or refusing outputs, removing content and restricting accounts where there is risk or breach.\n\nPneum does not reconstruct living people or contemporary public figures: historical, public-domain authors only. It is not a virtual companion or an emotional/romantic support service, and it offers no adult content. The full detail — including safety rules for crisis signals and the moderation procedure — is in the AI Acceptable Use Policy at https://pneum.app/uso-de-ia, which forms part of these terms.",
    },
    {
      h: "7. Intellectual property",
      p: "The software, design, editorial texts, illustrations, branding and other elements of the service belong to Kionas IA or its licensors. We grant you a limited, non-exclusive, non-transferable right to use the service within your plan.",
    },
    {
      h: "8. Plans, payments and taxes",
      p: "We offer a limited free tier and paid plans (monthly, six-month and lifetime). Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.\n\nBilling, taxes, automatic renewals, cancellation and refunds are additionally governed by Paddle's Buyer Terms: https://www.paddle.com/legal/checkout-buyer-terms. Subscriptions renew automatically at the end of each period until cancelled; the lifetime plan is a one-time payment with limited seats.",
    },
    {
      h: "9. Service availability",
      p: "We work to keep the service available, but we do not guarantee uninterrupted or error-free operation. We may modify, suspend or discontinue features, giving notice where the change is substantive.",
    },
    {
      h: "10. Suspension and termination",
      p: "We may suspend or terminate access for material breach of these terms, non-payment, fraud or security risk, or repeated or serious violations of the usage rules. You may cancel at any time; when access ends you can export or request deletion of your data.",
    },
    {
      h: "11. Warranties and liability",
      p: "To the fullest extent permitted by law the service is provided “as is” and we disclaim implied warranties of merchantability or fitness for a particular purpose. We are not liable for indirect, consequential or special damages (lost profits, data or goodwill). Our aggregate liability is capped at the amounts you paid in the 12 months preceding the claim. Nothing excludes liability for wilful misconduct, fraud, death or personal injury where the law does not allow it.",
    },
    {
      h: "12. Indemnity",
      p: "You will indemnify us against third-party claims arising from the content you input, unlawful use of the service, or breach of these terms.",
    },
    {
      h: "13. Governing law and changes",
      p: "These terms are governed by Chilean law and the courts of Santiago, Chile, without prejudice to mandatory consumer rights. Any changes will be published on this page with an updated date in the header.",
    },
  ],
  back: "← Back to home",
};

function TermsPage() {
  return <LegalPage copy={{ es: ES, en: EN }} />;
}
