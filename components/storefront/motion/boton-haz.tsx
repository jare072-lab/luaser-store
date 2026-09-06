import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import "./motion.css";

/**
 * Botón con un haz que recorre su borde en loop y acelera al pasar el cursor.
 * Llama la atención sin gritar: el fondo es antracita y sólo se mueve el
 * filo. Sirve para los "Cotizar" secundarios; el CTA principal sigue siendo
 * el dorado relleno del sistema.
 */
export function BotonHaz({
  href,
  children,
  className,
  externo = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  externo?: boolean;
}) {
  return (
    <a
      href={href}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      className={cn(
        "lz-cta inline-flex items-center gap-2.5 rounded-full px-6 py-4 font-body text-[15px] font-bold text-bone no-underline transition-transform duration-200 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
        className
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}
