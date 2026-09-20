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

const ONCE_PREFIX = "pneum.once.";
const LAST_SEEN_KEY = "pneum.lastSeen";
const VISIT_COUNT_KEY = "pneum.visits";
const SESSION_GAP_MS = 30 * 60 * 1000;

/** Emits an event at most once per browser, for lifetime milestones. */
export function trackOnce(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  try {
    const key = ONCE_PREFIX + event;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    /* private mode: emit anyway rather than lose the signal */
  }
  track(event, props);
}

/**
 * Marks the visit and, when the previous activity is older than 30 minutes and
 * this is not the very first visit, also a returning session.
 */
export function trackVisit() {
  if (typeof window === "undefined") return;
  track("visit");
  try {
    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_SEEN_KEY) ?? 0);
    const visits = Number(localStorage.getItem(VISIT_COUNT_KEY) ?? 0);
    if (last && now - last > SESSION_GAP_MS) {
      localStorage.setItem(VISIT_COUNT_KEY, String(visits + 1));
      track("return_session", { sessions: visits + 1 });
    } else if (!last) {
      localStorage.setItem(VISIT_COUNT_KEY, "1");
    }
    localStorage.setItem(LAST_SEEN_KEY, String(now));
  } catch {
    /* ignore */
  }
}
