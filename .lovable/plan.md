# Red neuronal como sección, PneumAlpha, cuenta Google y fondos de color

## 1. Red neuronal como sección propia

El mapa neuronal (`/conocimiento`) pasa a ser una entrada más del menú, al mismo nivel que Explorar, Filósofos, Ideas y Rutas.

- Se añade "Red neuronal" / "Neural map" a la navegación principal y al bloque "Explorar" del pie.
- Se quita del listado de instrumentos de `/umbral` para que no aparezca duplicada.
- La página en sí (lienzo + panel) queda igual.
- Orden del menú: Explorar · Filósofos · Ideas · Rutas · Red neuronal · Comparar · Instrumentos · Mi mapa · Buscar.

## 2. Logo: PneumAlpha

El wordmark dice hoy "PneumaA". Pasa a **PneumAlpha** en el logo (nav, pie, cargas), en el título de las páginas, en los textos de la interfaz y en el manifiesto de la app. El glifo y los colores no cambian.

## 3. Cuenta con Google (opcional)

Se mantiene la entrada libre: quien no inicia sesión sigue navegando y conversando con la sesión anónima actual.

- Botón "Continuar con Google" en la barra de navegación (y en el menú móvil).
- Al iniciar sesión, la sesión anónima se enlaza con la cuenta Google, así que las conversaciones y el mapa personal ya guardados no se pierden.
- Nueva página **`/perfil`**: foto, nombre y correo de Google, número de conversaciones, mentes exploradas, acceso a "Mi mapa" y "Mi recorrido", y cerrar sesión.
- Con sesión iniciada, la nav muestra el avatar en lugar del botón, con enlace a Perfil.

## 4. Fondo de red neuronal con color variable

La misma imagen de red neuronal (`neural-bg.jpg`) se usa como fondo en todas las páginas, con un tinte de color distinto **elegido al azar en cada carga**: azul, rosa, amarillo, verde, violeta, ámbar, cian.

- El fondo se aplica una sola vez, en el layout global, para que sea idéntico en todas las secciones.
- Opacidad baja y desenfoque suave para no restar legibilidad al texto (contraste AA garantizado).
- Se respeta `prefers-reduced-motion`: sin transiciones de color en ese caso.
- El fondo escandinavo actual del inicio se retira para unificar el look.

## Notas técnicas

- Nav/pie: `src/components/site-nav.tsx`, `src/components/site-footer.tsx`; instrumentos en `src/routes/_authenticated/umbral.tsx`.
- Wordmark en `src/components/pneuma-mark.tsx`; cadenas en `src/lib/i18n.tsx`, `head()` de cada ruta, `public/manifest.webmanifest`.
- Auth: `src/hooks/use-auth.tsx` mantiene el anónimo y añade `signInWithOAuth("google")` vía `src/integrations/lovable`, con `redirect_uri = window.location.origin`. Se configura el proveedor Google en el backend en el mismo paso.
- Perfil: nueva tabla `profiles` (id, display_name, avatar_url, email) con GRANTs y RLS por `auth.uid()`, más trigger de creación en alta de usuario; ruta nueva `src/routes/_authenticated/perfil.tsx`.
- Fondo: componente `NeuralBackground` montado en `src/routes/__root.tsx`, tintes como tokens en `src/styles.css` aplicados con `mix-blend-mode` sobre la imagen; elección aleatoria tras la hidratación para evitar desajustes de SSR.
- Sitemap actualizado con `/conocimiento` y `/perfil`.
