import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { loadMessages, loadFullHistory, sendChat, clearConversation, migrateConversation } from "@/lib/chat.functions";
import { seedAquinasCorpus, countSources } from "@/lib/rag.functions";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";

import { useI18n, LanguageSelector } from "@/lib/i18n";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";
import { toast } from "sonner";
import { GreekGlyph } from "@/components/greek-glyph";
import { portraitOf, portraitFocus } from "@/lib/portraits";
import { sceneOf } from "@/lib/scenes";

import { PhilosopherProfilePanel } from "@/components/philosopher-profile";
import { ShareFragmentButton } from "@/components/share-fragment";
import { suggestionsFor } from "@/lib/suggestions";

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
  /** Renders the chat inside a page section instead of filling the viewport. */
  embedded?: boolean;
};

export function ChatWindow({ userId, philosopher, onSignOut, embedded = false }: Props) {
  const loadFn = useServerFn(loadMessages);
  const clearFn = useServerFn(clearConversation);
  const { t } = useI18n();

  const { data: initial, isLoading, refetch } = useQuery({
    queryKey: ["messages", userId, philosopher],
    queryFn: () => loadFn({ data: { philosopher } }),
  });

  if (isLoading || !initial) {
    return (
      <div className={`flex items-center justify-center ${embedded ? "h-[70vh]" : "min-h-dvh"}`}>
        <GreekGlyph className="font-display text-5xl text-mist pneuma-breathe" />
      </div>
    );
  }


  return (
    <ChatBody
      key={`${userId}-${philosopher}`}
      philosopher={philosopher}
      embedded={embedded}
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
  embedded = false,
}: {
  philosopher: PhilosopherId;
  initial: UIMessage[];
  onClear: () => Promise<void>;
  onSignOut: () => void;
  embedded?: boolean;
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migrateMode, setMigrateMode] = useState<"full" | "questions">("full");
  const [migrating, setMigrating] = useState<PhilosopherId | null>(null);
  const [activeTopic, setActiveTopic] = useState<TopicId | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [atBottom, setAtBottom] = useState(true);



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
      setComposerText((prev) => {
        const base = prev.trimEnd();
        return (base ? base + " " : "") + text;
      });
      if (ta) {
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
        ta.focus();
      }
    },

    onError: (msg) => {
      if (msg === "not-allowed" || msg === "service-not-allowed") {
        toast.error(t("chat.mic.denied"));
      }
    },
  });

  const langRef = useRef(lang);
  langRef.current = lang;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        fetch: async (_url, init) => {
          const body = JSON.parse(init?.body as string);
          return (await sendFn({
            data: { philosopher, messages: body.messages, language: langRef.current },
          })) as Response;
        },
      }),
    [sendFn, philosopher],
  );

  const { messages, sendMessage, status, error } = useChat({
    messages: initial,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error(t("chat.broken"));
    },
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (atBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: status === "streaming" ? "auto" : "smooth",
      });
    }
  }, [messages, status, atBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAtBottom(gap < 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status, philosopher]);


  const isLoading = status === "submitted" || status === "streaming";

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setAtBottom(true);
      await sendMessage({ text: trimmed });
    },
    [isLoading, sendMessage],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = composerText.trim();
    if (!text || isLoading) return;
    setComposerText("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
    }
    setAtBottom(true);
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

  const shell = embedded ? "h-[78vh] max-h-[860px] overflow-hidden" : "min-h-dvh";

  return (
    <div className={`relative flex flex-col ${shell}`}>
      {sceneOf(philosopher) && (
        <div
          aria-hidden
          className={`pointer-events-none z-0 overflow-hidden ${embedded ? "absolute inset-0" : "fixed inset-0"}`}
        >
          <img
            src={sceneOf(philosopher)}
            alt=""
            loading="lazy"
            width={1536}
            height={1024}
            className="h-full w-full object-cover opacity-[0.16] grayscale contrast-105"
          />
          <span className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background/95" />
        </div>
      )}
      <div className={`relative z-10 flex flex-col ${embedded ? "h-full min-h-0" : "min-h-dvh"}`}>
      <PhilosopherProfilePanel philosopher={philosopher} open={profileOpen} onClose={() => setProfileOpen(false)} />

      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
        <div className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Link
            to="/"
            aria-label={t("chat.back")}
            title={t("chat.back")}
            className="focus-mist inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            <span aria-hidden="true" className="text-lg leading-none">←</span>
          </Link>

          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label={lang === "es" ? `Ver ficha de ${meta.name}` : `View ${meta.name} profile`}
            className="focus-mist flex min-w-0 items-center gap-3 rounded-md text-left transition-opacity hover:opacity-80"
          >
            {portraitOf(philosopher) ? (
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/70 ring-1 ring-mist/15">
                <img
                  src={portraitOf(philosopher)}
                  alt={`Retrato de ${meta.name}`}
                  loading="lazy"
                  className={`h-full w-full object-cover ${portraitFocus(philosopher)} grayscale brightness-125 contrast-105`}
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </span>
            ) : (
              <span className="shrink-0 font-display text-xl text-mist pneuma-breathe" aria-hidden="true">
                {meta.glyph}
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <h1 className="truncate font-display text-sm font-light tracking-wide text-foreground">
                {meta.name}
              </h1>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {lang === "es" ? "Ver ficha" : "View profile"}
              </span>
            </div>
          </button>

          {/* Desktop actions */}
          <div className="hidden items-center gap-1 md:flex">
            <LanguageSelector />
            <HeaderAction onClick={() => { setArchiveOpen(true); refetchHistory(); }}>
              {t("chat.archive")}
            </HeaderAction>
            <HeaderAction onClick={() => { setMigrateOpen(true); refetchHistory(); }}>
              {t("chat.migrate")}
            </HeaderAction>
            {philosopher === "aquinas" && <CorpusBadge />}
            <HeaderAction
              onClick={async () => {
                if (confirm(t("chat.confirmClear", { name: meta.name }))) await onClear();
              }}
            >
              {t("chat.clear")}
            </HeaderAction>
            <HeaderAction onClick={onSignOut}>{t("chat.exit")}</HeaderAction>
          </div>

          {/* Mobile — overflow menu */}
          <div className="relative md:hidden">
            <button
              onClick={() => setActionsOpen((v) => !v)}
              aria-label={t("chat.actions.open")}
              aria-expanded={actionsOpen}
              className="focus-mist inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
              </svg>
            </button>
            {actionsOpen && (
              <>
                <button
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={() => setActionsOpen(false)}
                  className="fixed inset-0 z-30 cursor-default bg-transparent"
                />
                <div
                  role="menu"
                  className="fade-up absolute right-0 top-11 z-40 flex w-56 flex-col overflow-hidden rounded-lg border border-border/60 bg-card/95 shadow-2xl backdrop-blur-xl"
                >
                  <div className="border-b border-border/60 px-3 py-2.5">
                    <LanguageSelector />
                  </div>
                  <MenuItem onClick={() => { setArchiveOpen(true); refetchHistory(); setActionsOpen(false); }}>
                    {t("chat.archive")}
                  </MenuItem>
                  <MenuItem onClick={() => { setMigrateOpen(true); refetchHistory(); setActionsOpen(false); }}>
                    {t("chat.migrate")}
                  </MenuItem>
                  {philosopher === "aquinas" && (
                    <div className="px-3 py-2.5">
                      <CorpusBadge />
                    </div>
                  )}
                  <MenuItem
                    onClick={async () => {
                      setActionsOpen(false);
                      if (confirm(t("chat.confirmClear", { name: meta.name }))) await onClear();
                    }}
                  >
                    {t("chat.clear")}
                  </MenuItem>
                  <MenuItem onClick={() => { setActionsOpen(false); onSignOut(); }}>
                    {t("chat.exit")}
                  </MenuItem>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {!embedded && (
        <div className="sticky top-[57px] z-10 md:top-[73px]">
          <TopicBar activeTopic={activeTopic} onPick={handleTopicPick} disabled={isLoading} />
          <DilemmaBanner onConverse={handleDilemma} disabled={isLoading} />
        </div>
      )}


      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl space-y-10">
          {messages.length === 0 && (
            <div className="fade-up space-y-6 py-8">
              <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                {meta.name}
              </p>
              <p className="font-display text-xl font-light leading-relaxed text-foreground/90 md:text-2xl">
                {meta.opening[lang]}
              </p>

              <div className="pt-2">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {t("chat.suggestions")}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {suggestionsFor(philosopher, lang).map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => sendText(s)}
                        disabled={isLoading}
                        className="focus-mist rounded-full border border-border/70 px-3.5 py-2 text-left text-[12px] leading-snug text-muted-foreground transition-colors hover:border-mist/50 hover:text-foreground disabled:opacity-40"
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {messages.map((m, idx) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (m.role === "user") {
              return <UserBubble key={m.id} text={text} />;
            }
            const showChips = idx === lastAssistantIdx && !isLoading;
            const prev = messages[idx - 1];
            const question =
              prev?.role === "user"
                ? prev.parts.map((p) => (p.type === "text" ? p.text : "")).join("")
                : undefined;
            return (
              <article key={m.id} className="fade-up" aria-live={idx === messages.length - 1 ? "polite" : undefined}>
                <h2 className="mb-3 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {meta.name}
                </h2>
                <AssistantBody text={text} />
                {!isLoading && text.trim().length > 40 && (
                  <ShareFragmentButton
                    philosopher={philosopher}
                    text={text}
                    question={question}
                  />
                )}
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
              <div className="flex items-center gap-3 py-2">
                <GreekGlyph className="font-display text-lg text-mist pneuma-breathe" intervalMs={280} />
                <span className="text-[11px] uppercase tracking-[0.3em] glacier-shimmer">
                  {t("chat.thinking")}
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-xs text-destructive">{error.message}</p>
          )}
        </div>

        {!atBottom && messages.length > 2 && (
          <button
            onClick={() => {
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
              setAtBottom(true);
            }}
            className="focus-mist sticky bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border/60 bg-card/90 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground shadow-mist backdrop-blur-xl transition-colors hover:border-mist/40 hover:text-foreground"
          >
            ↓ {t("chat.scrollDown")}
          </button>
        )}
      </div>

      <footer className="sticky bottom-0 z-20 border-t border-border/60 bg-background/85 px-3 pt-3 pb-safe backdrop-blur-xl md:px-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            name="msg"
            rows={1}
            value={composerText}
            aria-label={t("chat.placeholder")}
            placeholder={dictation.listening ? (dictation.interim || t("chat.mic.stop")) : t("chat.placeholder")}
            disabled={isLoading}
            onChange={(e) => setComposerText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }}
            onInput={(e) => {
              const ta = e.currentTarget;
              ta.style.height = "auto";
              ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
            }}
            className="focus-mist flex-1 resize-none rounded-xl border border-border bg-input px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground transition-colors focus:border-mist/50 disabled:opacity-50"
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
            aria-pressed={dictation.listening}
            className={`focus-mist inline-flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl border transition-all disabled:opacity-30 ${
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
            disabled={isLoading || !composerText.trim()}
            aria-label={t("chat.send")}
            className="focus-mist inline-flex h-11 shrink-0 items-center justify-center self-end rounded-xl border border-mist/40 bg-mist/95 px-5 font-display text-sm text-primary-foreground transition-all hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="hidden sm:inline">{t("chat.send")}</span>
            <svg className="sm:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
        <p className="mx-auto mt-2 hidden max-w-3xl text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">
          {t("chat.newline")} · {t("chat.send.hint")}
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
    </div>


  );
}

const UserBubble = memo(function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end fade-up">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border/60 bg-secondary/70 px-4 py-3 text-[15px] leading-relaxed text-secondary-foreground shadow-sm">
        {text}
      </div>
    </div>
  );
});

const AssistantBody = memo(function AssistantBody({ text }: { text: string }) {
  return (
    <div className="prose prose-invert prose-p:my-3 prose-p:leading-[1.75] prose-p:text-[15px] prose-p:text-foreground/90 prose-strong:text-foreground prose-em:text-mist max-w-none">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
});

function CorpusBadge() {
  const countFn = useServerFn(countSources);
  const seedFn = useServerFn(seedAquinasCorpus);
  const [seeding, setSeeding] = useState(false);
  const { data, refetch } = useQuery({
    queryKey: ["corpus-count", "aquinas"],
    queryFn: () => countFn({ data: { philosopher: "aquinas" } }),
  });
  const count = data?.count ?? 0;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedFn();
      toast.success(`Corpus indexado: +${res.inserted} pasajes (${res.skipped} ya estaban)`);
      if (res.errors.length) console.warn("[corpus] errors", res.errors);
      await refetch();
    } catch (e) {
      toast.error(`Indexación falló: ${(e as Error).message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={seeding}
      title="Indexar / re-indexar corpus de Santo Tomás en el RAG"
      className="rounded-md border border-border/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-50"
    >
      {seeding ? "Indexando…" : `Corpus · ${count}`}
    </button>
  );
}

function HeaderAction({ onClick, children }: { onClick: () => void | Promise<void>; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="focus-mist rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
    >
      {children}
    </button>
  );
}

function MenuItem({ onClick, children }: { onClick: () => void | Promise<void>; children: React.ReactNode }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="w-full px-4 py-3 text-left text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
    >
      {children}
    </button>
  );
}

