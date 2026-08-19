const sharp = require("sharp");

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function circleLogo(logoPath, size) {
  return sharp(logoPath)
    .resize(size, size)
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function build({ width, height, outPath, photoPath }) {
  const logoPath = "C:/Users/jorge/OneDrive/Desktop/PARACLAUDE/LOGO LUA.jpg";
  const navy = "#0B1423";
  const accent = "#F5AF95";

  // Full-bleed photo, no dead space anywhere — this is the fix for the "empty void" problem.
  // photoPath is pre-cropped to roughly the right aspect so "cover" barely has to guess.
  const bg = await sharp(photoPath).resize(width, height, { fit: "cover", position: "centre" }).toBuffer();

  const logoSize = Math.round(width * 0.09);

  const headlineSize = Math.round(width * 0.115);
  const subSize = Math.round(width * 0.048);
  const scrimHeight = Math.round(height * 0.34);
  const bottomBarHeight = Math.round(height * 0.075);

  const overlay = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="topScrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${navy}" stop-opacity="0.96"/>
        <stop offset="70%" stop-color="${navy}" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="${navy}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottomScrim" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="${navy}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${navy}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${scrimHeight}" fill="url(#topScrim)"/>
    <rect x="0" y="${height - bottomBarHeight - 60}" width="${width}" height="${bottomBarHeight + 60}" fill="url(#bottomScrim)"/>

    <!-- headline block, tightly stacked, all inside the strong (non-fading) part of the scrim -->
    <text x="${width / 2}" y="${Math.round(height * 0.1)}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${headlineSize}" fill="#ffffff">10 FRAPPÉS</text>
    <text x="${width / 2}" y="${Math.round(height * 0.1) + headlineSize * 0.95}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-style="italic" font-size="${Math.round(headlineSize * 1.1)}" fill="${accent}">GRATIS</text>
    <text x="${width / 2}" y="${Math.round(height * 0.1) + headlineSize * 1.75}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${subSize}" fill="#ffffff">Al contratar tu evento, desde 30 personas</text>

    <!-- date pill: its own solid background so legibility never depends on the photo underneath -->
    <rect x="${width / 2 - Math.round(width * 0.225)}" y="${Math.round(height * 0.1) + headlineSize * 1.75 + subSize * 0.75}" width="${Math.round(width * 0.45)}" height="${Math.round(subSize * 1.25)}" rx="${Math.round(subSize * 0.62)}" fill="${accent}"/>
    <text x="${width / 2}" y="${Math.round(height * 0.1) + headlineSize * 1.75 + subSize * 0.75 + subSize * 0.88}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-weight="600" font-size="${Math.round(subSize * 0.62)}" letter-spacing="1" fill="${navy}">15 AL 30 DE AGOSTO</text>

    <!-- bottom contact bar, sits on its own scrim so it never depends on photo darkness -->
    <text x="${width / 2}" y="${height - bottomBarHeight / 2 + 6}" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="${Math.round(width * 0.0155)}" letter-spacing="0.5" fill="#ffffff">IG @luaeventos  ·  WhatsApp 81 3109 2383</text>
  </svg>`;

  const logoBuf = await circleLogo(logoPath, logoSize);
  const ring = `<svg width="${logoSize + 6}" height="${logoSize + 6}"><circle cx="${(logoSize + 6) / 2}" cy="${(logoSize + 6) / 2}" r="${logoSize / 2 + 2}" fill="none" stroke="#ffffff" stroke-width="3"/></svg>`;

  await sharp(bg)
    .composite([
      { input: Buffer.from(overlay), top: 0, left: 0 },
      { input: logoBuf, top: 40, left: 40 },
      { input: Buffer.from(ring), top: 37, left: 37 },
    ])
    .png()
    .toFile(outPath);
}

(async () => {
  await build({ width: 1080, height: 1080, outPath: "mango-v2-square.png", photoPath: "mango-square-src.jpg" });
  await build({ width: 1080, height: 1920, outPath: "mango-v2-story.png", photoPath: "mango-story-src.jpg" });
  console.log("done");
})();
