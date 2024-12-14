import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
          light: "#0044F1",
          dark: "#000014",
          background: "#FDFDFD",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "#7FA1F8",
          neutral: "#EAEAEA",
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
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        slate: {
          "50": "#F8FAFC",
          "100": "#F1F5F9",
          "200": "#E2E8F0",
          "300": "#CBD5E1",
          "400": "#94A3B8",
          "500": "#64748B",
          "600": "#475569",
          "700": "#334155",
          "800": "#1E293B",
          "900": "#0F172A",
          "1000": "#020617",
        },
        gray: {
          "50": "#F9FBFC",
          "100": "#F3F4F6",
          "200": "#E5E7EB",
          "300": "#D1D5DB",
          "400": "#9CA3AF",
          "500": "#6B7280",
          "600": "#4B5563",
          "700": "#374151",
          "800": "#1F2937",
          "900": "#111827",
          "1000": "#030712",
        },
        blue: {
          "50": "#F2F6FE",
          "100": "#E5ECFE",
          "200": "#CCD4FC",
          "300": "#B2C7FB",
          "400": "#99B4F9",
          "500": "#80A1F8",
          "600": "#6688F7",
          "700": "#4D7CF5",
          "800": "#3369F4",
          "900": "#1A57F2",
          "1000": "#0044F1",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": {
            transform: "rotate(-10deg)",
          },
          "50%": {
            transform: "rotate(10deg)",
          },
        },
        rotateFullClockWise: {
          from: {
            transform: "rotate(0deg)",
            opacity: "0",
          },
          to: {
            transform: "rotate(180deg)",
            opacity: "1",
          },
        },
        rotateFullAntiClockWise: {
          from: {
            transform: "rotate(180deg)",
            opacity: "0",
          },
          to: {
            transform: "rotate(0deg)",
            opacity: "1",
          },
        },
        slidTo1: {
          to: {
            bottom: "1.5rem",
          },
        },
        slideTo5: {
          to: {
            bottom: "5rem",
            opacity: "1",
          },
        },
        slideTo9: {
          to: {
            bottom: "8.9rem",
            opacity: "1",
          },
        },
        rotateFull: {
          from: {
            transform: "rotate(0deg)",
            opacity: "0",
          },
          to: {
            transform: "rotate(360deg)",
            opacity: "1",
          },
        },
        scrollH: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },
      },
      animation: {
        wiggle: "wiggle 200ms ease-in-out infinite",
        rotateFullClockWise: "rotateFullClockWise 400ms ease-in-out",
        rotateFullAntiClockWise: "rotateFullAntiClockWise 400ms ease-in-out",
        slideTo5: "slideTo5 300ms ease-in forwards",
        slideTo9: "slideTo9 300ms ease-in forwards",
        slideTo1: "slidTo1 300ms ease-in forwards",
        rotate360: "rotateFull 2s linear infinite",
        horizontalScroll: "scrollH 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
