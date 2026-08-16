import { createFileRoute } from "@tanstack/react-router";

/**
 * Text-to-speech for the podcast player.
 * Returns a complete MP3 for one chunk of the script so the client can queue playback.
 */
export const Route = createFileRoute("/api/podcast/speech")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Missing AI key", { status: 500 });

        let body: { text?: unknown; voice?: unknown };
        try {
          body = (await request.json()) as { text?: unknown; voice?: unknown };
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (text.length < 2 || text.length > 4000) {
          return new Response("Invalid text", { status: 400 });
        }
        const allowedVoices = ["ash", "ballad", "sage", "coral", "alloy"];
        const voice =
          typeof body.voice === "string" && allowedVoices.includes(body.voice)
            ? body.voice
            : "ash";

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input: text,
            voice,
            response_format: "mp3",
            speed: 0.98,
            instructions:
              "Narra como un locutor humano real de un podcast de filosofía: voz cálida y grave, ritmo pausado y natural, pausas reales entre ideas, entonación conversacional y no publicitaria. Nada de énfasis artificial ni tono de anuncio.",
          }),
        });

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          console.error(`[podcast/speech] TTS failed [${upstream.status}]: ${detail}`);
          return new Response(detail || "TTS failed", { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
