// socialCard / socialStory: tarjeta de foto inclinada con sticker, estilo póster de redes
// (referencia que pasó Jorge: galería MeiGen — foto grande en tarjeta blanca, sticker de
// color, titular pesado). Va en Segoe UI Black porque Arial se veía "de plantilla".
// Fotos siempre reales; el texto se compone aquí, nunca en el modelo.
const sharp = require("sharp");
const { wrapText, stripEmoji } = require("./flyer.js");

const FONT_HEAVY = "'Segoe UI Black', 'Segoe UI', Arial, sans-serif";
const FONT_BODY = "'Segoe UI', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const T = { r: 0, g: 0, b: 0, alpha: 0 };

async function circleLogo(logoPath, size) {
  return sharp(logoPath).resize(size, size)
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: "dest-in" }])
    .png().toBuffer();
}
const ringSvg = (size) => `<svg width="${size + 8}" height="${size + 8}"><circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2 + 2}" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`;

async function roundedPhotoCard(photoPath, size, border, radius) {
  const inner = size - border * 2;
  const photo = await sharp(photoPath).rotate().resize(inner, inner, { fit: "cover" }).png().toBuffer();
  const maskIn = Buffer.from(`<svg width="${inner}" height="${inner}"><rect width="${inner}" height="${inner}" rx="${radius - border}" fill="#fff"/></svg>`);
  const photoRounded = await sharp(photo).composite([{ input: maskIn, blend: "dest-in" }]).png().toBuffer();
  const frame = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/></svg>`);
  return sharp(frame).composite([{ input: photoRounded, top: border, left: border }]).png().toBuffer();
}

async function socialCard({ photoPath, hook, headline, sub, contact, logoPath, brand, width = 1080, height = 1350, outPath, tilt = -3 }) {
  const cardSize = 860, border = 16, radius = 44;
  const card = await roundedPhotoCard(photoPath, cardSize, border, radius);
  const rotated = await sharp(card).rotate(tilt, { background: T }).png().toBuffer();
  const rm = await sharp(rotated).metadata();
  // Sombra: misma silueta en negro, girada igual, desenfocada y desplazada.
  const shadowSrc = Buffer.from(`<svg width="${cardSize}" height="${cardSize}"><rect width="${cardSize}" height="${cardSize}" rx="${radius}" fill="#000" fill-opacity="0.55"/></svg>`);
  const shadow = await sharp(shadowSrc).rotate(tilt, { background: T })
    .extend({ top: 60, bottom: 60, left: 60, right: 60, background: T }).blur(28).png().toBuffer();

  const cardTop = 150, cardLeft = Math.round((width - rm.width) / 2);
  const lines = wrapText(stripEmoji(headline), 20);
  const fHead = lines.length > 1 ? 64 : 74;
  let y = cardTop + rm.height + 78;
  const bg = [];
  bg.push(`<defs><radialGradient id="glow" cx="0.15" cy="0.05" r="0.9"><stop offset="0%" stop-color="${brand.glow || "#2E6F9A"}"/><stop offset="60%" stop-color="${brand.navy}"/><stop offset="100%" stop-color="${brand.navyDark}"/></radialGradient></defs>`);
  bg.push(`<rect width="${width}" height="${height}" fill="url(#glow)"/>`);
  bg.push(`<circle cx="${width - 120}" cy="${height - 160}" r="300" fill="${brand.accent}" fill-opacity="0.16"/>`);
  bg.push(`<circle cx="90" cy="${cardTop + 40}" r="170" fill="${brand.accent}" fill-opacity="0.10"/>`);
  const fg = [];
  for (const l of lines) {
    y += Math.round(fHead * 1.12);
    fg.push(`<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="${FONT_HEAVY}" font-weight="900" font-size="${fHead}" fill="#ffffff">${esc(l)}</text>`);
  }
  if (sub) { y += 54; fg.push(`<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="${FONT_BODY}" font-weight="600" font-size="34" fill="${brand.accent}">${esc(stripEmoji(sub))}</text>`); }
  if (contact) {
    y += 70; const w = 520;
    fg.push(`<rect x="${(width - w) / 2}" y="${y - 44}" width="${w}" height="66" rx="33" fill="#ffffff" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>`);
    fg.push(`<text x="${width / 2}" y="${y + 2}" text-anchor="middle" font-family="${FONT_BODY}" font-weight="700" font-size="30" fill="#ffffff">${esc(stripEmoji(contact))}</text>`);
  }
  // Sticker girado sobre la esquina superior derecha de la tarjeta.
  if (hook) {
    const t = stripEmoji(hook).toUpperCase();
    const sw = Math.round(t.length * 24 + 80), sh = 84;
    const cx = cardLeft + rm.width - 120, cy = cardTop + 30;
    fg.push(`<g transform="rotate(7 ${cx} ${cy})"><rect x="${cx - sw / 2}" y="${cy - sh / 2}" width="${sw}" height="${sh}" rx="42" fill="${brand.urgency}"/><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-family="${FONT_HEAVY}" font-weight="900" font-size="38" fill="#ffffff">${esc(t)}</text></g>`);
  }
  const bgSvg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${bg.join("")}</svg>`);
  const fgSvg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${fg.join("")}</svg>`);
  const logoSize = 92;
  const logoBuf = await circleLogo(logoPath, logoSize);
  await sharp(bgSvg).composite([
    { input: shadow, top: cardTop - 60 + 26, left: cardLeft - 60 + 6 },
    { input: rotated, top: cardTop, left: cardLeft },
    { input: fgSvg, top: 0, left: 0 },
    { input: logoBuf, top: 40, left: 40 },
    { input: Buffer.from(ringSvg(logoSize)), top: 36, left: 36 },
  ]).png().toFile(outPath);
  return outPath;
}

