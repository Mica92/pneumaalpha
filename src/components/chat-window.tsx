import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { loadMessages, loadFullHistory, sendChat, clearConversation, migrateConversation } from "@/lib/chat.functions";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";

import { useI18n, LanguageSelector } from "@/lib/i18n";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";
import { toast } from "sonner";
import {
  ContinuationChips,
  DilemmaBanner,
  RootQuestionsFab,
  TopicBar,
} from "@/components/chat-engagement";
import { TOPICS, getDailyDilemmaPrompt, type TopicId } from "@/lib/engagement";

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
  const migrateFn = useServerFn(migrateConversation);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const meta = PHILOSOPHERS[philosopher];
  const { lang, t } = useI18n();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migrateMode, setMigrateMode] = useState<"full" | "questions">("full");
  const [migrating, setMigrating] = useState<PhilosopherId | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicId | null>(null);


  const {
    data: history,
    isFetching: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["history", philosopher],
    queryFn: () => historyFn({ data: { philosopher } }),
    enabled: archiveOpen || migrateOpen,
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

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    await sendMessage({ text: trimmed });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const text = String(fd.get("msg") ?? "").trim();
    if (!text || isLoading) return;
    form.reset();
    await sendMessage({ text });
  };

  const handleTopicPick = async (topicId: TopicId) => {
    if (isLoading) return;
    setActiveTopic(topicId);
    const topic = TOPICS.find((x) => x.id === topicId)!;
    await sendText(topic.prompt[lang]);
  };

  const handleDilemma = async () => {
    if (isLoading) return;
    await sendText(getDailyDilemmaPrompt(lang));
  };

  const handleMigrate = async (target: PhilosopherId) => {
    if (target === philosopher || migrating) return;
    const targetName = PHILOSOPHERS[target].name;
    if (!confirm(t("chat.migrate.confirm", { from: meta.name, to: targetName }))) return;
    setMigrating(target);
    try {
      const res = await migrateFn({ data: { from: philosopher, to: target, mode: migrateMode } });
      if (!res.copied) {
        toast.error(t("chat.migrate.empty"));
        setMigrating(null);
        return;
      }
      toast.success(t("chat.migrate.done", { name: targetName }));
      setMigrateOpen(false);
      navigate({ to: "/$philosopher", params: { philosopher: target } });
    } catch (e) {
      console.error(e);
      toast.error(t("chat.migrate.failed"));
    } finally {
      setMigrating(null);
    }
  };

  // Index of the most recent assistant message — chips render after it.
  const lastAssistantIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i;

    }
    return -1;
  })();

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
              onClick={() => {
                setMigrateOpen(true);
                refetchHistory();
              }}
              className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              {t("chat.migrate")}
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

      <div className="sticky top-[73px] z-10">
        <TopicBar activeTopic={activeTopic} onPick={handleTopicPick} disabled={isLoading} />
        <DilemmaBanner onConverse={handleDilemma} disabled={isLoading} />
      </div>

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

          {messages.map((m, idx) => {
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
            const showChips = idx === lastAssistantIdx && !isLoading;
            return (
              <article key={m.id} className="fade-up">
                <h2 className="mb-3 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {meta.name}
                </h2>
                <div className="prose prose-invert prose-p:my-3 prose-p:leading-[1.75] prose-p:text-[15px] prose-p:text-foreground/90 prose-strong:text-foreground prose-em:text-mist max-w-none">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </div>
                {showChips && (
                  <ContinuationChips topic={activeTopic} onPick={sendText} disabled={isLoading} />
                )}
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

      {archiveOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-xl fade-up"
          onClick={() => setArchiveOpen(false)}
        >
          <aside
            className="flex h-full w-full max-w-xl flex-col border-l border-border/60 bg-background/95 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-border/60 px-6 py-5">
              <div className="leading-tight">
                <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                  {meta.name}
                </p>
                <h2 className="mt-1 font-display text-base font-light text-foreground">
                  {t("chat.archive.title", { name: meta.name })}
                </h2>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                  {t("chat.archive.subtitle", { name: meta.name })}
                </p>
              </div>
              <button
                onClick={() => setArchiveOpen(false)}
                className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {t("chat.archive.close")}
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {historyLoading && (!history || history.length === 0) ? (
                <p className="text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground pneuma-breathe">
                  {t("chat.archive.loading")}
                </p>
              ) : !history || history.length === 0 ? (
                <p className="text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                  {t("chat.archive.empty")}
                </p>
              ) : (
                <ol className="space-y-6">
                  {history.map((m) => {
                    const date = new Date(m.created_at);
                    const stamp = date.toLocaleString(lang === "es" ? "es-ES" : "en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const author = m.role === "user" ? t("chat.you") : meta.name;
                    return (
                      <li key={m.id} className="border-l border-border/50 pl-4">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            {author}
                          </span>
                          <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground/70">
                            {stamp}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground/85">
                          {m.content}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </aside>
        </div>
      )}

      {migrateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-sm sm:items-center"
          onClick={() => !migrating && setMigrateOpen(false)}
        >
          <aside
            className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-border/60 bg-card shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="border-b border-border/60 px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {t("chat.migrate.title")}
              </p>
              <p className="mt-2 text-sm text-foreground/85">
                {t("chat.migrate.subtitle")}
              </p>
            </header>

            <div className="flex flex-wrap gap-2 border-b border-border/60 px-5 py-3">
              {(["full", "questions"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMigrateMode(mode)}
                  className={`rounded-full border px-3 py-1 text-[11px] tracking-wide transition-colors ${
                    migrateMode === mode
                      ? "border-foreground/60 bg-foreground/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(mode === "full" ? "chat.migrate.mode.full" : "chat.migrate.mode.questions")}
                </button>
              ))}
            </div>

            {(() => {
              const preview = (history ?? []).filter((m) =>
                migrateMode === "questions" ? m.role === "user" : true,
              );
              return (
                <div className="border-b border-border/60 px-5 py-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {t("chat.migrate.preview", { count: String(preview.length) })}
                  </p>
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-border/40 bg-background/40 p-2">
                    {historyLoading && !history ? (
                      <p className="px-1 py-2 text-xs text-muted-foreground">
                        {t("chat.migrate.preview.loading")}
                      </p>
                    ) : preview.length === 0 ? (
                      <p className="px-1 py-2 text-xs text-muted-foreground">
                        {t("chat.migrate.preview.empty")}
                      </p>
                    ) : (
                      <ol className="flex flex-col gap-1.5">
                        {preview.slice(-40).map((m) => (
                          <li key={m.id} className="flex gap-2 text-xs">
                            <span className="shrink-0 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80 pt-0.5 w-14">
                              {m.role === "user" ? t("chat.you") : t("chat.migrate.assistant")}
                            </span>
                            <span className="flex-1 text-foreground/75 line-clamp-2">
                              {m.content}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="max-h-[45vh] overflow-y-auto px-3 py-3">
              <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {t("chat.migrate.pick")}
              </p>
              <ul className="flex flex-col gap-1">
                {PHILOSOPHER_LIST.filter((p) => p.id !== philosopher).map((p) => (
                  <li key={p.id}>
                    <button
                      disabled={!!migrating}
                      onClick={() => handleMigrate(p.id)}
                      className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border/60 hover:bg-background/60 disabled:opacity-50"
                    >
                      <span className="text-lg text-foreground/70">{p.glyph}</span>
                      <span className="flex-1">
                        <span className="block text-sm text-foreground">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.subtitle[lang]}
                        </span>
                      </span>
                      {migrating === p.id && (
                        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                          …
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="flex justify-end border-t border-border/60 px-5 py-3">
              <button
                onClick={() => setMigrateOpen(false)}
                disabled={!!migrating}
                className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
              >
                {t("chat.migrate.close")}
              </button>
            </footer>
          </aside>
        </div>
      )}

      <RootQuestionsFab onPick={sendText} disabled={isLoading} />
    </div>

  );
}
