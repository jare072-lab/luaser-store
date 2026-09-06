"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useEnVista, useMovimientoReducido } from "./use-en-vista";
import "./motion.css";

/**
 * Del archivo al envío: un punto de luz recorre el riel y va encendiendo cada
 * etapa; los iconos se dibujan a trazo cuando les toca. Se dispara al entrar
 * en pantalla, una sola vez.
 */
export interface PasoLaser {
  titulo: string;
  detalle: string;
  icono: ReactNode;
}

const ICONO = "lz-ico mx-auto mb-3 mt-1.5 block h-12 w-12";

export const PASOS_LUASER: PasoLaser[] = [
  {
    titulo: "Diseño",
    detalle: "Mándanos tu logo o medidas",
    icono: (
      <svg className={ICONO} viewBox="0 0 48 48" aria-hidden="true">
        <rect x="8" y="10" width="32" height="24" rx="2" />
        <path d="M14 30 L22 20 L28 26 L34 18" />
        <line x1="16" y1="40" x2="32" y2="40" />
      </svg>
    ),
  },
  {
    titulo: "Corte",
    detalle: "Láser CO2 sobre acrílico o MDF",
    icono: (
      <svg className={ICONO} viewBox="0 0 48 48" aria-hidden="true">
        <path d="M20 6 H28 V11 L25 15 H23 L20 11 Z" />
        <line x1="24" y1="15" x2="24" y2="28" />
        <path d="M8 40 H40" />
        <path d="M14 34 L24 28 L34 34" />
      </svg>
    ),
  },
  {
    titulo: "Grabado",
    detalle: "Detalle fino y texto esmerilado",
    icono: (
      <svg className={ICONO} viewBox="0 0 48 48" aria-hidden="true">
        <rect x="8" y="8" width="32" height="32" rx="3" />
        <path d="M16 30 L24 18 L32 30" />
        <line x1="19" y1="26" x2="29" y2="26" />
      </svg>
    ),
  },
  {
    titulo: "Envío",
    detalle: "Empacado y enviado a todo México",
    icono: (
      <svg className={ICONO} viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 16 H30 V34 H6 Z" />
        <path d="M30 22 H38 L42 28 V34 H30" />
        <circle cx="13" cy="36" r="3" />
        <circle cx="35" cy="36" r="3" />
      </svg>
    ),
  },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function ProcesoLaser({
  pasos = PASOS_LUASER,
  duracion = 3600,
  className,
  repeticion = 0,
}: {
  pasos?: PasoLaser[];
  duracion?: number;
  className?: string;
  repeticion?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useEnVista(ref, 0.35, repeticion);
  const reducido = useMovimientoReducido();
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    setProgreso(0);
    if (!visto) return;
    if (reducido) {
      setProgreso(1);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const u = Math.min(1, (now - t0) / duracion);
      setProgreso(easeOutCubic(u));
      if (u < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [visto, reducido, duracion, repeticion]);

  const n = pasos.length;
  const enCurso = progreso > 0 && progreso < 0.98;

  return (
    <div ref={ref} className={cn("lz-proc", className)}>
      <div className="relative mx-[6%] h-0.5 bg-ink-border">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-dark to-gold-bright"
          style={{ width: `${progreso * 100}%` }}
        />
        <div
          aria-hidden="true"
          className="lz-punto absolute top-1/2 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-white transition-opacity duration-300"
          style={{ left: `${progreso * 100}%`, opacity: enCurso ? 1 : 0 }}
        />
      </div>
      <ol className="-mt-0.5 grid grid-cols-2 gap-y-5 md:grid-cols-4">
        {pasos.map((p, i) => {
          const parada = n > 1 ? i / (n - 1) : 0;
          const on = progreso >= parada - 0.02;
          return (
            <li key={p.titulo} className={cn("relative px-2 pt-[26px] text-center", on && "lz-on")}>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -top-1.5 left-1/2 h-3.5 w-3.5 -ml-[7px] rounded-full border-2 transition-all duration-300",
                  on
                    ? "border-gold-bright bg-gold shadow-[0_0_0_5px_rgba(232,146,122,0.18)]"
                    : "border-ink-border bg-ink-soft"
                )}
              />
              {p.icono}
              <h3
                className={cn(
                  "m-0 font-display text-lg font-semibold transition-colors duration-300",
                  on ? "text-bone" : "text-graystone-500"
                )}
              >
                {p.titulo}
              </h3>
              <p
                className={cn(
                  "mt-1.5 font-body text-[13px] text-graystone-500 transition-all duration-[400ms]",
                  on ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
                )}
              >
                {p.detalle}
              </p>
              <span
                className={cn(
                  "mt-2.5 inline-block font-body text-[11px] uppercase tracking-[0.12em] text-pitch-light transition-opacity delay-200 duration-[400ms]",
                  on ? "opacity-100" : "opacity-0"
                )}
              >
                Paso {i + 1}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
