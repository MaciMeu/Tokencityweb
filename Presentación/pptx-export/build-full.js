const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");
const { JSDOM } = require("jsdom");
const { getIconPath } = require("./icon-gen");

const ROOT = path.join(__dirname, "..");
const GEN_DIR = path.join(__dirname, "generated");

// ---------- Token City palette ----------
const BG = "05070A";
const CARD_BG = "12161F";
const CARD_BORDER = "2A3140";
const TEXT_WHITE = "FFFFFF";
const TEXT_MUTED = "9AA3B2";
const PRIMARY_BLUE = "1855BA";
const ACCENT_BLUE = "4D8DFF";

// Named weight-specific faces so Bold/Black/SemiBold/Light actually differ in the
// exported file WHEN the machine opening it has the full Montserrat family installed
// (Google Fonts ships each weight as its own selectable family name, e.g. "Montserrat Black").
// PPTX has no API to embed fonts, so this is best-effort: if a given weight isn't installed,
// PowerPoint substitutes gracefully — the `bold` flag is always also set as a safety net.
const FONT = {
  black: "Montserrat Black",
  extraBold: "Montserrat ExtraBold",
  bold: "Montserrat",       // + bold:true (works even with just Regular+Bold installed)
  semiBold: "Montserrat SemiBold",
  regular: "Montserrat",
  light: "Montserrat Light",
  mono: "Consolas",         // JetBrains Mono is unlikely to be installed on the viewer's machine
};

/* ============================================================
   Read + parse the live deck (same logic as Editor.html's parser)
   ============================================================ */
const presSrc = fs.readFileSync(path.join(ROOT, "Presentacion.html"), "utf8");
const dom = new JSDOM("<!doctype html><html><body></body></html>");
const document = dom.window.document;

function uid() { return "b" + Math.random().toString(36).slice(2, 10); }

const LEGACY_PROCESS_STEPS = [
  { title: "Fase Previa", sub: "Estructuración de la emisión", desc: "Se define el modelo de negocio, el tipo de activo a tokenizar y la viabilidad jurídica y financiera.", icon: "lightbulb" },
  { title: "Validación del Documento de Emisión o Folleto", sub: "", desc: "Se elabora el documento con las características del instrumento. Según volumen y perfil inversor, se valida por una ESI o CNMV.", icon: "file-text" },
  { title: "Infraestructura de tokenización y emisión", sub: "", desc: "Se selecciona la infraestructura tecnológica de soporte (plataforma propia, Token City Exchange, Alius Capital, otras).", icon: "cloud" },
  { title: "ERIR (Inscripción y Registro)", sub: "", desc: "Se designa la ERIR encargada de la inscripción y registro de los activos tokenizados.", icon: "link" },
  { title: "Formalización mercantil", sub: "", desc: "Cuando la Ley lo exige, se formaliza la emisión ante notario y se procede a su registro público.", icon: "stamp" },
  { title: "Inscripción ERIR en CNMV y solicitud de ISIN", sub: "", desc: "Se tramita la inscripción de la ERIR en CNMV. Posteriormente, se puede solicitar el ISIN.", icon: "landmark" },
  { title: "Colocación primaria y negociación secundaria", sub: "", desc: "Se colocan los tokens entre los inversores suscriptores y, en su caso, se habilita la compra-venta secundaria.", icon: "rocket" },
];
const LEGACY_TOC_ENTRIES = [
  "¿Qué es la tokenización?", "¿Qué son los Real World Assets (RWAs)?", "¿Qué valor tienen los tokens?",
  "¿Cómo es el proceso de tokenización?", "¿Por qué tokenizar tus activos?", "¿Por qué con Token City?",
  "¿Qué ofrece Token City?", "Tarifas", "Ejemplos de clientes",
];

