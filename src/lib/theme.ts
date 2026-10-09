/** Tema de la interfaz. Oscuro por defecto; el claro es opt-in y se recuerda. */
import { useEffect } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "pneuma.theme";

export function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Aplica la clase `light` en <html>. El oscuro es el estado por defecto del CSS. */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
}

export function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

/** Aplica el tema recordado al montar el layout raíz (en cada carga de página). */
export function useThemeBoot() {
  useEffect(() => {
    applyTheme(readTheme());
  }, []);
}
