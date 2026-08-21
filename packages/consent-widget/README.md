# @iconstudios/consent-widget

The real Icon Studios cookie-consent banner and preferences dialog (c15t),
packaged so any Next.js/React landing page can embed it, whether that's
`website-icon-studios` or a bespoke site built for one client. It's the same
component that runs in `bookings-icon-studios` itself, not a
reimplementation.

**This is not a general-purpose consent-management package.** It only works
when `/api/c15t/*` on the consuming site resolves (directly, if you're
`bookings-icon-studios` itself, or via a rewrite otherwise) to a real,
running `bookings-icon-studios` instance for that client. The package ships
zero backend: no database, no consent-record storage. See "How it actually
works" below before integrating.

## Install

```bash
npm install @iconstudios/consent-widget
```

Peer dependencies you need already installed:

```bash
npm install next@">=14" @c15t/nextjs@2.2.0 react@">=18" react-dom@">=18"
```

`@c15t/nextjs` is pinned exact, not a range. That isn't caution for its own
sake: the reason this package exists at all is that `website-icon-studios`
and `bookings-icon-studios` used to each float `^2.1.0` independently, npm
resolved two different patch versions for them, and the two versions'
renamed exports (`CookieBanner` → `ConsentBanner`, `ConsentManagerDialog` →
`ConsentDialog`, plus a dropped `ignoreGeoLocation` option) turned into real
`tsc` failures on one side. Pin exact here so that can't happen again.

## Setup (2 things, in addition to the peer deps)

### 1. Import two stylesheets once

```ts
// app/layout.tsx (or wherever your global CSS is imported)
import "@iconstudios/consent-widget/style.css";
```

```css
/* app/globals.css */
@import "@c15t/nextjs/styles.tw3.css";
```

Two separate imports, two separate reasons:

- `@iconstudios/consent-widget/style.css` covers the Tailwind utility
  classes this package's own source references, including the plain
  strings passed into `@c15t/nextjs`'s `theme.slots` (`z-[60]`, `rounded-lg`,
  `text-destructive-foreground`, etc.) — `@c15t/ui` applies a bare slot
  string as a real `className`, so it needs generated CSS the same as any
  other Tailwind class, even sitting inside a plain object literal instead
  of a `className="..."` attribute.
- `@c15t/nextjs/styles.tw3.css` is `@c15t/nextjs`'s own base stylesheet,
  covering everything its components render that isn't overridden by the
  slots above. This package doesn't ship or re-export it; import it
  directly from `@c15t/nextjs` itself (already a peer dependency).

Your app's own `globals.css` must already define the shadcn/ui token set
this package's theme reads from:

```css
:root {
  --background: ...;
  --card: ...;
  --card-foreground: ...;
  --muted-foreground: ...;
  --accent: ...;
  --primary: ...;
  --destructive-foreground: ...;
  --border: ...;
  --input: ...;
  --radius: ...;
}
```

(Standard shadcn/ui `init` output already has these, and if you've already
set up `@iconstudios/auth-widget` in this app, you're already covered, its
theme reads the same token set.)

### 2. Proxy `/api/c15t/*` to the real backend

Skip this step if you *are* `bookings-icon-studios`: it runs its own c15t
backend locally via `@c15t/backend`, nothing to proxy.

For any other consuming app, in `next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: "/api/c15t/:path*",
      destination: `${process.env.NEXT_PUBLIC_BOOKINGS_APP_URL}/api/c15t/:path*`,
    },
  ];
}
```

`NEXT_PUBLIC_BOOKINGS_APP_URL` is the same env var `@iconstudios/auth-widget`
already needs for its own `/api/auth/*` rewrite: that specific client's
paired `bookings-icon-studios` deployment. One backend per client, so both
proxies point at the same place. If you've already wired up auth-widget in
this app, this var is already set; you're just adding a second rewrite rule
that uses it.

## Usage

```tsx
import { ConsentManager } from "@iconstudios/consent-widget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConsentManager>{children}</ConsentManager>
      </body>
    </html>
  );
}
```

Add a "Cookie Settings" link anywhere (footer is typical) to let visitors
reopen the preferences dialog after their first answer:

```tsx
import { CookieSettingsButton } from "@iconstudios/consent-widget";

<CookieSettingsButton />
```

### Exports

| Export | What it is |
|---|---|
| `ConsentManager` | Wrap your app in this, inside `<body>`, wherever your `globals.css` custom properties (`--primary`, `--card`, etc.) are already in scope. Renders the banner and the preferences dialog, and provides c15t's context to everything inside it, including `CookieSettingsButton` and any direct `@c15t/nextjs` hooks you use yourself, like `useConsentManager()`. |
| `ConsentBannerCollapsible` | The actual banner. Exported separately mainly for import-path stability; `ConsentManager` already renders it for you; you shouldn't need to render it again yourself. No props. Always visible, not collapsed behind a toggle, on every screen size. |
| `CookieSettingsButton` | A plain `<button>` that reopens the preferences dialog via `setActiveUI("dialog")`. Unstyled beyond `hover:underline`; wrap it or restyle it however fits your footer. |

No props on any of these. Colors, copy, and category list are fixed inside
the package (`necessary` + `marketing`, matching what
`bookings-icon-studios` actually asks about) rather than being configurable
per-shop. Unlike `@iconstudios/auth-widget`'s branding props, there's no
per-shop copy here to vary; the banner's job is identical everywhere it's
used.

## How it actually works

This package is one half of a pair. The other half (the actual consent
backend, `@c15t/backend` plus a Postgres adapter, and everything that reads
recorded consent later for a real decision, e.g.
`bookings-icon-studios`'s own marketing-eligibility check) lives entirely
in that client's `bookings-icon-studios` deployment. This package renders
UI and talks to `@c15t/nextjs`'s client SDK
(`ConsentManagerProvider`/`useConsentManager()`); the `/api/c15t/*` proxy is
what makes those calls actually reach a real backend. There's no way to use
this package without a paired `bookings-icon-studios` instance already
running somewhere.

If your landing page isn't Next.js/React (WordPress, or anything built by
an outside agency in a different stack), this package isn't for you. That
site needs its own consent-management integration talking to whatever
backend it's paired with directly.