function accentFromEl(el) {
  const style = el.getAttribute("style") || "";
  let m = style.match(/--accent:\s*([^;]+)/);
  if (m) return m[1].trim();
  m = style.match(/border-left(?:-color)?:\s*(?:\d+(?:\.\d+)?px\s+solid\s+)?(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/);
  if (m) return m[1].trim();
  return "#4d8dff";
}
function rawBlockFor(el) { return { id: uid(), type: "raw", html: el.outerHTML, width: "full" }; }
function tryClassifyCard(el) {
  if (!el.classList || !(el.classList.contains("glass-card") || el.classList.contains("bento-card"))) return null;
  const h3 = el.querySelector("h3");
  if (!h3) return null;
  if (el.querySelector("ul, ol, table, form, .client-logo-box, .grid, .bento-card, .glass-card")) return null;
  const paragraphs = Array.from(el.querySelectorAll("p")).filter(p => !p.classList.contains("pill"));
  if (paragraphs.length > 1) return null;
  const iconEl = el.querySelector("[data-lucide]");
  return {
    id: uid(), type: "card", accent: accentFromEl(el),
    icon: iconEl ? iconEl.getAttribute("data-lucide") : "",
    title: h3.textContent.trim(), desc: paragraphs[0] ? paragraphs[0].textContent.trim() : "",
    width: "third",
  };
}
function isLogoEl(el) { return el.classList && (el.classList.contains("client-logo-wrap") || el.classList.contains("client-logo-box")); }
function classifyLogo(el) {
  const box = el.classList.contains("client-logo-box") ? el : el.querySelector(".client-logo-box");
  const urlEl = el.querySelector(".client-logo-url");
  const img = box ? box.querySelector("img") : null;
  const href = box ? box.getAttribute("href") : (urlEl ? urlEl.getAttribute("href") : "");
  return {
    id: uid(), type: "logo", accent: box ? accentFromEl(box) : "#4d8dff",
    imgSrc: img ? img.getAttribute("src") : "", name: img ? (img.getAttribute("alt") || "") : (box ? box.textContent.trim() : ""),
    url: href || "", width: "third",
  };
}
function classifyTableWithSpans(tableEl) {
  const headers = Array.from(tableEl.querySelectorAll("thead th")).map(th => th.textContent.trim());
  const rawRows = Array.from(tableEl.querySelectorAll("tbody tr")).map(tr =>
    Array.from(tr.children).map(td => ({ text: td.textContent.trim(), rowSpan: parseInt(td.getAttribute("rowspan") || "1", 10) }))
  );
  return { id: uid(), type: "table", headers, rawRows, width: "full" };
}

function parseSlideHtmlToBlocks(htmlString) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = htmlString;
  const blocks = [];

  if (wrapper.querySelector("#toc-list")) {
    LEGACY_TOC_ENTRIES.forEach(t => blocks.push({ id: uid(), type: "card", accent: "#4d8dff", icon: "arrow-right", title: t, desc: "", width: "half" }));
  }
  if (wrapper.querySelector("#process-steps")) {
    LEGACY_PROCESS_STEPS.forEach(s => blocks.push({ id: uid(), type: "card", accent: "#4d8dff", icon: s.icon, title: s.title, desc: [s.sub, s.desc].filter(Boolean).join(" — "), width: "quarter" }));
  }

  Array.from(wrapper.children).forEach(el => {
    if (el.classList.contains("slide-bg") || el.classList.contains("slide-kicker")) return;
    if (el.id === "toc-list" || el.id === "process-steps") return;

    if (el.tagName === "H2" && el.classList.contains("slide-title")) { blocks.push({ id: uid(), type: "title", text: el.textContent.trim(), width: "full" }); return; }
    if (el.tagName === "P" && el.classList.contains("slide-lead")) { blocks.push({ id: uid(), type: "paragraph", text: el.textContent.trim(), width: "full" }); return; }
    if (el.tagName === "TABLE") { blocks.push(classifyTableWithSpans(el)); return; }
    if (isLogoEl(el)) { blocks.push(classifyLogo(el)); return; }

    const card = tryClassifyCard(el);
    if (card) { blocks.push(card); return; }

    const nestedTable = el.querySelector("table.tc-table");
    if (nestedTable && el.children.length === 1) { blocks.push(classifyTableWithSpans(nestedTable)); return; }

    const kids = Array.from(el.children);
    if (kids.length > 1) {
      const classified = kids.map(k => (isLogoEl(k) ? classifyLogo(k) : tryClassifyCard(k)));
      if (classified.every(Boolean)) { classified.forEach(c => blocks.push(c)); return; }
    }
    blocks.push(rawBlockFor(el));
  });

  return blocks;
}

