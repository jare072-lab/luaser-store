// Relee el DXF ya escrito y comprueba que trae lo mismo que el SVG: mismas polilíneas,
// cerradas, en milímetros, y con la caja del tamaño anunciado.
const fs = require("fs");
const L = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/);
let i = 0, unidades = null, poly = [], actual = null, cerradas = 0;
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
while (i < L.length - 1) {
  const c = L[i].trim(), v = L[i + 1];
  if (c === "9" && v === "$INSUNITS") unidades = L[i + 3];
  if (c === "0" && v === "LWPOLYLINE") { actual = { n: 0, cerrada: false }; poly.push(actual); }
  if (actual) {
    if (c === "90") actual.n = +v;
    if (c === "70" && +v === 1) { actual.cerrada = true; }
    if (c === "10") { const x = +v; minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    if (c === "20") { const y = +v; minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  i += 2;
}
cerradas = poly.filter((p) => p.cerrada).length;
console.log(`${process.argv[2]}: unidades=${unidades} (4 = mm) · ${poly.length} polilíneas (${cerradas} cerradas)`
  + ` · vértices ${poly.map((p) => p.n).join("/")} · caja ${(maxX - minX).toFixed(1)} x ${(maxY - minY).toFixed(1)} mm`);
