import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import {
  loadMessages,
  loadFullHistory,
  sendChat,
  clearConversation,
  migrateConversation,
} from "@/lib/chat.functions";
import { seedAquinasCorpus, countSources } from "@/lib/rag.functions";
import { PHILOSOPHERS, PHILOSOPHER_LIST, type PhilosopherId } from "@/lib/philosophers";
import { loadStoredTone } from "@/lib/tones";

import { useI18n, LanguageSelector } from "@/lib/i18n";
import { useVoiceDictation } from "@/hooks/use-voice-dictation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
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
import { track } from "@/lib/analytics";
import { readLens, type LensReading } from "@/lib/lens.functions";
import { saveInsight } from "@/lib/insights.functions";
import { PneumLensRail, PneumLensSheet } from "@/components/pneum-lens";
import { stashQuestion } from "@/lib/question-handoff";
import {
  openReflection,
  updateReflection,
  listThoughtObjects,
  saveThoughtObject,
  updateThoughtObject,
  deleteThoughtObject,
  saveDecisionRecord,
  findPatterns,
} from "@/lib/workspace.functions";
import {
  STATE_LABEL,
  KIND_LABEL,
  suggestState,
  titleFromQuestion,
  type ReflectionState,
  type ThoughtKind,
  type ThoughtObject,
} from "@/lib/workspace.shared";
import { ContextRail } from "@/components/workspace/context-rail";
import { SelectionCapture } from "@/components/workspace/selection-capture";
import {
  ThinkingComposer,
  type ThinkingCommand,
} from "@/components/workspace/thinking-composer";
import { DecisionRecordPanel, type DecisionDraft } from "@/components/workspace/decision-record";
import { MemoryInspector } from "@/components/workspace/memory-inspector";

const WAITING_PHASES: { es: string; en: string }[] = [
  { es: "Leyendo tu pregunta", en: "Reading your question" },
  { es: "Buscando la tensión", en: "Looking for the tension" },
  { es: "Escribiendo la respuesta", en: "Writing the answer" },
];

function WaitingPhase({ lang }: { lang: "es" | "en" }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setI((prev) => Math.min(prev + 1, WAITING_PHASES.length - 1)),
      1800,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <span aria-live="polite" className="text-micro uppercase tracking-[0.3em] glacier-shimmer">
      {WAITING_PHASES[i][lang]}…
    </span>
  );
}

type Props = {
  userId: string;
  philosopher: PhilosopherId;
  onSignOut: () => void;
  /** Renders the chat inside a page section instead of filling the viewport. */
  embedded?: boolean;
  /** Pre-fills the composer, e.g. when arriving from a philosophical path. */
  initialPrompt?: string;
};

