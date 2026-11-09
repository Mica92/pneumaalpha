# Separación Kionas Website / Kionas Platform

Estado: **Etapas 1–3 y 6 (en prueba) completas. Etapas 4–5 pendientes de pasos manuales.**
Este proyecto Lovable sigue siendo **Kionas Platform**. El sitio institucional aún no se ha retirado
de aquí porque su copia independiente todavía no está publicada (regla: no borrar antes de validar).

## 1. Diagnóstico (auditoría de dependencias reales)

Se siguieron las importaciones reales desde cada ruta `_site*` (no los nombres de archivo).

### WEBSITE ONLY (migrado a Kionas Website)
- Rutas: `src/routes/_site.tsx`, `_site.index`, `_site.plataforma`, `_site.soluciones`, `_site.instituciones`,
  `_site.metodologia`, `_site.evidencia`, `_site.pilotos`, `_site.nosotros`, `_site.contacto`.
- Componentes: `src/components/institutional/*` (cabecera, pie, primitivas, evidencia, diagrama, vitrina,
  marco de capturas, formulario).
- Contenido y lógica: `src/lib/institutional-content.ts`, `institutional-head.ts`, `evidence.ts`,
  `leads.functions.ts`, `leads.shared.ts` (+ prueba), `email-templates/lead-notification.tsx`.
- Recursos: `src/assets/product/*.jpg` (capturas de la app usadas solo en el sitio).
- Estilos: bloque `.institutional` y utilidades `inst-*` de `src/styles.css`.
- Datos: tabla `institutional_leads` (el sitio nuevo tendrá la suya, en su propio backend).

### APP ONLY (permanecen en Kionas Platform)
Todo `src/routes/_authenticated/*` (inicio de la app, Explorar, Comparar, Diálogos, Ideas, Mapa, Red,
Editorial, Oráculo, Análisis, Umbral, Perfil, Admin…), `src/routes/editorial/*`, `src/routes/api/*`,
`src/routes/lovable/*` (correos de autenticación), funciones de IA (`*.functions.ts`), autenticación
(`hooks/use-auth`, Google), Capacitor (`capacitor.config.ts`, `CAPACITOR.md`), PWA (`manifest.webmanifest`).

### SHARED DESIGN (copiado, versionado, sin dependencia de compilación)
`components/pneuma-mark.tsx`, `components/ui/button.tsx`, `lib/utils.ts`, `lib/i18n.tsx` (en la web solo
con los textos de «Nosotros»), tokens de `styles.css`, favicons, logo, `og-image.png`.

### SHARED BACKEND
Ninguno. La web no usa autenticación ni datos de la plataforma. Su formulario usa un backend propio.

### Legal
`privacy`, `terminos`, `uso-de-ia` (+ `legal-page.tsx`) se **copiaron** a la web y **permanecen** en la app
(las tiendas móviles exigen política de privacidad accesible desde la app).

### Acoplamientos encontrados (a desacoplar en la limpieza)
| Dónde | Acoplamiento | Solución preparada |
| --- | --- | --- |
| `_site.index.tsx` | Detecta Capacitor y redirige a `/app` | Desaparece con el sitio |
| `admin.analitica.tsx` | Muestra `LeadsAdmin` | Se retira; las solicitudes nuevas viven en la web |
| `site-nav.tsx`, `site-footer.tsx` | Enlaces internos a `/nosotros`, `/contacto`, `/` institucional | Enlace externo «Acerca de Kionas» → `https://kionas.app` |
| `legal-page.tsx` | Enlace a `/contacto` | Enlace externo a `https://kionas.app/contacto` |
| `sitemap.xml` | Lista páginas institucionales | Se quitan |
| `email-templates/registry.ts` | Registra `lead-notification` | Se quita |
| `$philosopher.tsx` | Cualquier dirección de un segmento devolvía 200 | Direcciones institucionales antiguas → 301 a la web; el resto → 404 |
| Inicio de la app en `/app` | La raíz `/` era la web | El inicio pasa a `/`; `/app` redirige (301) a `/` para enlaces e instalaciones antiguas |

