import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Authentic TMG Yamal identity — deep royal navy + metallic gold, softened
        obsidian: "#0A1E3F", // softened deep navy canvas / fog
        navy: "#12305F", // TMG brand band navy
        surface: "#122A50", // navy glass card fill
        aqua: "#4E7BA8", // brand steel/coastal blue accent
        "aqua-soft": "#89A7C6", // pale coastal highlight
        gold: "#C6A45C", // TMG metallic gold
        "gold-soft": "#E3CE93", // gold gradient highlight
        travertine: "#CBB6A0", // warm travertine sand
        cream: "#F4F1EA", // editorial off-white
        muted: "#9AA7BD", // blue-gray body
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.25em",
        mega: "0.4em",
      },
      boxShadow: {
        glass: "0 40px 80px -24px rgba(0,0,0,0.7)",
        goldrim:
          "0 0 0 1px rgba(198,164,92,0.4), 0 0 44px -8px rgba(198,164,92,0.3)",
      },
      backdropBlur: {
        "2xl": "40px",
      },
      transitionTimingFunction: {
        gallery: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        floatIn: "floatIn 1s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
