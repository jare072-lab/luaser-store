import { ChevronDown } from "lucide-react";

interface AccordionItem {
  title: string;
  /** Texto plano. Se ignora si `html` viene. */
  content?: string;
  /**
   * HTML de confianza, escrito por nosotros en el admin de Shopify
   * (`descriptionHtml`). Se usa en vez de `content` porque el campo plano de
   * Shopify llega sin etiquetas: párrafos, listas y negritas se colapsan en un
   * solo bloque ilegible.
   */
  html?: string;
}

// Shopify no aplica clases a su HTML, así que el espaciado se define aquí.
const HTML_STYLES = [
  "[&>*+*]:mt-4",
  "[&_p]:leading-relaxed",
  "[&_strong]:text-bone [&_strong]:font-semibold",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5",
  "[&_li]:leading-relaxed [&_li]:pl-1",
  "[&_a]:text-gold [&_a]:underline",
  "[&_br]:content-['']",
].join(" ");

export function ProductAccordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="mt-8 divide-y divide-ink-border border-y border-ink-border">
      {items.map((item) => (
        <details key={item.title} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-body font-semibold text-bone">
            {item.title}
            <ChevronDown className="h-4 w-4 text-graystone-500 transition-transform group-open:rotate-180" />
          </summary>

          {item.html ? (
            <div
              className={`mt-3 text-sm text-graystone-100 ${HTML_STYLES}`}
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          ) : (
            <p className="mt-3 text-sm text-graystone-100 whitespace-pre-line leading-relaxed">
              {item.content}
            </p>
          )}
        </details>
      ))}
    </div>
  );
}
