import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalCopy } from "@/components/legal-page";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/reembolsos")({
  component: RefundsPage,
  head: () => {
    const title = "Política de reembolsos — Pneum";
    const description =
      "Garantía de devolución de 30 días en todos los planes de Pneum. Los reembolsos se gestionan a través de Paddle, nuestro comerciante registrado.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/reembolsos` }],
    };
  },
});

const ES: LegalCopy = {
  kicker: "Documento · Compras",
  title: "Política de reembolsos",
  updated: "Última actualización: 31 de agosto de 2026",
  intro:
    "Kionas IA, responsable del servicio Pneum, ofrece una garantía de devolución de 30 días en todos sus planes. Si el servicio no es para ti, te devolvemos el dinero.",
  sections: [
    {
      h: "1. Garantía de 30 días",
      p: "Puedes solicitar el reembolso completo de tu compra dentro de los 30 días siguientes a la fecha del pedido, por cualquier motivo, incluido el simple cambio de opinión. Esto aplica al plan mensual, al semestral y al plan vitalicio.",
    },
    {
      h: "2. Cómo solicitarlo",
      p: "Los pagos y las devoluciones son procesados por Paddle.com, nuestro revendedor y Comerciante Registrado. Puedes pedir el reembolso en https://paddle.net con el correo que usaste al comprar, o escribirnos a soporte@pneumaalpha.app y lo gestionamos contigo.",
    },
    {
      h: "3. Renovaciones y cancelación",
      p: "Puedes cancelar la renovación automática en cualquier momento; mantendrás el acceso hasta el final del periodo pagado. Si una renovación se cobró por error o no la esperabas, contáctanos dentro de los 30 días y la revisamos.",
    },
    {
      h: "4. Plazos de devolución",
      p: "Una vez aprobado, Paddle emite el reembolso al medio de pago original. El abono suele aparecer en un plazo de 3 a 10 días hábiles, según tu banco o emisor.",
    },
    {
      h: "5. Excepciones razonables",
      p: "Podemos rechazar solicitudes cuando exista evidencia de fraude, abuso del servicio o incumplimiento de los Términos y Condiciones. Fuera de esos casos, la garantía se aplica sin condiciones adicionales.",
    },
    {
      h: "6. Contacto",
      p: "Cualquier duda sobre un cobro o una devolución: soporte@pneumaalpha.app.",
    },
  ],
  back: "← Volver al inicio",
};

const EN: LegalCopy = {
  kicker: "Document · Purchases",
  title: "Refund policy",
  updated: "Last updated: August 31, 2026",
  intro:
    "Kionas IA, the provider of the Pneum service, offers a 30-day money-back guarantee on every plan. If the service is not for you, we refund your payment.",
  sections: [
    {
      h: "1. 30-day guarantee",
      p: "You can request a full refund within 30 days of your order date, for any reason, including a simple change of mind. This applies to the monthly plan, the six-month plan and the lifetime plan.",
    },
    {
      h: "2. How to request it",
      p: "Payments and refunds are processed by Paddle.com, our reseller and Merchant of Record. Request a refund at https://paddle.net using the email address you purchased with, or write to soporte@pneumaalpha.app and we will handle it with you.",
    },
    {
      h: "3. Renewals and cancellation",
      p: "You can cancel automatic renewal at any time; access continues until the end of the paid period. If a renewal was charged unexpectedly, contact us within 30 days and we will review it.",
    },
    {
      h: "4. Processing time",
      p: "Once approved, Paddle issues the refund to the original payment method. It usually appears within 3 to 10 business days, depending on your bank or card issuer.",
    },
    {
      h: "5. Reasonable exceptions",
      p: "We may decline requests where there is evidence of fraud, abuse of the service or breach of the Terms and Conditions. Outside those cases the guarantee applies with no additional conditions.",
    },
    {
      h: "6. Contact",
      p: "Any question about a charge or a refund: soporte@pneumaalpha.app.",
    },
  ],
  back: "← Back to home",
};

function RefundsPage() {
  return <LegalPage copy={{ es: ES, en: EN }} />;
}
