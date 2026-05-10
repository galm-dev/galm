import { execFileSync } from 'child_process';

const SRC = 'media/hero.mp4';
const VIDEO_OUT = 'media/hero-scrub.mp4';
const POSTER_OUT = 'media/hero-poster.webp';
const WIDTH = 1920;

execFileSync('ffmpeg', [
  '-i', SRC,
  '-an',
  '-vf', `fps=18,scale=${WIDTH}:-2:flags=lanczos`,
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-pix_fmt', 'yuv420p',
  '-preset', 'medium',
  '-crf', '23',
  '-g', '6',
  '-keyint_min', '6',
  '-sc_threshold', '0',
  '-movflags', '+faststart',
  VIDEO_OUT,
  '-y',
], { stdio: 'inherit' });

execFileSync('ffmpeg', [
  '-i', SRC,
  '-vf', `select=eq(n\\,0),scale=${WIDTH}:-2:flags=lanczos`,
  '-frames:v', '1',
  '-c:v', 'libwebp',
  '-quality', '82',
  POSTER_OUT,
  '-y',
], { stdio: 'inherit' });

console.log(`Built ${VIDEO_OUT} and ${POSTER_OUT}`);
