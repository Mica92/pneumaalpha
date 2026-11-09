import appEs from "@/assets/product/app-es.jpg";
import appEn from "@/assets/product/app-en.jpg";
import explorarEs from "@/assets/product/explorar-es.jpg";
import explorarEn from "@/assets/product/explorar-en.jpg";
import compararEs from "@/assets/product/comparar-es.jpg";
import compararEn from "@/assets/product/comparar-en.jpg";
import ideasEs from "@/assets/product/ideas-es.jpg";
import ideasEn from "@/assets/product/ideas-en.jpg";
import conocimientoEs from "@/assets/product/conocimiento-es.jpg";
import conocimientoEn from "@/assets/product/conocimiento-en.jpg";
import editorialEs from "@/assets/product/editorial-es.jpg";
import editorialEn from "@/assets/product/editorial-en.jpg";
import dialogosEs from "@/assets/product/dialogos-es.jpg";
import dialogosEn from "@/assets/product/dialogos-en.jpg";

/** Capturas reales de la aplicación (1440×900), en ambos idiomas. */
export const PRODUCT_SHOTS = {
  app: { es: appEs, en: appEn, path: "/app" },
  explorar: { es: explorarEs, en: explorarEn, path: "/explorar" },
  comparar: { es: compararEs, en: compararEn, path: "/comparar" },
  ideas: { es: ideasEs, en: ideasEn, path: "/ideas" },
  conocimiento: { es: conocimientoEs, en: conocimientoEn, path: "/conocimiento" },
  editorial: { es: editorialEs, en: editorialEn, path: "/editorial" },
  dialogos: { es: dialogosEs, en: dialogosEn, path: "/dialogos" },
} as const;

export type ShotKey = keyof typeof PRODUCT_SHOTS;
