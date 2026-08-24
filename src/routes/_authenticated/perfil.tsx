import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Tu perfil — PneumAlpha" },
      {
        name: "description",
        content:
          "Tu cuenta en PneumAlpha: inicia sesión con Google para conservar tus conversaciones, tu mapa filosófico y tu recorrido en cualquier dispositivo.",
      },
      { property: "og:title", content: "Tu perfil — PneumAlpha" },
      {
        property: "og:description",
        content: "Conserva tus conversaciones y tu mapa filosófico con una cuenta de Google.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ProfilePage() {
  const { lang } = useI18n();
  const es = lang === "es";
  const { user } = useAuth();
  const navigate = useNavigate();

  const signedIn = Boolean(user && !user.is_anonymous);
  const meta = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
  const name = meta.full_name ?? meta.name ?? (es ? "Sin nombre" : "No name");
  const avatar = meta.avatar_url ?? meta.picture ?? null;
  const email = user?.email ?? null;

  async function signIn() {
    await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
        <p className="label">{es ? "Tu cuenta" : "Your account"}</p>
        <h1 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl">
          {es ? "Perfil" : "Profile"}
        </h1>

        {signedIn ? (
          <>
            <div className="card-editorial mt-10 flex items-center gap-5 p-6">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-bronze/20 font-serif text-subtitle text-bronze">
                  {name.slice(0, 1)}
                </span>
              )}
              <div>
                <p className="font-serif text-subtitle text-foreground">{name}</p>
                {email && <p className="text-small text-muted-foreground">{email}</p>}
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link to="/mi-mapa" className="card-editorial p-5 transition-colors hover:bg-card/70">
                <p className="label">{es ? "Cartografía" : "Cartography"}</p>
                <p className="mt-2 font-serif text-subtitle text-foreground">
                  {es ? "Tu mapa filosófico" : "Your philosophical map"}
                </p>
              </Link>
              <Link
                to="/recorrido"
                className="card-editorial p-5 transition-colors hover:bg-card/70"
              >
                <p className="label">{es ? "Diario" : "Journal"}</p>
                <p className="mt-2 font-serif text-subtitle text-foreground">
                  {es ? "Mi recorrido" : "My journey"}
                </p>
              </Link>
            </div>

            <button type="button" onClick={signOut} className="btn-ghost-gold mt-10">
              {es ? "Cerrar sesión" : "Sign out"}
            </button>
          </>
        ) : (
          <>
            <p className="mt-6 max-w-xl text-small leading-relaxed text-muted-foreground">
              {es
                ? "Puedes seguir usando PneumAlpha sin cuenta. Si entras con Google, tus conversaciones, tu mapa y tu recorrido te acompañan en cualquier dispositivo."
                : "You can keep using PneumAlpha without an account. Sign in with Google and your conversations, map and journey follow you on any device."}
            </p>
            <button type="button" onClick={signIn} className="btn-gold mt-8">
              {es ? "Entrar con Google" : "Sign in with Google"}
            </button>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