function loadSlides() {
  const dataMatch = presSrc.match(/<script type="application\/json" id="slides-data">([\s\S]*?)<\/script>/);
  if (dataMatch) {
    try {
      const parsed = JSON.parse(dataMatch[1]);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) { /* fall through */ }
  }
  const slides = [];
  const re = /addSlide\(`([\s\S]*?)`\);/g;
  let m, i = 0;
  while ((m = re.exec(presSrc))) {
    slides.push({ id: "legacy-" + i, type: "blocks", blocks: parseSlideHtmlToBlocks(m[1]) });
    i++;
  }
  return slides;
}

/* ============================================================
   Raw-block -> readable text fallback (for the handful of highly
   custom layouts that can't map onto a structured block cleanly)
   ============================================================ */
function extractTextLines(rawHtml) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = rawHtml;
  const lines = [];
  (function walk(node) {
    Array.from(node.children).forEach(el => {
      if (["H1", "H2", "H3", "H4"].includes(el.tagName)) lines.push({ kind: "heading", text: el.textContent.trim() });
      else if (el.tagName === "P") { const t = el.textContent.trim(); if (t) lines.push({ kind: "para", text: t }); }
      else if (el.tagName === "UL" || el.tagName === "OL") {
        Array.from(el.querySelectorAll("li")).forEach(li => lines.push({ kind: "bullet", text: li.textContent.trim() }));
      } else if (el.classList && el.classList.contains("pill")) {
        const t = el.textContent.trim(); if (t) lines.push({ kind: "pill", text: t });
      } else if (el.tagName === "IMG") {
        lines.push({ kind: "image", src: el.getAttribute("src"), alt: el.getAttribute("alt") || "" });
      } else if (el.tagName === "A" && !el.querySelector("img") && el.textContent.trim()) {
        lines.push({ kind: "para", text: el.textContent.trim() });
      } else {
        walk(el);
      }
    });
  })(wrapper);
  return lines;
}

/* ============================================================
   pptxgenjs helpers
   ============================================================ */
const pptx = new PptxGenJS();
pptx.defineLayout({ name: "TC_16x9", width: 13.333, height: 7.5 });
pptx.layout = "TC_16x9";

function addBackground(slide) { slide.background = { path: path.join(GEN_DIR, "slide-bg.png") }; }

function addKicker(slide) {
  slide.addText("TOKEN CITY", {
    x: 0.6, y: 0.35, w: 4, h: 0.3,
    fontFace: FONT.mono, fontSize: 11, bold: true, color: ACCENT_BLUE, charSpacing: 2,
  });
}
function addTitle(slide, text, y = 0.65) {
  slide.addText(text, {
    x: 0.6, y, w: 12.1, h: 0.9,
    fontFace: FONT.extraBold, fontSize: 28, bold: true, color: TEXT_WHITE,
  });
}

function widthToFlexFraction(width) {
  switch (width) { case "half": return 2; case "third": return 3; case "quarter": return 4; default: return 1; }
}

/** Resolves a src path used in the HTML deck (e.g. "assets/x.png", "../Logos/y.png",
    "../TOKEN CITY.svg") to a real file on disk, or null if it can't be found / isn't raster-able. */
function resolveAssetPath(src) {
  if (!src) return null;
  let clean = decodeURIComponent(src);
  let p = path.isAbsolute(clean) ? clean : path.join(ROOT, clean);
  if (fs.existsSync(p)) return p;
  return null;
}
async function rasterizeIfSvg(filePath) {
  if (!filePath) return null;
  if (path.extname(filePath).toLowerCase() !== ".svg") return filePath;
  const sharp = require("sharp");
  const outPath = path.join(GEN_DIR, "raster-" + path.basename(filePath, ".svg") + ".png");
  if (!fs.existsSync(outPath)) {
    await sharp(fs.readFileSync(filePath)).png().toFile(outPath);
  }
  return outPath;
}

