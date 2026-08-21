"use client";

import { useEffect, useState } from "react";

/**
 * El porcentaje sube desde cero en vez de aparecer ya escrito.
 *
 * Es el efecto de sorpresa: el ojo sigue el número mientras crece y llega al
 * final justo cuando termina el rebote de la escala. Dura poco más de un
 * segundo y se detiene: no es una animación perpetua consumiendo CPU.
 *
 * Con `prefers-reduced-motion` no cuenta: muestra el número final de una vez.
 */
export function NumeroQueSube({ objetivo, duracion = 1100 }: { objetivo: number; duracion?: number }) {
  const [valor, setValor] = useState(objetivo);

  useEffect(() => {
    const prefiereQuieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefiereQuieto) return;

    setValor(0);
    let raf = 0;
    const inicio = performance.now();
    // Misma curva de salida que usan las entradas del banner.
    const suaviza = (x: number) => 1 - Math.pow(1 - x, 3);

    const paso = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / duracion);
      setValor(Math.round(suaviza(p) * objetivo));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    // Red de seguridad: el navegador PAUSA requestAnimationFrame mientras la
    // pestaña no está visible. Sin esto, quien abre la tienda en una pestaña de
    // fondo y cambia a ella después se queda viendo "Hasta 0% de descuento".
    const red = setTimeout(() => setValor(objetivo), duracion + 250);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(red);
    };
  }, [objetivo, duracion]);

  // El ancho no cambia mientras sube: sin esto el titular brinca de posición
  // en cada dígito nuevo y arrastra al resto de la línea.
  return <span className="tabular-nums">{valor}%</span>;
}

function partes(msRestantes: number) {
  const s = Math.max(0, Math.floor(msRestantes / 1000));
  return {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    minutos: Math.floor((s % 3600) / 60),
    segundos: s % 60,
  };
}

/**
 * Cuenta regresiva hasta una fecha real.
 *
 * Cuando la fecha pasa, el componente DESAPARECE en vez de mostrar ceros o
 * reiniciarse. Una promoción vencida que sigue anunciándose cuesta más que no
 * anunciar nada.
 */
export function CuentaRegresiva({ hasta }: { hasta: string }) {
  const limite = new Date(hasta).getTime();
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRestante(limite - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [limite]);

  // Hasta que el cliente calcula la hora no se pinta nada, para que el servidor
  // y el navegador no discrepen.
  if (restante === null || restante <= 0) return null;

  const { dias, horas, minutos, segundos } = partes(restante);
  const bloques: [number, string][] = [
    [dias, "días"],
    [horas, "hrs"],
    [minutos, "min"],
    [segundos, "seg"],
  ];

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-terracotta/40 bg-terracotta/10 px-5 py-2.5">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse-dot motion-reduce:animate-none"
      />
      <span className="font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
        Termina en
      </span>
      <span className="flex items-baseline gap-2">
        {bloques.map(([n, etiqueta]) => (
          <span key={etiqueta} className="flex items-baseline gap-1">
            <span className="font-display text-lg leading-none tabular-nums text-bone">
              {String(n).padStart(2, "0")}
            </span>
            <span className="font-body text-[10px] uppercase text-graystone-300">{etiqueta}</span>
          </span>
        ))}
      </span>
    </div>
  );
}
