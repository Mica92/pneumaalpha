/**
 * Registro de procedencia de las imágenes editoriales (§6.4).
 *
 * Cada recurso debe documentar: artículo, autor/fotógrafo, banco, URL de origen,
 * licencia y fecha de incorporación. Solo fotografías reales con licencia
 * verificable (Unsplash / Pexels / Pixabay u otro banco con autorización).
 * Prohibido: imágenes generadas por IA o de procedencia dudosa.
 *
 * Formato de cada entrada (clave = `${categoria}/${slug}`):
 * {
 *   src: "/images/editorial/<archivo>.jpg",
 *   alt: { es: "...", en: "..." },
 *   author: "Nombre del fotógrafo",
 *   source: "Unsplash",
 *   license: "Unsplash License",
 *   pageUrl: "https://unsplash.com/photos/<slug>",
 *   addedAt: "2026-XX-XX",
 * }
 */
import type { EditorialImage } from "@/lib/editorial";

export const EDITORIAL_IMAGES: Record<string, EditorialImage> = {
  // Pendiente de incorporar fotografías verificadas. Mientras tanto, la
  // cabecera usa una composición atmosférica tipográfica (sin imagen externa).
};

export function editorialImageFor(category: string, slug: string): EditorialImage | undefined {
  return EDITORIAL_IMAGES[`${category}/${slug}`];
}
