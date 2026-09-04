/**
 * Reusable flyer/promo-graphic compositing templates for Lúa Eventos and Luaser.
 *
 * Consolidates the layout patterns already proven on this project (full-bleed headline,
 * bottom band, side panel, polaroid frame, quote/promo card) into one library instead of
 * rewriting sharp/SVG compositing per request. Extend this file with new template functions
 * as new layout needs come up — don't start a fresh one-off script.
 *
 * Usage as a library:
 *   const { fullBleed, bottomBand, sidePanel, polaroid, quoteCard, BRANDS } = require("./flyer.js");
 *   await bottomBand({ photoPath, eyebrow, headline, logoPath, brand: BRANDS.luaEventos, width: 1080, height: 1080, outPath });
 *
 * Usage from the CLI with a JSON config (one or more slides):
 *   node flyer.js config.json
 *   // config.json: { "slides": [ { "template": "bottomBand", ...params } ] }
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// ---- Brand palettes — see references/brand-guides.md for the source of truth. Keep in sync. ----
const BRANDS = {
  luaEventos: {
    navy: "#1B4A6B",
    navyDark: "#0B1423",
    accent: "#F5AF95",
    urgency: "#E63980",
    text: "#ffffff",
  },
  luaser: {
    navy: "#0B0C0E",
    navyDark: "#16181C",
    accent: "#E8927A",
    urgency: "#E63980",
    text: "#ffffff",
  },
};

// ---- Text helpers ----

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// SVG text rendered with system fonts (Arial-family) has no emoji glyphs available — they
// render as blank boxes ("tofu"). Strip them rather than trying to render them. See
// content-critic-loop's image-checklist.md for why this matters.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu;
function stripEmoji(s) {
  return s.replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}

function wrapText(rawText, maxCharsPerLine) {
  const text = stripEmoji(rawText).replace(/\n/g, " ");
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxCharsPerLine) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ---- Logo helper ----

async function circleLogo(logoPath, size) {
  return sharp(logoPath)
    .resize(size, size)
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: "dest-in" }])
    .png()
    .toBuffer();
}

function ringSvg(size) {
  return `<svg width="${size + 8}" height="${size + 8}"><circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2 + 2}" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`;
}

// ---- Templates ----

/**
 * Full-bleed photo with a top gradient scrim, headline text, and a corner logo badge.
 * Good default for a single strong photo carrying most of the message.
 */
