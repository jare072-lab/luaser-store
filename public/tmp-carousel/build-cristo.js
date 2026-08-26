// Builder: foto de catálogo del letrero Cristo "Bienvenidos"
// compuesta desde el vector de corte real. Geometría exacta, cero alucinación.
const sharp = require('sharp');
const fs = require('fs');

const SVG    = 'C:/Users/jorge/OneDrive/Desktop/mercadolibre/cristomercado.svg';
const OUT    = 'C:/Users/jorge/CLAUDE/public/tmp-carousel/cristo/';
const CANVAS = 2048;

const cfg = {
  angle: 13,           // mec.4: inclinación 10-25 grados
  bboxRatio: 0.745,    // mec.2: 70-78% del ancho, medido sobre la tinta real
  yOffset: -0.012,     // leve alza óptica
  edgePx: 12,          // mec.6: canto de 6 mm
  edgeAngle: 34,
  shadowBlur: 22,
  shadowDx: 26, shadowDy: 34,
  shadowAlpha: 0.34,
  bgTL: [243, 244, 245],  // mec.1: #F3F4F5
  bgBR: [223, 224, 228],  //     -> #DFE0E4
  faceColor: '#161616',
  edgeColor: '#4c4945',
};

const rad = d => d * Math.PI / 180;

const fillSvg = color => fs.readFileSync(SVG, 'utf8')
  .replace(/style="fill:none;[^"]*"/,
           `style="fill:${color};fill-rule:evenodd;stroke:none"`);

function background() {
  const { bgTL: a, bgBR: b } = cfg;
  const mid = a.map((v, i) => Math.round((v + b[i]) / 2));
  return Buffer.from(`<svg width="${CANVAS}" height="${CANVAS}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0.05" y1="0" x2="0.95" y2="1">
        <stop offset="0"    stop-color="rgb(${a})"/>
        <stop offset="0.5"  stop-color="rgb(${mid})"/>
        <stop offset="1"    stop-color="rgb(${b})"/>
      </linearGradient>
      <radialGradient id="v" cx="0.34" cy="0.30" r="0.75">
        <stop offset="0.4" stop-color="#ffffff" stop-opacity="0.10"/>
        <stop offset="1"   stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`);
}

// bbox real de la tinta (alfa > 8), no la caja del buffer
async function inkBox(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
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
  // 1. render base holgado del vector, en negro
  const BASE = 2600;
  const probe = await sharp(Buffer.from(fillSvg(cfg.faceColor)), { density: 300 })
    .resize({ width: BASE }).png().toBuffer();
  const pm = await sharp(probe).metadata();

  const edge = await sharp(Buffer.from(fillSvg(cfg.edgeColor)), { density: 300 })
    .resize({ width: BASE }).png().toBuffer();

  // 2. extruir el canto: copias desplazadas por debajo de la cara
  const ea = rad(cfg.edgeAngle);
  const pad = cfg.edgePx + 6;
  const layers = [];
  for (let i = cfg.edgePx; i >= 1; i--) {
    layers.push({ input: edge,
      left: pad + Math.round(Math.cos(ea) * i),
      top:  pad + Math.round(Math.sin(ea) * i) });
  }
  layers.push({ input: probe, left: pad, top: pad });

  const solid = await sharp({
    create: { width: pm.width + pad * 2, height: pm.height + pad * 2, channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite(layers).png().toBuffer();

  // 3. rotar y recortar a la tinta real
  const rotated = await sharp(solid)
    .rotate(-cfg.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const box = await inkBox(rotated);
  const tight = await sharp(rotated).extract(box).png().toBuffer();

  // 4. escalar para que la tinta ocupe exactamente bboxRatio del ancho
  const targetW = Math.round(cfg.bboxRatio * CANVAS);
  const sign = await sharp(tight).resize({ width: targetW }).png().toBuffer();
  const sm = await sharp(sign).metadata();

  // 5. sombra de contacto: la propia silueta desenfocada
  const shadowAlpha = await sharp(sign)
    .extractChannel('alpha').blur(cfg.shadowBlur).linear(cfg.shadowAlpha, 0).toBuffer();
  const shadow = await sharp({
    create: { width: sm.width, height: sm.height, channels: 3,
              background: { r: 28, g: 26, b: 24 } }
  }).joinChannel(shadowAlpha).png().toBuffer();

  // 6. componer centrado
  const left = Math.round((CANVAS - sm.width) / 2);
  const top  = Math.round((CANVAS - sm.height) / 2 + cfg.yOffset * CANVAS);

  await sharp(background(), { density: 72 })
    .composite([
      { input: shadow, left: left + cfg.shadowDx, top: top + cfg.shadowDy },
      { input: sign,   left, top },
    ])
    .resize(CANVAS, CANVAS, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(OUT + 'cristo-hero.png');

  console.log(JSON.stringify({
    bboxPctW: (sm.width / CANVAS * 100).toFixed(1),
    bboxPctH: (sm.height / CANVAS * 100).toFixed(1),
    margenIzqDer: (left / CANVAS * 100).toFixed(1),
    margenSup: (top / CANVAS * 100).toFixed(1),
    margenInf: ((CANVAS - top - sm.height) / CANVAS * 100).toFixed(1),
    angulo: cfg.angle,
  }));
})();
