"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

/**
 * Menu de navegacion para movil.
 *
 * Antes de esto NO existia navegacion en telefono: el nav de escritorio era
 * `hidden md:flex` y en 375px el encabezado solo mostraba el logo y el boton
 * de cotizar. Casi todo el trafico de los anuncios de Meta llega en movil, y
 * ese visitante no tenia como llegar a Productos ni a las placas.
 *
 * Panel de pantalla completa y enlaces grandes a proposito: es un menu para
 * pulgares, no un dropdown de escritorio encogido.
 */
const ENLACES = [
  { href: "/coleccion/placas-de-acrilico", etiqueta: "Placas de acrílico" },
  { href: "/coleccion/frontpage", etiqueta: "Productos" },
  { href: "/#letreros", etiqueta: "Letreros" },
  { href: "/#historia", etiqueta: "Nuestro proceso" },
  { href: "/cotiza", etiqueta: "Solicitar cotización" },
];

export function MobileMenu() {
  const [abierto, setAbierto] = useState(false);

  // Bloquea el scroll del fondo mientras el panel esta abierto: sin esto la
  // pagina de 17,000px se sigue moviendo debajo del menu.
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <div className="md:hidden">
      <button
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
        className="flex h-10 w-10 items-center justify-center text-bone transition-colors hover:text-gold"
      >
        {abierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {abierto && (
        <div className="fixed inset-x-0 bottom-0 top-[calc(var(--alto-header,64px))] z-40 flex flex-col bg-ink"
          style={{ top: "104px" }}
        >
          <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
            {ENLACES.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                onClick={() => setAbierto(false)}
                className="border-b border-ink-border py-5 font-display text-2xl text-bone transition-colors hover:text-gold"
              >
                {e.etiqueta}
              </Link>
            ))}
          </nav>
          <p className="px-8 pb-10 font-body text-sm text-graystone-500">
            Envíos a todo México · Producción en 1 día hábil
          </p>
        </div>
      )}
    </div>
  );
}
