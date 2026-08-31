import { trackEvent, type AnalyticsEvent } from "@/lib/analytics.functions";

const KEY = "pneum.session";

function sessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** Fire-and-forget product analytics. Never blocks or throws in the UI. */
export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  void trackEvent({ data: { event, sessionId: sessionId(), props } }).catch(() => {});
}
