"use client";

import { useConsentManager } from "@c15t/nextjs";

export function CookieSettingsButton() {
  const { setActiveUI } = useConsentManager();

  return (
    <button onClick={() => setActiveUI("dialog")} className="hover:underline">
      Cookie Settings
    </button>
  );
}
