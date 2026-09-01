"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PlacaProducto } from "@/lib/shopify/placas";

/**
 * Selector de placas de acrilico: familia, color, medida y cantidad, con el
 * precio por placa moviendose en vivo.
 *
 * Habla el lenguaje de galeria oscura que aprobo el cliente (ver
 * public/tmp-carousel/design-system-sitio.md): negro puro, radio cero, dos
 * pesos tipograficos, un solo acento y el vacio como estructura. Por eso no
 * reusa Button ni las tarjetas del resto del sitio, que son de pildora.
 *
 * El unico color cromatico fuerte de la seccion son las propias muestras de
 * acrilico: son producto, no interfaz.
 */

/** Hex reales del catalogo, para pintar la muestra sin cargar 22 imagenes. */
const TINTA: Record<string, string> = {
  Negro: "#1A1A1A",
  Blanco: "#F7F7F3",
  Amarillo: "#F2C230",
  Rosa: "#F08BB4",
  Celeste: "#7EC8E8",
  Azul: "#1F4FA8",
  Verde: "#2E9E4F",
  Rojo: "#D32F2F",
  Naranja: "#F07A1F",
  "Rosa Mexicano": "#E0218A",
  Plata: "#C8CDD2",
  Oro: "#C9A94E",
  "Rosa Gold": "#D9A188",
  Morado: "#8B5FBF",
  "Naranja Fosfo": "#FF6B1A",
  "Verde Fluorescente": "#7FE05A",
  "Amarillo Fluorescente": "#EDF23B",
  "Rojo Traslúcido": "#E03A3A",
  Humo: "#6B6B6B",
};

/** El cristal no tiene color: su eje es el espesor, y se pinta como vidrio. */
const CRISTAL = "#CFE0E4";

/**
 * Alto en pixeles del canto dibujado en la muestra de cristal.
 *
 * El catalogo va de 2 a 25 mm. Se mapea a 2-20 px porque el salto lineal puro
 * dejaba las delgadas invisibles: lo que importa es que 25 mm se vea claramente
 * mas gruesa que 3 mm, no la proporcion exacta.
 */
function grosorEnPx(valor: string) {
  const mm = Number(valor.replace(",", ".").match(/[\d.]+/)?.[0] ?? 3);
  return Math.round(2 + (Math.min(mm, 25) / 25) * 18);
}

/**
 * Tamano en pixeles de la cara de la muestra, derivado de la medida elegida.
 *
 * "Medida" es el control que mas mueve el precio —de $55.80 a $113.80— y era
 * el unico mudo: la cara media 80x80 igual en 20x30, 30x30 y 40x40. Ahora la
 * proporcion es la real (20x30 sale vertical, 40x40 sale cuadrada y mayor) y
 * se anima con la misma regla que el espesor: 300 ms, una sola direccion.
 *
 * 40 cm mapea a 88 px, que es el techo; el resto escala proporcional.
 */
function caraEnPx(medida: string) {
  const [ancho, alto] = (medida.match(/\d+/g) ?? ["30", "30"]).map(Number);
  const escala = 88 / 40;
  return { w: Math.round(ancho * escala), h: Math.round(alto * escala) };
}

