import type { Config } from "tailwindcss";

const config: Config = {
 darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",

  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
      },
      borderRadius: {
        lg: "6px",
        md: "4px",
        sm: "2px",
      },

      colors: {
        /* ================= NIC CORE THEME ================= */

        nic: {
          primary: "#005EA5",       // NIC Blue
          secondary: "#003366",     // Dark Navy
          accent: "#2B8CC4",        // Light Blue
          success: "#2E7D32",
          danger: "#C62828",
          warning: "#ED6C02",
          bg: "#F4F7FB",
          border: "#D6DCE5",
          text: "#1F2937",
        },

        /* ================= SYSTEM COLORS ================= */

        background: "#F4F7FB",
        foreground: "#1F2937",

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },

        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },

        primary: {
          DEFAULT: "#005EA5",
          foreground: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#003366",
          foreground: "#FFFFFF",
        },

        muted: {
          DEFAULT: "#E9EDF3",
          foreground: "#5B6B7C",
        },

        accent: {
          DEFAULT: "#2B8CC4",
          foreground: "#FFFFFF",
        },

        destructive: {
          DEFAULT: "#C62828",
          foreground: "#FFFFFF",
        },

        border: "#D6DCE5",
        input: "#D6DCE5",
        ring: "#2B8CC4",

        chart: {
          "1": "#005EA5",
          "2": "#2B8CC4",
          "3": "#003366",
          "4": "#2E7D32",
          "5": "#ED6C02",
        },

        /* WB GOV kept */

        wb: {
          primary: "#8B1D18",
          secondary: "#C9A227",
          blue: "#1F4E79",
          success: "#2E7D32",
          bg: "#F6F7F9",
          border: "#E1E4E8",
        },
      },

      /* ================= ANIMATIONS ================= */

      keyframes: {
        marquee: {
        '0%': { transform: 'translateX(0%)' },
        '100%': { transform: 'translateX(-33.33%)' }, // Moves exactly 1/3rd (one message width) before looping
      },
        scroll: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },

        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },

        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        scroll: "scroll var(--scroll-duration) linear infinite",
        "spin-slow": "spin 2s linear infinite",
        marquee: 'marquee linear infinite',
      },
    },
  },

  /* ================= BOOTSTRAP COLORS (UNCHANGED) ================= */

  extend: {
    colors: {
      bsblue: "#2196f3",
      bsindigo: "#3f51b5",
      bspurple: "#9c27b0",
      bspink: "#e91e63",
      bsred: "#f44336",
      bsorange: "#ff9800",
      bsyellow: "#ffeb3b",
      bsgreen: "#4caf50",
      bsteal: "#009688",
      bscyan: "#00bcd4",
      bswhite: "#fff",
      bsgray: "#6c757d",
      bsgraydark: "#343a40",
      bsprimary: "#005EA5",
      bssecondary: "#6c757d",
      bssuccess: "#2E7D32",
      bsinfo: "#2B8CC4",
      bswarning: "#ED6C02",
      bsdanger: "#C62828",
      bslight: "#f8f9fa",
      bsdark: "#212529",
    },

    borderRadius: {
      lg: "6px",
      md: "4px",
      sm: "2px",
    },

    keyframes: {
      "accordion-down": {
        from: { height: "0" },
        to: { height: "var(--radix-accordion-content-height)" },
      },

      scroll: {
        "0%": { transform: "translateY(100%)" },
        "100%": { transform: "translateY(-100%)" },
      },

      "scroll-up": {
        "0%": { transform: "translateY(100%)" },
        "100%": { transform: "translateY(-100%)" },
      },

      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: "0" },
      },
    },
    
  },

  plugins: [require("tailwindcss-animate")],
};

export default config;