async function fullBleed({ photoPath, headline, logoPath, brand, width = 1080, height = 1080, outPath, logoCorner = "right" }) {
  const lines = wrapText(headline, width === height ? 22 : 20);
  const fontSize = 56;
  const lineHeight = 70;
  const startY = 100;
  const textSvgLines = lines
    .map((line, i) => `<text x="56" y="${startY + i * lineHeight}" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff">${escapeXml(line)}</text>`)
    .join("\n");

  const logoSize = 84;
  const logoTop = 36;
  const logoLeft = logoCorner === "right" ? width - logoSize - 36 : 36;

  const overlaySvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${brand.navyDark}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${brand.navyDark}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="320" fill="url(#g)"/>
    ${textSvgLines}
  </svg>`;

  const logoBuf = await circleLogo(logoPath, logoSize);

  await sharp(photoPath)
    .resize(width, height, { fit: "cover" })
    .composite([
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      { input: logoBuf, top: logoTop, left: logoLeft },
      { input: Buffer.from(ringSvg(logoSize)), top: logoTop - 4, left: logoLeft - 4 },
    ])
    .png()
    .toFile(outPath);
}

/**
 * Photo with an opaque gradient band across the bottom carrying an eyebrow label + headline.
 * Good when the top of the photo needs to stay fully visible (e.g. a wide establishing shot).
 */
async function bottomBand({ photoPath, eyebrow, headline, logoPath, brand, width = 1080, height = 1080, outPath }) {
  const lines = wrapText(headline, 24);
  const bandHeight = 260 + lines.length * 10;
  const fontSize = 50;

  const textSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="${brand.navyDark}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${brand.navyDark}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${height - bandHeight}" width="${width}" height="${bandHeight}" fill="url(#g)"/>
    ${eyebrow ? `<text x="56" y="${height - bandHeight + 90}" font-family="Arial, sans-serif" font-weight="700" font-size="26" letter-spacing="3" fill="${brand.accent}">${escapeXml(stripEmoji(eyebrow).toUpperCase())}</text>` : ""}
    ${lines.map((l, i) => `<text x="56" y="${height - bandHeight + 150 + i * 62}" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff">${escapeXml(l)}</text>`).join("\n")}
  </svg>`;

  const logoSize = 78;
  const logoBuf = await circleLogo(logoPath, logoSize);

  await sharp(photoPath)
    .resize(width, height, { fit: "cover" })
    .composite([
      { input: Buffer.from(textSvg), top: 0, left: 0 },
      { input: logoBuf, top: 36, left: 36 },
      { input: Buffer.from(ringSvg(logoSize)), top: 32, left: 32 },
    ])
    .png()
    .toFile(outPath);
}

/**
 * Photo on one side, solid brand-color panel with text on the other. Keeps the whole photo
 * visible with zero scrim — use when the photo itself shouldn't be dimmed at all.
 */
async function sidePanel({ photoPath, eyebrow, headline, logoPath, brand, size = 1080, outPath, panelSide = "right", panelWidth = 380 }) {
  const photoWidth = size - panelWidth;
  const lines = wrapText(headline, 14);

  const photoResized = await sharp(photoPath).resize(photoWidth, size, { fit: "cover" }).toBuffer();

  const panelSvg = `
  <svg width="${panelWidth}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${panelWidth}" height="${size}" fill="${brand.navy}"/>
    ${eyebrow ? `<text x="40" y="120" font-family="Arial, sans-serif" font-weight="700" font-size="24" letter-spacing="2" fill="${brand.accent}">${escapeXml(stripEmoji(eyebrow).toUpperCase())}</text>` : ""}
    ${lines.map((l, i) => `<text x="40" y="${180 + i * 58}" font-family="Arial, sans-serif" font-weight="800" font-size="44" fill="#ffffff">${escapeXml(l)}</text>`).join("\n")}
  </svg>`;

  const logoSize = 90;
  const logoBuf = await circleLogo(logoPath, logoSize);

  const panelBuf = await sharp(Buffer.from(panelSvg))
    .composite([
      { input: logoBuf, top: size - logoSize - 60, left: 40 },
      { input: Buffer.from(ringSvg(logoSize)), top: size - logoSize - 64, left: 36 },
    ])
    .png()
    .toBuffer();

  const photoLeft = panelSide === "right" ? 0 : panelWidth;
  const panelLeft = panelSide === "right" ? photoWidth : 0;

  await sharp({ create: { width: size, height: size, channels: 4, background: "#000" } })
    .composite([
      { input: photoResized, top: 0, left: photoLeft },
      { input: panelBuf, top: 0, left: panelLeft },
    ])
    .png()
    .toFile(outPath);
}

/**
 * White-bordered "polaroid" photo frame with a caption below on a solid brand background.
 * Good for a single sentimental/testimonial-feeling photo rather than a bold sales message.
 */
async function polaroid({ photoPath, headline, logoPath, brand, size = 1080, outPath }) {
  const margin = 60;
  const photoSize = size - margin * 2;
  const captionHeight = 340;
  const totalHeight = photoSize - 80 + margin + captionHeight;

  const photoResized = await sharp(photoPath).resize(photoSize, photoSize - 80, { fit: "cover" }).toBuffer();
  const lines = wrapText(headline, 26);

  const logoSize = 70;
  const logoTop = photoSize - 80 + margin + 30;
  const textStartY = logoTop + logoSize + 60;

  const frameSvg = `
  <svg width="${size}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${totalHeight}" fill="${brand.navyDark}"/>
    <rect x="${margin - 20}" y="${margin - 20}" width="${photoSize + 40}" height="${photoSize - 80 + 40}" fill="#ffffff"/>
    ${lines.map((l, i) => `<text x="${size / 2}" y="${textStartY + i * 54}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="42" fill="#ffffff">${escapeXml(l)}</text>`).join("\n")}
  </svg>`;

  const logoBuf = await circleLogo(logoPath, logoSize);

  await sharp(Buffer.from(frameSvg))
    .composite([
      { input: photoResized, top: margin, left: margin },
      { input: logoBuf, top: Math.round(logoTop), left: Math.round(size / 2 - logoSize / 2) },
    ])
    .png()
    .toFile(outPath);
}

/**
 * Text-only card on a radial brand-color background with a centered logo — for promos,
 * CTAs, or announcements with no photo. This is a generated graphic, not a photo composite,
 * so it's the one template safe to use even when no real photo fits the message.
 */
async function quoteCard({ text, logoPath, brand, width = 1080, height = 1080, outPath, accentColor }) {
  const lines = wrapText(text, 16);
  const fontSize = 68;
  const lineHeight = 84;
  const totalTextHeight = lines.length * lineHeight;
  const startY = height / 2 - totalTextHeight / 2 + 200;

  const textSvgLines = lines
    .map((line, i) => `<text x="${width / 2}" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff">${escapeXml(line)}</text>`)
    .join("\n");

  const logoSize = 220;
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rg" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stop-color="${accentColor || brand.navy}"/>
        <stop offset="100%" stop-color="${brand.navyDark}"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#rg)"/>
    ${textSvgLines}
  </svg>`;

  const logoBuf = await circleLogo(logoPath, logoSize);
  const logoTop = height / 2 - totalTextHeight / 2 - logoSize - 60;
  const logoLeft = (width - logoSize) / 2;

  await sharp(Buffer.from(svg))
    .composite([
      { input: logoBuf, top: Math.round(logoTop), left: Math.round(logoLeft) },
      { input: Buffer.from(ringSvg(logoSize)), top: Math.round(logoTop) - 5, left: Math.round(logoLeft) - 5 },
    ])
    .png()
    .toFile(outPath);
}

/**
 * Product-hero promo flyer: one large product photo bottom-left cut by the frame edge,
 * a two-tone stacked headline top-right, a small icon/feature row under the headline,
 * an isolated logo+tagline corner, a small secondary-product cluster, and a thin bottom
 * contact bar. Modeled on the classic "hero bottle + feature icons" beverage-ad layout —
 * use this whenever the brief is closer to a product ad than a photo-caption card.
 *
 * heroPhotoPath / secondaryPhotoPaths should already be tightly cropped around the product
 * (see compositing notes in graphic-designer/references) — this template feathers the edges
 * into the background but does not crop for you.
 */
async function productHero({
  width = 1080, height = 1080,
  brand, accentColor,
  headlineTop, headlineBottom,
  icons = [], // [{label}]
  logoPath, tagline,
  heroPhotoPath, heroScale = 0.42,
  secondaryPhotoPaths = [], // small cluster, opposite corner from hero
  contactLine,
  outPath,
}) {
  const accent = accentColor || brand.accent;
  const contactZone = contactLine ? 64 : 0;
  const heroW = Math.round(width * heroScale);
  const heroHRaw = Math.round(height * (heroScale * 1.55));
  const heroH = Math.min(heroHRaw, height - contactZone);
  const heroLeft = 0;
  const heroTop = height - contactZone - heroH; // bottom touches the frame/contact bar, no gap

  const heroRaw = await sharp(heroPhotoPath).resize(heroW, heroH, { fit: "cover" }).toBuffer();
  // A gradient fade on a rectangle still reads as "a photo pasted in a box" no matter how
  // generous, because the left and bottom edges stay perfectly straight — two hard right
  // angles read as a rectangle regardless of what the other two edges do. The fix used by
  // real product-ad layouts isn't hiding the edge, it's making the cut an obviously
  // deliberate diagonal — one angled line, not an attempted-but-unconvincing fade.
  const cutX = Math.round(heroW * 0.62); // where the diagonal meets the top edge
  const heroMaskSvg = `<svg width="${heroW}" height="${heroH}" xmlns="http://www.w3.org/2000/svg">
    <polygon points="0,${Math.round(heroH * 0.58)} ${cutX},0 ${heroW},0 ${heroW},${heroH} 0,${heroH}" fill="#fff"/>
  </svg>`;
  const heroFeathered = await sharp(heroRaw)
    .composite([{ input: Buffer.from(heroMaskSvg), blend: "dest-in" }])
    .blur(0.4)
    .png()
    .toBuffer();

  const headlineSize = Math.round(width * 0.082);
  const headline2Size = Math.round(width * 0.105);
  const headlineRight = width - 56;
  const headlineTopY = Math.round(height * 0.16);
  const hlLines1 = wrapText(headlineTop, 14);
  const hlLines2 = wrapText(headlineBottom, 10);

  const hl1Svg = hlLines1
    .map((l, i) => `<text x="${headlineRight}" y="${headlineTopY + i * headlineSize * 1.05}" text-anchor="end" font-family="Arial, sans-serif" font-weight="800" font-size="${headlineSize}" fill="#ffffff">${escapeXml(l)}</text>`)
    .join("\n");
  const hl2StartY = headlineTopY + hlLines1.length * headlineSize * 1.05 + headline2Size * 0.55;
  // Second headline treatment: italic + a slight rotation reads as a marker/script accent
  // against the first line's square bold weight — the two-tone contrast bar.md calls for.
  const hl2Svg = hlLines2
    .map((l, i) => `<text x="${headlineRight}" y="${hl2StartY + i * headline2Size * 1.0}" text-anchor="end" font-family="Arial, sans-serif" font-style="italic" font-weight="800" font-size="${headline2Size}" fill="${accent}" transform="rotate(-3 ${headlineRight} ${hl2StartY + i * headline2Size})">${escapeXml(l)}</text>`)
    .join("\n");

  const iconsY = hl2StartY + hlLines2.length * headline2Size * 1.0 + 60;
  const iconSize = 30;
  let iconsSvg = "";
  const iconBlockLeft = heroW + 40; // stay clear of the hero photo, which sits underneath this row
  const iconBlockWidth = headlineRight - iconBlockLeft;
  const perRow = icons.length; // one horizontal row, per bar.md mechanism 3
  const colWidth = iconBlockWidth / Math.max(perRow, 1);
  icons.forEach((ic, i) => {
    const cx = iconBlockLeft + i * colWidth + colWidth / 2;
    const cy = iconsY;
    const labelLines = wrapText(ic.label, 15);
    const labelSvg = labelLines
      .map((l, li) => `<text x="${cx}" y="${cy + iconSize / 2 + 20 + li * 16}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="12.5" fill="#ffffff">${escapeXml(l)}</text>`)
      .join("\n");
    iconsSvg += `<circle cx="${cx}" cy="${cy}" r="${iconSize / 2}" fill="none" stroke="${accent}" stroke-width="2.5"/>
      <path d="M${cx - 7} ${cy} L${cx - 2} ${cy + 5} L${cx + 7} ${cy - 6}" stroke="${accent}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${labelSvg}`;
  });

  const logoSize = 78;
  const logoBuf = await circleLogo(logoPath, logoSize);

  const bgSvg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bgGlow" cx="78%" cy="10%" r="70%">
        <stop offset="0%" stop-color="${brand.navy}"/>
        <stop offset="100%" stop-color="${brand.navyDark}"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGlow)"/>
    ${hl1Svg}
    ${hl2Svg}
    ${iconsSvg}
    ${tagline ? `<text x="56" y="${56 + logoSize + 30}" font-family="Arial, sans-serif" font-style="italic" font-weight="500" font-size="16" fill="#ffffff" opacity="0.85">${escapeXml(stripEmoji(tagline))}</text>` : ""}
  </svg>`;

  const diagLine = Buffer.from(
    `<svg width="${heroW}" height="${heroH}"><line x1="0" y1="${Math.round(heroH * 0.58)}" x2="${cutX}" y2="0" stroke="${accent}" stroke-width="4" stroke-linecap="round"/></svg>`
  );

  const composites = [
    { input: Buffer.from(bgSvg), top: 0, left: 0 },
    { input: heroFeathered, top: Math.round(heroTop), left: heroLeft },
    { input: diagLine, top: Math.round(heroTop), left: heroLeft },
    { input: logoBuf, top: 56, left: 56 },
    { input: Buffer.from(ringSvg(logoSize)), top: 52, left: 52 },
  ];

  if (secondaryPhotoPaths.length) {
    const chipSize = Math.round(heroW * 0.34);
    const chipGap = 14;
    const clusterRight = width - 56;
    const clusterTop = height - contactZone - chipSize - 20;
    for (let i = 0; i < secondaryPhotoPaths.length; i++) {
      const chipRaw = await sharp(secondaryPhotoPaths[i]).resize(chipSize, chipSize, { fit: "cover" }).toBuffer();
      const chipMask = `<svg width="${chipSize}" height="${chipSize}"><rect width="${chipSize}" height="${chipSize}" rx="14" ry="14"/></svg>`;
      const chip = await sharp(chipRaw).composite([{ input: Buffer.from(chipMask), blend: "dest-in" }]).png().toBuffer();
      const chipLeft = clusterRight - chipSize - i * (chipSize + chipGap);
      composites.push({ input: chip, top: clusterTop, left: chipLeft });
      composites.push({ input: Buffer.from(`<svg width="${chipSize + 4}" height="${chipSize + 4}"><rect x="2" y="2" width="${chipSize}" height="${chipSize}" rx="14" ry="14" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.5"/></svg>`), top: clusterTop - 2, left: chipLeft - 2 });
    }
  }

  // Contact bar goes last, on top of the hero photo and every other layer, full width —
  // this is required text and must never be obscured by anything above it.
  if (contactLine) {
    const barSvg = `<svg width="${width}" height="${contactZone}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${contactZone}" fill="${brand.navyDark}"/>
      <text x="${width / 2}" y="${contactZone / 2 + 5}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="15" letter-spacing="0.5" fill="#ffffff">${escapeXml(stripEmoji(contactLine))}</text>
    </svg>`;
    composites.push({ input: Buffer.from(barSvg), top: height - contactZone, left: 0 });
  }

  await sharp(Buffer.from(bgSvg))
    .composite(composites.slice(1))
    .png()
    .toFile(outPath);
}


