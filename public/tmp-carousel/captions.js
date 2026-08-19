const fs = require("fs");
const path = require("path");

const OUT = "C:/Users/jorge/OneDrive/Desktop/Higgsfield/CalendarioSemanal";

const HASHTAGS_BASE = "#LuaEventos #EventosMonterrey #MonterreyNuevoLeon #CateringMonterrey #BodasMonterrey #XVañosMonterrey";

const days = {
  Lunes: {
    post1: {
      time: "1:00 PM",
      title: "Antojo de media semana",
      text: `Antojo de media semana 🌽

Nachos, quesos y salsas — así arrancamos la semana en Lúa Eventos. Llevamos la barra de snacks completa a tu evento, con todo lo que a tus invitados les encanta.

📍 Monterrey y zona metropolitana
¿Ya tienes fecha para tu próximo evento? Escríbenos 👇

${HASHTAGS_BASE} #BarraDeSnacks #ElotesMonterrey`,
    },
    post2: {
      time: "7:00 PM",
      title: "Momentos dulces en cada evento",
      text: `Momentos dulces en cada evento 🥤

No solo llevamos snacks — creamos momentos. Una barra de frappés bien montada hace que tu evento se sienta especial desde el primer sorbo.

📍 Bodas, XV años, cumpleaños y eventos corporativos
Cotiza gratis por WhatsApp 👇

${HASHTAGS_BASE} #FrappesMonterrey #EventosCorporativosMTY`,
    },
    stories: `HISTORIA 11:00 AM — repost del post de las 1PM con sticker de "Cotiza aquí" apuntando al link de WhatsApp.

HISTORIA 3:00 PM — repost del post de las 7PM.

HISTORIA 6:00 PM — texto: "¿Ya tienes fecha para tu evento? 📅" con sticker de pregunta/encuesta para generar interacción.`,
  },
  Martes: {
    post1: {
      time: "1:00 PM",
      title: "El clásico que nunca falla",
      text: `El clásico que nunca falla 🍫

Chocolate, whipped cream y una paleta Magnum encima — el frappé que todos piden dos veces. Perfecto para cualquier tipo de evento.

📍 Monterrey y área metropolitana
Personaliza tu barra con los sabores que tú quieras 👇

${HASHTAGS_BASE} #FrappeDeChocolate #BarraDeFrappes`,
    },
    post2: {
      time: "7:00 PM",
      title: "Mango con chile, para los valientes",
      text: `Dos sabores, un mismo antojo 🥤

El clásico de chocolate que nunca falla, o el mango con chile para los que se atreven — en Lúa Eventos personalizamos tu barra de frappés con los sabores que tú elijas.

🔥 Promo: 10 frappés GRATIS al contratar tu evento (del 15 al 30 de agosto)
¿Cuál escogerías tú? 👇

${HASHTAGS_BASE} #MangoConChile #PromocionesMTY`,
    },
    stories: `HISTORIA 11:00 AM — repost del post de las 1PM.

HISTORIA 3:00 PM — repost del post de las 7PM con countdown sticker de la promo (termina 30 de agosto).

HISTORIA 6:00 PM — texto: "Personaliza tu barra: elige tus sabores 🎨" con sticker de encuesta "¿Chocolate o mango-chile?".`,
  },
  Miercoles: {
    post1: {
      time: "1:00 PM",
      title: "Crepas recién hechas en tu evento",
      text: `Crepas recién hechas en tu evento 🥞

Nada como ver la crepa hacerse al momento — masa fresca, el topping que elijas, y ese show en vivo que a todos los invitados les encanta ver.

📍 Ideal para XV años, cumpleaños y eventos familiares
Escríbenos y arma tu menú 👇

${HASHTAGS_BASE} #CrepasMonterrey #BarraDeCrepas`,
    },
    post2: {
      time: "7:00 PM",
      title: "Así se disfruta una fiesta Lúa",
      text: `Así se disfruta una fiesta Lúa ✨

Crepa en una mano, frappé en la otra — así se ve un evento bien atendido. Nos encargamos de que cada invitado se lleve algo delicioso.

📍 Monterrey y zona metropolitana
Cotiza tu evento gratis 👇

${HASHTAGS_BASE} #FiestaInfantilMonterrey #DulcesParaEventos`,
    },
    stories: `HISTORIA 11:00 AM — repost del post de las 1PM.

HISTORIA 3:00 PM — repost del post de las 7PM.

HISTORIA 6:00 PM — texto: "Bodas, XV años, cumpleaños y más 🎉" con sticker de link a WhatsApp.`,
  },
  Jueves: {
    post1: {
      time: "1:00 PM",
      title: "Waffles con fruta fresca",
      text: `Waffles con fruta fresca 🧇

Waffle recién hecho, fresa, plátano y todo el topping que tú elijas. Un básico que nunca falla en nuestra barra dulce.

📍 Disponible en toda la zona metropolitana de Monterrey
Pregunta por nuestros paquetes 👇

${HASHTAGS_BASE} #WafflesMonterrey #MesaDePostres`,
    },
    post2: {
      time: "7:00 PM",
      title: "Tres sabores, una sola barra",
      text: `Tres sabores, una sola barra 🥤

Chocolate, mango-tamarindo y fresa — porque cada invitado tiene su favorito. Así armamos tu barra de frappés a la medida.

🔥 Última semana de promo: 10 frappés GRATIS al contratar
Aparta tu fecha ya 👇

${HASHTAGS_BASE} #BarraDePostres #PromocionMTY`,
    },
    stories: `HISTORIA 11:00 AM — repost del post de las 1PM.

HISTORIA 3:00 PM — repost del post de las 7PM.

HISTORIA 6:00 PM — texto: "10 FRAPPÉS GRATIS esta semana 🥤" con sticker de cuenta regresiva a fin de la promo.`,
  },
  Viernes: {
    post1: {
      time: "1:00 PM",
      title: "Elotes con todo, como te gustan",
      text: `Elotes con todo, como te gustan 🌽

Queso, chile, mayonesa y todos los toppings clásicos — el snack que jamás falta en una buena fiesta mexicana.

📍 Monterrey y área metropolitana
Ya casi es fin de semana, ¿ya tienes tu evento cotizado? 👇

${HASHTAGS_BASE} #ElotesMonterrey #SnacksParaEventos`,
    },
    post2: {
      time: "7:00 PM",
      title: "10 FRAPPÉS GRATIS al contratar tu evento",
      text: `🎉 10 FRAPPÉS GRATIS al contratar tu evento

Por tiempo limitado: contrata tu barra de snacks, frappés o postres con Lúa Eventos y te regalamos 10 frappés extra para tus invitados.

📅 Promoción válida del 15 al 30 de agosto
📲 Escríbenos hoy y aparta tu fecha

${HASHTAGS_BASE} #PromocionesMTY #OfertaLimitada`,
    },
    stories: `HISTORIA 11:00 AM — repost del post de las 1PM.

HISTORIA 3:00 PM — repost de la promo con sticker de cuenta regresiva.

HISTORIA 6:00 PM — texto: "Este fin de semana tenemos lugar 📍" con sticker de "Desliza para cotizar" enlazando a WhatsApp.`,
  },
  Sabado: {
    post1: {
      time: "1:00 PM",
      title: "Sonrisas garantizadas en tu fiesta",
      text: `Sonrisas garantizadas en tu fiesta 😄

Nada nos gusta más que ver a los invitados disfrutando su frappé con una gran sonrisa. Eso es lo que buscamos en cada evento que atendemos.

📍 Fin de semana = más fechas disponibles, pregunta por la tuya
Cotiza por WhatsApp 👇

${HASHTAGS_BASE} #EventosDeFinDeSemana #ClientesFelices`,
    },
    post2: {
      time: "7:00 PM",
      title: "Nuestra barra, lista para tu evento",
      text: `Nuestra barra, lista para tu evento 🥤

Así se ve nuestra barra montada y lista — limpia, ordenada y con todo lo necesario para atender a tus invitados sin que tú te preocupes por nada.

📍 Bodas, XV años, cumpleaños y eventos corporativos
Reserva tu fecha 👇

${HASHTAGS_BASE} #MontajeDeEventos #BarraDeBebidas`,
    },
    stories: `HISTORIA 11:00 AM — repost del post de las 1PM.

HISTORIA 3:00 PM — repost del post de las 7PM.

HISTORIA 6:00 PM — texto: "Cada evento, una barra distinta ✨" con sticker de galería/carrusel de trabajos anteriores.`,
  },
  Domingo: {
    post1: {
      time: "1:00 PM",
      title: "Domingo de alberca y frappés",
      text: `Domingo de alberca y frappés 🏊

No hay mejor combinación que un día de alberca con una barra de frappés fría cerca. Llevamos la fiesta a donde tú la necesites.

📍 Fiestas en casa, clubes y salones — cubrimos toda la zona metropolitana
Cotiza tu evento gratis 👇

${HASHTAGS_BASE} #FiestaDeAlberca #EventosDeVerano`,
    },
    post2: {
      time: "7:00 PM",
      title: "Escríbenos y aparta tu fecha",
      text: `Escríbenos y aparta tu fecha 📲

Termina la semana y empieza a planear tu próximo evento con nosotros. Cotización gratis, sin compromiso, y armamos tu barra a tu medida.

📍 Monterrey y zona metropolitana
👉 WhatsApp: 81 3109 2383

${HASHTAGS_BASE} #CotizaTuEvento #LuaEventosMTY`,
    },
    stories: `HISTORIA 11:00 AM — repost del post de las 1PM.

HISTORIA 3:00 PM — repost del post de las 7PM.

HISTORIA 6:00 PM — texto: "Escríbenos y cotiza gratis 📲" con sticker de link directo a WhatsApp para cerrar la semana.`,
  },
};

for (const [day, content] of Object.entries(days)) {
  const dir = path.join(OUT, day);
  const lines = [
    `TEXTO PARA ${day.toUpperCase()}`,
    "=".repeat(40),
    "",
    `POST 1 — ${content.post1.time} — "${content.post1.title}"`,
    "-".repeat(40),
    content.post1.text,
    "",
    "",
    `POST 2 — ${content.post2.time} — "${content.post2.title}"`,
    "-".repeat(40),
    content.post2.text,
    "",
    "",
    "HISTORIAS",
    "-".repeat(40),
    content.stories,
    "",
  ];
  fs.writeFileSync(path.join(dir, "texto.txt"), lines.join("\n"), "utf8");
  console.log("escrito:", day);
}
