// Builder final: geometria del vector de corte real + materia del render fotografico.
// La imagen se arma pixel a pixel en un unico buffer RGB para que no haya bordes de
// capa ni recortes de buffer (los dos bugs que el craft critic encontro en la ronda 1).
const sharp = require('sharp');
const fs = require('fs');

const SVG    = 'C:/Users/jorge/OneDrive/Desktop/mercadolibre/cristomercado.svg';
const DIR    = 'C:/Users/jorge/CLAUDE/public/tmp-carousel/cristo/';
const CANVAS = 2048;

const cfg = {
  angle: 13,
  bboxRatio: 0.745,
  yOffset: -0.010,
  material: 'ai-b.png',
  erode: 1.2,
  // sombra proyectada: corta, difusa, hacia abajo-derecha
  shadowBlur: 10, shadowAlpha: 0.0, shadowDx: 13, shadowDy: 17,
  // oclusion de contacto: pegada al canto
  aoBlur: 3.5, aoAlpha: 0.0, aoDx: 2, aoDy: 3,
  shadowTint: [38, 36, 33],
  bgTL: [244, 245, 246],
  bgBR: [221, 222, 226],
};

const fillSvg = () => fs.readFileSync(SVG, 'utf8')
  .replace(/style="fill:none;[^"]*"/, 'style="fill:#ffffff;fill-rule:evenodd;stroke:none"');

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
  // ---- 1. mascara exacta del corte, rotada y escalada
  const svgPng = await sharp(Buffer.from(fillSvg()), { density: 300 })
    .resize({ width: 2600 }).png().toBuffer();
  const rot = await sharp(svgPng)
    .rotate(-cfg.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const rm = await sharp(rot).metadata();
  const rA = await sharp(rot).extractChannel('alpha').raw().toBuffer();
  const rBox = boxFromAlpha(rA, rm.width, rm.height, 8);

  const tight = await sharp(rot).extract(rBox)
    .resize({ width: Math.round(cfg.bboxRatio * CANVAS) }).png().toBuffer();
  const tm = await sharp(tight).metadata();
  const SW = tm.width, SH = tm.height;
  const maskA = await sharp(tight).extractChannel('alpha')
    .blur(cfg.erode).linear(2.2, -180).raw().toBuffer();

  // ---- 2. materia del render, recortada al objeto y llevada al tamano del vector
  const { data: mD, info: mI } = await sharp(DIR + cfg.material).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const darkM = Buffer.alloc(mI.width * mI.height);
  for (let i = 0; i < mI.width * mI.height; i++) {
    const l = 0.299 * mD[i * 3] + 0.587 * mD[i * 3 + 1] + 0.114 * mD[i * 3 + 2];
    darkM[i] = l < 120 ? 255 : 0;
  }
  const mBox = boxFromAlpha(darkM, mI.width, mI.height, 8);
  const mat = await sharp(DIR + cfg.material)
    .extract(mBox).resize(SW, SH, { fit: 'fill' }).removeAlpha().raw().toBuffer();

  // ---- 3. las dos sombras, calculadas sobre el lienzo COMPLETO
  //         (nunca sobre un buffer del tamano de la pieza: ahi es donde se recortaban)
  const shadowOf = async (blur, dx, dy) => {
    const full = Buffer.alloc(CANVAS * CANVAS);
    const ox = Math.round((CANVAS - SW) / 2) + dx;
    const oy = Math.round((CANVAS - SH) / 2 + cfg.yOffset * CANVAS) + dy;
    for (let y = 0; y < SH; y++) {
      const ty = y + oy;
      if (ty < 0 || ty >= CANVAS) continue;
      for (let x = 0; x < SW; x++) {
        const tx = x + ox;
        if (tx < 0 || tx >= CANVAS) continue;
        full[ty * CANVAS + tx] = maskA[y * SW + x];
      }
    }
    return sharp(full, { raw: { width: CANVAS, height: CANVAS, channels: 1 } })
      .blur(blur).raw().toBuffer();
  };
  const shA = await shadowOf(cfg.shadowBlur, cfg.shadowDx, cfg.shadowDy);
  const aoA = await shadowOf(cfg.aoBlur,     cfg.aoDx,     cfg.aoDy);

  // ---- 4. armado pixel a pixel
  const out = Buffer.alloc(CANVAS * CANVAS * 3);
  const ox = Math.round((CANVAS - SW) / 2);
  const oy = Math.round((CANVAS - SH) / 2 + cfg.yOffset * CANVAS);
  const [a, b] = [cfg.bgTL, cfg.bgBR];
  const T = cfg.shadowTint;

  for (let y = 0; y < CANVAS; y++) {
    for (let x = 0; x < CANVAS; x++) {
      const i = y * CANVAS + x;

      // fondo: degradado direccional TL -> BR
      const t = Math.min(1, Math.max(0, (x / CANVAS * 0.5 + y / CANVAS * 0.5)));
      let r = a[0] + (b[0] - a[0]) * t;
      let g = a[1] + (b[1] - a[1]) * t;
      let bl = a[2] + (b[2] - a[2]) * t;

      // realce suave donde entra la luz
      const dxL = (x / CANVAS - 0.33), dyL = (y / CANVAS - 0.28);
      const lift = Math.max(0, 1 - Math.sqrt(dxL * dxL + dyL * dyL) / 0.72) * 2.6;
      r += lift; g += lift; bl += lift;

      // sombras multiplicativas
      const s1 = (shA[i] / 255) * cfg.shadowAlpha;
      const s2 = (aoA[i] / 255) * cfg.aoAlpha;
      const s = 1 - (1 - s1) * (1 - s2);
      if (s > 0) { r = r * (1 - s) + T[0] * s; g = g * (1 - s) + T[1] * s; bl = bl * (1 - s) + T[2] * s; }

      // la pieza, recortada por la mascara exacta del vector
      const mx = x - ox, my = y - oy;
      if (mx >= 0 && my >= 0 && mx < SW && my < SH) {
        const al = maskA[my * SW + mx] / 255;
        if (al > 0) {
          const j = (my * SW + mx) * 3;
          r = r * (1 - al) + mD_at(mat, j)     * al;
          g = g * (1 - al) + mD_at(mat, j + 1) * al;
          bl = bl * (1 - al) + mD_at(mat, j + 2) * al;
        }
      }

      const k = i * 3;
      out[k]     = r  < 0 ? 0 : r  > 255 ? 255 : r;
      out[k + 1] = g  < 0 ? 0 : g  > 255 ? 255 : g;
      out[k + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl;
    }
  }

  await sharp(out, { raw: { width: CANVAS, height: CANVAS, channels: 3 } })
    .png({ compressionLevel: 9 }).toFile(DIR + 'diag-noshadow.png');

  console.log(JSON.stringify({
    lienzo: CANVAS + 'x' + CANVAS,
    pieza: SW + 'x' + SH,
    anchoPct: (SW / CANVAS * 100).toFixed(1),
    margenIzq: (ox / CANVAS * 100).toFixed(1),
    margenSup: (oy / CANVAS * 100).toFixed(1),
    margenInf: ((CANVAS - oy - SH) / CANVAS * 100).toFixed(1),
  }));
})();

function mD_at(buf, i) { return buf[i]; }
