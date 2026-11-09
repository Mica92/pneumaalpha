import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { FORM } from "@/lib/institutional-content";
import { submitInstitutionalLead } from "@/lib/leads.functions";
import { invalidLeadFields, LEAD_MESSAGE_MAX, type LeadField } from "@/lib/leads.shared";
import { cn } from "@/lib/utils";

type Values = {
  fullName: string;
  email: string;
  institution: string;
  jobTitle: string;
  country: string;
  message: string;
};

const EMPTY: Values = { fullName: "", email: "", institution: "", jobTitle: "", country: "", message: "" };

const FIELDS: { name: keyof Values; autoComplete: string; type?: string; half?: boolean }[] = [
  { name: "fullName", autoComplete: "name", half: true },
  { name: "email", autoComplete: "email", type: "email", half: true },
  { name: "institution", autoComplete: "organization", half: true },
  { name: "jobTitle", autoComplete: "organization-title", half: true },
  { name: "country", autoComplete: "country-name" },
];

export function LeadForm({
  defaultInterest = "demo",
  sourcePath,
  className,
}: {
  defaultInterest?: "demo" | "pilot";
  sourcePath: string;
  className?: string;
}) {
  const { lang } = useI18n();
  const submit = useServerFn(submitInstitutionalLead);
  const uid = useId();
  const startedAt = useRef<number>(0);
  const statusRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Values>(EMPTY);
  const [interest, setInterest] = useState<"demo" | "pilot">(defaultInterest);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [invalid, setInvalid] = useState<LeadField[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (state === "done" || state === "error") statusRef.current?.focus();
  }, [state]);

  const id = (name: string) => `${uid}-${name}`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const payload = {
      ...values,
      interest,
      language: lang,
      sourcePath,
      consent: consent as true,
      website,
      elapsedMs: Math.max(0, Date.now() - startedAt.current),
    };
    const bad = invalidLeadFields(payload);
    setInvalid(bad);
    if (bad.length) {
      setState("error");
      setErrorMsg(FORM.errors[lang]);
      const first = bad[0] === "consent" ? "consent" : bad[0];
      document.getElementById(id(first))?.focus();
      return;
    }
    setState("sending");
    setErrorMsg("");
    try {
      await submit({ data: payload });
      setState("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setState("error");
      setErrorMsg(msg.includes("RATE_LIMITED") ? FORM.rateLimited[lang] : FORM.failure[lang]);
    }
  }

  function reset() {
    setValues(EMPTY);
    setConsent(false);
    setInvalid([]);
    setState("idle");
    startedAt.current = Date.now();
  }

  if (state === "done") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className={cn("rounded-lg border border-border bg-card p-8 shadow-inst focus:outline-none md:p-10", className)}
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy text-ivory">
          <Check aria-hidden="true" size={18} />
        </span>
        <h3 className="inst-title mt-6 text-heading">{FORM.successTitle[lang]}</h3>
        <p className="mt-3 text-body text-muted-foreground">{FORM.successBody[lang]}</p>
        <Button type="button" variant="institutionalOutline" className="mt-8" onClick={reset}>
          {FORM.another[lang]}
        </Button>
      </div>
    );
  }

  const fieldError = (name: LeadField) =>
    invalid.includes(name)
      ? name === "email"
        ? FORM.emailError[lang]
        : name === "consent"
          ? FORM.consentError[lang]
          : FORM.fieldError[lang]
      : null;

  const inputCls =
    "mt-2 block w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-body text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 aria-[invalid=true]:border-destructive";

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={cn("rounded-lg border border-border bg-card p-6 shadow-inst md:p-9", className)}
      aria-describedby={`${id("privacy")}`}
    >
      <fieldset className="mb-6">
        <legend className="text-small font-semibold text-foreground">{FORM.interest[lang]}</legend>
        <div className="mt-3 inline-flex rounded-md border border-border bg-background p-1">
          {(["demo", "pilot"] as const).map((v) => (
            <label
              key={v}
              className={cn(
                "cursor-pointer rounded px-4 py-1.5 text-small transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                interest === v ? "bg-primary text-primary-foreground" : "text-ink hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="interest"
                value={v}
                checked={interest === v}
                onChange={() => setInterest(v)}
                className="sr-only"
              />
              {v === "demo" ? FORM.interestDemo[lang] : FORM.interestPilot[lang]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((f) => {
          const err = fieldError(f.name);
          return (
            <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
              <label htmlFor={id(f.name)} className="text-small font-medium text-foreground">
                {FORM[f.name][lang]} <span className="text-muted-foreground" aria-hidden="true">*</span>
                <span className="sr-only">({FORM.required[lang]})</span>
              </label>
              <input
                id={id(f.name)}
                name={f.name}
                type={f.type ?? "text"}
                autoComplete={f.autoComplete}
                required
                maxLength={f.name === "institution" || f.name === "email" ? 200 : 120}
                value={values[f.name]}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? id(`${f.name}-err`) : undefined}
                className={inputCls}
              />
              {err ? (
                <p id={id(`${f.name}-err`)} className="mt-1.5 text-micro text-destructive">
                  {err}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="sm:col-span-2">
          <label htmlFor={id("message")} className="text-small font-medium text-foreground">
            {FORM.message[lang]}
          </label>
          <textarea
            id={id("message")}
            name="message"
            rows={4}
            maxLength={LEAD_MESSAGE_MAX}
            placeholder={FORM.messageHint[lang]}
            value={values.message}
            onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            className={cn(inputCls, "resize-y")}
          />
        </div>

        {/* Campo trampa para bots: invisible para personas y lectores de pantalla. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={id("website")}>Website</label>
          <input
            id={id("website")}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor={id("consent")} className="flex items-start gap-3 text-small text-ink">
          <input
            id={id("consent")}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={fieldError("consent") ? true : undefined}
            aria-describedby={fieldError("consent") ? id("consent-err") : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--navy)]"
          />
          <span>{FORM.consent[lang]}</span>
        </label>
        {fieldError("consent") ? (
          <p id={id("consent-err")} className="mt-1.5 pl-7 text-micro text-destructive">
            {fieldError("consent")}
          </p>
        ) : null}
        <p id={id("privacy")} className="mt-3 pl-7 text-micro text-muted-foreground">
          {FORM.privacy[lang]}{" "}
          <Link to="/privacy" className="inst-link">
            {FORM.privacyLink[lang]}
          </Link>
          .
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" variant="institutional" size="xl" disabled={state === "sending"} className="sm:min-w-56">
          {state === "sending" ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              {FORM.sending[lang]}
            </>
          ) : (
            FORM.submit[lang]
          )}
        </Button>
        <div ref={statusRef} tabIndex={-1} aria-live="polite" className="focus:outline-none">
          {state === "error" && errorMsg ? <p className="text-small text-destructive">{errorMsg}</p> : null}
        </div>
      </div>
    </form>
  );
}