/**
 * Producto centrado sobre un campo de color plano, estilo anuncio de bebida.
 *
 * El truco de este layout es que el producto NO contrasta contra el fondo: emerge
 * de el. Como no hay recorte real disponible (segmentar un vaso sobre una mesa
 * llena de gente no se puede hacer con compositing), la foto se disuelve con una
 * mascara radial hasta el color del fondo. Eso deja el vaso iluminado al centro y
 * manda el fondo movido de la foto original al mismo campo plano, sin necesidad
 * de generar nada.
 */
async function splashHero({
  size = 1080,
  brand, accentColor,
  bgColor, bgImagePath,
  heroPhotoPath, heroScale = 0.62, heroFocus = 0.45, heroIsCutout = false, heroTopPct,
  eyebrow, headline, subhead, priceLine, ctaLabel,
  logoPath,
  outPath,
}) {
  const accent = accentColor || brand.accent;
  const fondo = bgColor || brand.navy;

  const heroW = Math.round(size * heroScale);
  const heroH = Math.round(heroW * 1.35);

  // Mascara radial: opaca en el centro, transparente en el borde. Es lo que
  // funde la foto con el fondo plano sin recortar el producto.
  const mascara = Buffer.from(`<svg width="${heroW}" height="${heroH}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="m" cx="50%" cy="${Math.round(heroFocus * 100)}%" r="50%">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.34" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient></defs>
    <rect width="${heroW}" height="${heroH}" fill="url(#m)"/></svg>`);

  const hero = heroIsCutout
    ? await sharp(heroPhotoPath).resize(heroW, heroH, { fit: "inside" }).png().toBuffer()
    : await sharp(heroPhotoPath)
        .resize(heroW, heroH, { fit: "cover" })
        .composite([{ input: mascara, blend: "dest-in" }])
        .png().toBuffer();

  // Reflejo: el mismo héroe volteado y desvanecido. Da el piso liquido de la
  // referencia sin tener que inventar un charco.
  const heroMeta = await sharp(hero).metadata();
  const hW = heroMeta.width, hH = heroMeta.height;
  const refH = Math.round(hH * 0.30);
  const desvanece = Buffer.from(`<svg width="${hW}" height="${refH}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient></defs>
    <rect width="${hW}" height="${refH}" fill="url(#f)"/></svg>`);

  const reflejo = await sharp(hero).flip()
    .extract({ left: 0, top: 0, width: hW, height: refH })
    .composite([{ input: desvanece, blend: "dest-in" }])
    .blur(3).png().toBuffer();

  const heroLeft = Math.round((size - hW) / 2);
  const heroTop = Math.round(size * (heroTopPct || 0.24));
  const refTop = heroTop + hH - Math.round(hH * 0.10);

  const logo = logoPath ? await circleLogo(logoPath, 96) : null;
  const anillo = logoPath ? ringSvg(96) : null;

  const T = size, cx = T / 2;
  const velo = Buffer.from(`<svg width="${T}" height="${T}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${fondo}" stop-opacity="0"/>
      <stop offset="1" stop-color="${fondo}" stop-opacity="0.97"/>
    </linearGradient></defs>
    <rect y="${Math.round(T * 0.60)}" width="${T}" height="${Math.round(T * 0.40)}" fill="url(#v)"/></svg>`);
  const texto = Buffer.from(`<svg width="${T}" height="${T}" xmlns="http://www.w3.org/2000/svg">
    <text x="${cx}" y="86" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700"
      font-size="26" letter-spacing="7" fill="${accent}">${escapeXml(stripEmoji(eyebrow || ""))}</text>
    <text x="${cx}" y="152" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900"
      font-size="64" fill="#ffffff">${escapeXml(stripEmoji(headline || ""))}</text>
    <text x="${cx}" y="196" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700"
      font-size="30" fill="#ffffff" opacity="0.88">${escapeXml(stripEmoji(subhead || ""))}</text>

    <rect x="${cx - 300}" y="${T - 182}" width="600" height="44" rx="22" fill="${fondo}" opacity="0.82"/>
    <text x="${cx}" y="${T - 152}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700"
      font-size="26" fill="${accent}">${escapeXml(stripEmoji(priceLine || ""))}</text>
    <rect x="${cx - 175}" y="${T - 122}" width="350" height="74" rx="37" fill="#ffffff"/>
    <text x="${cx}" y="${T - 74}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800"
      font-size="30" letter-spacing="2" fill="${fondo}">${escapeXml(stripEmoji(ctaLabel || ""))}</text>
  </svg>`);

  const capas = [
    { input: reflejo, left: heroLeft, top: refTop },
    { input: hero, left: heroLeft, top: heroTop },
    ...(heroIsCutout ? [] : [{ input: velo, left: 0, top: 0 }]),
    { input: texto, left: 0, top: 0 },
  ];
  if (logo) {
    capas.push({ input: logo, left: size - 96 - 40, top: 40 });
    capas.push({ input: Buffer.from(anillo), left: size - 96 - 40, top: 40 });
  }

  const base = bgImagePath
    ? sharp(await sharp(bgImagePath).resize(size, size, { fit: "cover" }).toBuffer())
    : sharp({ create: { width: size, height: size, channels: 3, background: fondo } });
  await base.composite(capas).png().toFile(outPath);
  return outPath;
}

