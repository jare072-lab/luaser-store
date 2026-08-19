const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = "C:/Users/jorge/OneDrive/Desktop/PARACLAUDE";
const OUT = "C:/Users/jorge/OneDrive/Desktop/Higgsfield/CalendarioSemanal";
const LOGO = path.join(SRC, "LOGO LUA.jpg");
const NAVY = "#0B1423";

for (const sub of ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"]) {
  fs.mkdirSync(path.join(OUT, sub), { recursive: true });
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Arial no trae glifos de emoji -> se ven como cuadros. Los quitamos del texto SVG.
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

async function circleLogo(size) {
  return sharp(LOGO)
    .resize(size, size)
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: "dest-in" }])
    .png()
    .toBuffer();
}

// Foto real + texto arriba + logo esquina, tamaño feed (1080x1080) o historia (1080x1920)
async function photoSlide({ photoPath, headline, width, height, outPath }) {
  const lines = wrapText(headline, width === 1080 && height === 1080 ? 22 : 20);
  const fontSize = 56;
  const lineHeight = 70;
  const startY = 100;
  const textSvgLines = lines
    .map(
      (line, i) =>
        `<text x="56" y="${startY + i * lineHeight}" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff">${escapeXml(line)}</text>`
    )
    .join("\n");

  const logoSize = 84;
  const logoRight = 36;
  const logoTop = 36;
  const logoLeft = width - logoSize - logoRight;

  const overlaySvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${NAVY}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="${NAVY}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="320" fill="url(#g)"/>
    ${textSvgLines}
  </svg>`;

  const logoBuf = await circleLogo(logoSize);
  const ring = `<svg width="${logoSize + 8}" height="${logoSize + 8}"><circle cx="${(logoSize + 8) / 2}" cy="${(logoSize + 8) / 2}" r="${logoSize / 2 + 2}" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`;

  await sharp(photoPath)
    .resize(width, height, { fit: "cover" })
    .composite([
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      { input: logoBuf, top: logoTop, left: logoLeft },
      { input: Buffer.from(ring), top: logoTop - 4, left: logoLeft - 4 },
    ])
    .png()
    .toFile(outPath);
}

// Tarjeta solo texto (para historias de frase/pregunta), fondo navy + logo grande
async function quoteCard({ text, width, height, outPath }) {
  const lines = wrapText(text, 16);
  const fontSize = 68;
  const lineHeight = 84;
  const totalTextHeight = lines.length * lineHeight;
  const startY = height / 2 - totalTextHeight / 2 + 200;

  const textSvgLines = lines
    .map(
      (line, i) =>
        `<text x="${width / 2}" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${fontSize}" fill="#ffffff">${escapeXml(line)}</text>`
    )
    .join("\n");

  const logoSize = 220;
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rg" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#1B4A6B"/>
        <stop offset="100%" stop-color="${NAVY}"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#rg)"/>
    ${textSvgLines}
  </svg>`;

  const logoBuf = await circleLogo(logoSize);
  const ring = `<svg width="${logoSize + 10}" height="${logoSize + 10}"><circle cx="${(logoSize + 10) / 2}" cy="${(logoSize + 10) / 2}" r="${logoSize / 2 + 3}" fill="none" stroke="#ffffff" stroke-width="5"/></svg>`;
  const logoTop = height / 2 - totalTextHeight / 2 - logoSize - 60;
  const logoLeft = (width - logoSize) / 2;

  await sharp(Buffer.from(svg))
    .composite([
      { input: logoBuf, top: Math.round(logoTop), left: Math.round(logoLeft) },
      { input: Buffer.from(ring), top: Math.round(logoTop) - 5, left: Math.round(logoLeft) - 5 },
    ])
    .png()
    .toFile(outPath);
}

const days = [
  {
    name: "Lunes",
    time1: "1:00 PM",
    time2: "7:00 PM",
    postAM: { photo: "499549012_1000308562123792_5465916401860708931_n.jpg", headline: "Antojo de media semana 🌽" },
    postPM: { photo: "498277900_990649559756359_4617733030131796904_n.jpg", headline: "Momentos dulces en cada evento" },
    storyQuote: "¿Ya tienes fecha para tu evento? 📅",
  },
  {
    name: "Martes",
    time1: "1:00 PM",
    time2: "7:00 PM",
    postAM: { photo: "607186271_1156644273156886_7284251532737183721_n.jpg", headline: "El clásico que nunca falla 🍫" },
    postPM: { photo: "482016720_938669584954357_163625304268274478_n.jpg", headline: "Mango con chile, para los valientes 🌶️" },
    storyQuote: "Personaliza tu barra: elige tus sabores 🎨",
  },
  {
    name: "Miercoles",
    time1: "1:00 PM",
    time2: "7:00 PM",
    postAM: { photo: "487287184_953095583511757_8776827177031842992_n.jpg", headline: "Crepas recién hechas en tu evento 🥞" },
    postPM: { photo: "500229853_995222275965754_3873734005092887837_n.jpg", headline: "Así se disfruta una fiesta Lúa 🎊" },
    storyQuote: "Bodas, XV años, cumpleaños y más 🎉",
  },
  {
    name: "Jueves",
    time1: "1:00 PM",
    time2: "7:00 PM",
    postAM: { photo: "533237940_1051782383643076_2136392968848229075_n.jpg", headline: "Waffles con fruta fresca 🧇" },
    postPM: { photo: "531571928_1051782373643077_1345103090875859480_n.jpg", headline: "Tres sabores, una sola barra 🥤" },
    storyQuote: "10 FRAPPÉS GRATIS esta semana 🥤",
  },
  {
    name: "Viernes",
    time1: "1:00 PM",
    time2: "7:00 PM",
    postAM: { photo: "480692591_931279215693394_6270564763105751922_n.jpg", headline: "Elotes con todo, como te gustan 🌽" },
    postPM: { quote: true, headline: "🎉 10 FRAPPÉS GRATIS\nal contratar tu evento" },
    storyQuote: "Este fin de semana tenemos lugar 📍",
  },
  {
    name: "Sabado",
    time1: "1:00 PM",
    time2: "7:00 PM",
    postAM: { photo: "486784685_953097673511548_8164708140826371187_n.jpg", headline: "Sonrisas garantizadas en tu fiesta 😄" },
    postPM: { photo: "647020955_1207609534727026_1559213516895211527_n.jpg", headline: "Nuestra barra, lista para tu evento" },
    storyQuote: "Cada evento, una barra distinta ✨",
  },
  {
    name: "Domingo",
    time1: "1:00 PM",
    time2: "7:00 PM",
    postAM: { photo: "648534447_1207609528060360_6638449549059866872_n.jpg", headline: "Domingo de alberca y frappés 🏊" },
    postPM: { quote: true, headline: "Escríbenos y aparta\ntu fecha 📲" },
    storyQuote: "Escríbenos y cotiza gratis 📲",
  },
];

(async () => {
  for (const day of days) {
    const dir = path.join(OUT, day.name);

    // Post AM
    {
      await photoSlide({
        photoPath: path.join(SRC, day.postAM.photo),
        headline: day.postAM.headline,
        width: 1080,
        height: 1080,
        outPath: path.join(dir, `1_post_${day.time1.replace(/[: ]/g, "")}.png`),
      });
    }

    // Post PM
    if (day.postPM.quote) {
      await quoteCard({
        text: day.postPM.headline,
        width: 1080,
        height: 1080,
        outPath: path.join(dir, `2_post_${day.time2.replace(/[: ]/g, "")}.png`),
      });
    } else {
      await photoSlide({
        photoPath: path.join(SRC, day.postPM.photo),
        headline: day.postPM.headline,
        width: 1080,
        height: 1080,
        outPath: path.join(dir, `2_post_${day.time2.replace(/[: ]/g, "")}.png`),
      });
    }

    // Story 1 = version vertical del post AM
    if (!day.postAM.quote) {
      await photoSlide({
        photoPath: path.join(SRC, day.postAM.photo),
        headline: day.postAM.headline,
        width: 1080,
        height: 1920,
        outPath: path.join(dir, `3_historia_1100AM.png`),
      });
    } else {
      await quoteCard({ text: day.postAM.headline, width: 1080, height: 1920, outPath: path.join(dir, `3_historia_1100AM.png`) });
    }

    // Story 2 = version vertical del post PM
    if (!day.postPM.quote) {
      await photoSlide({
        photoPath: path.join(SRC, day.postPM.photo),
        headline: day.postPM.headline,
        width: 1080,
        height: 1920,
        outPath: path.join(dir, `4_historia_300PM.png`),
      });
    } else {
      await quoteCard({ text: day.postPM.headline, width: 1080, height: 1920, outPath: path.join(dir, `4_historia_300PM.png`) });
    }

    // Story 3 = quote card único del día
    await quoteCard({
      text: day.storyQuote,
      width: 1080,
      height: 1920,
      outPath: path.join(dir, `5_historia_600PM.png`),
    });

    console.log("done:", day.name);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
