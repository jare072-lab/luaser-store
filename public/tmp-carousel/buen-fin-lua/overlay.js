/**
 * Capa final sobre las escenas de Higgsfield (hf/raw_*.png): logo real, fechas, línea por anuncio y CTA.
 * El logo y los datos se componen aquí (no los dibuja la IA) para que salgan exactos.
 * Uso: NODE_PATH=<sharp>/node_modules node overlay.js
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const HF = path.join(__dirname, "hf");
const OUT = path.join(__dirname, "final");
const LOGO = path.join(__dirname, "..", "logo_src.jpg");
fs.mkdirSync(OUT, { recursive: true });

const NAVY_D = "#0B1423", PEACH = "#F5AF95", WHITE = "#FFFFFF";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ADS = [
  { id: "1_frappes", src: 1, sub: "En tu barra de frappés, crepas, elotes y waffles" },
  { id: "2_xv_bodas", src: 2, sub: "Para tus XV, boda o bautizo de 2027" },
  { id: "3_crepas_waffles", src: 3, sub: "En tu barra de waffles para tu evento" },
  { id: "4_ninos", src: 4, sub: "Para el cumpleaños de los niños" },
  { id: "5_posadas", src: 1, sub: "Para tu posada de diciembre" },
  { id: "6_crepas", src: 5, sub: "En tu barra de crepas para tu evento", strong: true },
  { id: "7_elotes", src: 7, sub: "En tu barra de elotes preparados" },
  { id: "8_tostitos", src: 9, sub: "En tu barra de Tostitos preparados" },
];

async function logo(size) {
  const ring = Math.round(size * 0.05), S = size + ring * 2;
  const l = await sharp(LOGO).resize(size, size, { fit: "cover" })
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: "dest-in" }]).png().toBuffer();
  return sharp({ create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: Buffer.from(`<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#fff"/></svg>`) }, { input: l, left: ring, top: ring }])
    .png().toBuffer();
}

// Grano fino para disimular el bandeado de los degradados generados.
async function grain(W, H, amount = 10) {
  const buf = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const v = 128 + Math.round((Math.random() - 0.5) * 2 * amount);
    buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = v; buf[i * 4 + 3] = 40;
  }
  return sharp(buf, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

function pill(x, y, h, text, size, { anchor = "start" } = {}) {
  const w = Math.round(text.length * size * 0.66 + h * 0.9);
  const x0 = anchor === "end" ? x - w : x;
  return `<rect x="${x0}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${PEACH}"/>` +
    `<text x="${x0 + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="${size}" letter-spacing="1" fill="${NAVY_D}">${esc(text)}</text>`;
}

async function build({ ad, kind }) {
  const W = 1080, H = kind === "feed" ? 1350 : 1920, m = 56;
  const src = path.join(HF, `raw_${kind}_${ad.src}.png`); // historias nuevas: raw_story_5/7/9
  const base = await sharp(src).resize(W, H, { fit: "cover", position: "top" }).png().toBuffer();
  // zona inferior para texto: en historia termina arriba de los 250 px que tapa el botón de Meta
  const bandBottom = kind === "feed" ? H - 40 : H - 300;
  const fadeTop = bandBottom - 330;
  const L = await logo(kind === "feed" ? 96 : 110);
  const logoTop = kind === "feed" ? 34 : 280;
  const logoLeft = kind === "feed" ? m - 4 : W - m - 116;
  let s = `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${NAVY_D}" stop-opacity="0"/><stop offset="0.5" stop-color="${NAVY_D}" stop-opacity="${ad.strong ? 0.9 : 0.78}"/><stop offset="1" stop-color="${NAVY_D}" stop-opacity="${ad.strong ? 0.97 : 0.92}"/></linearGradient><filter id="sh" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="5"/><feOffset dy="2"/><feComponentTransfer><feFuncA type="linear" slope="0.7"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  s += `<rect x="0" y="${fadeTop}" width="${W}" height="${H - fadeTop}" fill="url(#f)"/>`;
  // fechas arriba a la derecha, alineadas al centro del logo
  const dy = logoTop + (kind === "feed" ? 58 : 66);
  if (kind === "feed") s += `<text x="${W - m}" y="${dy}" text-anchor="end" font-family="Montserrat" font-weight="700" font-size="26" letter-spacing="3" fill="${WHITE}">9 AL 18 DE NOVIEMBRE</text>`;
  // bloque inferior
  const y1 = bandBottom - 120;
  s += `<text x="${m}" y="${y1}" font-family="Montserrat" font-weight="700" font-size="36" fill="${WHITE}" filter="url(#sh)">${esc(ad.sub)}</text>`;
  s += pill(m, y1 + 30, 74, "APARTA AL 81 3109 2383", 28);
  s += `<text x="${W - m}" y="${y1 + 60}" text-anchor="end" font-family="Montserrat" font-weight="500" font-size="23" fill="${WHITE}" opacity="0.85">${kind === "feed" ? "Por WhatsApp" : "Del 9 al 18 de noviembre"}</text>`;
  s += `<text x="${W - m}" y="${y1 + 92}" text-anchor="end" font-family="Montserrat" font-weight="500" font-size="23" fill="${WHITE}" opacity="0.85">Eventos hasta junio 2027</text>`;
  const out = path.join(OUT, `${ad.id}_${kind === "feed" ? "feed_4x5" : "historia_9x16"}.jpg`);
  await sharp(base).composite([
    { input: await grain(W, H), blend: "overlay" },
    { input: Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`) },
    { input: L, left: logoLeft, top: logoTop },
  ]).jpeg({ quality: 92 }).toFile(out);
  return out;
}

(async () => {
  const kinds = (process.argv[2] || "feed,story").split(",");
  for (const ad of ADS) for (const kind of kinds) {
    if (!fs.existsSync(path.join(HF, `raw_${kind}_${ad.src}.png`))) continue;
    console.log(await build({ ad, kind }));
  }
})().catch((e) => { console.error(e); process.exit(1); });
