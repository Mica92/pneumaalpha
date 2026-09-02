import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PaymentTestModeBanner } from "@/components/payment-test-mode-banner";
import { useI18n } from "@/lib/i18n";
import { useEntitlement } from "@/hooks/use-entitlement";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import {
  FREE_MESSAGE_LIMIT,
  LIFETIME_SEATS,
  PLANS,
  formatClp,
  formatUsd,
} from "@/lib/billing.shared";
import { track } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/planes")({
  component: PlansPage,
  head: () => {
    const title = "Planes y suscripción — Pneum";
    const description =
      "Conversa gratis con cualquier filósofo o accede a todo Pneum: historial completo, reporte psicológico y podcast. Plan mensual, semestral o vitalicio.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/planes` }],
    };
  },
});

function PlansPage() {
  const { lang } = useI18n();
  const es = lang === "es";
  const { entitlement, isLoading } = useEntitlement();
  const { start, pending, error } = usePaddleCheckout({ successPath: "/planes?pago=ok" });

  useEffect(() => {
    track("pricing_viewed");
  }, []);

  return (
    <>
      <PaymentTestModeBanner />
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <p className="label">{es ? "Acceso" : "Access"}</p>
        <h1 className="mt-4 font-serif text-title font-light text-foreground">
          {es ? "Planes" : "Plans"}
        </h1>
        <p className="mt-5 max-w-2xl text-small leading-relaxed text-muted-foreground">
          {es
            ? `Puedes conversar gratis: ${FREE_MESSAGE_LIMIT} mensajes con cualquier filósofo, sin historial completo, sin reporte y sin podcast. Cuando quieras seguir, elige un plan.`
            : `You can talk for free: ${FREE_MESSAGE_LIMIT} messages with any philosopher, without full history, report or podcast. When you want to go further, choose a plan.`}
        </p>

        {entitlement.active && (
          <div className="card-editorial mt-8 p-5">
            <p className="label">{es ? "Tu suscripción" : "Your subscription"}</p>
            <p className="mt-2 font-serif text-subtitle text-foreground">
              {PLANS.find((p) => p.id === entitlement.plan)?.name[lang]} ·{" "}
              {entitlement.plan === "lifetime"
                ? es
                  ? "para siempre"
                  : "forever"
                : entitlement.currentPeriodEnd
                  ? `${es ? "vigente hasta" : "valid until"} ${new Date(entitlement.currentPeriodEnd).toLocaleDateString(es ? "es-CL" : "en-GB")}`
                  : ""}
            </p>
          </div>
        )}

        {!entitlement.active && !isLoading && (
          <p className="mt-4 text-small text-muted-foreground">
            {es
              ? `Te quedan ${entitlement.freeMessagesLeft} de ${FREE_MESSAGE_LIMIT} mensajes gratuitos.`
              : `You have ${entitlement.freeMessagesLeft} of ${FREE_MESSAGE_LIMIT} free messages left.`}
          </p>
        )}

        {error && <p className="mt-6 text-small text-bronze">{error}</p>}

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const soldOut = plan.limited && entitlement.lifetimeSeatsLeft <= 0;
            return (
              <article
                key={plan.id}
                className={cn(
                  "card-editorial flex flex-col p-6",
                  plan.featured && "border-bronze/50",
                )}
              >
                <p className="label">{plan.name[lang]}</p>
                <p className="mt-4 font-serif text-title font-light text-foreground">
                  {formatUsd(plan.usd, lang)}
                </p>
                <p className="mt-1 text-micro text-muted-foreground">≈ {formatClp(plan.clp)}</p>
                <p className="mt-2 text-micro leading-relaxed text-muted-foreground">
                  {plan.id === "monthly"
                    ? es
                      ? "Cobro mensual en USD. Se renueva automáticamente cada mes hasta que lo canceles."
                      : "Billed monthly in USD. Renews automatically every month until you cancel."
                    : plan.id === "semiannual"
                      ? es
                        ? "Cobro único de 6 meses en USD. Se renueva automáticamente cada 6 meses hasta que lo canceles."
                        : "Billed once for 6 months in USD. Renews automatically every 6 months until you cancel."
                      : es
                        ? "Pago único en USD. No se renueva ni se cobra de nuevo."
                        : "One-time payment in USD. No renewal, no further charges."}
                </p>
                <p className="mt-4 text-small leading-relaxed text-muted-foreground">
                  {plan.tagline[lang]}
                </p>
                {plan.limited && (
                  <p className="mt-3 text-micro text-bronze">
                    {soldOut
                      ? es
                        ? "Cupos agotados"
                        : "Sold out"
                      : es
                        ? `Quedan ${entitlement.lifetimeSeatsLeft} de ${LIFETIME_SEATS} cupos`
                        : `${entitlement.lifetimeSeatsLeft} of ${LIFETIME_SEATS} seats left`}
                  </p>
                )}
                <ul className="mt-6 flex flex-1 flex-col gap-2 text-small text-muted-foreground">
                  {plan.perks[lang].map((perk) => (
                    <li key={perk} className="flex gap-2">
                      <span aria-hidden="true" className="text-bronze">
                        ·
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={entitlement.active || soldOut || pending !== null}
                  onClick={() => start(plan.id)}
                  className={cn(
                    "mt-8 w-full",
                    plan.featured ? "btn-gold" : "btn-ghost-gold",
                    (entitlement.active || soldOut) && "cursor-not-allowed opacity-50",
                  )}
                >
                  {pending === plan.id
                    ? es
                      ? "Abriendo…"
                      : "Opening…"
                    : entitlement.active
                      ? es
                        ? "Ya tienes acceso"
                        : "You already have access"
                      : soldOut
                        ? es
                          ? "Agotado"
                          : "Sold out"
                        : es
                          ? "Suscribirme"
                          : "Subscribe"}
                </button>
                <p className="mt-3 text-center text-micro leading-relaxed text-muted-foreground">
                  {es
                    ? "Paddle.com es el Comerciante Registrado. 30 días de garantía de devolución. Cancela cuando quieras."
                    : "Paddle.com is the Merchant of Record. 30-day money-back guarantee. Cancel anytime."}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-micro leading-relaxed text-muted-foreground">
          {es
            ? "Vendido por Kionas IA. Pagos procesados por Paddle.com, comerciante registrado (Merchant of Record). En Chile pagas en pesos; en el resto del mundo, en dólares. 30 días de garantía de devolución."
            : "Sold by Kionas IA. Payments processed by Paddle.com, Merchant of Record. In Chile you pay in pesos; elsewhere, in US dollars. 30-day money-back guarantee."}
        </p>
        <p className="mt-3 text-micro leading-relaxed text-muted-foreground">
          {es
            ? "¿Dudas antes de comprar? Escríbenos a soporte@pneumaalpha.app y te respondemos en un máximo de 2 días hábiles."
            : "Questions before buying? Write to soporte@pneumaalpha.app and we reply within 2 business days."}
        </p>
        <p className="mt-3 flex flex-wrap gap-4 text-micro uppercase tracking-[0.25em] text-muted-foreground">
          <Link to="/terminos" className="hover:text-foreground">
            {es ? "Términos" : "Terms"}
          </Link>
          <Link to="/reembolsos" className="hover:text-foreground">
            {es ? "Reembolsos" : "Refunds"}
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            {es ? "Privacidad" : "Privacy"}
          </Link>
          <Link to="/uso-de-ia" className="hover:text-foreground">
            {es ? "Uso de IA" : "AI use"}
          </Link>
          <Link to="/contacto" className="hover:text-foreground">
            {es ? "Contacto" : "Contact"}
          </Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
