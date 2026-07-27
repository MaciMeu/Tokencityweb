const PptxGenJS = require("pptxgenjs");
const path = require("path");
const { getIconPath } = require("./icon-gen");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "TC_16x9", width: 13.333, height: 7.5 });
pptx.layout = "TC_16x9";

// ---------- Token City palette ----------
const BG = "05070A";
const CARD_BG = "12161F";
const CARD_BORDER = "2A3140";
const TEXT_WHITE = "FFFFFF";
const TEXT_MUTED = "9AA3B2";
const PRIMARY_BLUE = "1855BA";
const ACCENT_BLUE = "4D8DFF";

const FONT_TITLE = "Montserrat";
const FONT_MONO = "Consolas"; // JetBrains Mono is unlikely to be installed on most Windows/Mac PPT viewers

const GEN_DIR = path.join(__dirname, "generated");

function addBackground(slide) {
  slide.background = { path: path.join(GEN_DIR, "slide-bg.png") };
}

function addKicker(slide, text = "TOKEN CITY", opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.6, y: opts.y ?? 0.35, w: opts.w ?? 4, h: 0.3,
    fontFace: FONT_MONO, fontSize: 11, bold: true, color: ACCENT_BLUE,
    charSpacing: 2, align: opts.align ?? "left",
  });
}

function addTitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.6, y: opts.y ?? 0.65, w: opts.w ?? 12, h: opts.h ?? 0.9,
    fontFace: FONT_TITLE, fontSize: opts.fontSize ?? 32, bold: true, color: TEXT_WHITE,
    align: opts.align ?? "left",
  });
}

function addLead(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.6, y: opts.y ?? 1.5, w: opts.w ?? 11, h: opts.h ?? 0.7,
    fontFace: FONT_TITLE, fontSize: opts.fontSize ?? 14, color: TEXT_MUTED,
    align: opts.align ?? "left", valign: "top",
  });
}

/** A "bento"-style card: dark rounded rect + colored left accent bar + real icon (rendered
    in the card's own accent color) + title + text. compact:true lays out icon | title+desc
    in a single horizontal row (for short, wide cards). */
async function addBentoCard(slide, { x, y, w, h, accent = ACCENT_BLUE, iconName, title, desc, compact = false }) {
  // card body
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: CARD_BG },
    line: { color: CARD_BORDER, width: 1 },
  });
  // left accent bar — inset well clear of the corner curve, small radius so it reads as one piece with the card
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: y + 0.16, w: 0.07, h: h - 0.32, rectRadius: 0.02,
    fill: { color: accent }, line: { type: "none" },
  });

  const iconSize = compact ? Math.min(0.56, h - 0.4) : 0.46;
  const iconX = x + 0.3;
  const iconY = compact ? y + (h - iconSize) / 2 : y + 0.24;

  slide.addShape(pptx.ShapeType.ellipse, {
    x: iconX, y: iconY, w: iconSize, h: iconSize,
    fill: { color: accent, transparency: 78 },
    line: { color: accent, width: 1.25 },
  });
  if (iconName) {
    // Icon is rendered in the SAME color as this card's accent, on demand (cached after first render).
    const iconPath = await getIconPath(iconName, accent);
    const pad = 0.13;
    slide.addImage({
      path: iconPath,
      x: iconX + pad / 2, y: iconY + pad / 2, w: iconSize - pad, h: iconSize - pad,
    });
  }

  if (compact) {
    const textX = iconX + iconSize + 0.28;
    slide.addText(
      [
        { text: title, options: { fontSize: 15, bold: true, color: TEXT_WHITE, breakLine: true } },
        ...(desc ? [{ text: desc, options: { fontSize: 10.5, color: TEXT_MUTED } }] : []),
      ],
      { x: textX, y, w: w - (textX - x) - 0.3, h, fontFace: FONT_TITLE, valign: "middle" }
    );
  } else {
    slide.addText(title, {
      x: x + 0.3, y: y + 0.82, w: w - 0.58, h: 0.4,
      fontFace: FONT_TITLE, fontSize: 15, bold: true, color: TEXT_WHITE,
    });
    if (desc) {
      slide.addText(desc, {
        x: x + 0.3, y: y + 1.22, w: w - 0.58, h: h - 1.32,
        fontFace: FONT_TITLE, fontSize: 10.5, color: TEXT_MUTED, valign: "top",
      });
    }
  }
}

