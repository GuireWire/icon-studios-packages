"use client";

import { useState, useEffect, useRef } from "react";
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
import { useSession } from "next-auth/react";

const verifyPhoneSchema = z.object({
  code: z.string().length(4, { message: "Code must be 4 digits." }),
});

interface ReVerifyPhoneViewProps {
  phone: string;
  setOpen: (open: boolean) => void;
  setView: (view: View) => void;
  sourceView: View;
  setLoginSuccess: (success: boolean) => void;
}

export function ReVerifyPhoneView({
  phone,
  setOpen,
  setView,
  sourceView,
  setLoginSuccess,
}: ReVerifyPhoneViewProps) {
  const router = useRouter();
  const { update } = useSession();
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const effectRan = useRef(false);

  const sendVerificationCode = async () => {
    setIsResending(true);
    try {
      const sendCodeRes = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "RE_VERIFY" }),
      });
      if (sendCodeRes.ok) {
        toast.success("A verification code has been sent.", {
          id: "reverify-toast",
        });
        setCountdown(60);
      } else {
        toast.error("Failed to send verification code. Please try again.", {
          id: "reverify-toast",
        });
      }
    } catch (error) {
      toast.error("An error occurred while sending the code.");
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (effectRan.current === true || process.env.NODE_ENV !== "development") {
      sendVerificationCode();
    }
    return () => {
      effectRan.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

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

  async function onSubmit(values: z.infer<typeof verifyPhoneSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: values.code, purpose: "RE_VERIFY" }),
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

  const handleResendCode = () => {
    if (countdown > 0 || isResending) return;
    sendVerificationCode();
  };

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
