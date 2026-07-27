const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const LUCIDE_DIR = path.join(__dirname, "node_modules", "lucide-static", "icons");
const OUT = path.join(__dirname, "generated");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

/** Renders (and caches) a lucide icon recolored to the given hex, returns the PNG path. */
async function getIconPath(name, colorHex) {
  const color = colorHex.replace("#", "").toUpperCase();
  const outPath = path.join(OUT, `icon-${name}-${color}.png`);
  if (fs.existsSync(outPath)) return outPath;

  const srcPath = path.join(LUCIDE_DIR, `${name}.svg`);
  if (!fs.existsSync(srcPath)) throw new Error(`Unknown lucide icon: "${name}"`);

  const svg = fs
    .readFileSync(srcPath, "utf8")
    .replace(/stroke="currentColor"/g, `stroke="#${color}"`);

  await sharp(Buffer.from(svg), { density: 600 })
    .resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);

  return outPath;
}

module.exports = { getIconPath };
