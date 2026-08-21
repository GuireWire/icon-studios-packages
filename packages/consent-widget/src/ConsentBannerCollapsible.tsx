"use client";

import { ConsentBanner } from "@c15t/nextjs";

// Used to hide the banner behind a chevron button on mobile that just
// opened the dialog — meaning mobile visitors never actually saw what they
// were agreeing to unless they tapped it first. ConsentBanner already
// supports a shorter description prop directly (no need to touch the
// provider-level i18n config for this), and card padding is tightened
// responsively via theme.slots.consentBannerCard in ConsentManager.tsx —
// so the same banner now renders on every screen size, just more compact.
export function ConsentBannerCollapsible() {
  return (
    <ConsentBanner
      description="We use cookies to improve your experience, for marketing preferences and to show relevant content."
      // Defaults to false, which renders c15t's own "Secured by" attribution
      // tag on the banner. Their brand name isn't part of the translatable
      // securedBy string (that's only the prefix), so hiding is the supported
      // way to keep a third party's name off the site.
      hideBranding
    />
  );
}
