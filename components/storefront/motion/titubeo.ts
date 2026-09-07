/**
 * Patrón de encendido de la luz: arranques que no cuajan y se vuelven a caer, hasta que la
 * luz se queda fija. Dura 1.33 s.
 *
 * Lo comparten la placa grabada y el letrero de pared a propósito: es la misma instalación
 * eléctrica, y si cada pieza titubeara distinto se notaría que son animaciones sueltas.
 */
export const TITUBEO: readonly (readonly [number, boolean])[] = [
  [0, true], [80, false], [170, true], [240, false], [300, true], [390, false],
  [500, true], [560, false], [660, true], [780, false], [900, true], [990, false],
  [1080, true], [1210, false], [1330, true],
];