const TEMPLATES = { fullBleed, bottomBand, sidePanel, polaroid, quoteCard, productHero, splashHero };

// ---- CLI entry point ----

async function runFromConfig(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  for (const slide of config.slides) {
    const { template, brand: brandKey, ...params } = slide;
    const fn = TEMPLATES[template];
    if (!fn) throw new Error(`Unknown template "${template}". Available: ${Object.keys(TEMPLATES).join(", ")}`);
    const brand = BRANDS[brandKey];
    if (!brand) throw new Error(`Unknown brand "${brandKey}". Available: ${Object.keys(BRANDS).join(", ")}`);
    await fn({ ...params, brand });
    console.log("wrote:", params.outPath);
  }
}

if (require.main === module) {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error("Usage: node flyer.js <config.json>");
    process.exit(1);
  }
  runFromConfig(path.resolve(configPath)).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { fullBleed, bottomBand, sidePanel, polaroid, quoteCard, productHero, splashHero, BRANDS, stripEmoji, wrapText };



/**
 * Oferta Luaser: fondo claro, producto a sangre, barra de descuento bicolor.
 *
 * Sustituye a una version anterior de fondo negro con el porcentaje gigante.
 * El cliente la rechazo con una referencia concreta en la mano, y sus
 * mecanismos estan medidos en `public/tmp-carousel/bar-oferta-luaser.md`.
 * Los tres cambios que definen la pieza:
 *
 *   - El producto manda, no el porcentaje. Sale por el borde derecho y por el
 *     inferior, y es el objeto mas grande del cuadro.
 *   - El titular NOMBRA el producto. La version anterior nunca decia que se
 *     vendia, solo cuanto costaba.
 *   - El descuento va en una barra bicolor que se sale por la izquierda, no
 *     como numero suelto.
 *
 * Ni el precio ni el porcentaje se escriben aqui: entran desde fuera, leidos
 * del catalogo, para que un flyer no pueda prometer un precio que la tienda
 * ya no tiene. Ese error ya costo dinero una vez.
 */
