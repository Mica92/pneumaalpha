import { useCallback, useEffect, useRef, useState } from "react";
import { CAPTURE_KINDS, KIND_LABEL, KIND_TONE, type ThoughtKind } from "@/lib/workspace.shared";

type Props = {
  lang: "es" | "en";
  /** Turns the selected fragment into a thought object. */
  onCapture: (kind: ThoughtKind, text: string) => void;
  children: React.ReactNode;
  className?: string;
};

const COPY = {
  es: { title: "¿Qué quieres hacer con esto?", close: "Cerrar" },
  en: { title: "What do you want to do with this?", close: "Close" },
} as const;

/**
 * Wraps the thinking stream: selecting any fragment offers to turn it into a
 * question, assumption, value, tension, insight or decision.
 */
export function SelectionCapture({ lang, onCapture, children, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<{ text: string; x: number; y: number } | null>(null);

  const close = useCallback(() => setMenu(null), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const read = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!sel || sel.rangeCount === 0 || text.length < 8) {
        setMenu(null);
        return;
      }
      const node = sel.anchorNode;
      if (!node || !host.contains(node)) {
        setMenu(null);
        return;
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      setMenu({
        text: text.slice(0, 2000),
        x: Math.min(Math.max(rect.left - hostRect.left + rect.width / 2, 130), hostRect.width - 130),
        y: Math.max(rect.top - hostRect.top - 12, 8),
      });
    };

    const onUp = () => window.setTimeout(read, 0);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, []);

  const c = COPY[lang];

  return (
    <div ref={hostRef} className={`relative ${className}`}>
      {children}

      {menu && (
        <div
          role="dialog"
          aria-label={c.title}
          style={{ left: menu.x, top: menu.y }}
          className="fade-up absolute z-40 w-[17rem] -translate-x-1/2 -translate-y-full rounded-xl border border-border/70 bg-card/95 p-3 shadow-2xl backdrop-blur-xl"
        >
          <p className="font-display text-micro uppercase tracking-[0.25em] text-muted-foreground">
            {c.title}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {CAPTURE_KINDS.map((kind) => (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => {
                    onCapture(kind, menu.text);
                    window.getSelection()?.removeAllRanges();
                    close();
                  }}
                  className={`focus-mist rounded-full border border-border/70 px-3 py-1.5 text-micro transition-colors hover:border-mist/50 ${KIND_TONE[kind]}`}
                >
                  {KIND_LABEL[kind][lang]}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={close}
            className="focus-mist mt-2 text-micro uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            {c.close}
          </button>
        </div>
      )}
    </div>
  );
}
