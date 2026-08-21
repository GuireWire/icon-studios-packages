"use client";

import { Button } from "./ui/button";
import { cn } from "./lib/utils";
import { useFormStatus } from "react-dom";
import { LoaderCircle, CircleUserRound } from "lucide-react";
import { GoogleIcon, AppleIcon, FacebookIcon } from "./icons";
import Link from "next/link";

interface iAppProps {
  text: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function SubmitButton({
  text,
  variant,
  className,
  disabled,
  icon,
}: iAppProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button
      type="submit"
      variant={variant}
      className={cn("relative", className)}
      disabled={isDisabled}
    >
      <span
        className={`flex items-center justify-center ${
          isDisabled ? "invisible" : ""
        }`}
      >
        {icon}
        <span className={icon ? "ml-2" : ""}>{text}</span>
      </span>
      {isDisabled && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoaderCircle className="size-4 animate-spin" />
        </span>
      )}
    </Button>
  );
}

// `pending` is an explicit prop, not just useFormStatus()'s own pending —
// these buttons no longer sit inside a Server Action `<form action={fn}>`
// (see InitialView's handleOAuthSignIn), and useFormStatus() only reports
// anything inside that specific Actions-API form pattern. Kept as a
// fallback for any future action-form usage; the explicit prop wins when
// passed.
export function GoogleAuthButton({
  pending: pendingProp,
}: { pending?: boolean } = {}) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingProp ?? formPending;

  return (
    <>
      {pending ? (
        <Button disabled variant={"outline"} className="w-full">
          <LoaderCircle className="size-4 animate-spin" />
        </Button>
      ) : (
        <Button variant={"outline"} className="w-full" type="submit">
          <GoogleIcon className="size-4 mr-2" />
          Continue with Google
        </Button>
      )}
    </>
  );
}

export function AppleAuthButton({
  pending: pendingProp,
}: { pending?: boolean } = {}) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingProp ?? formPending;

  return (
    <>
      {pending ? (
        <Button disabled variant={"outline"} className="w-full">
          <LoaderCircle className="size-4 animate-spin" />
        </Button>
      ) : (
        <Button variant={"outline"} className="w-full" type="submit">
          <AppleIcon className="size-4 mr-2" />
          Continue with Apple
        </Button>
      )}
    </>
  );
}

export function FacebookAuthButton({
  pending: pendingProp,
}: { pending?: boolean } = {}) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingProp ?? formPending;

  return (
    <>
      {pending ? (
        <Button disabled variant={"outline"} className="w-full">
          <LoaderCircle className="size-4 animate-spin" />
        </Button>
      ) : (
        <Button variant={"outline"} className="w-full" type="submit">
          <FacebookIcon className="size-4 mr-2" />
          Continue with Facebook
        </Button>
      )}
    </>
  );
}

// Not a form submit like the others above (no server action, no pending
// state to show) — a plain navigation into the guest-browsable /book
// experience. Only rendered on the landing page's own AuthModel instances;
// the Phase 3/4 action gates inside /book explicitly suppress it, since a
// guest who hit one of those is already in the guest experience. See
// Planning/V2/Phase4GuestChrome.md.
export function GuestButton() {
  return (
    <Button variant="outline" className="w-full" asChild>
      <Link href="/book">
        <CircleUserRound className="size-5 mr-2 light:invert" />
        Continue as Guest
      </Link>
    </Button>
  );
}
