// Exporta trazos SVG (M/L/Q/Z) a DXF con polilíneas cerradas, en milímetros.
// El SVG lo abren Corel y LightBurn, pero DXF es lo que traga cualquier controladora de
// láser sin discutir, así que se entregan los dos.

// Aplana un trazo SVG a listas de puntos. Las curvas cuadráticas se muestrean con paso fijo:
// a 0.2 mm de tolerancia el láser no distingue la diferencia contra la curva real.
function aplanar(d, pasoMm = 0.4) {
  const tokens = d.match(/[MLQZ]|-?[\d.]+/gi) || [];
  const anillos = [];
  let i = 0, actual = null, cur = [0, 0], inicio = [0, 0];
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const t = tokens[i++];
    if (t === "M") {
      if (actual && actual.length > 1) anillos.push(actual);
      cur = [num(), num()]; inicio = cur; actual = [cur];
    } else if (t === "L") {
      cur = [num(), num()]; actual.push(cur);
    } else if (t === "Q") {
      const cx = num(), cy = num(), x = num(), y = num();
      const largo = Math.hypot(cx - cur[0], cy - cur[1]) + Math.hypot(x - cx, y - cy);
      const n = Math.max(2, Math.ceil(largo / pasoMm));
      for (let k = 1; k <= n; k++) {
        const s = k / n, u = 1 - s;
        actual.push([u * u * cur[0] + 2 * u * s * cx + s * s * x, u * u * cur[1] + 2 * u * s * cy + s * s * y]);
      }
      cur = [x, y];
    } else if (t === "Z" || t === "z") {
      if (actual && actual.length > 1) anillos.push(actual);
      actual = [inicio.slice()]; cur = inicio;
    }
  }
  if (actual && actual.length > 1) anillos.push(actual);
  return anillos;
}

/** capas: [{ nombre, d }] · alto en mm, para voltear la Y (el SVG crece hacia abajo, el DXF hacia arriba). */
function aDxf(capas, altoMm) {
  const L = [];
  const p = (c, v) => { L.push(String(c), String(v)); };
  p(0, "SECTION"); p(2, "HEADER");
  p(9, "$INSUNITS"); p(70, 4);            // 4 = milímetros
  p(0, "ENDSEC");
  p(0, "SECTION"); p(2, "TABLES"); p(0, "TABLE"); p(2, "LAYER"); p(70, capas.length);
  capas.forEach((c, k) => { p(0, "LAYER"); p(2, c.nombre); p(70, 0); p(62, k === 0 ? 7 : 1); p(6, "CONTINUOUS"); });
  p(0, "ENDTAB"); p(0, "ENDSEC");
  p(0, "SECTION"); p(2, "ENTITIES");
  for (const capa of capas) {
    for (const anillo of aplanar(capa.d)) {
      p(0, "LWPOLYLINE"); p(8, capa.nombre); p(100, "AcDbEntity"); p(100, "AcDbPolyline");
      p(90, anillo.length); p(70, 1);       // 1 = cerrada
      for (const [x, y] of anillo) { p(10, x.toFixed(3)); p(20, (altoMm - y).toFixed(3)); }
    }
  }
  p(0, "ENDSEC"); p(0, "EOF");
  return L.join("\r\n") + "\r\n";
}

module.exports = { aDxf, aplanar };
