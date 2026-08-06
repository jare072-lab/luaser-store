export function NewsletterSection() {
  return (
    <section className="bg-bone text-ink-900 py-16 md:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6 text-center max-w-lg">
        <h2 className="font-display text-2xl sm:text-3xl">
          10% de descuento en tu primera pieza
        </h2>
        <p className="mt-2 text-sm text-graystone-700">
          Recibe la guía gratis "Cómo cuidar tu caja acrílica" y tu código de descuento.
        </p>
        {/* Captura de email: se conecta a Klaviyo/Shopify en la siguiente iteración */}
        <form className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            className="flex-1 rounded-full border border-graystone-300 bg-white px-5 py-3 text-sm font-body outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="rounded-full bg-ink-900 text-bone px-6 py-3 text-sm font-body font-semibold hover:bg-gold hover:text-ink transition-colors"
          >
            Quiero mi descuento
          </button>
        </form>
      </div>
    </section>
  );
}
