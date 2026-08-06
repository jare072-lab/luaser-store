import Link from "next/link";
import { Search } from "lucide-react";
import { CartButton } from "@/components/storefront/cart-button";

export function SiteHeader({ cartQuantity = 0 }: { cartQuantity?: number }) {
  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur border-b border-ink-border">
      <div className="bg-pitch text-bone text-center text-xs sm:text-sm py-2 px-4 font-body">
        Envío gratis en pedidos mayores a $999 MXN · Piezas de edición Mundial 2026 hechas a mano en México
      </div>
      <div className="mx-auto max-w-content px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-display text-2xl tracking-tight text-bone">
          LUASER<span className="text-gold">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-body text-sm text-graystone-100">
          <Link href="#mundial-2026" className="hover:text-gold transition-colors">
            Mundial 2026
          </Link>
          <Link href="#bestsellers" className="hover:text-gold transition-colors">
            Más vendidos
          </Link>
          <Link href="#historia" className="hover:text-gold transition-colors">
            Nuestro proceso
          </Link>
        </nav>
        <div className="flex items-center gap-4 text-bone">
          <button aria-label="Buscar" className="hover:text-gold transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <CartButton quantity={cartQuantity} />
        </div>
      </div>
    </header>
  );
}
