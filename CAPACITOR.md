# Pneuma Alpha — Build Android AAB con Capacitor

`applicationId`: **app.pneuma.alpha**
`appName`: **Pneuma Alpha**

> Pneuma es una app SSR (TanStack Start sobre Cloudflare Workers). Capacitor
> empaqueta **solo el cliente estático**; las funciones de servidor
> (`createServerFn`, oráculo, reporte, autenticación) deben seguir
> ejecutándose en el backend desplegado (Lovable Cloud / dominio público).
> La APK/AAB consume ese backend remoto por HTTPS.

## 1. Prerrequisitos (solo local, no en este sandbox)

- Node 20+, Bun o npm
- Android Studio (JDK 21, SDK 34, Build-Tools 34)
- Variables: `ANDROID_HOME`, `JAVA_HOME`

## 2. Apuntar el cliente al backend de producción

Antes de compilar para Android, configura la URL pública del backend para que
la app empaquetada no llame a `localhost`:

```bash
# .env.production (o variables de entorno al construir)
VITE_PUBLIC_API_URL=https://pneumaalpha.lovable.app
```

Y asegúrate de usarla en cualquier `fetch` / cliente Supabase del lado cliente.

## 3. Build web + sincronización Capacitor

```bash
bun install
bun run build                 # genera dist/client (webDir)
bunx cap add android          # solo la primera vez → crea ./android
bunx cap sync android         # copia dist/client + plugins al proyecto nativo
```

`capacitor.config.ts` ya declara `webDir: 'dist/client'`. Si tu build
produce otra ruta, ajústala antes de `cap sync`.

## 4. Generar el AAB firmado

```bash
bunx cap open android         # abre Android Studio
# Build > Generate Signed Bundle / APK > Android App Bundle
#   - Key store: crea/usa tu .jks
#   - Build Variant: release
```

O por línea de comandos:

```bash
cd android
./gradlew bundleRelease
# salida: android/app/build/outputs/bundle/release/app-release.aab
```

## 5. Verificar el applicationId

Tras `cap add android`, abre `android/app/build.gradle` y confirma:

```gradle
android {
    namespace "app.pneuma.alpha"
    defaultConfig {
        applicationId "app.pneuma.alpha"
        versionCode 1
        versionName "0.1.0"
    }
}
```

Si necesitas cambiarlo más tarde, edita **ambos**: `capacitor.config.ts`
(`appId`) y `android/app/build.gradle` (`applicationId` + `namespace`),
luego `bunx cap sync android`.

## 6. Notas

- `androidScheme: 'https'` evita problemas de cookies/SameSite con Supabase.
- No subas la carpeta `android/` modificada a mano: regénerala con
  `cap sync` cuando cambien plugins o `webDir`.
- Para íconos y splash usa `@capacitor/assets`:
  `bunx @capacitor/assets generate --android`.
