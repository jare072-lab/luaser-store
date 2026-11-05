// Vectoriza una imagen (el logo que manda un cliente) a trazos de corte y grabado.
// Existe porque en esta máquina no hay potrace, Inkscape ni ImageMagick: el "Trazado de mapa
// de bits" de Corel no está disponible, así que el trazado se hace aquí.
//
// Uso:
//   node trazar-imagen.js logo.png salida --ancho 60 --corte 235 --grabado 140
//
//   --ancho     ancho final de la pieza en mm (obligatorio; define la escala)
//   --corte     umbral 0-255: todo lo MÁS OSCURO que esto es la pieza. Sube si el fondo
//               no es blanco puro; baja si se está comiendo detalle del borde.
//   --grabado   umbral 0-255 para la capa grabada (texto, filetes). Omítelo si el logo
//               es de una sola capa.
//   --recorte   x,y,w,h en px sobre la imagen original, para quedarse sólo con una parte.
//   --minimo    área mínima de un contorno en mm², para tirar la basura. Por defecto 0.5.
//   --suavizado desenfoque en px antes de trazar (por defecto 1.2). Súbelo si el contorno
//               sale con escalones; bájalo si se redondean las esquinas vivas.
//
// El desenfoque no es cosmético: sobre una máscara binaria pura, marching squares interpola
// siempre a la mitad de la celda y el contorno sale escalonado. Con un desenfoque chico el
// cruce cae con precisión de sub-píxel y el borde queda liso.
const fs = require("fs");
const sharp = require("sharp");
const { marchingSquares, simplificarAnillo } = require("./offset-corte.js");
const { aDxf } = require("./svg-a-dxf.js");

function arg(nombre, porDefecto) {
  const i = process.argv.indexOf("--" + nombre);
  return i === -1 ? porDefecto : process.argv[i + 1];
}

/**
 * @param datos    buffer greyscale en crudo
 * @param w,h      tamaño en px
 * @param umbral   0-255; se toma como tinta todo lo más oscuro
 * @param escala   mm por px
 * @returns        { d, anillos, descartados }
 */
function trazar(datos, w, h, umbral, escala, areaMinima) {
  // Campo para marching squares: "dentro" tiene que valer BAJO, y el nivel va en medio.
  // datos ya viene desenfocado, así que el cruce del nivel es sub-píxel.
  const campo = new Float64Array(w * h);
  for (let i = 0; i < w * h; i++) campo[i] = datos[i];
  const polis = marchingSquares(campo, w, h, umbral);

  let d = "", anillos = 0;
  const descartados = [];
  for (const p of polis) {
    const s = simplificarAnillo(p, 0.35);
    if (!s || s.length < 4) continue;
    let a = 0;
    for (let k = 0; k < s.length; k++) {
      const [x1, y1] = s[k], [x2, y2] = s[(k + 1) % s.length];
      a += (x1 * y2 - x2 * y1);
    }
    a = Math.abs(a / 2) * escala * escala;
    if (a < areaMinima) { descartados.push(+a.toFixed(2)); continue; }
    anillos++;
    d += "M " + s.map(([x, y]) => (x * escala).toFixed(3) + " " + (y * escala).toFixed(3)).join(" L ") + " Z ";
  }
  return { d, anillos, descartados };
}

(async () => {
  const entrada = process.argv[2], salida = process.argv[3];
  if (!entrada || !salida) {
    console.error("uso: node trazar-imagen.js <imagen> <salida> --ancho <mm> --corte <0-255> [--grabado <0-255>]");
    process.exit(1);
  }
  const anchoMm = parseFloat(arg("ancho"));
  if (!anchoMm) { console.error("falta --ancho <mm>"); process.exit(1); }
  const uCorte = parseFloat(arg("corte", 235));
  const uGrab = arg("grabado") === undefined ? null : parseFloat(arg("grabado"));
  const areaMinima = parseFloat(arg("minimo", 0.5));
  const suavizado = parseFloat(arg("suavizado", 1.2));
  const recorte = arg("recorte");

  let img = sharp(entrada);
  if (recorte) {
    const [x, y, w, h] = recorte.split(",").map(Number);
    img = img.extract({ left: x, top: y, width: w, height: h });
  }
  const { data, info } = await img.greyscale().blur(suavizado).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const escala = anchoMm / w;
  console.log(`${entrada}: ${w} x ${h} px -> ${anchoMm} x ${(h * escala).toFixed(1)} mm  (${(1 / escala).toFixed(1)} px/mm)`);

  const capas = [];
  const corte = trazar(data, w, h, uCorte, escala, areaMinima);
  console.log(`  CORTE   umbral ${uCorte}: ${corte.anillos} contorno(s)`
    + (corte.descartados.length ? ` · descartados ${corte.descartados.length} (mm2: ${corte.descartados.slice(0, 8).join(", ")})` : ""));
  capas.push({ nombre: "CORTE", d: corte.d, color: "#000000" });

  if (uGrab !== null) {
    const g = trazar(data, w, h, uGrab, escala, areaMinima);
    console.log(`  GRABADO umbral ${uGrab}: ${g.anillos} contorno(s)`
      + (g.descartados.length ? ` · descartados ${g.descartados.length}` : ""));
    capas.push({ nombre: "GRABADO", d: g.d, color: "#E8127E" });
  }

  const W = +(w * escala).toFixed(2), H = +(h * escala).toFixed(2);
  fs.writeFileSync(`${salida}-CORTE.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">
${capas.map((c) => `  <g id="${c.nombre}" fill="none" fill-rule="evenodd" stroke="${c.color}" stroke-width="0.2">
    <path d="${c.d}"/>
  </g>`).join("\n")}
</svg>`);
  fs.writeFileSync(`${salida}-CORTE.dxf`, aDxf(capas.map((c) => ({ nombre: c.nombre, d: c.d })), H));

  // Vista en blanco y negro, sin sombras ni texturas: así se va a ver cortado y grabado.
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(1400)}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    ${capas.map((c) => `<path d="${c.d}" fill="none" stroke="#000000" stroke-width="${0.12 * W / 60}" fill-rule="evenodd"/>`).join("")}
  </svg>`)).png().toFile(`${salida}-lineas.png`);

  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(1400)}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <path d="${capas[0].d}" fill="#000000" fill-rule="evenodd"/>
    ${capas[1] ? `<path d="${capas[1].d}" fill="#ffffff" fill-rule="evenodd"/>` : ""}
  </svg>`)).png().toFile(`${salida}-silueta.png`);
  console.log(`  escritos: ${salida}-CORTE.svg / .dxf / -lineas.png / -silueta.png`);
})();