### Riesgos conocidos
- Los dominios `kionas.app` y `app.kionas.app` aún no están conectados: hasta entonces, los enlaces entre
  productos apuntan a direcciones que todavía no responden.
- La tabla `institutional_leads` de este backend se conserva intacta (no se modifican tablas).
- El remitente de correos sigue siendo `pneum.app`; el proyecto web debe configurar su propio dominio de correo.

## 2–3. Extracción y validación de Kionas Website

Entregado como `kionas-website.zip` (en Files). Verificado en un entorno aislado:
- `bun install` + `vite build`: compila sin ningún archivo de este proyecto.
- Comprobación de tipos: sin errores. `bun test src`: 5/5 reglas del formulario.
- 12 páginas + `sitemap.xml` + `robots.txt` responden 200; `/explorar` y `/app` dan 404 (no existen en la web).
- Navegador: títulos propios por página, sin errores de consola, escritorio y móvil correctos.
- «Ingresar a Kionas» → `https://app.kionas.app/`; «Abrir» en cada funcionalidad → `https://app.kionas.app/<sección>`.
- **No verificado:** envío real del formulario (requiere el backend del proyecto nuevo) y despliegue.

## 6. Prueba de exportación (en copia de prueba, sin tocar este proyecto)

Se aplicó `platform-cleanup.patch` a una copia y se compiló:
- Compila y pasa la comprobación de tipos; pruebas existentes 4/4.
- `/` muestra el inicio de la app; `/app` → 301 a `/`; `/soluciones`, `/contacto`… → 301 a `https://kionas.app/...`;
  direcciones inexistentes → 404; Explorar, Comparar, Diálogos, Editorial y Filósofos → 200.
- Búsqueda en `dist/client` (lo que empaqueta Capacitor) y `dist/server`: **0** coincidencias de rutas
  `/soluciones`, `/instituciones`, `/evidencia`, `/pilotos`, `/metodologia`, `/plataforma`, textos comerciales,
  formulario, tabla de solicitudes, utilidades `inst-*` y capturas de marketing.
  La compilación actual, para comparar, sí contiene `/soluciones` (3 archivos) e `inst-container` (12).
- Única huella: la lista de 8 palabras de redirección (p. ej. `"soluciones"`) usada para enviar enlaces
  antiguos al sitio. No es una página ni un componente.

## Etapa 5 — Limpieza (cuando la web esté publicada)

Aplicar desde la raíz del proyecto: `patch -p1 < docs/separation/platform-cleanup.patch`, y además borrar
los binarios `src/assets/product/*.jpg` (el parche no incluye binarios). El parche también:
- cambia `SITE_URL` a `https://app.kionas.app` y añade `WEBSITE_URL = "https://kionas.app"`;
- mueve el inicio de la app a `/` (`_authenticated/index.tsx`) y crea `/app` como redirección;
- pone `start_url: "/"` en el manifest y un `robots.txt` que excluye perfil, mapa, recorrido, reporte, admin y API.

## Pasos manuales exactos
1. Files → descargar `kionas-website.zip`.
2. Lovable → panel → **+** → **Import project to Lovable** → **Upload code** → subir el ZIP → nombrarlo **Kionas Website**.
3. En el chat del proyecto nuevo, pedir lo indicado en su `README.md` (activar Cloud, aplicar migración, correo, prueba del formulario).
4. Publicar Kionas Website y conectar `kionas.app` y `www.kionas.app` (Settings → Domains).
5. En **este** proyecto: conectar `app.kionas.app` (Settings → Domains) y retirar `kionas.app` / `www.kionas.app` de aquí.
6. Pedir en este chat: «aplica la limpieza de la separación». Entonces se aplica el parche, se verifica
   el inicio de sesión con Google en `app.kionas.app` y se publica.
7. GitHub (opcional): en cada proyecto, Project settings → Git → conectar; cada uno crea su propio repositorio
   (`kionas-platform`, `kionas-website`). Lovable no puede vincular repositorios existentes.
