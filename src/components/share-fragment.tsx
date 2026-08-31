import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { shareFragment } from "@/lib/library.functions";

type Props = {
  philosopher: PhilosopherId;
  text: string;
  question?: string;
};

const MAX = 1200;

/** Renders a quote card to a PNG blob, no external dependencies. */
function drawCard(quote: string, author: string, footer: string): Promise<Blob | null> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.fillStyle = "#0b0f12";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(168,184,194,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  // Quote — wrapped by hand.
  ctx.fillStyle = "#e6edf2";
  const size = quote.length > 420 ? 30 : quote.length > 260 ? 36 : 42;
  ctx.font = `300 ${size}px Sora, sans-serif`;
  const maxWidth = W - 220;
  const words = quote.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  const visible = lines.slice(0, 14);
  const lh = size * 1.55;
  let y = H / 2 - (visible.length * lh) / 2;
  for (const l of visible) {
    ctx.fillText(l, 110, y);
    y += lh;
  }

  ctx.fillStyle = "#a8b8c2";
  ctx.font = "500 28px Sora, sans-serif";
  ctx.fillText(`— ${author}`, 110, y + 40);

  ctx.fillStyle = "rgba(168,184,194,0.6)";
  ctx.font = "400 20px Manrope, sans-serif";
  ctx.fillText(footer, 110, H - 110);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function ShareFragmentButton({ philosopher, text, question }: Props) {
  const { lang, t } = useI18n();
  const submitFn = useServerFn(shareFragment);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const author = PHILOSOPHERS[philosopher]?.name ?? "Pneum";
  const excerpt = text.trim().slice(0, MAX);
  const footer = "pneum.app · Pneum";
  const shareText = `“${excerpt}”\n— ${author} · Pneum`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success(t("share.copied"));
    } catch {
      toast.error(t("share.failed"));
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      await handleCopy();
      return;
    }
    try {
      await navigator.share({ text: shareText, title: "Pneum" });
    } catch {
      /* user cancelled */
    }
  };

  const handleImage = async () => {
    const blob = await drawCard(excerpt, author, footer);
    if (!blob) {
      toast.error(t("share.failed"));
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pneumaa-${philosopher}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (sending || sent) return;
    if (excerpt.length < 20) {
      toast.error(t("share.tooShort"));
      return;
    }
    setSending(true);
    try {
      await submitFn({
        data: { philosopher, fragment: excerpt, question: question?.slice(0, 600), lang },
      });
      setSent(true);
      toast.success(t("share.submitted"));
    } catch (e) {
      console.error("[share] submit failed", e);
      toast.error(t("share.failed"));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("share.action")}
        className="focus-mist mt-3 inline-flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-mist/40 hover:text-foreground"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
        </svg>
        {t("share.action")}
      </button>

      {open && (
        <div
          className="fade-up fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("share.title")}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="border-b border-border/60 px-6 py-4">
              <p className="font-display text-micro uppercase tracking-[0.35em] text-mist">
                {t("share.kicker")}
              </p>
              <h2 className="mt-1.5 font-display text-lg font-light text-foreground">
                {t("share.title")}
              </h2>
            </header>

            <div className="px-6 py-5">
              <blockquote className="rounded-lg border border-border/60 bg-background/50 p-4 text-small leading-relaxed text-foreground/90">
                “{excerpt}”
                <footer className="mt-3 font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
                  — {author}
                </footer>
              </blockquote>
              <p className="mt-3 text-micro leading-relaxed text-muted-foreground">
                {t("share.anonymous")}
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <ShareAction onClick={handleNativeShare}>{t("share.social")}</ShareAction>
                <ShareAction onClick={handleCopy}>{t("share.copy")}</ShareAction>
                <ShareAction onClick={handleImage}>{t("share.image")}</ShareAction>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={sending || sent}
                className="focus-mist mt-3 w-full rounded-md border border-mist/40 bg-mist/10 px-4 py-2.5 font-display text-micro uppercase tracking-[0.3em] text-foreground transition-all hover:border-mist/70 hover:bg-mist/15 disabled:opacity-40"
              >
                {sent
                  ? t("share.submitted")
                  : sending
                    ? t("share.submitting")
                    : t("share.toLibrary")}
              </button>
            </div>

            <footer className="flex justify-end border-t border-border/60 px-6 py-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("share.close")}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

function ShareAction({
  onClick,
  children,
}: {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-mist rounded-md border border-border/60 px-3 py-2 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-mist/40 hover:text-foreground"
    >
      {children}
    </button>
  );
}
