"use client";

import { useMemo, useState } from "react";

const PHONE = "528131092383";

export interface MaterialMedida {
  nombre: string;
  /** Precio por cm² de la placa suelta de 40 × 40 cm, sacado de Shopify. */
  precioCm2: number;
  /** Precio de la placa suelta más chica: nunca se cobra menos que eso. */
  minimo: number;
}

/**
 * Estimado para medidas especiales. No es un precio de catálogo: usa la tarifa
 * por cm² de la placa suelta de 40 × 40, que es la más barata por superficie,
 * y la confirma una persona por WhatsApp antes de cobrar.
 */
export function CalculadoraMedida({ materiales }: { materiales: MaterialMedida[] }) {
  // Arranca en cristal 3 mm, el que más se pide, no en el primero de la lista.
  const [material, setMaterial] = useState(() =>
    Math.max(0, materiales.findIndex((mat) => mat.nombre.endsWith(" 3 mm")))
  );
  const [ancho, setAncho] = useState(50);
  const [alto, setAlto] = useState(60);
  const [piezas, setPiezas] = useState(1);

  const m = materiales[material];
  const valido = ancho >= 5 && alto >= 5 && ancho <= 120 && alto <= 240 && piezas >= 1;

  const estimado = useMemo(() => {
    if (!m || !valido) return 0;
    const unitario = Math.max(m.minimo, Math.ceil(ancho * alto * m.precioCm2));
    return unitario * piezas;
  }, [m, ancho, alto, piezas, valido]);

  const mensaje = [
    "Hola, quiero cotizar acrílico cortado a la medida:",
    `• Material: ${m?.nombre}`,
    `• Medida: ${ancho} × ${alto} cm`,
    `• Piezas: ${piezas}`,
    `• Estimado en la web: $${estimado.toLocaleString("es-MX")}`,
  ].join("\n");

  const campo =
    "mt-1 w-full rounded-md border border-ink-border bg-ink px-3 py-2 font-body text-bone focus:border-gold focus:outline-none";

  return (
    <div className="rounded-xl border border-ink-border bg-ink-soft/40 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2 font-body text-sm text-graystone-300">
          Material
          <select
            className={campo}
            value={material}
            onChange={(e) => setMaterial(Number(e.target.value))}
          >
            {materiales.map((mat, i) => (
              <option key={mat.nombre} value={i}>
                {mat.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-sm text-graystone-300">
          Ancho (cm, máx. 120)
          <input
            type="number"
            min={5}
            max={120}
            className={campo}
            value={ancho}
            onChange={(e) => setAncho(Number(e.target.value))}
          />
        </label>
        <label className="font-body text-sm text-graystone-300">
          Alto (cm, máx. 240)
          <input
            type="number"
            min={5}
            max={240}
            className={campo}
            value={alto}
            onChange={(e) => setAlto(Number(e.target.value))}
          />
        </label>
        <label className="font-body text-sm text-graystone-300">
          Piezas
          <input
            type="number"
            min={1}
            className={campo}
            value={piezas}
            onChange={(e) => setPiezas(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-ink-border pt-6">
        <div>
          <p className="font-body text-sm text-graystone-300">Estimado</p>
          <p className="font-display text-4xl text-bone">
            {valido ? `$${estimado.toLocaleString("es-MX")}` : "—"}
          </p>
          <p className="mt-1 font-body text-xs text-graystone-500">
            Te confirmamos el precio final por WhatsApp antes de cobrar.
          </p>
        </div>
        <a
          href={`https://wa.me/${PHONE}?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!valido}
          className={`inline-flex items-center rounded-full bg-gold px-6 py-3 font-body font-semibold text-ink transition-opacity hover:opacity-90 ${valido ? "" : "pointer-events-none opacity-40"}`}
        >
          Cotizar esta medida
        </a>
      </div>
    </div>
  );
}
