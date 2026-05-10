import { execSync } from 'child_process';
import { readdirSync, writeFileSync, mkdirSync } from 'fs';

const SRC = 'media/hero.mp4';
const OUT_DIR = 'media/hero-frames';
const FPS = 18;
const WIDTH = 1920;
const QUALITY = 86;

mkdirSync(OUT_DIR, { recursive: true });

execSync(
  `ffmpeg -i "${SRC}" -vf "fps=${FPS},scale=${WIDTH}:-2" -c:v libwebp -quality ${QUALITY} "${OUT_DIR}/hero-%04d.webp" -y`,
  { stdio: 'inherit' }
);

const files = readdirSync(OUT_DIR).filter(f => f.endsWith('.webp')).sort();

let width = WIDTH;
let height = Math.round(WIDTH * 9 / 16);
try {
  const probe = execSync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${SRC}"`
  ).toString().trim().split(',');
  height = Math.round(WIDTH * Number(probe[1]) / Number(probe[0]));
} catch (_) {}

writeFileSync(
  `${OUT_DIR}/manifest.json`,
  JSON.stringify({ frames: files, width, height }, null, 2)
);

console.log(`Done! ${files.length} frames → ${OUT_DIR}/manifest.json`);
