"use client";

import { useEffect, useRef } from "react";

interface Particle {
  tx: number;
  ty: number; // target (assembled) position
  sx: number;
  sy: number; // scattered position
  r: number;
  g: number;
  b: number;
  a: number;
}

// Canvas-based "assemble / disassemble" hover effect for a real product photo
// with its background removed. Hover = disintegrate into particles that keep
// the photo's real per-pixel color and stay inside frame (so the silhouette
// still reads); mouse leave = reassemble back into the clean photo.
//
// Proven as a standalone prototype first (public/tmp-carousel/particle-test.html,
// passed 3 rounds of design-loop craft review) before porting into this
// component — same particle math, ported to hover instead of global cursor Y
// since this now lives on one card in a grid, not the whole viewport.
export function ParticleSign({
  srcNoBg,
  alt,
  size = 640,
}: {
  srcNoBg: string;
  alt: string;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let raf = 0;
    let cancelled = false;
    let targetProgress = 0;
    let currentProgress = 0;

    const img = new Image();
    img.src = srcNoBg;
    img.onload = () => {
      if (cancelled) return;

      const STRIDE = 4;
      const DRAW_SCALE = 0.62;
      const drawSize = size * DRAW_SCALE;
      const offset = (size - drawSize) / 2;

      const sampleCanvas = document.createElement("canvas");
      sampleCanvas.width = size;
      sampleCanvas.height = size;
      const sctx = sampleCanvas.getContext("2d")!;
      sctx.drawImage(img, offset, offset, drawSize, drawSize);
      const imgData = sctx.getImageData(0, 0, size, size).data;

      const particles: Particle[] = [];
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      for (let y = 0; y < size; y += STRIDE) {
        for (let x = 0; x < size; x += STRIDE) {
          const idx = (y * size + x) * 4;
          const a = imgData[idx + 3];
          if (a < 40) continue;
          sumX += x;
          sumY += y;
          count++;
          particles.push({ tx: x, ty: y, sx: x, sy: y, r: imgData[idx], g: imgData[idx + 1], b: imgData[idx + 2], a: a / 255 });
        }
      }
      const cx = sumX / count;
      const cy = sumY / count;

      const SCATTER_SCALE = 0.42;
      const MARGIN = 6;
      for (const p of particles) {
        const dx = p.tx - cx;
        const dy = p.ty - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const jitter = 0.7 + Math.random() * 0.6;
        const sx = p.tx + (dx / dist) * (dist * SCATTER_SCALE) * jitter + (Math.random() - 0.5) * 10;
        const sy = p.ty + (dy / dist) * (dist * SCATTER_SCALE) * jitter + (Math.random() - 0.5) * 10;
        p.sx = Math.min(size - MARGIN, Math.max(MARGIN, sx));
        p.sy = Math.min(size - MARGIN, Math.max(MARGIN, sy));
      }

      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

      function render() {
        currentProgress += (targetProgress - currentProgress) * 0.08;
        const p = ease(currentProgress);

        ctx.clearRect(0, 0, size, size);

        if (p < 0.97) {
          ctx.globalAlpha = Math.min(1, (1 - p) * 1.6);
          ctx.drawImage(img, offset, offset, drawSize, drawSize);
          ctx.globalAlpha = 1;
        }

        const particleAlphaMul = Math.min(1, p * 2.2);
        if (particleAlphaMul > 0.01) {
          for (const pt of particles) {
            const x = pt.tx + (pt.sx - pt.tx) * p;
            const y = pt.ty + (pt.sy - pt.ty) * p;
            ctx.fillStyle = `rgba(${pt.r},${pt.g},${pt.b},${pt.a * particleAlphaMul})`;
            ctx.fillRect(x, y, STRIDE + 1, STRIDE + 1);
          }
        }

        raf = requestAnimationFrame(render);
      }
      render();
    };

    const onEnter = () => {
      targetProgress = 1;
    };
    const onLeave = () => {
      targetProgress = 0;
    };
    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);
    wrap.addEventListener("touchstart", onEnter, { passive: true });
    wrap.addEventListener("touchend", onLeave);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("touchstart", onEnter);
      wrap.removeEventListener("touchend", onLeave);
    };
  }, [srcNoBg, size]);

  return (
    <div ref={wrapRef} className="absolute inset-0" role="img" aria-label={alt}>
      <canvas ref={canvasRef} className="h-full w-full object-cover" />
    </div>
  );
}
