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
        charcoal: {
          DEFAULT: "#1a1a2e",
          50: "#f0f0f5",
          100: "#d6d6e8",
          200: "#adadd1",
          300: "#8484ba",
          400: "#5b5ba3",
          500: "#32328c",
          600: "#292975",
          700: "#20205e",
          800: "#171747",
          900: "#1a1a2e",
        },
        cream: {
          DEFAULT: "#faf3e0",
          50: "#fffef9",
          100: "#fefcf0",
          200: "#fdf8e1",
          300: "#faf3e0",
          400: "#f7ead0",
          500: "#f4e0bc",
        },
        terracotta: {
          DEFAULT: "#c4754b",
          50: "#fdf3ee",
          100: "#fae3d3",
          200: "#f5c9a9",
          300: "#edaa7d",
          400: "#e08952",
          500: "#c4754b",
          600: "#a85e38",
          700: "#8c4b2b",
          800: "#703a21",
          900: "#582e19",
        },
        sage: {
          DEFAULT: "#87a878",
          50: "#f3f7f1",
          100: "#e2eedd",
          200: "#c3dcba",
          300: "#a5ca98",
          400: "#87a878",
          500: "#6d8f5e",
          600: "#567549",
          700: "#445d39",
          800: "#34472c",
          900: "#283722",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "hair-strand": "hairStrand 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        hairStrand: {
          "0%, 100%": { transform: "rotate(-15deg) scaleY(1)" },
          "50%": { transform: "rotate(15deg) scaleY(1.1)" },
        },
      },
      backgroundImage: {
        "gradient-warm":
          "linear-gradient(135deg, #1a1a2e 0%, #2d1b3d 50%, #1a1a2e 100%)",
        "gradient-cream":
          "linear-gradient(180deg, #faf3e0 0%, #f4e0bc 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
