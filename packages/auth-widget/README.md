# @iconstudios/auth-widget

The real Icon Studios sign-in/registration flow (magic-link email, phone
verification, Google/Apple/Facebook OAuth), packaged so any Next.js/React
client landing page can embed it. It's the same component that runs in
`bookings-icon-studios` itself, not a reimplementation, and it's the entry
route for both customer accounts and staff accounts (barbers, owners,
admins). There's nothing customer-specific baked in; which role a signed-in
user ends up as is decided entirely by their account on the
`bookings-icon-studios` side.

**This is not a general-purpose auth widget.** It only works when
`/api/auth/*` on the consuming site resolves (directly or via a rewrite)
to a real, running `bookings-icon-studios` instance for that client. The
package ships zero backend: no database, no OAuth app registration, no
email/SMS sending. See "How it actually works" below before integrating.

## Install

```bash
npm install @iconstudios/auth-widget
```

Peer dependencies you need already installed:

```bash
npm install next@">=15" next-auth@"^5.0.0-beta.29" react@">=18" react-dom@">=18"
```

`next-auth` is pinned to a beta range because next-auth v5 itself hasn't
shipped a stable release yet, that isn't a looseness we chose, it's the
current state of that dependency upstream. Tested against Next.js 15.5.x;
`>=14` in `peerDependencies` is a permissive floor, not a verified claim.

## Setup (3 things, in addition to the peer deps)

### 1. Import the stylesheet once

```ts
// app/layout.tsx (or wherever your global CSS is imported)
import "@iconstudios/auth-widget/style.css";
```

The package's components use Tailwind utility classes that reference CSS
custom properties (`hsl(var(--primary))`, etc.). This stylesheet is only
those utility classes, generated from the package's own source. It does
**not** define the actual color values. Your app's own `globals.css` must
already define the shadcn/ui token set:

```css
:root {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  --primary-foreground: ...;
  --secondary: ...;
  --muted: ...;
  --muted-foreground: ...;
  --accent: ...;
  --accent-foreground: ...;
  --destructive: ...;
  --destructive-foreground: ...;
  --border: ...;
  --input: ...;
  --ring: ...;
  --card: ...;
  --card-foreground: ...;
  --popover: ...;
  --popover-foreground: ...;
  --radius: ...;
}
```

(Standard shadcn/ui `init` output already has these. If your app already
uses shadcn/ui components, you're covered.)

### 2. A `next-auth` `SessionProvider` ancestor

Two options:

- **You already have your own `<SessionProvider>`** wrapping the app (like
  `bookings-icon-studios` and `website-icon-studios` both do). Use the
  bare `<AuthModel>` export directly. Don't wrap it in another provider,
  that nests a redundant second session context.
- **You don't have one.** Use `<AuthWidget>` instead. Identical props, but
  it bundles its own scoped `SessionProvider` so it works standalone.

### 3. Proxy `/api/auth/*` to the real backend

In `next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: "/api/auth/:path*",
      destination: `${process.env.BOOKINGS_APP_URL}/api/auth/:path*`,
    },
  ];
}
```

`BOOKINGS_APP_URL` is that specific client's own running
`bookings-icon-studios` deployment. This makes `/api/auth/*` same-origin
from the browser's perspective (even though it's proxied), so cookies set
by sign-in are shared correctly with `/book` on the same domain, no CORS
or third-party-cookie issues. See `website-icon-studios/next.config.ts`
for the real, working example.

## Usage

```tsx
import { AuthModel } from "@iconstudios/auth-widget";
// or: import { AuthWidget as AuthModel } from "@iconstudios/auth-widget";

<AuthModel
  trigger
  buttonText="Sign In"
  buttonSize="lg"
  logo={content.navbar.logo}
  brandName={content.navbar.brand.name}
  brandNameHighlight={content.navbar.brand.nameHighlight}
  dialogTitle={content.authmodal.dialog.title}
  dialogDescription={content.authmodal.dialog.description}
/>
```

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `trigger` | `boolean` | `true` | Renders its own button that opens the dialog. Pass `false` if you're driving `open`/`onOpenChange` yourself. |
| `buttonText` | `string` | `"Sign In"` | Only shown when `trigger` is true. |
| `buttonSize` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | |
| `buttonClassName` | `string` | | |
| `open` / `onOpenChange` | `boolean` / `(open: boolean) => void` | | Pass both to drive the dialog externally instead of via `trigger`. |
| `openOnSession` | `boolean` | `false` | Auto-opens to finish onboarding (register/verify-phone/reactivate) when an existing session is incomplete. Used for post-OAuth interstitials, not a typical landing-page trigger. |
| `callbackUrl` | `string` | `"/book"` | Where to land after a successful sign-in. |
| `showContinueAsGuest` | `boolean` | `true` | Set `false` inside an already-in-progress flow that specifically requires an account. |
| `logo` | `string` | | URL/path to the shop's logo. Omit both `logo` and `brandName` to skip the header entirely. |
| `brandName` | `string \| { image: string }` | | Either text (pairs with `brandNameHighlight`) or a wordmark image. |
| `brandNameHighlight` | `string` | | Only used when `brandName` is a string. |
| `dialogTitle` / `dialogDescription` | `string` | `"Sign in or create an account"` / `"Sign in or create an account to continue."` | |

## How it actually works

This package is one half of a pair. The other half, the actual account
database, OAuth provider registration, email/SMS sending, and every custom
route the sign-in flow calls (`register`, `add-phone`,
`send-verification-code`, `verify-phone`, `reactivate`), lives entirely in
that client's `bookings-icon-studios` deployment. This package renders the
UI and calls `next-auth`'s client SDK (`signIn()`, `useSession()`); the
`/api/auth/*` rewrite is what makes those calls actually reach a real
backend, and what role a signed-in user gets (customer, barber, owner,
admin) is entirely determined by their account record there, not by
anything in this package. There's no way to use this package without a
paired `bookings-icon-studios` instance already running somewhere.

If your landing page isn't Next.js/React (WordPress, or anything built by
an outside agency in a different stack), this package isn't for you. See
the iframe and embed-script integration instead (Tier 2), served directly
by `bookings-icon-studios`.
