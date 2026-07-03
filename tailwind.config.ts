import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // mezzeMarin marka lacivardi/mavisi
        brand: {
          50: "#eef3fb",
          100: "#d6e2f5",
          200: "#aec5ea",
          500: "#2a5aa8",
          600: "#1f4a91",
          700: "#1b3f7a",
          800: "#163566",
          900: "#102950",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
