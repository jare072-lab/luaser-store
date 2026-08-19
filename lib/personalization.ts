// Campos de personalización por producto.
//
// Antes esto se decidía buscando la palabra "personaliza" en el título o la
// descripción, lo que dejaba pasar productos sin personalizar y, peor, permitía
// comprar una pieza personalizada sin capturar el texto a grabar. Ahora se
// decide por etiquetas de Shopify y los campos obligatorios bloquean la compra.

export type PersonalizationFieldType = "text" | "select" | "textarea";

export interface PersonalizationField {
  /** Llega a Shopify como llave del atributo de la línea del carrito. */
  key: string;
  label: string;
  type: PersonalizationFieldType;
  required: boolean;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  help?: string;
}

const CAMPO_NOTAS: PersonalizationField = {
  key: "Notas",
  label: "Notas para el taller",
  type: "textarea",
  required: false,
  maxLength: 200,
  placeholder: "¿Alguna indicación especial?",
};

// Buzones y cajas de sobres para eventos: llevan frase, iniciales y acabado.
const CAMPOS_BUZON: PersonalizationField[] = [
  {
    key: "Texto principal",
    label: "Texto principal",
    type: "text",
    required: true,
    maxLength: 20,
    placeholder: "NUESTRA BODA",
    defaultValue: "NUESTRA BODA",
    help: "Ej: NUESTRA BODA, MIS XV, NUESTRA FIESTA.",
  },
  {
    key: "Iniciales",
    label: "Iniciales",
    type: "text",
    required: true,
    maxLength: 7,
    placeholder: "J & L",
    help: "Ej: J & L",
  },
  {
    key: "Color de letras",
    label: "Color de las letras",
    type: "select",
    required: true,
    options: ["Dorado espejo", "Plata espejo", "Oro rosa espejo"],
    defaultValue: "Dorado espejo",
  },
  CAMPO_NOTAS,
];

// Resto del catálogo personalizable: placa o grabado con un solo texto.
const CAMPOS_GRABADO: PersonalizationField[] = [
  {
    key: "Nombre a grabar",
    label: "Nombre a grabar",
    type: "text",
    required: true,
    maxLength: 15,
    placeholder: "Escribe el nombre",
    help: "Como quieres que aparezca grabado, con acentos si aplica.",
  },
  CAMPO_NOTAS,
];

export function getPersonalizationFields(tags: string[]): PersonalizationField[] {
  const normalizadas = tags.map((tag) => tag.toLowerCase().trim());

  if (!normalizadas.includes("personalizado")) return [];
  if (normalizadas.includes("buzon") || normalizadas.includes("buzón")) return CAMPOS_BUZON;

  return CAMPOS_GRABADO;
}

export function buildInitialValues(fields: PersonalizationField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue ?? ""]));
}

/** Llaves obligatorias que el usuario dejó vacías. */
export function getMissingRequired(
  fields: PersonalizationField[],
  values: Record<string, string>
): string[] {
  return fields
    .filter((field) => field.required && !(values[field.key] ?? "").trim())
    .map((field) => field.key);
}

/** Solo los campos con contenido viajan como atributos de la línea. */
export function toCartAttributes(
  fields: PersonalizationField[],
  values: Record<string, string>
): { key: string; value: string }[] {
  return fields
    .map((field) => ({ key: field.key, value: (values[field.key] ?? "").trim() }))
    .filter((attr) => attr.value.length > 0);
}
