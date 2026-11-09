import { createFileRoute, Outlet } from "@tanstack/react-router";
import { InstitutionalHeader } from "@/components/institutional/site-header";
import { InstitutionalFooter } from "@/components/institutional/site-footer";
import { useI18n } from "@/lib/i18n";

/** Sitio institucional público: siempre claro, separado de la aplicación (que vive en /app y sus secciones). */
export const Route = createFileRoute("/_site")({
  component: InstitutionalLayout,
});

function InstitutionalLayout() {
  const { lang } = useI18n();
  return (
    <div className="institutional flex min-h-dvh flex-col font-sans">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-small text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {lang === "es" ? "Saltar al contenido" : "Skip to content"}
      </a>
      <InstitutionalHeader />
      <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <InstitutionalFooter />
    </div>
  );
}
