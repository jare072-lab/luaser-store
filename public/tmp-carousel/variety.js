const sharp = require("sharp");
const path = require("path");

const SRC = "C:/Users/jorge/OneDrive/Desktop/PARACLAUDE";
const OUT = "C:/Users/jorge/OneDrive/Desktop/Higgsfield";
const LOGO = path.join(SRC, "LOGO LUA.jpg");
const NAVY = "#0B1423";
const NAVY_MID = "#1B4A6B";
const SIZE = 1080;

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu;
function stripEmoji(s) {
  return s.replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}
function wrapText(rawText, maxCharsPerLine) {
  const text = stripEmoji(rawText);
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

async function circleLogo(size) {
  return sharp(LOGO)
    .resize(size, size)
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: "dest-in" }])
    .png()
    .toBuffer();
}

// DISEÑO A: franja inferior con texto, foto completa arriba
async function bottomBand({ photoPath, eyebrow, headline, outPath }) {
  const lines = wrapText(headline, 24);
  const bandHeight = 260 + lines.length * 10;
  const fontSize = 50;

  const textSvg = `
  <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="${NAVY}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${NAVY}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${SIZE - bandHeight}" width="${SIZE}" height="${bandHeight}" fill="url(#g)"/>
    <text x="56" y="${SIZE - bandHeight + 90}" font-family="Arial, sans-serif" font-weight="700" font-size="26" letter-spacing="3" fill="#4B93B8">${escapeXml(stripEmoji(eyebrow).toUpperCase())}</text>
    ${lines.map((l, i) => `<text x="56" y="${SIZE - bandHeight + 150 + i * 62}" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff">${escapeXml(l)}</text>`).join("\n")}
  </svg>`;

  const logoSize = 78;
  const logoBuf = await circleLogo(logoSize);
  const ring = `<svg width="${logoSize + 8}" height="${logoSize + 8}"><circle cx="${(logoSize + 8) / 2}" cy="${(logoSize + 8) / 2}" r="${logoSize / 2 + 2}" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`;

  await sharp(photoPath)
    .resize(SIZE, SIZE, { fit: "cover" })
    .composite([
      { input: Buffer.from(textSvg), top: 0, left: 0 },
      { input: logoBuf, top: 36, left: 36 },
      { input: Buffer.from(ring), top: 32, left: 32 },
    ])
    .png()
    .toFile(outPath);
}

// DISEÑO B: panel lateral sólido a la derecha con texto, foto a la izquierda
async function sidePanel({ photoPath, eyebrow, headline, outPath }) {
  const panelWidth = 380;
  const photoWidth = SIZE - panelWidth;
  const lines = wrapText(headline, 14);

  const photoResized = await sharp(photoPath).resize(photoWidth, SIZE, { fit: "cover" }).toBuffer();

  const panelSvg = `
  <svg width="${panelWidth}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${panelWidth}" height="${SIZE}" fill="${NAVY_MID}"/>
    <text x="40" y="120" font-family="Arial, sans-serif" font-weight="700" font-size="24" letter-spacing="2" fill="#F5AF95">${escapeXml(stripEmoji(eyebrow).toUpperCase())}</text>
    ${lines.map((l, i) => `<text x="40" y="${180 + i * 58}" font-family="Arial, sans-serif" font-weight="800" font-size="44" fill="#ffffff">${escapeXml(l)}</text>`).join("\n")}
  </svg>`;

  const logoSize = 90;
  const logoBuf = await circleLogo(logoSize);
  const ring = `<svg width="${logoSize + 8}" height="${logoSize + 8}"><circle cx="${(logoSize + 8) / 2}" cy="${(logoSize + 8) / 2}" r="${logoSize / 2 + 2}" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`;

  const panelBuf = await sharp(Buffer.from(panelSvg))
    .composite([
      { input: logoBuf, top: SIZE - logoSize - 60, left: 40 },
      { input: Buffer.from(ring), top: SIZE - logoSize - 64, left: 36 },
    ])
    .png()
    .toBuffer();

  await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: "#000" } })
    .composite([
      { input: photoResized, top: 0, left: 0 },
      { input: panelBuf, top: 0, left: photoWidth },
    ])
    .png()
    .toFile(outPath);
}

// DISEÑO C: marco tipo polaroid, foto centrada con borde blanco y caption abajo
async function polaroid({ photoPath, headline, outPath }) {
  const margin = 60;
  const photoSize = SIZE - margin * 2;
  const captionHeight = 340;
  const totalHeight = photoSize + margin + captionHeight;

  const photoResized = await sharp(photoPath).resize(photoSize, photoSize - 80, { fit: "cover" }).toBuffer();
  const lines = wrapText(headline, 26);

  const logoSize = 70;
  const logoTop = photoSize + margin + 30;
  const textStartY = logoTop + logoSize + 60;

  const frameSvg = `
  <svg width="${SIZE}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${SIZE}" height="${totalHeight}" fill="${NAVY}"/>
    <rect x="${margin - 20}" y="${margin - 20}" width="${photoSize + 40}" height="${photoSize - 80 + 40}" fill="#ffffff"/>
    ${lines.map((l, i) => `<text x="${SIZE / 2}" y="${textStartY + i * 54}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="42" fill="#ffffff">${escapeXml(l)}</text>`).join("\n")}
  </svg>`;

  const logoBuf = await circleLogo(logoSize);

  await sharp(Buffer.from(frameSvg))
    .composite([
      { input: photoResized, top: margin, left: margin },
      { input: logoBuf, top: logoTop, left: Math.round(SIZE / 2 - logoSize / 2) },
    ])
    .png()
    .toFile(outPath);
}

(async () => {
  await bottomBand({
    photoPath: path.join(SRC, "576338572_1119674163520564_1959274577961235786_n.jpg"),
    eyebrow: "Eventos elegantes",
    headline: "Barras que combinan con cualquier decoración",
    outPath: path.join(OUT, "variedad_1_bottomband.png"),
  });

  await sidePanel({
    photoPath: path.join(SRC, "752268096_1315729717248340_2633615429730711066_n.jpg"),
    eyebrow: "Sabores",
    headline: "Oreo o cereza, tú eliges",
    outPath: path.join(OUT, "variedad_2_sidepanel.png"),
  });

  await polaroid({
    photoPath: path.join(SRC, "576644891_1119674156853898_7595729665210359499_n.jpg"),
    headline: "Recuerdos dulces en cada evento",
    outPath: path.join(OUT, "variedad_3_polaroid.png"),
  });

  await bottomBand({
    photoPath: path.join(SRC, "752807276_1315729760581669_3220898766259924248_n.jpg"),
    eyebrow: "Snacks",
    headline: "Elotes preparados como te gustan",
    outPath: path.join(OUT, "variedad_4_bottomband.png"),
  });

  await sidePanel({
    photoPath: path.join(SRC, "607693138_1156644269823553_6918119876802439363_n.jpg"),
    eyebrow: "Crepas",
    headline: "El favorito de los niños",
    outPath: path.join(OUT, "variedad_5_sidepanel.png"),
  });

  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
