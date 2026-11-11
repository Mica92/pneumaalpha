import { createFileRoute, redirect } from "@tanstack/react-router";

/** Dirección anterior del inicio de la app: los enlaces e instalaciones antiguas llegan al inicio actual. */
export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true, statusCode: 301 });
  },
});
