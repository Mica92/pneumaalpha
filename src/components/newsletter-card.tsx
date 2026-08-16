import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { subscribeNewsletter } from "@/lib/newsletter.functions";

export function NewsletterCard({ className = "" }: { className?: string }) {
  const { lang, t } = useI18n();
  const subscribeFn = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || state === "sending") return;
    setState("sending");
    try {
      const res = await subscribeFn({ data: { email: value, lang } });
      setState("done");
      toast.success(res.already ? t("news.already") : t("news.done"));
    } catch (err) {
      console.error("[newsletter] subscribe failed", err);
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
        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="newsletter-email">
            {t("news.placeholder")}
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("news.placeholder")}
            disabled={state === "sending"}
            className="focus-mist flex-1 rounded-md border border-border bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-sage/50 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="focus-mist rounded-md border border-sage/40 bg-sage/10 px-5 py-2.5 font-display text-[11px] uppercase tracking-[0.3em] text-foreground transition-all hover:border-sage/70 hover:bg-sage/15 disabled:opacity-40"
          >
            {state === "sending" ? t("news.submitting") : t("news.submit")}
          </button>
        </form>
      )}
      <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {t("news.privacy")}
      </p>
    </section>
  );
}
