// Builder ronda 2: foto de catálogo del letrero Cristo "Bienvenidos".
// Geometría desde el vector de corte real; la MATERIA se construye por capas,
// porque la ronda 1 falló por leerse como arte vectorial y no como MDF fotografiado.
const sharp = require('sharp');
const fs = require('fs');

const SVG    = 'C:/Users/jorge/OneDrive/Desktop/mercadolibre/cristomercado.svg';
const OUT    = 'C:/Users/jorge/CLAUDE/public/tmp-carousel/cristo/';
const CANVAS = 2048;

const cfg = {
  angle: 13,
  bboxRatio: 0.745,
  yOffset: -0.010,

  edgePx: 12,                // espesor de 6 mm proyectado
  edgeAngle: 36,             // el canto se ve hacia abajo-derecha
  edgeDark: [20, 18, 17],
  edgeLit:  [76, 71, 64],  // el MDF cortado capta luz rasante en el canto

  faceBase: [19, 19, 20],
  faceLift: 10,              // cuánto se aclara la cara hacia la luz
  grain: 4,                  // textura de pintura mate

  rimPx: 2,                  // bisel iluminado del lado de la luz
  rimColor: [92, 90, 87],
  rimAlpha: 0.30,

  aoBlur: 5,  aoAlpha: 0.30,     aoDx: 2,  aoDy: 4,
  shadowBlur: 16, shadowAlpha: 0.24, shadowDx: 20, shadowDy: 26,

  bgTL: [243, 244, 245],
  bgBR: [222, 223, 227],
};

const rad  = d => d * Math.PI / 180;
const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb  = c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';

const fillSvg = color => fs.readFileSync(SVG, 'utf8')
  .replace(/style="fill:none;[^"]*"/,
           'style="fill:' + color + ';fill-rule:evenodd;stroke:none"');

function background() {
  const a = cfg.bgTL, b = cfg.bgBR;
  return Buffer.from(
    '<svg width="' + CANVAS + '" height="' + CANVAS + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="g" x1="0.05" y1="0" x2="0.95" y2="1">' +
      '<stop offset="0" stop-color="' + rgb(a) + '"/>' +
      '<stop offset="0.5" stop-color="' + rgb(lerp(a, b, 0.5)) + '"/>' +
      '<stop offset="1" stop-color="' + rgb(b) + '"/>' +
    '</linearGradient>' +
    '<radialGradient id="v" cx="0.33" cy="0.28" r="0.72">' +
      '<stop offset="0.35" stop-color="#ffffff" stop-opacity="0.11"/>' +
      '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>' +
    '</radialGradient>' +
    '</defs>' +
    '<rect width="100%" height="100%" fill="url(#g)"/>' +
    '<rect width="100%" height="100%" fill="url(#v)"/>' +
    '</svg>');
}

async function inkBox(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * C + 3] > 8) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

