# design-system.md — piezas de oferta de Luaser

Sistema mínimo y verificable para las piezas gráficas de Luaser hechas con
`offerSplit` en `.claude/skills/graphic-designer/scripts/flyer.js`. Existe para
que el crítico de sistema pueda revisar adherencia sin opinar de gusto: cada
regla se comprueba mirando el PNG o midiendo píxeles, no interpretando.

No es el sistema del sitio web (ese es oscuro, ver `tailwind.config`). Esta
familia de piezas es clara a propósito, porque el fondo negro del sitio compite
con el acrílico y en el feed de Meta el fondo claro destaca contra la interfaz.

## Color

Cuatro tokens. No hay un quinto.

| Token | Hex | Único uso permitido |
|---|---|---|
| `crema` | `#F7F1E7` | Fondo del panel de texto |
| `tinta` | `#1A1A1A` | Titular, precio nuevo, caja del CTA, mitad derecha de la barra |
| `oro` | `#C8A02E` | Wordmark, mitad izquierda de la barra. **Nada más** |
| `gris` | `#9C978E` | Precio viejo tachado y etiquetas chicas |

Reglas comprobables:

1. El oro aparece **exactamente dos veces** en la pieza: wordmark y barra. Una
   tercera aparición es falla.
2. Blanco puro (`#FFFFFF`) solo dentro de la barra negra y del CTA negro. Nunca
   como fondo de la pieza.
3. Cero degradados en el texto. El único degradado permitido es el brillo
   metálico dentro de la barra dorada y la máscara que funde la foto al crema.

## Tipografía

Una sola familia, sans condensada bold. Cuatro tamaños, ni uno más, expresados
como fracción del lado de la pieza (`size`):

| Rol | Tamaño | Peso | Caja |
|---|---|---|---|
| Titular | `0.088 × size` | 800 | MAYÚSCULAS |
| Precio nuevo | `0.115 × size` | 800 | — |
| Barra de descuento | `0.058 × size` | 800 | MAYÚSCULAS |
| Wordmark, etiquetas, CTA | `0.022 × size` | 600 | MAYÚSCULAS con `letter-spacing` |

Reglas comprobables:

4. El precio nuevo es el número más grande de la pieza; el titular es el bloque
   de texto más grande. Si el descuento es más grande que cualquiera de los dos,
   es falla.
5. El titular ocupa **3 líneas o menos**.
6. Todo el texto en mayúsculas lleva `letter-spacing` positivo salvo el titular
   y el precio, que van apretados.

## Retícula

7. **Una sola línea de alineación izquierda** a `0.058 × size` del borde. El
   wordmark, el titular, el precio, la etiqueta y el CTA arrancan todos ahí. Un
   elemento de texto fuera de esa línea es falla.
8. El panel de texto ocupa el **42% izquierdo**; la foto el 58% derecho.
9. La foto **sangra** por el borde derecho y por el inferior. Si se ve completa
   dentro del marco, es falla.
10. La barra de descuento **sangra por el borde izquierdo**: empieza fuera del
    cuadro, no tiene margen a la izquierda.

## CTA

11. Rectángulo de **esquinas rectas**, relleno `tinta`, texto blanco en
    mayúsculas espaciadas. Nunca píldora, nunca contorno, nunca dorado.

## Honestidad del dato

12. Todo número impreso —precio, precio tachado, porcentaje— tiene que existir
    en la tienda. Un "antes" que no corresponde a un precio real de Shopify es
    falla del sistema, no criterio de diseño.
