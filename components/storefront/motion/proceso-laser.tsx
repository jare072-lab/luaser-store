"use client";

import { useEffect, useRef, useState } from "react";

const PASOS = [
  {
    titulo: "Diseño",
    texto: "Mándanos tu logo o tus medidas",
    icono: (
      <>
        <rect x="8" y="10" width="32" height="24" rx="2" />
        <path d="M14 30 L22 20 L28 26 L34 18" />
        <line x1="16" y1="40" x2="32" y2="40" />
      </>
    ),
  },
  {
    titulo: "Corte",
    texto: "Láser CO2 sobre acrílico o MDF",
    icono: (
      <>
        <path d="M20 6 H28 V11 L25 15 H23 L20 11 Z" />
        <line x1="24" y1="15" x2="24" y2="28" />
        <path d="M8 40 H40" />
        <path d="M14 34 L24 28 L34 34" />
      </>
    ),
  },
  {
    titulo: "Grabado",
    texto: "Detalle fino y texto esmerilado",
    icono: (
      <>
        <rect x="8" y="8" width="32" height="32" rx="3" />
        <path d="M16 30 L24 18 L32 30" />
        <line x1="19" y1="26" x2="29" y2="26" />
      </>
    ),
  },
  {
    titulo: "Envío",
    texto: "Empacado y enviado a todo México",
    icono: (
      <>
        <path d="M6 16 H30 V34 H6 Z" />
        <path d="M30 22 H38 L42 28 V34 H30" />
        <circle cx="13" cy="36" r="3" />
        <circle cx="35" cy="36" r="3" />
      </>
    ),
  },
];

/**
 * Del archivo al envío, con el haz recorriendo cada paso.
 *
 * Un punto de luz viaja por el riel y va encendiendo cada etapa; los iconos se dibujan a
 * trazo cuando les toca. Se dispara al entrar en pantalla, no al cargar la página, para que
 * el visitante lo vea empezar y no se lo encuentre a medias.
 */
export function ProcesoLaser() {
  const raiz = useRef<HTMLDivElement>(null);
  const [avance, setAvance] = useState(0);
  const [corriendo, setCorriendo] = useState(false);

  useEffect(() => {
    const caja = raiz.current;
    if (!caja) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAvance(1);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setCorriendo(true);
        const D = 3600;
        const t0 = performance.now();
        const suave = (t: number) => 1 - Math.pow(1 - t, 3);
        const paso = (ahora: number) => {
          const u = Math.min(1, (ahora - t0) / D);
          setAvance(suave(u));
          if (u < 1) raf = requestAnimationFrame(paso);
          else setCorriendo(false);
        };
        raf = requestAnimationFrame(paso);
      },
      { threshold: 0.3 }
    );
    io.observe(caja);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const paradas = [0, 1 / 3, 2 / 3, 1];

  return (
    <section className="mx-auto max-w-content px-4 sm:px-6 py-14">
      <div ref={raiz} className="rounded-[20px] border border-ink-border bg-ink-soft px-5 pb-10 pt-12 sm:px-9">
        <p className="mb-8 text-center font-body text-[11px] font-medium uppercase tracking-[0.22em] text-gold">
          Cómo funciona
        </p>
        {/* Riel */}
        <div className="relative mx-[7%] h-px bg-ink-border">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#B8654C] to-[#F5AF95]"
            style={{ width: `${avance * 100}%` }}
          />
          <span
            className="absolute top-1/2 -ml-[4.5px] -mt-[4.5px] h-[9px] w-[9px] rounded-full bg-white shadow-[0_0_9px_2px_#F5AF95,0_0_24px_6px_rgba(232,146,122,.45)]"
            style={{ left: `${avance * 100}%`, opacity: corriendo ? 1 : 0 }}
          />
        </div>
        <div className="-mt-px grid grid-cols-2 md:grid-cols-4">
          {PASOS.map((p, i) => {
            const on = avance >= paradas[i] - 0.02;
            return (
              <div key={p.titulo} className="relative px-2 pt-8 text-center">
                <span
                  className={`absolute left-1/2 top-[-5px] -ml-[5.5px] h-[11px] w-[11px] rounded-full border transition-all duration-300 ${
                    on
                      ? "border-[#F5AF95] bg-gold shadow-[0_0_0_4px_rgba(232,146,122,.16)]"
                      : "border-ink-border bg-ink-soft"
                  }`}
                />
                <svg
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                  className="mx-auto mb-3.5 mt-2 block h-11 w-11"
                  style={{
                    fill: "none",
                    stroke: on ? "#FAF9F6" : "#6E6A63",
                    strokeWidth: 1.4,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    transition: "stroke 320ms ease",
                  }}
                >
                  {/* El trazo se dibuja al encenderse el paso, no antes. */}
                  <g
                    style={{
                      strokeDasharray: 200,
                      strokeDashoffset: on ? 0 : 200,
                      transition: "stroke-dashoffset 900ms ease",
                    }}
                  >
                    {p.icono}
                  </g>
                </svg>
                <h3
                  className={`font-display text-lg transition-colors duration-300 ${
                    on ? "text-bone" : "text-graystone-500"
                  }`}
                >
                  {p.titulo}
                </h3>
                <p
                  className="mt-2 font-body text-xs text-graystone-500 transition-all duration-[400ms]"
                  style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(5px)" }}
                >
                  {p.texto}
                </p>
                <span
                  className="mt-3 inline-block font-body text-[10px] uppercase tracking-[0.2em] text-gold transition-opacity delay-200 duration-[400ms]"
                  style={{ opacity: on ? 1 : 0 }}
                >
                  Paso {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
