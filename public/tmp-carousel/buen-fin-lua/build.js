/**
 * Lúa Eventos — Buen Fin 2026 (13–17 nov): 20% en cualquier barra, eventos hasta junio 2027.
 * Fotos reales recortadas (lua-semana/cutouts), sin IA generativa. Feed 4:5 + historia 9:16.
 * Fuentes: Anton (cifra) + Montserrat (texto) instaladas en ~/.fonts.
 * Uso: NODE_PATH=<carpeta con sharp>/node_modules node build.js [id ...]
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = path.join(__dirname, "..");
const CUT = path.join(ROOT, "lua-semana", "cutouts");
const LOGO = path.join(ROOT, "logo_src.jpg");
const OUT = path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true });

const NAVY = "#1B4A6B", NAVY_D = "#0B1423", PEACH = "#F5AF95", CORAL = "#E63980", WHITE = "#FFFFFF";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ADS = [
  { id: "A_general", hero: "K_duo", sub: ["en tu barra de frappés,", "crepas, elotes y waffles"] },
  { id: "B_xv_bodas", hero: "E_duo_estrellas", sub: ["para tus XV, boda o", "bautizo de 2027"] },
  { id: "C_crepas_waffles", hero: "J_waffle_disc", sub: ["en barra de crepas y", "waffles para tu evento"] },
  { id: "D_posadas", hero: "M_fila_mango", sub: ["para tu posada", "de diciembre"] },
  { id: "E_ninos", hero: "N_magnum", sub: ["para el cumple de los", "niños, con frappés y paleta"], bleedRight: true },
];

async function circleLogo(size) {
  const ring = 6;
  const logo = await sharp(LOGO).resize(size, size, { fit: "cover" })
    .composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`), blend: "dest-in" }])
    .png().toBuffer();
  const S = size + ring * 2;
  return sharp({ create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: Buffer.from(`<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}" fill="#fff"/></svg>`) },
      { input: logo, left: ring, top: ring },
    ]).png().toBuffer();
}

async function hero(name, maxW, maxH) {
  const buf = await sharp(path.join(CUT, name + ".png")).ensureAlpha().trim({ threshold: 10 }).png().toBuffer();
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h).png().toBuffer(), w, h };
}

const shadow = (w, h) => Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="s"><stop offset="0" stop-color="${NAVY_D}" stop-opacity="0.6"/><stop offset="1" stop-color="${NAVY_D}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}" fill="url(#s)"/></svg>`);

const bg = (W, H) => `<defs><radialGradient id="bg" cx="70%" cy="70%" r="85%"><stop offset="0" stop-color="#22597F"/><stop offset="0.55" stop-color="${NAVY}"/><stop offset="1" stop-color="${NAVY_D}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#bg)"/>`;

const pill = (x, y, text, { size, fill, color, padX, h, anchor = "start", ls = 3 }) => {
  const w = Math.round(text.length * size * 0.68 + padX * 2 + text.length * ls * 0.9);
  const x0 = anchor === "middle" ? x - w / 2 : x;
  return `<rect x="${x0}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>` +
    `<text x="${x0 + w / 2}" y="${y + h / 2 + size * 0.36}" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="${size}" letter-spacing="${ls}" fill="${color}">${esc(text)}</text>`;
};

async function feed(ad) {
  const W = 1080, H = 1350, m = 72;
  const logoSize = 118;
  const L = await circleLogo(logoSize);
  const hr = await hero(ad.hero, 540, 700);
  const hx = Math.max(575, W - hr.w + Math.round(hr.w * 0.06)), hy = H - hr.h + Math.round(hr.h * 0.05); // sangra a la derecha y abajo
  let s = bg(W, H);
  s += pill(m, 214, "BUEN FIN · 13 AL 17 DE NOVIEMBRE", { size: 26, fill: CORAL, color: WHITE, padX: 26, h: 58, ls: 2 });
  s += `<text x="${m - 8}" y="672" font-family="Anton" font-size="400" fill="${WHITE}" letter-spacing="-4">20%</text>`;
  s += `<text x="${m}" y="772" font-family="Anton" font-size="96" fill="${PEACH}" letter-spacing="2">DE DESCUENTO</text>`;
  ad.sub.forEach((t, i) => { s += `<text x="${m}" y="${846 + i * 50}" font-family="Montserrat" font-weight="600" font-size="38" fill="${WHITE}">${esc(t)}</text>`; });
  s += pill(m, 966, "APARTA POR WHATSAPP", { size: 28, fill: PEACH, color: NAVY_D, padX: 34, h: 76, ls: 2 });
  s += `<text x="${m}" y="1112" font-family="Montserrat" font-weight="800" font-size="44" fill="${WHITE}" letter-spacing="1">81 3109 2383</text>`;
  s += `<text x="${m}" y="${H - 66}" font-family="Montserrat" font-weight="500" font-size="28" fill="${WHITE}" opacity="0.75">Para eventos hasta junio 2027</text>`;
  const out = path.join(OUT, `${ad.id}_feed_4x5.png`);
  await sharp(Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`))
    .composite([
      { input: shadow(Math.round(hr.w * 0.9), 70), left: hx + Math.round(hr.w * 0.05), top: Math.min(H - 40, hy + hr.h - 40) },
      { input: hr.buf, left: hx, top: hy },
      { input: L, left: m - 6, top: m - 6 },
    ]).png().toFile(out);
  return out;
}

async function story(ad) {
  const W = 1080, H = 1920, cx = W / 2;
  const logoSize = 150;
  const L = await circleLogo(logoSize);
  const hr = await hero(ad.hero, 860, 510);
  const hx = ad.bleedRight ? W - hr.w + Math.round(hr.w * 0.08) : Math.round(cx - hr.w / 2), hy = 1880 - hr.h;
  let s = bg(W, H);
  s += pill(cx, 450, "BUEN FIN · 13 AL 17 DE NOVIEMBRE", { size: 30, fill: CORAL, color: WHITE, padX: 30, h: 66, anchor: "middle", ls: 2 });
  s += `<text x="${cx}" y="930" text-anchor="middle" font-family="Anton" font-size="440" fill="${WHITE}" letter-spacing="-4">20%</text>`;
  s += `<text x="${cx}" y="1036" text-anchor="middle" font-family="Anton" font-size="98" fill="${PEACH}" letter-spacing="2">DE DESCUENTO</text>`;
  ad.sub.forEach((t, i) => { s += `<text x="${cx}" y="${1104 + i * 52}" text-anchor="middle" font-family="Montserrat" font-weight="600" font-size="40" fill="${WHITE}">${esc(t)}</text>`; });
  s += `<text x="${cx}" y="1212" text-anchor="middle" font-family="Montserrat" font-weight="500" font-size="28" fill="${WHITE}" opacity="0.75">Para eventos hasta junio 2027</text>`;
  s += pill(cx, 1244, "APARTA: 81 3109 2383", { size: 32, fill: PEACH, color: NAVY_D, padX: 36, h: 84, anchor: "middle", ls: 1 });
  const out = path.join(OUT, `${ad.id}_story_9x16.png`);
  await sharp(Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`))
    .composite([
      { input: shadow(Math.round(hr.w * 0.8), 80), left: hx + Math.round(hr.w * 0.1), top: Math.min(H - 60, hy + hr.h - 45) },
      { input: hr.buf, left: hx, top: hy },
      { input: L, left: Math.round(cx - (logoSize + 12) / 2), top: 270 },
    ]).png().toFile(out);
  return out;
}

(async () => {
  const want = process.argv.slice(2);
  for (const ad of ADS.filter((a) => !want.length || want.includes(a.id))) {
    console.log(await feed(ad));
    console.log(await story(ad));
  }
})().catch((e) => { console.error(e); process.exit(1); });