async function addCardBlock(slide, b, x, y, w, h) {
  const accent = b.accent || ACCENT_BLUE;
  const compact = !(b.desc || "").trim(); // icon+title only (e.g. the index/TOC list) — lay out horizontally
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
  slide.addShape(pptx.ShapeType.roundRect, { x, y: y + 0.08, w: 0.06, h: h - 0.16, rectRadius: 0.02, fill: { color: accent }, line: { type: "none" } });

  if (compact) {
    const iconSize = Math.min(0.36, h * 0.6);
    const iconX = x + 0.22, iconY = y + (h - iconSize) / 2;
    slide.addShape(pptx.ShapeType.ellipse, { x: iconX, y: iconY, w: iconSize, h: iconSize, fill: { color: accent, transparency: 78 }, line: { color: accent, width: 1 } });
    if (b.icon) {
      try {
        const iconPath = await getIconPath(b.icon, accent);
        const pad = 0.09;
        slide.addImage({ path: iconPath, x: iconX + pad / 2, y: iconY + pad / 2, w: iconSize - pad, h: iconSize - pad });
      } catch (e) { /* unknown icon name — skip glyph, keep the tinted dot */ }
    }
    slide.addText(b.title || "", { x: iconX + iconSize + 0.16, y, w: w - (iconX + iconSize + 0.16 - x) - 0.16, h, fontFace: FONT.semiBold, bold: true, fontSize: 11, color: TEXT_WHITE, valign: "middle" });
    return;
  }

  const iconSize = Math.min(0.42, h * 0.28);
  const iconX = x + 0.26, iconY = y + 0.22;
  slide.addShape(pptx.ShapeType.ellipse, { x: iconX, y: iconY, w: iconSize, h: iconSize, fill: { color: accent, transparency: 78 }, line: { color: accent, width: 1.1 } });
  if (b.icon) {
    try {
      const iconPath = await getIconPath(b.icon, accent);
      const pad = 0.11;
      slide.addImage({ path: iconPath, x: iconX + pad / 2, y: iconY + pad / 2, w: iconSize - pad, h: iconSize - pad });
    } catch (e) { /* unknown icon name — skip glyph, keep the tinted dot */ }
  }
  slide.addText(b.title || "", { x: x + 0.26, y: iconY + iconSize + 0.1, w: w - 0.5, h: 0.4, fontFace: FONT.semiBold, bold: true, fontSize: 12.5, color: TEXT_WHITE, valign: "top" });
  if (b.desc) {
    slide.addText(b.desc, { x: x + 0.26, y: iconY + iconSize + 0.5, w: w - 0.5, h: Math.max(0.3, h - (iconY + iconSize + 0.5 - y) - 0.15), fontFace: FONT.regular, fontSize: 9, color: TEXT_MUTED, valign: "top" });
  }
}

async function addLogoBlock(slide, b, x, y, w, h) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h: h - 0.35, rectRadius: 0.08, fill: { color: "1A1F2B" }, line: { color: CARD_BORDER, width: 1 } });
  const imgPath = resolveAssetPath(b.imgSrc);
  if (imgPath) {
    try {
      const finalPath = await rasterizeIfSvg(imgPath);
      const iw = w * 0.7, ih = (h - 0.35) * 0.55;
      slide.addImage({ path: finalPath, x: x + (w - iw) / 2, y: y + ((h - 0.35) - ih) / 2, w: iw, h: ih, sizing: { type: "contain", w: iw, h: ih } });
    } catch (e) {
      slide.addText(b.name || "", { x, y, w, h: h - 0.35, align: "center", valign: "middle", fontFace: FONT.bold, bold: true, color: TEXT_WHITE, fontSize: 11 });
    }
  } else {
    slide.addText(b.name || "", { x, y, w, h: h - 0.35, align: "center", valign: "middle", fontFace: FONT.bold, bold: true, color: TEXT_WHITE, fontSize: 11 });
  }
  if (b.url) {
    slide.addText(b.url, { x, y: y + h - 0.3, w, h: 0.3, align: "center", fontFace: FONT.mono, fontSize: 8, color: TEXT_MUTED });
  }
}

