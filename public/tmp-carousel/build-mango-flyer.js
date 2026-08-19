const { productHero, BRANDS } = require("C:/Users/jorge/CLAUDE/.claude/skills/graphic-designer/scripts/flyer.js");

const base = {
  brand: BRANDS.luaEventos,
  accentColor: "#F5AF95",
  headlineTop: "10 FRAPPES",
  headlineBottom: "GRATIS",
  icons: [
    { label: "Desde 30 personas" },
    { label: "15 al 30 de agosto" },
    { label: "Sabor mango real" },
    { label: "Snacks Party" },
  ],
  logoPath: "C:/Users/jorge/OneDrive/Desktop/PARACLAUDE/LOGO LUA.jpg",
  tagline: "Snacks Party para tu evento",
  heroPhotoPath: "C:/Users/jorge/CLAUDE/public/tmp-carousel/mango-crop-tight.jpg",
  secondaryPhotoPaths: [
    "C:/Users/jorge/CLAUDE/public/tmp-carousel/choc-crop.jpg",
    "C:/Users/jorge/CLAUDE/public/tmp-carousel/straw-crop.jpg",
  ],
  contactLine: "IG @luaeventos  ·  WhatsApp 81 3109 2383",
};

(async () => {
  await productHero({ ...base, width: 1080, height: 1080, heroScale: 0.42, outPath: "mango-flyer-square.png" });
  await productHero({ ...base, width: 1080, height: 1920, heroScale: 0.5, outPath: "mango-flyer-story.png" });
  console.log("done");
})();
