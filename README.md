# icon-studios-packages

Shared packages published to GitHub Packages and consumed by `bookings-icon-studios`, `website-icon-studios`, and future marketing/booking repos. See `bookings-icon-studios/Planning/V2/AuthModelAndConsentPackaging.md` and `AuthModelPackagingImplementation.md` for the reasoning behind what's packaged here and why.

## Packages

- **`@iconstudios/auth-widget`**: the real customer sign-in/registration flow (magic-link email, phone verification, Google/Apple/Facebook OAuth), extracted from `bookings-icon-studios`. `bookings-icon-studios` itself consumes this too — there is exactly one implementation, not a separate copy kept locally.
