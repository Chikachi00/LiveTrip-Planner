import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1E293B",
        mist: "#EEF4F3",
        cloud: "#F8FAFC",
        flight: "#2563EB",
        coral: "#F9735B",
        moss: "#3F7D58",
        sun: "#F5B041",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(30, 41, 59, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
