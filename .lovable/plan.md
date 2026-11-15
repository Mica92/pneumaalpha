# Kionas Docente Fase 2: convertir un material en otro

## Objetivo
Un profesor parte de una guía, un mapa o un examen y lo convierte en otro tipo de material sin empezar de cero. El material nuevo queda vinculado a su origen, y el profesor puede ir de uno a otro.

## Qué verá el profesor
1. **Menú "Convertir en…"** en la pantalla de cada material:
   - **Guía:** examen, mapa conceptual, clase, banco de preguntas, debate, análisis de caso, versión resumida, adaptación a otra disciplina.
   - **Mapa:** guía hecha con los nodos seleccionados (o con todo el mapa), preguntas, examen, confrontación entre autores, clase hecha con las ramas seleccionadas.
   - **Examen:** guía de repaso, mapa de los conceptos evaluados, variantes de los ejercicios, actividad formativa de preparación.
   - Antes de generar, un cuadro corto deja ajustar el nivel, la disciplina y la cantidad de preguntas, con valores ya completados a partir del original.
2. **Panel "Materiales relacionados"** en cada material, con:
   - el original del que salió;
   - los materiales derivados de él;
   - para cada uno: tipo, fecha y enlace.
3. **Aviso de cambios en el original.** Si la guía original cambió después de crear el examen, el examen muestra "El original cambió". El profesor puede:
   - ver qué cambió;
   - generar una propuesta actualizada, que se acepta o se descarta como hoy.

   El examen nunca se sobrescribe solo.
4. **Biblioteca:**
   - una marca "derivado de…" en cada material que venga de otro;
   - un filtro para ver la familia completa de un material.

## Reglas que se mantienen
- Solo aparecen los pensadores registrados en Kionas.
- La versión para estudiantes nunca muestra las respuestas.
- Se respetan los permisos de docente y lo que es privado de cada profesor.
- La IA trabaja con el contenido ya guardado del original, en lugar de volver a investigar el concepto, para gastar menos créditos. Cada conversión cuenta una sola vez en el uso de IA.
- Los derivados nacen como borrador y quedan en el historial de versiones.

## Fuera de esta entrega
Quedan para entregas siguientes:
- el analizador de argumentos;
- los mapas avanzados (enfoque por disciplina, modo argumentativo, 10 mapas base);
- colecciones y banco de preguntas;
- el curador académico;
- la línea de tiempo y la presentación de clases.

## Detalles técnicos
- **Base de datos.** Se agrega a cada material:
  - el tipo de conversión (por ejemplo, `guide_to_exam`);
  - el número de versión del original;
  - la fecha de su última edición.

  Así se detecta cuándo el original cambió. Ya existe un vínculo con el material de origen. Es un cambio solo aditivo: ningún material existente se pierde.
- **Conversión en el servidor.** Una sola función de conversión carga el original, verifica que pertenece al profesor y comprueba su acceso con `assertTeacher`. Luego:
  - envía a la IA una versión compacta del contenido de origen (el que usan las exportaciones), recortada a lo seleccionado si corresponde;
  - devuelve el resultado ya normalizado con `normalize.ts` y `thinkers.ts`;
  - crea el material vinculado a su origen.
- **Lectura de relaciones.** Una función lista el original y los derivados de un material.
- **Diferencias.** El aviso de cambios compara el contenido actual del original con la versión que se usó al crear el derivado.
- **Pruebas:**
  - pruebas unitarias para la tabla de conversiones permitidas por tipo de material y para que la versión de estudiante no muestre respuestas en los derivados;
  - prueba de punta a punta en el navegador: guía → examen → aviso tras editar la guía; mapa → clase.
- **Registro.** Se anota en `AGENTS.md` la regla: los derivados guardan el vínculo con su origen y nunca se sobrescriben automáticamente.
