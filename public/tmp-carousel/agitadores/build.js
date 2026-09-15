// Flyer de oferta de agitadores (15-20 sep 2026). Correr desde esta carpeta con
// NODE_PATH apuntando a un node_modules que tenga sharp:
//   NODE_PATH=/ruta/node_modules node build.js
// El descuento 20% y el codigo AGITA20 existen en Shopify (vence 20 sep 23:59).
// El bono de 10 piezas extra en pedidos de 50+ se cumple a mano al empacar.
const { offerSplit } = require("/home/user/luaser-store/.claude/skills/graphic-designer/scripts/flyer.js");
(async () => {
  await offerSplit({
    size: 1440,
    marca: "LUASER",
    titular: ["AGITADORES", "DE CÓCTEL", "PERSONALIZADOS"],
    descuento: "20%",
    barraDer: "OFF",
    precio: "$12",
    precioAntes: "$15",
    etiquetaPrecio: "por pieza con el código AGITA20",
    detalle: "PACK DE 10 DESDE $120",
    bonus: "10 agitadores extra GRATIS en pedidos de 50+",
    urgencia: "SOLO 5 DÍAS",
    urgenciaNota: "hasta el 20 de septiembre",
    cta: "PIDE LOS TUYOS",
    heroPhotoPath: "foto-barra-boda-recorte.jpg",
    outPath: "agitadores-oferta-20off.png",
  });
  console.log("ok");
})();