async function offerSplit({
  size = 1440,
  crema = "#F7F1E7",
  tinta = "#1A1A1A",
  oro = "#C8A02E",
  gris = "#9C978E",
  marca = "LUASER",
  titular = [], // hasta 3 lineas, ya en mayusculas
  descuento, // "44%" — mitad dorada de la barra
  // Mitad negra de la barra. Era "OFF" fijo, y eso obligaba a que la pieza
  // hablara de descuento aunque no hubiera ninguno. Con precio por volumen el
  // par correcto es "10" / "PIEZAS": el cliente no puede confundirlo con una
  // promocion temporal que no existe.
  barraDer = "OFF",
  precio, // "$381"
  precioAntes, // "$686"
  etiquetaPrecio = "el set",
  detalle = "", // linea chica en mayusculas espaciadas
  cta = "PIDE EL TUYO",
  heroPhotoPath,
  outPath,
}) {
  const M = Math.round(size * 0.058); // margen izquierdo unico de TODO el texto
  const colW = Math.round(size * 0.44); // ancho de la columna de texto

  // -- foto: mitad derecha, a sangre por derecha y por abajo --
  const fw = Math.round(size * 0.62);
  const foto = await sharp(heroPhotoPath)
    .resize(fw, size, { fit: "cover", position: sharp.strategy.attention })
    .toBuffer();
  // El flanco izquierdo se funde al crema para que no haya costura recta entre
  // panel y foto: en la referencia el borde es suave, no una linea.
  const mask = `<svg width="${fw}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="fx" x1="0" y1="0" x2="0.34" y2="0">
      <stop offset="0%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="1"/>
    </linearGradient></defs>
    <rect width="${fw}" height="${size}" fill="url(#fx)"/>
  </svg>`;
  const fotoCortada = await sharp(foto)
    .composite([{ input: Buffer.from(mask), blend: "dest-in" }])
    .png()
    .toBuffer();

  // -- retícula vertical del texto --
  const yMarca = Math.round(size * 0.125);
  // El titular tiene que ser el bloque de texto mas grande (mecanismo 3). Con
  // 0.052 contra un precio de 0.088 la jerarquia salia invertida: el numero le
  // ganaba al nombre del producto, y un flyer que no dice que vende falla
  // aunque se vea bien.
  const tTam = Math.round(size * 0.075);
  const yTit = Math.round(size * 0.185);
  const barH = Math.round(size * 0.108);
  const yBar = Math.round(size * 0.375);
  const yPrecio = Math.round(size * 0.575);
  const pTam = Math.round(size * 0.072);
  const yEtiq = Math.round(size * 0.618);
  const yDet = Math.round(size * 0.662);
  const yCta = Math.round(size * 0.695);
  const ctaH = Math.round(size * 0.062);

  const titSvg = titular
    .map(
      (l, i) =>
        `<text x="${M}" y="${yTit + i * tTam * 1.12}" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${tTam}" letter-spacing="-0.5" fill="${tinta}">${escapeXml(stripEmoji(l))}</text>`
    )
    .join("\n");

  // Barra bicolor: arranca FUERA del cuadro por la izquierda. Que se salga es
  // el mecanismo 4, no un descuido de posicion.
  // El dato de la barra es el numero, asi que tiene que llenar su campo: con
  // 0.58 el "19" pesaba menos que la palabra que lo califica.
  const dTam = Math.round(barH * 0.72);
  const oroW = Math.round(size * 0.29);
  // La barra necesita ancho real para el "OFF": con 0.42 la palabra se salia
  // del bloque negro y se derramaba sobre la foto.
  const sesgo = Math.round(barH * 0.42); // el corte entre oro y negro va inclinado
  // El bloque negro se estira al texto que lleve. Con ancho fijo, "OFF" cabia
  // pero "PIEZAS" se derramaba por el borde derecho de la barra sobre la foto.
  const dTamDer = Math.round(dTam * (barraDer.length > 3 ? 0.62 : 0.92));
  const anchoDer = barraDer.length * dTamDer * 0.66;
  const barW = Math.max(
    Math.round(size * 0.47),
    Math.round(oroW + sesgo + anchoDer + size * 0.05)
  );

  const anchoPrecio = precio.length * pTam * 0.60;
  const xAntes = M + anchoPrecio + Math.round(size * 0.028);

  // La caja del CTA se dimensiona al texto. Con ancho fijo, un CTA de mas de
  // ~17 caracteres se derramaba por los dos lados de la caja negra: la "V" de
  // "VER TODAS LAS PLACAS" quedaba cortada contra el borde. Se estima el ancho
  // del texto (Arial bold ~0.60 em por caracter mas el interletrado) y la caja
  // se ajusta, con un minimo para que un CTA corto no quede raquitico y un
  // tope en la columna para que nunca invada la foto.
  const ctaTam = Math.round(size * 0.0265);
  const ctaLS = size * 0.0035;
  const ctaTextoW = cta.length * (ctaTam * 0.60 + ctaLS);
  const ctaW = Math.min(
    colW,
    Math.max(Math.round(colW * 0.62), Math.round(ctaTextoW + size * 0.055))
  );

  const textoSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="oro" x1="0" y1="0" x2="1" y2="0.6">
        <stop offset="0%" stop-color="#8C6A12"/>
        <stop offset="28%" stop-color="#E8CE7B"/>
        <stop offset="62%" stop-color="#B8892A"/>
        <stop offset="100%" stop-color="#F0DC9A"/>
      </linearGradient>
    </defs>

    <text x="${M}" y="${yMarca}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.023)}" letter-spacing="${size * 0.0055}" fill="${oro}">${escapeXml(marca)}</text>

    ${titSvg}

    <polygon points="0,${yBar} ${oroW + sesgo},${yBar} ${oroW},${yBar + barH} 0,${yBar + barH}" fill="url(#oro)"/>
    <polygon points="${oroW + sesgo},${yBar} ${barW},${yBar} ${barW},${yBar + barH} ${oroW},${yBar + barH}" fill="${tinta}"/>
    <text x="${M}" y="${yBar + barH * 0.73}" font-family="Arial, sans-serif" font-weight="900" font-size="${dTam}" fill="${tinta}">${escapeXml(descuento)}</text>
    <text x="${(oroW + sesgo + barW) / 2}" y="${yBar + barH * 0.73}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="${dTamDer}" fill="${crema}">${escapeXml(stripEmoji(barraDer))}</text>

    <text x="${M}" y="${yPrecio}" font-family="Arial, sans-serif" font-weight="900" font-size="${pTam}" fill="${tinta}">${escapeXml(precio)}</text>
    <text x="${xAntes}" y="${yPrecio - pTam * 0.06}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(pTam * 0.44)}" fill="${gris}" text-decoration="line-through">${escapeXml(precioAntes)}</text>
    <text x="${M}" y="${yEtiq}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(pTam * 0.30)}" fill="${tinta}">${escapeXml(etiquetaPrecio)}</text>

    <text x="${M}" y="${yDet}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.0215)}" letter-spacing="${size * 0.0022}" fill="${gris}">${escapeXml(stripEmoji(detalle))}</text>

    <rect x="${M}" y="${yCta}" width="${ctaW}" height="${ctaH}" fill="${tinta}"/>
    <text x="${M + ctaW / 2}" y="${yCta + ctaH * 0.66}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${ctaTam}" letter-spacing="${ctaLS}" fill="${crema}">${escapeXml(stripEmoji(cta))}</text>
  </svg>`;

  await sharp({ create: { width: size, height: size, channels: 3, background: crema } })
    .composite([
      { input: fotoCortada, top: 0, left: size - fw },
      { input: Buffer.from(textoSvg), top: 0, left: 0 },
    ])
    .png()
    .toFile(outPath);
  return outPath;
}

module.exports.offerSplit = offerSplit;


/**
 * Servicio de corte laser: rejilla de productos + una sola llamada a WhatsApp.
 *
 * Hermana de `offerSplit` y comparte su sistema visual (crema, barra bicolor
 * oro/negro, CTA de esquinas rectas, una sola alineacion izquierda), pero
 * resuelve otro problema: aqui no se vende UN producto con UN precio, se vende
 * la capacidad de cortar lo que sea. Por eso el heroe no es una foto sino la
 * variedad, y por eso hay rejilla en vez de producto a sangre.
 *
 * Las fotos van en mosaico de esquinas rectas, sin marco ni sombra: el material
 * ya tiene brillo propio y enmarcarlo lo abarata.
 */
async function serviceGrid({
  size = 1440,
  crema = "#F7F1E7",
  tinta = "#1A1A1A",
  oro = "#C8A02E",
  gris = "#9C978E",
  marca = "LUASER",
  titular = [],
  franja = "ENVÍO A TODO MÉXICO",
  subtitulo = "",
  bullets = [],
  cta = "COTIZA POR WHATSAPP",
  pie = "",
  fotos = [], // 6 rutas
  outPath,
}) {
  const M = Math.round(size * 0.058);
  const R = size - M;

  // -- rejilla 2x3 en la mitad derecha, a sangre por el borde derecho --
  const gx = Math.round(size * 0.5);
  const gw = size - gx;
  const cols = 2;
  const filas = 3;
  const cw = Math.round(gw / cols);
  const ch = Math.round(size / filas);
  const tiles = [];
  for (let i = 0; i < Math.min(fotos.length, cols * filas); i++) {
    const buf = await sharp(fotos[i])
      .resize(cw, ch, { fit: "cover", position: sharp.strategy.attention })
      .toBuffer();
    tiles.push({
      input: buf,
      left: gx + (i % cols) * cw,
      top: Math.floor(i / cols) * ch,
    });
  }

  // El borde izquierdo de la rejilla se funde al crema: sin eso el mosaico
  // choca contra el panel de texto con una costura recta que parte el cuadro.
  const velo = `<svg width="${Math.round(size * 0.09)}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="v" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${crema}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${crema}" stop-opacity="0"/>
    </linearGradient></defs>
    <rect width="${Math.round(size * 0.09)}" height="${size}" fill="url(#v)"/>
  </svg>`;

  const tTam = Math.round(size * 0.054);
  const yMarca = Math.round(size * 0.115);
  const yTit = Math.round(size * 0.175);
  const yFranjaTop = yTit + titular.length * tTam * 1.1 + Math.round(size * 0.015);
  const franjaH = Math.round(size * 0.072);
  const ySub = yFranjaTop + franjaH + Math.round(size * 0.062);
  const yBul = ySub + Math.round(size * 0.05);
  const bTam = Math.round(size * 0.0235);
  const yCta = yBul + bullets.length * Math.round(size * 0.038) + Math.round(size * 0.045);
  const ctaH = Math.round(size * 0.068);
  const ctaW = Math.round(size * 0.415);

  const titSvg = titular
    .map(
      (l, i) =>
        `<text x="${M}" y="${yTit + i * tTam * 1.1}" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${tTam}" letter-spacing="-0.5" fill="${tinta}">${escapeXml(stripEmoji(l))}</text>`
    )
    .join("\n");

  const bulSvg = bullets
    .map((b, i) => {
      const y = yBul + i * Math.round(size * 0.038);
      return `<circle cx="${M + 7}" cy="${y - bTam * 0.32}" r="4.5" fill="${oro}"/>
        <text x="${M + 26}" y="${y}" font-family="Arial, sans-serif" font-weight="600" font-size="${bTam}" fill="${tinta}">${escapeXml(stripEmoji(b))}</text>`;
    })
    .join("\n");

  const fw = Math.round(size * 0.44);
  const sesgo = Math.round(franjaH * 0.4);

  const textoSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="oroG" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0%" stop-color="#8C6A12"/><stop offset="30%" stop-color="#E8CE7B"/>
      <stop offset="64%" stop-color="#B8892A"/><stop offset="100%" stop-color="#F0DC9A"/>
    </linearGradient></defs>

    <text x="${M}" y="${yMarca}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.023)}" letter-spacing="${size * 0.0055}" fill="${oro}">${escapeXml(marca)}</text>

    ${titSvg}

    <polygon points="0,${yFranjaTop} ${fw},${yFranjaTop} ${fw - sesgo},${yFranjaTop + franjaH} 0,${yFranjaTop + franjaH}" fill="url(#oroG)"/>
    <text x="${M}" y="${yFranjaTop + franjaH * 0.68}" font-family="Arial, sans-serif" font-weight="900" font-size="${Math.round(franjaH * 0.42)}" letter-spacing="1" fill="${tinta}">${escapeXml(stripEmoji(franja))}</text>

    <text x="${M}" y="${ySub}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.031)}" fill="${tinta}">${escapeXml(stripEmoji(subtitulo))}</text>

    ${bulSvg}

    <rect x="${M}" y="${yCta}" width="${ctaW}" height="${ctaH}" fill="${tinta}"/>
    <text x="${M + ctaW / 2}" y="${yCta + ctaH * 0.63}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.0245)}" letter-spacing="${size * 0.003}" fill="${crema}">${escapeXml(stripEmoji(cta))}</text>

    ${pie ? `<text x="${M}" y="${yCta + ctaH + Math.round(size * 0.045)}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.0205)}" letter-spacing="${size * 0.002}" fill="${gris}">${escapeXml(stripEmoji(pie))}</text>` : ""}
  </svg>`;

  await sharp({ create: { width: size, height: size, channels: 3, background: crema } })
    .composite([
      ...tiles,
      { input: Buffer.from(velo), left: gx, top: 0 },
      { input: Buffer.from(textoSvg), top: 0, left: 0 },
    ])
    .png()
    .toFile(outPath);
  return outPath;
}

module.exports.serviceGrid = serviceGrid;


/** Aclara u oscurece un hex. f > 0 aclara, f < 0 oscurece. */
function tinte(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))))
  );
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Carta de material: la ficha de producto para una linea de acrilico.
 *
 * La primera version dibujaba rectangulos de color planos y el cliente la
 * rechazo con la razon correcta: parecia carta de pintura, no acrilico. Un
 * acrilico se reconoce por dos cosas que un rectangulo plano no tiene:
 *
 *   1. EL CANTO. El grosor del material se ve en el corte, y es literalmente
 *      lo que el cliente esta comprando cuando elige 3, 6 o 25 mm. Por eso el
 *      canto se dibuja a escala del espesor real, no siempre igual.
 *   2. EL BRILLO. La superficie es especular: devuelve una franja de luz
 *      diagonal. Sin ella el material lee como plastico mate.
 *
 * Los transparentes ademas llevan el canto encendido, que es el efecto por el
 * que se compra acrilico cristal y no vidrio.
 */
async function materialChart({
  size = 1440,
  crema = "#F7F1E7",
  tinta = "#1A1A1A",
  oro = "#C8A02E",
  gris = "#9C978E",
  marca = "LUASER",
  titular = [],
  pie = "",
  muestras = [], // [{nombre, hex, mm, brillo?, translucido?}]
  outPath,
}) {
  const M = Math.round(size * 0.062);
  const yMarca = Math.round(size * 0.086);
  const tTam = Math.round(size * 0.047);
  const yTit = Math.round(size * 0.138);

  const n = muestras.length;
  const cols = n <= 2 ? 2 : n <= 4 ? 2 : n <= 6 ? 3 : 5;
  const filas = Math.ceil(n / cols);
  const gridTop = yTit + titular.length * tTam * 1.1 + Math.round(size * 0.042);
  const gap = Math.round(size * 0.022);
  const cw = Math.floor((size - M * 2 - gap * (cols - 1)) / cols);
  const fondo = Math.round(size * 0.885) - gridTop;
  const alto = Math.max(
    Math.round(size * 0.09),
    Math.min(Math.round(size * 0.26), Math.floor(fondo / filas) - gap - 46)
  );

  let defs = "";
  let cuerpo = "";

  muestras.forEach((m, i) => {
    const x = M + (i % cols) * (cw + gap);
    const y = gridTop + Math.floor(i / cols) * (alto + gap + 46);
    // El canto crece con el espesor real, con tope para que 25 mm no domine.
    const d = Math.max(7, Math.min(26, Math.round((m.mm || 3) * 2.4)));
    const claro = tinte(m.hex, 0.34);
    const oscuro = tinte(m.hex, -0.34);
    const cara = alto - d;

    // Cara: color base + degradado propio si es metalizado
    const relleno = m.brillo ? `url(#g${i})` : m.hex;
    if (m.brillo) {
      defs += `<linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="0.85">
        <stop offset="0%" stop-color="${m.brillo[0]}"/><stop offset="38%" stop-color="${m.brillo[1]}"/>
        <stop offset="66%" stop-color="${m.brillo[0]}"/><stop offset="100%" stop-color="${m.brillo[1]}"/>
      </linearGradient>`;
    }
    // Brillo especular: franja diagonal, no un velo uniforme.
    defs += `<linearGradient id="s${i}" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="${m.translucido ? 0.30 : 0.20}"/>
      <stop offset="26%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="52%" stop-color="#fff" stop-opacity="${m.translucido ? 0.34 : 0.24}"/>
      <stop offset="60%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.07"/>
    </linearGradient>`;
    // Canto: de claro a oscuro, con la arista superior encendida.
    defs += `<linearGradient id="c${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${tinte(m.hex, m.translucido ? 0.62 : 0.2)}"/>
      <stop offset="100%" stop-color="${oscuro}"/>
    </linearGradient>`;
    // Sombra de contacto bajo el canto.
    defs += `<linearGradient id="sh${i}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>`;

    const sx = Math.round(d * 0.55); // el canto se corre a la derecha: da volumen

    cuerpo += `
      <rect x="${x + sx}" y="${y + alto}" width="${cw}" height="${Math.round(d * 1.5)}" fill="url(#sh${i})"/>
      <polygon points="${x},${y + cara} ${x + cw},${y + cara} ${x + cw + sx},${y + alto} ${x + sx},${y + alto}" fill="url(#c${i})"/>
      <line x1="${x}" y1="${y + cara}" x2="${x + cw}" y2="${y + cara}" stroke="${tinte(m.hex, 0.55)}" stroke-width="1.6" opacity=".9"/>
      <rect x="${x}" y="${y}" width="${cw}" height="${cara}" fill="${relleno}"/>
      <rect x="${x}" y="${y}" width="${cw}" height="${cara}" fill="url(#s${i})"/>
      <rect x="${x}" y="${y}" width="${cw}" height="${cara}" fill="none" stroke="${claro}" stroke-width="1" opacity=".55"/>
      <text x="${x}" y="${y + alto + 34}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.0172)}" fill="${tinta}">${escapeXml(stripEmoji(m.nombre))}</text>`;
  });

  const titSvg = titular
    .map(
      (l, i) =>
        `<text x="${M}" y="${yTit + i * tTam * 1.1}" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${tTam}" letter-spacing="-0.5" fill="${tinta}">${escapeXml(stripEmoji(l))}</text>`
    )
    .join("\n");

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>${defs}
      <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
        <stop offset="0%" stop-color="${tinte(crema, 0.5)}"/><stop offset="100%" stop-color="${crema}"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    <text x="${M}" y="${yMarca}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.021)}" letter-spacing="${size * 0.005}" fill="${oro}">${escapeXml(marca)}</text>
    ${titSvg}
    ${cuerpo}
    ${pie ? `<text x="${M}" y="${size - Math.round(size * 0.052)}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(size * 0.0198)}" letter-spacing="${size * 0.0018}" fill="${gris}">${escapeXml(stripEmoji(pie))}</text>` : ""}
    <rect x="0" y="${size - Math.round(size * 0.019)}" width="${size}" height="${Math.round(size * 0.019)}" fill="${tinta}"/>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}

