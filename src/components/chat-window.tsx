import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { loadMessages, loadFullHistory, sendChat, clearConversation } from "@/lib/chat.functions";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";
import { toast } from "sonner";

type Props = {
  userId: string;
  philosopher: PhilosopherId;
  onSignOut: () => void;
};

export function ChatWindow({ userId, philosopher, onSignOut }: Props) {
  const loadFn = useServerFn(loadMessages);
  const clearFn = useServerFn(clearConversation);
  const { t } = useI18n();

  const { data: initial, isLoading, refetch } = useQuery({
    queryKey: ["messages", userId, philosopher],
    queryFn: () => loadFn({ data: { philosopher } }),
  });

  if (isLoading || !initial) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-serif text-3xl text-primary ember-breathe">
          {PHILOSOPHERS[philosopher].glyph}
        </p>
      </div>
    );
  }

  return (
    <ChatBody
      key={`${userId}-${philosopher}`}
      philosopher={philosopher}
      initial={initial as UIMessage[]}
      onClear={async () => {
        await clearFn({ data: { philosopher } });
        toast.success(t("chat.cleared"));
        await refetch();
      }}
      onSignOut={onSignOut}
    />
  );
}

function ChatBody({
  philosopher,
  initial,
  onClear,
  onSignOut,
}: {
  philosopher: PhilosopherId;
  initial: UIMessage[];
  onClear: () => Promise<void>;
  onSignOut: () => void;
}) {
  const sendFn = useServerFn(sendChat);
  const historyFn = useServerFn(loadFullHistory);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const meta = PHILOSOPHERS[philosopher];
  const { lang, t } = useI18n();
  const [archiveOpen, setArchiveOpen] = useState(false);

  const {
    data: history,
    isFetching: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["history", philosopher],
    queryFn: () => historyFn({ data: { philosopher } }),
    enabled: archiveOpen,
    staleTime: 0,
  });

  const dictation = useVoiceDictation({
    lang,
    onFinal: (text) => {
      const ta = inputRef.current;
      if (!ta) return;
      const current = ta.value.trimEnd();
      ta.value = (current ? current + " " : "") + text;
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
      ta.focus();
    },
    onError: (msg) => {
      if (msg === "not-allowed" || msg === "service-not-allowed") {
        toast.error(t("chat.mic.denied"));
      }
    },
  });

  const transport = new DefaultChatTransport({
    fetch: async (_url, init) => {
      const body = JSON.parse(init?.body as string);
      return (await sendFn({
        data: { philosopher, messages: body.messages, language: lang },
      })) as Response;
    },
  });

  const { messages, sendMessage, status, error } = useChat({
    messages: initial,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error(t("chat.broken"));
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status, philosopher]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const text = String(fd.get("msg") ?? "").trim();
    if (!text || isLoading) return;
    form.reset();
    await sendMessage({ text });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              aria-label={t("chat.back")}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
              title={t("chat.back")}
            >
              ←
            </Link>
            <span className="font-display text-xl text-mist pneuma-breathe" aria-hidden="true">{meta.glyph}</span>
            <div className="leading-tight">
              <h1 className="font-display text-sm font-light tracking-wide text-foreground">{meta.name}</h1>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{meta.place[lang]}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={() => {
                setArchiveOpen(true);
                refetchHistory();
              }}
              className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              {t("chat.archive")}
            </button>
            <button
              onClick={async () => {
                if (confirm(t("chat.confirmClear", { name: meta.name }))) await onClear();
              }}
              className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              {t("chat.clear")}
            </button>
            <button
              onClick={onSignOut}
              className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              {t("chat.exit")}
            </button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-10">
          {messages.length === 0 && (
            <div className="fade-up space-y-6 py-8">
              <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                {meta.name}
              </p>
              <p className="font-display text-xl font-light leading-relaxed text-foreground/90 md:text-2xl">
                {meta.opening[lang]}
              </p>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end fade-up">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border/60 bg-card/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                    {text}
                  </div>
                </div>
              );
            }
            return (
              <article key={m.id} className="fade-up">
                <h2 className="mb-3 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {meta.name}
                </h2>
                <div className="prose prose-invert prose-p:my-3 prose-p:leading-[1.75] prose-p:text-[15px] prose-p:text-foreground/90 prose-strong:text-foreground prose-em:text-mist max-w-none">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
              </article>
            );
          })}

          {status === "submitted" && (
            <div className="fade-up">
              <p className="mb-3 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {meta.name}
              </p>
              <div className="flex items-center gap-1.5 py-2">
                <span className="typing-dot h-1 w-1 rounded-full bg-mist" style={{ animationDelay: "0s" }} />
                <span className="typing-dot h-1 w-1 rounded-full bg-mist" style={{ animationDelay: "0.2s" }} />
                <span className="typing-dot h-1 w-1 rounded-full bg-mist" style={{ animationDelay: "0.4s" }} />
                <span className="ml-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{t("chat.thinking")}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-xs text-destructive">{error.message}</p>
          )}
        </div>
      </div>

      <footer className="sticky bottom-0 z-20 border-t border-border/60 bg-background/85 px-4 py-5 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            name="msg"
            rows={1}
            aria-label={t("chat.placeholder")}
            placeholder={dictation.listening ? (dictation.interim || t("chat.mic.stop")) : t("chat.placeholder")}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }}
            onInput={(e) => {
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
            }}
            className="flex-1 resize-none rounded-xl border border-border bg-input px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-mist/50 focus:outline-none focus:ring-1 focus:ring-mist/15 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => {
              if (!dictation.supported) {
                toast.error(t("chat.mic.unsupported"));
                return;
              }
              if (dictation.listening) dictation.stop();
              else dictation.start();
            }}
            disabled={isLoading}
            aria-label={dictation.listening ? t("chat.mic.stop") : t("chat.mic.start")}
            title={dictation.listening ? t("chat.mic.stop") : t("chat.mic.start")}
            className={`self-end rounded-xl border px-3.5 py-3 transition-all disabled:opacity-30 ${
              dictation.listening
                ? "border-mist/70 bg-mist/15 text-mist pneuma-breathe"
                : "border-border bg-card/40 text-muted-foreground hover:border-mist/50 hover:text-mist"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <line x1="12" y1="18" x2="12" y2="22" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="self-end rounded-xl border border-mist/40 bg-mist/95 px-5 py-3 font-display text-sm text-primary-foreground transition-all hover:bg-mist disabled:opacity-30"
          >
            {t("chat.send")}
          </button>
        </form>
        <p className="mx-auto mt-3 max-w-3xl text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {t("chat.newline")}
        </p>
      </footer>

    </div>
  );
}
