import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEpisode, type PodcastEpisode } from "@/lib/podcast.functions";
import { PAYWALL_ERROR } from "@/lib/billing.shared";
import { track } from "@/lib/analytics";
import { PODCAST_BOOKS, type PodcastBook } from "@/lib/podcast-books";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { useI18n } from "@/lib/i18n";
import { GreekGlyph } from "@/components/greek-glyph";

export const Route = createFileRoute("/_authenticated/podcast")({
  component: PodcastPage,
  head: () => ({
    meta: [
      { title: "Pneum — Podcast: clásicos de la literatura en clave filosófica" },
      {
        name: "description",
        content:
          "Resúmenes filosóficos de cinco minutos, narrados con voz natural, sobre diez clásicos de la literatura: El lobo estepario, Los hermanos Karamázov, El proceso y más.",
      },
      { property: "og:title", content: "Pneum — Podcast filosófico" },
      {
        property: "og:description",
        content:
          "Diez clásicos, cinco minutos cada uno, leídos como pensamiento y no como resumen escolar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

/** Split the script into TTS-sized chunks at paragraph/sentence boundaries. */
function chunkScript(text: string, maxChars = 900): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  const push = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };
  for (const p of paragraphs) {
    if (p.length > maxChars) {
      push();
      const sentences = p.match(/[^.!?]+[.!?]*\s*/g) ?? [p];
      let buf = "";
      for (const s of sentences) {
        if (buf.length + s.length > maxChars) {
          if (buf.trim()) chunks.push(buf.trim());
          buf = "";
        }
        buf += s;
      }
      if (buf.trim()) chunks.push(buf.trim());
      continue;
    }
    if (current.length + p.length > maxChars) push();
    current += (current ? "\n\n" : "") + p;
  }
  push();
  return chunks;
}

const VOICES = [
  { id: "ash", es: "Grave", en: "Deep" },
  { id: "ballad", es: "Cálida", en: "Warm" },
  { id: "sage", es: "Serena", en: "Calm" },
] as const;

function PodcastPage() {
  const { lang, t } = useI18n();
  const generateFn = useServerFn(generateEpisode);

  const [active, setActive] = useState<PodcastBook | null>(null);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoice] = useState<string>("ash");
  const [playing, setPlaying] = useState(false);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [chunkTotal, setChunkTotal] = useState(0);
  const [buffering, setBuffering] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<string[]>([]);
  const urlsRef = useRef<(string | null)[]>([]);
  const indexRef = useRef(0);
  const stoppedRef = useRef(true);

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((u) => u && URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
    }
    setPlaying(false);
    setBuffering(false);
  }, []);

  useEffect(
    () => () => {
      stop();
      revokeAll();
    },
    [stop, revokeAll],
  );

  const fetchChunk = useCallback(
    async (i: number): Promise<string | null> => {
      const cached = urlsRef.current[i];
      if (cached) return cached;
      const text = chunksRef.current[i];
      if (!text) return null;
      const res = await fetch("/api/podcast/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlsRef.current[i] = url;
      return url;
    },
    [voice],
  );

  const playFrom = useCallback(
    async (i: number) => {
      if (i >= chunksRef.current.length) {
        stoppedRef.current = true;
        setPlaying(false);
        setChunkIndex(0);
        indexRef.current = 0;
        return;
      }
      indexRef.current = i;
      setChunkIndex(i);
      setBuffering(true);
      try {
        const url = await fetchChunk(i);
        if (stoppedRef.current || !url) return;
        const a = audioRef.current;
        if (!a) return;
        a.src = url;
        await a.play();
        setPlaying(true);
        setBuffering(false);
        // Prefetch the next chunk so playback never stalls.
        void fetchChunk(i + 1).catch(() => {});
      } catch (err) {
        console.error("[podcast] playback failed", err);
        setError(t("podcast.audioError"));
        stoppedRef.current = true;
        setPlaying(false);
        setBuffering(false);
      }
    },
    [fetchChunk, t],
  );

  async function openBook(book: PodcastBook) {
    stop();
    revokeAll();
    setActive(book);
    setEpisode(null);
    setError(null);
    setChunkIndex(0);
    setChunkTotal(0);
    setLoading(true);
    track("podcast_viewed", { book: book.id });
    try {
      const ep = await generateFn({ data: { bookId: book.id, language: lang } });
      chunksRef.current = chunkScript(ep.script);
      urlsRef.current = [];
      setChunkTotal(chunksRef.current.length);
      setEpisode(ep);
    } catch (err) {
      console.error("[podcast] episode failed", err);
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.includes(PAYWALL_ERROR)
          ? lang === "es"
            ? "El podcast es parte de la suscripción. Elige un plan para escucharlo."
            : "The podcast is part of the subscription. Choose a plan to listen."
          : t("podcast.error"),
      );
    } finally {
      setLoading(false);
    }
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      return;
    }
    if (a.src && !stoppedRef.current) {
      void a.play();
      setPlaying(true);
      return;
    }
    stoppedRef.current = false;
    void playFrom(indexRef.current);
  }

  const minutes = Math.max(
    1,
    Math.round(((episode?.script.split(/\s+/).length ?? 0) / 150) * 10) / 10,
  );

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-10 md:px-10 md:py-14">
        <header className="mt-16 mb-10 md:mt-20 md:mb-12">
          <p className="tracking-in font-display text-micro uppercase tracking-[0.35em] text-sage">
            {t("podcast.kicker")}
          </p>
          <h1 className="fade-up mt-5 max-w-2xl font-display text-title font-light text-foreground">
            {t("podcast.page.title")}
          </h1>
          <p className="fade-up mt-5 max-w-xl text-small leading-relaxed text-muted-foreground">
            {t("podcast.page.sub")}
          </p>
        </header>

        {/* Player */}
        {active && (
          <section className="fade-up mb-10 rounded-xl border border-sage/40 bg-card/60 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-display text-micro uppercase tracking-[0.3em] text-sage">
                  {t("podcast.nowPlaying")}
                </p>
                <h2 className="mt-2 font-display text-subtitle font-light text-foreground md:text-subtitle">
                  {active.title[lang]}
                </h2>
                <p className="text-micro text-muted-foreground">
                  {active.author} · {active.year}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (v.id === voice) return;
                      stop();
                      revokeAll();
                      indexRef.current = 0;
                      setChunkIndex(0);
                      setVoice(v.id);
                    }}
                    className={`rounded-full border px-3 py-1 text-micro uppercase tracking-[0.2em] transition-colors ${
                      voice === v.id
                        ? "border-sage/70 text-sage"
                        : "border-border/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang === "es" ? v.es : v.en}
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="mt-6 flex items-center gap-3 text-small text-muted-foreground">
                <GreekGlyph />
                <span>{t("podcast.writing")}</span>
              </div>
            )}

            {error && <p className="mt-6 text-small text-destructive">{error}</p>}

            {episode && (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="focus-mist flex h-12 w-12 items-center justify-center rounded-full border border-sage/60 text-sage transition-colors hover:bg-sage/10"
                    aria-label={playing ? t("podcast.pause") : t("podcast.play")}
                  >
                    <span className="text-lg leading-none">{playing ? "❙❙" : "▶"}</span>
                  </button>
                  <button
                    onClick={() => {
                      stop();
                      indexRef.current = 0;
                      setChunkIndex(0);
                    }}
                    className="text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("podcast.restart")}
                  </button>
                  <span className="font-mono text-micro tracking-widest text-muted-foreground/80">
                    ≈ {minutes} min · {chunkTotal > 0 ? `${chunkIndex + 1}/${chunkTotal}` : "—"}
                    {buffering ? ` · ${t("podcast.buffering")}` : ""}
                  </span>
                </div>

                <div className="mt-4 h-px w-full bg-border/60">
                  <div
                    className="h-px bg-sage transition-all duration-500"
                    style={{
                      width: chunkTotal
                        ? `${((chunkIndex + (playing ? 1 : 0)) / chunkTotal) * 100}%`
                        : "0%",
                    }}
                  />
                </div>

                <details className="mt-6 group">
                  <summary className="cursor-pointer list-none font-display text-micro uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground">
                    {t("podcast.transcript")}
                  </summary>
                  <div className="mt-4 space-y-4 text-small leading-relaxed text-foreground/85">
                    {episode.script.split(/\n\s*\n/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </details>

                {active.voices.length > 0 && (
                  <div className="mt-6 border-t border-border/60 pt-4">
                    <p className="font-display text-micro uppercase tracking-[0.25em] text-muted-foreground">
                      {t("podcast.discuss")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {active.voices
                        .filter((id) => id in PHILOSOPHERS)
                        .map((id) => (
                          <Link
                            key={id}
                            to="/$philosopher"
                            params={{ philosopher: id }}
                            className="rounded-full border border-border/70 px-3 py-1 text-micro text-foreground/85 transition-colors hover:border-mist/60 hover:text-foreground"
                          >
                            {
                              (PHILOSOPHERS as Record<string, { glyph: string; name: string }>)[id]
                                .glyph
                            }{" "}
                            {
                              (PHILOSOPHERS as Record<string, { glyph: string; name: string }>)[id]
                                .name
                            }
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <audio
              ref={audioRef}
              onEnded={() => {
                if (stoppedRef.current) return;
                void playFrom(indexRef.current + 1);
              }}
              className="hidden"
            />
          </section>
        )}

        {/* Catalogue */}
        <section aria-labelledby="episodes-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
            <h2
              id="episodes-heading"
              className="font-display text-micro uppercase tracking-[0.35em] text-muted-foreground"
            >
              {t("podcast.catalogue")}
            </h2>
            <span className="font-mono text-micro tracking-widest text-muted-foreground/70">
              {String(PODCAST_BOOKS.length).padStart(2, "0")}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PODCAST_BOOKS.map((b, i) => (
              <button
                key={b.id}
                onClick={() => void openBook(b)}
                className={`group fade-up hover-lift focus-mist flex flex-col justify-between rounded-xl border bg-card/50 p-5 text-left backdrop-blur-sm transition-all duration-500 hover:bg-card/80 ${
                  active?.id === b.id ? "border-sage/60" : "border-border/70 hover:border-mist/50"
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
                aria-label={`${b.title[lang]} — ${b.author}`}
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-lg text-mist">{b.glyph}</span>
                    <span className="font-mono text-micro tracking-widest text-muted-foreground/70">
                      {b.year}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-light leading-tight text-foreground">
                    {b.title[lang]}
                  </h3>
                  <p className="mt-1 text-micro uppercase tracking-[0.2em] text-muted-foreground">
                    {b.author}
                  </p>
                  <p className="mt-3 text-micro leading-relaxed text-muted-foreground">
                    {b.blurb[lang]}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {b.themes.map((th) => (
                    <span
                      key={th.en}
                      className="rounded-full border border-border/60 px-2 py-0.5 text-micro text-muted-foreground"
                    >
                      {th[lang]}
                    </span>
                  ))}
                </div>
                <span className="mt-4 font-display text-micro uppercase tracking-[0.3em] text-sage transition-colors group-hover:text-foreground">
                  {t("podcast.listen")}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
