const PHONE = "528131092383"; // +52 (México) 81 3109 2383, formato wa.me sin signos
const MESSAGE = "Hola, quiero cotizar mi letrero personalizado";

export function WhatsAppButton() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatea por WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/30 transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.001 2.667c-7.363 0-13.334 5.97-13.334 13.333 0 2.353.617 4.56 1.696 6.474L2.667 29.333l7.043-1.848a13.27 13.27 0 0 0 6.291 1.6h.006c7.362 0 13.333-5.97 13.333-13.333S23.363 2.667 16.001 2.667Zm7.81 18.836c-.331.933-1.646 1.707-2.694 1.933-.716.153-1.652.276-4.803-1.032-4.03-1.669-6.623-5.756-6.824-6.022-.194-.267-1.63-2.17-1.63-4.14 0-1.97 1.03-2.938 1.396-3.34.331-.363.72-.454.96-.454.242 0 .484.002.695.013.223.011.522-.084.816.622.331.79.001.795 1.19.795 1.19.036.098.263.632.15 1.253-.113.62-.169.796-.339.977-.169.181-.354.404-.505.542-.169.155-.345.324-.148.634.196.31.872 1.44 1.872 2.332 1.286 1.147 2.37 1.503 2.68 1.674.31.17.492.142.673-.086.181-.226.775-.905.982-1.215.208-.31.416-.259.703-.156.288.104 1.826.862 2.14 1.019.31.155.518.233.594.362.076.128.076.744-.255 1.462Z" />
      </svg>
    </a>
  );
}
