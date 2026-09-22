import { forwardRef } from "react";

export type ThinkingCommand = "clarify" | "question" | "shift" | "deepen" | "summarize";

const COPY = {
  es: {
    title: "¿Qué estás intentando comprender?",
    placeholder:
      "Cuéntame lo que está ocurriendo, incluso si todavía no sabes exactamente cómo formularlo.",
    send: "Enviar",
    mic: "Dictar",
    micStop: "Detener dictado",
    hint: "Enter envía · Mayús+Enter salta de línea",
    commands: {
      clarify: "Clarificar",
      question: "Cuestionar",
      shift: "Cambiar perspectiva",
      deepen: "Profundizar",
      summarize: "Resumir",
    },
  },
  en: {
    title: "What are you trying to understand?",
    placeholder: "Tell me what is happening, even if you can't phrase it precisely yet.",
    send: "Send",
    mic: "Dictate",
    micStop: "Stop dictation",
    hint: "Enter sends · Shift+Enter adds a line",
    commands: {
      clarify: "Clarify",
      question: "Question it",
      shift: "Shift perspective",
      deepen: "Go deeper",
      summarize: "Summarise",
    },
  },
} as const;

const COMMANDS: ThinkingCommand[] = ["clarify", "question", "shift", "deepen", "summarize"];

type Props = {
  lang: "es" | "en";
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  /** Contextual prompts shown above the field. */
  suggestions: string[];
  onSuggestion: (text: string) => void;
  onCommand: (command: ThinkingCommand) => void;
  /** Shows the big invitation instead of a bare field. */
  showTitle: boolean;
  mic?: {
    supported: boolean;
    listening: boolean;
    interim: string;
    toggle: () => void;
  };
};

export const ThinkingComposer = forwardRef<HTMLTextAreaElement, Props>(function ThinkingComposer(
  {
    lang,
    value,
    onChange,
    onSubmit,
    disabled,
    suggestions,
    onSuggestion,
    onCommand,
    showTitle,
    mic,
  },
  ref,
) {
  const c = COPY[lang];

  return (
    <div className="mx-auto w-full max-w-3xl">
      {showTitle && (
        <p className="mb-3 font-display text-subtitle font-light text-foreground/90">{c.title}</p>
      )}

      {suggestions.length > 0 && (
        <ul className="mb-3 hidden flex-wrap gap-2 md:flex">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onSuggestion(s)}
                disabled={disabled}
                className="focus-mist rounded-full border border-border/60 px-3 py-1.5 text-micro text-muted-foreground transition-colors hover:border-mist/50 hover:text-foreground disabled:opacity-40"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="rounded-2xl border border-border/70 bg-card/40 p-3 transition-colors focus-within:border-mist/50"
      >
        <textarea
          ref={ref}
          name="msg"
          rows={showTitle ? 3 : 2}
          value={value}
          aria-label={c.title}
          placeholder={mic?.listening ? mic.interim || c.micStop : c.placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
            const isSend = !e.shiftKey || e.metaKey || e.ctrlKey;
            if (!isSend) return;
            e.preventDefault();
            if (disabled || !value.trim()) return;
            onSubmit();
          }}
          onInput={(e) => {
            const ta = e.currentTarget;
            ta.style.height = "auto";
            ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
          }}
          className="focus-mist w-full resize-none bg-transparent px-2 py-2 text-body leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/80 disabled:opacity-50"
        />

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2">
          <ul className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto md:flex-wrap md:overflow-visible">
            {COMMANDS.map((cmd) => (
              <li key={cmd}>
                <button
                  type="button"
                  onClick={() => onCommand(cmd)}
                  disabled={disabled}
                  className="focus-mist rounded-full px-2.5 py-1 text-micro uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  {c.commands[cmd]}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {mic && (
              <button
                type="button"
                onClick={mic.toggle}
                disabled={disabled}
                aria-pressed={mic.listening}
                aria-label={mic.listening ? c.micStop : c.mic}
                title={mic.listening ? c.micStop : c.mic}
                className={`focus-mist inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:opacity-30 ${
                  mic.listening
                    ? "border-mist/70 bg-mist/15 text-mist pneuma-breathe"
                    : "border-border/60 text-muted-foreground hover:border-mist/50 hover:text-mist"
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={disabled || !value.trim()}
              className="focus-mist inline-flex h-9 items-center rounded-full border border-mist/40 bg-mist/95 px-5 font-display text-small text-primary-foreground transition-all hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30"
            >
              {c.send}
            </button>
          </div>
        </div>
      </form>

      <p className="mt-2 hidden text-center text-micro uppercase tracking-[0.3em] text-muted-foreground md:block">
        {c.hint}
      </p>
    </div>
  );
});
