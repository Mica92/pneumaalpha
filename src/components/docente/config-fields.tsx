import { useId } from "react";
import { DISCIPLINE_FAMILIES, LEVELS } from "@/lib/docente/catalog";
import { useI18n } from "@/lib/i18n";
import { useTr } from "@/lib/docente/use-docente";
import { cn } from "@/lib/utils";

export type BaseConfig = {
  concept: string;
  discipline: string;
  subject: string;
  level: string;
  objective: string;
  durationMin: number;
  language: "es" | "en";
};

export function emptyConfig(lang: "es" | "en", seed: Partial<BaseConfig> = {}): BaseConfig {
  return {
    concept: "",
    discipline: "",
    subject: "",
    level: LEVELS[1].label[lang],
    objective: "",
    durationMin: 90,
    language: lang,
    ...Object.fromEntries(Object.entries(seed).filter(([, v]) => v !== undefined && v !== "")),
  };
}

export const inputCls =
  "focus-mist w-full rounded-md border border-border bg-input/60 px-3 py-2 text-body text-foreground placeholder:text-muted-foreground/70";

export function Field({
  label,
  hint,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-small font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-micro text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Discipline input with the searchable catalog as suggestions; any custom value is allowed. */
export function DisciplineInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id?: string }) {
  const { lang } = useI18n();
  const listId = useId();
  return (
    <>
      <input
        id={id}
        className={inputCls}
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={120}
        placeholder={lang === "es" ? "Ej. Biología, Derecho, Ingeniería Industrial…" : "E.g. Biology, Law, Industrial Engineering…"}
        autoComplete="off"
      />
      <datalist id={listId}>
        {DISCIPLINE_FAMILIES.flatMap((f) =>
          f.items.map((it) => <option key={`${f.id}-${it.es}`} value={it[lang]} label={f.label[lang]} />),
        )}
      </datalist>
    </>
  );
}

export function BaseConfigFields({
  value,
  onChange,
  conceptLabel,
  showObjective = true,
  showDuration = true,
}: {
  value: BaseConfig;
  onChange: (v: BaseConfig) => void;
  conceptLabel?: string;
  showObjective?: boolean;
  showDuration?: boolean;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const ids = useId();
  const set = <K extends keyof BaseConfig>(k: K, v: BaseConfig[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label={conceptLabel ?? tr("Concepto o pregunta central", "Central concept or question")} className="md:col-span-2" htmlFor={`${ids}-c`}>
        <input
          id={`${ids}-c`}
          className={cn(inputCls, "font-serif text-lg")}
          value={value.concept}
          onChange={(e) => set("concept", e.target.value)}
          maxLength={200}
          required
          placeholder={tr("Ej. Libertad, ¿qué es una decisión justa?", "E.g. Freedom, what is a fair decision?")}
        />
      </Field>
      <Field label={tr("Carrera o disciplina", "Career or discipline")} htmlFor={`${ids}-d`} hint={tr("Elige de la lista o escribe la tuya.", "Pick from the list or type your own.")}>
        <DisciplineInput id={`${ids}-d`} value={value.discipline} onChange={(v) => set("discipline", v)} />
      </Field>
      <Field label={tr("Asignatura", "Subject")} htmlFor={`${ids}-s`}>
        <input
          id={`${ids}-s`}
          className={inputCls}
          value={value.subject}
          onChange={(e) => set("subject", e.target.value)}
          maxLength={160}
          placeholder={tr("Ej. Neurociencia", "E.g. Neuroscience")}
        />
      </Field>
      <Field label={tr("Nivel académico", "Academic level")} htmlFor={`${ids}-l`}>
        <select id={`${ids}-l`} className={inputCls} value={value.level} onChange={(e) => set("level", e.target.value)}>
          {LEVELS.map((l) => (
            <option key={l.id} value={l.label[lang]}>
              {l.label[lang]}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        {showDuration && (
          <Field label={tr("Duración (min)", "Duration (min)")} htmlFor={`${ids}-t`}>
            <input
              id={`${ids}-t`}
              type="number"
              min={10}
              max={600}
              className={inputCls}
              value={value.durationMin}
              onChange={(e) => set("durationMin", Math.max(10, Math.min(600, Number(e.target.value) || 10)))}
            />
          </Field>
        )}
        <Field label={tr("Idioma", "Language")} htmlFor={`${ids}-g`}>
          <select id={`${ids}-g`} className={inputCls} value={value.language} onChange={(e) => set("language", e.target.value as "es" | "en")}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </Field>
      </div>
      {showObjective && (
        <Field label={tr("Objetivo de aprendizaje", "Learning objective")} className="md:col-span-2" htmlFor={`${ids}-o`}>
          <textarea
            id={`${ids}-o`}
            className={cn(inputCls, "min-h-20")}
            value={value.objective}
            onChange={(e) => set("objective", e.target.value)}
            maxLength={1200}
            placeholder={tr(
              "Ej. Analizar la relación entre determinismo biológico y autonomía humana.",
              "E.g. Analyse the relationship between biological determinism and human autonomy.",
            )}
          />
        </Field>
      )}
    </div>
  );
}

export function GenerationStatus({ busy, error, onRetry }: { busy: boolean; error: string | null; onRetry?: () => void }) {
  const tr = useTr();
  if (busy)
    return (
      <div role="status" className="rounded-md border border-bronze/40 bg-bronze/5 p-4 text-small text-foreground">
        <p className="font-medium">{tr("Generando…", "Generating…")}</p>
        <p className="mt-1 text-muted-foreground">
          {tr(
            "Kionas está investigando y estructurando el material. Suele tardar entre 30 y 90 segundos; no cierres la página.",
            "Kionas is researching and structuring the material. It usually takes 30–90 seconds; keep this page open.",
          )}
        </p>
      </div>
    );
  if (error)
    return (
      <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-small text-foreground">
        <p>{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-ghost-gold focus-mist mt-3 px-3 py-1.5 text-small">
            {tr("Reintentar", "Retry")}
          </button>
        )}
      </div>
    );
  return null;
}

export function SourceNotice() {
  const tr = useTr();
  return (
    <p className="text-micro text-muted-foreground">
      {tr(
        "Solo se citan pensadores registrados en Kionas. Toda referencia generada queda marcada como «pendiente de verificación» hasta que tú la revises. La publicación final es responsabilidad del docente.",
        "Only thinkers registered in Kionas are cited. Every generated reference is marked “pending verification” until you check it. Final publication is the teacher's responsibility.",
      )}
    </p>
  );
}

/** Shows which source material and conversion a new material is being created from. */
export function ConversionNotice({ conv, sourceTitle }: { conv?: string; sourceTitle?: string | null }) {
  const tr = useTr();
  const { lang } = useI18n();
  const c = getConversion(conv);
  if (!sourceTitle && !c) return null;
  return (
    <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-small">
      {c && <p className="font-medium text-foreground">{c.label[lang]}</p>}
      {sourceTitle && (
        <p className="text-muted-foreground">
          {tr("A partir de:", "From:")} <span className="text-foreground">{sourceTitle}</span>.{" "}
          {tr("El original no se modifica; el nuevo material quedará vinculado a él.", "The original is not changed; the new material stays linked to it.")}
        </p>
      )}
    </div>
  );
}
