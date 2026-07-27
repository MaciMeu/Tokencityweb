const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const OUT = path.join(__dirname, "generated");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

/* ============================================================
   Slide background — dark gradient + faint grid, like the HTML.
   (Per-card icons are generated on demand, in their own accent
   color, by icon-gen.js — not here.)
   ============================================================ */
const W = 2000, H = 1125;
const bgSvg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#05070a"/>
      <stop offset="100%" stop-color="#060a12"/>
    </linearGradient>
    <radialGradient id="glow1" cx="15%" cy="-10%" r="55%">
      <stop offset="0%" stop-color="#1855BA" stop-opacity="0.38"/>
      <stop offset="60%" stop-color="#1855BA" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="110%" cy="110%" r="50%">
      <stop offset="0%" stop-color="#1855BA" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="#1855BA" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="28%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="72%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <mask id="gridMask">
      <rect width="${W}" height="${H}" fill="url(#gridFade)"/>
    </mask>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#base)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
</svg>`;

sharp(Buffer.from(bgSvg))
  .png()
  .toFile(path.join(OUT, "slide-bg.png"))
  .then(() => console.log("background ->", path.join(OUT, "slide-bg.png")))
  .catch(err => { console.error(err); process.exit(1); });
