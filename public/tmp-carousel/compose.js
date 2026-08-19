const sharp = require("sharp");
const path = require("path");

const OUT_DIR = "C:/Users/jorge/OneDrive/Desktop/Higgsfield";
const SIZE = 1080;

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrapText(text, maxCharsPerLine) {
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

async function composeSlide({ photoPath, headline, outName }) {
  const lines = wrapText(headline, 22);
  const lineHeight = 74;
  const startY = 90;
  const textSvgLines = lines
    .map(
      (line, i) =>
        `<text x="60" y="${startY + i * lineHeight}" font-family="Arial, sans-serif" font-weight="800" font-size="60" fill="#ffffff" style="text-shadow:0 4px 10px rgba(0,0,0,0.6)">${escapeXml(
          line
        )}</text>`
    )
    .join("\n");

  const overlaySvg = `
  <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0B1423" stop-opacity="0.82"/>
        <stop offset="100%" stop-color="#0B1423" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${SIZE}" height="340" fill="url(#topGrad)"/>
    ${textSvgLines}
  </svg>`;

  const logoSize = 90;
  const logoRight = 40;
  const logoTop = 40;
  const logoLeft = SIZE - logoSize - logoRight;

  const logoBuffer = await sharp(path.join(__dirname, "logo_src.jpg"))
    .resize(logoSize, logoSize)
    .composite([{ input: Buffer.from(`<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}"/></svg>`), blend: "dest-in" }])
    .png()
    .toBuffer();

  const logoRing = `
  <svg width="${logoSize + 8}" height="${logoSize + 8}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${(logoSize + 8) / 2}" cy="${(logoSize + 8) / 2}" r="${logoSize / 2 + 2}" fill="none" stroke="#ffffff" stroke-width="4"/>
  </svg>`;

  await sharp(photoPath)
    .resize(SIZE, SIZE, { fit: "cover" })
    .composite([
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      { input: logoBuffer, top: logoTop, left: logoLeft },
      { input: Buffer.from(logoRing), top: logoTop - 4, left: logoLeft - 4 },
    ])
    .png()
    .toFile(path.join(OUT_DIR, outName));

  console.log("wrote", outName);
}

(async () => {
  await composeSlide({
    photoPath: path.join(__dirname, "photo1.jpg"),
    headline: "POV: contrataste la mejor barra de frappés de Monterrey",
    outName: "lua_carrusel_final_1_hook.png",
  });
  await composeSlide({
    photoPath: path.join(__dirname, "photo2.jpg"),
    headline: "Barra de frappés personalizada",
    outName: "lua_carrusel_final_2_barra.png",
  });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
