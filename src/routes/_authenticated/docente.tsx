import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/site-nav";
import { lovable } from "@/integrations/lovable";
import { requestDocenteAccess } from "@/lib/docente/docente.functions";
import { errorText, useDocenteAccess, useTr } from "@/lib/docente/use-docente";
import { Field, inputCls, DisciplineInput } from "@/components/docente/config-fields";
import { useI18n } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/docente")({
  head: () => ({
    meta: [
      { title: `Kionas Docente — espacio de investigación y enseñanza | ${SITE_NAME}` },
      {
        name: "description",
        content:
          "Kionas Docente: crea guías académicas, exámenes con pauta, mapas conceptuales y clases a partir de un concepto, adaptados a tu disciplina.",
      },
      { property: "og:title", content: "Kionas Docente" },
      {
        property: "og:description",
        content: "Guías, exámenes, mapas y clases para profesores universitarios, con filosofía aplicada e IA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DocenteGate,
});

function DocenteGate() {
  const tr = useTr();
  const { data, isLoading, error, refetch } = useDocenteAccess();

  if (isLoading || (!data && !error)) {
    return (
      <GateFrame>
        <p role="status" className="text-small text-muted-foreground">
          {tr("Comprobando tu acceso…", "Checking your access…")}
        </p>
      </GateFrame>
    );
  }
  if (error || !data) {
    return (
      <GateFrame>
        <p className="text-body text-foreground">{tr("No pudimos comprobar tu acceso.", "We could not check your access.")}</p>
        <button type="button" onClick={() => refetch()} className="btn-ghost-gold focus-mist mt-4 px-4 py-2 text-small">
          {tr("Reintentar", "Retry")}
        </button>
      </GateFrame>
    );
  }
  if (data.canUse) return <Outlet />;
  if (!data.signedIn) return <SignInPanel />;
  if (data.status === "pending") {
    return (
      <GateFrame>
        <p className="label">{tr("Solicitud enviada", "Request sent")}</p>
        <h1 className="mt-3 font-serif text-title font-light text-foreground">{tr("Tu acceso está en revisión", "Your access is under review")}</h1>
        <p className="mt-4 max-w-xl text-lead text-muted-foreground">
          {tr(
            "Recibimos tu solicitud para Kionas Docente. Cuando el administrador la apruebe, esta página se abrirá con tu espacio de trabajo.",
            "We received your request for Kionas Docente. Once the administrator approves it, this page will open your workspace.",
          )}
        </p>
        <button type="button" onClick={() => refetch()} className="btn-ghost-gold focus-mist mt-6 px-4 py-2 text-small">
          {tr("Comprobar de nuevo", "Check again")}
        </button>
      </GateFrame>
    );
  }
  if (data.status === "revoked") {
    return (
      <GateFrame>
        <h1 className="font-serif text-title font-light text-foreground">{tr("Acceso desactivado", "Access disabled")}</h1>
        <p className="mt-4 max-w-xl text-lead text-muted-foreground">
          {tr("Tu acceso a Kionas Docente fue desactivado por el administrador.", "Your access to Kionas Docente was disabled by the administrator.")}
        </p>
      </GateFrame>
    );
  }
  return <RequestForm rejected={data.status === "rejected"} initial={data.request} />;
}

function GateFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">{children}</main>
    </>
  );
}

function SignInPanel() {
  const tr = useTr();
  return (
    <GateFrame>
      <p className="label">Kionas Docente</p>
      <h1 className="mt-3 font-serif text-display font-light text-foreground">
        {tr("Tu espacio de investigación, creación y enseñanza.", "Your space for research, creation and teaching.")}
      </h1>
      <p className="mt-5 max-w-xl text-lead text-muted-foreground">
        {tr(
          "Kionas Docente es para profesores aprobados. Entra con tu cuenta de Google para solicitar acceso.",
          "Kionas Docente is for approved teachers. Sign in with your Google account to request access.",
        )}
      </p>
      <button
        type="button"
        onClick={() =>
          lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}${window.location.pathname}` })
        }
        className="btn-gold focus-mist mt-8 px-5 py-2.5 text-small"
      >
        {tr("Entrar con Google", "Sign in with Google")}
      </button>
    </GateFrame>
  );
}

function RequestForm({
  rejected,
  initial,
}: {
  rejected: boolean;
  initial: { fullName: string; institution: string; discipline: string; message: string } | null;
}) {
  const tr = useTr();
  const { lang } = useI18n();
  const qc = useQueryClient();
  const send = useServerFn(requestDocenteAccess);
  const [form, setForm] = useState({
    fullName: initial?.fullName ?? "",
    institution: initial?.institution ?? "",
    discipline: initial?.discipline ?? "",
    message: initial?.message ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await send({ data: form });
      await qc.invalidateQueries({ queryKey: ["docente-access"] });
    } catch (error) {
      setErr(errorText(error, lang));
    } finally {
      setBusy(false);
    }
  }

  return (
    <GateFrame>
      <p className="label">Kionas Docente</p>
      <h1 className="mt-3 font-serif text-title font-light text-foreground">{tr("Solicita acceso docente", "Request teacher access")}</h1>
      <p className="mt-4 max-w-xl text-lead text-muted-foreground">
        {rejected
          ? tr(
              "Tu solicitud anterior no fue aprobada. Puedes corregir los datos y enviarla otra vez.",
              "Your previous request was not approved. You can correct the details and send it again.",
            )
          : tr(
              "Cuéntanos dónde enseñas. El administrador revisa cada solicitud antes de habilitar el espacio.",
              "Tell us where you teach. The administrator reviews each request before enabling the workspace.",
            )}
      </p>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <Field label={tr("Nombre completo", "Full name")} htmlFor="rq-name">
          <input id="rq-name" required minLength={2} maxLength={120} className={inputCls} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </Field>
        <Field label={tr("Institución", "Institution")} htmlFor="rq-inst">
          <input id="rq-inst" required minLength={2} maxLength={160} className={inputCls} value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
        </Field>
        <Field label={tr("Disciplina que enseñas", "Discipline you teach")} htmlFor="rq-disc">
          <DisciplineInput id="rq-disc" value={form.discipline} onChange={(v) => setForm({ ...form, discipline: v })} />
        </Field>
        <Field label={tr("Mensaje (opcional)", "Message (optional)")} htmlFor="rq-msg">
          <textarea id="rq-msg" maxLength={1000} className={`${inputCls} min-h-24`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </Field>
        {err && (
          <p role="alert" className="text-small text-destructive">
            {err}
          </p>
        )}
        <div>
          <button type="submit" disabled={busy} className="btn-gold focus-mist px-5 py-2.5 text-small disabled:opacity-60">
            {busy ? tr("Enviando…", "Sending…") : tr("Enviar solicitud", "Send request")}
          </button>
        </div>
      </form>
    </GateFrame>
  );
}
