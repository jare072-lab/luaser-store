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
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.3)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) skewX(-15deg)" },
          "100%": { transform: "translateX(220%) skewX(-15deg)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spin-slow-reverse": {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        blob1: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(30px, -20px) scale(1.1)" },
        },
        blob2: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-25px, 25px) scale(1.08)" },
        },
        beam: {
          "0%": { transform: "translateX(-10%)", opacity: "0" },
          "8%": { opacity: "1" },
          "92%": { opacity: "1" },
          "100%": { transform: "translateX(110%)", opacity: "0" },
        },
        "promo-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "promo-pop": {
          "0%": {
            opacity: "0",
            transform: "perspective(600px) rotateX(50deg) scale(0.4)",
            textShadow: "0 0 80px rgba(232,146,122,0)",
          },
          "100%": {
            opacity: "1",
            transform: "perspective(600px) rotateX(0deg) scale(1)",
            textShadow: "0 0 20px rgba(232,146,122,0.5)",
          },
        },
        "promo-card": {
          "0%": { opacity: "0", transform: "translateZ(-80px) rotateY(-85deg) scale(0.9)" },
          "100%": { opacity: "1", transform: "translateZ(0) rotateY(0deg) scale(1)" },
        },
        "promo-badge": {
          "0%": { opacity: "0", transform: "scale(0.5) rotate(-12deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "promo-shine-text": {
          "0%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "promo-float": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.25" },
          "50%": { transform: "translateY(-26px)", opacity: "0.7" },
        },
        "promo-drift": {
          "0%, 100%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(18px,-6px)" },
        },
        "badge-float": {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%": { transform: "translateY(-8px) rotate(2deg)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
        shine: "shine 3s ease-in-out infinite",
        "spin-slow": "spin-slow 16s linear infinite",
        "spin-slow-reverse": "spin-slow-reverse 12s linear infinite",
        blob1: "blob1 9s ease-in-out infinite",
        blob2: "blob2 11s ease-in-out infinite",
        beam: "beam 4s ease-in-out infinite",
        // La curva de entrada es easeOutCubic; el titular usa easeOutBack, que
        // rebasa el destino y regresa. "backwards" hace que el elemento se
        // mantenga oculto durante su retraso en vez de parpadear visible antes.
        "promo-in": "promo-in 0.5s cubic-bezier(0.215,0.61,0.355,1) backwards",
        "promo-pop": "promo-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) backwards",
        "promo-card": "promo-card 0.7s cubic-bezier(0.215,0.61,0.355,1) backwards",
        "promo-badge": "promo-badge 0.5s cubic-bezier(0.34,1.56,0.64,1) backwards",
        "promo-shine-text": "promo-shine-text 7.5s linear infinite",
        "promo-float": "promo-float 12s ease-in-out infinite",
        "promo-drift": "promo-drift 9s ease-in-out infinite",
        "badge-float": "badge-float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
