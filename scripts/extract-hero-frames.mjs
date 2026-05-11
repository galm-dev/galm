import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';

const SRC = 'media/hero.mp4';
const OUT_DIR = 'media/hero-frames';
const FPS = 24;
const WIDTH = 1920;
const QUALITY = 82;

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

execSync(
  `ffmpeg -i "${SRC}" -vf "scale=${WIDTH}:-2:flags=lanczos,fps=${FPS}" -c:v libwebp -quality ${QUALITY} "${OUT_DIR}/frame_%04d.webp" -y`,
  { stdio: 'inherit' }
);

console.log(`Done! Frames exported to ${OUT_DIR}`);
