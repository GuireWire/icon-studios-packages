"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  GoogleAuthButton,
  AppleAuthButton,
  FacebookAuthButton,
  GuestButton,
  SubmitButton,
} from "../SubmitButtons";
import { View } from "../AuthModel";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { suggestEmail } from "../lib/email-suggestion";
import { Mail } from "lucide-react";
import { LOGO_LIGHT, LOGO_DARK } from "../logoAssets";

const initialSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

interface InitialViewProps {
  setView: (view: View) => void;
  setEmail: (email: string) => void;
  // Where to land after a successful sign-in — defaults to "/book" (the
  // pre-Phase-3 behavior) when the caller doesn't need to return anywhere
  // specific, e.g. AuthModel's own default button on the landing page.
  callbackUrl?: string;
  // Defaults true — the landing page's own AuthModel buttons (Navbar,
  // Hero, etc.) want this. The Phase 3/4 action gates inside /book
  // (booking Continue, Add to Cart, Bell, Avatar) explicitly pass false —
  // a guest who hit one of those is already IN the guest experience and
  // ran into something that specifically requires an account, so "continue
  // as guest" there would just re-open the same wall. See
  // Planning/V2/Phase4GuestChrome.md.
  showContinueAsGuest?: boolean;
  // Replaces the bookings-icon-studios source's useContent() read of
  // content.authmodal.dialog.{title,description} — this component ships in
  // @iconstudios/auth-widget and renders inside other apps that don't have
  // that theme-content system, so the copy comes in as props instead. See
  // Planning/V2/AuthModelPackagingImplementation.md.
  dialogTitle?: string;
  dialogDescription?: string;
}

export function InitialView({
  setView,
  setEmail,
  callbackUrl = "/book",
  showContinueAsGuest = true,
  dialogTitle = "Sign in or create an account",
  dialogDescription = "Sign in or create an account to continue.",
}: InitialViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState<
    "google" | "apple" | "facebook" | null
  >(null);

  // Plain client-side signIn() — not a Server Action — because this
  // component ships in @iconstudios/auth-widget and gets rendered inside
  // other apps' own builds. A Server Action's id is tied to whichever
  // Next.js build compiled it, so a form calling one only works when
  // rendered by this repo's own server; signIn() is ordinary browser code
  // shipped with next-auth/react, so it works identically no matter which
  // app renders the button (see Planning/V2/AuthModelPackagingImplementation.md).
  async function handleOAuthSignIn(
    e: React.FormEvent<HTMLFormElement>,
    provider: "google" | "apple" | "facebook",
  ) {
    e.preventDefault();
    setOauthPending(provider);
    await signIn(provider, { callbackUrl: callbackUrl || "/book" });
  }
  const form = useForm<z.infer<typeof initialSchema>>({
    resolver: zodResolver(initialSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: z.infer<typeof initialSchema>) {
    setIsSubmitting(true);
    setSuggestion(null);
    try {
      // Step 1: Validate email with our backend endpoint
      const validationResponse = await fetch("/api/auth/validate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const validationData = await validationResponse.json();

      // We now only block if the status is explicitly 'undeliverable'.
      // 'risky' emails are allowed to proceed.
      if (validationData.status === "undeliverable") {
        const errorMessage =
          validationData.reason ||
          "This email address is undeliverable. Please check for typos and try again.";
        toast.error(errorMessage);

        if (validationData.suggestion) {
          setSuggestion(validationData.suggestion);
        }

        setIsSubmitting(false);
        return;
      }

      if (validationResponse.status === 429) {
        toast.error(
          validationData.message ||
            "Too many attempts. Please wait a few minutes and try again.",
        );
        setIsSubmitting(false);
        return;
      }

      if (!validationResponse.ok) {
        toast.error(validationData.message || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Step 2: Initiate delivery tracking
      await fetch("/api/auth/track-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      // Step 3: If validation is successful, proceed with signIn
      setEmail(values.email);
      const result = await signIn("resend", {
        email: values.email,
        redirect: false,
        callbackUrl: "/book",
      });

      if (result?.error) {
        toast.error("Could not send sign-in link. Please try again.");
        console.error("Sign-in error:", result.error);
        setIsSubmitting(false);
        return;
      }

      // Immediately move to the next view
      setView("check-email");

      // Step 4: Listen for delivery confirmation via SSE — replaces a
      // 30x/1s polling loop with one connection that closes itself on the
      // first real event or a matching 30s timeout server-side. Bare path,
      // same as every other /api/auth/* call in this file — this widget
      // has no way to know which host app (and which path prefix, if any)
      // is rendering it, so it relies entirely on /api/auth/* resolving
      // correctly from either context unmodified.
      const deliveryStream = new EventSource(
        `/api/auth/delivery-status/stream?email=${encodeURIComponent(values.email)}`,
      );
      deliveryStream.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "BOUNCED") {
          toast.error(
            "Invalid email address. Please check for typos and try again.",
          );
        }
        // DELIVERED and TIMEOUT both just stop listening silently, same as
        // the polling loop this replaces.
        deliveryStream.close();
      };
      deliveryStream.onerror = () => {
        deliveryStream.close();
      };
    } catch (error) {
      console.error("Error sending sign-in link:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">{dialogTitle}</DialogTitle>
        <DialogDescription className="hidden text-center sm:block">
          {dialogDescription}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email Address"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e); // RHF's handler
                      const suggestion = suggestEmail(e.target.value);
                      setSuggestion(suggestion);
                    }}
                  />
                </FormControl>
                {suggestion && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Did you mean{" "}
                    <button
                      type="button"
                      onClick={() => {
                        if (suggestion) {
                          form.setValue("email", suggestion);
                          setSuggestion(null);
                        }
                      }}
                      className="text-primary hover:underline font-semibold"
                    >
                      {suggestion}
                    </button>
                    ?
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            text="Continue with Email"
            className="w-full"
            disabled={isSubmitting}
            icon={<Mail className="size-4" />}
          />
        </form>
      </Form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <form onSubmit={(e) => handleOAuthSignIn(e, "google")}>
          <GoogleAuthButton pending={oauthPending === "google"} />
        </form>
        <form onSubmit={(e) => handleOAuthSignIn(e, "apple")}>
          <AppleAuthButton pending={oauthPending === "apple"} />
        </form>
        <form onSubmit={(e) => handleOAuthSignIn(e, "facebook")}>
          <FacebookAuthButton pending={oauthPending === "facebook"} />
        </form>
        {showContinueAsGuest && <GuestButton />}
      </div>
      <div className="mt-0 text-center">
        <a
          href="https://iconstudios.io"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-0.5 text-sm"
        >
          <span className="text-muted-foreground">Powered by</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size
              data-URI logo, not eligible for next/image's optimization
              pipeline (no resolvable static path across consuming apps) */}
          <img
            src={LOGO_LIGHT}
            alt="Icon Studios Logo"
            width={20}
            height={20}
            className="dark:hidden"
          />
          <img
            src={LOGO_DARK}
            alt="Icon Studios Logo"
            width={20}
            height={20}
            className="hidden dark:inline"
          />
          <span className="font-semibold">
            <span className="text-black dark:text-white">Icon</span>
            <span style={{ color: "#00a0a0" }}>Studios</span>
          </span>
        </a>
      </div>
      <p className="mt-0 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a
          href="https://iconstudios.io/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="https://iconstudios.io/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Privacy Policy
        </a>
        .
      </p>
    </>
  );
}