module.exports.materialChart = materialChart;

/**
 * Vertical 9:16 story/reel: full-bleed photo, navy scrim from the bottom, eyebrow + headline,
 * and a filled CTA pill with a contact line under it. Added for Lúa Eventos social content
 * where the piece has to close with an action (apartar fecha por WhatsApp), which the
 * feed templates above deliberately don't carry.
 */
async function storyCta({ photoPath, eyebrow, headline, cta, contact, logoPath, brand, width = 1080, height = 1920, outPath }) {
  const lines = wrapText(headline, 18);
  const M = 72;
  const fontSize = 78;

  // El bloque se ancla abajo y se mide antes de dibujar, para que el titular nunca
  // se encime con la pastilla del CTA por muy largo que venga.
  const hCta = cta ? 132 : 0;
  const hContact = contact ? 56 : 0;
  const hHead = lines.length * Math.round(fontSize * 1.16);
  const hEyebrow = eyebrow ? 62 : 0;
  const bloque = hEyebrow + hHead + 40 + hCta + hContact;
  // Zona segura de stories: Instagram y Facebook tapan los ~250 px de abajo con la barra de
  // "Enviar mensaje" y los ~150 de arriba con la fila del perfil. Todo el bloque, incluido el
  // teléfono, tiene que terminar antes de esa franja o el CTA se pierde detrás de la UI.
  const padBottom = 300;
  const topBloque = height - padBottom - bloque;
  const scrimTop = Math.max(0, topBloque - 320);

  let y = topBloque;
  const p = [];
  p.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${brand.navyDark}" stop-opacity="0"/>
    <stop offset="45%" stop-color="${brand.navyDark}" stop-opacity="0.82"/>
    <stop offset="100%" stop-color="${brand.navyDark}" stop-opacity="0.97"/></linearGradient></defs>`);
  p.push(`<rect x="0" y="${scrimTop}" width="${width}" height="${height - scrimTop}" fill="url(#g)"/>`);

  if (eyebrow) {
    y += 44;
    p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="5" fill="${brand.accent}">${escapeXml(stripEmoji(eyebrow).toUpperCase())}</text>`);
    y += 18;
  }
  for (const l of lines) {
    y += Math.round(fontSize * 1.16);
    p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff">${escapeXml(stripEmoji(l))}</text>`);
  }
  y += 40;

  if (cta) {
    const texto = stripEmoji(cta).toUpperCase();
    const w = Math.min(width - M * 2, Math.round(texto.length * 22 + 110));
    p.push(`<rect x="${M}" y="${y}" width="${w}" height="96" rx="48" fill="${brand.accent}"/>`);
    p.push(`<text x="${M + w / 2}" y="${y + 62}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="36" letter-spacing="1" fill="${brand.navyDark}">${escapeXml(texto)}</text>`);
    y += hCta;
  }
  if (contact) {
    y += 40;
    p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#ffffff">${escapeXml(stripEmoji(contact))}</text>`);
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${p.join("")}</svg>`;
  const logoSize = 104;
  const logoBuf = await circleLogo(logoPath, logoSize);

  await sharp(photoPath)
    .resize(width, height, { fit: "cover" })
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      // Bajado a 190 px por la misma razón: arriba de eso lo cubre la fila del perfil.
      { input: logoBuf, top: 190, left: 56 },
      { input: Buffer.from(ringSvg(logoSize)), top: 186, left: 52 },
    ])
    .png()
    .toFile(outPath);
  return outPath;
}

module.exports.storyCta = storyCta;

/**
 * Portada ancha para la página de Facebook (1640x624 y similares). El texto va en un panel
 * de degradado a la izquierda y la foto se encuadra a la derecha, porque en el formato de
 * portada Facebook recorta por los lados en móvil y encima monta la foto de perfil en la
 * esquina inferior izquierda: por eso el bloque de texto arranca alto y no baja al pie.
 */
async function wideCover({ photoPath, eyebrow, headline, contact, logoPath, brand, width = 1640, height = 624, outPath }) {
  const M = 90;
  const panelW = Math.round(width * 0.52);
  const lines = wrapText(headline, 26);
  const fTit = 62;

  const p = [];
  p.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${brand.navyDark}" stop-opacity="0.97"/>
    <stop offset="62%" stop-color="${brand.navyDark}" stop-opacity="0.88"/>
    <stop offset="100%" stop-color="${brand.navyDark}" stop-opacity="0"/></linearGradient></defs>`);
  p.push(`<rect x="0" y="0" width="${panelW}" height="${height}" fill="url(#g)"/>`);

  // El bloque se sube respecto al centro a propósito: en escritorio Facebook encima la foto
  // de perfil sobre la esquina inferior izquierda de la portada (unos 220 x 200 px), y ahí
  // es justo donde caería la línea de contacto si el bloque quedara centrado.
  const hBloque = (eyebrow ? 52 : 0) + lines.length * Math.round(fTit * 1.18) + (contact ? 62 : 0);
  let y = Math.max(60, Math.round((height - hBloque) / 2) - 75);

  if (eyebrow) {
    y += 34;
    p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="700" font-size="26" letter-spacing="5" fill="${brand.accent}">${escapeXml(stripEmoji(eyebrow).toUpperCase())}</text>`);
    y += 18;
  }
  for (const l of lines) {
    y += Math.round(fTit * 1.18);
    p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="800" font-size="${fTit}" fill="#ffffff">${escapeXml(stripEmoji(l))}</text>`);
  }
  if (contact) {
    y += 62;
    p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="700" font-size="30" fill="${brand.accent}">${escapeXml(stripEmoji(contact))}</text>`);
  }

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${p.join("")}</svg>`;
  const logoSize = 84;
  const logoBuf = await circleLogo(logoPath, logoSize);

  await sharp(photoPath)
    .resize(width, height, { fit: "cover", position: "attention" })
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: logoBuf, top: 40, left: width - logoSize - 56 },
      { input: Buffer.from(ringSvg(logoSize)), top: 36, left: width - logoSize - 60 },
    ])
    .png()
    .toFile(outPath);
  return outPath;
}

