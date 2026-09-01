"use client";

import { useEffect, useRef } from "react";

/**
 * Revelado de marca en canvas: la mira de Luaser se arma sola y resuelve en
 * "ENVÍO GRATIS / A TODO MÉXICO".
 *
 * Está calcado de los mecanismos medidos en `bar.md`, no del aspecto:
 *
 *  - La tinta es mínima. Todo se dibuja a trazo fino sobre vacío.
 *  - Dos fondos, una dirección: hueso -> antracita, y el cálido no regresa.
 *  - Los dos puntos que orbitan NO son decoración: aterrizan en las puntas de
 *    la cruz del logotipo. El elemento que se mueve es el que acaba siendo
 *    parte de la marca.
 *  - Los anillos son de trama. Ni un trazo continuo, igual que el logo real.
 *  - Dos tamaños de tipografía y uno solo de acento, usado una vez.
 *
 * `dibuja()` es pura respecto del tiempo: el mismo `t` da siempre el mismo
 * fotograma. Eso permite capturar la animación cuadro por cuadro para
 * revisarla, en vez de juzgarla de memoria.
 */

/* ---------------------------------------------------------------- espacio */

// El espacio de diseño es más alto que el encuadre real a propósito: así el
// bloque final ocupa poco y el vacío lo RODEA, en vez de quedar amontonado a
// izquierda y derecha. Con 640 el bloque cruzaba dos tercios de la altura.
const ALTO = 900;
const TAU = Math.PI * 2;

// Todo el contenido cabe en ~340 px alrededor del centro, así que el ancho del
// espacio de diseño solo decide cuánto vacío queda a los lados. En pantallas
// angostas se encoge para que la marca no quede diminuta.
function anchoDiseno(w: number) {
  return w < 560 ? 460 : w < 900 ? 700 : 1000;
}

// En el logo real el wordmark mide 2.6 veces el ancho del emblema (medido:
// emblema 265 px, wordmark 699 px). Con R=95 la proporción era 1.1 y el
// emblema dominaba el bloque, lo estiraba a lo alto y disparaba la tinta.
const R = 61; // radio de la mira
// Las cuatro posiciones van corridas para que el CENTRO del bloque completo
// (boquilla arriba, última línea abajo) caiga un 3 % por debajo del centro del
// lienzo. Colocarlas "a ojo" dejaba el bloque 2 px por encima del centro
// matemático, que es justo lo contrario del centrado óptico del mecanismo 5.
const MIRA_Y = 372; // centro de la mira
const Y_MARCA = 542; // pie del wordmark
const Y_TITULAR = 620; // línea base de ENVIO GRATIS
const Y_BAJADA = 670; // línea base de A TODO MEXICO

// Las dos líneas se dibujan SIN acentos a propósito: los acentos los ponen los
// dos puntos que vienen orbitando. Bórralos y queda "MAS" y "CATALOGO", que
// en español está mal escrito — que es justo la prueba que pide el mecanismo 3.
//
// El mensaje dejó de ser el envío gratis (que ya no existe: ahora se cobra) y
// pasó a ser el descuento máximo del catálogo. El porcentaje NO se escribe a
// mano: entra por `cfg.maxDescuento`, calculado desde Shopify, para que la
// portada no pueda prometer un descuento que la tienda ya no tiene.
//
// La frase se partió buscando que cada línea conserve un acento, porque de eso
// depende que los dos puntos tengan dónde aterrizar: "MÁS" arriba y "CATÁLOGO"
// abajo. Cambiar el copy sin respetar esa condición deja los puntos huérfanos.
const titularDe = (pct: number) => `HASTA ${pct}% MENOS`;
const BAJADA = "POR PLACA EN EL PACK";
/** Índice de la letra que lleva la tilde. Se busca, no se cuenta a mano: el
 *  porcentaje cambia de ancho (58 vs 7 vs 100) y correría la posición. */
const iAcentoTitular = (texto: string) => texto.lastIndexOf("MENOS") + 1; // la E de MENOS
const I_ACENTO_BAJADA = BAJADA.lastIndexOf("PLACA") + 3; // la 2a A de PLACA

// Recorte del wordmark dentro de logo-luaser.jpg (768x768), medido sobre el
// archivo, no estimado.
const LOGO = { x: 34, y: 418, w: 699, h: 116 };
const MARCA_ANCHO = 430; // en unidades de diseño

// La X rebasa holgadamente los arcos por los cuatro extremos: es el gesto de
// firma del logo real, y define el ancho total del emblema.
const PUNTA = 1.34;

/**
 * Geometría del emblema REAL de Luaser, leída sobre el archivo del logo.
 *
 * Lo que se falló tres rondas seguidas: en la marca real **no hay ni un solo
 * círculo cerrado**. Todo son segmentos de arco cortados, con terminal
 * cuadrado y hueco entre ellos, más una X larga que cruza el centro, dos
 * barras rectas a las 9 y las 3, y un vástago a las 6. Los aros continuos y la
 * corona dentada que había antes eran invención: aterrizaban en un logotipo
 * que la tienda no tiene.
 *
 * Formato: [radio, ánguloInicio, barrido, grosor, capa]. Grados, 0 = las 3,
 * creciendo en el sentido de las agujas (el eje Y del lienzo va hacia abajo).
 */
