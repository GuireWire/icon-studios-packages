"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";
import { Button } from "../ui/button";
import { SubmitButton } from "../SubmitButtons";
import { View } from "../AuthModel";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

const verifyEmailOtpSchema = z.object({
  code: z.string().length(6, { message: "Code must be 6 digits." }),
});

interface CheckEmailViewProps {
  email: string;
  setView: (view: View) => void;
}

export function CheckEmailView({ email, setView }: CheckEmailViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const form = useForm<z.infer<typeof verifyEmailOtpSchema>>({
    resolver: zodResolver(verifyEmailOtpSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: z.infer<typeof verifyEmailOtpSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: values.code }),
      });

      if (res.ok) {
        const { redirectUrl } = await res.json();
        // Full browser navigation, not a client-side route change — this
        // request is what actually establishes the session (same as
        // clicking the emailed link), so the browser needs to process its
        // Set-Cookie and follow its redirect itself.
        window.location.href = redirectUrl;
      } else {
        const error = await res.text();
        form.setError("code", {
          type: "manual",
          message: error || "Invalid code.",
        });
      }
    } catch (error) {
      console.error("Error verifying email code:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      // Same call InitialView makes for the initial send — re-triggers
      // sendVerificationRequestEmail server-side, which sends a fresh link
      // + code together.
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/book",
      });
      if (result?.error) {
        toast.error("Could not resend sign-in email. Please try again.");
      } else {
        toast.success("A new sign-in email has been sent.");
        setCountdown(60);
      }
    } catch (error) {
      toast.error("An error occurred while resending.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setView("initial")}
        type="button"
        className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back</span>
      </button>
      <DialogHeader>
        <DialogTitle className="text-center">Check your email</DialogTitle>
        <DialogDescription className="text-center">
          We&apos;ve sent a sign-in link to <strong>{email}</strong>. Click
          the link, or enter the code below to continue.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 mt-4"
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            text="Continue"
            className="w-full"
            disabled={isSubmitting}
          />
        </form>
      </Form>
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={handleResendCode}
          disabled={countdown > 0 || isResending}
        >
          Resend code {countdown > 0 ? `(${countdown})` : ""}
        </Button>
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => setView("initial")}
        >
          Use a different email
        </Button>
      </div>
    </>
  );
}
