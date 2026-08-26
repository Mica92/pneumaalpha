# Filtros como panel desplegable + eje político

## Qué cambia en la pantalla de Filósofos

1. **Un solo botón "Filtros"** junto al buscador. Al pulsarlo se abre un panel desplegable con todos los grupos (Ordenar, Ámbito, Movimiento, Época, Nivel y el nuevo eje Político); al pulsarlo otra vez se cierra. El botón muestra un contador con los filtros activos y el resumen de resultados y "Limpiar filtros" quedan siempre visibles fuera del panel.
2. **Posición política**: dentro del ámbito "Política" aparece un nuevo grupo con tres opciones — Izquierda, Centro, Derecha — que filtra solo entre los pensadores con carga política. Este grupo se muestra siempre; los pensadores sin posición política definida quedan fuera al aplicar el filtro.
3. **Coherencia con el fondo neuronal**: el panel se ve como una capa translúcida sobre la red — vidrio oscuro con desenfoque, borde de trazo fino en bronce, y los chips activos con un halo suave del color del tinte dinámico. Al abrir/cerrar hay un despliegue vertical corto y suave, en la línea del resto de la app.

## Clasificación política propuesta

- **Izquierda**: Marx, Bakunin, Stirner (antiautoritario), Negri & Hardt, Simone Weil, Rousseau, Kusch, al-Jabri.
- **Centro**: Mill, Isaiah Berlin, Arendt, Hannah/liberales reformistas, Bentham, Wollstonecraft, Astell, Camus.
- **Derecha**: Burke, Spengler, Jünger, Evola, Ayn Rand, De Maistre-adyacentes (Boström), conservadurismo religioso (Aquino, Hildebrand).

Los pensadores sin dimensión política clara (místicos, fenomenólogos puros, orientales) quedan sin etiqueta. Esta asignación es una lectura orientativa y editable.

## Detalle técnico

- `src/lib/discovery.ts`: añadir `PoliticsId = "left" | "center" | "right"`, `POLITICS_LABELS`, y un campo opcional `politics?: PoliticsId` en `Facet`, completado en `FACETS` solo para los pensadores con posición reconocible.
- `src/routes/_authenticated/filosofos.index.tsx`: extraer los `FilterGroup` actuales a un panel colapsable controlado por estado local (`open`), con `aria-expanded`/`aria-controls` en el botón y cierre con `Escape`. Añadir el grupo político al filtro y a la búsqueda por texto.
- Estilo del panel con tokens existentes (`card-editorial`, `border-border`, `bronze`, `backdrop-blur`) sin colores fijos; sin cambios de lógica de datos ni de backend.
