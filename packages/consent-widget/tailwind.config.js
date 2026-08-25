/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  // No `darkMode`/`plugins` — this only generates the utility classes this
  // package's own source references, including the plain Tailwind strings
  // passed into @c15t/nextjs's `theme.slots` (z-[60], p-3 sm:p-6, rounded-lg,
  // text-destructive-foreground, etc. in ConsentManager.tsx) — @c15t/ui's
  // resolveStyles()/mergeStyles() applies a bare slot string directly as a
  // className, so it needs real generated CSS the same as any JSX
  // className would, even though it's sitting in a plain object literal
  // rather than a className="..." attribute. Colors reference
  // hsl(var(--x)) exactly like bookings-icon-studios/website-icon-studios's
  // own tailwind.config.ts, so the generated CSS reads whatever theme
  // values the *consuming app* defines — this package ships zero color
  // values of its own.
  //
  // Prefixed (not `important`-scoped like auth-widget) because ConsentDialog
  // itself comes from @c15t/nextjs, portals via its own internal
  // createPortal call, and exposes no container override — there's no DOM
  // ancestor we can scope against. A uniquely-prefixed class name can never
  // collide with the consuming app's own same-named utility regardless of
  // where c15t decides to render it. Every literal class string in this
  // package's own source (CookieSettingsButton.tsx, this file's theme.slots
  // above) must carry this prefix too — Tailwind only generates the
  // prefixed form once this is set. See
  // Planning/V2/AuthConsentWidgetTailwindScoping.md in bookings-icon-studios.
  prefix: "cw-",
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
};
