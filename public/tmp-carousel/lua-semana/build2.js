/**
 * Ronda 2 — producto RECORTADO (fondo removido localmente, sin IA generativa) sobre azul plano.
 * Posiciones de texto fijas en toda la serie. Un acento por pieza. Logo fijo.
 * Uso: node build2.js [p1 p2 p3 p4]
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const OUT = "C:/Users/jorge/OneDrive/Desktop/LUA EVENTOS/Semana_Lua_1";
const CUT = path.join(__dirname, "cutouts");
const LOGO = "C:/Users/jorge/CLAUDE/public/tmp-carousel/logo_src.jpg";
const NAVY = "#1B4A6B", NAVY_D = "#0B1423", ACCENT = "#F5AF95";
const C = (n) => path.join(CUT, n + ".png");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu;
const clean = (s) => String(s || "").replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();

async function circleLogo(size) {
  return sharp(LOGO).resize(size, size).composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}"/></svg>`), blend: "dest-in" }]).png().toBuffer();
}
const ring = (size) => Buffer.from(`<svg width="${size+8}" height="${size+8}"><circle cx="${(size+8)/2}" cy="${(size+8)/2}" r="${size/2+2}" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`);

/** Recorte trimmed → escalado a una altura objetivo; opcionalmente recorta una franja horizontal (para aislar un vaso central). */
async function heroCutout({ file, targetH, maxW, sub, fadeBottom, cropY, fadeTop, fadeLeft, sat }) {
  let img = sharp(file);
  if (sub) { // sub = [x0, x1] fracción del ancho del archivo original
    const m = await sharp(file).metadata();
    const left = Math.round(m.width * sub[0]), width = Math.min(m.width - left, Math.round(m.width * (sub[1] - sub[0])));
    img = sharp(await sharp(file).extract({ left, top: 0, width, height: m.height }).png().toBuffer());
  }
  img = img.trim({ threshold: 10 });
  let buf = await img.png().toBuffer();
  let meta = await sharp(buf).metadata();
  if (cropY) {
    const top = Math.round(meta.height * cropY[0]), height = Math.min(meta.height - top, Math.round(meta.height * (cropY[1] - cropY[0])));
    buf = await sharp(await sharp(buf).extract({ left: 0, top, width: meta.width, height }).png().toBuffer()).trim({ threshold: 10 }).png().toBuffer();
    meta = await sharp(buf).metadata();
  }
  let scale = targetH / meta.height;
  if (meta.width * scale > maxW) scale = maxW / meta.width;
  const w = Math.round(meta.width * scale), h = Math.round(meta.height * scale);
  let out = await sharp(buf).resize(w, h).png().toBuffer();
  if (sat) out = await sharp(out).modulate({ saturation: sat }).png().toBuffer();
  const fade = async (grad) => { const fm = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs>${grad}</defs><rect width="${w}" height="${h}" fill="url(#f)"/></svg>`); out = await sharp(out).composite([{ input: fm, blend: "dest-in" }]).png().toBuffer(); };
  if (fadeBottom) await fade(`<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="${1 - fadeBottom}" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
  if (fadeTop) await fade(`<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${fadeTop}" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>`);
  if (fadeLeft) await fade(`<linearGradient id="f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="${fadeLeft}" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>`);
  return { buf: out, w, h };
}

function shadow(w, h) {
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${NAVY_D}" stop-opacity="0.55"/><stop offset="1" stop-color="${NAVY_D}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${w/2}" cy="${h/2}" rx="${w/2}" ry="${h/2}" fill="url(#s)"/></svg>`);
}

const fitSize = (px, texts, maxW) => { const longest = Math.max(...texts.filter(Boolean).map((t) => clean(t).length)); const est = longest * px * 0.66; return est > maxW ? Math.floor(px * maxW / est) : px; };
const T = (x, y, size, txt, { weight = 800, fill = "#fff", family = "Arial, sans-serif", ls = 0, op = 1 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="${family}" font-weight="${weight}" font-size="${size}" letter-spacing="${ls}" fill="${fill}" opacity="${op}">${esc(clean(txt))}</text>`;

/** FEED 1080x1350 — layout fijo: héroe 0.08–0.64, eyebrow 0.705, titular 0.79 / 0.88, sub 0.95 ó botón 0.90–0.965 */
async function feedCard({ file, crop: subCrop, fadeBottom, cropY, fadeTop, fadeLeft, sat, eyebrow, h1, h2, sub, pill, outPath, heroH = 0.60, heroTop = 0.055 }) {
  const W = 1080, H = 1350, cx = W / 2, m = Math.round(W * 0.065);
  const hero = await heroCutout({ file, targetH: Math.round(H * heroH), maxW: W - 2 * m, sub: subCrop, fadeBottom, cropY, fadeTop, fadeLeft, sat });
  const hLeft = Math.round(cx - hero.w / 2), hTop = Math.round(H * heroTop + (H * heroH - hero.h)); // base alineada
  const shW = Math.round(hero.w * 0.9), shH = Math.round(hero.w * 0.16);
  const H1 = fitSize(Math.round(H * 0.088), [h1, h2], W - 2 * m), H2 = Math.round(H1 * 0.40), H3 = Math.round(H1 * 0.26);
  let svg = "";
  svg += T(cx, Math.round(H * 0.705), H3, eyebrow, { weight: 700, fill: pill ? "#fff" : ACCENT, ls: 6, op: pill ? 0.85 : 1 });
  svg += T(cx, Math.round(H * 0.79), H1, h1, { weight: 900, family: "Arial Black, Arial, sans-serif" });
  svg += T(cx, Math.round(H * 0.878), H1, h2, { weight: 900, family: "Arial Black, Arial, sans-serif" });
  if (pill) {
    const pw = Math.round(W * 0.62), ph = Math.round(H2 * 1.9), py = Math.round(H * 0.905);
    svg += `<rect x="${cx - pw/2}" y="${py}" width="${pw}" height="${ph}" rx="${ph/2}" fill="${ACCENT}"/>` + T(cx, py + ph / 2 + H2 * 0.36, H2, pill, { weight: 800, fill: NAVY_D, ls: 1 });
  } else if (sub) {
    svg += T(cx, Math.round(H * 0.945), H2, sub, { weight: 600 });
  }
  const logoSize = Math.round(W * 0.10), logo = await circleLogo(logoSize);
  await sharp({ create: { width: W, height: H, channels: 3, background: NAVY } }).composite([
    { input: shadow(shW, shH), left: Math.round(cx - shW / 2), top: hTop + hero.h - Math.round(shH / 2) },
    { input: hero.buf, left: hLeft, top: hTop },
    { input: Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`), left: 0, top: 0 },
    { input: logo, left: m, top: m }, { input: ring(logoSize), left: m - 4, top: m - 4 },
  ]).png().toFile(outPath);
}

