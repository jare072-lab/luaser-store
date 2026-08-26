// Builder ronda 2 (híbrido): la GEOMETRÍA sale del vector de corte real y la
// MATERIA sale del render fotográfico del modelo, recortada con la máscara del
// vector para que ni un contorno se desvíe del archivo que va al láser.
const sharp = require('sharp');
const fs = require('fs');

const SVG    = 'C:/Users/jorge/OneDrive/Desktop/mercadolibre/cristomercado.svg';
const DIR    = 'C:/Users/jorge/CLAUDE/public/tmp-carousel/cristo/';
const CANVAS = 2048;

const cfg = {
  angle: 13,
  bboxRatio: 0.745,
  yOffset: -0.010,
  material: 'ai-b.png',   // render de materia del modelo
  erode: 1.2,
  holeClear: 0.88,        // cuanta sombra se borra dentro de los calados             // encoge la máscara para matar el fleco de desalineación
  aoBlur: 4,  aoAlpha: 0.30,     aoDx: 2,  aoDy: 3,
  shadowBlur: 9, shadowAlpha: 0.30, shadowDx: 11, shadowDy: 15,
  bgTL: [243, 244, 245],
  bgBR: [222, 223, 227],
};

const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb  = c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';

const fillSvg = () => fs.readFileSync(SVG, 'utf8')
  .replace(/style="fill:none;[^"]*"/, 'style="fill:#ffffff;fill-rule:evenodd;stroke:none"');

function background() {
  const a = cfg.bgTL, b = cfg.bgBR;
  return Buffer.from(
    '<svg width="' + CANVAS + '" height="' + CANVAS + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="g" x1="0.05" y1="0" x2="0.95" y2="1">' +
      '<stop offset="0" stop-color="' + rgb(a) + '"/>' +
      '<stop offset="0.5" stop-color="' + rgb(lerp(a, b, 0.5)) + '"/>' +
      '<stop offset="1" stop-color="' + rgb(b) + '"/>' +
    '</linearGradient>' +
    '<radialGradient id="v" cx="0.33" cy="0.28" r="0.72">' +
      '<stop offset="0.35" stop-color="#ffffff" stop-opacity="0.10"/>' +
      '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>' +
    '</radialGradient></defs>' +
    '<rect width="100%" height="100%" fill="url(#g)"/>' +
    '<rect width="100%" height="100%" fill="url(#v)"/></svg>');
}

// bbox de pixeles con alfa por encima del umbral
function boxFromAlpha(buf, W, H, thr) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (buf[y * W + x] > thr) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

