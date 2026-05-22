import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        arecie: {
          // Charte graphique logo ARECIE
          green: "#4caf50", // lettre C
          greenLight: "#e8f5e9",
          greenDark: "#388e3c", // hover / dégradé
          yellow: "#ffc107", // lettre I
          orange: "#f57c00", // lettre E
          charcoal: "#333333", // lettres ARE + textes
          white: "#ffffff",
          gray50: "#f8fafb",
          gray100: "#f1f4f6",
          gray300: "#c8d3da",
          gray600: "#6b7a84",
          gray900: "#333333",
        },
      },
      keyframes: {
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "left" },
          "100%": { backgroundPosition: "right" },
        },
      },
      animation: {
        "fade-slide-up": "fadeSlideUp 0.4s ease-out forwards",
        "fade-slide-up-delay-header":
          "fadeSlideUp 0.4s ease-out 0.1s forwards",
        "fade-slide-up-delay-1": "fadeSlideUp 0.4s ease-out 0.2s forwards",
        "fade-slide-up-delay-2": "fadeSlideUp 0.4s ease-out 0.4s forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite linear",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter var",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        "header-green": "0 4px 20px #4caf5040",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.25rem" }],
        sm: ["0.875rem", { lineHeight: "1.375rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },
    },
  },
  plugins: [],
};
export default config;
