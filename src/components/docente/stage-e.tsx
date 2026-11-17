import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star } from "lucide-react";
import { getMaterialWorkTime, getPreferences, logWorkTime, setFavorite, setTags } from "@/lib/docente/insights.functions";
import { WORK_FLUSH_MAX, creditTick, formatDuration, parseTagInput, type Preferences } from "@/lib/docente/insights";
import { errorText, useTr } from "@/lib/docente/use-docente";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function usePreferences() {
  const fetchPrefs = useServerFn(getPreferences);
  return useQuery({ queryKey: ["docente-preferences"], queryFn: () => fetchPrefs() as Promise<Preferences>, staleTime: 5 * 60_000 });
}

const TICK_MS = 15_000;

/**
 * Counts active preparation time on one material: only while the tab is visible and the teacher
 * typed, clicked or scrolled in the last 90 s. Flushed every minute and when leaving the page.
 */
export function useWorkTimer(materialId: string, enabled: boolean) {
  const log = useServerFn(logWorkTime);
  const pending = useRef(0);
  const lastActivity = useRef(Date.now());
  useEffect(() => {
    if (!enabled) return;
    const mark = () => (lastActivity.current = Date.now());
    const events = ["keydown", "pointerdown", "wheel", "input"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    const flush = () => {
      const s = Math.min(WORK_FLUSH_MAX, pending.current);
      if (s < 1) return;
      pending.current -= s;
      void log({ data: { id: materialId, seconds: s } }).catch(() => (pending.current += s));
    };
    let ticks = 0;
    const iv = window.setInterval(() => {
      pending.current += creditTick(Date.now(), lastActivity.current, document.visibilityState === "visible", TICK_MS);
      if (++ticks % 4 === 0) flush();
    }, TICK_MS);
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(iv);
      events.forEach((e) => window.removeEventListener(e, mark));
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [materialId, enabled, log]);
}

export function WorkTimeLabel({ materialId }: { materialId: string }) {
  const tr = useTr();
  const { lang } = useI18n();
  const fetchTime = useServerFn(getMaterialWorkTime);
  const { data } = useQuery({ queryKey: ["docente-work", materialId], queryFn: () => fetchTime({ data: { id: materialId } }), staleTime: 60_000 });
  if (!data || data.seconds < 60) return null;
  return (
    <span title={tr("Tiempo activo registrado en este material", "Active time recorded on this material")}>
      {tr("Trabajo registrado:", "Time recorded:")} {formatDuration(data.seconds, lang)}
    </span>
  );
}

export function FavoriteButton({ id, initial, className }: { id: string; initial: boolean; className?: string }) {
  const tr = useTr();
  const qc = useQueryClient();
  const run = useServerFn(setFavorite);
  const [fav, setFav] = useState(initial);
  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? tr("Quitar de favoritos", "Remove from favourites") : tr("Marcar como favorito", "Mark as favourite")}
      title={fav ? tr("Quitar de favoritos", "Remove from favourites") : tr("Marcar como favorito", "Mark as favourite")}
      onClick={async () => {
        const next = !fav;
        setFav(next);
        try {
          await run({ data: { id, favorite: next } });
          await qc.invalidateQueries({ queryKey: ["docente-materials"] });
        } catch {
          setFav(!next);
        }
      }}
      className={cn("focus-mist grid h-8 w-8 place-items-center rounded hover:bg-muted", fav ? "text-bronze-bright" : "text-muted-foreground", className)}
    >
      <Star className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
    </button>
  );
}

export function TagEditor({ id, initial }: { id: string; initial: string[] }) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const run = useServerFn(setTags);
  const [tags, setLocal] = useState(initial);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);
  async function save(next: string[]) {
    setErr(null);
    const prev = tags;
    setLocal(next);
    try {
      const r = await run({ data: { id, tags: next } });
      setLocal(r.tags);
      await qc.invalidateQueries({ queryKey: ["docente-materials"] });
    } catch (e) {
      setLocal(prev);
      setErr(errorText(e, lang));
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-micro">
      <span className="label mr-1">{tr("Etiquetas", "Tags")}</span>
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-muted-foreground">
          #{t}
          <button type="button" className="focus-mist hover:text-destructive" aria-label={tr(`Quitar ${t}`, `Remove ${t}`)} onClick={() => save(tags.filter((x) => x !== t))}>
            ✕
          </button>
        </span>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const add = parseTagInput(draft);
          if (add.length) void save([...tags, ...add]);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={120}
          aria-label={tr("Añadir etiqueta", "Add tag")}
          placeholder={tr("+ etiqueta", "+ tag")}
          className="focus-mist w-28 rounded border border-transparent bg-transparent px-1.5 py-0.5 text-foreground placeholder:text-muted-foreground hover:border-border focus:border-border"
        />
      </form>
      {err && <span className="text-destructive">{err}</span>}
    </div>
  );
}
