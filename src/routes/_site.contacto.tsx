import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { CONTACT } from "@/lib/institutional-content";
import { breadcrumb, institutionalHead } from "@/lib/institutional-head";
import { Eyebrow } from "@/components/institutional/primitives";
import { LeadForm } from "@/components/institutional/lead-form";

export const Route = createFileRoute("/_site/contacto")({
  component: ContactPage,
  head: () =>
    institutionalHead({
      path: "/contacto",
      title: "Contacto — Solicita una demostración de Kionas",
      description:
        "Solicita una reunión o demostración de Kionas para tu universidad, colegio u organización. También: soporte del producto, privacidad y datos del vendedor.",
      jsonLd: [breadcrumb("Contacto", "/contacto")],
    }),
});

function ContactPage() {
  const { lang } = useI18n();
  const es = lang === "es";

  const channels = [
    {
      title: es ? "Soporte del producto" : "Product support",
      body: es
        ? "Escribe con tu correo de cuenta y una descripción del problema. Respondemos dentro de 2 días hábiles, en español o inglés."
        : "Write with your account email and a description of the issue. We reply within 2 business days, in Spanish or English.",
      email: "soporte@kionas.app",
    },
    {
      title: es ? "Privacidad y datos" : "Privacy and data",
      body: es
        ? "Acceso, rectificación, exportación o eliminación de tus datos. Respondemos dentro de 30 días."
        : "Access, rectification, export or deletion of your data. We reply within 30 days.",
      email: "privacy@kionas.app",
    },
    {
      title: es ? "Reportar contenido" : "Report content",
      body: es
        ? "Si una respuesta generada te parece inapropiada o inexacta, indícanos la conversación y la fecha."
        : "If a generated answer seems inappropriate or inaccurate, tell us the conversation and the date.",
      email: "soporte@kionas.app",
    },
  ];

  return (
    <>
      <section aria-labelledby="contact-title" className="border-b border-border">
        <div className="inst-container grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
          <div>
            <Eyebrow>{es ? "Contacto institucional" : "Institutional contact"}</Eyebrow>
            <h1 id="contact-title" className="inst-title mt-5 text-[clamp(2.4rem,1.6rem+3vw,4rem)]">
              {CONTACT.title[lang]}
            </h1>
            <p className="mt-6 text-lead text-muted-foreground">{CONTACT.lead[lang]}</p>
            <ol className="mt-10 space-y-4 border-t border-border pt-6 text-small text-ink">
              <li className="flex gap-3">
                <span className="font-semibold text-bronze">01</span>
                {es ? "Completa el formulario con tus datos institucionales." : "Complete the form with your institutional details."}
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-bronze">02</span>
                {es ? "Revisamos tu solicitud y te escribimos para coordinar." : "We review your request and write to you to coordinate."}
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-bronze">03</span>
                {es ? "Conversamos sobre tus objetivos y una posible demostración." : "We talk about your goals and a possible demo."}
              </li>
            </ol>
          </div>
          <LeadForm sourcePath="/contacto" />
        </div>
      </section>

      <section aria-labelledby="support-title" className="bg-card py-16 md:py-20">
        <div className="inst-container">
          <Eyebrow>{es ? "Otros canales" : "Other channels"}</Eyebrow>
          <h2 id="support-title" className="inst-title mt-4 text-[clamp(1.8rem,1.3rem+1.6vw,2.5rem)]">
            {es ? "Soporte y datos del vendedor" : "Support and seller details"}
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4">
            <div className="bg-background p-6">
              <h3 className="inst-h3">{es ? "Vendedor" : "Seller"}</h3>
              <p className="mt-2 text-small whitespace-pre-line text-ink">
                {es
                  ? "Kionas IA\nServicio: Kionas.app\nDomicilio: Santiago, Chile"
                  : "Kionas IA\nService: Kionas.app\nAddress: Santiago, Chile"}
              </p>
            </div>
            {channels.map((c) => (
              <div key={c.title} className="bg-background p-6">
                <h3 className="inst-h3">{c.title}</h3>
                <p className="mt-2 text-small text-muted-foreground">{c.body}</p>
                <a href={`mailto:${c.email}`} className="inst-link mt-3 inline-block text-small">
                  {c.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
