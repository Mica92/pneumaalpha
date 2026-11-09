import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { FEATURES, PLATFORM, type FeatureKey } from "@/lib/institutional-content";
import { cn } from "@/lib/utils";
import { ProductFrame } from "./product-frame";

/** Selector manual (sin autoplay) de funcionalidades reales, con su captura. */
export function FeatureShowcase({ keys }: { keys: FeatureKey[] }) {
  const { lang } = useI18n();
  const items = FEATURES.filter((f) => keys.includes(f.key));
  const [active, setActive] = useState(0);
  const uid = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = items[active]!;

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const last = items.length - 1;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next >= 0) {
      e.preventDefault();
      setActive(next);
      tabs.current[next]?.focus();
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] lg:gap-14">
      <div role="tablist" aria-orientation="vertical" aria-label={PLATFORM.title[lang]} className="flex flex-col border-t border-border">
        {items.map((f, i) => {
          const selected = i === active;
          return (
            <button
              key={f.key}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`${uid}-tab-${f.key}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "group relative border-b border-border py-5 pl-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                selected ? "bg-card" : "hover:bg-card/60",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("absolute top-0 bottom-0 left-0 w-0.5 transition-colors", selected ? "bg-brass" : "bg-transparent")}
              />
              <span className="flex items-baseline gap-4">
                <span className="font-sans text-micro font-semibold tabular-nums text-bronze">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-[1.5rem] leading-tight text-foreground">{f.title[lang]}</span>
              </span>
              <span className={cn("mt-2 block pr-5 pl-9 text-small text-muted-foreground", !selected && "line-clamp-2")}>
                {f.body[lang]}
              </span>
            </button>
          );
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${current.key}`} className="min-w-0">
        <ProductFrame key={`${current.key}-${lang}`} shot={current.shot} alt={current.shotAlt[lang]} className="animate-in fade-in duration-300" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-micro text-muted-foreground">
          <span>
            {PLATFORM.realShot[lang]} · {current.title[lang]}
          </span>
          <Link to={current.to} className="inst-link inline-flex items-center gap-1 text-small">
            {PLATFORM.open[lang]} <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