function addTableBlock(slide, b, x, y, w, h) {
  const headerOpts = { fill: { color: PRIMARY_BLUE }, color: TEXT_WHITE, bold: true, fontFace: FONT.mono, fontSize: 9.5, valign: "middle" };
  const cellOpts = { fill: { color: CARD_BG }, color: TEXT_WHITE, fontFace: FONT.regular, fontSize: 10, valign: "middle" };
  const nCols = b.headers.length;
  const rows = [b.headers.map((hdr, i) => ({ text: hdr, options: { ...headerOpts, align: i === 0 ? "left" : "right" } }))];

  const spanTracker = new Array(nCols).fill(0);
  for (const rawRow of b.rawRows) {
    const rowCells = [];
    let cellIdx = 0;
    for (let col = 0; col < nCols; col++) {
      if (spanTracker[col] > 0) { spanTracker[col]--; continue; }
      const cell = rawRow[cellIdx++];
      if (!cell) continue;
      if (cell.rowSpan > 1) spanTracker[col] = cell.rowSpan - 1;
      const opts = { ...cellOpts, align: col === 0 ? "left" : "right" };
      if (cell.rowSpan > 1) opts.rowspan = cell.rowSpan;
      rowCells.push({ text: cell.text, options: opts });
    }
    rows.push(rowCells);
  }

  // Give the label column most of the width — equal-width columns crush the
  // (usually much longer) first column and force ugly wraps in the short ones.
  const colW = nCols === 2 ? [w * 0.62, w * 0.38]
    : nCols === 3 ? [w * 0.52, w * 0.24, w * 0.24]
    : [w * 0.4, ...Array(nCols - 1).fill(w * 0.6 / (nCols - 1))];

  slide.addTable(rows, { x, y, w, h, colW, border: { type: "solid", color: CARD_BORDER, pt: 0.75 }, autoPage: false });
}

async function addImageBlockOnSlide(slide, b, x, y, w, h) {
  const imgPath = resolveAssetPath(b.src);
  if (!imgPath) return;
  const finalPath = await rasterizeIfSvg(imgPath);
  slide.addImage({ path: finalPath, x, y, w, h: h - (b.caption ? 0.3 : 0), sizing: { type: "contain", w, h: h - (b.caption ? 0.3 : 0) } });
  if (b.caption) slide.addText(b.caption, { x, y: y + h - 0.28, w, h: 0.28, align: "center", fontFace: FONT.light, fontSize: 8.5, color: TEXT_MUTED });
}

/** Estimated height for a set of extracted lines, matching the per-kind increments
    used below in addRawFallback — so the caller can advance its own layout cursor
    by the REAL content height instead of guessing / reserving all remaining space. */
function estimateRawHeight(lines) {
  let h = 0;
  for (const line of lines) {
    if (line.kind === "heading") h += 0.42;
    else if (line.kind === "para") h += 0.5;
    else if (line.kind === "bullet") h += 0.36;
    else if (line.kind === "pill") h += 0.42;
    else if (line.kind === "image") h += 1.72;
  }
  return h;
}

