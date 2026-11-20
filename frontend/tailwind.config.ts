import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#020305",
          900: "#06080c",
          850: "#0a0d14",
          800: "#0f131d",
          700: "#181e2b",
        },
        lime: {
          neon: "#00FF66",
          bright: "#39FF14",
          electric: "#CCFF00",
          glow: "rgba(0, 255, 102, 0.25)",
        },
        pureWhite: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 2s infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
      },
      boxShadow: {
        "neon-sm": "0 0 10px rgba(0, 255, 102, 0.35)",
        "neon-md": "0 0 20px rgba(0, 255, 102, 0.45)",
        "neon-lg": "0 0 35px rgba(0, 255, 102, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
