# bar.md — efecto de partículas armar/desarmar con cursor

No hay referencia externa (el usuario dijo "sorpréndeme"). Mecanismos internos concretos:

1. **En reposo, la pieza está completamente armada** y se lee igual que la foto real — nada de partículas visibles cuando el cursor no ha interactuado.
2. **Mover el cursor hacia abajo desarma** (las partículas se dispersan hacia afuera), **mover el cursor hacia arriba vuelve a armar** — la dirección debe sentirse intuitiva, no invertida.
3. **Cada partícula conserva el color real de la foto** en su posición — dorado donde era dorado, blanco cálido en el LED — no son puntos genéricos de un solo color.
4. **El movimiento es interpolado/suave**, nunca salta de golpe entre armado y disperso — se siente como física, no como un toggle binario.
5. **Incluso totalmente disperso, la nube de partículas mantiene la silueta general** (sigue leyéndose como "esto era el letrero explotando"), no se vuelve una nube aleatoria irreconocible.
6. **Sin caída de framerate perceptible** — fluido al mover el cursor rápido, sin trabarse.
7. **El fondo del canvas es transparente/neutro**, nada compite visualmente con las partículas doradas.

Estos son los 7 mecanismos contra los que el craft critic va a juzgar el resultado.
