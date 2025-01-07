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
    animation: {
      'fade-in': 'fadeIn 0.3s ease-in-out',
      'fade-out': 'fadeOut 0.3s ease-in-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
    },
  },
};
export const plugins = [];