async function addRawFallback(slide, lines, x, y, w, h) {
  let cy = y;
  for (const line of lines) {
    if (cy > y + h - 0.2) break; // ran out of vertical room for this column
    if (line.kind === "heading") {
      slide.addText(line.text, { x, y: cy, w, h: 0.4, fontFace: FONT.semiBold, bold: true, fontSize: 13, color: TEXT_WHITE });
      cy += 0.42;
    } else if (line.kind === "para") {
      slide.addText(line.text, { x, y: cy, w, h: 0.5, fontFace: FONT.regular, fontSize: 9.5, color: TEXT_MUTED, valign: "top" });
      cy += 0.5;
    } else if (line.kind === "bullet") {
      slide.addText("•  " + line.text, { x: x + 0.1, y: cy, w: w - 0.1, h: 0.35, fontFace: FONT.regular, fontSize: 9.5, color: TEXT_MUTED, valign: "top" });
      cy += 0.36;
    } else if (line.kind === "pill") {
      slide.addText(line.text, {
        x, y: cy, w: Math.min(w, 3), h: 0.32, fontFace: FONT.mono, fontSize: 8.5, color: ACCENT_BLUE,
        fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 0.75 }, align: "center", valign: "middle",
      });
      cy += 0.42;
    } else if (line.kind === "image") {
      const imgPath = resolveAssetPath(line.src);
      if (imgPath) {
        try {
          const finalPath = await rasterizeIfSvg(imgPath);
          const ih = Math.min(1.6, y + h - cy);
          slide.addImage({ path: finalPath, x, y: cy, w: Math.min(w, ih * 1.4), h: ih, sizing: { type: "contain", w: Math.min(w, ih * 1.4), h: ih } });
          cy += ih + 0.12;
        } catch (e) { /* unreadable image — skip */ }
      }
    }
  }
}

/* ============================================================
   Bespoke full-slide renderers for the pieces that don't map onto
   simple blocks at all (detected by content signature).
   ============================================================ */
function isCoverSlide(entry) {
  return entry.blocks.some(b => b.type === "raw" && /Agile,\s*Secure/i.test(b.html) && /GENERAL/i.test(b.html));
}
function isValueChainSlide(entry) {
  return entry.blocks.some(b => b.type === "raw" && /vc-box|Cadena de valor completa/i.test(b.html));
}

function renderCoverSlide() {
  const slide = pptx.addSlide();
  addBackground(slide);
  slide.addShape(pptx.ShapeType.roundRect, { x: 5.13, y: 1.55, w: 3.08, h: 0.42, rectRadius: 0.21, fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 } });
  slide.addText("✦  JULIO 2026", { x: 5.13, y: 1.55, w: 3.08, h: 0.42, align: "center", valign: "middle", fontFace: FONT.mono, fontSize: 11, color: TEXT_MUTED });
  slide.addText("TOKEN CITY", { x: 0, y: 2.3, w: 13.333, h: 1.3, align: "center", fontFace: FONT.black, bold: true, fontSize: 54, color: TEXT_WHITE, charSpacing: 1 });
  slide.addText("Agile, Secure & Liquid", { x: 0, y: 3.55, w: 13.333, h: 0.5, align: "center", fontFace: FONT.light, fontSize: 18, color: TEXT_MUTED });
  slide.addShape(pptx.ShapeType.line, { x: 5.13, y: 4.7, w: 3.08, h: 0, line: { color: CARD_BORDER, width: 1 } });
  slide.addText("DOSSIER", { x: 0, y: 4.85, w: 13.333, h: 0.35, align: "center", fontFace: FONT.mono, fontSize: 12, color: TEXT_MUTED, charSpacing: 3 });
  slide.addText("GENERAL", { x: 0, y: 5.15, w: 13.333, h: 0.7, align: "center", fontFace: FONT.light, fontSize: 34, color: TEXT_WHITE });
  slide.addShape(pptx.ShapeType.line, { x: 5.13, y: 6.05, w: 3.08, h: 0, line: { color: CARD_BORDER, width: 1 } });
}

