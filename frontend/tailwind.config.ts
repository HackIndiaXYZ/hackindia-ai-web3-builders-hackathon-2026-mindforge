import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "secondary-surface": "var(--secondary-surface)",
        border: "var(--border)",
        "primary-text": "var(--primary-text)",
        "secondary-text": "var(--secondary-text)",
        "muted-text": "var(--muted-text)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
        },
        semantic: {
          success: "var(--success)",
          "success-subtle": "var(--success-subtle)",
          warning: "var(--warning)",
          "warning-subtle": "var(--warning-subtle)",
          error: "var(--error)",
          "error-subtle": "var(--error-subtle)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["GeistMono", "JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.25rem" }],
        sm: ["0.9375rem", { lineHeight: "1.375rem" }],
        base: ["1.0625rem", { lineHeight: "1.625rem" }],
        lg: ["1.25rem", { lineHeight: "1.75rem" }],
        xl: ["1.4375rem", { lineHeight: "1.875rem" }],
        "2xl": ["1.6875rem", { lineHeight: "2.125rem" }],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        elevated: "0 4px 12px 0 rgba(0, 0, 0, 0.06)",
        modal: "0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(1.2)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
