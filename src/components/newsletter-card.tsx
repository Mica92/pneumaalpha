import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { subscribeNewsletter } from "@/lib/newsletter.functions";

const PENDING_KEY = "pneuma:newsletter-pending";
const PENDING_PHONE_KEY = "pneuma:newsletter-phone";

/** Strip spaces, dots, dashes and parentheses; keep a single leading plus. */
function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? `+${cleaned.slice(1).replace(/\+/g, "")}` : cleaned;
}

function isValidPhone(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}

export function NewsletterCard({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const subscribeFn = useServerFn(subscribeNewsletter);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [phone, setPhone] = useState("");
  const attempted = useRef(false);

  const email = user?.email ?? null;

  const subscribe = useCallback(
    async (value: string, phoneValue?: string) => {
      setState("sending");
      try {
        const res = await subscribeFn({
          data: {
            email: value,
            lang,
            ...(phoneValue ? { phone: phoneValue } : {}),
          },
        });
        setState("done");
        toast.success(res.already ? t("news.already") : t("news.done"));
      } catch (err) {
        console.error("[newsletter] subscribe failed", err);
        setState("idle");
        toast.error(t("news.error"));
      }
    },
    [subscribeFn, lang, t],
  );

  // Returning from the Google redirect: finish the pending subscription.
  useEffect(() => {
    if (attempted.current || !email) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(PENDING_KEY) !== "1") return;
    attempted.current = true;
    const stored = window.localStorage.getItem(PENDING_PHONE_KEY) ?? "";
    window.localStorage.removeItem(PENDING_KEY);
    window.localStorage.removeItem(PENDING_PHONE_KEY);
    void subscribe(email, isValidPhone(stored) ? stored : undefined);
  }, [email, subscribe]);

  const onGoogle = async () => {
    if (state === "sending") return;
    const normalized = normalizePhone(phone);
    if (normalized && !isValidPhone(normalized)) {
      toast.error(t("news.phoneInvalid"));
      return;
    }
    if (email) {
      await subscribe(email, normalized || undefined);
      return;
    }
    setState("sending");
    try {
      window.localStorage.setItem(PENDING_KEY, "1");
      if (normalized) window.localStorage.setItem(PENDING_PHONE_KEY, normalized);
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if ("error" in res && res.error) throw res.error;
      // Non-redirect flow: the session is already set, subscribe right away.
      if (!("redirected" in res && res.redirected)) {
        window.localStorage.removeItem(PENDING_KEY);
        window.localStorage.removeItem(PENDING_PHONE_KEY);
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase.auth.getUser();
        const mail = data.user?.email;
        if (mail) {
          attempted.current = true;
          await subscribe(mail, normalized || undefined);
          return;
        }
        setState("idle");
      }
    } catch (err) {
      console.error("[newsletter] google sign-in failed", err);
      window.localStorage.removeItem(PENDING_KEY);
      window.localStorage.removeItem(PENDING_PHONE_KEY);
      setState("idle");
      toast.error(t("news.error"));
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className={`relative overflow-hidden rounded-xl border border-sage/35 bg-card/50 p-6 backdrop-blur-sm md:p-8 ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sage/60 to-transparent" />
      <p className="font-display text-[10px] uppercase tracking-[0.35em] text-sage">
        {t("news.kicker")}
      </p>
      <h2
        id="newsletter-heading"
        className="mt-3 font-display text-xl font-light tracking-tight text-foreground md:text-2xl"
      >
        {t("news.title")}
      </h2>
      <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground md:text-sm">
        {t("news.sub")}
      </p>

      {state === "done" ? (
        <p className="mt-5 text-sm text-foreground/85">{t("news.done")}</p>
      ) : (
        <div className="mt-5 flex flex-col items-start gap-3">
          <div className="w-full max-w-xs">
            <label
              htmlFor="newsletter-phone"
              className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              {t("news.phoneLabel")}
            </label>
            <input
              id="newsletter-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("news.phonePlaceholder")}
              aria-describedby="newsletter-phone-hint"
              className="focus-mist mt-2 w-full rounded-md border border-sage/30 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60"
            />
            <p
              id="newsletter-phone-hint"
              className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/80"
            >
              {t("news.phoneHint")}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoogle}
            disabled={state === "sending"}
            className="focus-mist inline-flex items-center gap-3 rounded-md border border-sage/40 bg-sage/10 px-5 py-2.5 font-display text-[11px] uppercase tracking-[0.3em] text-foreground transition-all hover:border-sage/70 hover:bg-sage/15 disabled:opacity-40"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c5.5 0 9.1-3.8 9.1-9.2 0-.6-.06-1.1-.15-1.6H12z" />
            </svg>
            {state === "sending"
              ? t("news.submitting")
              : email
                ? t("news.googleSub")
                : t("news.google")}
          </button>
          {email ? (
            <p className="text-[11px] text-muted-foreground/80">{email}</p>
          ) : null}
        </div>
      )}
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {t("news.privacy")}
      </p>
    </section>
  );
}
