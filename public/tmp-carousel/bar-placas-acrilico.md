# bar-placas-acrilico.md — mecanismos medibles

**Referencia:** manual de estilo de Studio Oker que mando el cliente — galeria
oscura, tipografia blanca susurrada, un solo acento escarlata, radio cero y
vacio como herramienta estructural.

**Advertencia de preflight:** el sitio real no se pudo abrir (`studiooker.com`
esta estacionado). Estos mecanismos se destilaron del manual escrito, no de una
captura. El critico juzga contra estas ocho lineas, no contra un recuerdo.

Esta vara aplica a la seccion interactiva de placas de acrilico de luaser.mx.
No reemplaza a `bar-oferta-luaser.md`, que mide flyers de oferta y es otra
familia de piezas.

1. **Fondo negro puro (`#000000`) en toda la seccion.** Ni un gris de
   superficie, ni una tarjeta elevada. La unica variacion permitida es
   `#101010`, y solo para separar un bloque cuando el vacio no alcanza. Un
   panel con fondo distinto es falla.

2. **Radio cero en absolutamente todo:** muestras de color, chips de medida,
   botones, imagenes, contenedores. Una sola esquina redondeada es falla. Este
   es el mecanismo que mas rapido delata si la seccion se construyo con los
   componentes viejos del sitio, que son de pildora.

3. **Un solo acento cromatico en toda la seccion, usado una vez.** El color de
   las placas NO cuenta como acento: es producto, es contenido. El acento es lo
   que la interfaz usa para senalar, y se raciona a un uso por pantalla. Dos
   elementos de interfaz coloreados es falla.

4. **Dos pesos tipograficos y cuatro tamanos, nada mas.** Solo 300 y 400;
   cualquier cosa en 600 o mas es falla. El titulo de seccion va a 80px con
   peso 300 y tracking -0.02em: el susurro a tamano grande es la firma del
   sistema, no el grosor.

5. **Respiracion de 120px dentro de la seccion y 240px contra las secciones
   vecinas.** Estos numeros son la estructura, no decoracion. Menos de 120px
   entre bloques internos aplana la composicion y es falla.

6. **Cero sombras, cero glow, cero degradados en la interfaz.** La separacion
   se hace con vacio o con una linea de 1px en `#484848`. Un `box-shadow` en
   una muestra de color es falla aunque se vea bien.

7. **Ninguna accion es un boton con fondo.** Las acciones son texto o un punto
   de color. La pildora rellena que hoy usa el sitio para "Ver todos los
   productos" no existe en este lenguaje.

8. **El movimiento resuelve en una sola direccion y dura entre 200 y 500 ms.**
   Nada rebota, nada crece por decoracion. El precio que cambia al elegir otra
   medida se transforma; no parpadea ni salta. Una animacion por debajo de
   200ms se siente rota y una arriba de 500ms se siente lenta: las dos son
   falla.