export function ChatWindow({
  userId,
  philosopher,
  onSignOut,
  embedded = false,
  initialPrompt,
}: Props) {
  const loadFn = useServerFn(loadMessages);
  const clearFn = useServerFn(clearConversation);
  const { t } = useI18n();

  const {
    data: initial,
    isLoading,
    refetch,
  } = useQuery({
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
      initialPrompt={initialPrompt}
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
  initialPrompt,
}: {
  philosopher: PhilosopherId;
  initial: UIMessage[];
  onClear: () => Promise<void>;
  onSignOut: () => void;
  embedded?: boolean;
  initialPrompt?: string;
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
  const [composerText, setComposerText] = useState(initialPrompt ?? "");
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
            data: {
              philosopher,
              messages: body.messages,
              language: langRef.current,
              tone: loadStoredTone() ?? undefined,
            },
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

  useEffect(() => {
    track("chat_opened", { philosopher });
  }, [philosopher]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setAtBottom(true);
      track("message_sent", { philosopher });
      await sendMessage({ text: trimmed });
    },
    [isLoading, philosopher, sendMessage],
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
    track("message_sent", { philosopher });
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

  // ——— Pneum Lens: the structure emerging from the last exchange ———
  const lensFn = useServerFn(readLens);
  const saveInsightFn = useServerFn(saveInsight);

  const textOf = (m: UIMessage | undefined) =>
    m
      ? m.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("")
          .trim()
      : "";

  const lastAnswer = lastAssistantIdx >= 0 ? textOf(messages[lastAssistantIdx]) : "";
  const lastQuestion = (() => {
    for (let i = lastAssistantIdx - 1; i >= 0; i--) {
      if (messages[i].role === "user") return textOf(messages[i]);
    }
    return "";
  })();
  const lensKey = lastAssistantIdx >= 0 ? messages[lastAssistantIdx].id : null;

  const { data: lens, isFetching: lensLoading } = useQuery<LensReading>({
    queryKey: ["lens", philosopher, lensKey, lang],
    queryFn: () =>
      lensFn({
        data: {
          question: lastQuestion || lastAnswer.slice(0, 500),
          answer: lastAnswer.slice(0, 6000),
          philosopher,
          language: lang,
        },
      }),
    enabled: Boolean(lensKey) && !isLoading && lastAnswer.length > 60,
    staleTime: Infinity,
  });

  const handleSaveInsight = async (text: string) => {
    try {
      await saveInsightFn({
        data: {
          text: text.slice(0, 1200),
          philosopher,
          sourceQuestion: lastQuestion ? lastQuestion.slice(0, 1200) : undefined,
        },
      });
      track("insight_saved", { philosopher });
      toast.success(lang === "es" ? "Guardado en tu biblioteca." : "Saved to your library.");
    } catch (e) {
      console.error(e);
      toast.error(lang === "es" ? "No se pudo guardar." : "Could not save.");
    }
  };

  const handleContrast = (other: PhilosopherId) => {
    const qid = lastQuestion ? stashQuestion(lastQuestion) : undefined;
    track("contrast_started", { philosopher, other });
    navigate({
      to: "/comparar",
      search: { ...(qid ? { qid } : {}), seats: [philosopher, other].join(",") },
    });
  };

  // ——— Thinking Workspace: the reflection and its thought objects ———
  const openReflectionFn = useServerFn(openReflection);
  const updateReflectionFn = useServerFn(updateReflection);
  const listObjectsFn = useServerFn(listThoughtObjects);
  const saveObjectFn = useServerFn(saveThoughtObject);
  const updateObjectFn = useServerFn(updateThoughtObject);
  const deleteObjectFn = useServerFn(deleteThoughtObject);
  const saveDecisionFn = useServerFn(saveDecisionRecord);
  const patternsFn = useServerFn(findPatterns);

  const [memoryOpen, setMemoryOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [savingDecision, setSavingDecision] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const { data: reflection, refetch: refetchReflection } = useQuery({
    queryKey: ["reflection", philosopher],
    queryFn: () => openReflectionFn({ data: { philosopher } }),
    enabled: !embedded,
    staleTime: 60_000,
  });

  const reflectionId = reflection?.id ?? null;

  const { data: objects = [], refetch: refetchObjects } = useQuery<ThoughtObject[]>({
    queryKey: ["thought-objects", reflectionId],
    queryFn: () => listObjectsFn({ data: { reflectionId } }),
    enabled: Boolean(reflectionId),
  });

  const { data: patterns = [] } = useQuery({
    queryKey: ["thought-patterns"],
    queryFn: () => patternsFn(),
    enabled: !embedded,
    staleTime: 300_000,
  });

  // Title and state follow the reflection without ever taking it over.
  const firstQuestion = (() => {
    for (const m of messages) if (m.role === "user") return textOf(m);
    return "";
  })();

  useEffect(() => {
    if (!reflection || !firstQuestion) return;
    if (reflection.title) return;
    const title = titleFromQuestion(firstQuestion);
    updateReflectionFn({
      data: { id: reflection.id, title, openingQuestion: firstQuestion.slice(0, 2000) },
    })
      .then(() => refetchReflection())
      .catch(() => undefined);
  }, [reflection, firstQuestion, updateReflectionFn, refetchReflection]);

  const exchanges = messages.filter((m) => m.role === "user").length;
  useEffect(() => {
    if (!reflection) return;
    const next = suggestState(objects, exchanges);
    if (next === reflection.state) return;
    updateReflectionFn({ data: { id: reflection.id, state: next } })
      .then(() => refetchReflection())
      .catch(() => undefined);
  }, [reflection, objects, exchanges, updateReflectionFn, refetchReflection]);

  const setReflectionState = async (state: ReflectionState) => {
    if (!reflection) return;
    await updateReflectionFn({ data: { id: reflection.id, state } });
    await refetchReflection();
  };

  const captureObject = async (kind: ThoughtKind, text: string, rationale?: string) => {
    try {
      await saveObjectFn({
        data: {
          reflectionId,
          kind,
          text: text.slice(0, 2000),
          context: lastQuestion ? lastQuestion.slice(0, 2000) : undefined,
          rationale,
          philosopher,
        },
      });
      if (kind === "insight") track("insight_saved", { philosopher });
      await refetchObjects();
      toast.success(
        lang === "es"
          ? `${KIND_LABEL[kind].es} añadido a tu mapa.`
          : `${KIND_LABEL[kind].en} added to your map.`,
      );
    } catch (e) {
      console.error(e);
      toast.error(lang === "es" ? "No se pudo guardar." : "Could not save.");
    }
  };

  const handleSaveDecision = async (draft: DecisionDraft) => {
    setSavingDecision(true);
    try {
      await saveDecisionFn({
        data: {
          reflectionId,
          situation: draft.situation,
          decision: draft.decision,
          reason: draft.reason || undefined,
          risk: draft.risk || undefined,
          learned: draft.learned || undefined,
          watchFor: draft.watchFor || undefined,
          reviewInDays: draft.reviewInDays,
        },
      });
      await refetchObjects();
      await refetchReflection();
      setDecisionOpen(false);
      toast.success(lang === "es" ? "Decisión guardada." : "Decision saved.");
    } catch (e) {
      console.error(e);
      toast.error(lang === "es" ? "No se pudo guardar." : "Could not save.");
    } finally {
      setSavingDecision(false);
    }
  };

  const COMMAND_PROMPTS: Record<ThinkingCommand, { es: string; en: string }> = {
    clarify: {
      es: "Clarifica lo que acabo de decir: separa los hechos de mis interpretaciones.",
      en: "Clarify what I just said: separate the facts from my interpretations.",
    },
    question: {
      es: "Cuestiona lo que estoy dando por supuesto aquí.",
      en: "Question what I am taking for granted here.",
    },
    shift: {
      es: "Mira esto mismo desde otra lente: ética, existencial, pragmática o material.",
      en: "Look at this from another lens: ethical, existential, pragmatic or material.",
    },
    deepen: {
      es: "Profundiza en eso: ¿qué hay debajo?",
      en: "Go deeper into that: what lies beneath?",
    },
    summarize: {
      es: "Resume lo que ahora veo: la tensión, el supuesto y la pregunta que queda abierta.",
      en: "Summarise what I now see: the tension, the assumption and the question still open.",
    },
  };

  const composerSuggestions = useMemo(() => {
    if (messages.length === 0) return suggestionsFor(philosopher, lang).slice(0, 3);
    if (lang === "es") {
      return ["¿Qué está realmente en juego?", "¿Qué estoy suponiendo?", "¿Qué no estoy viendo?"];
    }
    return ["What is really at stake?", "What am I assuming?", "What am I not seeing?"];
  }, [messages.length, philosopher, lang]);

  const lensProps = {
    reading: lens ?? null,
    loading: lensLoading,
    lang,
    onContrast: handleContrast,
    onAsk: (text: string) => sendText(text),
    onSave: (text: string) => captureObject("insight", text),
  };

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
        <PhilosopherProfilePanel
          philosopher={philosopher}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />

        <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-6 md:py-4">
          <div className="mx-auto grid max-w-3xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            <Link
              to="/"
              aria-label={t("chat.back")}
              title={t("chat.back")}
              className="focus-mist inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors duration-300 hover:text-foreground"
            >
              <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.5} />
            </Link>

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label={lang === "es" ? `Ver ficha de ${meta.name}` : `View ${meta.name} profile`}
              className="focus-mist flex min-w-0 items-center gap-3 rounded-md text-left transition-opacity hover:opacity-80"
            >
              {portraitOf(philosopher) ? (
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-foreground/10">
                  <img
                    src={portraitOf(philosopher)}
                    alt={`Retrato de ${meta.name}`}
                    loading="lazy"
                    className={`h-full w-full object-cover ${portraitFocus(philosopher)} grayscale brightness-125 contrast-105`}
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                </span>
              ) : (
                <span
                  className="shrink-0 font-display text-subtitle text-mist pneuma-breathe"
                  aria-hidden="true"
                >
                  {meta.glyph}
                </span>
              )}
              <div className="min-w-0 leading-tight">
                <h1 className="truncate font-display text-subtitle font-light tracking-wide text-foreground">
                  {meta.name}
                </h1>
                <span className="block truncate whitespace-nowrap text-micro uppercase tracking-[0.3em] text-muted-foreground/80">
                  {lang === "es" ? "Ver ficha" : "View profile"}
                </span>
              </div>
            </button>

            {/* Desktop actions */}
            <div className="hidden items-center gap-3 md:flex">
              <LanguageSelector />
              <HeaderAction
                onClick={() => {
                  setArchiveOpen(true);
                  refetchHistory();
                }}
              >
                {t("chat.archive")}
              </HeaderAction>
              <HeaderAction
                onClick={() => {
                  setMigrateOpen(true);
                  refetchHistory();
                }}
              >
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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="5" cy="12" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
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
                    <MenuItem
                      onClick={() => {
                        setArchiveOpen(true);
                        refetchHistory();
                        setActionsOpen(false);
                      }}
                    >
                      {t("chat.archive")}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setMigrateOpen(true);
                        refetchHistory();
                        setActionsOpen(false);
                      }}
                    >
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
                    <MenuItem
                      onClick={() => {
                        setActionsOpen(false);
                        onSignOut();
                      }}
                    >
                      {t("chat.exit")}
                    </MenuItem>
                  </div>
                </>
              )}
            </div>
          </div>

          {!embedded && reflection && (
            <div className="mx-auto mt-2 flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-1">
              <p className="min-w-0 flex-1 truncate font-display text-small font-light text-foreground/80">
                {reflection.title ||
                  (lang === "es" ? "Reflexión sin título" : "Untitled reflection")}
              </p>
              <span className="rounded-full border border-bronze/40 px-2.5 py-0.5 text-micro uppercase tracking-[0.2em] text-bronze">
                {STATE_LABEL[reflection.state][lang]}
              </span>
              <button
                type="button"
                onClick={() => setFocusMode((v) => !v)}
                aria-pressed={focusMode}
                className="focus-mist text-micro uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {focusMode
                  ? lang === "es"
                    ? "Salir de foco"
                    : "Leave focus"
                  : lang === "es"
                    ? "Foco"
                    : "Focus"}
              </button>
            </div>
          )}
        </header>

        {!embedded && !focusMode && (
          <div className="sticky top-[57px] z-10 md:top-[73px]">
            <TopicBar activeTopic={activeTopic} onPick={handleTopicPick} disabled={isLoading} />
            <DilemmaBanner onConverse={handleDilemma} disabled={isLoading} />
          </div>
        )}

        {!embedded && !focusMode && <PneumLensSheet {...lensProps} />}

        <div className="flex min-h-0 flex-1">
          {!embedded && !focusMode && (
            <ContextRail
              lang={lang}
              reflection={reflection ?? null}
              objects={objects}
              patterns={patterns}
              onState={setReflectionState}
              onOpenMemory={() => setMemoryOpen(true)}
              onOpenDecision={() => setDecisionOpen(true)}
            />
          )}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-8 md:py-12">
            <SelectionCapture
              lang={lang}
              onCapture={(kind, text) => captureObject(kind, text)}
              className="mx-auto max-w-3xl space-y-10"
            >
              {messages.length === 0 && (
                <div className="fade-up space-y-6 py-8">
                  <p className="font-display text-micro uppercase tracking-[0.4em] text-muted-foreground">
                    {meta.name}
                  </p>
                  <p className="font-display text-heading font-light text-foreground/90">
                    {meta.opening[lang]}
                  </p>

                  {embedded && (
                    <div className="pt-2">
                      <p className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
                        {t("chat.suggestions")}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {suggestionsFor(philosopher, lang).map((s) => (
                          <li key={s}>
                            <button
                              type="button"
                              onClick={() => sendText(s)}
                              disabled={isLoading}
                              className="focus-mist rounded-full border border-border/70 px-3.5 py-2 text-left text-micro text-muted-foreground transition-colors hover:border-mist/50 hover:text-foreground disabled:opacity-40"
                            >
                              {s}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {messages.map((m, idx) => {
                const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
                if (m.role === "user") {
                  return <UserBubble key={m.id} text={text} />;
                }
                const showChips = !embedded && idx === lastAssistantIdx && !isLoading;
                const prev = messages[idx - 1];
                const question =
                  prev?.role === "user"
                    ? prev.parts.map((p) => (p.type === "text" ? p.text : "")).join("")
                    : undefined;
                return (
                  <article
                    key={m.id}
                    className="fade-up"
                    aria-live={idx === messages.length - 1 ? "polite" : undefined}
                  >
                    <h2 className="mb-3 font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
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
                      <>
                        <ContextActions
                          lang={lang}
                          onDeepen={() =>
                            sendText(
                              lang === "es"
                                ? "Profundiza en eso: ¿qué hay debajo?"
                                : "Go deeper into that: what lies beneath?",
                            )
                          }
                          onContrast={
                            lens?.perspectives[0]
                              ? () => handleContrast(lens.perspectives[0].philosopher)
                              : undefined
                          }
                          onSave={() => handleSaveInsight(text)}
                        />
                        <ContinuationChips
                          topic={activeTopic}
                          onPick={sendText}
                          disabled={isLoading}
                        />
                      </>
                    )}
                  </article>
                );
              })}

              {status === "submitted" && (
                <div className="fade-up">
                  <p className="mb-3 font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
                    {meta.name}
                  </p>
                  <div className="flex items-center gap-3 py-2">
                    <GreekGlyph
                      className="font-display text-lg text-mist pneuma-breathe"
                      intervalMs={280}
                    />
                    <WaitingPhase lang={lang} />
                  </div>
                </div>
              )}

              {error && <p className="text-center text-micro text-destructive">{error.message}</p>}
            </SelectionCapture>

            {!atBottom && messages.length > 2 && (
              <button
                onClick={() => {
                  scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                  setAtBottom(true);
                }}
                className="focus-mist sticky bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border/60 bg-card/90 px-4 py-2 text-micro uppercase tracking-[0.25em] text-muted-foreground shadow-mist backdrop-blur-xl transition-colors hover:border-mist/40 hover:text-foreground"
              >
                ↓ {t("chat.scrollDown")}
              </button>
            )}
          </div>
          {!embedded && !focusMode && <PneumLensRail {...lensProps} />}
        </div>

        <footer className="sticky bottom-0 z-20 border-t border-border/60 bg-background/85 px-3 pt-3 pb-safe backdrop-blur-xl md:px-4">
          <ThinkingComposer
            ref={inputRef}
            lang={lang}
            value={composerText}
            onChange={setComposerText}
            onSubmit={() => {
              const text = composerText.trim();
              if (!text || isLoading) return;
              setComposerText("");
              if (inputRef.current) {
                inputRef.current.value = "";
                inputRef.current.style.height = "auto";
              }
              setAtBottom(true);
              track("message_sent", { philosopher });
              void sendMessage({ text });
            }}
            disabled={isLoading}
            showTitle={messages.length === 0}
            suggestions={composerSuggestions}
            onSuggestion={(s) => sendText(s)}
            onCommand={(cmd) => sendText(COMMAND_PROMPTS[cmd][lang])}
            mic={{
              supported: dictation.supported,
              listening: dictation.listening,
              interim: dictation.interim,
              toggle: () => {
                if (!dictation.supported) {
                  toast.error(t("chat.mic.unsupported"));
                  return;
                }
                if (dictation.listening) dictation.stop();
                else dictation.start();
              },
            }}
          />
        </footer>

        <MemoryInspector
          lang={lang}
          open={memoryOpen}
          objects={objects}
          onClose={() => setMemoryOpen(false)}
          onToggleMap={async (o) => {
            await updateObjectFn({ data: { id: o.id, inMap: !o.in_map } });
            await refetchObjects();
          }}
          onToggleMute={async (o) => {
            await updateObjectFn({ data: { id: o.id, muted: !o.muted } });
            await refetchObjects();
          }}
          onDelete={async (o) => {
            await deleteObjectFn({ data: { id: o.id } });
            await refetchObjects();
          }}
        />

        <DecisionRecordPanel
          lang={lang}
          open={decisionOpen}
          saving={savingDecision}
          initialSituation={reflection?.opening_question ?? firstQuestion}
          onClose={() => setDecisionOpen(false)}
          onSave={handleSaveDecision}
        />


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
                  <p className="font-display text-micro uppercase tracking-[0.4em] text-muted-foreground">
                    {meta.name}
                  </p>
                  <h2 className="mt-1 font-display text-base font-light text-foreground">
                    {t("chat.archive.title", { name: meta.name })}
                  </h2>
                  <p className="mt-1.5 font-mono text-micro uppercase tracking-[0.2em] text-muted-foreground/80">
                    {t("chat.archive.subtitle", { name: meta.name })}
                  </p>
                </div>
                <button
                  onClick={() => setArchiveOpen(false)}
                  className="rounded-md px-3 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                >
                  {t("chat.archive.close")}
                </button>
              </header>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {historyLoading && (!history || history.length === 0) ? (
                  <p className="text-center text-micro uppercase tracking-[0.3em] text-muted-foreground pneuma-breathe">
                    {t("chat.archive.loading")}
                  </p>
                ) : !history || history.length === 0 ? (
                  <p className="text-center text-micro uppercase tracking-[0.3em] text-muted-foreground">
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
                            <span className="font-display text-micro uppercase tracking-[0.3em] text-muted-foreground">
                              {author}
                            </span>
                            <span className="font-mono text-micro tracking-[0.15em] text-muted-foreground/70">
                              {stamp}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-small text-foreground/85">
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
                <p className="text-micro uppercase tracking-[0.3em] text-muted-foreground">
                  {t("chat.migrate.title")}
                </p>
                <p className="mt-2 text-small text-foreground/85">{t("chat.migrate.subtitle")}</p>
              </header>

              <div className="flex flex-wrap gap-2 border-b border-border/60 px-5 py-3">
                {(["full", "questions"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMigrateMode(mode)}
                    className={`rounded-full border px-3 py-1 text-micro tracking-wide transition-colors ${
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
                    <p className="text-micro uppercase tracking-[0.25em] text-muted-foreground">
                      {t("chat.migrate.preview", { count: String(preview.length) })}
                    </p>
                    <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-border/40 bg-background/40 p-2">
                      {historyLoading && !history ? (
                        <p className="px-1 py-2 text-micro text-muted-foreground">
                          {t("chat.migrate.preview.loading")}
                        </p>
                      ) : preview.length === 0 ? (
                        <p className="px-1 py-2 text-micro text-muted-foreground">
                          {t("chat.migrate.preview.empty")}
                        </p>
                      ) : (
                        <ol className="flex flex-col gap-1.5">
                          {preview.slice(-40).map((m) => (
                            <li key={m.id} className="flex gap-2 text-micro">
                              <span className="shrink-0 text-micro uppercase tracking-[0.14em] text-muted-foreground/80 pt-0.5 w-14">
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
                <p className="px-2 pb-2 text-micro uppercase tracking-[0.25em] text-muted-foreground">
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
                          <span className="block text-small text-foreground">{p.name}</span>
                          <span className="block text-micro text-muted-foreground">
                            {p.subtitle[lang]}
                          </span>
                        </span>
                        {migrating === p.id && (
                          <span className="text-micro uppercase tracking-[0.25em] text-muted-foreground">
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
                  className="rounded-md px-3 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
                >
                  {t("chat.migrate.close")}
                </button>
              </footer>
            </aside>
          </div>
        )}

        {!embedded && <RootQuestionsFab onPick={sendText} disabled={isLoading} />}
      </div>
    </div>
  );
}

const UserBubble = memo(function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end fade-up">
      <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border/60 bg-secondary/70 px-4 py-3 text-body text-secondary-foreground shadow-sm">
        {text}
      </div>
    </div>
  );
});

const AssistantBody = memo(function AssistantBody({ text }: { text: string }) {
  return (
    <div className="prose prose-invert measure-wide prose-p:my-4 prose-p:leading-[1.7] prose-p:text-[1rem] prose-p:text-pretty prose-p:text-foreground/90 prose-strong:text-foreground prose-em:text-mist">
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
      className="rounded-md border border-border/60 px-3 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-50"
    >
      {seeding ? "Indexando…" : `Corpus · ${count}`}
    </button>
  );
}

function HeaderAction({
  onClick,
  children,
}: {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="focus-mist rounded-md px-2.5 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function MenuItem({
  onClick,
  children,
}: {
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="w-full px-4 py-3 text-left text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
    >
      {children}
    </button>
  );
}

/** Small, contextual moves offered after a relevant answer. */
function ContextActions({
  lang,
  onDeepen,
  onContrast,
  onSave,
}: {
  lang: "es" | "en";
  onDeepen: () => void;
  onContrast?: () => void;
  onSave: () => void;
}) {
  const label = {
    es: { deepen: "Profundizar", contrast: "Contrastar", save: "Guardar insight" },
    en: { deepen: "Go deeper", contrast: "Contrast", save: "Save insight" },
  }[lang];
  const base =
    "focus-mist rounded-full border border-foreground/10 px-3.5 py-1.5 text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors duration-300 hover:border-foreground/25 hover:text-foreground";
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" onClick={onDeepen} className={base}>
        {label.deepen}
      </button>
      {onContrast && (
        <button type="button" onClick={onContrast} className={base}>
          {label.contrast}
        </button>
      )}
      <button type="button" onClick={onSave} className={base}>
        {label.save}
      </button>
    </div>
  );
}
