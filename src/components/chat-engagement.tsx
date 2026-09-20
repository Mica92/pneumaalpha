import { useEffect, useState } from "react";
import {
  Briefcase,
  Circle,
  Compass,
  Diamond,
  Minus,
  Target,
  Triangle,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  ROOT_QUESTIONS,
  TOPICS,
  getContinuations,
  getDailyDilemma,
  type TopicId,
} from "@/lib/engagement";
import { useI18n } from "@/lib/i18n";

const TOPIC_ICONS: Record<TopicId, LucideIcon> = {
  work: Briefcase,
  love: Circle,
  fear: Triangle,
  purpose: Target,
  adventure: Compass,
  growth: Minus,
};

type SendFn = (text: string) => void | Promise<void>;

/* --------------------------------- Topic bar -------------------------------- */

export function TopicBar({
  activeTopic,
  onPick,
  disabled,
}: {
  activeTopic: TopicId | null;
  onPick: (topic: TopicId) => void;
  disabled?: boolean;
}) {
  const { lang, t } = useI18n();
  return (
    <div
      role="tablist"
      aria-label={t("chat.topics.aria")}
      className="border-b border-border/40 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-3xl overflow-x-auto px-4">
        <div className="flex min-h-[52px] items-center gap-2 py-2">
          {TOPICS.map((topic) => {
            const active = topic.id === activeTopic;
            const Icon = TOPIC_ICONS[topic.id];
            return (
              <button
                key={topic.id}
                role="tab"
                aria-selected={active}
                disabled={disabled}
                onClick={() => onPick(topic.id)}
                className={`group flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-micro uppercase tracking-[0.25em] transition-all duration-300 disabled:opacity-40 ${
                  active
                    ? "border-foreground/25 text-foreground"
                    : "border-foreground/10 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                }`}
              >
                <Icon aria-hidden="true" size={12} strokeWidth={1.5} className="shrink-0" />
                <span>{topic.label[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Dilemma banner ------------------------------ */

export function DilemmaBanner({
  onConverse,
  disabled,
}: {
  onConverse: () => void;
  disabled?: boolean;
}) {
  const { lang, t } = useI18n();
  const [minimized, setMinimized] = useState(false);
  const [dilemma, setDilemma] = useState(() => getDailyDilemma(lang));

  useEffect(() => {
    setDilemma(getDailyDilemma(lang));
  }, [lang]);

  // Session-only minimized state.
  useEffect(() => {
    try {
      const flag = window.sessionStorage.getItem("pneuma.dilemma.minimized");
      if (flag === "1") setMinimized(true);
    } catch {}
  }, []);

  const setMin = (m: boolean) => {
    setMinimized(m);
    try {
      window.sessionStorage.setItem("pneuma.dilemma.minimized", m ? "1" : "0");
    } catch {}
  };

  if (minimized) {
    return (
      <div className="border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-end px-4 py-1.5">
          <button
            onClick={() => setMin(false)}
            aria-label={t("chat.dilemma.restore")}
            title={t("chat.dilemma.restore")}
            className="rounded-full border border-foreground/10 px-2.5 py-1 text-muted-foreground transition-colors duration-300 hover:border-foreground/25 hover:text-foreground"
          >
            <Diamond aria-hidden="true" size={12} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="relative flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-foreground/5 bg-card/70 p-4">
          <div className="flex min-w-0 items-center gap-4">
            <Diamond
              aria-hidden="true"
              size={16}
              strokeWidth={1.25}
              className="shrink-0 text-muted-foreground"
            />
            <div className="min-w-0">
              <p className="truncate whitespace-nowrap text-micro uppercase tracking-[0.32em] text-muted-foreground">
                {t("chat.dilemma.kicker")}
              </p>
              <p className="mt-1 line-clamp-2 font-display text-subtitle font-light leading-snug text-foreground/90 md:line-clamp-1">
                {dilemma}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onConverse}
              disabled={disabled}
              className="rounded-full border border-foreground/20 px-6 py-2 text-micro uppercase tracking-[0.25em] text-foreground/90 transition-all duration-300 hover:bg-foreground/5 hover:text-foreground disabled:opacity-40"
            >
              {t("chat.dilemma.converse")}
            </button>
            <button
              onClick={() => setMin(true)}
              aria-label={t("chat.dilemma.close")}
              title={t("chat.dilemma.close")}
              className="rounded-full p-1.5 text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <X aria-hidden="true" size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Continuation chips --------------------------- */

export function ContinuationChips({
  topic,
  onPick,
  disabled,
}: {
  topic: TopicId | null;
  onPick: SendFn;
  disabled?: boolean;
}) {
  const { lang, t } = useI18n();
  const items = getContinuations(topic, lang);
  return (
    <div className="mt-4">
      <p className="mb-2 font-display text-micro uppercase tracking-[0.32em] text-muted-foreground">
        {t("chat.chips.label")}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((text) => (
          <button
            key={text}
            disabled={disabled}
            onClick={() => onPick(text)}
            className="rounded-full border border-border/70 bg-card/40 px-3.5 py-1.5 text-micro text-foreground/85 transition-all hover:border-mist/40 hover:bg-card/70 hover:text-foreground disabled:opacity-40"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Root questions FAB + sheet ----------------------- */

export function RootQuestionsFab({ onPick, disabled }: { onPick: SendFn; disabled?: boolean }) {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={t("chat.root.aria")}
        title={t("chat.root.aria")}
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="fixed bottom-24 right-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-mist/40 bg-mist/15 text-foreground shadow-mist backdrop-blur-md transition-all hover:bg-mist/25 disabled:opacity-40 md:bottom-28 md:right-8"
      >
        <span aria-hidden="true" className="text-lg">
          ◇
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-xl fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("chat.root.title")}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-t-2xl border border-border/60 bg-background/95 shadow-deep fade-up"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <p className="font-display text-micro uppercase tracking-[0.32em] text-muted-foreground">
                  {t("chat.root.kicker")}
                </p>
                <h2 className="mt-1 font-display text-base font-light text-foreground">
                  {t("chat.root.title")}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {t("chat.archive.close")}
              </button>
            </header>
            <ul className="grid gap-2 px-6 py-5 sm:grid-cols-2">
              {ROOT_QUESTIONS.map((q) => (
                <li key={q.es}>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onPick(q[lang]);
                    }}
                    className="flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card/40 px-4 py-3 text-left text-small text-foreground/90 transition-all hover:border-mist/40 hover:bg-card/70"
                  >
                    <span aria-hidden="true" className="mt-0.5 text-mist/80">
                      ✦
                    </span>
                    <span>{q[lang]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
