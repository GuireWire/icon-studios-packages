"use client";

import type { ComponentProps } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthModel } from "./AuthModel";

// Convenience wrapper for host apps with no next-auth of their own —
// bundles its own scoped SessionProvider so the widget works standalone
// (basePath="/api/auth" assumes the host has a rewrite proxying that path
// to the real bookings-icon-studios deployment, same pattern already used
// for the consent backend).
//
// bookings-icon-studios itself should import AuthModel directly instead —
// it already has a real, app-wide SessionProvider at its root layout, so
// wrapping it again here would just nest a redundant second session
// context under it. See Planning/V2/AuthModelPackagingImplementation.md.
export function AuthWidget(props: ComponentProps<typeof AuthModel>) {
  return (
    <SessionProvider basePath="/api/auth">
      <AuthModel {...props} />
    </SessionProvider>
  );
}
