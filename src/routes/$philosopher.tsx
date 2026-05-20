import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ChatWindow } from "@/components/chat-window";
import { isPhilosopherId } from "@/lib/philosophers";

export const Route = createFileRoute("/$philosopher")({
  component: PhilosopherChat,
});

function PhilosopherChat() {
  const { philosopher } = useParams({ from: "/$philosopher" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!isPhilosopherId(philosopher)) navigate({ to: "/" });
  }, [philosopher, navigate]);

  if (loading || !user || !isPhilosopherId(philosopher)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-serif text-3xl text-primary ember-breathe">∴</p>
      </main>
    );
  }

  return (
    <ChatWindow
      userId={user.id}
      philosopher={philosopher}
      onSignOut={async () => {
        await supabase.auth.signOut();
        navigate({ to: "/auth" });
      }}
    />
  );
}
