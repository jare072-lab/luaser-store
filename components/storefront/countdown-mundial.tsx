"use client";

import { useEffect, useState } from "react";

const KICKOFF = new Date("2026-06-11T00:00:00-06:00").getTime();
const FINAL = new Date("2026-07-19T00:00:00-06:00").getTime();

function getPhase() {
  const now = Date.now();
  if (now < KICKOFF) {
    const diff = KICKOFF - now;
    return {
      type: "countdown" as const,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    };
  }
  if (now <= FINAL) {
    return { type: "live" as const };
  }
  return { type: "post" as const };
}

export function CountdownMundial() {
  const [phase, setPhase] = useState<ReturnType<typeof getPhase> | null>(null);

  useEffect(() => {
    setPhase(getPhase());
    const id = setInterval(() => setPhase(getPhase()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!phase) return null;

  const label =
    phase.type === "countdown"
      ? `Faltan ${phase.days} días y ${phase.hours} horas para el Mundial 2026`
      : phase.type === "live"
        ? "El Mundial 2026 ya está en juego — vive la colección"
        : "Edición conmemorativa Mundial 2026 — recuerda el torneo";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/40 bg-terracotta/10 px-4 py-1.5 text-xs font-body font-semibold text-terracotta">
      <span className="h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
      {label}
    </div>
  );
}
