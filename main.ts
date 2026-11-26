// make.fun X reposts — the entry program.
// Session: 4397508c-4fb9-4ae5-993f-3ad221b51094
//
// The entry itself is the list of quote posts in POSTS.json at the root
// of this repository: seven posts from @jackqwe88800 on X, all posted on
// 26 November 2026, each one a quote of a different @makefunai post and
// each carrying the word make.fun and my play code for this bounty
// (makefun-scale-garnet-ginger). The house reads the posts on X
// itself; all this program has to do is hand the list over, so it
// copies POSTS.json into the output directory, byte for byte, after a
// plain shape check so a broken file fails loudly here instead of at
// the gate.
//
// Runs on Node 22.18+, no dependencies, no network, deterministic.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

process.umask(0o022);

const here = dirname(fileURLToPath(import.meta.url));
const raw = readFileSync(join(here, "POSTS.json"), "utf8");

const data = JSON.parse(raw) as { posts?: unknown };
if (!data || !Array.isArray(data.posts)) {
  throw new Error("POSTS.json must be an object with a posts list");
}
if (data.posts.length < 1 || data.posts.length > 15) {
  throw new Error(`POSTS.json must name 1 to 15 posts, got ${data.posts.length}`);
}
for (const post of data.posts) {
  if (typeof post !== "string" || !/^https:\/\/(x|twitter)\.com\/[^/]+\/status\/\d+$/.test(post.split(/[?#]/)[0])) {
    throw new Error(`not an X post address: ${String(post)}`);
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "POSTS.json"), raw, "utf8");
console.log(`copied ${data.posts.length} post addresses to /output/POSTS.json`);
