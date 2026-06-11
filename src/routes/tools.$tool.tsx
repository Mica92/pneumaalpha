import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ToolChatWindow } from "@/components/tool-chat-window";
import { GreekGlyph } from "@/components/greek-glyph";
import { TOOL_MAP, isToolId, type ToolId } from "@/lib/tools";

export const Route = createFileRoute("/tools/$tool")({
  component: ToolChatRoute,
  head: ({ params }) => {
    const id = params.tool as string;
    if (!isToolId(id)) return { meta: [{ title: "PneumaA — Kit" }] };
    const tool = TOOL_MAP[id as ToolId];
    const title = `${tool.name.es} — Kit · PneumaA`;
    const description = `${tool.tagline.es}. Conversación guiada por la herramienta filosófica seleccionada.`;
    const url = `https://pneumaalpha.lovable.app/tools/${id}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function ToolChatRoute() {
  const { tool } = useParams({ from: "/tools/$tool" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!isToolId(tool)) navigate({ to: "/" });
  }, [tool, navigate]);

  if (loading || !user || !isToolId(tool)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <GreekGlyph className="font-display text-3xl text-mist pneuma-breathe" />
      </main>
    );
  }

  return (
    <ToolChatWindow
      initialTool={tool}
      onSignOut={async () => {
        await supabase.auth.signOut();
        navigate({ to: "/auth" });
      }}
    />
  );
}
