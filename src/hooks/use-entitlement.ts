import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getEntitlement } from "@/lib/billing.functions";
import { FREE_MESSAGE_LIMIT, LIFETIME_SEATS, type Entitlement } from "@/lib/billing.shared";

const FALLBACK: Entitlement = {
  active: false,
  plan: null,
  currentPeriodEnd: null,
  freeMessagesUsed: 0,
  freeMessagesLeft: FREE_MESSAGE_LIMIT,
  lifetimeSeatsTaken: 0,
  lifetimeSeatsLeft: LIFETIME_SEATS,
  checkoutConfigured: false,
};

export function useEntitlement(enabled = true) {
  const fetchEntitlement = useServerFn(getEntitlement);
  const query = useQuery({
    queryKey: ["entitlement"],
    queryFn: () => fetchEntitlement({ data: {} } as never),
    enabled,
    staleTime: 30_000,
  });
  return {
    entitlement: (query.data as Entitlement | undefined) ?? FALLBACK,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