function renderValueChainSlide() {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide);
  addTitle(slide, "Cadena de valor completa", 0.65);

  const GREEN_FILL = "1F3A2A", GREEN_BORDER = "22C55E";
  const BLUE_FILL = "132A4D", BLUE_BORDER = "4D8DFF";
  const PURPLE_FILL = "241B3D", PURPLE_BORDER = "8B5CF6";

  function box({ x, y, w, h, fill, border, title, sub, dashed = false }) {
    slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: fill }, line: { color: border, width: 1.5, dashType: dashed ? "dash" : "solid" } });
    slide.addText(
      [{ text: title, options: { fontSize: 12, bold: true, color: TEXT_WHITE, breakLine: true, fontFace: FONT.semiBold } },
       ...(sub ? [{ text: sub, options: { fontSize: 9, color: "E5E9F0", fontFace: FONT.regular } }] : [])],
      { x: x + 0.1, y, w: w - 0.2, h, align: "center", valign: "middle" }
    );
  }
  function conn(x1, y1, x2, y2) {
    slide.addShape(pptx.ShapeType.line, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01, line: { color: "FFFFFF", width: 1, transparency: 55 }, flipH: x2 < x1, flipV: y2 < y1 });
  }

  const left = 0.6, top = 1.7, totalW = 12.1;
  const col1 = totalW * 0.19, col234 = (totalW - col1 - 0.3) / 3;
  const gap = 0.15;
  const row1H = 0.75, row2H = 1.55, row3H = 1.1, row4H = 0.75, rowGap = 0.25;
  const x1 = left, x2 = left + col1 + gap, x3 = x2 + col234 + gap, x4 = x3 + col234 + gap;
  const y1 = top, y2 = y1 + row1H + rowGap, y3 = y2 + row2H + rowGap, y4 = y3 + row3H + rowGap;

  box({ x: x1, y: y1, w: col1, h: row1H, fill: GREEN_FILL, border: GREEN_BORDER, title: "Clientes inversores", sub: "(Ecosistema del cliente Emisor)" });
  box({ x: x2, y: y1, w: col234 * 3 + gap * 2, h: row1H, fill: BLUE_FILL, border: BLUE_BORDER, title: "Clientes inversores", sub: "(Ecosistema de Token City)" });
  box({ x: x1, y: y2, w: col1, h: row2H + rowGap + row3H, fill: GREEN_FILL, border: GREEN_BORDER, title: "Cliente Emisor" });
  box({ x: x2, y: y2, w: col234, h: row2H, fill: BLUE_FILL, border: BLUE_BORDER, title: "Plataforma de tokenización y emisión primaria", sub: "(Personalizada con la marca del Emisor)" });
  box({ x: x3, y: y2, w: col234, h: row2H, fill: BLUE_FILL, border: BLUE_BORDER, title: "Plataforma de tokenización y emisión primaria", sub: "(Plataforma regulada de Token City)" });
  box({ x: x4, y: y2, w: col234, h: row2H + rowGap + row3H, fill: PURPLE_FILL, border: PURPLE_BORDER, title: "Mercado secundario", sub: "(Plataforma regulada de Token City)", dashed: true });
  box({ x: x2, y: y3, w: col234 * 2 + gap, h: row3H, fill: BLUE_FILL, border: BLUE_BORDER, title: "ERIR", sub: "(Plataforma regulada de Token City)" });
  box({ x: x1, y: y4, w: totalW, h: row4H, fill: BLUE_FILL, border: BLUE_BORDER, title: "SERVICIO BLOCKCHAIN" });

  conn(x1 + col1 / 2, y1 + row1H, x1 + col1 / 2, y2);
  conn(x3 + col234 / 2, y1 + row1H, x3 + col234 / 2, y2);
  conn(x1 + col1, y2 + row2H / 2, x2, y2 + row2H / 2);
  conn(x2 + col234, y2 + row2H / 2, x3, y2 + row2H / 2);
  conn(x3 + col234, y2 + row2H / 2, x4, y2 + row2H / 2);
  conn(x1 + col1, y3 + row3H / 2, x2, y3 + row3H / 2);
  conn(x2 + col234 * 2 + gap, y3 + row3H / 2, x4, y3 + row3H / 2);
  conn(x2 + col234, y3 + row3H, x2 + col234, y4);
}

/* ============================================================
   Generic slide renderer (title/paragraph/card/logo/table/image/raw)
   ============================================================ */
