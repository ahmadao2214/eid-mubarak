/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Eid Meme Maker brand palette
        eid: {
          dark: "#1a1a2e",
          gold: "#FFD700",
          pink: "#FF69B4",
          green: "#00C853",
          blue: "#2196F3",
          "trucker-yellow": "#F5A623",
        },
      },
    },
  },
  plugins: [],
};
