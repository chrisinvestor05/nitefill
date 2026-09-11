import { mkdirSync, existsSync, writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ext = join(root, "extension");
const destDir = join(root, "public");
const zipPath = join(destDir, "nitefill-sender.zip");

if (!existsSync(join(ext, "manifest.json"))) {
  console.warn("[pack-extension] no extension/manifest.json — skip");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
const py = join(root, "scripts", ".pack-extension-tmp.py");
writeFileSync(
  py,
  `
from pathlib import Path
import zipfile
root = Path(${JSON.stringify(ext)})
out = Path(${JSON.stringify(zipPath)})
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for p in root.rglob("*"):
        if p.is_file() and p.name != ".DS_Store":
            z.write(p, Path("nitefill-sender") / p.relative_to(root))
print("packed", out)
`,
);
try {
  execFileSync("python3", [py], { stdio: "inherit" });
} finally {
  try {
    unlinkSync(py);
  } catch {
    /* ignore */
  }
}
