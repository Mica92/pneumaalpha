import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, type LegalCopy } from "@/components/legal-page";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/contacto")({
  component: ContactPage,
  head: () => {
    const title = "Contacto y soporte — Pneum";
    const description =
      "Datos del vendedor y canales de soporte de Pneum: Kionas IA, Santiago de Chile. Soporte, facturación, reembolsos y privacidad, con tiempos de respuesta.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${SITE_URL}/contacto` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/contacto` }],
    };
  },
});

const ES: LegalCopy = {
  kicker: "Documento · Contacto",
  title: "Contacto y soporte",
  updated: "Última actualización: 2 de septiembre de 2026",
  intro:
    "Pneum es operado y vendido por Kionas IA. Aquí están todos los canales para hablar con una persona real: soporte del producto, compras y facturación, reembolsos, privacidad y reportes de contenido.",
  sections: [
    {
      h: "1. Vendedor",
      p: "Kionas IA\nServicio: Pneum (también presentado como “Pneum Alpha”)\nDomicilio: Santiago, Chile\nCorreo general: soporte@pneumaalpha.app\nSitio: https://pneum.app",
    },
    {
      h: "2. Soporte del producto",
      p: "Escribe a soporte@pneumaalpha.app con tu correo de cuenta y una descripción del problema. Respondemos dentro de 2 días hábiles, en español o inglés.",
    },
    {
      h: "3. Compras, facturación e impuestos",
      p: "Nuestro proceso de pedidos es realizado por Paddle.com, que actúa como Comerciante Registrado (Merchant of Record) de todos los pedidos. Paddle atiende las consultas de facturación, emite las facturas y gestiona los impuestos. Puedes consultar tus pedidos en https://paddle.net con el correo que usaste al comprar, o escribirnos a soporte@pneumaalpha.app y lo gestionamos contigo.",
    },
    {
      h: "4. Cancelación y reembolsos",
      p: "Puedes cancelar la renovación en cualquier momento desde https://paddle.net o pidiéndolo por correo. Ofrecemos 30 días de garantía de devolución en todos los planes; el detalle está en la Política de reembolsos.",
    },
    {
      h: "5. Privacidad y datos",
      p: "Para acceso, rectificación, exportación o eliminación de tus datos: privacy@pneumaalpha.app. Respondemos dentro de 30 días. El detalle está en la Política de privacidad.",
    },
    {
      h: "6. Reportar contenido",
      p: "Si una respuesta generada te parece inapropiada, inexacta o vulnera tus derechos, escríbenos a soporte@pneumaalpha.app indicando la conversación y la fecha. Revisamos cada reporte según la Política de uso aceptable de IA.",
    },
  ],
  back: "← Volver al inicio",
};

const EN: LegalCopy = {
  kicker: "Document · Contact",
  title: "Contact and support",
  updated: "Last updated: September 2, 2026",
  intro:
    "Pneum is operated and sold by Kionas IA. These are the channels to reach a real person: product support, purchases and billing, refunds, privacy and content reports.",
  sections: [
    {
      h: "1. Seller",
      p: "Kionas IA\nService: Pneum (also presented as “Pneum Alpha”)\nAddress: Santiago, Chile\nGeneral email: soporte@pneumaalpha.app\nWebsite: https://pneum.app",
    },
    {
      h: "2. Product support",
      p: "Write to soporte@pneumaalpha.app with your account email and a description of the issue. We reply within 2 business days, in Spanish or English.",
    },
    {
      h: "3. Purchases, billing and taxes",
      p: "Our order process is conducted by Paddle.com, the Merchant of Record for all orders. Paddle handles billing enquiries, issues invoices and manages taxes. You can review your orders at https://paddle.net using the email you purchased with, or write to soporte@pneumaalpha.app and we will handle it with you.",
    },
    {
      h: "4. Cancellation and refunds",
      p: "You can cancel renewal at any time at https://paddle.net or by email. We offer a 30-day money-back guarantee on every plan; details are in the Refund Policy.",
    },
    {
      h: "5. Privacy and data",
      p: "For access, rectification, export or deletion of your data: privacy@pneumaalpha.app. We reply within 30 days. Details are in the Privacy Policy.",
    },
    {
      h: "6. Reporting content",
      p: "If a generated answer seems inappropriate, inaccurate or infringes your rights, write to soporte@pneumaalpha.app with the conversation and date. We review every report under the AI Acceptable Use Policy.",
    },
  ],
  back: "← Back to home",
};

function ContactPage() {
  return <LegalPage copy={{ es: ES, en: EN }} />;
}
