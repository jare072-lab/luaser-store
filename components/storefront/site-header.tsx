import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { CartButton } from "@/components/storefront/cart-button";
import { Logo } from "@/components/storefront/logo";

const PHONE = "528131092383";
const CHAT_MESSAGE = "Hola, tengo una duda sobre sus productos";

const chatHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(CHAT_MESSAGE)}`;

export function SiteHeader({ cartQuantity = 0 }: { cartQuantity?: number }) {
  return (
    <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur border-b border-ink-border">
      <div className="bg-pitch text-bone text-center text-xs sm:text-sm py-2 px-4 font-body">
        Envíos a todo México · Maquilamos cualquier pieza personalizada
      </div>
      <div className="mx-auto max-w-content px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" aria-label="Luaser">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-body text-sm text-graystone-100">
          <Link href="#bestsellers" className="hover:text-gold transition-colors">
            Letreros
          </Link>
          <Link href="#bestsellers" className="hover:text-gold transition-colors">
            Más vendidos
          </Link>
          <Link href="#historia" className="hover:text-gold transition-colors">
            Nuestro proceso
          </Link>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4 text-bone">
          <a
            href={chatHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-ink-border px-4 py-2 font-body text-sm text-graystone-100 transition-colors hover:border-[#25D366]/50 hover:text-[#25D366]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.01 22C17.53 22 22 17.52 22 12S17.53 2 12.01 2Zm0 18.2c-1.6 0-3.09-.46-4.35-1.26l-.31-.19-3.02.79.81-2.94-.2-.31A8.17 8.17 0 0 1 3.8 12c0-4.53 3.68-8.2 8.21-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.2 8.2Z" />
              <path d="M16.55 14.22c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.78.98-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.42-.14-.01-.31-.01-.48-.01-.16 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29Z" />
            </svg>
            WhatsApp
          </a>
          <Link
            href="/cotiza"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 sm:px-4 py-2 font-body text-sm font-semibold text-ink transition-colors hover:bg-gold-bright"
          >
            <span className="sm:hidden">Cotizar</span>
            <span className="hidden sm:inline">Solicitar cotización</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button aria-label="Buscar" className="hover:text-gold transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <CartButton quantity={cartQuantity} />
        </div>
      </div>
    </header>
  );
}
