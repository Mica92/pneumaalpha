import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import { loadMessages, sendChat, clearConversation } from "@/lib/chat.functions";
import { PHILOSOPHERS, type PhilosopherId } from "@/lib/philosophers";
import { toast } from "sonner";

type Props = {
  userId: string;
  philosopher: PhilosopherId;
  onSignOut: () => void;
};

export function ChatWindow({ userId, philosopher, onSignOut }: Props) {
  const loadFn = useServerFn(loadMessages);
  const clearFn = useServerFn(clearConversation);

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
        toast.success("La conversación ha sido borrada.");
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const meta = PHILOSOPHERS[philosopher];

  const transport = new DefaultChatTransport({
    fetch: async (_url, init) => {
      const body = JSON.parse(init?.body as string);
      return (await sendFn({
        data: { philosopher, messages: body.messages },
      })) as Response;
    },
  });

  const { messages, sendMessage, status, error } = useChat({
    messages: initial,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error("La voz se ha quebrado un instante. Intente de nuevo.");
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
      <header className="sticky top-0 z-20 border-b border-border bg-background/70 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="font-serif text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              title="Volver al umbral"
            >
              ←
            </Link>
            <span className="font-serif text-2xl text-primary ember-breathe">{meta.glyph}</span>
            <div className="leading-tight">
              <p className="font-serif text-base text-foreground">{meta.name}</p>
              <p className="text-xs text-muted-foreground">{meta.place}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={async () => {
                if (confirm(`¿Borrar la conversación con ${meta.name}?`)) await onClear();
              }}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Borrar
            </button>
            <button
              onClick={onSignOut}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {messages.length === 0 && (
            <div className="fade-up space-y-6 py-8">
              <p className="font-serif text-lg italic leading-relaxed text-muted-foreground">
                {meta.opening}
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
                  <div className="max-w-[80%] rounded-lg rounded-tr-sm bg-secondary/80 px-4 py-2.5 text-sm text-secondary-foreground">
                    {text}
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id} className="fade-up">
                <p className="mb-2 font-serif text-xs uppercase tracking-widest text-primary/80">{meta.name}</p>
                <article className="prose prose-invert prose-p:my-3 prose-p:leading-relaxed prose-p:font-serif prose-p:text-[1.05rem] prose-p:text-foreground/95 max-w-none">
                  <ReactMarkdown>{text}</ReactMarkdown>
                </article>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="fade-up">
              <p className="mb-2 font-serif text-xs uppercase tracking-widest text-primary/80">{meta.name}</p>
              <div className="flex items-center gap-1.5 py-2">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0s" }} />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
                <span className="ml-2 font-serif text-xs italic text-muted-foreground">piensa…</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-xs text-destructive">{error.message}</p>
          )}
        </div>
      </div>

      <footer className="sticky bottom-0 z-20 border-t border-border bg-background/80 px-4 py-4 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            name="msg"
            rows={1}
            placeholder="Diga algo…"
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
            className="flex-1 resize-none rounded-md border border-border bg-input px-4 py-3 font-serif text-[1.05rem] leading-relaxed text-foreground placeholder:italic placeholder:text-muted-foreground focus:border-ring focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="self-end rounded-md bg-primary px-5 py-3 font-serif text-sm text-primary-foreground shadow-lamp transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Enviar
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          Shift + Enter para nueva línea
        </p>
      </footer>
    </div>
  );
}
