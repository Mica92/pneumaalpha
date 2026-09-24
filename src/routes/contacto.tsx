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
    "Pneum es operado por Kionas IA. Aquí están los canales para soporte del producto, privacidad y reportes de contenido.",
  sections: [
    {
      h: "1. Vendedor",
      p: "Kionas IA\nServicio: Pneum (también presentado como “Pneum”)\nDomicilio: Santiago, Chile\nCorreo general: soporte@pneum.app\nSitio: https://pneum.app",
    },
    {
      h: "2. Soporte del producto",
      p: "Escribe a soporte@pneum.app con tu correo de cuenta y una descripción del problema. Respondemos dentro de 2 días hábiles, en español o inglés.",
    },
    {
      h: "3. Privacidad y datos",
      p: "Para acceso, rectificación, exportación o eliminación de tus datos: privacy@pneum.app. Respondemos dentro de 30 días. El detalle está en la Política de privacidad.",
    },
    {
      h: "4. Reportar contenido",
      p: "Si una respuesta generada te parece inapropiada, inexacta o vulnera tus derechos, escríbenos a soporte@pneum.app indicando la conversación y la fecha. Revisamos cada reporte según la Política de uso aceptable de IA.",
    },
  ],
  back: "← Volver al inicio",
};

const EN: LegalCopy = {
  kicker: "Document · Contact",
  title: "Contact and support",
  updated: "Last updated: September 2, 2026",
  intro:
    "Pneum is operated by Kionas IA. These are the channels for product support, privacy and content reports.",
  sections: [
    {
      h: "1. Seller",
      p: "Kionas IA\nService: Pneum (also presented as “Pneum”)\nAddress: Santiago, Chile\nGeneral email: soporte@pneum.app\nWebsite: https://pneum.app",
    },
    {
      h: "2. Product support",
      p: "Write to soporte@pneum.app with your account email and a description of the issue. We reply within 2 business days, in Spanish or English.",
    },
    {
      h: "3. Privacy and data",
      p: "For access, rectification, export or deletion of your data: privacy@pneum.app. We reply within 30 days. Details are in the Privacy Policy.",
    },
    {
      h: "4. Reporting content",
      p: "If a generated answer seems inappropriate, inaccurate or infringes your rights, write to soporte@pneum.app with the conversation and date. We review every report under the AI Acceptable Use Policy.",
    },
  ],
  back: "← Back to home",
};

function ContactPage() {
  return <LegalPage copy={{ es: ES, en: EN }} />;
}
