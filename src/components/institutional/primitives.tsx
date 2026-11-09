import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Aparición suave al entrar en pantalla. Visible por defecto en SSR y con movimiento reducido. */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return; // ya visible: no lo ocultamos
    el.dataset.visible = "false";
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            window.setTimeout(() => {
              el.dataset.visible = "true";
            }, delay);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={cn("inst-reveal", className)}>
      {children}
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("inst-eyebrow", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  align = "left",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className="inst-title mt-4 text-[clamp(2rem,1.4rem+2.4vw,3.25rem)]">
        {title}
      </h2>
      {lead ? (
        <p className="mt-5 max-w-2xl text-lead text-muted-foreground [text-wrap:pretty]">{lead}</p>
      ) : null}
    </div>
  );
}

/** Número de orden discreto, estilo índice editorial. */
export function IndexNumber({ n, className }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("font-sans text-micro font-semibold tabular-nums tracking-[0.12em] text-bronze", className)}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

/** Página interior: cabecera editorial común a las páginas secundarias. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border">
      <div className="inst-container grid gap-10 pt-16 pb-16 md:pt-24 md:pb-20 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="inst-title mt-5 text-[clamp(2.5rem,1.6rem+3.6vw,4.5rem)]">{title}</h1>
        </div>
        <div>
          <p className="text-lead text-muted-foreground">{lead}</p>
          {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}
