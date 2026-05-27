import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/hooks/use-auth";
import { I18nProvider } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl text-mist pneuma-breathe">∴</p>
        <h1 className="mt-8 font-display text-2xl font-light text-foreground">Silence — this path leads nowhere</h1>
        <p className="mt-3 text-sm text-muted-foreground">El camino se interrumpe en la niebla.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-md border border-border bg-card/60 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-foreground transition-colors hover:border-mist/40 hover:bg-card"
        >
          ← Zito
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-light text-foreground">The thought has been interrupted</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-8 inline-flex items-center justify-center rounded-md border border-mist/40 bg-mist/95 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Resume
        </button>

      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Zito — conversaciones con conciencias filosóficas reconstruidas" },
      { name: "description", content: "Zito: conversa libremente, en español o en inglés, con conciencias filosóficas reconstruidas — Heidegger, Schopenhauer, James, Nietzsche, Marx." },
      { property: "og:title", content: "Zito — conversaciones con conciencias filosóficas reconstruidas" },
      { property: "og:description", content: "Zito: conversa libremente, en español o en inglés, con conciencias filosóficas reconstruidas — Heidegger, Schopenhauer, James, Nietzsche, Marx." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

      { name: "twitter:title", content: "Zito — conversaciones con conciencias filosóficas reconstruidas" },
      { name: "twitter:description", content: "Zito: conversa libremente, en español o en inglés, con conciencias filosóficas reconstruidas — Heidegger, Schopenhauer, James, Nietzsche, Marx." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6a615d32-8995-4ede-85b3-608b382a2e18" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6a615d32-8995-4ede-85b3-608b382a2e18" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;500;600&family=Manrope:wght@300;400;500;600&display=swap" },

    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <div className="relative z-10">
            <Outlet />
          </div>
          <Toaster theme="dark" position="top-center" />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>

  );
}
