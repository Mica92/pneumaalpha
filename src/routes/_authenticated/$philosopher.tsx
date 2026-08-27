import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ChatWindow } from "@/components/chat-window";
import { GreekGlyph } from "@/components/greek-glyph";
import { PHILOSOPHERS, isPhilosopherId, type PhilosopherId } from "@/lib/philosophers";
import { entityForChat } from "@/lib/atlas";
import { useJourney } from "@/lib/atlas/use-journey";
import { SITE_URL } from "@/lib/site";


export const Route = createFileRoute("/_authenticated/$philosopher")({
  component: PhilosopherChat,
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q ? { q: search.q } : {},
  head: ({ params }) => {
    const id = params.philosopher as string;
    if (!isPhilosopherId(id)) {
      return { meta: [{ title: "Pneuma Alpha" }] };
    }
    const p = PHILOSOPHERS[id as PhilosopherId];
    const title = `Conversa con ${p.name} — Pneuma Alpha`;
    const description = `${p.blurb.es} Diálogo bilingüe (ES / EN) con ${p.name}, reconstruido como conciencia viva.`;
    const url = `${SITE_URL}/${id}`;
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
  const { philosopher } = useParams({ from: "/_authenticated/$philosopher" });
  const { q } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { add } = useJourney();

  useEffect(() => {
    if (!isPhilosopherId(philosopher)) navigate({ to: "/" });
  }, [philosopher, navigate]);

  // Cada conversación deja huella en el mapa personal.
  useEffect(() => {
    if (!user || !isPhilosopherId(philosopher)) return;
    const entity = entityForChat(philosopher);
    if (!entity) return;
    add(entity.id, entity.kind, `Conversaste con ${PHILOSOPHERS[philosopher].name}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [philosopher, user?.id]);


  if (loading || !user || !isPhilosopherId(philosopher)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <GreekGlyph className="font-serif text-3xl text-primary ember-breathe" />
      </main>
    );
  }

  return (
    <ChatWindow
      userId={user.id}
      philosopher={philosopher}
      initialPrompt={q}
      onSignOut={() => navigate({ to: "/" })}
    />
  );
}
