// Lector mínimo de TrueType que convierte texto en trazos SVG reales.
// Existe porque en esta máquina no hay Inkscape, potrace, ImageMagick ni Python: para un
// archivo de corte no sirve un <text> (el taller necesita curvas, no una fuente instalada).
// Cubre lo que usan las fuentes script de Windows: cmap formato 4, glifos simples y
// compuestos, y kerning formato 0 (los scripts se ven rotos sin kerning).
const fs = require("fs");

function leerTablas(buf) {
  const n = buf.readUInt16BE(4), t = {};
  for (let i = 0; i < n; i++) {
    const o = 12 + i * 16;
    t[buf.toString("ascii", o, o + 4)] = { off: buf.readUInt32BE(o + 8), len: buf.readUInt32BE(o + 12) };
  }
  return t;
}

function leerCmap(buf, off) {
  const n = buf.readUInt16BE(off + 2);
  let sub = null;
  for (let i = 0; i < n; i++) {
    const p = off + 4 + i * 8;
    const plat = buf.readUInt16BE(p), enc = buf.readUInt16BE(p + 2), so = off + buf.readUInt32BE(p + 4);
    if ((plat === 3 && (enc === 1 || enc === 0)) || plat === 0) { sub = so; if (plat === 3 && enc === 1) break; }
  }
  if (sub === null) throw new Error("cmap sin subtabla usable");
  if (buf.readUInt16BE(sub) !== 4) throw new Error("cmap no es formato 4");
  const segX2 = buf.readUInt16BE(sub + 6), seg = segX2 / 2;
  const end = sub + 14, start = end + segX2 + 2, delta = start + segX2, rango = delta + segX2;
  const mapa = new Map();
  for (let s = 0; s < seg; s++) {
    const e = buf.readUInt16BE(end + s * 2), st = buf.readUInt16BE(start + s * 2);
    const d = buf.readInt16BE(delta + s * 2), ro = buf.readUInt16BE(rango + s * 2);
    if (st === 0xffff) continue;
    for (let c = st; c <= e && c !== 0x10000; c++) {
      let g;
      if (ro === 0) g = (c + d) & 0xffff;
      else {
        const gi = rango + s * 2 + ro + (c - st) * 2;
        if (gi + 1 >= buf.length) continue;
        g = buf.readUInt16BE(gi);
        if (g !== 0) g = (g + d) & 0xffff;
      }
      if (g) mapa.set(c, g);
    }
  }
  return mapa;
}

function leerGlifo(buf, glyf, loca, idx, prof = 0) {
  if (prof > 5) return [];
  const ini = glyf + loca[idx], fin = glyf + loca[idx + 1];
  if (fin <= ini) return [];                       // glifo vacío (espacio)
  const nc = buf.readInt16BE(ini);
  if (nc < 0) {                                    // compuesto: acentos y similares
    let p = ini + 10, contornos = [];
    for (;;) {
      const flags = buf.readUInt16BE(p), gi = buf.readUInt16BE(p + 2); p += 4;
      let dx, dy;
      if (flags & 1) { dx = buf.readInt16BE(p); dy = buf.readInt16BE(p + 2); p += 4; }
      else { dx = buf.readInt8(p); dy = buf.readInt8(p + 1); p += 2; }
      let a = 1, b = 0, c = 0, d = 1;
      const F2 = (o) => buf.readInt16BE(o) / 16384;
      if (flags & 8) { a = d = F2(p); p += 2; }
      else if (flags & 0x40) { a = F2(p); d = F2(p + 2); p += 4; }
      else if (flags & 0x80) { a = F2(p); b = F2(p + 2); c = F2(p + 4); d = F2(p + 6); p += 8; }
      for (const cont of leerGlifo(buf, glyf, loca, gi, prof + 1)) {
        contornos.push(cont.map((pt) => ({ x: a * pt.x + c * pt.y + dx, y: b * pt.x + d * pt.y + dy, on: pt.on })));
      }
      if (!(flags & 0x20)) break;
    }
    return contornos;
  }
  const fines = [];
  let p = ini + 10;
  for (let i = 0; i < nc; i++) { fines.push(buf.readUInt16BE(p)); p += 2; }
  const nPts = fines[nc - 1] + 1;
  p += 2 + buf.readUInt16BE(p);                    // saltar instrucciones del hinting
  const flags = [];
  while (flags.length < nPts) {
    const f = buf.readUInt8(p++); flags.push(f);
    if (f & 8) { let r = buf.readUInt8(p++); while (r-- > 0) flags.push(f); }
  }
  const xs = [], ys = [];
  let v = 0;
  for (const f of flags) {
    if (f & 2) { const dxv = buf.readUInt8(p++); v += (f & 16) ? dxv : -dxv; }
    else if (!(f & 16)) { v += buf.readInt16BE(p); p += 2; }
    xs.push(v);
  }
  v = 0;
  for (const f of flags) {
    if (f & 4) { const dyv = buf.readUInt8(p++); v += (f & 32) ? dyv : -dyv; }
    else if (!(f & 32)) { v += buf.readInt16BE(p); p += 2; }
    ys.push(v);
  }
  const contornos = [];
  let s = 0;
  for (const e of fines) {
    const pts = [];
    for (let i = s; i <= e; i++) pts.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) });
    if (pts.length) contornos.push(pts);
    s = e + 1;
  }
  return contornos;
}

