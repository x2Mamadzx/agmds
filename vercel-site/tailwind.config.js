/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#C8922A",
          foreground: "#ffffff",
        },
        background: "#ffffff",
        foreground: "#0a0a0a",
        border: "rgba(0,0,0,0.1)",
        accent: "rgba(200,146,42,0.08)",
        ring: "#C8922A",
        secondary: {
          DEFAULT: "#f4f4f5",
          foreground: "#18181b",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fff",
        },
        muted: {
          DEFAULT: "#f4f4f5",
          foreground: "#71717a",
        },
      },
      backgroundImage: {
        "gradient-gold":
          "linear-gradient(135deg, #C8922A 0%, #F5C842 50%, #C8922A 100%)",
        "gradient-gold-soft":
          "linear-gradient(135deg, #C8922A 0%, #F5C842 100%)",
      },
      container: {
        center: true,
        padding: "1.5rem",
        screens: { "2xl": "1280px" },
      },
      keyframes: {
        shine: {
          "0%": { left: "-100%" },
          "100%": { left: "200%" },
        },
        "gold-border": {
          "0%, 100%": { borderColor: "#C8922A" },
          "50%": { borderColor: "#F5C842" },
        },
        "rotate-border": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "counter-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        shine: "shine 1.5s ease infinite",
        "gold-border": "gold-border 2s ease-in-out infinite",
        "rotate-border": "rotate-border 4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease forwards",
      },
    },
  },
  plugins: [],
};
