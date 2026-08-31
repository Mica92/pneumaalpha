import { useEffect } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { GreekGlyph } from "@/components/greek-glyph";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) track("visit");
  }, [user?.id]);

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <GreekGlyph className="font-display text-4xl text-mist pneuma-breathe" />
      </div>
    );
  }

  return <Outlet />;
}
