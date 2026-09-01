import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { GreekGlyph } from "@/components/greek-glyph";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated")({
  // SSR activo: el contenido debe existir en el HTML inicial para que los
  // buscadores lo indexen. La sesión anónima se establece luego en el cliente.
  ssr: true,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (user) track("visit");
  }, [user?.id]);

  // En el servidor y mientras se establece la sesión, renderizamos el contenido
  // directamente; el spinner solo aparece si tras hidratar no hay sesión.
  if (hydrated && !loading && !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <GreekGlyph className="font-display text-4xl text-mist pneuma-breathe" />
      </div>
    );
  }

  return <Outlet />;
}
