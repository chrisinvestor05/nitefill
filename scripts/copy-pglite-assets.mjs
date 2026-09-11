#!/usr/bin/env node
/**
 * Nitro's Vercel function bundle needs PGLite's wasm/data files next to the
 * emitted electric-sql chunk. Vite copies them most of the time; this is a
 * safety net so a serverless boot never 500s looking for pglite.wasm.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const files = ["pglite.wasm", "pglite.data", "initdb.wasm"];
const funcRoot = join(root, ".vercel/output/functions");

if (!existsSync(funcRoot)) {
  console.log("[copy-pglite] no .vercel/output/functions — skipping");
  process.exit(0);
}

function collectFuncDirs(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name.endsWith(".func")) out.push(p);
      else collectFuncDirs(p, out);
    }
  }
  return out;
}

const destDirs = [];
for (const funcDir of collectFuncDirs(funcRoot)) {
  destDirs.push(funcDir);
  destDirs.push(join(funcDir, "_libs"));
}

let copied = 0;
for (const dest of destDirs) {
  mkdirSync(dest, { recursive: true });
  for (const file of files) {
    const from = join(srcDir, file);
    if (!existsSync(from)) continue;
    copyFileSync(from, join(dest, file));
    copied += 1;
  }
}

console.log(`[copy-pglite] copied ${copied} wasm/data files into Vercel functions`);
