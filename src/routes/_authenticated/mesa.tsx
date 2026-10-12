import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Mesa redonda se retira como experiencia independiente.
 * /mesa redirige a Comparar perspectivas, que reutiliza las mismas
 * funciones de generación. Se conservan los parámetros compatibles qid y seats.
 */
export const Route = createFileRoute("/_authenticated/mesa")({
  validateSearch: (search: Record<string, unknown>): { qid?: string; seats?: string } => ({
    qid: typeof search.qid === "string" ? search.qid : undefined,
    seats: typeof search.seats === "string" ? search.seats : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/comparar",
      search: {
        ...(search.qid ? { qid: search.qid } : {}),
        ...(search.seats ? { seats: search.seats } : {}),
      },
      statusCode: 301,
    });
  },
});
