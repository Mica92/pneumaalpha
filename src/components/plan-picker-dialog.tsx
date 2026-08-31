import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useEntitlement } from "@/hooks/use-entitlement";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { LIFETIME_SEATS, PLANS, formatClp, formatUsd } from "@/lib/billing.shared";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Mini plan selector shown inside the chat: pick a plan and pay in the Paddle
 * overlay without leaving the conversation.
 */
export function PlanPickerDialog({
  open,
  onClose,
  onPurchased,
}: {
  open: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}) {
  const { lang } = useI18n();
  const es = lang === "es";
  const { entitlement, refetch } = useEntitlement();
  const { start, pending, error } = usePaddleCheckout({
    successPath: "/planes?pago=ok",
    onCompleted: () => {
      void refetch();
      onPurchased?.();
      onClose();
    },
  });

  useEffect(() => {
    if (open) track("pricing_viewed", { surface: "chat" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={es ? "Elegir plan" : "Choose a plan"}
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label={es ? "Cerrar" : "Close"}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="card-editorial relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label">{es ? "Acceso completo" : "Full access"}</p>
            <h2 className="mt-2 font-serif text-subtitle font-light text-foreground">
              {es ? "Sigue la conversación" : "Keep the conversation going"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-mist text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {es ? "Cerrar" : "Close"}
          </button>
        </div>

        {error && <p className="mt-4 text-small text-bronze">{error}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const soldOut = plan.limited && entitlement.lifetimeSeatsLeft <= 0;
            return (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-lg border border-border/60 p-5",
                  plan.featured && "border-bronze/50",
                )}
              >
                <p className="label">{plan.name[lang]}</p>
                <p className="mt-3 font-serif text-subtitle font-light text-foreground">
                  {formatUsd(plan.usd, lang)}
                </p>
                <p className="mt-1 text-micro text-muted-foreground">≈ {formatClp(plan.clp)}</p>
                <p className="mt-3 flex-1 text-small leading-relaxed text-muted-foreground">
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
                <button
                  type="button"
                  disabled={soldOut || pending !== null}
                  onClick={() => start(plan.id)}
                  className={cn(
                    "mt-5 w-full",
                    plan.featured ? "btn-gold" : "btn-ghost-gold",
                    soldOut && "cursor-not-allowed opacity-50",
                  )}
                >
                  {pending === plan.id
                    ? es
                      ? "Abriendo…"
                      : "Opening…"
                    : soldOut
                      ? es
                        ? "Agotado"
                        : "Sold out"
                      : es
                        ? "Pagar"
                        : "Pay"}
                </button>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-micro text-muted-foreground">
          {es
            ? "Pagos procesados por Paddle, comerciante registrado. 30 días de garantía."
            : "Payments processed by Paddle, Merchant of Record. 30-day money-back guarantee."}{" "}
          <Link to="/planes" className="underline underline-offset-4 hover:text-foreground">
            {es ? "Ver detalle de planes" : "See full plan details"}
          </Link>
        </p>
      </div>
    </div>
  );
}
