"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMovimientoReducido } from "./use-en-vista";
import "./motion.css";

/**
 * El logo de Luaser se corta a láser trazo por trazo: mira (emisor, haz,
 * cruz, anillos segmentados) y luego el wordmark monolínea. El cabezal lleva
 * punta blanca, halo dorado y chispas en canvas; el trazo recién cortado
 * queda caliente (dorado) y se enfría a hueso. Al terminar, la pieza "cae"
 * del tablero con sombra, como una pieza liberada del sobrante.
 *
 * Todo el dibujo sale de las mismas coordenadas del `LogoMark` del sitio
 * (espacio 100×100, centro en 50,52), así que es el mismo logo, no un dibujo
 * parecido. Con `prefers-reduced-motion` se muestra directamente terminado.
 */

const ANCHO = 560;
const ALTO = 300;

/** Arco sobre el centro del logo (50,52), en grados, sentido horario. */
function arco(r: number, a0: number, a1: number) {
  const rad = (a: number) => (a * Math.PI) / 180;
  const x0 = 50 + r * Math.cos(rad(a0));
  const y0 = 52 + r * Math.sin(rad(a0));
  const x1 = 50 + r * Math.cos(rad(a1));
  const y1 = 52 + r * Math.sin(rad(a1));
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

const MIRA: { d: string; emisor?: boolean }[] = [
  { d: "M42 8 H58 V14 L52 20 H48 L42 14 Z", emisor: true },
  { d: "M50 20 L44 52 L56 52 Z" },
  { d: "M21 23 L79 81" },
  { d: "M79 23 L21 81" },
  ...[[-80, -10], [10, 80], [100, 170], [190, 260]].map(([a, b]) => ({ d: arco(32, a, b) })),
  ...[[-35, 35], [55, 125], [145, 215], [235, 305]].map(([a, b]) => ({ d: arco(24, a, b) })),
];

// Wordmark monolínea: seis letras de 64 de ancho sobre 100 de alto. La A
// lleva el asta larga que cruza la base, como en el logo real.
const LETRAS = [
  "M0 0 V100 H60",
  "M0 0 V70 A30 30 0 0 0 60 70 V0",
  "M-4 112 L36 0 L66 100 M16 66 H52",
  "M58 14 Q58 0 30 0 Q0 0 0 25 Q0 50 30 50 Q60 50 60 75 Q60 100 30 100 Q2 100 2 86",
  "M60 0 H0 V100 H60 M0 50 H46",
  "M0 100 V0 H36 A25 25 0 0 1 36 50 H0 M36 50 L64 100",
];

interface Chispa {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
  blanca: boolean;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function LaserCutLogo({
  className,
  duracion = 5200,
  /** Se incrementa para volver a cortar (botón "Repetir"). */
  repeticion = 0,
  onFin,
}: {
  className?: string;
  duracion?: number;
  repeticion?: number;
  onFin?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const haloRef = useRef<SVGCircleElement>(null);
  const [done, setDone] = useState(false);
  const reducido = useMovimientoReducido();

  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    const tip = tipRef.current;
    const halo = haloRef.current;
    if (!wrap || !svg || !canvas || !tip || !halo) return;

    const trazos = Array.from(svg.querySelectorAll<SVGPathElement>("path[data-trazo]"));
    const largos = trazos.map((p) => p.getTotalLength());
    const total = largos.reduce((a, b) => a + b, 0);

    setDone(false);
    trazos.forEach((p, i) => {
      p.classList.remove("lz-hot");
      p.style.strokeDasharray = `${largos[i]}`;
      p.style.strokeDashoffset = `${largos[i]}`;
    });
    tip.style.opacity = "0";
    halo.style.opacity = "0";

    const terminar = () => {
      trazos.forEach((p) => {
        p.classList.remove("lz-hot");
        p.style.strokeDashoffset = "0";
      });
      tip.style.opacity = "0";
      halo.style.opacity = "0";
      setDone(true);
      onFin?.();
    };

    if (reducido) {
      terminar();
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      terminar();
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const medir = () => {
      const r = wrap.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return r;
    };
    let rect = medir();
    const onResize = () => {
      rect = medir();
    };
    window.addEventListener("resize", onResize);

    let chispas: Chispa[] = [];
    let raf = 0;
    let acabado = false;
    const t0 = performance.now();

    const frame = (now: number) => {
      const u = Math.min(1, (now - t0) / duracion);
      const dibujado = easeInOut(u) * total;
      let acumulado = 0;
      let actual: SVGPathElement | null = null;
      let largoActual = 0;
      for (let i = 0; i < trazos.length; i++) {
        const p = trazos[i];
        const len = largos[i];
        if (dibujado >= acumulado + len) {
          p.style.strokeDashoffset = "0";
          p.classList.remove("lz-hot");
        } else if (dibujado > acumulado) {
          largoActual = dibujado - acumulado;
          p.style.strokeDashoffset = `${len - largoActual}`;
          p.classList.add("lz-hot");
          actual = p;
        } else {
          p.style.strokeDashoffset = `${len}`;
          p.classList.remove("lz-hot");
        }
        acumulado += len;
      }

      ctx.clearRect(0, 0, rect.width, rect.height);
      if (actual) {
        const local = actual.getPointAtLength(largoActual);
        const pt = svg.createSVGPoint();
        pt.x = local.x;
        pt.y = local.y;
        const m = actual.getCTM();
        const q = m ? pt.matrixTransform(m) : pt;
        tip.setAttribute("cx", `${q.x}`);
        tip.setAttribute("cy", `${q.y}`);
        tip.style.opacity = "1";
        halo.setAttribute("cx", `${q.x}`);
        halo.setAttribute("cy", `${q.y}`);
        halo.style.opacity = `${0.18 + Math.random() * 0.12}`;
        const px = q.x * (rect.width / ANCHO);
        const py = q.y * (rect.height / ALTO);
        for (let k = 0; k < 3; k++) {
          const a = Math.random() * Math.PI * 2;
          const v = 0.6 + Math.random() * 2.2;
          chispas.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, vida: 1, blanca: Math.random() < 0.5 });
        }
      }
      for (let i = chispas.length - 1; i >= 0; i--) {
        const s = chispas[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.vida -= 0.035;
        if (s.vida <= 0) {
          chispas.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.vida;
        ctx.fillStyle = s.blanca ? "#FFFFFF" : "#F5AF95";
        const tam = s.vida > 0.6 ? 2 : 1.4;
        ctx.fillRect(s.x, s.y, tam, tam);
      }
      ctx.globalAlpha = 1;

      if (u >= 1 && !acabado) {
        acabado = true;
        terminar();
      }
      if (u < 1 || chispas.length) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      chispas = [];
    };
    // onFin se lee en el cierre; no debe reiniciar el corte si cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duracion, repeticion, reducido]);

  const grid: JSX.Element[] = [];
  for (let x = 0; x <= ANCHO; x += 40) grid.push(<line key={`x${x}`} x1={x} y1={0} x2={x} y2={ALTO} />);
  for (let y = 0; y <= ALTO; y += 40) grid.push(<line key={`y${y}`} x1={0} y1={y} x2={ANCHO} y2={y} />);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "lz-cut relative w-full overflow-hidden [aspect-ratio:560/300] [background:radial-gradient(ellipse_at_50%_30%,#1A1D23_0%,#16181C_55%,#0B0C0E_100%)]",
        done && "lz-done",
        className
      )}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        role="img"
        aria-label="Logo de Luaser cortándose a láser"
      >
        <g className="lz-grid" aria-hidden="true">{grid}</g>
        <g className="lz-pieza">
          <g transform="translate(280 78) scale(1.45)">
            {MIRA.map((t, i) => (
              <path
                key={i}
                d={t.d}
                data-trazo=""
                transform="translate(-50 -52)"
                className={t.emisor ? "lz-emisor" : undefined}
              />
            ))}
          </g>
          <g className="lz-letras" transform="translate(52 182) scale(0.92)">
            {LETRAS.map((d, i) => (
              <path key={i} d={d} data-trazo="" transform={`translate(${i * 86} 0)`} />
            ))}
          </g>
        </g>
        <circle ref={haloRef} className="lz-halo" r={16} />
        <circle ref={tipRef} className="lz-tip" r={2.6} />
      </svg>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
