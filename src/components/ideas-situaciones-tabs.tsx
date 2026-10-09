import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

/**
 * Pestañas compartidas entre Ideas y Situaciones.
 * Ambas páginas comparten esta cabecera, de modo que Situaciones se siente
 * como una modalidad interna de la sección Ideas (sin perder sus rutas).
 */
export function IdeasSituacionesTabs({ active }: { active: "ideas" | "situaciones" }) {
  const { lang } = useI18n();
  const es = lang === "es";
  const tabs = [
    { key: "ideas", to: "/ideas", es: "Ideas", en: "Ideas" },
    { key: "situaciones", to: "/situaciones", es: "Situaciones", en: "Situations" },
  ] as const;

  return (
    <nav
      aria-label={es ? "Ideas y situaciones" : "Ideas and situations"}
      className="mt-8 inline-flex items-center rounded-full border border-border/70 p-0.5 backdrop-blur-md"
    >
      {tabs.map((t) => (
        <Link
          key={t.key}
          to={t.to}
          aria-current={active === t.key ? "page" : undefined}
          className={`focus-mist rounded-full px-4 py-1.5 text-micro transition-colors ${
            active === t.key ? "bg-bronze/15 text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {es ? t.es : t.en}
        </Link>
      ))}
    </nav>
  );
}
