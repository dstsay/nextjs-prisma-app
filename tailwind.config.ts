import type { Config } from "tailwindcss";
import theme from "./src/config/theme.json";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: theme.colors.default.theme_color.primary,
        secondary: theme.colors.default.theme_color.secondary,
        body: theme.colors.default.theme_color.body,
        border: theme.colors.default.theme_color.border,
        light: theme.colors.default.theme_color.light,
        dark: theme.colors.default.theme_color.dark,
        text: theme.colors.default.text_color.text,
        "text-dark": theme.colors.default.text_color["text-dark"],
        "text-light": theme.colors.default.text_color["text-light"],
      },
      fontFamily: {
        primary: ["DM Sans", "sans-serif"],
      },
      fontSize: {
        base: theme.fonts.font_size.base + "px",
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "540px",
          md: "720px",
          lg: "960px",
          xl: "1140px",
          "2xl": "1320px",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
export default config;