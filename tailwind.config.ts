import type { Config } from "tailwindcss";

// Sistema de color — ver sección 2 del plan de arquitectura Luaser.
// El dorado se reserva para CTAs de conversión; el verde solo para
// confirmaciones/confianza; el terracota solo para escasez/urgencia.
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
          DEFAULT: "#C9A227", // acento primario / CTA
          bright: "#D4AF37",
          dark: "#9C7E1D",
        },
        pitch: {
          DEFAULT: "#1B5E3F", // acento secundario — verde estadio
          light: "#237A52",
        },
        terracotta: {
          DEFAULT: "#B5432E", // urgencia / escasez
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