// Las curvas TrueType son cuadráticas con puntos fuera de curva implícitos: entre dos
// puntos fuera de curva seguidos hay un punto sobre la curva en el medio que no se guarda.
function contornosAPath(contornos, esc, ox, oy) {
  const X = (x) => (ox + x * esc).toFixed(3);
  const Y = (y) => (oy - y * esc).toFixed(3);          // la Y de la fuente sube, la del SVG baja
  const med = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  let d = "";
  for (const c of contornos) {
    if (c.length < 2) continue;
    let pts = c.slice();
    let iniIdx = pts.findIndex((p) => p.on);
    let inicio;
    if (iniIdx < 0) { inicio = med(pts[0], pts[pts.length - 1]); iniIdx = 0; }
    else { inicio = pts[iniIdx]; pts = pts.slice(iniIdx).concat(pts.slice(0, iniIdx)).slice(1); }
    d += `M ${X(inicio.x)} ${Y(inicio.y)} `;
    let ctrl = null;
    for (const pt of pts) {
      if (pt.on) {
        d += ctrl ? `Q ${X(ctrl.x)} ${Y(ctrl.y)} ${X(pt.x)} ${Y(pt.y)} ` : `L ${X(pt.x)} ${Y(pt.y)} `;
        ctrl = null;
      } else {
        if (ctrl) { const m = med(ctrl, pt); d += `Q ${X(ctrl.x)} ${Y(ctrl.y)} ${X(m.x)} ${Y(m.y)} `; }
        ctrl = pt;
      }
    }
    d += ctrl ? `Q ${X(ctrl.x)} ${Y(ctrl.y)} ${X(inicio.x)} ${Y(inicio.y)} Z ` : "Z ";
  }
  return d;
}

function cargar(ruta) {
  const buf = fs.readFileSync(ruta);
  const t = leerTablas(buf);
  const unidades = buf.readUInt16BE(t.head.off + 18);
  const formatoLoca = buf.readInt16BE(t.head.off + 50);
  const numGlifos = buf.readUInt16BE(t.maxp.off + 4);
  const numHM = buf.readUInt16BE(t.hhea.off + 34);
  const loca = [];
  for (let i = 0; i <= numGlifos; i++) {
    loca.push(formatoLoca ? buf.readUInt32BE(t.loca.off + i * 4) : buf.readUInt16BE(t.loca.off + i * 2) * 2);
  }
  const avance = (g) => buf.readUInt16BE(t.hmtx.off + Math.min(g, numHM - 1) * 4);
  const kern = new Map();
  if (t.kern) {
    const nT = buf.readUInt16BE(t.kern.off + 2);
    let p = t.kern.off + 4;
    for (let i = 0; i < nT; i++) {
      const largo = buf.readUInt16BE(p + 2), cobertura = buf.readUInt16BE(p + 4);
      if ((cobertura & 0xff00) >> 8 === 0) {
        const nPares = buf.readUInt16BE(p + 6);
        for (let k = 0; k < nPares; k++) {
          const q = p + 14 + k * 6;
          kern.set(buf.readUInt16BE(q) + "," + buf.readUInt16BE(q + 2), buf.readInt16BE(q + 4));
        }
      }
      p += largo;
    }
  }
  return { buf, t, unidades, loca, cmap: leerCmap(buf, t.cmap.off), avance, kern };
}

/** Devuelve { d, ancho, alto } con el texto ya convertido a curvas, a la altura pedida en px. */
function textoAPath(rutaFuente, texto, alturaEm, { x = 0, y = 0, tracking = 0 } = {}) {
  const f = cargar(rutaFuente);
  const esc = alturaEm / f.unidades;
  let cursor = 0, d = "";
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const glifos = [...texto].map((ch) => f.cmap.get(ch.codePointAt(0)) || 0);
  glifos.forEach((g, i) => {
    const contornos = leerGlifo(f.buf, f.t.glyf.off, f.loca, g);
    for (const c of contornos) for (const p of c) {
      minX = Math.min(minX, cursor + p.x); maxX = Math.max(maxX, cursor + p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    d += contornosAPath(contornos, esc, x + cursor * esc, y);
    cursor += f.avance(g) + tracking / esc;
    if (i + 1 < glifos.length) cursor += f.kern.get(g + "," + glifos[i + 1]) || 0;
  });
  return {
    d,
    ancho: (maxX - minX) * esc, alto: (maxY - minY) * esc,
    caja: { x1: x + minX * esc, x2: x + maxX * esc, y1: y - maxY * esc, y2: y - minY * esc },
  };
}

module.exports = { textoAPath, cargar };
