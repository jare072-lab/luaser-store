// Calcula el contorno exterior (la "base" de un letrero en capas) a partir de trazos SVG.
// Equivale al Contorno de Corel o al Offset Path de Illustrator, pero aquí no hay ninguno
// de los dos instalado. Hace dilatación exacta por disco: transformada de distancia
// euclidiana (Felzenszwalb) + marching squares + simplificación Douglas-Peucker.
const sharp = require("sharp");

// Distancia euclidiana exacta al cuadrado, en O(n) por fila y columna.
function dt1d(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
}

function distanciaAlFondo(dentro, W, H) {
  const INF = 1e12, f = new Float64Array(Math.max(W, H));
  const d = new Float64Array(Math.max(W, H)), v = new Int32Array(Math.max(W, H)), z = new Float64Array(Math.max(W, H) + 1);
  const salida = new Float64Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) f[x] = dentro[y * W + x] ? 0 : INF;
    dt1d(f, W, d, v, z);
    for (let x = 0; x < W; x++) salida[y * W + x] = d[x];
  }
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) f[y] = salida[y * W + x];
    dt1d(f, H, d, v, z);
    for (let y = 0; y < H; y++) salida[y * W + x] = Math.sqrt(d[y]);
  }
  return salida;
}

// Marching squares con interpolación lineal: da un borde suave, no escalonado.
function marchingSquares(campo, W, H, nivel) {
  const val = (x, y) => campo[y * W + x];
  const ip = (a, b) => (nivel - a) / (b - a || 1e-9);
  const segs = [];
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const tl = val(x, y), tr = val(x + 1, y), br = val(x + 1, y + 1), bl = val(x, y + 1);
      // El campo es distancia al trazo: "dentro" es valor BAJO, por eso la comparación va al revés.
      let c = (tl <= nivel ? 8 : 0) | (tr <= nivel ? 4 : 0) | (br <= nivel ? 2 : 0) | (bl <= nivel ? 1 : 0);
      if (c === 0 || c === 15) continue;
      const T = () => [x + ip(tl, tr), y], R = () => [x + 1, y + ip(tr, br)];
      const B = () => [x + ip(bl, br), y + 1], L = () => [x, y + ip(tl, bl)];
      const centro = (tl + tr + br + bl) / 4;
      const push = (a, b) => segs.push([a, b]);
      switch (c) {
        case 1: push(L(), B()); break;
        case 2: push(B(), R()); break;
        case 3: push(L(), R()); break;
        case 4: push(T(), R()); break;
        case 6: push(T(), B()); break;
        case 7: push(L(), T()); break;
        case 8: push(T(), L()); break;
        case 9: push(T(), B()); break;
        case 11: push(T(), R()); break;
        case 12: push(L(), R()); break;
        case 13: push(B(), R()); break;
        case 14: push(L(), B()); break;
        case 5: if (centro <= nivel) { push(L(), T()); push(B(), R()); } else { push(L(), B()); push(T(), R()); } break;
        case 10: if (centro <= nivel) { push(T(), R()); push(B(), L()); } else { push(T(), L()); push(B(), R()); } break;
      }
    }
  }
  // Encadenar segmentos en polígonos cerrados. Se enlaza por extremo COMPARTIDO, sin mirar
  // la dirección: los casos del switch no emiten todos con la misma orientación y, si se
  // exige que el fin de uno sea el inicio del otro, las cadenas se parten y quedan astillas.
  const clave = (p) => p[0].toFixed(3) + "," + p[1].toFixed(3);
  const enPunto = new Map();
  segs.forEach((s, i) => {
    for (const p of s) {
      const k = clave(p);
      if (!enPunto.has(k)) enPunto.set(k, []);
      enPunto.get(k).push(i);
    }
  });
  const usados = new Uint8Array(segs.length), polis = [];
  for (let i0 = 0; i0 < segs.length; i0++) {
    if (usados[i0]) continue;
    usados[i0] = 1;
    const poli = [segs[i0][0], segs[i0][1]];
    let extremo = segs[i0][1];
    for (let guarda = 0; guarda < 4e6; guarda++) {
      const sig = (enPunto.get(clave(extremo)) || []).find((j) => !usados[j]);
      if (sig === undefined) break;
      usados[sig] = 1;
      const s = segs[sig];
      extremo = clave(s[0]) === clave(extremo) ? s[1] : s[0];
      poli.push(extremo);
      if (clave(extremo) === clave(poli[0])) break;
    }
    if (poli.length > 8) polis.push(poli);
  }
  return polis;
}

