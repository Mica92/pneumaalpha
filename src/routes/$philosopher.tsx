import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ChatWindow } from "@/components/chat-window";
import { PHILOSOPHERS, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";

export const Route = createFileRoute("/$philosopher")({
  component: PhilosopherChat,
  head: ({ params }) => {
    const id = params.philosopher as string;
    if (!isPhilosopherId(id)) {
      return { meta: [{ title: "Pneuma" }] };
    }
    const p = PHILOSOPHERS[id as PhilosopherId];
    const title = `Conversa con ${p.name} — Pneuma`;
    const description = `${p.blurb.es} Diálogo bilingüe (ES / EN) con ${p.name}, reconstruido como conciencia viva.`;
    const url = `https://pneumaalpha.lovable.app/${id}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: p.name,
            description: p.blurb.en,
            url,
          }),
        },
      ],
    };
  },
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
