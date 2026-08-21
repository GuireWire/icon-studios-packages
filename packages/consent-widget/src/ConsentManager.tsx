"use client";

import {
  ConsentDialog,
  ConsentManagerProvider,
  type ColorTokens,
  type Theme,
} from "@c15t/nextjs";
import type { ReactNode } from "react";
import { ConsentBannerCollapsible } from "./ConsentBannerCollapsible";

// c15t renders dark mode as `{...colors, ...dark}` (see @c15t/ui theme/utils),
// so any key missing from `dark` falls back to c15t's own hardcoded indigo/
// black defaults rather than this site's theme — not just an unstyled gap.
// Using the same CSS-var-backed tokens for both light and dark works because
// each var (e.g. --primary) is already redefined per color scheme by the
// site's own theme injection, same as bg-primary/text-muted-foreground/etc.
// resolve correctly in both modes elsewhere (see AuthModel.tsx's DialogContent).
const consentColors: ColorTokens = {
  primary: "hsl(var(--primary))",
  primaryHover: "hsl(var(--primary) / 0.9)", // matches Button's hover:bg-primary/90
  surface: "hsl(var(--card))",
  surfaceHover: "hsl(var(--accent))",
  border: "hsl(var(--border))",
  borderHover: "hsl(var(--border))",
  text: "hsl(var(--card-foreground))",
  textMuted: "hsl(var(--muted-foreground))",
  // Button.tsx intentionally uses text-destructive-foreground (not
  // primary-foreground) on primary buttons — primary-foreground is near-black
  // in dark mode and would be unreadable on the teal primary background.
  textOnPrimary: "hsl(var(--destructive-foreground))",
  overlay: "hsla(0, 0%, 0%, 0.8)", // matches DialogOverlay's bg-black/80
  switchTrack: "hsl(var(--input))",
  switchTrackActive: "hsl(var(--primary))",
  switchThumb: "hsl(var(--background))",
};

const theme: Theme = {
  colors: consentColors,
  dark: consentColors,
  shadows: {
    sm: "none",
    md: "none",
    lg: "none",
  },
  consentActions: {
    accept: { variant: "primary", mode: "filled" },
  },
  // Tighter padding on narrow screens so the banner takes up less vertical
  // space there — matches the default at sm: and up, only mobile shrinks.
  slots: {
    // Above Dialog/AlertDialog, which are both z-50. At equal z-index the
    // dialog wins on DOM order — Radix portals its overlay to the end of
    // <body>, after the banner — so the overlay sits on top and swallows every
    // click, leaving the buttons visibly hoverable but dead. That matters more
    // than usual here: until consent is answered the banner cannot be
    // dismissed, so anyone who opens a modal first is stuck with both on
    // screen and neither resolvable.
    consentBanner: "z-[60]",
    consentBannerOverlay: "z-[60]",
    consentBannerCard: "p-3 sm:p-6",
    // The footer block holding the action buttons renders square-cornered by
    // default, which reads as a hard rectangle against the card's rounded
    // edge — round it to match.
    consentBannerFooter: "rounded-lg",
    // textOnPrimary above is already set to destructive-foreground (near-white
    // in every theme config), but it doesn't reach filled primary buttons —
    // set it directly on the slot instead so Accept All is actually readable
    // on the teal background. Same reasoning as Button.tsx's own use of
    // text-destructive-foreground over primary-foreground.
    buttonPrimary: "text-destructive-foreground",
    // Customize/Reject aren't primary, so buttonPrimary above doesn't reach
    // them — ConsentActionStyle only exposes variant/mode, no colour, so the
    // slot is the only way to set their text colour.
  },
};

export function ConsentManager({ children }: { children: ReactNode }) {
  return (
    <ConsentManagerProvider
      options={{
        mode: "hosted",
        backendURL: "/api/c15t",
        consentCategories: ["necessary", "marketing"],
        theme,
      }}
    >
      <ConsentBannerCollapsible />
      <ConsentDialog />
      {children}
    </ConsentManagerProvider>
  );
}