const pesos = (n: number) => Number(n.toFixed(2)).toLocaleString("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function PlacasSection({ productos }: { productos: PlacaProducto[] }) {
  const [iFam, setIFam] = useState(0);
  const familia = productos[iFam];

  const [color, setColor] = useState<string | null>(null);
  const [medida, setMedida] = useState<string | null>(null);
  const [pack, setPack] = useState<string | null>(null);

  const colorSel = color && familia?.colores.includes(color) ? color : familia?.colores[0];
  const medidaSel = medida && familia?.medidas.includes(medida) ? medida : familia?.medidas[0];
  const packSel = pack && familia?.packs.includes(pack) ? pack : familia?.packs[0];

  const variante = useMemo(
    () =>
      familia?.variantes.find(
        (v) => v.color === colorSel && v.medida === medidaSel && v.pack === packSel
      ),
    [familia, colorSel, medidaSel, packSel]
  );

  /** Cuantas placas trae el pack elegido, para el precio unitario. */
  const piezas = packSel ? Number(packSel.match(/\d+/)?.[0] ?? 1) : 1;
  const porPlaca = variante ? variante.precio / piezas : 0;

  /** La misma variante en pieza suelta, para mostrar cuanto baja el volumen. */
  const suelta = useMemo(
    () =>
      familia?.variantes.find(
        (v) => v.color === colorSel && v.medida === medidaSel && v.pack === "1 pieza"
      ),
    [familia, colorSel, medidaSel]
  );
  const ahorro =
    suelta && porPlaca > 0 && porPlaca < suelta.precio
      ? Math.round((1 - porPlaca / suelta.precio) * 100)
      : 0;

  if (!familia) return null;

  const esCristal = familia.ejeColor === "Espesor";
  const cara = caraEnPx(medidaSel ?? "30 x 30 cm");

  return (
    <section id="placas" className="bg-black">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-[120px] sm:py-[240px]">
        <header className="max-w-[62ch]">
          <p className="font-body text-[16px] font-normal tracking-[-0.01em] text-[#A0A0A0]">
            Material
          </p>
          <h2 className="mt-4 font-body text-[44px] font-light leading-none tracking-[-0.02em] text-white sm:text-[64px] lg:text-[80px]">
            Placas de acrílico
          </h2>
          <p className="mt-8 font-body text-[16px] font-normal leading-[1.25] tracking-[-0.01em] text-[#A0A0A0]">
            Elige el material, el color y la medida. El precio por placa se mueve solo.
          </p>
        </header>

        {/* Familia — texto, no pestañas con fondo */}
        <div className="mt-[120px] flex flex-wrap gap-x-8 gap-y-4">
          {productos.map((p, i) => {
            const activa = i === iFam;
            return (
              <button
                key={p.id}
                onClick={() => { setIFam(i); setColor(null); setMedida(null); setPack(null); }}
                aria-pressed={activa}
                className={[
                  "font-body text-[16px] font-normal tracking-[-0.01em] transition-colors duration-300",
                  activa ? "text-white" : "text-[#484848] hover:text-[#A0A0A0]",
                ].join(" ")}
              >
                {p.titulo.replace(/^Placas de Acrílico\s*/i, "") || "Cristal"}
              </button>
            );
          })}
        </div>

        <div className="mt-[120px] grid gap-[120px] lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* Muestras */}
          <div>
            <p className="font-body text-[16px] font-normal tracking-[-0.01em] text-[#A0A0A0]">
              {familia.ejeColor}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {familia.colores.map((c) => {
                const activo = c === colorSel;
                const hex = esCristal ? CRISTAL : TINTA[c] ?? "#484848";
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    aria-pressed={activo}
                    title={c}
                    className="group flex flex-col gap-3 transition-opacity duration-300"
                  >
                    <span
                      className="relative block transition-[width,height] duration-300 motion-reduce:transition-none"
                      style={{
                        width: cara.w,
                        height: cara.h,
                        // La translucidez va en el color y NO en opacity: con
                        // opacity en el elemento, el canto de espesor heredaba
                        // el 55% y quedaba invisible sobre la propia muestra.
                        backgroundColor: esCristal ? 'rgba(207,224,228,0.5)' : hex,
                        outline: activo ? "1px solid #FFFFFF" : "1px solid #484848",
                        outlineOffset: activo ? "5px" : "0px",
                      }}
                    >
                      {/* El cristal no tiene color: su variable es el espesor.
                          Diez cuadros idénticos no dicen nada, así que el canto
                          inferior crece con los milímetros y la muestra pasa a
                          comunicar lo único que de verdad cambia. */}
                      {esCristal && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 block bg-white transition-[height] duration-300"
                          style={{ height: `${grosorEnPx(c)}px` }}
                        />
                      )}
                    </span>
                    <span
                      className={[
                        "max-w-[80px] text-left font-body text-[16px] font-normal leading-[1.25] tracking-[-0.01em] transition-colors duration-300",
                        activo ? "text-white" : "text-[#484848] group-hover:text-[#A0A0A0]",
                      ].join(" ")}
                    >
                      {c}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-[120px] grid gap-[120px] sm:grid-cols-2 sm:gap-16">
              <div>
                <p className="font-body text-[16px] font-normal tracking-[-0.01em] text-[#A0A0A0]">
                  Medida
                </p>
                <div className="mt-8 flex flex-col items-start gap-4">
                  {familia.medidas.map((m) => {
                    const activo = m === medidaSel;
                    return (
                      <button
                        key={m}
                        onClick={() => setMedida(m)}
                        aria-pressed={activo}
                        className={[
                          "font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] transition-colors duration-300",
                          activo ? "text-white" : "text-[#484848] hover:text-[#A0A0A0]",
                        ].join(" ")}
                      >
                        {m.replace(" cm", "")}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="font-body text-[16px] font-normal tracking-[-0.01em] text-[#A0A0A0]">
                  Cantidad
                </p>
                <div className="mt-8 flex flex-col items-start gap-4">
                  {familia.packs.map((k) => {
                    const activo = k === packSel;
                    return (
                      <button
                        key={k}
                        onClick={() => setPack(k)}
                        aria-pressed={activo}
                        className={[
                          "font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] transition-colors duration-300",
                          activo ? "text-white" : "text-[#484848] hover:text-[#A0A0A0]",
                        ].join(" ")}
                      >
                        {k}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Precio */}
          <div className="lg:w-[380px] lg:border-l lg:border-[#484848] lg:pl-16">
            {/* La unidad va PEGADA al numero, no como etiqueta gris flotando
                arriba. Con "Por placa" en 16px gris encima y el total del
                pedido en 16px gris abajo, las dos lineas pesaban igual y nada
                anclaba el numero de 80px: se podia leer como el precio del
                pedido completo. La unidad en blanco y en la misma linea base
                cierra esa lectura sin meter color ni insignias, que el
                sistema no permite.

                Nota de precision: el contenedor es items-baseline, pero en la
                columna de 380px un precio largo como $155.80 no cabe junto a
                "por placa" y las dos piezas se apilan. Se dejo asi a proposito:
                apiladas siguen leyendose como una sola unidad porque comparten
                color y no hay hueco entre ellas, y forzar una linea obligaria a
                achicar el numero, que es lo unico que no se puede achicar. */}
            <p
              key={`${colorSel}-${medidaSel}-${packSel}`}
              className="flex flex-wrap items-baseline gap-x-4 font-body animate-precio motion-reduce:animate-none"
            >
              <span className="text-[64px] font-light leading-none tracking-[-0.02em] text-white lg:text-[80px]">
                ${pesos(porPlaca)}
              </span>
              <span className="text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white">
                por placa
              </span>
            </p>

            <div className="mt-8 flex flex-col gap-2">
              <p className="font-body text-[16px] font-normal leading-[1.25] tracking-[-0.01em] text-[#A0A0A0]">
                {variante
                  ? `El pedido de ${packSel} cuesta $${pesos(variante.precio)}`
                  : "Esa combinación no está disponible"}
              </p>
              {ahorro > 0 && (
                <p className="font-body text-[16px] font-normal leading-[1.25] tracking-[-0.01em] text-[#A0A0A0]">
                  {ahorro}% menos que comprándola suelta
                </p>
              )}
            </div>

            <div className="mt-[120px] flex flex-col items-start gap-6">
              <Link
                href={`/producto/${familia.handle}`}
                className="group inline-flex items-center gap-3 font-body text-[16px] font-normal tracking-[-0.01em] text-white"
              >
                <span
                  aria-hidden="true"
                  className="block h-1.5 w-1.5 shrink-0 bg-[#E4002B] transition-transform duration-300 group-hover:translate-x-1"
                />
                Ver {familia.titulo.replace(/^Placas de Acrílico\s*/i, "").toLowerCase() || "cristal"}
              </Link>
              <Link
                href="/coleccion/placas-de-acrilico"
                className="font-body text-[16px] font-normal tracking-[-0.01em] text-[#A0A0A0] transition-colors duration-300 hover:text-white"
              >
                Ver las cinco familias
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-[120px] border-t border-[#484848] pt-8 font-body text-[16px] font-normal leading-[1.25] tracking-[-0.01em] text-[#A0A0A0]">
          Producción en 1 día hábil. Envío por Estafeta a todo México.
        </p>
      </div>
    </section>
  );
}
