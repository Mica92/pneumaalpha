import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Ruta contenedora de Diálogos filosóficos.
 * Renderiza la página índice (catálogo) o el detalle de cada corriente
 * a través del <Outlet />. Sin este <Outlet />, /dialogos/$id no mostraba
 * su pantalla (solo cambiaba la URL).
 */
export const Route = createFileRoute("/_authenticated/dialogos")({
  component: DialogosLayout,
});

function DialogosLayout() {
  return <Outlet />;
}
