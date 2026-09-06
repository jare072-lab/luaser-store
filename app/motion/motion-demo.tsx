"use client";

import { useState, type ReactNode } from "react";
import {
  AcrylicSwatch,
  BotonHaz,
  CountUp,
  LaserCutLogo,
  LaserEngrave,
  Letrero3D,
  ProcesoLaser,
  type Acabado,
} from "@/components/storefront/motion";

const PHONE = "528131092383";
const quoteHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(
  "Hola, quiero cotizar un proyecto de maquila / mayoreo"
)}`;

const MUESTRAS: Acabado[] = [
  "espejo-dorado-rosa",
  "espejo-plata",
  "espejo-oro",
  "negro",
  "blanco",
  "tornasol",
];

function Pieza({
  id,
  kicker,
  titulo,
  texto,
  donde,
  specs,
  onRepetir,
  children,
}: {
  id: string;
  kicker: string;
  titulo: string;
  texto: string;
  donde: string;
  specs: string[];
  onRepetir?: () => void;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-ink-border py-14">
      <div className="mb-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <p className="mb-1.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-gold">{kicker}</p>
          <h2 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-bone">{titulo}</h2>
          <p className="mt-2 max-w-[62ch] font-body text-[15px] text-graystone-300">{texto}</p>
        </div>
        <p className="font-body text-xs text-graystone-500 md:text-right">
          <b className="block font-semibold text-graystone-100">Dónde va</b>
          {donde}
        </p>
      </div>
      <div className="relative overflow-hidden rounded-[20px] border border-ink-border bg-ink-soft">
        {children}
        {onRepetir && (
          <button
            type="button"
            onClick={onRepetir}
            className="absolute right-3.5 top-3.5 z-10 rounded-full border border-ink-border bg-ink/60 px-3 py-2 font-body text-xs font-semibold uppercase tracking-[0.06em] text-bone backdrop-blur transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-light"
          >
            Repetir
          </button>
        )}
      </div>
      <ul className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2 font-body text-[13px] text-graystone-500">
        {specs.map((s) => (
          <li key={s} className="before:mr-2 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-ink-border before:align-[2px]">
            {s}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MotionDemo() {
  const [rep, setRep] = useState({ cut: 0, engrave: 0, sign: 0, proc: 0, kpi: 0 });
  const repetir = (k: keyof typeof rep) => () => setRep((r) => ({ ...r, [k]: r[k] + 1 }));
  const [muestra, setMuestra] = useState<Acabado>("espejo-dorado-rosa");

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6">
      <header className="grid gap-8 py-14 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.14em] text-graystone-500">
            Motion reel · 6 piezas
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.02] tracking-tight text-bone sm:text-5xl md:text-[56px]">
            Movimiento que <span className="text-gold">corta, graba y enciende</span>, como el taller.
          </h1>
          <p className="mt-4 max-w-[46ch] font-body text-graystone-300">
            Seis piezas de motion graphics para la portada y las fichas. Todo es código: SVG, CSS y
            canvas sobre la paleta y las fuentes del sitio. Sin video pesado, sin librerías.
          </p>
        </div>
        <nav aria-label="Índice" className="grid gap-1.5 font-body text-[13px] text-graystone-300">
          {[
            ["#corte", "Corte láser del logo", "hero"],
            ["#grabado", "Grabado raster", "promo"],
            ["#muestrario", "Muestrario de acrílico", "placas"],
            ["#letrero", "Letrero 3D que se arma", "letreros"],
            ["#proceso", "Línea de proceso", "cómo funciona"],
            ["#micro", "Contador y botón con haz", "micro UI"],
          ].map(([href, t, d]) => (
            <a key={href} href={href} className="flex justify-between gap-3 border-b border-ink-border py-1.5 no-underline hover:text-bone">
              <span>{t}</span>
              <span className="text-graystone-500">{d}</span>
            </a>
          ))}
        </nav>
      </header>

      <Pieza
        id="corte"
        kicker="Corte láser del logo"
        titulo="La mira y el wordmark se cortan trazo por trazo"
        texto="El cabezal recorre el logotipo real de Luaser como si fuera el archivo de corte: chispas en la punta, trazo caliente que se enfría a hueso, y al final la pieza se libera del tablero."
        donde="Apertura del hero o pantalla de carga"
        specs={["stroke-dashoffset secuencial + canvas de partículas", "5.2 s, luego reposo", "0 KB de assets"]}
        onRepetir={repetir("cut")}
      >
        <LaserCutLogo repeticion={rep.cut} />
      </Pieza>

      <Pieza
        id="grabado"
        kicker="Grabado raster"
        titulo="El texto aparece como lo graba la máquina: línea por línea"
        texto="El cabezal barre de lado a lado mientras baja, y el mensaje queda esmerilado sobre el acrílico negro. Sirve para promociones, precios nuevos o el titular de temporada."
        donde="Banner de promoción, sección de placas"
        specs={["clip-path animado + cabezal en vaivén", "3.4 s", "el copy cambia sin tocar la animación"]}
        onRepetir={repetir("engrave")}
      >
        <div className="grid w-full place-items-center [aspect-ratio:16/7] [background:linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0)_40%),repeating-linear-gradient(0deg,rgba(255,255,255,0.018)_0_1px,transparent_1px_7px),#0B0C0E]">
          <LaserEngrave
            repeticion={rep.engrave}
            lineas={["TU LOGO", "EN ACRÍLICO"]}
            bajada="ENVÍOS A TODO MÉXICO"
            className="px-[8%] py-[6%]"
          />
        </div>
      </Pieza>

      <Pieza
        id="muestrario"
        kicker="Muestrario de acrílico"
        titulo="Acabados espejo que reaccionan al cursor"
        texto="Cada muestra inclina y mueve su reflejo según dónde esté el puntero, como girar la placa bajo la luz. El brillo pasa solo cada pocos segundos para que también viva sin interacción."
        donde="Selector de color en placas y fichas"
        specs={["tilt 3D por puntero + reflejo desplazado + brillo ambiental", "hover / touch", "selección con aria-pressed"]}
      >
        <div className="grid grid-cols-3 gap-3.5 p-5 [perspective:900px] sm:p-7 md:grid-cols-6">
          {MUESTRAS.map((a, i) => (
            <AcrylicSwatch
              key={a}
              acabado={a}
              retraso={i * 0.8}
              seleccionada={muestra === a}
              onClick={() => setMuestra(a)}
            />
          ))}
        </div>
      </Pieza>

      <Pieza
        id="letrero"
        kicker="Letrero 3D que se arma"
        titulo="Las letras caen como piezas cortadas y el letrero enciende"
        texto="Cada letra es una pieza de acrílico con canto; caen en cascada, asientan y luego la luz de fondo parpadea y queda encendida. Es el producto estrella contado en dos segundos."
        donde="Sección de letreros, historias de Instagram"
        specs={["extrusión con text-shadow + caída escalonada + halo retroiluminado", "2.3 s hasta encender", "el texto puede ser el nombre del cliente"]}
        onRepetir={repetir("sign")}
      >
        <Letrero3D texto="LUASER" acento={2} repeticion={rep.sign} />
      </Pieza>

      <Pieza
        id="proceso"
        kicker="Línea de proceso"
        titulo="Del archivo al envío, con el haz recorriendo cada paso"
        texto="Un punto de luz viaja por el riel y va encendiendo cada etapa; los iconos se dibujan a trazo cuando les toca. Se dispara al entrar en pantalla, no al cargar."
        donde="Cómo funciona, en portada y cotización"
        specs={["IntersectionObserver + riel que se llena + iconos con stroke draw", "3.6 s", "se reutiliza cambiando los cuatro pasos"]}
        onRepetir={repetir("proc")}
      >
        <ProcesoLaser repeticion={rep.proc} className="px-8 pb-9 pt-11" />
      </Pieza>

      <Pieza
        id="micro"
        kicker="Contador y botón con haz"
        titulo="Micro-motion para los datos y la llamada a la acción"
        texto="Los números suben con desaceleración al entrar en pantalla, y el botón principal lleva un haz que recorre su borde: llama la atención sin gritar, y acelera al pasar el cursor."
        donde="Barra de confianza, botones Cotizar"
        specs={["count-up con easeOutExpo + borde cónico animado con @property", "1.6 s el contador; el haz gira en loop"]}
        onRepetir={repetir("kpi")}
      >
        <div className="grid grid-cols-2 items-center gap-6 p-8 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <div className="font-display text-[clamp(40px,6vw,72px)] font-semibold leading-none tracking-[-0.03em] text-bone">
              <CountUp valor={500} prefijo="+" repeticion={rep.kpi} />
            </div>
            <p className="mt-2 max-w-[22ch] font-body text-[13px] text-graystone-300">piezas maquiladas para negocios en Nuevo León</p>
          </div>
          <div>
            <div className="font-display text-[clamp(40px,6vw,72px)] font-semibold leading-none tracking-[-0.03em] text-bone">
              <CountUp valor={4} sufijo="mat." repeticion={rep.kpi} />
            </div>
            <p className="mt-2 max-w-[22ch] font-body text-[13px] text-graystone-300">acrílico, MDF, madera y metal</p>
          </div>
          <div>
            <div className="font-display text-[clamp(40px,6vw,72px)] font-semibold leading-none tracking-[-0.03em] text-bone">
              <CountUp valor={32} sufijo="estados" repeticion={rep.kpi} />
            </div>
            <p className="mt-2 max-w-[22ch] font-body text-[13px] text-graystone-300">envíos a todo México</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <BotonHaz href={quoteHref} externo>
              Cotizar mi proyecto
            </BotonHaz>
          </div>
        </div>
      </Pieza>

      <section className="grid gap-10 border-t border-ink-border py-14 md:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-[26px] font-semibold tracking-tight text-bone">Cómo se integra al sitio</h2>
          <p className="mb-2.5 max-w-[52ch] font-body text-[15px] text-graystone-300">
            Todo está hecho con lo que ya existe en luaser.mx: los tokens de color de Tailwind, Space
            Grotesk y Manrope, y el patrón de revelado por scroll. Cada pieza respeta la preferencia
            de movimiento reducido y muestra su estado final sin animar.
          </p>
          <p className="max-w-[52ch] font-body text-[15px] text-graystone-300">
            Ninguna pieza usa video ni librerías: se cargan con la página y pesan lo que pesa su código.
          </p>
        </div>
        <table className="w-full border-collapse font-body text-sm">
          <tbody>
            {[
              ["Corte láser del logo", "LaserCutLogo, arriba del hero de maquila"],
              ["Grabado raster", "LaserEngrave envuelve el titular del PromoBanner"],
              ["Muestrario", "AcrylicSwatch en el selector de color de PlacasSection"],
              ["Letrero 3D", "Letrero3D con el nombre del cliente en la ficha"],
              ["Línea de proceso", "ProcesoLaser antes de TrustBar"],
              ["Contador y CTA", "CountUp en TrustBar; BotonHaz en los Cotizar secundarios"],
            ].map(([a, b]) => (
              <tr key={a}>
                <td className="w-[46%] border-b border-ink-border py-2.5 pr-4 align-top font-semibold text-bone">{a}</td>
                <td className="border-b border-ink-border py-2.5 align-top text-graystone-300">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
