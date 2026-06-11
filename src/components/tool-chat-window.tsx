import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { TOOLS, TOOL_MAP, pickToolResponse, type ToolId } from "@/lib/tools";
import { useI18n, LanguageSelector } from "@/lib/i18n";

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "tool"; text: string; toolId: ToolId }
  | { id: string; role: "system"; text: string };

const uid = () => Math.random().toString(36).slice(2, 10);

export function ToolChatWindow({
  initialTool,
  onSignOut,
}: {
  initialTool: ToolId;
  onSignOut: () => void;
}) {
  const { lang, t } = useI18n();
  const [activeTool, setActiveTool] = useState<ToolId>(initialTool);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastToolReply = useRef<string | undefined>(undefined);

  const tool = TOOL_MAP[activeTool];

  // Reset chat when the initial tool changes via URL.
  useEffect(() => {
    setActiveTool(initialTool);
    setMessages([]);
    setGuideStep(0);
    lastToolReply.current = undefined;
  }, [initialTool]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [thinking, activeTool]);

  const replyAs = (toolId: ToolId, delay = 700) => {
    setThinking(true);
    window.setTimeout(() => {
      const text = pickToolResponse(toolId, lang, lastToolReply.current);
      lastToolReply.current = text;
      setMessages((m) => [...m, { id: uid(), role: "tool", text, toolId }]);
      setThinking(false);
    }, delay);
  };

  const sendUser = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setMessages((m) => [...m, { id: uid(), role: "user", text: trimmed }]);
    replyAs(activeTool);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const text = String(fd.get("msg") ?? "");
    form.reset();
    const ta = form.querySelector("textarea");
    if (ta) (ta as HTMLTextAreaElement).style.height = "auto";
    sendUser(text);
  };

  const switchTool = (next: ToolId) => {
    setSheetOpen(false);
    if (next === activeTool) return;
    const nextTool = TOOL_MAP[next];
    setActiveTool(next);
    setGuideStep(0);
    setMessages((m) => [
      ...m,
      { id: uid(), role: "system", text: nextTool.transition[lang] },
    ]);
    // Brief contextual reply from the new tool.
    replyAs(next, 800);
  };

  const startGuided = () => {
    sendUser(tool.firstQuestion[lang]);
    setGuideStep(1);
  };

  const sendGuideStep = (index: number) => {
    const steps = tool.guide[lang];
    if (index < 0 || index >= steps.length) return;
    setGuideOpen(false);
    sendUser(steps[index]);
    setGuideStep(index + 1);
  };


  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              aria-label={t("chat.back")}
              title={t("chat.back")}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              ←
            </Link>
            <span
              aria-hidden="true"
              className="grid h-9 w-9 place-items-center rounded-full border border-sage/40 bg-sage/15 text-lg"
            >
              {tool.emoji}
            </span>
            <div className="leading-tight">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {t("tools.kicker")}
              </p>
              <h1 className="font-display text-sm font-light tracking-wide text-foreground">
                {tool.name[lang]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={onSignOut}
              className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              {t("chat.exit")}
            </button>
          </div>
        </div>
      </header>

      {/* Active-tool chip */}
      <div className="sticky top-[73px] z-10 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label={t("tools.change")}
            className="group inline-flex items-center gap-2 rounded-full border border-sage/40 bg-sage/12 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-foreground transition-all hover:bg-sage/20"
          >
            <span aria-hidden="true" className="text-sm leading-none">{tool.emoji}</span>
            <span className="font-display">{tool.name[lang]}</span>
            <span aria-hidden="true" className="text-muted-foreground group-hover:text-foreground">✏️</span>
            <span className="sr-only">{t("tools.change")}</span>
          </button>
          <div className="flex items-center gap-3">
            <p className="hidden text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:block">
              {tool.tagline[lang]}
            </p>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-all hover:border-sage/40 hover:text-foreground"
            >
              <span aria-hidden="true">🧭</span>
              <span className="font-display">{t("tools.guide.open")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          {messages.length === 0 && (
            <div className="fade-up space-y-6 py-8">
              <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
                {tool.name[lang]}
              </p>
              <p className="font-display text-xl font-light leading-relaxed text-foreground/90 md:text-2xl">
                {tool.intro[lang]}
              </p>

              <div className="space-y-3 rounded-2xl border border-sage/30 bg-sage/8 p-5">
                <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {t("tools.guided.hint")}
                </p>
                <p className="text-[15px] leading-relaxed text-foreground/90">
                  “{tool.firstQuestion[lang]}”
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startGuided}
                    disabled={thinking}
                    className="inline-flex items-center gap-2 rounded-full border border-sage/60 bg-sage/95 px-4 py-2 font-display text-[12px] uppercase tracking-[0.22em] text-primary-foreground transition-all hover:bg-sage disabled:opacity-40"
                  >
                    <span aria-hidden="true">✦</span>
                    <span>{t("tools.guided.start")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2 font-display text-[12px] uppercase tracking-[0.22em] text-muted-foreground transition-all hover:border-sage/40 hover:text-foreground"
                  >
                    <span aria-hidden="true">🧭</span>
                    <span>{t("tools.guide.open")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end fade-up">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border/60 bg-card/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                    {m.text}
                  </div>
                </div>
              );
            }
            if (m.role === "system") {
              return (
                <div key={m.id} className="fade-up flex justify-center">
                  <div className="prose prose-invert max-w-md rounded-xl border border-sage/30 bg-sage/8 px-4 py-2.5 text-center text-[12.5px] leading-snug text-foreground/85">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              );
            }
            const replyTool = TOOL_MAP[m.toolId];
            return (
              <article key={m.id} className="fade-up">
                <h2 className="mb-3 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  <span aria-hidden="true">{replyTool.emoji}</span>
                  <span>{replyTool.name[lang]}</span>
                </h2>
                <p className="text-[15px] leading-[1.75] text-foreground/90">{m.text}</p>
              </article>
            );
          })}

          {/* Next-step guide chip after the latest tool reply */}
          {!thinking &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "tool" &&
            guideStep < tool.guide[lang].length && (
              <div className="fade-up flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => sendGuideStep(guideStep)}
                  className="inline-flex max-w-full items-start gap-2 rounded-full border border-sage/40 bg-sage/12 px-3.5 py-2 text-left text-[12px] leading-snug text-foreground/90 transition-all hover:border-sage/60 hover:bg-sage/20"
                >
                  <span className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {t("tools.guide.step", { n: String(guideStep + 1) })} ·
                  </span>
                  <span className="line-clamp-2">{tool.guide[lang][guideStep]}</span>
                </button>
              </div>
            )}

          {thinking && (
            <div className="fade-up">
              <p className="mb-3 flex items-center gap-2 font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                <span aria-hidden="true">{tool.emoji}</span>
                <span>{tool.name[lang]}</span>
              </p>
              <div className="flex items-center gap-1.5 py-2">
                <span className="typing-dot h-1 w-1 rounded-full bg-sage" style={{ animationDelay: "0s" }} />
                <span className="typing-dot h-1 w-1 rounded-full bg-sage" style={{ animationDelay: "0.2s" }} />
                <span className="typing-dot h-1 w-1 rounded-full bg-sage" style={{ animationDelay: "0.4s" }} />
                <span className="ml-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {t("chat.thinking")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <footer className="sticky bottom-0 z-20 border-t border-border/60 bg-background/85 px-4 py-5 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            name="msg"
            rows={1}
            aria-label={t("chat.placeholder")}
            placeholder={t("chat.placeholder")}
            disabled={thinking}
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
            className="flex-1 resize-none rounded-xl border border-border bg-input px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-sage/60 focus:outline-none focus:ring-1 focus:ring-sage/20 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={thinking}
            className="self-end rounded-xl border border-sage/50 bg-sage/95 px-5 py-3 font-display text-sm text-primary-foreground transition-all hover:bg-sage disabled:opacity-30"
          >
            {t("chat.send")}
          </button>
        </form>
        <p className="mx-auto mt-3 max-w-3xl text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {t("chat.newline")}
        </p>
      </footer>

      {/* Floating change-tool button (bottom-left) */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label={t("tools.change")}
        title={t("tools.change")}
        className="fixed bottom-24 left-5 z-40 grid h-12 w-12 place-items-center rounded-full border border-sage/40 bg-sage/15 text-foreground backdrop-blur-md transition-all hover:bg-sage/25 md:bottom-28 md:left-8"
      >
        <span aria-hidden="true" className="text-lg">🛠️</span>
      </button>

      {/* Bottom sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 backdrop-blur-xl fade-in"
          onClick={() => setSheetOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("tools.sheet.title")}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-t-2xl border border-border/60 bg-background/95 shadow-deep fade-up"
          >
            <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  {t("tools.kicker")}
                </p>
                <h2 className="mt-1 font-display text-base font-light text-foreground">
                  {t("tools.sheet.title")}
                </h2>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="rounded-md px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {t("chat.archive.close")}
              </button>
            </header>
            <ul className="grid gap-2 px-6 py-5 sm:grid-cols-2">
              {TOOLS.map((opt) => {
                const active = opt.id === activeTool;
                return (
                  <li key={opt.id}>
                    <button
                      onClick={() => switchTool(opt.id)}
                      aria-pressed={active}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        active
                          ? "border-sage/60 bg-sage/15"
                          : "border-border/70 bg-card/40 hover:border-sage/40 hover:bg-card/70"
                      }`}
                    >
                      <span aria-hidden="true" className="mt-0.5 text-lg">{opt.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-display text-sm font-light text-foreground">
                          {opt.name[lang]}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                          {opt.tagline[lang]}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
