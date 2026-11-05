"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Número que sube con desaceleración al entrar en pantalla.
 *
 * Arranca una sola vez y respeta prefers-reduced-motion mostrando el número final de
 * entrada. El valor se renderiza también en el HTML inicial (`valor`), así que quien
 * llegue con JavaScript bloqueado ve la cifra, no un cero.
 */
export function CountUp({
  valor,
  prefijo = "",
  sufijo,
  etiqueta,
}: {
  valor: number;
  prefijo?: string;
  sufijo?: string;
  etiqueta: string;
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(valor);

  useEffect(() => {
    const caja = raiz.current;
    if (!caja) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const D = 1600;
        const t0 = performance.now();
        const paso = (ahora: number) => {
          const u = Math.min(1, (ahora - t0) / D);
          const e = 1 - Math.pow(2, -10 * u);
          setN(Math.round(valor * (u >= 1 ? 1 : e)));
          if (u < 1) raf = requestAnimationFrame(paso);
        };
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.4 }
    );
    io.observe(caja);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [valor]);

  return (
    <div ref={raiz}>
      <div className="font-display text-4xl leading-none text-bone [font-variant-numeric:tabular-nums] sm:text-5xl">
        {prefijo}
        {n}
        {sufijo && (
          <span className="ml-1.5 font-body text-[0.26em] font-medium uppercase tracking-[0.16em] text-gold">
            {sufijo}
          </span>
        )}
      </div>
      <p className="mt-3 max-w-[24ch] font-body text-xs text-graystone-300">{etiqueta}</p>
    </div>
  );
}
