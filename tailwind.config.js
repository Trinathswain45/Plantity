module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#0a0b0f",
          900: "#0f1118",
          850: "#141723",
          800: "#1a1f2f",
          700: "#242a3f",
          500: "#3b4563",
          300: "#a3adc2"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(82, 135, 255, 0.25)",
        soft: "0 20px 60px rgba(0,0,0,0.4)"
      },
      backgroundImage: {
        "radial-night": "radial-gradient(circle at top left, rgba(82, 135, 255, 0.25), transparent 45%), radial-gradient(circle at 20% 80%, rgba(82, 255, 170, 0.12), transparent 50%)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        shimmer: "shimmer 12s linear infinite",
        fadeUp: "fadeUp 0.8s ease forwards"
      }
    }
  },
  plugins: []
};
