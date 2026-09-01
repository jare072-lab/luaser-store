const PHONE = "528131092383"; // +52 (México) 81 3109 2383, formato wa.me sin signos
const MESSAGE = "Hola, quiero cotizar mi letrero personalizado";

export function WhatsAppButton() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chatea por WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center"
      >
        {/* Halo pulsante sutil, tono dorado de marca */}
        <span className="absolute inset-0 rounded-full bg-gold/30 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />

        {/* Etiqueta que se desliza al hacer hover (desktop) */}
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink px-4 py-2 font-body text-sm text-bone opacity-0 shadow-lg shadow-black/30 ring-1 ring-gold/30 transition-all duration-300 group-hover:opacity-100 md:block">
          Cotiza por WhatsApp
        </span>

        {/* Botón */}
        <span
          className="relative flex h-14 w-14 items-center justify-center rounded-full
                     bg-[#25D366]
                     shadow-lg shadow-black/40 ring-2 ring-white/15
                     transition-all duration-300 ease-out
                     group-active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 drop-shadow-sm" aria-hidden="true">
            <path
              fill="#FFFFFF"
              d="M12.01 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.01 22C17.53 22 22 17.52 22 12S17.53 2 12.01 2Zm0 18.2c-1.6 0-3.09-.46-4.35-1.26l-.31-.19-3.02.79.81-2.94-.2-.31A8.17 8.17 0 0 1 3.8 12c0-4.53 3.68-8.2 8.21-8.2 4.53 0 8.2 3.67 8.2 8.2 0 4.53-3.67 8.2-8.2 8.2Z"
            />
            <path
              fill="#FFFFFF"
              d="M16.55 14.22c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.78.98-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.84-.2-.48-.41-.42-.56-.42-.14-.01-.31-.01-.48-.01-.16 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.06.41 1.42.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29Z"
            />
          </svg>
        </span>
      </a>
    </div>
  );
}
