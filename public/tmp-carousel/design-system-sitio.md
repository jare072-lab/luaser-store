# design-system-sitio.md — lenguaje de galeria oscura para luaser.mx

Sistema derivado del manual de Studio Oker que aprobo el cliente. Se aplica
por ahora **solo a la seccion de placas de acrilico**, como piloto. El resto
del sitio sigue con el sistema viejo (dorado rosa, azul electrico, pildoras)
hasta que se decida extenderlo.

Existe para que el critico de sistema pueda revisar adherencia sin opinar de
gusto: cada regla se comprueba mirando la captura o midiendo el DOM.

## Color

Cinco tokens. No hay un sexto.

| Token | Hex | Unico uso permitido |
|---|---|---|
| `negro` | `#000000` | Fondo de la seccion. Todo flota sobre esto |
| `negro-suave` | `#101010` | Elevacion minima, solo cuando el vacio no alcanza para separar |
| `hueso` | `#FFFFFF` | Texto primario, titulos, lineas de 1px |
| `niebla` | `#A0A0A0` | Texto secundario, metadatos, etiquetas inactivas |
| `grafito` | `#484848` | Divisores estructurales que se hunden en el negro |

Mas **un** acento cromatico, racionado.

Reglas comprobables:

1. El fondo de la seccion es `#000000`. Ningun bloque **de interfaz** lleva un
   fondo distinto salvo `#101010`, y como maximo uno.

   La muestra de acrilico es la excepcion, y es la misma excepcion de la regla
   2: la muestra ES el producto, su color es el dato que el comprador vino a
   ver, y pintarla de negro seria borrar el contenido. Esta aclaracion se
   agrego despues de que un critico aplicara la regla 1 al pie de la letra y
   reprobara las muestras de color: el texto original decia "bloque interno"
   sin distinguir interfaz de producto, y las reglas 1 y 2 se contradecian.
2. El acento aparece **una sola vez** en toda la seccion. El color de las
   placas de acrilico no cuenta: es producto, no interfaz.
3. Los grises son exactamente `#A0A0A0` y `#484848`. Inventar un gris
   intermedio es falla.
4. Cero degradados en interfaz. Cero sombras. Cero glow.

## Tipografia

Dos pesos, cuatro tamanos.

| Rol | Tamano | Peso | Tracking |
|---|---|---|---|
| Titulo de seccion | 80px | 300 | -0.02em |
| Subtitulo | 32px | 300 | -0.02em |
| Destacado | 24px | 400 | -0.01em |
| Cuerpo y etiquetas | 16px | 400 | -0.01em |

Reglas comprobables:

5. Ningun texto de la seccion pasa de peso 400. Un 600 o un 700 es falla.
6. Solo existen esos cuatro tamanos. Un quinto es falla.
7. El titulo de seccion es 80px en peso 300, no 400 y no mas grueso.

## Forma y espacio

Unidad base 8px.

8. **Radio 0 en todo**: muestras, chips, botones, imagenes, contenedores. Una
   esquina redondeada es falla.
9. Separacion de 120px entre bloques dentro de la seccion.
10. Separacion de 240px entre esta seccion y las vecinas.
11. La separacion visual se hace con vacio o con una linea de 1px en
    `#484848`. Nunca con una caja de fondo distinto.

## Accion

12. Ninguna accion lleva fondo relleno. Las acciones son texto en `#FFFFFF`, o
    un punto de 6px del color de acento seguido de texto. La pildora rellena
    del sistema viejo no existe aqui.

## Movimiento

13. Toda transicion dura entre 200 y 500 ms y resuelve en una sola direccion.
    Nada rebota, nada crece por decoracion.
14. `prefers-reduced-motion` desactiva todo el movimiento no esencial.

## Honestidad del dato

15. Todo numero que se muestre —precio, porcentaje, cantidad de colores— tiene
    que existir en Shopify. Un porcentaje que no corresponde a una resta real
    entre dos precios de la tienda es falla del sistema, no criterio de diseno.
