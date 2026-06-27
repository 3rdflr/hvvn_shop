import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Solid black + chrome (Y2K metal gothic) palette — preserved from hvvn.
        paper: "#000000", // base (page bg)
        ink: "#f2f2f5", // chrome white (primary text / chrome buttons)
        muted: "#8a8a92", // muted grey
        line: "#262626", // hairlines on black
        sand: "#0d0d0d", // lifted panel / card surface
        accent: "#cfcfd6", // steel highlight
        velvetDeep: "#000000",
        velvetGlow: "#1a1a1a",
        chrome: "#dcdce4",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        gothic: ["var(--font-gothic)", "var(--font-serif)", "serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      maxWidth: {
        page: "1280px",
      },
      dropShadow: {
        chrome: "0 2px 10px rgba(120,130,220,0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
