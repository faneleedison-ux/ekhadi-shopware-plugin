#!/bin/bash
# Export each slide as a JPEG still image using Remotion
# Usage: bash scripts/export-stills.sh
# Output: out/slide-XX.jpg

set -e

mkdir -p out

FPS=30
# Midpoint of each slide (frame where the animations have settled)
# Intro: frame 0-89  → still at 60
# Each slide: 150 frames each → still at midpoint (75 frames in)
declare -A STILLS=(
  [00-intro]=60
  [01-edge]=165
  [02-compute]=315
  [03-data]=465
  [04-ai]=615
  [05-analytics]=765
  [06-messaging]=915
  [07-observability]=1065
  [08-security]=1215
  [09-full-picture]=1335
)

for name in "${!STILLS[@]}"; do
  frame="${STILLS[$name]}"
  echo "📸  Rendering slide ${name} at frame ${frame}..."
  npx remotion still \
    --frame="$frame" \
    --image-format=jpeg \
    --jpeg-quality=95 \
    src/index.tsx \
    ArchDiagram \
    "out/slide-${name}.jpg"
done

echo ""
echo "✅  All stills saved to out/"
ls -lh out/*.jpg