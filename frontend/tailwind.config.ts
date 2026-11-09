import type { Config } from "tailwindcss";

const v = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: v("border"), input: v("border"), ring: v("ring"),
        background: v("background"), foreground: v("foreground"),
        primary: { DEFAULT: v("primary"), foreground: v("primary-foreground") },
        muted: { DEFAULT: v("muted"), foreground: v("muted-foreground") },
        card: { DEFAULT: v("card"), foreground: v("foreground") },
        destructive: { DEFAULT: v("danger"), foreground: v("primary-foreground") },
        success: v("success"), warning: v("warning"), danger: v("danger"),
        sidebar: { DEFAULT: v("sidebar"), foreground: v("sidebar-foreground"), active: v("sidebar-active") },
      },
      borderRadius: { lg: "0.75rem", md: "0.5rem", sm: "0.375rem" },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
