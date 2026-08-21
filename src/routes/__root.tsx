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
import { GreekGlyph } from "@/components/greek-glyph";
import { NeuralBackground } from "@/components/neural-background";

function NotFoundComponent() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <GreekGlyph className="font-serif text-7xl text-bronze pneuma-breathe" />
        <h1 className="mt-8 font-serif text-3xl font-light text-foreground">
          Este camino no lleva a ninguna parte
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">La página que buscas no existe. Vuelve al principio y empieza una conversación.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-md border border-border bg-card/60 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-foreground transition-colors hover:border-primary/50 hover:bg-card"
        >
          ← PneumAlpha
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
        <h1 className="font-serif text-2xl font-light text-foreground">
          Algo interrumpió la conversación
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-8 inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Reintentar
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
      { title: "PneumAlpha — conversaciones con conciencias filosóficas reconstruidas" },
      {
        name: "description",
        content:
          "PneumAlpha: conversa libremente, en español o en inglés, con conciencias filosóficas reconstruidas — Heidegger, Schopenhauer, James, Nietzsche, Marx.",
      },
      {
        property: "og:title",
        content: "PneumAlpha — conversaciones con conciencias filosóficas reconstruidas",
      },
      {
        property: "og:description",
        content:
          "PneumAlpha: conversa libremente, en español o en inglés, con conciencias filosóficas reconstruidas — Heidegger, Schopenhauer, James, Nietzsche, Marx.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },

      {
        name: "twitter:title",
        content: "PneumAlpha — conversaciones con conciencias filosóficas reconstruidas",
      },
      {
        name: "twitter:description",
        content:
          "PneumAlpha: conversa libremente, en español o en inglés, con conciencias filosóficas reconstruidas — Heidegger, Schopenhauer, James, Nietzsche, Marx.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6a615d32-8995-4ede-85b3-608b382a2e18",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6a615d32-8995-4ede-85b3-608b382a2e18",
      },
      { name: "theme-color", content: "#0B0B0D" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "PneumAlpha" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <NeuralBackground />
          <div className="relative z-10">
            <Outlet />
          </div>
          <Toaster theme="dark" position="top-center" />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
