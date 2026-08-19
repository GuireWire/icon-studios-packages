"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";
import { Button } from "../ui/button";
import { SubmitButton } from "../SubmitButtons";
import { useRouter } from "next/navigation";
import { View } from "../AuthModel";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";

const verifyPhoneSchema = z.object({
  code: z.string().length(4, { message: "Code must be 4 digits." }),
});

interface VerifyPhoneViewProps {
  phone: string;
  setOpen: (open: boolean) => void;
  setView: (view: View) => void;
  sourceView: View;
  setLoginSuccess: (success: boolean) => void;
}

export function VerifyPhoneView({
  phone,
  setOpen,
  setView,
  sourceView,
  setLoginSuccess,
}: VerifyPhoneViewProps) {
  const router = useRouter();
  const { update } = useSession();
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const form = useForm<z.infer<typeof verifyPhoneSchema>>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: { code: "" },
  });

  // The code being verified was sent by AddPhoneView (ADD_PHONE) if that's
  // where this view was entered from, otherwise by RegisterView's own send
  // (RE_VERIFY) — see AuthModel's handleSetView, which captures sourceView
  // as whichever view was active right before switching to "verify-phone".
  const purpose = sourceView === "add-phone" ? "ADD_PHONE" : "RE_VERIFY";

  async function onSubmit(values: z.infer<typeof verifyPhoneSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: values.code, purpose }),
      });

      if (res.ok) {
        toast.success("Phone verified successfully!");
        await update();
        setLoginSuccess(true);
        setOpen(false);
        router.push("/book");
      } else {
        const error = await res.text();
        form.setError("code", {
          type: "manual",
          message: error || "Invalid code.",
        });
      }
    } catch (error) {
      console.error("Error verifying phone:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      const sendCodeRes = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose }),
      });
      if (sendCodeRes.ok) {
        toast.success("A new verification code has been sent.");
        setCountdown(60);
      } else {
        toast.error("Failed to send verification code. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while resending the code.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">
          Confirm your phone number
        </DialogTitle>
        <DialogDescription className="text-center">
          Please enter the 4-digit code sent to you at <strong>{phone}</strong>.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <InputOTP maxLength={4} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            text="Done"
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
          onClick={() => setView(sourceView)}
        >
          Change phone number
        </Button>
      </div>
    </>
  );
}
