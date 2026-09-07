import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { prepareCheckout } from "@/lib/billing.functions";
import { loadLemon, openLemonOverlay } from "@/lib/lemon";
import type { PlanId } from "@/lib/billing.shared";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";

/**
 * Shared Lemon Squeezy overlay checkout, used by /planes and by the in-chat
 * plan picker. Server-side validation (session, active plan, lifetime seats)
 * stays the single gate; the browser never grants access.
 */
export function useLemonCheckout(options?: { successPath?: string; onCompleted?: () => void }) {
  const { lang } = useI18n();
  const es = lang === "es";
  const prepare = useServerFn(prepareCheckout);
  const [pending, setPending] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (plan: PlanId) => {
      setError(null);
      setPending(plan);
      track("checkout_started", { plan });
      try {
        const redirectUrl = `${window.location.origin}${options?.successPath ?? "/planes?pago=ok"}`;
        const res = await prepare({ data: { plan, redirectUrl } });
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

        await loadLemon((event) => {
          if (event === "Checkout.Success") options?.onCompleted?.();
        });
        openLemonOverlay(res.url);
      } catch {
        setError(es ? "No pudimos abrir el pago." : "We couldn't open checkout.");
      } finally {
        setPending(null);
      }
    },
    [es, options, prepare],
  );

  return { start, pending, error, setError };
}