async function socialStory({ photoPath, hook, headline, cta, contact, logoPath, brand, width = 1080, height = 1920, outPath }) {
  const lines = wrapText(stripEmoji(headline), 16);
  const M = 72, fHead = 84;
  const hCta = cta ? 132 : 0, hContact = contact ? 60 : 0;
  const bloque = lines.length * Math.round(fHead * 1.12) + 44 + hCta + hContact;
  // Zona segura: IG y FB tapan ~250 px abajo y ~150 arriba.
  const padBottom = 300;
  const top = height - padBottom - bloque;
  const scrimTop = Math.max(0, top - 360);
  const p = [];
  p.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${brand.navyDark}" stop-opacity="0"/><stop offset="50%" stop-color="${brand.navyDark}" stop-opacity="0.85"/><stop offset="100%" stop-color="${brand.navyDark}" stop-opacity="0.98"/></linearGradient></defs>`);
  p.push(`<rect x="0" y="${scrimTop}" width="${width}" height="${height - scrimTop}" fill="url(#g)"/>`);
  if (hook) {
    const t = stripEmoji(hook).toUpperCase();
    const sw = Math.round(t.length * 26 + 90), sh = 92;
    const cx = width - M - sw / 2 + 20, cy = 330;
    p.push(`<g transform="rotate(-6 ${cx} ${cy})"><rect x="${cx - sw / 2}" y="${cy - sh / 2}" width="${sw}" height="${sh}" rx="46" fill="${brand.urgency}"/><text x="${cx}" y="${cy + 15}" text-anchor="middle" font-family="${FONT_HEAVY}" font-weight="900" font-size="42" fill="#ffffff">${esc(t)}</text></g>`);
  }
  let y = top;
  for (const l of lines) { y += Math.round(fHead * 1.12); p.push(`<text x="${M}" y="${y}" font-family="${FONT_HEAVY}" font-weight="900" font-size="${fHead}" fill="#ffffff">${esc(l)}</text>`); }
  y += 44;
  if (cta) {
    const t = stripEmoji(cta).toUpperCase(); const w = Math.min(width - M * 2, Math.round(t.length * 23 + 120));
    p.push(`<rect x="${M}" y="${y}" width="${w}" height="100" rx="50" fill="${brand.accent}"/><text x="${M + w / 2}" y="${y + 65}" text-anchor="middle" font-family="${FONT_HEAVY}" font-weight="900" font-size="36" fill="${brand.navyDark}">${esc(t)}</text>`);
    y += hCta;
  }
  if (contact) { y += 44; p.push(`<text x="${M}" y="${y}" font-family="${FONT_BODY}" font-weight="700" font-size="36" fill="#ffffff">${esc(stripEmoji(contact))}</text>`); }
  const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${p.join("")}</svg>`);
  const logoSize = 104; const logoBuf = await circleLogo(logoPath, logoSize);
  await sharp(photoPath).rotate().resize(width, height, { fit: "cover" })
    .composite([{ input: svg, top: 0, left: 0 }, { input: logoBuf, top: 190, left: 56 }, { input: Buffer.from(ringSvg(logoSize)), top: 186, left: 52 }])
    .png().toFile(outPath);
  return outPath;
}

module.exports = { socialCard, socialStory };
