#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="dist"

# Tudo que NÃO deve ir para o build final.
DISALLOW_LIST=(
  ".git"
  "./.git"
  "dist"
  "./dist"

  # Vídeo pesado do hero
  "hero.mp4"
  "./hero.mp4"
  "media/hero.mp4"
  "./media/hero.mp4"
)

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

EXCLUDE_ARGS=()
for item in "${DISALLOW_LIST[@]}"; do
  EXCLUDE_ARGS+=(--exclude="$item")
done

tar -cf - "${EXCLUDE_ARGS[@]}" . | tar -xf - -C "$OUT_DIR"

echo "Build gerado em $OUT_DIR/"