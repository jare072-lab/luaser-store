"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * `true` la primera vez que el elemento entra en pantalla, y se queda así.
 * Las piezas de motion disparan una sola vez, igual que `Reveal`: nunca se
 * re-animan al subir y bajar. `reinicio` permite volver a armar el observador
 * (lo usa el botón "Repetir" de la demo).
 */
export function useEnVista<T extends Element>(
  ref: RefObject<T>,
  umbral = 0.25,
  reinicio = 0
) {
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    setVisto(false);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisto(true);
          io.unobserve(el);
        }
      },
      { threshold: umbral }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, umbral, reinicio]);

  return visto;
}

/** Respeta `prefers-reduced-motion`: las piezas saltan a su estado final. */
export function useMovimientoReducido() {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducido(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reducido;
}
