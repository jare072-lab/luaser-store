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
  erode: 0.7,
  matMaxLum: 125,   // por encima de esto, la materia es sangrado de fondo, no tablero
  fillRadius: 22,   // radio del relleno ponderado
  grainSd: 0.92,    // grano compartido sobre TODO el cuadro (las referencias miden 0.81 y 0.95)
  // sombra proyectada: corta, difusa, hacia abajo-derecha
  shadowBlur: 10, shadowAlpha: 0.34, shadowDx: 13, shadowDy: 17,
  // oclusion de contacto: pegada al canto
  aoBlur: 3.5, aoAlpha: 0.26, aoDx: 2, aoDy: 3,
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
    .blur(cfg.erode).linear(1.25, -22).raw().toBuffer();

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

  // ---- 2b. tapar el sangrado de fondo dentro de la silueta.
  // Donde la materia del render es clara pero la mascara dice que ahi hay tablero
  // (pasa en las yemas y en los remates finos, por el desfase de un par de px),
  // se rellena con el promedio ponderado de la materia valida de alrededor.
  const valid = new Uint8Array(SW * SH);
  for (let i = 0; i < SW * SH; i++) {
    const l = 0.299 * mat[i * 3] + 0.587 * mat[i * 3 + 1] + 0.114 * mat[i * 3 + 2];
    valid[i] = (maskA[i] > 40 && l < cfg.matMaxLum) ? 1 : 0;
  }
  // desenfoque de caja separable sobre materia valida y sobre el peso
  const boxBlur = (src, ch, radius) => {
    const tmp = new Float64Array(SW * SH * ch), dst = new Float64Array(SW * SH * ch);
    for (let y = 0; y < SH; y++) for (let c = 0; c < ch; c++) {
      let acc = 0;
      for (let x = -radius; x <= radius; x++) acc += src[(y * SW + Math.min(SW - 1, Math.max(0, x))) * ch + c];
      for (let x = 0; x < SW; x++) {
        tmp[(y * SW + x) * ch + c] = acc / (radius * 2 + 1);
        const add = Math.min(SW - 1, x + radius + 1), sub = Math.max(0, x - radius);
        acc += src[(y * SW + add) * ch + c] - src[(y * SW + sub) * ch + c];
      }
    }
    for (let x = 0; x < SW; x++) for (let c = 0; c < ch; c++) {
      let acc = 0;
      for (let y = -radius; y <= radius; y++) acc += tmp[(Math.min(SH - 1, Math.max(0, y)) * SW + x) * ch + c];
      for (let y = 0; y < SH; y++) {
        dst[(y * SW + x) * ch + c] = acc / (radius * 2 + 1);
        const add = Math.min(SH - 1, y + radius + 1), sub = Math.max(0, y - radius);
        acc += tmp[(add * SW + x) * ch + c] - tmp[(sub * SW + x) * ch + c];
      }
    }
    return dst;
  };
  const wMat = new Float64Array(SW * SH * 3);
  const wW   = new Float64Array(SW * SH);
  for (let i = 0; i < SW * SH; i++) {
    wW[i] = valid[i];
    for (let c = 0; c < 3; c++) wMat[i * 3 + c] = valid[i] ? mat[i * 3 + c] : 0;
  }
  const num = boxBlur(wMat, 3, cfg.fillRadius);
  const den = boxBlur(wW,   1, cfg.fillRadius);
  let patched = 0;
  for (let i = 0; i < SW * SH; i++) {
    if (maskA[i] > 40 && !valid[i]) {
      patched++;
      const d = den[i] > 1e-6 ? den[i] : 1;
      for (let c = 0; c < 3; c++) mat[i * 3 + c] = Math.max(0, Math.min(255, Math.round(num[i * 3 + c] / d)));
    }
  }

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
    // OJO: sharp devuelve el resultado en 3 canales aunque la entrada sea de 1.
    // Hay que leer info.channels y quedarse con un canal, o la sombra sale corrida.
    const { data, info } = await sharp(full, { raw: { width: CANVAS, height: CANVAS, channels: 1 } })
      .blur(blur).raw().toBuffer({ resolveWithObject: true });
    if (info.channels === 1) return data;
    const flat = Buffer.alloc(CANVAS * CANVAS);
    for (let i = 0; i < CANVAS * CANVAS; i++) flat[i] = data[i * info.channels];
    return flat;
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

      // grano compartido: una sola capa sobre fondo y objeto, para que ambos
      // vengan de la misma cadena de captura
      const n = (Math.random() + Math.random() + Math.random() - 1.5) * cfg.grainSd * 2;
      r += n; g += n; bl += n;

      const k = i * 3;
      out[k]     = r  < 0 ? 0 : r  > 255 ? 255 : r;
      out[k + 1] = g  < 0 ? 0 : g  > 255 ? 255 : g;
      out[k + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl;
    }
  }

  await sharp(out, { raw: { width: CANVAS, height: CANVAS, channels: 3 } })
    .png({ compressionLevel: 9 }).toFile(DIR + 'cristo-hero-final.png');

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
