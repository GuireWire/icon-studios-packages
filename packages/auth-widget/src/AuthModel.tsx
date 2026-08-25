"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { AddPhoneView } from "./auth/AddPhoneView";
import { InitialView } from "./auth/InitialView";
import { RegisterView } from "./auth/RegisterView";
import { VerifyPhoneView } from "./auth/VerifyPhoneView";
import { CheckEmailView } from "./auth/CheckEmailView";
import { ReVerifyPhoneView } from "./auth/ReVerifyPhoneView";
import { ReactivateView } from "./auth/ReactivateView";

export type View =
  | "initial"
  | "register"
  | "verify-phone"
  | "add-phone"
  | "check-email"
  | "re-verify-phone"
  | "reactivate";

type ButtonSize = "default" | "sm" | "lg" | "icon";

interface AuthModelProps {
  buttonText?: string;
  buttonSize?: ButtonSize;
  buttonClassName?: string;
  trigger?: boolean;
  openOnSession?: boolean;
  // Controlled-open pair — when both are passed, this instance is driven
  // externally instead of managing open state itself. Omit both for the
  // default self-contained behavior.
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Where to land after a successful sign-in. Defaults to "/book" — see
  // InitialView's own default, which this just passes through.
  callbackUrl?: string;
  // Defaults true — a marketing-page trigger wants this. Pass false for a
  // trigger inside an already-in-progress flow that specifically requires
  // an account (e.g. a booking step gated on having one) — a guest who hit
  // that wall is already past the point where "continue as guest" applies.
  showContinueAsGuest?: boolean;
  // Replaces the bookings-icon-studios source's useContent() reads of
  // content.navbar.{logo,brand} and content.authmodal.{button.text,
  // dialog.title,dialog.description} — this component ships in
  // @iconstudios/auth-widget and renders inside other apps that don't have
  // that theme-content system, so the shop's branding/copy comes in as
  // props from whatever the host app's own call site already has (e.g.
  // bookings-icon-studios's own Navbar passing its existing
  // content.navbar.* values through once its call sites are migrated onto
  // this package). See Planning/V2/AuthModelPackagingImplementation.md.
  logo?: string;
  brandName?: string | { image: string };
  brandNameHighlight?: string;
  dialogTitle?: string;
  dialogDescription?: string;
}

