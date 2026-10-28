/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18332D",
        surface: "#F4F8F6",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#087F5B",
          light: "#2A9D8F",
          dark: "#18332D",
        },
        accent: {
          DEFAULT: "#2A9D8F",
          light: "#A8DED3",
        },
        warn: "#E2A63A",
        severity: {
          low: "#3E8E5A",
          moderate: "#D9A441",
          high: "#DB7A3B",
          emergency: "#B23A3A",
        },
        line: "#DCE9E4",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 12px 34px rgba(24, 51, 45, 0.06)",
        raised: "0 20px 50px rgba(24, 51, 45, 0.12)",
      },
    },
  },
  plugins: [],
}
