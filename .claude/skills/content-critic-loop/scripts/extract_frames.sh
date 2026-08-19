#!/usr/bin/env bash
# Extracts 5 evenly-spaced frames (start, 25%, 50%, 75%, end) from a video for the
# content-critic-loop skill to Read and inspect. Requires ffmpeg on PATH.
#
# Usage: extract_frames.sh <video_path> <out_dir>
# Writes: <out_dir>/frame_00_start.jpg ... frame_04_end.jpg

set -euo pipefail

VIDEO="$1"
OUT_DIR="$2"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found on PATH — see references/video-checklist.md for the fallback (use the Higgsfield job thumbnail instead)." >&2
  exit 1
fi

if [ ! -f "$VIDEO" ]; then
  echo "Video file not found: $VIDEO" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$VIDEO")

# node is used here (not python3) because it's reliably present in this project's
# environment, whereas python3 is not.
TIMESTAMPS=$(node -e "
const d = parseFloat(process.argv[1]);
const pts = [0, 0.25, 0.5, 0.75, 0.98];
console.log(pts.map(p => (p * d).toFixed(2)).join(' '));
" "$DURATION")
LABELS=("00_start" "01_quarter" "02_half" "03_threequarter" "04_end")

i=0
for t in $TIMESTAMPS; do
  ffmpeg -y -ss "$t" -i "$VIDEO" -frames:v 1 -q:v 2 "$OUT_DIR/frame_${LABELS[$i]}.jpg" -loglevel error
  i=$((i + 1))
done

echo "Wrote 5 frames to $OUT_DIR"
ls "$OUT_DIR"