const ARCOS: [number, number, number, number, number][] = [
  // Corona exterior, cortada en los cuatro pasos del aspa.
  [0.95, 148, 66, 4, 0],
  [0.95, 328, 66, 4, 0],
  [0.95, 58, 66, 4, 0],
  [0.95, 245, 28, 4, 0],
  [0.95, 287, 28, 4, 0],
  // Segunda corona.
  [0.72, 150, 62, 3.8, 1],
  [0.72, 330, 62, 3.8, 1],
  [0.72, 60, 62, 3.8, 1],
  // Tercera. El logo real no repite los cuatro cuadrantes: es asimétrico.
  [0.5, 155, 56, 3.6, 2],
  [0.5, 335, 56, 3.6, 2],
  [0.5, 65, 56, 3.6, 2],
  // Los tres tramos cortos escalonados de arriba a la izquierda.
  [0.63, 243, 17, 3, 3],
  [0.51, 247, 15, 3, 3],
  [0.39, 251, 14, 3, 3],
];

/**
 * Tramos rectos: las dos barras y el vástago, más los ganchos en escuadra con
 * que rematan algunos arcos.
 *
 * Formato: [ánguloGrados, radioDesde, radioHasta, grosor, capa].
 */
const BARRAS: [number, number, number, number, number][] = [
  // Las barras llegan tan lejos como las puntas de la X, igual que en el logo
  // real. Quedándose en 1.02 eran ellas —y no la X— las que fijaban el ancho
  // del emblema, y lo dejaban un 23 % chico frente al wordmark.
  [180, 0.34, 1.34, 3.4, 0], // barra a las 9
  [0, 0.72, 1.34, 3.4, 0], // barra a las 3
  [90, 0.84, 1.3, 3.4, 1], // vástago a las 6
  [153, 0.5, 0.72, 3, 2], // gancho del arco medio izquierdo
  [111, 0.5, 0.72, 3, 2], // gancho del arco inferior
];

/**
 * Campo de marcas de corte para el estallido.
 *
 * Se reparten por ángulo áureo para que queden uniformes sin agruparse, y es
 * determinista a propósito: con Math.random el servidor y el cliente dibujan
 * cosas distintas y cada recarga da otra composición.
 */
// Pocas y gruesas, no muchas y capilares: seiscientos guiones finos suman
// píxeles pero leen como estática. Lo que hace autoridad es el grosor.
const MARCAS = Array.from({ length: 130 }, (_, i) => ({
  a: i * 2.39996,
  r: 0.16 + (((i * 37) % 100) / 100) * 0.84,
  l: 44 + ((i * 17) % 6) * 22,
  c: i % 5 === 0 ? 1 : i % 9 === 0 ? 2 : 0,
}));

// Alturas de mayúscula. Son DOS, en proporción 1 : 0.65 (mecanismo 6).
const CAP_GRANDE = 50;
const CAP_CHICA = 33;

/* ----------------------------------------------------------------- color */

const HUESO = "#FAF9F6";
const TINTA = "#0B0C0E";
const ORO = "#E8927A"; // el único acento del cuadro final, y se usa una vez
const AZUL = "#2E7FE8"; // solo durante el estallido, nunca en el estado final

/* --------------------------------------------------------------- tiempos */

/**
 * La referencia dura 4.32 s, y esta empezó igual. Pero la referencia es la
 * presentación de un estudio de motion, y esto es la portada de una tienda:
 * tener el argumento de venta ilegible durante 4.32 s repite exactamente el
 * error que ya costaba conversiones, el de enseñar el beneficio demasiado
 * tarde. Así que la toma se comprime a 3.12 s y, sobre todo, el mensaje se
 * adelanta: "ENVÍO GRATIS" empieza a leerse hacia el segundo 2.4 en vez del
 * 3.9. Es la única desviación deliberada respecto de la vara medida.
 */
// El mensaje queda completo en 2.45 y después no cambia nada. Los 0.67 s de
// cola que había eran tiempo muerto que retrasaba la aparición de los botones
// y del bloque de descuentos, así que la toma cierra en 2.60.
const DURACION = 2.4;

const T = {
  // Los puntos orbitan hasta que salen disparados a ser los acentos: no hay
  // tramo en que estén parados sin hacer nada.
  orbita: [0.0, 1.7],
  acentos: [1.7, 2.32],
  // El fondo cálido aguanta hasta el 20 % de la toma, como en la referencia.
  corte: [0.55, 0.66],
  // El pico y su recogida. Es la única fase que no describe la vara como
  // forma, pero sí como función: sin algo que soltar, no hay revelado.
  estallido: [0.7, 1.8],
  // El montaje arranca ANTES del corte: así el acto cálido lleva información
  // en vez de ser 0.7 s de crema con dos puntos, que en una portada de
  // conversión es el metraje más caro de la pieza.
  anillos: [0.42, 1.45],
  contrae: [1.2, 1.85],
  cruz: [1.45, 1.92],
  // La boquilla entra DURANTE la contracción, no después: si aparece cuando el
  // emblema ya se encogió, el ojo lee una sustitución de objeto, no una toma.
  boquilla: [1.25, 1.8],
  // El texto entra SOLAPADO con la contracción, no después. Cuando entraba
  // después, la curva de tinta hacía una W —cargar, soltar de más, volver a
  // cargar— y el vacío del cierre no quedaba ganado sino vuelto a llenar.
  marca: [1.25, 1.85],
  titular: [1.45, 2.15],
  bajada: [1.72, 2.3],
  // Los rieles entran DESPUÉS del corte de fondo y antes que el texto: son el
  // margen del encuadre, así que tienen que estar puestos cuando llega el
  // mensaje, no llegar con él y disputarle la entrada.
  rieles: [0.75, 1.9],
} as const;

/* ----------------------------------------------------------------- curvas */

