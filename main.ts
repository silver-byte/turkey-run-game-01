import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const submissionLimits = {
  text_max_bytes: 160 * 1024,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000,
};

function prepareReview(destination: string) {
  mkdirSync(destination, { recursive: true });
  for (const folder of ['game', 'screenshots']) {
    const source = fileURLToPath(new URL(`./${folder}`, import.meta.url));
    cpSync(source, join(destination, folder), { recursive: true });
  }
  const dossier = buildDossier(destination, submissionLimits);
  writeFileSync(join(destination, 'dossier.json'), dossier);
}

prepareReview(resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output'));
