import type { Config } from "tailwindcss";

// Sistema de color "Acrílico Neón" — inspirado en los acabados de acrílico
// espejo que vende Luaser (dorado rosa, plateado). El rosa dorado se reserva
// para CTAs de conversión; el azul eléctrico para confirmaciones/confianza;
// el rosa neón solo para escasez/urgencia.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0C0E", // fondo primario — negro antracita
          soft: "#16181C",
          border: "#2A2D33",
        },
        bone: {
          DEFAULT: "#FAF9F6", // fondo secundario — hueso
          muted: "#EFEDE7",
        },
        gold: {
          DEFAULT: "#E8927A", // acento primario / CTA — dorado rosa
          bright: "#F5AF95",
          dark: "#B8654C",
        },
        pitch: {
          DEFAULT: "#2E7FE8", // acento secundario — azul eléctrico
          light: "#5B9FFF",
        },
        terracotta: {
          DEFAULT: "#E63980", // urgencia / escasez — rosa neón
        },
        graystone: {
          50: "#F5F4F2",
          100: "#E7E5E1",
          300: "#B7B4AD",
          500: "#7A776F",
          700: "#45433D",
          900: "#1A1B1E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
