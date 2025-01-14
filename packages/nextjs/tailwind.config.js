/** @type {import('tailwindcss').Config} */
module.exports = {
  darkTheme: "dark",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        irishGrover: ["var(--font-irish-grover)"],
        sans: ["sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: "#93BBFB",
          "primary-content": "#2A3655",
          secondary: "#8B45FD",
          "secondary-content": "#7800FF",
          accent: "#93BBFB",
          "accent-content": "#212638",
          neutral: "#212638",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f4f8ff",
          "base-300": "#ffffff",
          "base-content": "#212638",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",
          ".bg-gradient-modal": {
            "background-image":
              "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
          },
          ".bg-modal": {
            background:
              "linear-gradient(270deg, #ece9fb -17.42%, #e3f4fd 109.05%)",
          },
          ".modal-border": {
            border: "1px solid #5c4fe5",
          },
          ".bg-gradient-nav": {
            background: "#000000",
          },
          ".bg-main": {
            background: "#FFFFFF",
          },
          ".bg-underline": {
            background:
              "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
          },
          ".bg-container": {
            background: "transparent",
          },
          ".bg-btn-wallet": {
            "background-image":
              "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
          },
          ".bg-input": {
            background: "rgba(0, 0, 0, 0.07)",
          },
          ".bg-component": {
            background: "rgba(255, 255, 255, 0.55)",
          },
          ".bg-function": {
            background:
              "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
          },
          ".text-function": {
            color: "#3C1DFF",
          },
          ".text-network": {
            color: "#7800FF",
          },
          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
          ".contract-content": {
            background: "white",
          },
        },
      },
      {
        dark: {
          primary: "#212638",
          "primary-content": "#DAE8FF",
          secondary: "#8b45fd",
          "secondary-content": "#0FF",
          accent: "#4969A6",
          "accent-content": "#F9FBFF",
          neutral: "#F9FBFF",
          "neutral-content": "#385183",
          "base-100": "#1C223B",
          "base-200": "#2A3655",
          "base-300": "#141a30",
          "base-content": "#F9FBFF",
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",
          ".bg-gradient-modal": {
            background: "#385183",
          },
          ".bg-modal": {
            background: "linear-gradient(90deg, #2B2243 0%, #253751 100%)",
          },
          ".modal-border": {
            border: "1px solid #4f4ab7",
          },
          ".bg-gradient-nav": {
            "background-image":
              "var(--gradient, linear-gradient(90deg, #42D2F1 0%, #B248DD 100%))",
          },
          ".bg-main": {
            background: "#141A31",
          },
          ".bg-underline": {
            background: "#5368B4",
          },
          ".bg-container": {
            background: "#141a30",
          },
          ".bg-btn-wallet": {
            "background-image":
              "linear-gradient(180deg, #3457D1 0%, #8A45FC 100%)",
          },
          ".bg-input": {
            background: "rgba(255, 255, 255, 0.07)",
          },
          ".bg-component": {
            background:
              "linear-gradient(113deg,rgba(43, 34, 67, 0.6) 20.48%,rgba(37, 55, 81, 0.6) 99.67%)",
          },
          ".bg-function": {
            background: "rgba(139, 69, 253, 0.37)",
          },
          ".text-function": {
            color: "#1DD6FF",
          },
          ".text-network": {
            color: "#D0A6FF",
          },

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
          ".contract-content": {
            background:
              "linear-gradient(113.34deg, rgba(43, 34, 67, 0.6) 20.48%, rgba(37, 55, 81, 0.6) 99.67%)",
          },
        },
      },
    ],
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
};