const recorta = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Avance normalizado de un tramo del guion. */
const tramo = (t: number, [a, b]: readonly [number, number]) => recorta((t - a) / (b - a));
const salida = (u: number) => 1 - Math.pow(1 - u, 3);
const suave = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const mezcla = (a: number, b: number, u: number) => a + (b - a) * u;

/** Interpola dos colores hex. Se usa solo para el corte de fondo. */
function mezclaColor(a: string, b: string, u: number) {
  const p = (c: string, i: number) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(mezcla(p(a, i), p(b, i), u)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/* ------------------------------------------------------------ tipografía */

/**
 * Dibuja texto letra por letra con interletrado.
 *
 * El interletrado va a mano y no con `ctx.letterSpacing` porque esa propiedad
 * no existe en Safari viejo, y ahí la línea abierta colapsaría. Dibujar cada
 * letra también permite escalonar su entrada y centrar el resultado exacto.
 */
function lineaTrackeada(
  ctx: CanvasRenderingContext2D,
  texto: string,
  cx: number,
  y: number,
  track: number,
  pinta: (i: number, total: number) => { alpha: number; dy: number } | null,
  modo: "relleno" | "trazo"
) {
  // Array.from y no [...texto]: recorre por punto de código igual, pero el
  // spread sobre string exige un target mayor del que compila este proyecto.
  const letras = Array.from(texto);
  const anchos = letras.map((l) => ctx.measureText(l).width);
  const total = anchos.reduce((s, w) => s + w, 0) + track * (letras.length - 1);

  let x = cx - total / 2;
  const centros: number[] = [];
  letras.forEach((letra, i) => {
    const estado = pinta(i, letras.length);
    if (estado && estado.alpha > 0.001 && letra !== " ") {
      ctx.save();
      ctx.globalAlpha = estado.alpha;
      if (modo === "trazo") ctx.strokeText(letra, x, y + estado.dy);
      else ctx.fillText(letra, x, y + estado.dy);
      ctx.restore();
    }
    centros.push(x + anchos[i] / 2);
    x += anchos[i] + track;
  });
  // Devuelve el centro de cada letra: es lo que permite saber dónde tiene que
  // aterrizar cada acento sin adivinar la posición.
  return { total, centros };
}

/**
 * Tamaño de fuente que produce una altura de mayúscula dada.
 *
 * Se mide sobre la letra real en vez de asumir un factor: cada familia tiene
 * su propia altura de mayúscula, y si la tipografía no cargó y cayó al
 * sustituto, medir evita que los dos tamaños dejen de guardar su proporción.
 */
function tamanoParaCap(ctx: CanvasRenderingContext2D, familia: string, peso: string, cap: number) {
  const sonda = 100;
  ctx.font = `${peso} ${sonda}px ${familia}`;
  const alto = ctx.measureText("H").actualBoundingBoxAscent || 70;
  return (cap / alto) * sonda;
}

/* ------------------------------------------------------------------ mira */

/**
 * Anillo del emblema.
 *
 * Se arma como trama —el mecanismo 4 de la vara— y CIERRA a filete sólido
 * doble, que es como son los arcos del logo real. Los dos requisitos parecían
 * incompatibles y no lo son: la trama gobierna el montaje, el logo gobierna el
 * resultado. `solidez` va de 0 (guiones) a 1 (línea continua).
 */
function anillo(
  ctx: CanvasRenderingContext2D,
  r: number,
  desde: number,
  barrido: number,
  guion: number[],
  grosor: number,
  avance: number,
  solidez = 0
) {
  if (avance <= 0.001) return;
  ctx.save();
  ctx.lineWidth = grosor;
  ctx.setLineDash([guion[0], guion[1] * (1 - solidez)]);
  ctx.beginPath();
  ctx.arc(0, 0, r, desde, desde + barrido * avance);
  ctx.stroke();
  ctx.restore();
}

/**
 * El estallido: el instante en que el láser corta.
 *
 * La referencia llena el cuadro (16.5 % de tinta) y luego lo aprieta hasta un
 * renglón (1 %). Ese apretón es todo el drama: el vacío final está GANADO. Sin
 * un pico que soltar, el último fotograma es solo el final de un ensamblado.
 *
 * El pico aquí no copia la forma de la referencia, copia su función, y lo hace
 * con lo que esta marca sí es: una cortadora. El campo se llena de marcas de
 * corte y después todo se recoge al centro, que es exactamente lo que deja una
 * pasada de láser: mucho material, y al final una sola pieza.
 */
function estallido(
  ctx: CanvasRenderingContext2D,
  u: number,
  trazo: string
) {
  if (u <= 0.001 || u >= 0.999) return;
  const abre = recorta(u / 0.3);
  const cierra = recorta((u - 0.3) / 0.7);
  const RADIO = 640;

  ctx.save();
  ctx.setLineDash([]);
  ctx.lineCap = "round";
  for (const m of MARCAS) {
    const alpha = abre * (1 - suave(cierra));
    if (alpha < 0.012) continue;
    // Se abre hacia fuera y luego se recoge casi hasta el centro.
    const d = m.r * RADIO * mezcla(0.12, 1, salida(abre)) * mezcla(1, 0.05, suave(cierra));
    const largo = m.l * mezcla(1, 0.25, cierra);
    const x = Math.cos(m.a) * d;
    const y = Math.sin(m.a) * d * 0.66;
    ctx.globalAlpha = alpha * (m.c ? 0.95 : 0.78);
    ctx.strokeStyle = m.c === 1 ? ORO : m.c === 2 ? AZUL : trazo;
    ctx.lineWidth = m.c ? 4.6 : 3.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - Math.cos(m.a) * largo, y - Math.sin(m.a) * largo * 0.66);
    ctx.stroke();
  }
  ctx.restore();
}

/** Tramo recto radial: las barras, el vástago y los ganchos en escuadra. */
function barra(
  ctx: CanvasRenderingContext2D,
  r: number,
  grados: number,
  r0: number,
  r1: number,
  grosor: number,
  avance: number
) {
  if (avance <= 0.001) return;
  const a = (grados * Math.PI) / 180;
  const hasta = mezcla(r0, r1, salida(avance));
  ctx.save();
  ctx.lineWidth = grosor;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(Math.cos(a) * r * r0, Math.sin(a) * r * r0);
  ctx.lineTo(Math.cos(a) * r * hasta, Math.sin(a) * r * hasta);
  ctx.stroke();
  ctx.restore();
}

/**
 * La X: el trazo más largo y pesado del emblema, y su columna vertebral.
 *
 * Cruza el centro de lado a lado y rebasa holgadamente los arcos, que es
 * exactamente lo que hace en el logo real. Remate cuadrado, no redondo.
 */
function cruz(ctx: CanvasRenderingContext2D, r: number, avance: number) {
  if (avance <= 0.001) return;
  const u = salida(avance);
  ctx.save();
  ctx.lineWidth = 4.4;
  ctx.lineCap = "butt";
  ctx.setLineDash([]);
  for (let q = 0; q < 4; q++) {
    const a = Math.PI / 4 + q * (TAU / 4);
    const r1 = mezcla(0, r * PUNTA, u);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

/** Boquilla del láser: baja desde arriba y proyecta el haz al centro. */
function boquilla(ctx: CanvasRenderingContext2D, avance: number) {
  if (avance <= 0.001) return;
  const u = salida(avance);
  ctx.save();
  ctx.globalAlpha = u;
  ctx.translate(0, mezcla(-46, 0, u));
  ctx.lineWidth = 2.6;
  ctx.setLineDash([]);

  // La boquilla monta sobre el anillo, no flota encima: en el logo se
  // superpone, y separarla la convertía en un objeto suelto.
  const cuerpoY = -R * 1.5;
  // Pestaña superior: sin ella el cuerpo leía como una caja cualquiera.
  ctx.beginPath();
  ctx.moveTo(-24, cuerpoY);
  ctx.lineTo(24, cuerpoY);
  ctx.lineTo(24, cuerpoY + 9);
  ctx.lineTo(-24, cuerpoY + 9);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-19, cuerpoY + 9);
  ctx.lineTo(19, cuerpoY + 9);
  ctx.lineTo(19, cuerpoY + 32);
  ctx.lineTo(13, cuerpoY + 48);
  ctx.lineTo(-13, cuerpoY + 48);
  ctx.lineTo(-19, cuerpoY + 32);
  ctx.closePath();
  ctx.stroke();

  // Punta cónica.
  const punta = cuerpoY + 80;
  ctx.beginPath();
  ctx.moveTo(-13, cuerpoY + 48);
  ctx.lineTo(0, punta);
  ctx.lineTo(13, cuerpoY + 48);
  ctx.stroke();

  // El haz: un cono hasta el centro, que es donde converge todo el emblema.
  ctx.globalAlpha = u * 0.34;
  ctx.lineWidth = 1.3;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(-11, punta);
  ctx.lineTo(0, -2);
  ctx.lineTo(11, punta);
  ctx.stroke();

  // Punto de convergencia.
  ctx.globalAlpha = u;
  ctx.beginPath();
  ctx.arc(0, 0, 2.6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/* ----------------------------------------------------------- el fotograma */

type Ctx = {
  familia: string;
  reducido: boolean;
  /**
   * Descuento máximo vigente del catálogo, en porcentaje entero.
   *
   * Viaja hasta aquí desde Shopify (ver `PromoBanner`) en vez de estar escrito
   * en el lienzo: si mañana se acaba la oferta de la caja, la portada baja el
   * número sola en vez de seguir prometiéndolo.
   */
  maxDescuento: number;
  /** Wordmark real de la marca, ya recortado y teñido. null si no cargó. */
  wordmark?: HTMLCanvasElement | null;
  /**
   * Densidad de píxeles del lienzo.
   *
   * Va explícita porque `dibuja` reinicia la transformación, y reiniciarla a
   * identidad pintaba el fondo solo sobre el rectángulo lógico: en una pantalla
   * a 2x eso deja tres cuartas partes del héroe sin pintar, o sea en negro.
   */
  dpr?: number;
};

/**
 * Recorta el wordmark del archivo de logo y lo convierte en tinta plana.
 *
 * Tres críticos seguidos dijeron lo mismo: dibujar "LUASER" con una tipografía
 * cualquiera no es el logo, es una aproximación —al logo real le falta su letra
 * angular y el rayo de la A—. La respuesta no era imitarlo mejor sino usarlo.
 *
 * El archivo viene sobre un fondo azul oscuro y con relleno metálico, así que
 * no se puede pegar tal cual: se convierte la luminancia en alfa y se tiñe de
 * hueso. Queda como línea, que es como está dibujado el resto del emblema.
 */
async function preparaWordmark(): Promise<HTMLCanvasElement | null> {
  try {
    const img = new Image();
    img.src = "/logo-luaser.jpg";
    await img.decode();

    const escala = 3; // margen de resolución para pantallas densas
    const cv = document.createElement("canvas");
    cv.width = LOGO.w * escala;
    cv.height = LOGO.h * escala;
    const g = cv.getContext("2d", { willReadFrequently: true });
    if (!g) return null;

    g.drawImage(img, LOGO.x, LOGO.y, LOGO.w, LOGO.h, 0, 0, cv.width, cv.height);
    const datos = g.getImageData(0, 0, cv.width, cv.height);
    const p = datos.data;
    for (let i = 0; i < p.length; i += 4) {
      const lum = 0.2126 * p[i] + 0.7152 * p[i + 1] + 0.0722 * p[i + 2];
      // El fondo del archivo ronda 30 de luminancia y el trazo pasa de 150.
      const alfa = recorta((lum - 48) / 115);
      p[i] = 250;
      p[i + 1] = 249;
      p[i + 2] = 246;
      p[i + 3] = Math.round(alfa * 255);
    }
    g.putImageData(datos, 0, 0);
    return cv;
  } catch {
    // Si no carga, el dibujo cae a la versión tipográfica y no se rompe nada.
    return null;
  }
}

/**
 * Rieles laterales: la regla de la mesa de corte.
 *
 * El vacío de los costados era deliberado —la vara medida resuelve en un cuadro
 * casi sin tinta— pero en una portada de 1900 px de ancho ese vacío deja dos
 * tercios del encuadre sin nada que mirar. La salida no es rellenar con adorno,
 * que rompería el mecanismo 1, sino traer un objeto que la marca ya tiene: la
 * regla graduada de la mesa de corte láser. Es estructura, no decoración, y
 * dice lo mismo que el resto de la portada —precisión— sin sumar una idea nueva.
 *
 * Se dibuja a trazo capilar y a un 40 % de alfa: tiene que leerse como el margen
 * del encuadre, nunca competir con el bloque central.
 *
 * En pantallas angostas NO se dibuja: con `anchoDiseno` en 460 el riel caería
 * justo encima del wordmark, que mide ~340 de ancho.
 */
function rieles(
  ctx: CanvasRenderingContext2D,
  u: number,
  medioVisible: number,
  trazo: string,
  familia: string,
  etiquetas: [string, string]
) {
  // `medioVisible` es la mitad del encuadre REAL en unidades de diseño, no la
  // mitad de `anchoDiseno`. No son lo mismo: en una pantalla ancha la escala la
  // fija la altura, así que el espacio de diseño ocupa bastante menos que el
  // ancho del lienzo y anclar los rieles a `ancho / 2` los dejaba flotando en
  // el tercio central, con los costados igual de vacíos que antes.
  if (u <= 0.001 || medioVisible < 320) return;

  const x = medioVisible - 72;
  const yA = 118;
  const yB = ALTO - 118;
  const paso = 17;
  const total = Math.floor((yB - yA) / paso);

  ctx.save();
  ctx.setLineDash([]);
  ctx.lineCap = "butt";
  ctx.strokeStyle = trazo;
  ctx.fillStyle = trazo;

  for (const s of [-1, 1] as const) {
    // Cada riel crece desde su centro hacia los dos extremos: entra como algo
    // que se despliega, no como algo que aparece.
    const centro = (yA + yB) / 2;
    ctx.globalAlpha = 0.4 * u;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s * x, mezcla(centro, yA, salida(u)));
    ctx.lineTo(s * x, mezcla(centro, yB, salida(u)));
    ctx.stroke();

    for (let i = 0; i <= total; i++) {
      const y = yA + i * paso;
      // El avance del trazo va de dentro hacia fuera, igual que el riel.
      const d = Math.abs(y - centro) / ((yB - yA) / 2);
      const ui = recorta((salida(u) - d * 0.55) / 0.45);
      if (ui <= 0.001) continue;
      const mayor = i % 5 === 0;
      ctx.globalAlpha = (mayor ? 0.5 : 0.26) * ui;
      ctx.lineWidth = mayor ? 1.6 : 1;
      ctx.beginPath();
      ctx.moveTo(s * x, y);
      ctx.lineTo(s * (x - (mayor ? 13 : 7)), y);
      ctx.stroke();
    }

    // La etiqueta corre a lo largo del riel, leyéndose de abajo hacia arriba en
    // el izquierdo y de arriba hacia abajo en el derecho: los dos textos "salen"
    // del centro del cuadro, que es donde está el ojo.
    const texto = s === -1 ? etiquetas[0] : etiquetas[1];
    ctx.save();
    ctx.globalAlpha = 0.42 * recorta((salida(u) - 0.5) / 0.5);
    ctx.translate(s * (x + 19), centro);
    ctx.rotate(s === -1 ? -Math.PI / 2 : Math.PI / 2);
    ctx.font = `600 12px ${familia}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // El tracking se hace a mano: canvas no tiene letter-spacing fiable en
    // Safari, y sin él la línea capitular se lee apretada.
    const letras = texto.split("");
    const anchoTotal = letras.reduce((acc, l) => acc + ctx.measureText(l).width + 3.4, -3.4);
    let cx = -anchoTotal / 2;
    for (const l of letras) {
      const lw = ctx.measureText(l).width;
      ctx.fillText(l, cx + lw / 2, 0);
      cx += lw + 3.4;
    }
    ctx.restore();
  }

  ctx.restore();
}

export function dibuja(ctx: CanvasRenderingContext2D, t: number, w: number, h: number, cfg: Ctx) {
  const tiempo = cfg.reducido ? DURACION : recorta(t / DURACION) * DURACION;

  /* -- fondo: hueso -> antracita, sin regreso (mecanismo 2) -- */
  const corte = tramo(tiempo, T.corte);
  const fondo = mezclaColor(HUESO, TINTA, corte);
  const dpr = cfg.dpr ?? 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, w, h);

  // La tinta invierte junto con el fondo para mantener el contraste.
  const trazo = mezclaColor(TINTA, HUESO, corte);

  const ancho = anchoDiseno(w);
  const escala = Math.min(w / ancho, h / ALTO) * dpr;
  ctx.setTransform(escala, 0, 0, escala, (w / 2) * dpr, (h / 2) * dpr);
  ctx.translate(0, -ALTO / 2);

  ctx.strokeStyle = trazo;
  ctx.fillStyle = trazo;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /* -- los rieles del margen, debajo de todo lo demás -- */
  // Mitad del encuadre real expresada en unidades de diseño: el borde físico
  // del lienzo cae en esta x una vez aplicada la transformación de arriba.
  const medioVisible = w / 2 / Math.min(w / ancho, h / ALTO);
  rieles(ctx, tramo(tiempo, T.rieles), medioVisible, trazo, cfg.familia, [
    "CORTE LASER · MONTERREY",
    `ACRILICO · MDF · HASTA ${cfg.maxDescuento}% MENOS`,
  ]);

  /* -- el pico: el cuadro se llena y después se recoge -- */
  ctx.save();
  ctx.translate(0, ALTO / 2);
  estallido(ctx, tramo(tiempo, T.estallido), trazo);
  ctx.restore();

  /* -- la mira: se arma grande, en el centro, y se contrae a su sitio -- */
  const k = suave(tramo(tiempo, T.contrae));
  // El cierre convierte la trama en filete sólido y apaga lo que era andamio.
  const cierre = recorta((tiempo - 1.55) / 0.45);

  ctx.save();
  ctx.translate(0, mezcla(ALTO / 2, MIRA_Y, k));
  // Arranca a 4.8x, desbordando el cuadro, y se cierra sobre la pieza. El zoom
  // es lo que produce el pico de tinta: unas líneas finas repartidas no cubren
  // área por muchas que sean, y sin pico no hay nada que soltar al final.
  // 3.6x llena el cuadro sin que el anillo se salga por arriba y por abajo.
  // A 4.8x se escapaba del encuadre, y eso lee como accidente, no composición.
  const z = mezcla(3.6, 1, k);
  ctx.scale(z, z);

  const a = tramo(tiempo, T.anillos);
  // Cada capa entra escalonada: de fuera hacia dentro.
  const capa = (i: number) => recorta((a - i * 0.11) / 0.55);

  // Tres bandas, cada una con carácter distinto. Antes había cinco tramas del
  // mismo peso y se hacían papilla entre ellas: el logo tiene jerarquía, no
  // cantidad.
  // Terminal cuadrado en todo el emblema: el logo real no tiene ni un remate
  // redondo, y el redondeo le quitaba el aire de pieza cortada.
  ctx.lineCap = "butt";
  for (const [rr, ini, barrido, grosor, cp] of ARCOS) {
    anillo(
      ctx,
      R * rr,
      (ini * Math.PI) / 180,
      (barrido * Math.PI) / 180,
      [7, 5],
      grosor,
      capa(cp),
      cierre
    );
  }
  for (const [grados, r0, r1, grosor, cp] of BARRAS) {
    barra(ctx, R, grados, r0, r1, grosor, capa(cp));
  }
  ctx.lineCap = "round";

  /* -- los dos puntos: orbitan y se cierran sobre el foco -- */
  //
  // Antes aterrizaban en las puntas del aspa y se quedaban ahí. Eso fallaba la
  // prueba que importa: en la referencia, si borras los dos puntos la palabra
  // queda rota; allí, si los borrabas, el logo quedaba MÁS correcto, porque
  // estaban tapando el gesto propio de la marca —que las aspas sobresalgan—.
  //
  // Ahora los dos se hacen uno en el punto focal, que es donde converge el haz
  // y donde converge el emblema entero. Bórralos y el láser enfoca en nada.
  const o = tramo(tiempo, T.orbita);
  const giro = salida(o);
  const angulo = -Math.PI / 2 + giro * (2 * TAU + (Math.PI / 4 + Math.PI / 2));
  // Se quedan FUERA del anillo mientras orbitan: no aterrizan en las puntas de
  // las aspas, que es donde tapaban el gesto propio del logo.
  const radio = mezcla(R * 1.7, R * 1.42, suave(o));

  const c = tramo(tiempo, T.cruz);
  // Los brazos crecen del centro hasta la punta exacta donde quedaron los dos
  // puntos: el remate del brazo ES el punto que venía orbitando.
  cruz(ctx, R, c);

  // El hilo punteado solo vive mientras orbitan: es el andamio, no la pieza.
  const hilo = (1 - recorta((tiempo - T.cruz[0]) / 0.4)) * 0.5;
  if (hilo > 0.001) {
    ctx.save();
    ctx.globalAlpha = hilo;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angulo) * radio, Math.sin(angulo) * radio);
    ctx.lineTo(-Math.cos(angulo) * radio, -Math.sin(angulo) * radio);
    ctx.stroke();
    ctx.restore();
  }

  boquilla(ctx, tramo(tiempo, T.boquilla));
  ctx.restore();
  // Los dos puntos NO se dibujan aquí: viven en el marco exterior, porque su
  // destino no es el emblema sino los acentos del texto.

  /* -- el bloque de texto: dos tamaños, un acento -- */
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  const m = tramo(tiempo, T.marca);
  if (m > 0.001) {
    if (cfg.wordmark) {
      // El wordmark REAL, recortado del archivo de logo. Es la letra propia de
      // la marca, con su rayo en la A, no una tipografía que se le parezca.
      // Además deja el cuadro con dos tamaños de texto y no tres: el nombre ya
      // no es tipografía, es la marca.
      const alto = (MARCA_ANCHO * LOGO.h) / LOGO.w;
      const u = salida(m);
      ctx.save();
      ctx.globalAlpha = u;
      ctx.drawImage(cfg.wordmark, -MARCA_ANCHO / 2, Y_MARCA - alto + mezcla(10, 0, u), MARCA_ANCHO, alto);
      ctx.restore();
    } else {
      // Reserva por si el archivo no carga: antes sin nombre que sin nada.
      const GROSOR = 2;
      ctx.font = `600 ${tamanoParaCap(ctx, cfg.familia, "600", CAP_CHICA - GROSOR)}px ${cfg.familia}`;
      ctx.lineWidth = GROSOR;
      ctx.strokeStyle = trazo;
      lineaTrackeada(
        ctx,
        "LUASER",
        0,
        Y_MARCA,
        10,
        (i, n) => {
          const u = recorta((m - (i / n) * 0.45) / 0.55);
          return { alpha: u, dy: mezcla(8, 0, salida(u)) };
        },
        "trazo"
      );
    }
  }

  // Las dos líneas se miden SIEMPRE, se dibujen o no: los acentos que vienen
  // volando necesitan saber su destino antes de llegar a él.
  const ti = tramo(tiempo, T.titular);
  const TITULAR = titularDe(cfg.maxDescuento);
  ctx.font = `700 ${tamanoParaCap(ctx, cfg.familia, "700", CAP_GRANDE)}px ${cfg.familia}`;
  ctx.fillStyle = ORO;
  const cenTit = lineaTrackeada(
    ctx,
    TITULAR,
    0,
    Y_TITULAR,
    2,
    (i, n) => {
      if (ti <= 0.001) return null;
      const u = recorta((ti - (i / n) * 0.4) / 0.6);
      return { alpha: u, dy: mezcla(10, 0, salida(u)) };
    },
    "relleno"
  ).centros;

  const b = tramo(tiempo, T.bajada);
  // Va en hueso rebajado, no en un gris aparte: así el cuadro final tiene DOS
  // colores (hueso y oro) como la referencia, en vez de tres.
  ctx.font = `500 ${tamanoParaCap(ctx, cfg.familia, "500", CAP_CHICA)}px ${cfg.familia}`;
  ctx.fillStyle = trazo;
  const cenBaj = lineaTrackeada(
    ctx,
    BAJADA,
    0,
    Y_BAJADA,
    8,
    // El rebaje va en el alfa de cada letra: lineaTrackeada fija globalAlpha
    // por letra, así que ponerlo fuera no tendría efecto.
    () => (b <= 0.001 ? null : { alpha: salida(b) * 0.62, dy: mezcla(6, 0, salida(b)) }),
    "relleno"
  ).centros;

  /* -- los dos puntos aterrizan SIENDO los acentos -- */
  //
  // Este es el mecanismo que define la referencia y el que costó tres rondas.
  // Allí los dos puntos son las dos O de la palabra: si los borras, se rompe.
  // Aquí el destino estaba servido en el propio mensaje, en español: la Í de
  // ENVÍO y la É de MÉXICO son dos acentos, dos puntos, en el eje de lectura.
  // Bórralos y queda "ENVIO A TODO MEXICO", que está mal escrito. La prueba
  // pasa: no son adorno de tránsito, son ortografía.
  const ac = tramo(tiempo, T.acentos);
  const av = suave(ac);
  const zoom = mezcla(3.6, 1, k);
  const cyMira = mezcla(ALTO / 2, MIRA_Y, k);

  const destinos = [
    {
      // Corrido a la derecha: el centro de avance de la I no coincide con el
      // centro de su asta, y la tilde caía descuadrada sobre la letra.
      x: cenTit[iAcentoTitular(TITULAR)] + 5,
      y: Y_TITULAR - CAP_GRANDE - 11,
      largo: 16,
      grosor: 6,
      color: ORO,
      alfa: 1,
    },
    {
      x: cenBaj[I_ACENTO_BAJADA],
      y: Y_BAJADA - CAP_CHICA - 8,
      largo: 11,
      grosor: 4.3,
      color: HUESO,
      alfa: 0.62,
    },
  ];

  ctx.save();
  ctx.setLineDash([]);
  ctx.lineCap = "round";
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? 1 : -1;
    const d = destinos[i];
    const x = mezcla(Math.cos(angulo) * radio * s * zoom, d.x, av);
    const y = mezcla(cyMira + Math.sin(angulo) * radio * s * zoom, d.y, av);
    // Un segmento de longitud cero con remate redondo ES un punto. Al crecer
    // se convierte en la tilde: la misma primitiva hace las dos cosas, así que
    // no hay sustitución de un objeto por otro, hay transformación.
    const largo = d.largo * av;
    const inclina = -0.62;
    ctx.globalAlpha = mezcla(1, d.alfa, av);
    ctx.strokeStyle = ac > 0.001 ? mezclaColor(HUESO, d.color, av) : trazo;
    ctx.lineWidth = mezcla(8, d.grosor, av);
    ctx.beginPath();
    ctx.moveTo(x - (Math.cos(inclina) * largo) / 2, y - (Math.sin(inclina) * largo) / 2);
    ctx.lineTo(x + (Math.cos(inclina) * largo) / 2, y + (Math.sin(inclina) * largo) / 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* -------------------------------------------------------------- el lienzo */

export function RevealLuaser({ className = "", maxDescuento }: { className?: string; maxDescuento: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // La familia se lee del DOM en vez de escribirse a mano: next/font genera
    // un nombre distinto en cada build, y ponerlo fijo haría que el canvas
    // dibujara con el sustituto sin avisar.
    const sonda = document.createElement("span");
    sonda.className = "font-display";
    sonda.style.cssText = "position:absolute;visibility:hidden";
    document.body.appendChild(sonda);
    const familia = getComputedStyle(sonda).fontFamily || "sans-serif";
    sonda.remove();

    let w = 0;
    let h = 0;
    const mide = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const caja = canvas.getBoundingClientRect();
      w = caja.width;
      h = caja.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.scale(1, 1);
    };

    let raf = 0;
    let inicio = 0;
    let vivo = true;
    let terminado = false;

    const cuadro = (ahora: number) => {
      if (!vivo) return;
      if (!inicio) inicio = ahora;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = (ahora - inicio) / 1000;
      dibuja(ctx, t, w, h, { familia, reducido, wordmark, dpr, maxDescuento });
      if (t < DURACION) raf = requestAnimationFrame(cuadro);
      else terminado = true;
    };

    const resuelto = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dibuja(ctx, DURACION, w, h, { familia, reducido: true, wordmark, dpr, maxDescuento });
      terminado = true;
    };

    const arranca = () => {
      mide();

      // La animación se ve UNA vez por sesión. Quien vuelve al home desde una
      // ficha de producto ya la vio, y hacerle esperar otra vez el mensaje de
      // envío es cobrarle dos veces por lo mismo.
      let yaVista = false;
      try {
        yaVista = sessionStorage.getItem("luaser-reveal") === "1";
      } catch {
        // Modo privado o cookies bloqueadas: se anima, no se rompe.
      }

      if (reducido || yaVista) {
        resuelto();
        return;
      }
      try {
        sessionStorage.setItem("luaser-reveal", "1");
      } catch {
        /* sin persistencia, la animación igual corre */
      }

      inicio = 0;
      terminado = false;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(cuadro);
    };

    // NADA bloquea el primer pintado.
    //
    // Colgar el arranque de dos promesas dejaba el héroe TRANSPARENTE cuando
    // alguna se demoraba: medido, el lienzo se quedaba en cero píxeles
    // pintados. Una portada no puede depender de que una imagen llegue.
    //
    // El wordmark entra cuando llegue: cada fotograma lee la variable en el
    // momento de dibujar, así que aparece solo, y no hace falta reiniciar.
    let wordmark: HTMLCanvasElement | null = null;
    preparaWordmark().then((wm) => {
      wordmark = wm;
      // Si la animación ya había resuelto sin él, se repinta una vez con él.
      if (vivo && terminado) resuelto();
    });

    // A la tipografía sí se le espera, pero con tope: el texto no entra hasta
    // el segundo 1.45, así que medio segundo de margen sobra y, si la fuente
    // tarda más, es preferible animar con la sustituta que no animar nada.
    let arrancado = false;
    const arrancaUnaVez = () => {
      if (arrancado || !vivo) return;

      // En una pestaña de segundo plano el navegador CONGELA
      // requestAnimationFrame: medido, cero fotogramas. Arrancar ahí gastaría
      // la única reproducción de la sesión en una animación que nadie ve, y
      // dejaría el lienzo transparente mientras tanto. Y abrir la tienda en
      // una pestaña de fondo es de lo más común: es lo que hace media la gente
      // que llega desde un anuncio.
      //
      // Así que se pinta el estado resuelto —el mensaje se lee igual— y se
      // espera a que la pestaña se mire de verdad para animar.
      if (document.hidden) {
        mide();
        resuelto();
        return;
      }
      arrancado = true;
      arranca();
    };
    (document.fonts?.ready ?? Promise.resolve()).then(arrancaUnaVez);
    document.addEventListener("visibilitychange", arrancaUnaVez);
    const tope = window.setTimeout(arrancaUnaVez, 500);

    // Al redimensionar hay que repintar SIEMPRE: cambiar el tamaño del lienzo
    // lo borra.
    //
    // Repintar solo cuando la animación ya había terminado dejaba el héroe
    // completamente transparente —medido: cero píxeles pintados— si el cambio
    // de tamaño ocurría con el bucle a medias. Y eso pasa de verdad: el
    // navegador pausa requestAnimationFrame en pestañas de segundo plano, así
    // que quien abre la tienda en una pestaña que no está mirando y luego gira
    // el teléfono se encontraba la portada en blanco.
    const ro = new ResizeObserver(() => {
      mide();
      if (terminado) {
        resuelto();
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dibuja(ctx, inicio ? (performance.now() - inicio) / 1000 : 0, w, h, {
        familia,
        reducido,
        wordmark,
        maxDescuento,
        dpr,
      });
    });
    ro.observe(canvas);

    // Solo en desarrollo: permite pedir un fotograma exacto y sacarlo como
    // imagen, para revisar la animación en vez de juzgarla de memoria.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as Record<string, unknown>).__lsCaptura = (t: number) => {
        mide();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dibuja(ctx, t, w, h, { familia, reducido: false, wordmark, dpr, maxDescuento });
        return canvas.toDataURL("image/jpeg", 0.92);
      };
      (window as unknown as Record<string, unknown>).__lsDuracion = DURACION;
    }

    return () => {
      vivo = false;
      document.removeEventListener("visibilitychange", arrancaUnaVez);
      window.clearTimeout(tope);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
