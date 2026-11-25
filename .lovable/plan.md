# Integrar a Adam Smith y unificar el número de filósofos

## Qué verás
- Adam Smith (1723–1790) aparece como filósofo nº 76: ficha bilingüe, retrato, escena de conversación, tradición, filtros de descubrimiento y conexiones en la red neuronal (ya existe como nodo en el mapa; pasará a ser un pensador conversable).
- Todos los textos que hoy dicen "75 filósofos" pasarán a mostrar la cifra correcta, calculada automáticamente para que no vuelva a quedar desfasada al sumar pensadores.

## Contenido de Smith
- Identidad: filósofo moral escocés, autor de *La teoría de los sentimientos morales* y *La riqueza de las naciones*.
- Núcleos: simpatía y espectador imparcial, división del trabajo, la "mano invisible" en su sentido limitado, crítica a mercaderes y monopolios, virtud y prudencia, comercio y carácter moral.
- Mismo formato y profundidad que las fichas existentes (prompt de encarnación, bio ES/EN, citas, temas).

## Pasos
1. Añadir Smith a la quinta oleada de filósofos (id `smith`), reutilizando el id que ya usa la red neuronal.
2. Generar retrato y escena en el estilo editorial actual y registrarlos.
3. Completar descubrimiento: orientación, tradición (escocesa/británica), perfil para recomendaciones.
4. Revisar las conexiones del mapa de conocimiento y del atlas para que lo enlacen como filósofo (Hume, Hayek, Marx, liberalismo).
5. Reemplazar la cifra fija en "Cómo funciona" (ES/EN) por el total real de filósofos registrados, y revisar textos para buscadores (`llms.txt`, descripciones) por menciones del total.
6. Agregar una prueba que verifique que el texto muestra el mismo número que la lista de filósofos registrados.

## Detalles técnicos
- `src/lib/philosophers-wave5.ts`: nuevo `SMITH` + id en `Wave5PhilosopherId`.
- `src/lib/portraits.ts`, `src/lib/scenes.ts`: imágenes nuevas en `src/assets/portraits|scenes/smith.jpg`.
- `src/lib/discovery.ts`: entradas en los mapas de orientación/tradición/perfil.
- `src/components/how-it-works.tsx`: usar `Object.keys(PHILOSOPHERS).length`.
- Kionas Docente acepta automáticamente a Smith como pensador registrado (filtros de autores leen la misma lista).
