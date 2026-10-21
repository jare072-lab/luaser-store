// Revisa un SVG de corte antes de mandarlo al laser y responde las dos preguntas que
// importan: (1) la pieza sale de un solo cuerpo o se desarma, y (2) cual es el cuello
// mas delgado. El cuello se busca erosionando y volviendo a contar cuerpos: las puntas
// afiladas desaparecen sin partir nada, asi que no ensucian la medida como si lo hacia
// contar la corrida horizontal mas corta. Uso: node revisar-corte.js pieza-CORTE.svg
// Referencia: en acrilico de 3 mm no conviene bajar de 1.5 mm de cuello.
// que no ensucian la medida como sí lo hacía contar la corrida horizontal más corta.
const sharp = require("C:/Users/jorge/CLAUDE/node_modules/sharp");
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
function distFondo(dentro, W, H) {
  const INF = 1e12, m = Math.max(W, H);
  const f = new Float64Array(m), d = new Float64Array(m), v = new Int32Array(m), z = new Float64Array(m + 1);
  const o = new Float64Array(W * H);
  for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = dentro[y * W + x] ? INF : 0; dt1d(f, W, d, v, z); for (let x = 0; x < W; x++) o[y * W + x] = d[x]; }
  for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = o[y * W + x]; dt1d(f, H, d, v, z); for (let y = 0; y < H; y++) o[y * W + x] = Math.sqrt(d[y]); }
  return o;
}
function componentes(mask, w, h) {
  const visto = new Uint8Array(w * h), pila = new Int32Array(w * h), areas = [];
  for (let i = 0; i < w * h; i++) {
    if (visto[i] || !mask[i]) continue;
    let tope = 0, a = 0; pila[tope++] = i; visto[i] = 1;
    while (tope) { const p = pila[--tope]; a++; const x = p % w, y = (p / w) | 0;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x+dx, ny = y+dy;
        if (nx<0||ny<0||nx>=w||ny>=h) continue; const q = ny*w+nx;
        if (!visto[q] && mask[q]) { visto[q] = 1; pila[tope++] = q; } } }
    areas.push(a);
  }
  return areas.sort((a, b) => b - a);
}
(async () => {
  const svgPath = process.argv[2];
  const src = require("fs").readFileSync(svgPath, "utf8");
  const d = src.match(/ d="([^"]+)"/)[1];
  const W = parseFloat(src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)[1]);
  const H = parseFloat(src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)[2]);
  const esc = 10, w = Math.round(W * esc), h = Math.round(H * esc);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="#fff" fill-rule="evenodd"/></svg>`;
  const { data } = await sharp(Buffer.from(svg)).flatten({ background: "#000" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const dentro = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) dentro[i] = data[i] > 127 ? 1 : 0;
  const campo = distFondo(dentro, w, h);
  console.log(svgPath);
  const cuenta = (r) => {
    const m = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) m[i] = campo[i] > r * esc ? 1 : 0;
    return componentes(m, w, h).filter((x) => x > 200).length;
  };
  // Una capa de letras ya viene partida de origen (cada letra suelta es una pieza). Hay que
  // comparar contra ese número inicial, no contra 1, o el archivo siempre parece roto.
  const n0 = cuenta(0.02);
  console.log(`  la capa trae ${n0} pieza(s) de origen`);
  const parte = (r) => cuenta(r) > n0;
  let lo = 0.05, hi = 3.0;
  if (!parte(hi)) { console.log(`  ninguna pieza se parte al erosionar ${(2 * hi).toFixed(1)} mm: todos los cuellos pasan de eso`); return; }
  for (let k = 0; k < 22; k++) { const mid = (lo + hi) / 2; if (parte(mid)) hi = mid; else lo = mid; }
  console.log(`  cuello más delgado: ${(2 * lo).toFixed(2)} mm`);
})();