async function renderGenericSlide(entry) {
  const slide = pptx.addSlide();
  addBackground(slide);
  addKicker(slide);

  const marginX = 0.6, contentW = 13.333 - marginX * 2, gap = 0.24;
  let cy = 0.7;
  const blocks = entry.blocks || [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "title") {
      addTitle(slide, b.text, cy);
      cy += 0.85;
      i++;
    } else if (b.type === "subtitle") {
      slide.addText(b.text, { x: marginX, y: cy, w: contentW, h: 0.4, fontFace: FONT.semiBold, bold: true, fontSize: 16, color: TEXT_WHITE });
      cy += 0.5;
      i++;
    } else if (b.type === "paragraph") {
      slide.addText(b.text, { x: marginX, y: cy, w: contentW * 0.85, h: 0.7, fontFace: FONT.regular, fontSize: 13, color: TEXT_MUTED, valign: "top" });
      cy += 0.85;
      i++;
    } else if (b.type === "table") {
      const rowsN = 1 + b.rawRows.length;
      const h = Math.min(5.4, 0.5 + rowsN * 0.5);
      addTableBlock(slide, b, marginX, cy, contentW, h);
      cy += h + gap;
      i++;
    } else if (b.type === "image") {
      const h = 2.6;
      await addImageBlockOnSlide(slide, b, marginX, cy, Math.min(contentW, 8), h);
      cy += h + gap;
      i++;
    } else if (b.type === "raw") {
      const lines = extractTextLines(b.html);
      const remaining = Math.max(0.4, 7.3 - cy);
      const h = Math.min(estimateRawHeight(lines), remaining);
      await addRawFallback(slide, lines, marginX, cy, contentW, h);
      cy += h + gap;
      i++;
    } else if (b.type === "card" || b.type === "logo") {
      // group consecutive card/logo blocks of the SAME declared width into one row
      const group = [];
      while (i < blocks.length && blocks[i].type === b.type) { group.push(blocks[i]); i++; }
      const perRow = Math.min(widthToFlexFraction(group[0].width || "third"), 4);
      // A row of icon+title-only cards (no description — e.g. the index/TOC list) needs
      // far less height than a real icon+title+description card; sizing them all at 1.7"
      // was pushing 5 stacked rows of 9 TOC entries to ~11" and off the bottom of the slide.
      const anyDesc = group.some(c => (c.desc || "").trim().length > 0);
      let gi = 0;
      while (gi < group.length) {
        const rowItems = group.slice(gi, gi + perRow);
        const cellW = (contentW - gap * (rowItems.length - 1)) / rowItems.length;
        const rowH = b.type === "card" ? (anyDesc ? 1.7 : 0.65) : 1.5;
        for (let c = 0; c < rowItems.length; c++) {
          const x = marginX + c * (cellW + gap);
          if (b.type === "card") await addCardBlock(slide, rowItems[c], x, cy, cellW, rowH);
          else await addLogoBlock(slide, rowItems[c], x, cy, cellW, rowH);
        }
        cy += rowH + gap;
        gi += perRow;
      }
    } else {
      i++;
    }
    if (cy > 7.2) {
      console.warn(`  ! slide ${entry.id}: ran out of vertical room after block ${i}/${blocks.length} (cy=${cy.toFixed(2)}) — some content was dropped`);
      break; // out of vertical room — remaining blocks would overflow the slide
    }
  }
  if (cy > 7.6) console.warn(`  ! slide ${entry.id}: content ended at cy=${cy.toFixed(2)}, likely overflowing the 7.5in slide`);
}

/* ============================================================
   Main
   ============================================================ */
async function main() {
  const slides = loadSlides();
  console.log(`Loaded ${slides.length} slides from the live deck.`);

  for (const entry of slides) {
    if (entry.type === "blocks" && isCoverSlide(entry)) { renderCoverSlide(); continue; }
    if (entry.type === "blocks" && isValueChainSlide(entry)) { renderValueChainSlide(); continue; }
    if (entry.type === "raw") {
      // Legacy whole-slide raw entry (only happens if slides-data was saved by an older
      // editor version) — treat its full HTML as a single raw block on a generic slide.
      await renderGenericSlide({ blocks: [{ type: "raw", html: entry.html, width: "full" }] });
      continue;
    }
    await renderGenericSlide(entry);
  }

  const outPath = path.join(ROOT, "TokenCity-Dossier-COMPLETO.pptx");
  await pptx.writeFile({ fileName: outPath });
  console.log("Saved:", outPath, `(${slides.length} slides)`);
}

main().catch(err => { console.error(err); process.exit(1); });
