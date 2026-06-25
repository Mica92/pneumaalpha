#!/usr/bin/env bash
# Imprime las huellas SHA1 / SHA256 de una keystore de Android.
#
# Uso:
#   ./scripts/android-fingerprints.sh                          # debug keystore por defecto
#   ./scripts/android-fingerprints.sh <keystore> <alias>       # release keystore
#
# Requiere `keytool` (incluido en el JDK).

set -euo pipefail

if ! command -v keytool >/dev/null 2>&1; then
  echo "❌ 'keytool' no encontrado. Instala un JDK (p. ej. Temurin 17)." >&2
  exit 1
fi

KEYSTORE="${1:-$HOME/.android/debug.keystore}"
ALIAS="${2:-androiddebugkey}"

if [[ "$KEYSTORE" == "$HOME/.android/debug.keystore" ]]; then
  STOREPASS="android"
  KEYPASS="android"
  MODE="DEBUG"
else
  MODE="RELEASE"
  read -r -s -p "Contraseña del keystore: " STOREPASS; echo
  read -r -s -p "Contraseña de la clave (enter si es la misma): " KEYPASS; echo
  KEYPASS="${KEYPASS:-$STOREPASS}"
fi

if [[ ! -f "$KEYSTORE" ]]; then
  echo "❌ Keystore no encontrada en: $KEYSTORE" >&2
  if [[ "$MODE" == "RELEASE" ]]; then
    cat >&2 <<EOF

Para crear una keystore de release:
  keytool -genkey -v \\
    -keystore $KEYSTORE \\
    -alias $ALIAS \\
    -keyalg RSA -keysize 2048 -validity 10000
EOF
  fi
  exit 1
fi

echo "🔐 Keystore: $KEYSTORE"
echo "🏷  Alias:    $ALIAS"
echo "📦 Modo:     $MODE"
echo "────────────────────────────────────────────"

keytool -list -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -storepass "$STOREPASS" \
  -keypass "$KEYPASS" \
  | grep -E "SHA1|SHA-256|Valid|Owner" \
  || { echo "❌ No se pudo leer la keystore (¿contraseña/alias correctos?)" >&2; exit 1; }

echo "────────────────────────────────────────────"
echo "✅ Copia el valor SHA1 en Firebase / Google Cloud / Play Console según necesites."
