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
import { TintProvider } from "@/lib/tint";
import { SITE_URL, SITE_NAME } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <GreekGlyph className="font-serif text-7xl text-bronze pneuma-breathe" />
        <h1 className="mt-8 font-serif text-heading font-light text-foreground">
          Este camino no lleva a ninguna parte
        </h1>
        <p className="mt-3 text-small text-muted-foreground">La página que buscas no existe. Vuelve al principio y empieza una conversación.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-md border border-border bg-card/60 px-6 py-2.5 text-micro uppercase tracking-[0.25em] text-foreground transition-colors hover:border-primary/50 hover:bg-card"
        >
          ← Pneum
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
        <h1 className="font-serif text-subtitle font-light text-foreground">
          Algo interrumpió la conversación
        </h1>
        <p className="mt-3 text-small text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-8 inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-2.5 text-micro uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ match }) => {
    const path = match?.pathname ?? "/";
    const esUrl = `${SITE_URL}${path}?lang=es`;
    const enUrl = `${SITE_URL}${path}?lang=en`;
    const xDefault = `${SITE_URL}${path}`;
    return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "aLY6HPxqnRO8gSSwhvgijFO32npagWxoIrpwHcE6YEU" },
      // title / description / og:title / og:description viven en cada ruta hoja para evitar duplicados.
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0B0B0D" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Pneum" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "alternate", hreflang: "es", href: esUrl },
      { rel: "alternate", hreflang: "en", href: enUrl },
      { rel: "alternate", hreflang: "x-default", href: xDefault },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: ["es", "en"],
          description:
            "Conversaciones filosóficas bilingües (ES/EN) con conciencias reconstruidas: filosofía aplicada para pensar, decidir y vivir mejor.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/buscar?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  };
},

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
          <TintProvider>
            <NeuralBackground />
            <div className="relative z-10">
              <Outlet />
            </div>
            <Toaster theme="dark" position="top-center" />
          </TintProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
