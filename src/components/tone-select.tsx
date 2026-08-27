import { useEffect, useId, useRef, useState } from "react";
import { TONES, getTone, type ToneId } from "@/lib/tones";
import { useI18n } from "@/lib/i18n";

type Props = {
  value: ToneId | null;
  onChange: (value: ToneId | null) => void;
  className?: string;
};

/**
 * Discreet dropdown that lets the person tell the AI how they want to be
 * spoken to (analytical, poetic, commanding, pragmatic, stoic…).
 */
export function ToneSelect({ value, onChange, className = "" }: Props) {
  const { lang } = useI18n();
  const es = lang === "es";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const label = es ? "¿Cómo quieres que te hablen?" : "How do you want to be spoken to?";
  const none = es ? "Sin preferencia" : "No preference";
  const current = value ? getTone(value).label[lang] : none;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        className="focus-mist inline-flex w-full items-center justify-between gap-3 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-micro text-muted-foreground backdrop-blur-sm transition-colors hover:border-bronze/60 hover:text-foreground sm:w-auto"
      >
        <span className="truncate">
          {label} <span className="text-foreground">{current}</span>
        </span>
        <span aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="fade-up absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-bronze/30 bg-background/95 p-2 text-left shadow-xl backdrop-blur-md sm:right-auto sm:w-80"
        >
          <ul className="flex flex-col gap-1">
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-small transition-colors hover:bg-card ${
                  value === null ? "text-bronze" : "text-muted-foreground"
                }`}
              >
                {none}
              </button>
            </li>
            {TONES.map((tone) => (
              <li key={tone.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(tone.id);
                    setOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-card ${
                    value === tone.id ? "bg-card/70" : ""
                  }`}
                >
                  <span
                    className={`block text-small ${
                      value === tone.id ? "text-bronze" : "text-foreground"
                    }`}
                  >
                    {tone.label[lang]}
                  </span>
                  <span className="block text-micro text-muted-foreground">{tone.hint[lang]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
