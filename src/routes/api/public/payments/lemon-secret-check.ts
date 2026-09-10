import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payments/lemon-secret-check")({
  server: {
    handlers: {
      GET: async () => {
        const secret = process.env["LEMON_SQUEEZY_WEBHOOK_SECRET"];
        return Response.json({
          configured: Boolean(secret),
          length: secret?.length ?? 0,
        });
      },
    },
  },
});
