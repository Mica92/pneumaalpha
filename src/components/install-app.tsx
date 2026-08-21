import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pneuma.install.dismissed";

/**
 * Quiet "install this app" card. Only appears when the browser actually offers
 * installation (Chromium `beforeinstallprompt`) or on iOS Safari, where the
 * user must add it manually from the share sheet.
 */
export function InstallAppCard({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");

    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Android/.test(ua);
    if (isIos && isSafari) setIosHint(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (dismissed || (!deferred && !iosHint)) return null;

  const close = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage unavailable — the card simply reappears next visit */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    close();
  };

  const title = lang === "es" ? "Instalar PneumAlpha" : "Install PneumAlpha";
  const body = deferred
    ? lang === "es"
      ? "Ábrela desde tu escritorio o pantalla de inicio, sin barra de navegador."
      : "Open it from your desktop or home screen, without a browser bar."
    : lang === "es"
      ? "Toca Compartir y luego «Añadir a pantalla de inicio»."
      : "Tap Share, then “Add to Home Screen”.";

  return (
    <aside
      className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 bg-card/40 px-5 py-4 ${className}`}
    >
      <div className="min-w-0">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-foreground">
          {title}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">{body}</p>
      </div>
      <div className="flex items-center gap-2">
        {deferred && (
          <button
            type="button"
            onClick={install}
            className="rounded-md border border-mist/40 bg-mist/95 px-4 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            {lang === "es" ? "Instalar" : "Install"}
          </button>
        )}
        <button
          type="button"
          onClick={close}
          className="rounded-md border border-border px-3 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
        >
          {lang === "es" ? "Ahora no" : "Not now"}
        </button>
      </div>
    </aside>
  );
}
