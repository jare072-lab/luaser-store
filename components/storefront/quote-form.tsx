"use client";

import { useState, type FormEvent } from "react";

const PHONE = "528131092383";

const MATERIALS = [
  "Acrílico",
  "MDF",
  "Madera natural",
  "Triplay",
  "Fibropanel / HDF",
  "Cartón",
  "Cartón Caple",
  "Cartón Sulfatado",
  "Cartulina",
  "Papel",
  "Piel / Cuero",
  "Goma EVA / Foamy",
  "Corcho",
  "Fomi delgado",
  "Tela / Fieltro",
  "Vidrio (solo grabado)",
  "Cerámica (solo grabado)",
  "Acero pintado (solo grabado)",
  "Acero anodizado (solo grabado)",
  "Aluminio anodizado (solo grabado)",
  "Otro / no estoy seguro",
];

const FILE_STATUS_OPTIONS = [
  {
    value: "Tengo el archivo listo (DXF, AI, PDF vectorial o SVG)",
    title: "Tengo el archivo listo",
    desc: "DXF, AI, PDF vectorial o SVG",
  },
  {
    value: "Tengo boceto o imagen (podemos vectorizarlo)",
    title: "Tengo boceto o imagen",
    desc: "JPG, PNG o boceto · podemos vectorizarlo",
  },
  {
    value: "Solo tengo la idea, necesito asesoría técnica",
    title: "Solo tengo la idea",
    desc: "Necesito asesoría técnica para empezar",
  },
];

export function QuoteForm() {
  const [description, setDescription] = useState("");
  const [fileStatus, setFileStatus] = useState(FILE_STATUS_OPTIONS[0].value);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const lines = [
      "Hola, quiero solicitar una cotización 👋",
      "",
      `*Nombre:* ${form.get("nombre")}`,
      `*Empresa:* ${form.get("empresa") || "N/A"}`,
      `*Email:* ${form.get("email")}`,
      `*Teléfono:* ${form.get("telefono")}`,
      "",
      `*Material:* ${form.get("material")}`,
      `*Espesor:* ${form.get("espesor") || "No especificado"}`,
      `*Cantidad de piezas:* ${form.get("cantidad") || "No especificada"}`,
      "",
      `*Proyecto:* ${description}`,
      "",
      `*Estado del archivo:* ${fileStatus}`,
    ];

    const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-graystone-100 bg-bone">
      <div className="flex items-center justify-between border-b border-graystone-100 px-6 py-5">
        <h2 className="font-display text-xl text-ink">Detalles de tu proyecto</h2>
        <span className="hidden sm:flex items-center gap-1.5 font-body text-xs text-graystone-500">
          <span className="h-1.5 w-1.5 rounded-full bg-pitch animate-pulse" />
          TE RESPONDEMOS POR WHATSAPP
        </span>
      </div>

      <div className="px-6 py-6 space-y-8">
        <fieldset>
          <legend className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wide text-graystone-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] text-bone">
              1
            </span>
            Información de contacto
          </legend>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <input
              name="nombre"
              required
              placeholder="Nombre completo *"
              className="rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body outline-none focus:border-gold"
            />
            <input
              name="empresa"
              placeholder="Empresa (opcional)"
              className="rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body outline-none focus:border-gold"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email *"
              className="rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body outline-none focus:border-gold"
            />
            <input
              name="telefono"
              type="tel"
              required
              placeholder="Teléfono / WhatsApp *"
              className="rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body outline-none focus:border-gold"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wide text-graystone-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] text-bone">
              2
            </span>
            Sobre tu proyecto
          </legend>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <select
              name="material"
              required
              defaultValue=""
              className="rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body text-graystone-700 outline-none focus:border-gold"
            >
              <option value="" disabled>
                Material *
              </option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              name="espesor"
              placeholder="Espesor (ej. 6 mm)"
              className="rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body outline-none focus:border-gold"
            />
            <input
              name="cantidad"
              placeholder="Cantidad de piezas (ej. 50 piezas o 3 hojas)"
              className="sm:col-span-2 rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body outline-none focus:border-gold"
            />
          </div>
          <div className="mt-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
              required
              rows={4}
              placeholder="Cuéntanos sobre tu proyecto *"
              className="w-full rounded-xl border border-graystone-300 bg-white px-4 py-3 text-sm font-body outline-none focus:border-gold resize-none"
            />
            <p className="mt-1 text-right font-body text-xs text-graystone-500">
              {description.length} / 1000
            </p>
          </div>
        </fieldset>

        <fieldset>
          <legend className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wide text-graystone-500">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] text-bone">
              3
            </span>
            Estado del archivo
          </legend>
          <div className="mt-4 space-y-3">
            {FILE_STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  fileStatus === option.value
                    ? "border-gold bg-gold/5"
                    : "border-graystone-200 hover:border-graystone-300"
                }`}
              >
                <input
                  type="radio"
                  name="archivo"
                  value={option.value}
                  checked={fileStatus === option.value}
                  onChange={() => setFileStatus(option.value)}
                  className="mt-1 accent-gold"
                />
                <span>
                  <span className="block font-body text-sm font-semibold text-ink">
                    {option.title}
                  </span>
                  <span className="block font-body text-xs text-graystone-500">{option.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full rounded-full bg-[#25D366] py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-[#128C7E]"
        >
          Enviar cotización por WhatsApp
        </button>
      </div>
    </form>
  );
}
