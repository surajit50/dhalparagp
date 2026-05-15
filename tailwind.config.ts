import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

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
        blue: colors.orange,
        indigo: colors.orange,
        sky: colors.orange,
        cyan: colors.amber,
        teal: colors.amber,
        
        /* ================= NIC CORE THEME ================= */

        nic: {
          primary: "#F97316",       // Saffron / Orange-500
          secondary: "#C2410C",     // Dark Saffron / Orange-700
          accent: "#FB923C",        // Light Saffron / Orange-400
          success: "#2E7D32",
          danger: "#C62828",
          warning: "#ED6C02",
          bg: "#FFF7ED",            // Orange-50
          border: "#FED7AA",        // Orange-200
          text: "#1F2937",
        },

        /* ================= SYSTEM COLORS ================= */

        background: "#FFF7ED",      // Orange-50
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
          DEFAULT: "#F97316",       // Saffron
          foreground: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#C2410C",       // Dark Saffron
          foreground: "#FFFFFF",
        },

        muted: {
          DEFAULT: "#FFEDD5",       // Orange-100
          foreground: "#9A3412",    // Orange-800
        },

        accent: {
          DEFAULT: "#FB923C",       // Light Saffron
          foreground: "#FFFFFF",
        },

        destructive: {
          DEFAULT: "#C62828",
          foreground: "#FFFFFF",
        },

        border: "#FED7AA",          // Orange-200
        input: "#FED7AA",           // Orange-200
        ring: "#F97316",            // Saffron

        chart: {
          "1": "#F97316",
          "2": "#FB923C",
          "3": "#C2410C",
          "4": "#2E7D32",
          "5": "#ED6C02",
        },

        /* WB GOV kept */

        wb: {
          primary: "#8B1D18",
          secondary: "#C9A227",
          blue: "#F97316",          // Changed to Saffron
          success: "#2E7D32",
          bg: "#FFF7ED",
          border: "#FED7AA",
        },

        /* ================= BOOTSTRAP COLORS ================= */
        bsblue: "#F97316",          // Saffron
        bsindigo: "#C2410C",        // Dark Saffron
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
        bsprimary: "#F97316",       // Saffron
        bssecondary: "#6c757d",
        bssuccess: "#2E7D32",
        bsinfo: "#FB923C",          // Light Saffron
        bswarning: "#ED6C02",
        bsdanger: "#C62828",
        bslight: "#FFF7ED",
        bsdark: "#212529",
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

        "scroll-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(-100%)" },
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
        "scroll-up": "scroll-up var(--scroll-duration) linear infinite",
        "spin-slow": "spin 2s linear infinite",
        marquee: 'marquee linear infinite',
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};

export default config;
