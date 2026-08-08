import type { Metadata } from "next";
import { Clock, ShieldCheck, FileCheck, Lock } from "lucide-react";
import { QuoteForm } from "@/components/storefront/quote-form";

export const metadata: Metadata = {
  title: "Solicita tu cotización",
  description:
    "Cotiza tu proyecto de corte y grabado láser en acrílico, MDF y más materiales. Sin compromiso, respuesta por WhatsApp.",
};

const highlights = [
  {
    icon: Clock,
    title: "Respuesta rápida",
    body: "Te contestamos por WhatsApp, normalmente el mismo día hábil.",
  },
  {
    icon: ShieldCheck,
    title: "Sin compromiso ni cargo",
    body: "Cotizar es 100% gratis, sin importar el tamaño de tu proyecto.",
  },
  {
    icon: FileCheck,
    title: "Asesoría técnica incluida",
    body: "Revisamos tu diseño y te decimos qué material y grosor conviene.",
  },
  {
    icon: Lock,
    title: "Privacidad total",
    body: "Tus datos se usan únicamente para cotizar tu proyecto.",
  },
];

export default function CotizaPage() {
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-content px-4 sm:px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-pitch/40 bg-pitch/10 px-4 py-1.5 text-xs font-body font-semibold text-pitch-light">
            <span className="h-1.5 w-1.5 rounded-full bg-pitch-light animate-pulse" />
            Cotización rápida · Sin compromiso
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl leading-[1.05] text-bone">
            Solicita tu cotización
          </h1>
          <p className="mt-1 font-display text-3xl sm:text-4xl italic text-gold">
            en menos de 2 minutos.
          </p>
          <p className="mt-5 max-w-md font-body text-graystone-100">
            Llena el formulario y te respondemos por WhatsApp con precio, tiempo de entrega y
            opciones de material — antes de que apruebes nada.
          </p>

          <div className="mt-10 space-y-3">
            {highlights.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-ink-border bg-ink-soft px-5 py-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-body text-sm font-semibold text-bone">{title}</p>
                  <p className="mt-0.5 font-body text-xs text-graystone-400">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <QuoteForm />
      </div>
    </section>
  );
}
