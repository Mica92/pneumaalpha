# Filtros en Filósofos, conteo real y sugerencias positivas

## 1. Filtros en la sección Filósofos

La página `/filosofos` hoy sólo tiene búsqueda por texto y las seis "puertas de entrada". Se añade una barra de orden y filtros con estas dimensiones:

- **Ordenar por**: Alfabético (A–Z / Z–A), Época (antiguos → contemporáneos), Nivel (principiantes primero / avanzados primero).
- **Filtrar por familia**: Política, Religión y teología, Movimientos filosóficos, Ideas y temas, Época, Nivel (principiante / intermedio / avanzado).

Cada filtro es un grupo de chips en el mismo estilo bronce que ya existe; se combinan con la búsqueda de texto y con las categorías actuales. Un botón "Limpiar" restaura todo. El resultado muestra el número de mentes encontradas.

## 2. Conteo de filósofos correcto

Hoy varios textos dicen "Diecinueve" cuando el registro real es mayor. Se reemplazan por el número calculado del registro para que nunca vuelva a quedar desactualizado:

- Título y descripción de `/filosofos` ("Diecinueve maneras de pensar tu vida" y su meta description).
- Meta description del homepage ("Diecinueve mentes…").
- Revisión de cualquier otro texto con número fijo de mentes en home, umbral y metadatos.

## 3. Sugerencias del homepage más positivas

Las cuatro sugerencias bajo "¿Qué pregunta llevas contigo hoy?" hoy son negativas ("No sé qué hacer con mi vida", "Tengo miedo de fracasar"…). Se sustituyen por formulaciones propositivas, en español e inglés, por ejemplo:

- Quiero encontrar mi vocación.
- Quiero vivir con más calma y claridad.
- Quiero fortalecer mis vínculos.
- Quiero decidir con más valentía.
- Quiero aprender a pensar mejor.
- Quiero darle sentido a mi trabajo.

Cada una mantiene su terna de filósofos recomendados para que el emparejamiento siga funcionando. También se cambia el placeholder del campo a una frase propositiva.

## Detalles técnicos

- `src/lib/discovery.ts`: nuevo bloque de metadatos por filósofo (`familias`, `época`, `nivel`) derivado de los datos ya existentes en `portraits.ts` (años) y de la clasificación temática; reescritura de `REAL_PROBLEMS` con textos positivos.
- `src/routes/_authenticated/filosofos.index.tsx`: estado de orden y filtros, chips nuevos, lógica de filtrado combinada con la búsqueda actual; textos con `PHILOSOPHER_LIST.length`.
- `src/routes/_authenticated/index.tsx`: placeholder y meta description.
- Todo bilingüe ES/EN, sin cambios en el sistema de diseño.