/** vChain diagram box */
function addChainBox(slide, { x, y, w, h, fill, border, title, sub, dashed = false }) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: fill },
    line: { color: border, width: 1.5, dashType: dashed ? "dash" : "solid" },
  });
  slide.addText(
    [
      { text: title, options: { fontSize: 12, bold: true, color: TEXT_WHITE, breakLine: true } },
      ...(sub ? [{ text: sub, options: { fontSize: 9, color: "E5E9F0" } }] : []),
    ],
    { x: x + 0.1, y, w: w - 0.2, h, align: "center", valign: "middle", fontFace: FONT_TITLE }
  );
}

function addChainConnector(slide, { x1, y1, x2, y2 }) {
  slide.addShape(pptx.ShapeType.line, {
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01,
    line: { color: "FFFFFF", width: 1, transparency: 55 },
    flipH: x2 < x1, flipV: y2 < y1,
  });
}

async function main() {
  /* ============================================================
     SLIDE 1 — Cover
     ============================================================ */
  {
    const slide = pptx.addSlide();
    addBackground(slide);

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.13, y: 1.55, w: 3.08, h: 0.42, rectRadius: 0.21,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("✦  JULIO 2026", {
      x: 5.13, y: 1.55, w: 3.08, h: 0.42, align: "center", valign: "middle",
      fontFace: FONT_MONO, fontSize: 11, color: TEXT_MUTED,
    });

    slide.addText("TOKEN CITY", {
      x: 0, y: 2.3, w: 13.333, h: 1.3, align: "center",
      fontFace: FONT_TITLE, fontSize: 54, bold: true, color: TEXT_WHITE, charSpacing: 1,
    });
    slide.addText("Agile, Secure & Liquid", {
      x: 0, y: 3.55, w: 13.333, h: 0.5, align: "center",
      fontFace: FONT_TITLE, fontSize: 18, color: TEXT_MUTED,
    });

    slide.addShape(pptx.ShapeType.line, {
      x: 5.13, y: 4.7, w: 3.08, h: 0,
      line: { color: CARD_BORDER, width: 1 },
    });
    slide.addText("DOSSIER", {
      x: 0, y: 4.85, w: 13.333, h: 0.35, align: "center",
      fontFace: FONT_MONO, fontSize: 12, color: TEXT_MUTED, charSpacing: 3,
    });
    slide.addText("GENERAL", {
      x: 0, y: 5.15, w: 13.333, h: 0.7, align: "center",
      fontFace: FONT_TITLE, fontSize: 34, color: TEXT_WHITE,
    });
    slide.addShape(pptx.ShapeType.line, {
      x: 5.13, y: 6.05, w: 3.08, h: 0,
      line: { color: CARD_BORDER, width: 1 },
    });
  }

  /* ============================================================
     SLIDE 2 — Bento (¿Qué valor tienen los tokens?)
     ============================================================ */
  {
    const slide = pptx.addSlide();
    addBackground(slide);
    addKicker(slide);
    addTitle(slide, "¿Qué valor tienen los tokens?");
    addLead(
      slide,
      "Depende de lo que representen. Típicamente los RWAs ofrecen participación en un negocio, interés sobre una deuda, participación en la rentabilidad u otros productos más complejos.",
      { w: 11.6 }
    );

    const cardY = 2.5, cardH = 1.9, gap = 0.35, marginX = 0.6;
    const cardW = (13.333 - marginX * 2 - gap * 2) / 3;

    await addBentoCard(slide, {
      x: marginX, y: cardY, w: cardW, h: cardH, accent: "B5474D", iconName: "users",
      title: "Acciones", desc: "Participación en el capital del negocio",
    });
    await addBentoCard(slide, {
      x: marginX + (cardW + gap), y: cardY, w: cardW, h: cardH, accent: "7A5AA8", iconName: "check-check",
      title: "Deuda", desc: "Interés sobre un préstamo o bono",
    });
    await addBentoCard(slide, {
      x: marginX + (cardW + gap) * 2, y: cardY, w: cardW, h: cardH, accent: "9A8F3A", iconName: "bar-chart-3",
      title: "Ganancias", desc: "Participación en la rentabilidad",
    });

    await addBentoCard(slide, {
      x: marginX, y: cardY + cardH + gap, w: 13.333 - marginX * 2, h: 1.15, accent: ACCENT_BLUE, iconName: "layers",
      title: "Otros", desc: "Productos financieros más complejos, combinación de los anteriores", compact: true,
    });
  }

  /* ============================================================
     SLIDE 3 — Tarifas (native editable table)
     ============================================================ */
  {
    const slide = pptx.addSlide();
    addBackground(slide);
    addKicker(slide);
    addTitle(slide, "Tarifas — Infraestructura tecnológica", { fontSize: 28 });

    const headerOpts = {
      fill: { color: PRIMARY_BLUE }, color: TEXT_WHITE, bold: true,
      fontFace: FONT_MONO, fontSize: 10.5, align: "left", valign: "middle",
    };
    const cellOpts = {
      fill: { color: CARD_BG }, color: TEXT_WHITE,
      fontFace: FONT_TITLE, fontSize: 11, valign: "middle",
    };
    const cellMuted = { ...cellOpts, color: TEXT_MUTED, fontSize: 9.5 };

    const rows = [
      [
        { text: "Servicios tecnológicos", options: headerOpts },
        { text: "Fijo", options: { ...headerOpts, align: "right" } },
        { text: "Variable anual", options: { ...headerOpts, align: "right" } },
      ],
      [
        { text: "SetUp plataforma personalizada — Marca Blanca", options: cellOpts },
        { text: "Desde 5.000€ (+10.000€ multi-emisión, +5.000€ web, +5.000€ API)", options: { ...cellMuted, align: "right" } },
        { text: "", options: cellOpts },
      ],
      [
        { text: "Desarrollo de Smart Contracts", options: cellOpts },
        { text: "5.000€ por tipo de activo, despliegues ilimitados", options: { ...cellMuted, align: "right" } },
        { text: "", options: cellOpts },
      ],
      [
        { text: "Servicio de vehiculización y mantenimiento", options: cellOpts },
        { text: "", options: cellOpts },
        { text: "0,1 – 0,3% del volumen (mín. 6.000€/año)", options: { ...cellOpts, align: "right" } },
      ],
      [
        { text: "Gestión de Wallets", options: cellOpts },
        { text: "", options: cellOpts },
        { text: "1,2€ – 3€ / wallet / año", options: { ...cellOpts, align: "right" } },
      ],
      [
        { text: "KYC / KYB / AML", options: cellOpts },
        { text: "3€ (física) · 25€ (jurídica)", options: { ...cellOpts, align: "right" } },
        { text: "0,2€/pax (monitorización anual)", options: { ...cellOpts, align: "right" } },
      ],
      [
        { text: "Gestión automatizada de pagos a inversores", options: cellOpts },
        { text: "", options: cellOpts },
        { text: "0,2% del importe transaccionado", options: { ...cellOpts, align: "right" } },
      ],
    ];

    slide.addTable(rows, {
      x: 0.6, y: 1.65, w: 12.1, h: 5.2,
      colW: [6.3, 3.1, 2.7],
      border: { type: "solid", color: CARD_BORDER, pt: 0.75 },
      autoPage: false,
    });
  }

  /* ============================================================
     SLIDE 4 — Cadena de valor completa (diagram + connectors)
     ============================================================ */
  {
    const slide = pptx.addSlide();
    addBackground(slide);
    addKicker(slide);
    addTitle(slide, "Cadena de valor completa", { fontSize: 28 });

    const GREEN_FILL = "1F3A2A", GREEN_BORDER = "22C55E";
    const BLUE_FILL = "132A4D", BLUE_BORDER = "4D8DFF";
    const PURPLE_FILL = "241B3D", PURPLE_BORDER = "8B5CF6";

    const left = 0.6, top = 1.7, totalW = 12.1;
    const col1 = totalW * 0.19, col234 = (totalW - col1 - 0.3) / 3;
    const gap = 0.15;
    const row1H = 0.75, row2H = 1.55, row3H = 1.1, row4H = 0.75;
    const rowGap = 0.25;

    const x1 = left;
    const x2 = left + col1 + gap;
    const x3 = x2 + col234 + gap;
    const x4 = x3 + col234 + gap;

    const y1 = top;
    const y2 = y1 + row1H + rowGap;
    const y3 = y2 + row2H + rowGap;
    const y4 = y3 + row3H + rowGap;

    // Row 1
    addChainBox(slide, { x: x1, y: y1, w: col1, h: row1H, fill: GREEN_FILL, border: GREEN_BORDER, title: "Clientes inversores", sub: "(Ecosistema del cliente Emisor)" });
    addChainBox(slide, { x: x2, y: y1, w: col234 * 3 + gap * 2, h: row1H, fill: BLUE_FILL, border: BLUE_BORDER, title: "Clientes inversores", sub: "(Ecosistema de Token City)" });

    // Rows 2-3 (Cliente Emisor + Mercado secundario span both)
    addChainBox(slide, { x: x1, y: y2, w: col1, h: row2H + rowGap + row3H, fill: GREEN_FILL, border: GREEN_BORDER, title: "Cliente Emisor" });
    addChainBox(slide, { x: x2, y: y2, w: col234, h: row2H, fill: BLUE_FILL, border: BLUE_BORDER, title: "Plataforma de tokenización y emisión primaria", sub: "(Personalizada con la marca del Emisor)" });
    addChainBox(slide, { x: x3, y: y2, w: col234, h: row2H, fill: BLUE_FILL, border: BLUE_BORDER, title: "Plataforma de tokenización y emisión primaria", sub: "(Plataforma regulada de Token City)" });
    addChainBox(slide, { x: x4, y: y2, w: col234, h: row2H + rowGap + row3H, fill: PURPLE_FILL, border: PURPLE_BORDER, title: "Mercado secundario", sub: "(Plataforma regulada de Token City)", dashed: true });

    // Row 3 — ERIR spans cols 2-3
    addChainBox(slide, { x: x2, y: y3, w: col234 * 2 + gap, h: row3H, fill: BLUE_FILL, border: BLUE_BORDER, title: "ERIR", sub: "(Plataforma regulada de Token City)" });

    // Row 4 — Blockchain full width
    addChainBox(slide, { x: x1, y: y4, w: totalW, h: row4H, fill: BLUE_FILL, border: BLUE_BORDER, title: "SERVICIO BLOCKCHAIN" });

    // Connectors
    addChainConnector(slide, { x1: x1 + col1 / 2, y1: y1 + row1H, x2: x1 + col1 / 2, y2: y2 });
    addChainConnector(slide, { x1: x3 + col234 / 2, y1: y1 + row1H, x2: x3 + col234 / 2, y2: y2 });
    addChainConnector(slide, { x1: x1 + col1, y1: y2 + row2H / 2, x2: x2, y2: y2 + row2H / 2 });
    addChainConnector(slide, { x1: x2 + col234, y1: y2 + row2H / 2, x2: x3, y2: y2 + row2H / 2 });
    addChainConnector(slide, { x1: x3 + col234, y1: y2 + row2H / 2, x2: x4, y2: y2 + row2H / 2 });
    addChainConnector(slide, { x1: x1 + col1, y1: y3 + row3H / 2, x2: x2, y2: y3 + row3H / 2 });
    addChainConnector(slide, { x1: x2 + col234 * 2 + gap, y1: y3 + row3H / 2, x2: x4, y2: y3 + row3H / 2 });
    addChainConnector(slide, { x1: x2 + col234, y1: y3 + row3H, x2: x2 + col234, y2: y4 });
  }

  const fileName = await pptx.writeFile({ fileName: path.join(__dirname, "..", "TokenCity-Dossier-PREVIEW.pptx") });
  console.log("Saved:", fileName);
}

main().catch(err => { console.error(err); process.exit(1); });