export function AuthModel({
  buttonText: buttonTextProp,
  buttonSize = "default",
  buttonClassName,
  trigger = true,
  openOnSession = false,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  callbackUrl,
  showContinueAsGuest,
  logo,
  brandName,
  brandNameHighlight,
  dialogTitle,
  dialogDescription,
}: AuthModelProps) {
  const { data: session, status } = useSession();
  const [view, setView] = useState<View>("initial");
  const [sourceView, setSourceView] = useState<View>("register");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [internalOpen, setInternalOpen] = useState(false);
  // Falls back to internal state when open/onOpenChange aren't passed —
  // every existing call site keeps working exactly as it does today.
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;
  const [loginSuccess, setLoginSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const isPhoneVerificationRequired =
    openOnSession &&
    (view === "add-phone" ||
      view === "verify-phone" ||
      view === "re-verify-phone");

  useEffect(() => {
    if (openOnSession) {
      if (status === "authenticated" && session?.user) {
        const user = session.user as any;
        // Checked first, ahead of onboarding-completeness — a deactivated
        // account's status takes priority. Not blocked outright (like
        // BOUNCED) and not silently reactivated — see design doc's
        // Reactivation section. A completed sign-in already got them this
        // far, so this is just an interstitial, not a wall: it can be
        // dismissed like any other AuthModel view (not added to
        // isPhoneVerificationRequired's forced-open list below).
        if (user.isActive === false) {
          setOpen(true);
          setView("reactivate");
        } else if (!user.name || !user.phone) {
          setEmail(user.email || "");
          setOpen(true);
          setView("register");
        } else if (!user.phoneVerified) {
          setEmail(user.email || "");
          setOpen(true);
          if (user.phone) {
            setPhone(user.phone);
            setView("re-verify-phone");
            setSourceView("add-phone");
          } else {
            const verifyPhone = searchParams.get("verify-phone");
            const emailParam = searchParams.get("email");
            if (verifyPhone === "true" && emailParam) {
              setEmail(decodeURIComponent(emailParam));
              setView("add-phone");
              setSourceView("add-phone");
              setOpen(true);
              router.replace(window.location.pathname, { scroll: false });
            }
          }
        } else {
          if (open) {
            setOpen(false);
          }
        }
      } else if (status === "unauthenticated") {
        if (open) {
          setOpen(false);
        }
      }
    }

    // Handle query params separately, this can be for any AuthModel instance
    const verifyPhone = searchParams.get("verify-phone");
    const emailParam = searchParams.get("email");
    if (verifyPhone === "true" && emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setView("add-phone");
      setSourceView("add-phone");
      setOpen(true);
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [
    status,
    session,
    openOnSession,
    searchParams,
    router,
    open,
    setEmail,
    setPhone,
    setView,
    setSourceView,
    setOpen,
  ]);

  const buttonText = buttonTextProp ?? "Sign In";

  const resetToInitial = () => {
    setView("initial");
    setEmail("");
    setPhone("");
    if (!loginSuccess) {
      // Strip only this modal's own params (verify-phone/email) — the rest
      // of the query string is page state (booking's ?variant=/?date=/
      // ?time=, etc.) that must survive a plain dismiss-without-login, not
      // get wiped along with it.
      const url = new URL(window.location.href);
      url.searchParams.delete("verify-phone");
      url.searchParams.delete("email");
      router.replace(url.pathname + url.search, { scroll: false });
    }
    setLoginSuccess(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    // Prevent closing the modal if it was opened for phone verification or registration
    if (!isOpen && (isPhoneVerificationRequired || view === "register")) {
      return;
    }

    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(resetToInitial, 300); // Reset state after modal closes
    }
  };

  const handleSetView = (newView: View) => {
    // When moving to phone verification, we need to know where the user came from
    // so they can go "back" to change their phone number.
    if (newView === "verify-phone") {
      setSourceView(view);
    }
    setView(newView);
  };

  const renderView = () => {
    switch (view) {
      case "register":
        return (
          <RegisterView
            email={email}
            setView={handleSetView}
            setPhone={setPhone}
          />
        );
      case "verify-phone":
        return (
          <VerifyPhoneView
            phone={phone}
            setOpen={setOpen}
            setView={handleSetView}
            sourceView={sourceView}
            setLoginSuccess={setLoginSuccess}
          />
        );
      case "re-verify-phone":
        return (
          <ReVerifyPhoneView
            phone={phone}
            setOpen={setOpen}
            setView={handleSetView}
            sourceView={sourceView}
            setLoginSuccess={setLoginSuccess}
          />
        );
      case "add-phone":
        return (
          <AddPhoneView
            email={email}
            setView={handleSetView}
            setPhone={setPhone}
          />
        );
      case "check-email":
        return <CheckEmailView email={email} setView={handleSetView} />;
      case "reactivate":
        return <ReactivateView setOpen={setOpen} />;
      default:
        return (
          <InitialView
            setView={handleSetView}
            setEmail={setEmail}
            callbackUrl={callbackUrl}
            showContinueAsGuest={showContinueAsGuest}
            dialogTitle={dialogTitle}
            dialogDescription={dialogDescription}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      {trigger && (
        <DialogTrigger asChild>
          <Button size={buttonSize} className={buttonClassName}>
            {buttonText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-[360px]"
        hideCloseButton={isPhoneVerificationRequired || view === "register"}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {(logo || brandName) && (
          <DialogHeader className="flex flex-col items-center text-center gap-2">
            <div className="flex flex-row items-center gap-2">
              {logo && (
                <Image
                  src={logo}
                  alt={"logo"}
                  className="size-10"
                  width={40}
                  height={40}
                  unoptimized
                />
              )}
              {brandName &&
                (typeof brandName === "string" && brandNameHighlight ? (
                  <h4 className="text-3xl font-semibold">
                    {brandName}
                    <span className="text-primary">{brandNameHighlight}</span>
                  </h4>
                ) : (
                  typeof brandName === "object" &&
                  brandName.image && (
                    <Image
                      src={brandName.image}
                      alt="brand name"
                      width={150}
                      height={50}
                      className="dark:brightness-0 dark:invert"
                      unoptimized
                    />
                  )
                ))}
            </div>
          </DialogHeader>
        )}
        {renderView()}
      </DialogContent>
    </Dialog>
  );
}
