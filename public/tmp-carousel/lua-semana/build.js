/**
 * Builder — Lúa Eventos semana 1. Piezas compuestas sobre foto REAL (sin regenerar).
 * Plantilla heroCard: campo de color plano + producto disuelto con máscara radial
 * (mismo truco que splashHero) + 3 tamaños de tipo + un acento + logo fijo.
 * Uso: node build.js [pieceId...]   (sin args = todas)
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const FOTOS = "C:/Users/jorge/OneDrive/Desktop/LUA EVENTOS";
const OUT = "C:/Users/jorge/OneDrive/Desktop/LUA EVENTOS/Semana_Lua_1";
const LOGO = "C:/Users/jorge/CLAUDE/public/tmp-carousel/logo_src.jpg";

const NAVY = "#1B4A6B", NAVY_D = "#0B1423", ACCENT = "#F5AF95", CREAM = "#FAF5EE";

const F = (n) => path.join(FOTOS, n);
const P = {
  A: F("707464871_1270158698472109_3769834284079622112_n.jpg"),
  B: F("708967676_1270158691805443_3882463206681050557_n.jpg"),
  C: F("54er.jpeg"),
  D: F("WhatsApp Image 2026-09-01 at 10.33.52 PM (1).jpeg"),
  E: F("WhatsApp Image 2026-09-01 at 10.33.52 PM (2.jpeg"),
  G: F("WhatsApp Image 2026-09-01 at 10.33.53 24.jpeg"),
  H: F("WhatsApp Image 2026-09-01 at 10.33.53 PM.jpeg"),
  J: F("WhatsApp Image 2026-09-01 at 10.33.53 PM34.jpeg"),
  K: F("WhatsApp Image 2026-09-01 at 10.33.54 PM34.jpeg"),
  L: F("WhatsApp Image 2026-09-01 at 10.33.54 PM45.jpeg"),
  M: F("WhatsApp Image 2026-09-01 at 10.33.56 PM.jpeg"),
  N: F("WhatsApp Image 2026-09-01 at 10.33.56 PMweefd.jpeg"),
  O: F("WhatsApp Image 2026-09-01 at 10.33.56 PMwerfds.jpeg"),
  Pp: F("WhatsApp Image 2026-09-01 at 10.33.56 PMwfd.jpeg"),
  Q: F("WhatsApp Image 2026-09-01 at 10.33.57 PMretrg.jpeg"),
  R: F("WhatsApp Image 2026-09-01 at 10.33.58 PMerf.jpeg"),
  S: F("WhatsApp Image 2026-09-01 at 10.33.59 PMewr.jpeg"),
  V: F("WhatsApp Image 2026-09-01 at 10.wrfd33.57 PM.jpeg"),
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu;
const clean = (s) => String(s || "").replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();

async function circleLogo(size) {
  return sharp(LOGO).resize(size, size).composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}"/></svg>`), blend: "dest-in" }]).png().toBuffer();
}
const ring = (size) => Buffer.from(`<svg width="${size+8}" height="${size+8}"><circle cx="${(size+8)/2}" cy="${(size+8)/2}" r="${size/2+2}" fill="none" stroke="#ffffff" stroke-width="4"/></svg>`);

/** Recorta la foto por fracciones (x,y,w,h) y la disuelve al color de fondo con máscara radial. */
async function heroDissolve({ photo, crop, w, h, focus = [0.5, 0.55], inner = 0.36, outer = 0.98 }) {
  const meta = await sharp(photo).metadata();
  const [cx, cy, cw, ch] = crop || [0, 0, 1, 1];
  const region = { left: Math.round(meta.width * cx), top: Math.round(meta.height * cy), width: Math.round(meta.width * cw), height: Math.round(meta.height * ch) };
  const mask = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="m" cx="${focus[0]*100}%" cy="${focus[1]*100}%" r="${outer*55}%">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="${inner}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient></defs><rect width="${w}" height="${h}" fill="url(#m)"/></svg>`);
  const velo = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.74" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient></defs><rect width="${w}" height="${h}" fill="url(#v)"/></svg>`);
  const radial = await sharp(photo).extract(region).resize(w, h, { fit: "cover" }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  return sharp(radial).composite([{ input: velo, blend: "dest-in" }]).png().toBuffer();
}

/**
 * heroCard — feed 1080x1350 o historia 1080x1920.
 * Jerarquía: titular (≥9% del alto) > subtítulo (≈40%) > línea chica (≈25%). Un acento.
 */
async function heroCard({ width = 1080, height = 1350, bg = NAVY, photo, crop, focus, heroH, heroTop, eyebrow, headline, headline2, sub, small, pill, pillColor, logoPos = "tl", textPos = "bottom", outPath, inner, outer, bgImage }) {
  let heroHeight = Math.round(height * (heroH || 0.66));
  const hTop = Math.round(height * (heroTop == null ? (textPos === "bottom" ? 0.02 : 0.30) : heroTop));
  // altura del bloque de texto inferior para que el héroe no lo invada
  if (textPos === "bottom") {
    const h1 = Math.round(height * 0.092), h2 = Math.round(h1 * 0.4), h3 = Math.round(h1 * 0.26), mm = Math.round(width * 0.065);
    let block = mm + (pill ? Math.round(h2 * 1.9) + Math.round(h2 * 0.9) : 0) + (small ? Math.round(h3 * 1.7) : 0) + (sub ? Math.round(h2 * 1.5) : 0) + (headline2 ? Math.round(h1 * 1.02) : 0) + Math.round(h1 * 1.05) + (eyebrow ? Math.round(h3 * 1.2) : 0);
    const textTop = height - block;
    heroHeight = Math.min(heroHeight, textTop + Math.round(height * 0.03) - hTop);
  }
  const hero = await heroDissolve({ photo, crop, w: width, h: heroHeight, focus, inner, outer });

  const maxW = width - 2 * Math.round(width * 0.065);
  const fitH1 = (px) => { const longest = Math.max(...[headline, headline2].filter(Boolean).map((t) => clean(t).length)); const est = longest * px * 0.66; return est > maxW ? Math.floor(px * maxW / est) : px; };
  const H1 = fitH1(Math.round(height * 0.092));
  const H2 = Math.round(H1 * 0.40);
  const H3 = Math.round(H1 * 0.26);
  const m = Math.round(width * 0.065);
  const cx = width / 2;

  // Bloque de texto: abajo (feed) o arriba/abajo (historia)
  const lines = [];
  let y = textPos === "bottom" ? height - m - (pill ? 120 : 30) : m + 80;
  // se construye de abajo hacia arriba para el modo bottom
  let svgText = "";
  if (textPos === "bottom") {
    let cursor = height - m;
    if (pill) {
      const pw = Math.round(width * 0.62), ph = Math.round(H2 * 1.9);
      svgText += `<rect x="${cx - pw/2}" y="${cursor - ph}" width="${pw}" height="${ph}" rx="${ph/2}" fill="${pillColor || ACCENT}"/>
        <text x="${cx}" y="${cursor - ph/2 + H2*0.36}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${H2}" letter-spacing="1" fill="${NAVY_D}">${esc(clean(pill))}</text>`;
      cursor -= ph + Math.round(H2 * 0.9);
    }
    if (small) { svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${H3}" fill="#ffffff" opacity="0.85">${esc(clean(small))}</text>`; cursor -= Math.round(H3 * 1.7); }
    if (sub) { svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${H2}" fill="#ffffff">${esc(clean(sub))}</text>`; cursor -= Math.round(H2 * 1.5); }
    if (headline2) { svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${H1}" fill="#ffffff">${esc(clean(headline2))}</text>`; cursor -= Math.round(H1 * 1.02); }
    svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${H1}" fill="#ffffff">${esc(clean(headline))}</text>`;
    cursor -= Math.round(H1 * 1.05);
    if (eyebrow) svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${H3}" letter-spacing="6" fill="${ACCENT}">${esc(clean(eyebrow).toUpperCase())}</text>`;
  } else {
    let cursor = m + 60 + (logoPos === "tc" ? 140 : 0);
    if (eyebrow) { svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${H3}" letter-spacing="6" fill="${ACCENT}">${esc(clean(eyebrow).toUpperCase())}</text>`; cursor += Math.round(H3 * 1.6); }
    cursor += H1 * 0.85;
    svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${H1}" fill="#ffffff">${esc(clean(headline))}</text>`;
    if (headline2) { cursor += Math.round(H1 * 1.02); svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${H1}" fill="#ffffff">${esc(clean(headline2))}</text>`; }
    if (sub) { cursor += Math.round(H2 * 1.6); svgText += `<text x="${cx}" y="${cursor}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${H2}" fill="#ffffff">${esc(clean(sub))}</text>`; }
    // abajo: small + pill
    let bcur = height - m;
    if (pill) {
      const pw = Math.round(width * 0.62), ph = Math.round(H2 * 1.9);
      svgText += `<rect x="${cx - pw/2}" y="${bcur - ph}" width="${pw}" height="${ph}" rx="${ph/2}" fill="${pillColor || ACCENT}"/>
        <text x="${cx}" y="${bcur - ph/2 + H2*0.36}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="${H2}" letter-spacing="1" fill="${NAVY_D}">${esc(clean(pill))}</text>`;
      bcur -= ph + Math.round(H2 * 0.9);
    }
    if (small) svgText += `<text x="${cx}" y="${bcur}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="600" font-size="${H3}" fill="#ffffff" opacity="0.85">${esc(clean(small))}</text>`;
  }

  const textSvg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgText}</svg>`);

  const logoSize = Math.round(width * 0.10);
  const logo = await circleLogo(logoSize);
  const lp = logoPos === "tc" ? { left: Math.round(cx - logoSize/2), top: m } : { left: m, top: m };

  const base = sharp({ create: { width, height, channels: 3, background: bg } });
  await base.composite([
    { input: hero, left: 0, top: hTop },
    { input: textSvg, left: 0, top: 0 },
    { input: logo, left: lp.left, top: lp.top },
    { input: ring(logoSize), left: lp.left - 4, top: lp.top - 4 },
  ]).png().toFile(outPath);
  return outPath;
}

/** Slide de cierre / portada sin foto héroe grande: texto centrado sobre campo plano. */
async function textCard({ width = 1080, height = 1350, bg = NAVY, eyebrow, headline, headline2, sub, small, pill, outPath, photo, crop, focus }) {
  return heroCard({ width, height, bg, photo, crop, focus, heroH: 0.62, heroTop: 0.36, eyebrow, headline, headline2, sub, small, pill, logoPos: "tc", textPos: "top", outPath, inner: 0.3 });
}

// ---------------------------------------------------------------- PIEZAS
const D1 = path.join(OUT, "01_Lunes"), D2 = path.join(OUT, "02_Martes"), D3 = path.join(OUT, "03_Miercoles"), D4 = path.join(OUT, "04_Jueves"), D5 = path.join(OUT, "05_Viernes");
for (const d of [D1, D2, D3, D4, D5, path.join(D1, "carrusel_menu"), path.join(D5, "carrusel_fiesta")]) fs.mkdirSync(d, { recursive: true });

const FEED = { width: 1080, height: 1350 };
const STORY = { width: 1080, height: 1920 };

const PIECES = {
  // P1 — carrusel menú (lunes)
  p1: async () => {
    const dir = path.join(D1, "carrusel_menu");
    await heroCard({ ...FEED, photo: P.C, crop: [0, 0.22, 1, 0.62], focus: [0.5, 0.55], heroH: 0.68, eyebrow: "Lúa Eventos", headline: "Todo esto", headline2: "llega a tu fiesta", small: "Desliza para ver el menú", outPath: path.join(dir, "slide_1_portada.png") });
    await heroCard({ ...FEED, photo: P.V, crop: [0.05, 0.30, 0.9, 0.68], focus: [0.5, 0.58], eyebrow: "01 · Frappés", headline: "Mango con", headline2: "chamoy", sub: "Gomitas, tajín y popote enchilado", outPath: path.join(dir, "slide_2_frappes.png") });
    await heroCard({ ...FEED, photo: P.Q, crop: [0, 0, 1, 1], focus: [0.5, 0.5], eyebrow: "02 · Crepas", headline: "Crepas", headline2: "recién hechas", sub: "Nutella, fresa, plátano y más", outPath: path.join(dir, "slide_3_crepas.png") });
    await heroCard({ ...FEED, photo: P.J, crop: [0.05, 0.25, 0.9, 0.62], focus: [0.5, 0.55], eyebrow: "03 · Waffles", headline: "Waffles", headline2: "con todo", sub: "Fruta fresca y chocolate", outPath: path.join(dir, "slide_4_waffles.png") });
    await heroCard({ ...FEED, photo: P.Pp, crop: [0.02, 0.26, 0.96, 0.7], focus: [0.5, 0.55], eyebrow: "04 · Snacks", headline: "Tostilocos", headline2: "y elotes", sub: "Con queso, salsas y toppings", outPath: path.join(dir, "slide_5_snacks.png") });
    await heroCard({ ...FEED, photo: P.H, crop: [0, 0.18, 1, 0.7], focus: [0.42, 0.5], heroH: 0.62, heroTop: 0.0, eyebrow: "Aparta tu fecha", headline: "Nosotros", headline2: "servimos", sub: "Tú disfrutas tu fiesta", small: "Monterrey y área metropolitana", pill: "WhatsApp 81 3109 2383", outPath: path.join(dir, "slide_6_cta.png") });
  },
  // P2 — posts de producto
  p2: async () => {
    await heroCard({ ...FEED, photo: P.S, crop: [0.06, 0.12, 0.88, 0.82], focus: [0.5, 0.58], eyebrow: "Sabor de la semana", headline: "Frappé", headline2: "de Oreo", sub: "Crema batida y galleta entera", pill: "Cotiza tu evento", outPath: path.join(D2, "post_frappe_oreo.png") });
    await heroCard({ ...FEED, photo: P.V, crop: [0.05, 0.30, 0.9, 0.68], focus: [0.5, 0.58], eyebrow: "El más pedido", headline: "Mango", headline2: "con chamoy", sub: "Gomitas, tajín y popote enchilado", pill: "Cotiza tu evento", outPath: path.join(D3, "post_frappe_mango.png") });
    await heroCard({ ...FEED, photo: P.N, crop: [0.02, 0.08, 0.96, 0.68], focus: [0.5, 0.5], eyebrow: "Nuevo", headline: "Frappé", headline2: "Magnum", sub: "Chocolate con paleta encima", pill: "Cotiza tu evento", outPath: path.join(D4, "post_frappe_magnum.png") });
    await heroCard({ ...FEED, photo: P.E, crop: [0.02, 0.2, 0.96, 0.72], focus: [0.5, 0.55], eyebrow: "Para tu evento", headline: "Barra de", headline2: "frappés", sub: "Oreo, mango y los sabores que elijas", pill: "Aparta tu fecha", outPath: path.join(D5, "post_duo_oreo_mango.png") });
  },
  // P3 — historias
  p3: async () => {
    await heroCard({ ...STORY, photo: P.D, crop: [0.05, 0.25, 0.9, 0.72], focus: [0.5, 0.6], heroH: 0.62, heroTop: 0.24, textPos: "top", logoPos: "tc", eyebrow: "Lúa Eventos", headline: "¿Antojo?", sub: "Frappés para tu evento", small: "Desliza hacia arriba o mándanos mensaje", pill: "Cotiza por WhatsApp", outPath: path.join(D1, "historia_antojo.png") });
    await heroCard({ ...STORY, photo: P.G, crop: [0, 0.28, 1, 0.72], focus: [0.5, 0.55], heroH: 0.62, heroTop: 0.24, textPos: "top", logoPos: "tc", eyebrow: "Servicio completo", headline: "Nosotros", headline2: "servimos", sub: "Tú disfrutas tu fiesta", pill: "Aparta tu fecha", outPath: path.join(D2, "historia_servicio.png") });
    await heroCard({ ...STORY, photo: P.M, crop: [0, 0.2, 1, 0.75], focus: [0.62, 0.6], heroH: 0.62, heroTop: 0.24, textPos: "top", logoPos: "tc", eyebrow: "Para XV, bodas y cumples", headline: "Barra de", headline2: "frappés", sub: "Desde 30 personas", pill: "Cotiza por WhatsApp", outPath: path.join(D3, "historia_barra.png") });
    await heroCard({ ...STORY, photo: P.J, crop: [0.05, 0.22, 0.9, 0.66], focus: [0.5, 0.55], heroH: 0.62, heroTop: 0.24, textPos: "top", logoPos: "tc", eyebrow: "También hay", headline: "Waffles", sub: "Fruta fresca y chocolate", pill: "Ver menú completo", outPath: path.join(D4, "historia_waffles.png") });
    await heroCard({ ...STORY, photo: P.S, crop: [0.08, 0.22, 0.84, 0.74], focus: [0.5, 0.56], heroH: 0.62, heroTop: 0.24, textPos: "top", logoPos: "tc", eyebrow: "Fin de semana", headline: "¿Ya tienes", headline2: "tu fecha?", sub: "Quedan lugares para septiembre", pill: "Aparta por WhatsApp", pillColor: "#E63980", outPath: path.join(D5, "historia_fecha.png") });
  },
  // P4 — carrusel fiesta (viernes)
  p4: async () => {
    const dir = path.join(D5, "carrusel_fiesta");
    await heroCard({ ...FEED, photo: P.O, crop: [0, 0.1, 1, 0.8], focus: [0.35, 0.55], heroH: 0.68, eyebrow: "Así se ve", headline: "Tu fiesta", headline2: "con Lúa", small: "Desliza", outPath: path.join(dir, "slide_1_portada.png") });
    await heroCard({ ...FEED, photo: P.C, crop: [0, 0.22, 1, 0.62], focus: [0.5, 0.55], eyebrow: "01", headline: "Barra lista", headline2: "al llegar", sub: "Montamos antes de tus invitados", outPath: path.join(dir, "slide_2_barra.png") });
    await heroCard({ ...FEED, photo: P.G, crop: [0, 0.3, 1, 0.7], focus: [0.5, 0.5], eyebrow: "02", headline: "Servimos", headline2: "todo el evento", sub: "Personal con guantes y uniforme", outPath: path.join(dir, "slide_3_servicio.png") });
    await heroCard({ ...FEED, photo: P.Pp, crop: [0, 0.28, 1, 0.68], focus: [0.5, 0.5], eyebrow: "03", headline: "Snacks", headline2: "sin límite", sub: "Tus invitados repiten las veces que quieran", outPath: path.join(dir, "slide_4_snacks.png") });
    await heroCard({ ...FEED, photo: P.K, crop: [0.02, 0.12, 0.96, 0.84], focus: [0.5, 0.55], heroH: 0.62, heroTop: 0.0, eyebrow: "Aparta tu fecha", headline: "Cotiza", headline2: "hoy", sub: "Te respondemos el mismo día", small: "Monterrey y área metropolitana", pill: "WhatsApp 81 3109 2383", outPath: path.join(dir, "slide_5_cta.png") });
  },
};

(async () => {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PIECES);
  for (const id of ids) { console.log("building", id); await PIECES[id](); }
  console.log("done");
})().catch((e) => { console.error(e); process.exit(1); });

module.exports = { heroCard, textCard, PIECES };