(async () => {
  // ---- 1. perfil del corte y su máscara
  const BASE = 2600;
  const maskFull = await sharp(Buffer.from(fillSvg('#ffffff')), { density: 300 })
    .resize({ width: BASE }).png().toBuffer();
  const pm = await sharp(maskFull).metadata();
  const W0 = pm.width, H0 = pm.height;
  const mask = await sharp(maskFull).extractChannel('alpha').raw().toBuffer(); // raw 1 canal

  const pad = cfg.edgePx + 8;
  const CW = W0 + pad * 2, CH = H0 + pad * 2;
  const place = (buf, dx, dy) => ({ input: buf, left: pad + (dx || 0), top: pad + (dy || 0) });

  const tinted = async col => sharp({
      create: { width: W0, height: H0, channels: 3, background: { r: col[0], g: col[1], b: col[2] } }
    }).joinChannel(mask, { raw: { width: W0, height: H0, channels: 1 } }).png().toBuffer();

  // ---- 2. canto extruido con rampa de luz de dentro hacia fuera
  const ea = rad(cfg.edgeAngle);
  const edgeLayers = [];
  for (let i = cfg.edgePx; i >= 1; i--) {
    const t = i / cfg.edgePx;                     // 1 = borde exterior
    const layer = await tinted(lerp(cfg.edgeDark, cfg.edgeLit, Math.pow(t, 0.7)));
    edgeLayers.push(place(layer, Math.round(Math.cos(ea) * i), Math.round(Math.sin(ea) * i)));
  }

  // ---- 3. cara: base oscura + luz no uniforme + grano de pintura mate
  const shadeSvg = Buffer.from(
    '<svg width="' + W0 + '" height="' + H0 + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="s" x1="0.08" y1="0" x2="0.92" y2="1">' +
      '<stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#000000"/>' +
    '</linearGradient></defs>' +
    '<rect width="100%" height="100%" fill="url(#s)"/></svg>');
  const ramp = await sharp(shadeSvg, { density: 72 })
    .resize(W0, H0, { fit: 'fill' }).greyscale().raw().toBuffer();

  const faceRGB = Buffer.alloc(W0 * H0 * 3);
  for (let i = 0; i < W0 * H0; i++) {
    const lift  = (ramp[i] / 255) * cfg.faceLift;
    const noise = (Math.random() - 0.5) * 2 * cfg.grain;
    for (let c = 0; c < 3; c++) {
      const v = Math.round(cfg.faceBase[c] + lift + noise);
      faceRGB[i * 3 + c] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  const face = await sharp(faceRGB, { raw: { width: W0, height: H0, channels: 3 } })
    .joinChannel(mask, { raw: { width: W0, height: H0, channels: 1 } }).png().toBuffer();

  // ---- 4. bisel iluminado en el lado que mira a la luz (arriba-izquierda)
  // el perfil encogido y desplazado hacia la sombra; lo que sobra del perfil
  // original por el lado de la luz es el bisel
  const eroded = await sharp(mask, { raw: { width: W0, height: H0, channels: 1 } })
    .blur(cfg.rimPx).linear(3, -330).raw().toBuffer();

  const rimRaw = Buffer.alloc(W0 * H0);
  const sx = 2, sy = 3;
  for (let y = 0; y < H0; y++) for (let x = 0; x < W0; x++) {
    const px = x - sx, py = y - sy;
    const e = (px >= 0 && py >= 0) ? eroded[py * W0 + px] : 0;
    const v = mask[y * W0 + x] - e;
    rimRaw[y * W0 + x] = v > 0 ? Math.round(v * cfg.rimAlpha) : 0;
  }
  const rim = await sharp({
      create: { width: W0, height: H0, channels: 3,
                background: { r: cfg.rimColor[0], g: cfg.rimColor[1], b: cfg.rimColor[2] } }
    }).joinChannel(rimRaw, { raw: { width: W0, height: H0, channels: 1 } })
    .png().toBuffer();

  // ---- 5. pieza sólida, rotada y ajustada a la tinta real
  const solid = await sharp({
      create: { width: CW, height: CH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    }).composite(edgeLayers.concat([place(face), place(rim)])).png().toBuffer();

  const rotated = await sharp(solid)
    .rotate(-cfg.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const tight = await sharp(rotated).extract(await inkBox(rotated)).png().toBuffer();

  const sign = await sharp(tight)
    .resize({ width: Math.round(cfg.bboxRatio * CANVAS) }).png().toBuffer();
  const sm = await sharp(sign).metadata();

  // ---- 6. oclusión de contacto (pegada) + sombra proyectada (suelta)
  const shade = async (blur, alpha, tint) => {
    const a = await sharp(sign).extractChannel('alpha').blur(blur).linear(alpha, 0).raw().toBuffer();
    return sharp({ create: { width: sm.width, height: sm.height, channels: 3,
                             background: { r: tint[0], g: tint[1], b: tint[2] } } })
      .joinChannel(a, { raw: { width: sm.width, height: sm.height, channels: 1 } })
      .png().toBuffer();
  };
  const ao     = await shade(cfg.aoBlur,     cfg.aoAlpha,     [30, 29, 27]);
  const shadow = await shade(cfg.shadowBlur, cfg.shadowAlpha, [34, 32, 30]);

  const left = Math.round((CANVAS - sm.width) / 2);
  const top  = Math.round((CANVAS - sm.height) / 2 + cfg.yOffset * CANVAS);

  await sharp(background(), { density: 72 })
    .composite([
      { input: shadow, left: left + cfg.shadowDx, top: top + cfg.shadowDy },
      { input: ao,     left: left + cfg.aoDx,     top: top + cfg.aoDy },
      { input: sign,   left: left, top: top },
    ])
    .resize(CANVAS, CANVAS, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(OUT + 'cristo-hero-r2.png');

  console.log(JSON.stringify({
    lienzo: CANVAS + 'x' + CANVAS,
    anchoPct: (sm.width / CANVAS * 100).toFixed(1),
    altoPct:  (sm.height / CANVAS * 100).toFixed(1),
    margenIzq: (left / CANVAS * 100).toFixed(1),
    margenSup: (top / CANVAS * 100).toFixed(1),
  }));
})();
