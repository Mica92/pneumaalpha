declare global {
  interface Window {
    LemonSqueezy?: {
      Setup: (options: { eventHandler?: (event: { event?: string }) => void }) => void;
      Url: { Open: (url: string) => void };
      Refresh: () => void;
    };
    createLemonSqueezy?: () => void;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads Lemon.js once and wires the overlay event handler. */
export function loadLemon(onEvent: (event: string) => void): Promise<void> {
  if (window.LemonSqueezy) {
    window.LemonSqueezy.Setup({ eventHandler: (e) => onEvent(e?.event ?? "") });
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://app.lemonsqueezy.com/js/lemon.js";
      script.defer = true;
      script.onload = () => {
        window.createLemonSqueezy?.();
        resolve();
      };
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("lemon_js_failed"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise.then(() => {
    window.LemonSqueezy?.Setup({ eventHandler: (e) => onEvent(e?.event ?? "") });
  });
}

export function openLemonOverlay(url: string) {
  window.LemonSqueezy?.Url.Open(url);
}
