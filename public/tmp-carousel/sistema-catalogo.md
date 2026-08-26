# sistema-catalogo.md — reglas mecánicas del catálogo LUASER

Derivado de las fichas ya publicadas en la tienda. Verificación objetiva, no estética.
El system critic revisa SOLO esta lista. No opina sobre si se ve bien.

1. Lienzo cuadrado exacto, 2048 × 2048 px, relación 1:1.
2. Formato PNG o WEBP, sin canal alfa en el resultado final (fondo opaco).
3. Ningún píxel del producto toca ninguno de los cuatro bordes. Margen libre mínimo: 9% del lado.
4. Sin texto SOBREPUESTO a la imagen: sin marca de agua, sin logo de la tienda, sin nombre de
   marca, sin precios, sin cotas ni medidas, sin flechas ni llamados, sin etiquetas de oferta.
   ESTA REGLA NO APLICA al texto que es parte fisica del producto. Si el producto en venta es un
   letrero, unas letras cortadas o un grabado, ese texto ES el producto y DEBE aparecer: marcarlo
   como incumplimiento es un error de lectura de esta regla.
5. Sin props ni escenografía: sin muebles, sin plantas, sin manos, sin personas, sin superficies
   decoradas, sin cajas, sin fondos de habitación.
6. Un solo producto por imagen, salvo que la ficha venda un conjunto.
7. El producto tiene sombra de contacto. Una sola, difusa, sin bordes duros.
8. Balance de blancos neutro EN EL FONDO: sin dominante ambar ni naranja. Definicion operativa
   para medirlo, no negociable: se consideran pixeles de fondo unicamente los que tienen
   luminancia >= 225. Todo lo demas es producto, canto, o penumbra de la sombra, y NO se mide
   en esta regla. Sobre ese conjunto, la saturacion max(R,G,B) - min(R,G,B) debe ser <= 12.
   El material del producto puede y debe tener saturacion mas alta: el canto de MDF cortado a
   laser es calido por naturaleza y la vara de craft exige que se vea. Medir el canto aqui y
   reportarlo como incumplimiento es un error de aplicacion de esta regla.
9. El producto está centrado horizontalmente dentro de ±4% del centro del lienzo.
10. Sin bordes, marcos, viñetas duras ni esquinas redondeadas aplicadas al lienzo.
