import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Softened TMG Yamal identity — warm teal-stone base, hazy editorial calm
        obsidian: "#0E1618", // warm deep teal-charcoal (was near-black)
        surface: "#18201F", // warm card fill
        aqua: "#2E7C8B", // softened Gulf aqua
        "aqua-soft": "#6FA9B2", // pale lagoon mist
        gold: "#C9A96A", // champagne gold (softened metallic)
        travertine: "#CBB6A0", // warm travertine sand
        cream: "#F1EADD", // editorial off-white
        muted: "#94A0A2", // cool-warm body
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
          "0 0 0 1px rgba(201,169,106,0.35), 0 0 44px -8px rgba(201,169,106,0.28)",
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
