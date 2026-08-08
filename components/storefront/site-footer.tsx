import Link from "next/link";
import { Logo } from "@/components/storefront/logo";

const columns = [
  {
    title: "Tienda",
    links: [
      { label: "Letreros personalizados", href: "/producto/letrero-de-acrilico-personalizado-para-negocio" },
      { label: "Más vendidos", href: "#bestsellers" },
      { label: "Coleccionables", href: "#" },
      { label: "Decoración MDF", href: "#" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Envíos y tiempos", href: "/paginas/envios-y-tiempos" },
      { label: "Garantía", href: "/paginas/garantia" },
      { label: "Preguntas frecuentes", href: "/paginas/preguntas-frecuentes" },
      { label: "Contacto", href: "/paginas/contacto" },
    ],
  },
  {
    title: "Marca",
    links: [
      { label: "Nuestro proceso", href: "#historia" },
      { label: "Términos y condiciones", href: "/paginas/terminos-y-condiciones" },
      { label: "Privacidad", href: "/paginas/privacidad" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink border-t border-ink-border text-graystone-100">
      <div className="mx-auto max-w-content px-4 sm:px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-graystone-300 max-w-xs">
            Letreros y piezas de acrílico cortadas a láser con precisión. Maquilamos cualquier
            diseño personalizado y enviamos a todo México.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-body font-semibold text-bone text-sm mb-4">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-graystone-300 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-border py-6 text-center text-xs text-graystone-500">
        © {new Date().getFullYear()} Luaser. Hecho a mano en México. No afiliado ni respaldado por
        FIFA ni por ninguna organización oficial del Mundial.
      </div>
    </footer>
  );
}