function douglasPeucker(pts, tol) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= tol) return [pts[0], pts[pts.length - 1]];
  return douglasPeucker(pts.slice(0, idx + 1), tol).slice(0, -1).concat(douglasPeucker(pts.slice(idx), tol));
}

// Douglas-Peucker sobre un anillo cerrado colapsa a dos puntos: el primero y el último
// coinciden, la cuerda mide cero y la distancia perpendicular sale cero para todos. Hay que
// partir el anillo en dos cadenas abiertas por el punto más lejano y simplificar cada una.
function simplificarAnillo(anillo, tol) {
  const pts = anillo.slice();
  const igual = (a, b) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
  while (pts.length > 1 && igual(pts[0], pts[pts.length - 1])) pts.pop();
  if (pts.length < 4) return null;
  let lejos = 0, dMax = -1;
  for (let i = 1; i < pts.length; i++) {
    const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2;
    if (d > dMax) { dMax = d; lejos = i; }
  }
  const a = douglasPeucker(pts.slice(0, lejos + 1), tol);
  const b = douglasPeucker(pts.slice(lejos).concat([pts[0]]), tol);
  return a.slice(0, -1).concat(b.slice(0, -1));
}

/**
 * @param pathD  trazos SVG de las letras, en px del lienzo dado
 * @param opts   { W, H, offsetPx, tolPx, escalaMm } tamaño del lienzo y grosor del contorno
 * @returns      { d } trazo SVG del contorno, en las mismas unidades que la entrada
 */
async function contornoDe(pathD, { W, H, offsetPx, tolPx = 0.6, muestreo = 1, areaMinima = 0 }) {
  const w = Math.round(W * muestreo), h = Math.round(H * muestreo);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${W} ${H}"><path d="${pathD}" fill="#fff"/></svg>`;
  const { data } = await sharp(Buffer.from(svg)).flatten({ background: "#000" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const dentro = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) dentro[i] = data[i] > 127 ? 1 : 0;
  const campo = distanciaAlFondo(dentro, w, h);
  // El umbral se corre una fracción a propósito: la transformada de distancia devuelve
  // valores enteros exactos en los tramos rectos, y si el nivel coincide con uno, el cruce
  // cae justo en la esquina de la celda y ese vértice queda compartido por cuatro celdas.
  // El recorrido entonces toma un desvío y cierra contornos partidos. Correrlo 0.317 px
  // (menos de 0.1 mm) deja todos los vértices con grado 2.
  const polis = marchingSquares(campo, w, h, offsetPx * muestreo + 0.317);
  let d = "", emitidos = 0;
  const descartados = [];
  for (const p of polis) {
    const s = simplificarAnillo(p, tolPx * muestreo);
    if (!s || s.length < 4) continue;
    // Área en unidades de salida. Los contornos diminutos son astillas de un hueco que casi
    // se cerró: cortarlas es imposible y sólo ensucian el archivo, pero se reportan.
    let a = 0;
    for (let k = 0; k < s.length; k++) {
      const [x1, y1] = s[k], [x2, y2] = s[(k + 1) % s.length];
      a += (x1 * y2 - x2 * y1) / (muestreo * muestreo);
    }
    a = Math.abs(a / 2);
    if (a < areaMinima) { descartados.push(Math.round(a)); continue; }
    emitidos++;
    d += "M " + s.map(([x, y]) => (x / muestreo).toFixed(2) + " " + (y / muestreo).toFixed(2)).join(" L ") + " Z ";
  }
  return { d, piezas: emitidos, descartados };
}

module.exports = { contornoDe, marchingSquares, simplificarAnillo, distanciaAlFondo };
