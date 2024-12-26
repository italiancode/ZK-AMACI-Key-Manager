/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}",
];
export const theme = {
  extend: {
    colors: {
      bg: {
        primary: "#1a1b26",
        secondary: "#24283b",
        success: "#9ece6a",
        danger: "#f44336",
        warning: "#e0af68",
        accent: "#f99e1c",
      },
      text: {
        primary: "#a9b1d6",
        secondary: "#7dcfff",
        success: "#9ece6a",
        danger: "#f7768e",
        warning: "#e0af68",
      },
      primary: "#1a1b26",
      secondary: "#24283b",
      success: "#9ece6a",
      danger: "#f44336",
      warning: "#e0af68",
      accent: "#f99e1c",
    },
  },
};
export const plugins = [];
