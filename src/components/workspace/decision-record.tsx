import { useState } from "react";

const COPY = {
  es: {
    title: "Registrar una decisión",
    lead: "Nada de esto es obligatorio. Guarda sólo lo que te sirva para volver a mirarlo después.",
    situation: "La situación",
    decision: "Lo que decidiste",
    reason: "Por qué",
    risk: "El riesgo que aceptas",
    learned: "Lo que aprendiste",
    watch: "Qué observarás después",
    review: "Volver a esto en",
    none: "Sin recordatorio",
    d30: "30 días",
    d90: "90 días",
    save: "Guardar en mi mapa",
    cancel: "Cancelar",
  },
  en: {
    title: "Record a decision",
    lead: "None of this is required. Keep only what will help you look back later.",
    situation: "The situation",
    decision: "What you decided",
    reason: "Why",
    risk: "The risk you accept",
    learned: "What you learned",
    watch: "What you will watch for",
    review: "Come back to this in",
    none: "No reminder",
    d30: "30 days",
    d90: "90 days",
    save: "Save to my map",
    cancel: "Cancel",
  },
} as const;

export type DecisionDraft = {
  situation: string;
  decision: string;
  reason: string;
  risk: string;
  learned: string;
  watchFor: string;
  reviewInDays: number;
};

type Props = {
  lang: "es" | "en";
  open: boolean;
  initialSituation?: string;
  saving?: boolean;
  onClose: () => void;
  onSave: (draft: DecisionDraft) => void;
};

function Field({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-display text-micro uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        className="focus-mist w-full resize-none rounded-lg border border-border/70 bg-input px-3 py-2 text-small leading-relaxed text-foreground outline-none transition-colors focus:border-mist/50"
      />
    </label>
  );
}

export function DecisionRecordPanel({
  lang,
  open,
  initialSituation = "",
  saving = false,
  onClose,
  onSave,
}: Props) {
  const c = COPY[lang];
  const [draft, setDraft] = useState<DecisionDraft>({
    situation: initialSituation,
    decision: "",
    reason: "",
    risk: "",
    learned: "",
    watchFor: "",
    reviewInDays: 30,
  });

  if (!open) return null;
  const set = (patch: Partial<DecisionDraft>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div
      className="fade-up fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-xl"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-lg flex-col border-l border-border/60 bg-background/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={c.title}
      >
        <header className="border-b border-border/60 px-6 py-5">
          <h2 className="font-display text-subtitle font-light text-foreground">{c.title}</h2>
          <p className="mt-1 text-micro leading-relaxed text-muted-foreground">{c.lead}</p>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          <Field
            label={c.situation}
            value={draft.situation}
            onChange={(v) => set({ situation: v })}
          />
          <Field label={c.decision} value={draft.decision} onChange={(v) => set({ decision: v })} />
          <Field label={c.reason} value={draft.reason} onChange={(v) => set({ reason: v })} />
          <Field label={c.risk} value={draft.risk} onChange={(v) => set({ risk: v })} />
          <Field label={c.learned} value={draft.learned} onChange={(v) => set({ learned: v })} />
          <Field label={c.watch} value={draft.watchFor} onChange={(v) => set({ watchFor: v })} />

          <div className="space-y-2">
            <span className="font-display text-micro uppercase tracking-[0.25em] text-muted-foreground">
              {c.review}
            </span>
            <div className="flex gap-2">
              {[
                { days: 0, label: c.none },
                { days: 30, label: c.d30 },
                { days: 90, label: c.d90 },
              ].map((o) => (
                <button
                  key={o.days}
                  type="button"
                  onClick={() => set({ reviewInDays: o.days })}
                  className={`focus-mist rounded-full border px-3 py-1.5 text-micro transition-colors ${
                    draft.reviewInDays === o.days
                      ? "border-bronze/60 text-bronze"
                      : "border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-border/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-mist text-micro uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            {c.cancel}
          </button>
          <button
            type="button"
            disabled={saving || !draft.situation.trim() || !draft.decision.trim()}
            onClick={() => onSave(draft)}
            className="focus-mist rounded-full border border-mist/40 bg-mist/95 px-5 py-2 font-display text-small text-primary-foreground transition-all hover:bg-mist disabled:opacity-30"
          >
            {c.save}
          </button>
        </footer>
      </aside>
    </div>
  );
}
