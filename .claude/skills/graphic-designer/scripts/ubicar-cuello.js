// Localiza el cuello: erosiona hasta que la pieza se parte, etiqueta los trozos, expande las
// etiquetas sobre toda la tinta y marca los píxeles donde se tocan dos etiquetas distintas.
// Ese es el estrangulamiento, no la piel del borde.
const fs = require("fs");
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
(async () => {
  const src = fs.readFileSync(process.argv[2], "utf8");
  const d = [...src.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).pop();
  const vb = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const W = parseFloat(vb[1]), H = parseFloat(vb[2]);
  const R = parseFloat(process.argv[3]);       // radio de erosión en mm, justo por encima del crítico
  const esc = 12, w = Math.round(W * esc), h = Math.round(H * esc);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="#fff" fill-rule="evenodd"/></svg>`;
  const { data } = await sharp(Buffer.from(svg)).flatten({ background: "#000" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const ink = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) ink[i] = data[i] > 127 ? 1 : 0;
  const campo = distFondo(ink, w, h);

  // Semillas: la pieza erosionada, ya partida.
  const lab = new Int32Array(w * h).fill(-1);
  const cola = new Int32Array(w * h);
  let nl = 0, cab = 0, cola_n = 0;
  for (let i = 0; i < w * h; i++) {
    if (lab[i] !== -1 || campo[i] <= R * esc) continue;
    const id = nl++; const pila = [i]; lab[i] = id; let area = 0;
    while (pila.length) {
      const p = pila.pop(); area++;
      const x = p % w, y = (p / w) | 0;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x+dx, ny = y+dy; if (nx<0||ny<0||nx>=w||ny>=h) continue;
        const q = ny*w+nx;
        if (lab[q] === -1 && campo[q] > R * esc) { lab[q] = id; pila.push(q); }
      }
    }
    if (area < 200) { /* mota: se deja etiquetada igual */ }
  }
  for (let i = 0; i < w * h; i++) if (lab[i] !== -1) cola[cola_n++] = i;
  // Expandir etiquetas sobre toda la tinta.
  while (cab < cola_n) {
    const p = cola[cab++], x = p % w, y = (p / w) | 0;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x+dx, ny = y+dy; if (nx<0||ny<0||nx>=w||ny>=h) continue;
      const q = ny*w+nx;
      if (ink[q] && lab[q] === -1) { lab[q] = lab[p]; cola[cola_n++] = q; }
    }
  }
  // Fronteras entre etiquetas distintas = cuellos.
  const rgb = Buffer.alloc(w * h * 3, 255);
  const puntos = [];
  for (let i = 0; i < w * h; i++) {
    if (!ink[i]) continue;
    rgb[i*3] = 30; rgb[i*3+1] = 30; rgb[i*3+2] = 30;
    const x = i % w, y = (i / w) | 0;
    for (const [dx, dy] of [[1,0],[0,1]]) {
      const nx = x+dx, ny = y+dy; if (nx>=w||ny>=h) continue;
      const q = ny*w+nx;
      if (ink[q] && lab[q] !== -1 && lab[i] !== -1 && lab[q] !== lab[i]) { puntos.push([x/esc, y/esc, 2*campo[i]/esc]); }
    }
  }
  for (const [mx, my] of puntos) {           // marcar en rojo un círculo bien visible
    const cx = Math.round(mx*esc), cy = Math.round(my*esc), r = Math.round(2.5*esc);
    for (let y = cy-r; y <= cy+r; y++) for (let x = cx-r; x <= cx+r; x++) {
      if (x<0||y<0||x>=w||y>=h) continue;
      const dd = Math.hypot(x-cx, y-cy);
      if (dd <= r && dd >= r-2.2) { const q=(y*w+x)*3; rgb[q]=230; rgb[q+1]=20; rgb[q+2]=20; }
    }
  }
  const vistos = [];
  for (const [x, y, g] of puntos) {
    if (!vistos.some((v) => Math.hypot(v[0]-x, v[1]-y) < 12)) vistos.push([x, y, g]);
  }
  console.log(`${process.argv[2]}: ${vistos.length} cuello(s)`);
  for (const [x, y, g] of vistos) console.log(`   en x=${x.toFixed(0)} mm, y=${y.toFixed(0)} mm · grueso ${g.toFixed(2)} mm`);
  await sharp(rgb, { raw: { width: w, height: h, channels: 3 } }).resize({ width: 1500 }).png().toFile(process.argv[4]);
})();
