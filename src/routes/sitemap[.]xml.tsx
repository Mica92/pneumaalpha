import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PHILOSOPHER_LIST } from "@/lib/philosophers";
import { SITUATIONS } from "@/lib/situations";
import { SITE_URL } from "@/lib/site";
import { EDITORIAL_ARTICLES } from "@/lib/editorial";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          "/",
          "/umbral",
          "/filosofos",
          "/ideas",
          "/rutas",
          "/comparar",
          "/recorrido",
          "/buscar",
          "/oraculo",
          "/reporte",
          "/conocimiento",
          "/analisis",
          "/editorial",
          "/editorial/podcast",
          "/mesa",
          "/modo-socrates",
          "/biblioteca",
          "/nosotros",
          "/privacy",
          "/terminos",
          "/uso-de-ia",
          "/contacto",
          "/situaciones",
          ...SITUATIONS.map((s) => `/situaciones/${s.id}`),
          ...EDITORIAL_ARTICLES.map((a) => `/editorial/${a.category}/${a.slug}`),
          ...PHILOSOPHER_LIST.map((p) => `/${p.id}`),
        ];
        const urls = paths.map(
          (path) =>
            `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`,
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
