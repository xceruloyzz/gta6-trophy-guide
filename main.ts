// Leonida Platinum — the hand-in program for gta6-trophy-guide-01.
//
// The guide itself is plain static files in app/ (index.html, style.css, ES
// modules under js/, and data/trophies.json), built to open in desktop Chrome
// with the network off: everything it loads is a file under app/.
// Screenshots of the real app live in screenshots/.
//
// This program copies app/ and screenshots/ from beside this file into the
// output directory (/output in the grader, or $MAKEFUN_OUTPUT_DIR locally)
// and writes /output/dossier.json with the kit's vendored library, so the
// judge can read the guide from the dossier. vendor/makefun-frontend.ts is
// the kit's copy, byte for byte — the scorer rebuilds the dossier with its
// own copy and the two must match.
//
// Run it locally like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's caps (reference/gate.json): at most 4 screenshots, each at most
// 256 KiB; app/ at most 993 files and directories and 48 MiB in all; the
// dossier text at most 163,840 bytes. buildDossier refuses anything past
// them, so a bad build fails loudly here instead of silently at the gate.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
