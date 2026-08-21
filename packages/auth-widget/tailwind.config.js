/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  // Must match the consuming app's own strategy (both bookings-icon-studios
  // and website-icon-studios use `darkMode: ["class"]`, toggled via
  // next-themes' attribute="class"). Leaving this unset silently falls back
  // to Tailwind's default "media" strategy — dark:* rules would then key off
  // the OS/browser's prefers-color-scheme instead of the site's own toggle,
  // which is how AppleIcon's dark:invert ended up never firing regardless of
  // the app's actual theme state. Colors reference hsl(var(--x)) exactly
  // like the consuming apps' own tailwind.config.ts, so the generated CSS
  // reads whatever theme values the *consuming app* defines — this package
  // ships zero color values of its own.
  darkMode: ["class"],
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // Dialog/DropdownMenu use animate-in/animate-out/fade-*/zoom-*/slide-*
  // from this plugin (radix data-state open/close transitions) — without
  // it those classes generate nothing and the animations silently no-op.
  plugins: [require("tailwindcss-animate")],
};
