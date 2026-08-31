import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { prepareCheckout } from "@/lib/billing.functions";
import { getPaddlePriceId, initializePaddle } from "@/lib/paddle";
import type { PlanId } from "@/lib/billing.shared";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";

/**
 * Shared Paddle overlay checkout, used by /planes and by the in-chat plan picker.
 * Keeps server-side validation (active subscription, lifetime seats) as the single gate.
 */
export function usePaddleCheckout(options?: { successPath?: string; onCompleted?: () => void }) {
  const { lang } = useI18n();
  const es = lang === "es";
  const { user } = useAuth();
  const prepare = useServerFn(prepareCheckout);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (plan: PlanId) => {
      setError(null);
      setPending(plan);
      track("checkout_started", { plan });
      try {
        const res = await prepare({ data: { plan } });
        if ("error" in res) {
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
          return;
        }

        await initializePaddle();
        const paddlePriceId = await getPaddlePriceId(res.priceId);
        window.Paddle.Checkout.open({
          items: [{ priceId: paddlePriceId, quantity: 1 }],
          customer: user?.email ? { email: user.email } : undefined,
          customData: { user_id: user?.id ?? "", plan },
          settings: {
            displayMode: "overlay",
            variant: "one-page",
            successUrl: `${window.location.origin}${options?.successPath ?? "/planes?pago=ok"}`,
            allowLogout: false,
          },
          eventCallback: (event: { name?: string }) => {
            if (event?.name === "checkout.completed") options?.onCompleted?.();
          },
        });
      } catch {
        setError(es ? "No pudimos abrir el pago." : "We couldn't open checkout.");
      } finally {
        setPending(null);
      }
    },
    [es, options, prepare, user?.email, user?.id],
  );

  return { start, pending, error, setError };
}
