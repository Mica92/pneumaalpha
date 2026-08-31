import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";
import { useEntitlement } from "@/hooks/use-entitlement";
import { createCheckout } from "@/lib/billing.functions";
import {
  FREE_MESSAGE_LIMIT,
  LIFETIME_SEATS,
  PLANS,
  formatClp,
  formatUsd,
  type PlanId,
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
  const checkout = useServerFn(createCheckout);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("pricing_viewed");
  }, []);

  async function start(plan: PlanId) {
    setError(null);
    setPending(plan);
    track("checkout_started", { plan });
    try {
      const res = await checkout({
        data: { plan, returnUrl: `${window.location.origin}/planes` },
      });
      if ("url" in res) {
        window.location.href = res.url;
        return;
      }
      setError(
        res.error === "not_configured"
          ? es
            ? "La pasarela de pago aún no está conectada. Vuelve pronto."
            : "The payment gateway is not connected yet. Come back soon."
          : res.error === "sold_out"
            ? es
              ? "Los cupos vitalicios se agotaron."
              : "Lifetime seats are sold out."
            : res.error === "already_subscribed"
              ? es
                ? "Ya tienes una suscripción activa."
                : "You already have an active subscription."
              : es
                ? "No pudimos abrir el pago. Inténtalo de nuevo."
                : "We couldn't open checkout. Please try again.",
      );
    } catch {
      setError(es ? "No pudimos abrir el pago." : "We couldn't open checkout.");
    } finally {
      setPending(null);
    }
  }

  return (
    <>
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
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-micro text-muted-foreground">
          {es
            ? "Los pagos se procesan en dólares a través de Whop. El valor en pesos es referencial."
            : "Payments are processed in US dollars through Whop. The Chilean peso amount is indicative."}
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
