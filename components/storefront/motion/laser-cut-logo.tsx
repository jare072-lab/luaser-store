"use client";

import { useEffect, useRef } from "react";
import { CONTORNOS, LOGO_D, LOGO_VIEWBOX } from "@/lib/logo-paths";

/**
 * El logotipo cortándose a láser, trazo por trazo.
 *
 * El cabezal recorre el contorno REAL de la marca —el mismo archivo que entra a la
 * cortadora— con chispas en la punta y el trazo caliente enfriándose detrás. Al terminar,
 * la pieza se libera del tablero: los contornos se apagan y aparece el relleno.
 *
 * El relleno va en un <path> aparte con fill-rule="evenodd" y no en los contornos que se
 * animan: rellenar cada contorno por su cuenta taparía los huecos de las letras.
 *
 * Arranca al entrar en pantalla, una sola vez, y respeta prefers-reduced-motion mostrando
 * el estado final sin animar.
 */
export function LaserCutLogo({ className = "" }: { className?: string }) {
  const raiz = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const caja = raiz.current;
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    if (!caja || !svg || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const trazos = Array.from(svg.querySelectorAll<SVGPathElement>("path[data-corte]"));
    const largos = trazos.map((p) => p.getTotalLength());
    const total = largos.reduce((a, b) => a + b, 0);
    trazos.forEach((p, i) => {
      p.style.strokeDasharray = String(largos[i]);
      p.style.strokeDashoffset = String(largos[i]);
    });

    const punta = svg.querySelector<SVGCircleElement>("[data-punta]");
    const halo = svg.querySelector<SVGCircleElement>("[data-halo]");
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let chispas: { x: number; y: number; vx: number; vy: number; vida: number; blanca: boolean }[] = [];

    const terminar = () => {
      trazos.forEach((p) => {
        p.style.strokeDashoffset = "0";
        p.style.strokeOpacity = "0";
      });
      if (punta) punta.style.opacity = "0";
      if (halo) halo.style.opacity = "0";
      caja.dataset.listo = "1";
    };

    if (reduce) {
      terminar();
      return;
    }

    const DUR = 6400;
    const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const medir = () => {
      const r = caja.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      return r;
    };

    const correr = () => {
      medir();
      const t0 = performance.now();
      const paso = (ahora: number) => {
        const u = Math.min(1, (ahora - t0) / DUR);
        const hecho = suave(u) * total;
        let acc = 0;
        let actual: SVGPathElement | null = null;
        let largoActual = 0;
        for (let i = 0; i < trazos.length; i++) {
          const p = trazos[i];
          const len = largos[i];
          if (hecho >= acc + len) {
            p.style.strokeDashoffset = "0";
            delete p.dataset.caliente;
          } else if (hecho > acc) {
            largoActual = hecho - acc;
            p.style.strokeDashoffset = String(len - largoActual);
            p.dataset.caliente = "1";
            actual = p;
          } else {
            p.style.strokeDashoffset = String(len);
            delete p.dataset.caliente;
          }
          acc += len;
        }

        const r = caja.getBoundingClientRect();
        ctx?.clearRect(0, 0, r.width, r.height);
        if (actual && ctx) {
          const pt = actual.getPointAtLength(largoActual);
          const px = pt.x * (r.width / 560);
          const py = pt.y * (r.height / 300);
          if (punta) {
            punta.setAttribute("cx", String(pt.x));
            punta.setAttribute("cy", String(pt.y));
            punta.style.opacity = "1";
          }
          if (halo) {
            halo.setAttribute("cx", String(pt.x));
            halo.setAttribute("cy", String(pt.y));
            halo.style.opacity = String(0.14 + Math.random() * 0.1);
          }
          for (let k = 0; k < 2; k++) {
            const a = Math.random() * Math.PI * 2;
            const sp = 0.5 + Math.random() * 1.9;
            chispas.push({ x: px, y: py, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.5, vida: 1, blanca: Math.random() < 0.45 });
          }
        }
        if (ctx) {
          for (let i = chispas.length - 1; i >= 0; i--) {
            const s = chispas[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.08;
            s.vida -= 0.038;
            if (s.vida <= 0) {
              chispas.splice(i, 1);
              continue;
            }
            ctx.globalAlpha = s.vida * 0.9;
            ctx.fillStyle = s.blanca ? "#FFFFFF" : "#F5AF95";
            const t = s.vida > 0.6 ? 1.8 : 1.2;
            ctx.fillRect(s.x, s.y, t, t);
          }
          ctx.globalAlpha = 1;
        }
        if (u < 1 || chispas.length) raf = requestAnimationFrame(paso);
        if (u >= 1 && !caja.dataset.listo) terminar();
      };
      raf = requestAnimationFrame(paso);
    };

    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          io.disconnect();
          correr();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(caja);
    const alRedimensionar = () => { if (!caja.dataset.listo) medir(); };
    window.addEventListener("resize", alRedimensionar);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", alRedimensionar);
    };
  }, []);

  return (
    <div
      ref={raiz}
      className={`group relative aspect-[560/300] w-full overflow-hidden rounded-[20px] border border-ink-border [background:radial-gradient(ellipse_at_50%_38%,#171A1F_0%,#131519_58%,#0B0C0E_100%)] ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox={LOGO_VIEWBOX}
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-label="El logotipo de Luaser cortándose a láser"
      >
        <g className="[&_line]:stroke-[#1A1D22]" aria-hidden="true">
          {Array.from({ length: 15 }, (_, i) => (
            <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={300} strokeWidth={1} />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 40} x2={560} y2={i * 40} strokeWidth={1} />
          ))}
        </g>
        <g className="transition-[transform,filter] duration-[800ms] ease-out group-data-[listo]:translate-y-[4px] group-data-[listo]:[filter:drop-shadow(0_12px_14px_rgba(0,0,0,.6))]">
          {CONTORNOS.map((d, i) => (
            <path
              key={i}
              d={d}
              data-corte=""
              fill="none"
              strokeWidth={1.15}
              strokeLinejoin="round"
              className="stroke-bone transition-[stroke-opacity] duration-[650ms] delay-200 data-[caliente]:stroke-[#F5AF95]"
            />
          ))}
          {/* El relleno va aparte y con evenodd: es lo que deja las letras caladas. */}
          <path
            d={LOGO_D}
            fillRule="evenodd"
            className="fill-bone opacity-0 transition-opacity duration-[650ms] delay-200 group-data-[listo]:opacity-100"
          />
        </g>
        <circle data-halo r={15} className="fill-gold opacity-0 mix-blend-screen" />
        <circle
          data-punta
          r={2.3}
          className="fill-white opacity-0 [filter:drop-shadow(0_0_5px_#fff)_drop-shadow(0_0_13px_#E8927A)]"
        />
      </svg>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  );
}
