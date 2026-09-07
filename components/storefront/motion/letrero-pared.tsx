"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_D, LOGO_VIEWBOX } from "@/lib/logo-paths";
import { TITUBEO } from "@/components/storefront/motion/titubeo";

/**
 * El logotipo montado en la pared y retroiluminado.
 *
 * La pieza asienta sobre el muro con la sombra de sus separadores, y entonces la luz de
 * atrás titubea y prende. El halo NO es un borrón redondo: son dos copias desenfocadas del
 * propio contorno, una cerca y otra lejos, que es como se ve un letrero montado a distancia
 * de la pared.
 *
 * El titubeo es el mismo patrón que usa la placa grabada, porque es la misma instalación.
 */

export function LetreroPared({ className = "" }: { className?: string }) {
  const raiz = useRef<HTMLDivElement>(null);
  const [montado, setMontado] = useState(false);
  const [encendido, setEncendido] = useState(false);

  useEffect(() => {
    const caja = raiz.current;
    if (!caja) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMontado(true);
      setEncendido(true);
      return;
    }
    const relojes: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setMontado(true);
        relojes.push(
          setTimeout(() => {
            TITUBEO.forEach(([ms, on]) => relojes.push(setTimeout(() => setEncendido(on), ms)));
          }, 1150)
        );
      },
      { threshold: 0.3 }
    );
    io.observe(caja);
    return () => {
      io.disconnect();
      relojes.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      ref={raiz}
      className={`relative grid aspect-[16/7] w-full place-items-center overflow-hidden rounded-[20px] border border-ink-border [background:radial-gradient(ellipse_at_50%_46%,#1C2026_0%,#101317_52%,#0B0C0E_100%)] ${className}`}
    >
      {/* Pared lisa con su vignette, no una cuadrícula. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,.035),rgba(255,255,255,0)_62%),linear-gradient(180deg,rgba(255,255,255,.012),rgba(0,0,0,.22))]"
      />
      <svg
        viewBox={LOGO_VIEWBOX}
        className="relative w-[74%] overflow-visible"
        aria-label="Logotipo de Luaser en acrílico retroiluminado"
      >
        <defs>
          <filter id="lp-halo-cerca" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="lp-halo-lejos" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id="lp-suave" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
          <linearGradient id="lp-faz" x1="0.08" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#FFFEFC" />
            <stop offset="40%" stopColor="#EAE5DC" />
            <stop offset="72%" stopColor="#D3CDC2" />
            <stop offset="100%" stopColor="#BEB8AC" />
          </linearGradient>
        </defs>
        <g>
          <path
            d={LOGO_D}
            fillRule="evenodd"
            fill="#E8927A"
            filter="url(#lp-halo-lejos)"
            style={{ opacity: encendido ? 0.8 : 0, transition: "opacity 110ms ease" }}
          />
          <path
            d={LOGO_D}
            fillRule="evenodd"
            fill="#E8927A"
            filter="url(#lp-halo-cerca)"
            style={{ opacity: encendido ? 0.95 : 0, transition: "opacity 110ms ease" }}
          />
        </g>
        {/* La pieza va despegada de la pared unos 20 mm: esta es la sombra de los separadores. */}
        <g transform="translate(3 9)" style={{ opacity: montado ? 1 : 0, transition: "opacity 900ms ease" }}>
          <path d={LOGO_D} fillRule="evenodd" fill="#000" opacity={0.5} filter="url(#lp-suave)" />
        </g>
        <g
          style={{
            opacity: montado ? 1 : 0,
            transform: montado ? "translateY(0)" : "translateY(-9px)",
            transition: "opacity 900ms ease, transform 900ms cubic-bezier(.2,.75,.25,1)",
          }}
        >
          <path
            d={LOGO_D}
            fillRule="evenodd"
            fill="url(#lp-faz)"
            stroke="rgba(255,255,255,.32)"
            strokeWidth={0.4}
          />
        </g>
      </svg>
    </div>
  );
}
