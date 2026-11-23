import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Indian Government Website Color Palette
        govBlue: {
          950: "#001a33",
          900: "#00205B",
          800: "#003366",
          700: "#004080",
          600: "#004d99",
          500: "#0066cc",
        },
        saffron: {
          DEFAULT: "#FF9933",
          light: "#FFB366",
          dark: "#E68A2E",
          glow: "rgba(255, 153, 51, 0.25)",
        },
        indiaGreen: {
          DEFAULT: "#138808",
          light: "#1aa00a",
          dark: "#0e6606",
        },
        cream: "#F5F5F0",
        pureWhite: "#FFFFFF",
        darkText: "#1a1a1a",
        bodyText: "#333333",
        mutedText: "#666666",
        borderLight: "#DDDDDD",
        borderMedium: "#CCCCCC",
        lightBg: "#F0F0F0",
        lightBlueBg: "#E8F0FE",
      },
      fontFamily: {
        sans: ["Calibri", "Trebuchet MS", "system-ui", "sans-serif"],
        mono: ["Consolas", "monospace"],
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
        "gov-sm": "0 1px 3px rgba(0, 32, 91, 0.12)",
        "gov-md": "0 4px 12px rgba(0, 32, 91, 0.15)",
        "gov-lg": "0 8px 25px rgba(0, 32, 91, 0.18)",
        "saffron-sm": "0 2px 8px rgba(255, 153, 51, 0.2)",
        "saffron-md": "0 4px 16px rgba(255, 153, 51, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