/** HISTORIA 1080x1920 — logo 0.13, eyebrow 0.21, titular 0.28 / 0.35, sub 0.405, héroe 0.44–0.83, botón 0.845–0.895 */
async function storyCard({ file, crop: subCrop, fadeBottom, cropY, fadeTop, fadeLeft, sat, eyebrow, h1, h2, sub, pill, outPath }) {
  const W = 1080, H = 1920, cx = W / 2, m = Math.round(W * 0.065);
  const heroTop = Math.round(H * 0.385), heroH = Math.round(H * 0.425);
  const hero = await heroCutout({ file, targetH: heroH, maxW: W - 2 * m, sub: subCrop, fadeBottom, cropY, fadeTop, fadeLeft, sat });
  const hLeft = Math.round(cx - hero.w / 2), hTop = heroTop + (heroH - hero.h);
  const shW = Math.round(hero.w * 0.9), shH = Math.round(hero.w * 0.16);
  const H1 = fitSize(Math.round(H * 0.082), [h1, h2], W - 2 * m), H2 = Math.round(H1 * 0.40), H3 = Math.round(H1 * 0.26);
  let svg = "";
  svg += T(cx, Math.round(H * 0.15), H3, eyebrow, { weight: 700, fill: "#fff", ls: 6, op: 0.85 });
  svg += T(cx, Math.round(H * 0.225), H1, h1, { weight: 900, family: "Arial Black, Arial, sans-serif" });
  if (h2) svg += T(cx, Math.round(H * 0.298), H1, h2, { weight: 900, family: "Arial Black, Arial, sans-serif" });
  if (sub) svg += T(cx, Math.round(H * (h2 ? 0.338 : 0.268)), H2, sub, { weight: 600 });
  const pw = Math.round(W * 0.74), ph = Math.round(H2 * 1.9), py = Math.round(H * 0.835);
  svg += `<rect x="${cx - pw/2}" y="${py}" width="${pw}" height="${ph}" rx="${ph/2}" fill="${ACCENT}"/>` + T(cx, py + ph / 2 + H2 * 0.36, H2, pill, { weight: 800, fill: NAVY_D, ls: 1 });
  const logoSize = Math.round(W * 0.11), logo = await circleLogo(logoSize);
  await sharp({ create: { width: W, height: H, channels: 3, background: NAVY } }).composite([
    { input: shadow(shW, shH), left: Math.round(cx - shW / 2), top: hTop + hero.h - Math.round(shH / 2) },
    { input: hero.buf, left: hLeft, top: hTop },
    { input: Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`), left: 0, top: 0 },
    { input: logo, left: Math.round(cx - logoSize / 2), top: Math.round(H * 0.055) }, { input: ring(logoSize), left: Math.round(cx - logoSize / 2) - 4, top: Math.round(H * 0.055) - 4 },
  ]).png().toFile(outPath);
}

const D1 = path.join(OUT, "01_Lunes"), D2 = path.join(OUT, "02_Martes"), D3 = path.join(OUT, "03_Miercoles"), D4 = path.join(OUT, "04_Jueves"), D5 = path.join(OUT, "05_Viernes");
const PIECES = {
  p1: async () => {
    const d = path.join(D1, "carrusel_menu");
    await feedCard({ file: C("S_oreo_clean"), eyebrow: "Lúa Eventos", h1: "Menú para", h2: "tu fiesta", sub: "Desliza para ver todo", outPath: path.join(d, "slide_1_portada.png") });
    await feedCard({ file: C("V_mango"), cropY: [0.36, 1], fadeTop: 0.10, eyebrow: "01 · Frappés", h1: "Mango con", h2: "chamoy", sub: "Gomitas, tajín y popote enchilado", outPath: path.join(d, "slide_2_frappes.png") });
    await feedCard({ file: C("Q_crepa_key"), fadeBottom: 0.14, fadeLeft: 0.12, eyebrow: "02 · Crepas", h1: "Crepas", h2: "recién hechas", sub: "Nutella y fresa fresca", outPath: path.join(d, "slide_3_crepas.png") });
    await feedCard({ file: C("J_waffle_disc"), eyebrow: "03 · Waffles", h1: "Waffles", h2: "con todo", sub: "Fruta fresca y chocolate", outPath: path.join(d, "slide_4_waffles.png") });
    await feedCard({ file: C("R_elote"), cropY: [0.30, 1], fadeTop: 0.10, sat: 0.88, eyebrow: "04 · Snacks", h1: "Elotes", h2: "en vaso", sub: "Con queso, chamoy y salsas", outPath: path.join(d, "slide_5_snacks.png") });
    await feedCard({ file: C("N_magnum_center"), eyebrow: "Aparta tu fecha", h1: "Cotiza", h2: "hoy", pill: "WhatsApp 81 3109 2383", outPath: path.join(d, "slide_6_cta.png") });
  },
  p2: async () => {
    await feedCard({ file: C("S_oreo_clean"), eyebrow: "Sabor de la semana", h1: "Frappé", h2: "de Oreo", pill: "Cotiza tu evento", outPath: path.join(D2, "post_frappe_oreo.png") });
    await feedCard({ file: C("V_mango"), cropY: [0.36, 1], fadeTop: 0.10, eyebrow: "El más pedido", h1: "Mango", h2: "con chamoy", pill: "Cotiza tu evento", outPath: path.join(D3, "post_frappe_mango.png") });
    await feedCard({ file: C("N_magnum_center"), eyebrow: "Nuevo", h1: "Frappé", h2: "Magnum", pill: "Cotiza tu evento", outPath: path.join(D4, "post_frappe_magnum.png") });
    await feedCard({ file: C("D_mango_noche"), crop: [0.12, 1], cropY: [0.42, 1], fadeTop: 0.10, eyebrow: "Para tu evento", h1: "Barra de", h2: "frappés", pill: "Aparta tu fecha", outPath: path.join(D5, "post_duo_oreo_mango.png") });
  },
  p3: async () => {
    await storyCard({ file: C("V_mango"), cropY: [0.36, 1], fadeTop: 0.10, eyebrow: "Lúa Eventos", h1: "¿Antojo?", sub: "Frappés para tu evento", pill: "Cotiza por WhatsApp", outPath: path.join(D1, "historia_antojo.png") });
    await storyCard({ file: C("R_elote"), cropY: [0.30, 1], fadeTop: 0.10, sat: 0.88, eyebrow: "Servicio completo", h1: "Nosotros", h2: "servimos", sub: "Tú disfrutas tu fiesta", pill: "Aparta por WhatsApp", outPath: path.join(D2, "historia_servicio.png") });
    await storyCard({ file: C("D_mango_noche"), crop: [0.12, 1], cropY: [0.42, 1], fadeTop: 0.10, eyebrow: "XV, bodas y cumples", h1: "Barra de", h2: "frappés", sub: "Desde 30 personas", pill: "Cotiza por WhatsApp", outPath: path.join(D3, "historia_barra.png") });
    await storyCard({ file: C("J_waffle_disc"), eyebrow: "También hay", h1: "Waffles", sub: "Fruta fresca y chocolate", pill: "Cotiza por WhatsApp", outPath: path.join(D4, "historia_waffles.png") });
    await storyCard({ file: C("S_oreo_clean"), eyebrow: "Fin de semana", h1: "¿Ya tienes", h2: "tu fecha?", sub: "Quedan lugares para septiembre", pill: "Aparta por WhatsApp", outPath: path.join(D5, "historia_fecha.png") });
  },
  p4: async () => {
    const d = path.join(D5, "carrusel_fiesta");
    await feedCard({ file: C("S_oreo_clean"), eyebrow: "Así se ve", h1: "Tu fiesta", h2: "con Lúa", sub: "Desliza", outPath: path.join(d, "slide_1_portada.png") });
    await feedCard({ file: C("M_fila_mango"), crop: [0, 0.85], cropY: [0.30, 1], fadeTop: 0.10, sat: 0.88, eyebrow: "01", h1: "Barra lista", h2: "al llegar", sub: "Montamos antes de tus invitados", outPath: path.join(d, "slide_2_barra.png") });
    await feedCard({ file: C("V_mango"), cropY: [0.36, 1], fadeTop: 0.10, eyebrow: "02", h1: "Servimos", h2: "todo el evento", sub: "Nuestro equipo atiende a tus invitados", outPath: path.join(d, "slide_3_servicio.png") });
    await feedCard({ file: C("R_elote"), cropY: [0.30, 1], fadeTop: 0.10, sat: 0.88, eyebrow: "03", h1: "Snacks", h2: "sin límite", sub: "Tus invitados repiten sin costo extra", outPath: path.join(d, "slide_4_snacks.png") });
    await feedCard({ file: C("N_magnum_center"), eyebrow: "Aparta tu fecha", h1: "Cotiza", h2: "hoy", pill: "WhatsApp 81 3109 2383", outPath: path.join(d, "slide_5_cta.png") });
  },
};

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PIECES);
  for (const id of ids) { console.log("building", id); await PIECES[id](); }
  console.log("done");
})().catch((e) => { console.error(e); process.exit(1); });