module.exports.wideCover = wideCover;

/**
 * Creativo de anuncio: foto de producto arriba, bloque sólido abajo con precio grande y
 * botón de llamada a la acción. A diferencia de las portadas de catálogo (que dejan respirar
 * al producto), aquí el trabajo es frenar el scroll: el precio es el elemento más ruidoso y
 * el CTA se ve como botón, no como texto.
 *
 * El bloque se mide antes de dibujarse y la foto ocupa lo que sobra, así que nunca se encima
 * nada por muy largo que venga el titular.
 */
async function adHero({ photoPath, eyebrow, headline, precioLabel, precio, sufijo, nota, cta, logoPath, brand, width = 1080, height = 1080, outPath }) {
  const M = Math.round(width * 0.075);
  const anchoUtil = width - M * 2;
  const fEyebrow = Math.round(width * 0.026);
  const fTit = Math.round(width * 0.052);
  const fPrec = Math.round(width * 0.118);
  const fSuf = Math.round(width * 0.032);
  const fNota = Math.round(width * 0.025);
  const hCta = Math.round(width * 0.098);
  const fCta = Math.round(width * 0.034);

  const lineasTit = wrapText(headline, Math.floor(anchoUtil / (fTit * 0.52)));
  const hTit = lineasTit.length * Math.round(fTit * 1.18);

  // Alto total del panel oscuro, medido antes de dibujar
  const padTop = Math.round(width * 0.042);
  const gap = Math.round(width * 0.024);
  const hMarca = Math.round(width * 0.030);
  // El CTA va en la misma fila que el precio (a la derecha), no debajo: apilarlos hacía el
  // panel tan alto que la foto quedaba en una franja y el producto no se veía.
  const hFilaPrecio = Math.round(fPrec * 0.24) + Math.round(fPrec * 0.10) + Math.round(fPrec * 0.92);
  const hPanel = padTop + fEyebrow + gap + hTit + gap + hFilaPrecio
    + Math.round(width * 0.058) + hMarca + Math.round(width * 0.045);
  const topPanel = height - hPanel;

  const p = [];
  p.push(`<rect x="0" y="${topPanel}" width="${width}" height="${hPanel}" fill="${brand.navyDark}"/>`);
  p.push(`<rect x="0" y="${topPanel}" width="${Math.round(width * 0.16)}" height="6" fill="${brand.accent}"/>`);

  let y = topPanel + padTop;

  y += fEyebrow;
  if (eyebrow) p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="700" font-size="${fEyebrow}" letter-spacing="5" fill="${brand.accent}">${escapeXml(stripEmoji(eyebrow).toUpperCase())}</text>`);
  y += gap;

  for (const l of lineasTit) {
    y += Math.round(fTit * 1.18);
    p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="800" font-size="${fTit}" fill="#ffffff">${escapeXml(stripEmoji(l))}</text>`);
  }
  y += gap;

  // "DESDE" va en su propia línea, con su propio avance: pegado al número se encimaba.
  let x = M;
  if (precioLabel) {
    y += Math.round(fPrec * 0.24);
    p.push(`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-weight="700" font-size="${Math.round(fPrec * 0.20)}" letter-spacing="3" fill="${brand.accent}">${escapeXml(precioLabel.toUpperCase())}</text>`);
    y += Math.round(fPrec * 0.10);
  }
  y += Math.round(fPrec * 0.92);
  p.push(`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-weight="800" font-size="${fPrec}" fill="#ffffff">${escapeXml(precio)}</text>`);
  if (sufijo) {
    const anchoPrecio = precio.length * fPrec * 0.56;
    p.push(`<text x="${Math.round(x + anchoPrecio + width * 0.022)}" y="${y - Math.round(fPrec * 0.08)}" font-family="Arial, sans-serif" font-weight="700" font-size="${fSuf}" fill="${brand.accent}">${escapeXml(sufijo)}</text>`);
  }

  // CTA alineado a la derecha, centrado con el bloque del precio
  const wCta = Math.round(stripEmoji(cta).length * fCta * 0.60 + width * 0.085);
  const yCta = y - Math.round(fPrec * 0.62) - Math.round(hCta / 2);
  p.push(`<rect x="${width - M - wCta}" y="${yCta}" width="${wCta}" height="${hCta}" rx="${Math.round(hCta / 2)}" fill="${brand.accent}"/>`);
  p.push(`<text x="${width - M - wCta / 2}" y="${yCta + Math.round(hCta * 0.66)}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${fCta}" letter-spacing="1" fill="${brand.navyDark}">${escapeXml(stripEmoji(cta).toUpperCase())}</text>`);

  y += Math.round(width * 0.058) + Math.round(hMarca * 0.8);

  p.push(`<text x="${M}" y="${y}" font-family="Arial, sans-serif" font-weight="700" font-size="${hMarca}" letter-spacing="7" fill="#ffffff">LUASER</text>`);
  p.push(`<text x="${width - M}" y="${y}" text-anchor="end" font-family="Arial, sans-serif" font-size="${Math.round(hMarca * 0.78)}" fill="#B9B5AE">luaser.mx</text>`);

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${p.join("")}</svg>`;
  const foto = await sharp(photoPath).resize(width, topPanel + 4, { fit: "cover", position: "centre" }).toBuffer();

  await sharp({ create: { width, height, channels: 4, background: brand.navyDark } })
    .composite([{ input: foto, top: 0, left: 0 }, { input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(outPath);
  return outPath;
}

module.exports.adHero = adHero;
