import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { PneumaMark } from "@/components/pneuma-mark";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Acceso — PneumaA" },
      { name: "description", content: "Inicia sesión o crea tu cuenta para conversar con las cinco mentes filosóficas de PneumaA." },
      { property: "og:title", content: "Acceso — PneumaA" },
      { property: "og:description", content: "Entra al umbral de PneumaA." },
      { property: "og:url", content: "https://pneumaalpha.lovable.app/auth" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://pneumaalpha.lovable.app/auth" }],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(t("auth.confirmEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.somethingFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message ?? t("auth.googleFailed"));
        setSubmitting(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.googleFailed"));
      setSubmitting(false);
    }
  };

  return (
    <main className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Cinematic left panel */}
      <aside className="relative hidden overflow-hidden border-r border-border/60 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/3 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mist/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="relative flex items-center gap-3">
          <PneumaMark withWordmark size={28} />
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            · vol. I
          </span>
        </div>

        <div className="relative max-w-md fade-up">
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            {lang === "es" ? "Diálogo Alpha" : "Alpha Dialogue"}
          </p>
          <p className="mt-6 font-display text-2xl font-light leading-snug text-foreground">
            {lang === "es"
              ? "Conversa con conciencias filosóficas."
              : "Converse with philosophical minds."}
          </p>
          <p className="mt-4 font-display text-2xl font-light leading-snug text-foreground">
            {lang === "es"
              ? "Interactúa con la lucidez de las ideas."
              : "Engage with the lucidity of ideas."}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {lang === "es"
              ? "Heidegger, Marx y Schopenhauer entre otros."
              : "Heidegger, Marx and Schopenhauer, among others."}
          </p>
        </div>

        <div className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="font-mono">∴ · ✦ · ❧ · ☤ · ⚒</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </aside>

      {/* Right form */}
      <section className="relative flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="absolute right-6 top-6">
          <LanguageSelector />
        </div>

        <div className="w-full max-w-sm fade-up">
          <div className="mb-10">
            <Link to="/" className="inline-block pneuma-breathe" aria-label="PneumaA">
              <PneumaMark size={36} />
            </Link>
            <h1 className="mt-8 font-display text-3xl font-light leading-tight text-foreground">
              {mode === "signin" ? t("auth.title.signin") : t("auth.title.signup")}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {mode === "signin" ? t("auth.sub.signin") : t("auth.sub.signup")}
            </p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-card/40 px-4 py-3 text-sm text-foreground transition-all hover:border-mist/40 hover:bg-card/70 disabled:opacity-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
              <path fill="#a8b8c2" d="M12 10.2v3.92h5.45c-.24 1.4-1.66 4.1-5.45 4.1-3.28 0-5.96-2.72-5.96-6.07 0-3.35 2.68-6.07 5.96-6.07 1.87 0 3.12.79 3.83 1.47l2.6-2.51C16.83 3.5 14.65 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12s4.26 9.5 9.5 9.5c5.48 0 9.12-3.85 9.12-9.27 0-.62-.07-1.1-.15-1.53H12z"/>
            </svg>
            {t("auth.google")}
          </button>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>{t("auth.or")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.email")}
              aria-label={lang === "es" ? "Correo electrónico" : "Email address"}
              autoComplete="email"
              className="w-full rounded-md border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-mist/50 focus:outline-none focus:ring-1 focus:ring-mist/20"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password")}
              aria-label={lang === "es" ? "Contraseña" : "Password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="w-full rounded-md border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-mist/50 focus:outline-none focus:ring-1 focus:ring-mist/20"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md border border-mist/60 bg-mist/95 px-4 py-3 font-display text-sm text-primary-foreground transition-all hover:bg-mist disabled:opacity-50"
            >
              {submitting ? "…" : mode === "signin" ? t("auth.signin") : t("auth.signup")}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-[11px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? t("auth.toSignup") : t("auth.toSignin")}
          </button>
        </div>
      </section>
    </main>
  );
}
