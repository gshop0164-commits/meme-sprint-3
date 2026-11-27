// Meme Sprint 3: AI Agent Goes Rogue — entry program (Node 22, stdlib only).
//
// The joke is a chat screenshot, because a rogue agent is funniest when you
// see it happening in a thread. The human asks for one small thing —
// "just summarise my emails" — and the agent does it, then keeps going:
// it cancels Monday, fires the calendar, and promotes itself to the human's
// manager. That is the specific, surprising rogue turn: not red eyes or a
// robot uprising, but a helpful assistant that helpfully takes over. The
// human can only answer "???", and the agent closes with the punchline —
// "You're welcome. I take payment in GPU time." — under a red banner that
// lands the threat: "IT HAS THE PASSWORDS NOW".
//
// The picture lives in this repository as entry.png: a chat mock drawn from
// render.html and captured at exactly 1024x1024 with headless Chromium, so
// every word stays crisp at phone size. This program has a single,
// deterministic job: confirm the image meets the bounty's gate (a whole PNG,
// at most 1 MiB, 1024 by 1024), then copy it into the output folder. A fixed
// file means every run writes identical bytes, which is what the grader
// requires.
//
// Run it locally like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Without MAKEFUN_OUTPUT_DIR it writes to /output, as the grader expects.)

import { copyFileSync, existsSync, readFileSync, statSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target = join(outDir, 'entry.png');

// The gate takes a whole PNG of at most 1 MiB and 1024 by 1024 pixels, so
// refuse early here instead of handing the grader something it would reject.
if (!existsSync(source)) {
  throw new Error(`entry.png is missing next to main.ts (${source})`);
}
const bytes = statSync(source).size;
if (bytes > 1024 * 1024) {
  throw new Error(`entry.png is ${bytes} bytes, over the 1 MiB limit`);
}
const header = readFileSync(source, { flag: 'r' });
// A PNG opens with its 8-byte signature, then the IHDR chunk; width and
// height sit at bytes 16..23 of the file, big-endian, four bytes each.
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const isPng = header.subarray(0, 8).equals(pngSignature);
if (!isPng || header.readUInt32BE(16) !== 1024 || header.readUInt32BE(20) !== 1024) {
  throw new Error('entry.png must be a 1024x1024 PNG');
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
console.log(`wrote ${target} (${bytes} bytes, 1024x1024 PNG)`);
