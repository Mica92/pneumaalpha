import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  isModerator,
  listApprovedFragments,
  listPendingFragments,
  moderateFragment,
  type LibraryFragment,
} from "@/lib/library.functions";
import { PHILOSOPHERS, PHILOSOPHER_LIST, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import { NewsletterCard } from "@/components/newsletter-card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  component: LibraryPage,
  head: () => ({
    meta: [
      { title: "PneumaA — Biblioteca de Ideas · pasajes y preguntas profundas" },
      {
        name: "description",
        content:
          "Fragmentos de conversación filosófica compartidos de forma anónima y revisados uno a uno: preguntas profundas y pasajes de pensadores reconstruidos con IA.",
      },
      { property: "og:title", content: "PneumaA — Biblioteca de Ideas" },
      {
        property: "og:description",
        content: "Lo que otros preguntaron: pasajes escogidos de conversaciones filosóficas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function LibraryPage() {
  const { t } = useI18n();
  const listFn = useServerFn(listApprovedFragments);
  const modCheckFn = useServerFn(isModerator);
  const [filter, setFilter] = useState<PhilosopherId | null>(null);

  const { data: fragments, isLoading } = useQuery({
    queryKey: ["library", filter],
    queryFn: () => listFn({ data: filter ? { philosopher: filter, limit: 30 } : { limit: 30 } }),
  });

  const { data: mod } = useQuery({
    queryKey: ["library-moderator"],
    queryFn: () => modCheckFn({ data: {} }),
  });

  return (
    <main className="route-enter relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col px-6 py-10 md:px-10 md:py-14">
      <nav className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <PneumaMark withWordmark size={26} />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link
            to="/"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("library.back")}
          </Link>
        </div>
      </nav>

      <header className="mt-16 mb-10 md:mt-20 md:mb-12">
        <p className="tracking-in font-display text-[10px] uppercase text-muted-foreground">
          {t("library.kicker")}
        </p>
        <h1 className="fade-up mt-5 font-display text-3xl font-light leading-[1.1] text-foreground md:text-5xl">
          {t("library.page.title")}
        </h1>
        <p className="fade-up mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("library.page.sub")}
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>
          {t("library.all")}
        </FilterChip>
        {PHILOSOPHER_LIST.map((p) => (
          <FilterChip key={p.id} active={filter === p.id} onClick={() => setFilter(p.id)}>
            {p.name}
          </FilterChip>
        ))}
      </div>

      <section aria-live="polite" className="space-y-4">
        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        {!isLoading && (fragments ?? []).length === 0 && (
          <p className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
            {t("library.empty")}
          </p>
        )}
        {(fragments ?? []).map((f) => (
          <FragmentCard key={f.id} fragment={f} />
        ))}
      </section>

      {mod?.moderator && <ModerationPanel />}

      <NewsletterCard className="mt-14" />
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`focus-mist rounded-full border px-3 py-1.5 text-[11px] tracking-wide transition-colors ${
        active
          ? "border-mist/60 bg-mist/10 text-foreground"
          : "border-border/70 text-muted-foreground hover:border-mist/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-border/50 bg-card/30 p-6">
      <div className="h-2 w-24 rounded bg-muted/40" />
      <div className="mt-4 h-3 w-full rounded bg-muted/30" />
      <div className="mt-2 h-3 w-11/12 rounded bg-muted/30" />
      <div className="mt-2 h-3 w-2/3 rounded bg-muted/30" />
    </div>
  );
}

function FragmentCard({ fragment }: { fragment: LibraryFragment }) {
  const { t } = useI18n();
  const id = fragment.philosopher;
  const meta = isPhilosopherId(id) ? PHILOSOPHERS[id] : null;

  return (
    <article className="fade-up group rounded-xl border border-border/60 bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-mist/40">
      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <span aria-hidden="true" className="mr-2">{meta?.glyph ?? "·"}</span>
        {meta?.name ?? id}
      </p>
      {fragment.question && (
        <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground">
          “{fragment.question}”
        </p>
      )}
      <blockquote className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
        {fragment.fragment}
      </blockquote>
      {isPhilosopherId(id) && (
        <Link
          to="/$philosopher"
          params={{ philosopher: id }}
          className="mt-4 inline-block font-display text-[10px] uppercase tracking-[0.3em] text-mist transition-colors hover:text-foreground"
        >
          {t("library.talk")}
        </Link>
      )}
    </article>
  );
}

function ModerationPanel() {
  const { t } = useI18n();
  const pendingFn = useServerFn(listPendingFragments);
  const moderateFn = useServerFn(moderateFragment);
  const qc = useQueryClient();

  const { data: pending } = useQuery({
    queryKey: ["library-pending"],
    queryFn: () => pendingFn({ data: {} }),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: "approved" | "rejected" }) =>
      moderateFn({ data: vars }),
    onSuccess: () => {
      toast.success(t("library.moderated"));
      void qc.invalidateQueries({ queryKey: ["library-pending"] });
      void qc.invalidateQueries({ queryKey: ["library"] });
    },
    onError: (e) => console.error("[library] moderation failed", e),
  });

  const rows = pending ?? [];

  return (
    <section className="mt-14" aria-labelledby="moderation-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
        <h2
          id="moderation-heading"
          className="font-display text-[10px] uppercase tracking-[0.35em] text-glacier-bright"
        >
          {t("library.moderation")}
        </h2>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground/70">
          {t("library.pending", { n: String(rows.length) })}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("library.pending.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((f) => (
            <li
              key={f.id}
              className="rounded-xl border border-glacier/25 bg-card/40 p-5"
            >
              <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                {isPhilosopherId(f.philosopher) ? PHILOSOPHERS[f.philosopher].name : f.philosopher}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                {f.fragment}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: f.id, status: "approved" })}
                  className="focus-mist rounded-md border border-sage/40 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-foreground transition-colors hover:bg-sage/10 disabled:opacity-40"
                >
                  {t("library.approve")}
                </button>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: f.id, status: "rejected" })}
                  className="focus-mist rounded-md border border-border/70 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  {t("library.reject")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
