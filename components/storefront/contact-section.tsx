import { Phone, Mail, MapPin } from "lucide-react";

const PHONE_DIGITS = "528131092383";
const PHONE_DISPLAY = "81 3109 2383";
const WHATSAPP_MESSAGE = "Hola, quiero cotizar una pieza personalizada";

const whatsappHref = `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export function ContactSection() {
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-content px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pitch/40 bg-pitch/10 px-4 py-1.5 text-xs font-body font-semibold text-pitch-light">
            <span className="h-1.5 w-1.5 rounded-full bg-pitch-light animate-pulse" />
            Cotización en 30 minutos · Sin compromiso
          </div>
          <h2 className="mt-6 font-display text-4xl sm:text-5xl leading-[1.1] text-bone">
            Manda tu diseño. <span className="italic text-gold">Te cotizamos en 30 minutos.</span>
          </h2>
          <p className="mt-5 max-w-md font-body text-graystone-100">
            Cortamos y grabamos a láser en acrílico, MDF y más materiales desde nuestro taller en
            Apodaca. Escríbenos tu idea o manda tu diseño y te respondemos con precio y tiempos de
            entrega.
          </p>

          <div className="mt-8 flex flex-col gap-3 max-w-sm">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-[#128C7E]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.01 22C17.53 22 22 17.52 22 12S17.53 2 12.01 2Zm0 18.2c-1.6 0-3.09-.46-4.35-1.26l-.31-.19-3.02.79.81-2.94-.2-.31A8.17 8.17 0 0 1 3.8 12c0-4.53 3.68-8.2 8.21-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.2 8.2Z" />
                <path d="M16.55 14.22c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.78.98-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.42-.14-.01-.31-.01-.48-.01-.16 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29Z" />
              </svg>
              WhatsApp · {PHONE_DISPLAY}
            </a>
            <a
              href={`tel:+${PHONE_DIGITS}`}
              className="flex items-center justify-center gap-2 rounded-full border border-ink-border py-3.5 font-body text-sm font-semibold text-bone transition-colors hover:border-gold/50 hover:text-gold"
            >
              <Phone className="h-4 w-4" />
              Llamar · {PHONE_DISPLAY}
            </a>
            <a
              href="mailto:contacto@luaser.mx"
              className="flex items-center justify-center gap-2 rounded-full border border-ink-border py-3.5 font-body text-sm font-semibold text-bone transition-colors hover:border-gold/50 hover:text-gold"
            >
              <Mail className="h-4 w-4" />
              contacto@luaser.mx
            </a>
          </div>

          <p className="mt-6 font-body text-xs uppercase tracking-wide text-graystone-500">
            L-S 9-19H · APODACA, N.L.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-border bg-ink-soft p-6 sm:p-8">
          <p className="flex items-center gap-2 font-body text-sm font-semibold text-bone">
            <MapPin className="h-4 w-4 text-gold" />
            Nos encontramos en:
          </p>
          <p className="mt-3 font-body text-graystone-100">
            Calle Santa Ana #348, Colonia Santa Fe
            <br />
            Apodaca, N.L., CP. 66648
          </p>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Calle+Santa+Ana+348%2C+Colonia+Santa+Fe%2C+Apodaca%2C+N.L.%2C+66648"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-body text-sm text-gold hover:text-gold-bright transition-colors"
          >
            Ver en Google Maps →
          </a>
        </div>
      </div>
    </section>
  );
}
