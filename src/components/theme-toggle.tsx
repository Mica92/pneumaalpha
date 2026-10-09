import { useEffect, useState } from "react";
import { applyTheme, persistTheme, readTheme, type Theme } from "@/lib/theme";

/** Conmutador de tema claro/oscuro. Arranca en oscuro para no desajustar la hidratación. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  const toLight = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "light"}
      aria-label={toLight ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={toLight ? "Tema claro" : "Tema oscuro"}
      className={`focus-mist inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:border-bronze/50 hover:text-foreground ${className}`}
    >
      {toLight ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
