import { ChevronDown } from "lucide-react";

interface AccordionItem {
  title: string;
  content: string;
}

export function ProductAccordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="mt-8 divide-y divide-ink-border border-y border-ink-border">
      {items.map((item) => (
        <details key={item.title} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-body font-semibold text-bone">
            {item.title}
            <ChevronDown className="h-4 w-4 text-graystone-500 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm text-graystone-100 whitespace-pre-line">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
