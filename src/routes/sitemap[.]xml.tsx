import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";

const BASE_URL = "https://pneumaalpha.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          "/",
          "/umbral",
          "/oraculo",
          "/reporte",
          "/conocimiento",
          "/analisis",
          "/podcast",
          "/mesa",
          "/socrates",
          "/biblioteca",
          "/privacy",
          ...PHILOSOPHER_LIST.map((p) => `/${p.id}`),
        ];
        const urls = paths.map(
          (path) => `  <url>\n    <loc>${BASE_URL}${path}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
