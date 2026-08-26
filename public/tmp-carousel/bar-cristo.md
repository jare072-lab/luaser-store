# bar-cristo.md — mecanismos medibles

**Referencia (barra):** las dos fichas de llaveros de acrílico ya publicadas en la tienda LUASER
- `bar-llav-foto.png` — llavero silueta de golden retriever
- `bar-llav-logo.png` — dos llaveros de caballo poligonal

**Pieza a construir:** foto de catálogo del Letrero "Bienvenidos" de MDF (Cristo), 40 × 24 cm, 6 mm de espesor, negro mate.
**Fuente de geometría:** `C:UsersjorgeOneDriveDesktopmercadolibrecristomercado.svg` (400 × 240.5 mm, un único path cerrado). El letrero NO se dibuja con IA. Para comparar la silueta, renderiza ese SVG relleno en negro con fill-rule evenodd.

---

## Los 7 mecanismos

1. **El fondo es un degradado gris frío, nunca blanco puro.** Medido en la barra: arranca entre `#F2F3F4` y `#E9E9E9` en la esquina superior izquierda y cae a `#E0E1E5`–`#D0D0D0` en la inferior derecha. La caída de luminancia entre esas dos esquinas es de 18 a 25 niveles. Un fondo plano, o cualquier píxel en `#FFFFFF`, falla.

2. **El objeto ocupa entre 70% y 78% del ancho del cuadro, y deja al menos 9% de margen libre en los cuatro lados.** Medido: bbox de 70.1% y 77.5% de ancho; márgenes mínimos de 14.3% y 9.0%. Nada toca ni se acerca al borde. Nada sale del cuadro.

3. **La cobertura real de píxeles del objeto es solo 13%–16% del cuadro.** Es una toma con mucho aire: el bounding box es grande pero la silueta es delgada. Una pieza que llene la mayor parte del área de su bbox con masa negra sólida se sale de la barra.

4. **El objeto está inclinado, nunca alineado a los ejes.** En ambas referencias el eje principal del producto va en diagonal, entre 10° y 25° respecto a la horizontal. Un letrero perfectamente horizontal falla.

5. **Una sola fuente de luz suave desde arriba a la izquierda, con una sola sombra de contacto.** La sombra es corta (no más del 15% de la altura del objeto), difusa, cae hacia abajo-derecha, y arranca pegada al objeto sin separación. Ni sombras dobles, ni sombra dura, ni sombra proyectada larga tipo pared.

6. **El canto del material es visible y legible como material.** En la barra se ve el bisel blanco lechoso del acrílico en todo el perímetro. Aquí el equivalente es el canto de 6 mm del MDF: tiene que verse el espesor en al menos un lado, con su propio valor de gris distinto de la cara frontal. Una silueta plana recortada sin canto falla.

7. **Cero props, cero entorno, cero texto añadido.** Ni muebles, ni plantas, ni superficies decoradas, ni cotas, ni logo, ni marca de agua. Solo el producto y su sombra. (Este es exactamente el mecanismo que rompió la generación fallida: conservó sala, sofá, planta y repisas.)

---

## Chequeos de integridad del producto (binarios, no estéticos)

- El script "Bienvenidos" se lee completo y correcto, sin acentos inventados, sin letras fusionadas, sin la rúbrica inferior partida.
- Hay **un solo** letrero en la imagen. Ni fantasmas, ni duplicados, ni superposiciones.
- Las dos manos tienen forma de mano.
- La silueta coincide con el SVG de corte citado arriba (ruta absoluta). Si difiere, es un fallo, no una variación.


## Nota anadida tras la ronda 1

8. **Los calados son aire.** Cada celda cerrada del corte (los huecos entre pliegues, el hueco del rostro) debe leer el mismo valor que el fondo abierto adyacente, dentro de +/- 10 niveles. Si dentro de un calado aparece un degradado propio, la pieza deja de ser un letrero calado y pasa a leerse como una placa solida. Este fue el fallo mayor de la ronda 1.