(async () => {
  // ---- 1. mascara exacta del vector, con la misma transformada que la ronda 2
  const maskFull = await sharp(Buffer.from(fillSvg()), { density: 300 })
    .resize({ width: 2600 }).png().toBuffer();
  const rotated = await sharp(maskFull)
    .rotate(-cfg.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const rm = await sharp(rotated).metadata();
  const rAlpha = await sharp(rotated).extractChannel('alpha').raw().toBuffer();
  const rBox = boxFromAlpha(rAlpha, rm.width, rm.height, 8);

  const targetW = Math.round(cfg.bboxRatio * CANVAS);
  const maskTight = await sharp(rotated).extract(rBox).resize({ width: targetW }).png().toBuffer();
  const mm = await sharp(maskTight).metadata();
  let maskA = await sharp(maskTight).extractChannel('alpha')
    .blur(cfg.erode).linear(2.2, -180).raw().toBuffer();   // encoge un pelo

  // ---- 2. materia del modelo, escalada y alineada al bbox del vector
  const matSrc = DIR + cfg.material;
  const mSharp = sharp(matSrc);
  const mMeta = await mSharp.metadata();
  const { data: mData, info: mInfo } = await sharp(matSrc).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });

  // el objeto del render es lo oscuro sobre el fondo claro
  const darkMask = Buffer.alloc(mInfo.width * mInfo.height);
  for (let i = 0; i < mInfo.width * mInfo.height; i++) {
    const r = mData[i * 3], g = mData[i * 3 + 1], b = mData[i * 3 + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    darkMask[i] = l < 120 ? 255 : 0;
  }
  const mBox = boxFromAlpha(darkMask, mInfo.width, mInfo.height, 8);

  // recorta el objeto del render y lo lleva al tamano exacto del vector
  const material = await sharp(matSrc)
    .extract(mBox)
    .resize(mm.width, mm.height, { fit: 'fill' })
    .removeAlpha()
    .modulate({ brightness: 1.0 })
    .png().toBuffer();

  // ---- 3. recorte con la mascara del vector: geometria exacta, materia real
  const sign = await sharp(material)
    .joinChannel(maskA, { raw: { width: mm.width, height: mm.height, channels: 1 } })
    .png().toBuffer();

  // ---- 4. celdas cerradas del corte: son AIRE, no superficie.
  // Relleno por difusion desde el borde para separar el exterior de los calados.
  const SW = mm.width, SH = mm.height;
  const outside = new Uint8Array(SW * SH);
  const stack = [];
  for (let x = 0; x < SW; x++) { stack.push(x); stack.push((SH - 1) * SW + x); }
  for (let y = 0; y < SH; y++) { stack.push(y * SW); stack.push(y * SW + SW - 1); }
  while (stack.length) {
    const i = stack.pop();
    if (outside[i] || maskA[i] > 40) continue;
    outside[i] = 1;
    const x = i % SW, y = (i - x) / SW;
    if (x > 0)      stack.push(i - 1);
    if (x < SW - 1) stack.push(i + 1);
    if (y > 0)      stack.push(i - SW);
    if (y < SH - 1) stack.push(i + SW);
  }
  // hueco = ni pieza ni exterior
  const hole = Buffer.alloc(SW * SH);
  for (let i = 0; i < SW * SH; i++) hole[i] = (!outside[i] && maskA[i] <= 40) ? 255 : 0;
  const holeSoft = await sharp(hole, { raw: { width: SW, height: SH, channels: 1 } })
    .blur(4).raw().toBuffer();

  // ---- 5. sombras, sobre lienzo holgado para que el desenfoque no se recorte
  const shade = async (blur, alpha, tint, dx, dy) => {
    const P = Math.ceil(blur * 3) + Math.max(Math.abs(dx), Math.abs(dy)) + 8;
    const PW = SW + P * 2, PH = SH + P * 2;
    const signA = await sharp(sign).extractChannel('alpha').raw().toBuffer();
    const padded = Buffer.alloc(PW * PH);
    for (let y = 0; y < SH; y++) signA.copy(padded, (y + P) * PW + P, y * SW, (y + 1) * SW);
    const blurred = await sharp(padded, { raw: { width: PW, height: PH, channels: 1 } })
      .blur(blur).raw().toBuffer();

    const out = Buffer.alloc(PW * PH);
    for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
      let v = blurred[y * PW + x] * alpha;
      out[y * PW + x] = v > 255 ? 255 : Math.round(v);
    }
    const img = await sharp({ create: { width: PW, height: PH, channels: 3,
                                        background: { r: tint[0], g: tint[1], b: tint[2] } } })
      .joinChannel(out, { raw: { width: PW, height: PH, channels: 1 } }).png().toBuffer();
    return { img, pad: P };
  };
  const ao     = await shade(cfg.aoBlur,     cfg.aoAlpha,     [30, 29, 27], cfg.aoDx, cfg.aoDy);
  const shadow = await shade(cfg.shadowBlur, cfg.shadowAlpha, [34, 32, 30], cfg.shadowDx, cfg.shadowDy);

  const left = Math.round((CANVAS - mm.width) / 2);
  const top  = Math.round((CANVAS - mm.height) / 2 + cfg.yOffset * CANVAS);

  await sharp(background(), { density: 72 })
    .composite([
      { input: shadow.img, left: left + cfg.shadowDx - shadow.pad, top: top + cfg.shadowDy - shadow.pad },
      { input: ao.img,     left: left + cfg.aoDx - ao.pad,         top: top + cfg.aoDy - ao.pad },
      { input: sign,       left: left, top: top },
    ])
    .resize(CANVAS, CANVAS, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(DIR + 'cristo-hero-r3.png');

  console.log(JSON.stringify({
    materialSrc: cfg.material + ' ' + mMeta.width + 'x' + mMeta.height,
    bboxRender: mBox.width + 'x' + mBox.height,
    bboxVector: mm.width + 'x' + mm.height,
    anchoPct: (mm.width / CANVAS * 100).toFixed(1),
    margenIzq: (left / CANVAS * 100).toFixed(1),
    margenSup: (top / CANVAS * 100).toFixed(1),
  }));
})();
