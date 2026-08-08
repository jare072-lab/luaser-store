import { cn } from "@/lib/utils";

// Recreación vectorial del logo de Luaser (mira láser + retícula) en el
// dorado de marca — el original es un archivo de corte, no un logo web,
// así que se redibujó a mano manteniendo la composición exacta.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("shrink-0", className)}
      fill="none"
      aria-hidden="true"
    >
      {/* Retícula — anillo exterior segmentado */}
      <circle
        cx="50"
        cy="52"
        r="32"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="14 7"
      />
      {/* Retícula — anillo interior segmentado */}
      <circle
        cx="50"
        cy="52"
        r="24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="9 6"
      />
      {/* Cruz diagonal */}
      <line x1="21" y1="23" x2="79" y2="81" stroke="currentColor" strokeWidth="2" />
      <line x1="79" y1="23" x2="21" y2="81" stroke="currentColor" strokeWidth="2" />
      {/* Haz de corte hacia el centro */}
      <path d="M50 20 L44 52 L56 52 Z" fill="currentColor" fillOpacity="0.9" />
      {/* Emisor láser */}
      <path
        d="M42 8 H58 V14 L52 20 H48 L42 14 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("h-8 w-8 text-gold", markClassName)} />
      <span
        className={cn(
          "font-display text-2xl tracking-tight text-bone",
          wordmarkClassName
        )}
      >
        LUASER<span className="text-gold">.</span>
      </span>
    </span>
  );
}
