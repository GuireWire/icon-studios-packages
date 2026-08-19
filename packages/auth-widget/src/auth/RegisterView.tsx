"use client";

import { useState } from "react";
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
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { SubmitButton } from "../SubmitButtons";
import { View } from "../AuthModel";
import { Eye, EyeOff, Info } from "lucide-react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { PhoneCountrySelect, PHONE_COUNTRIES } from "../PhoneCountrySelect";
import { toast } from "sonner";

const completeOnboardingSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .regex(/^[\p{L}\s'-]+$/u, {
      message:
        "Please enter a valid name. Numbers and special characters are not allowed.",
    }),
  phone: z.string().refine(isValidPhoneNumber, {
    message: "Please enter a valid phone number.",
  }),
  marketingOptOut: z.boolean(),
});

interface RegisterViewProps {
  email: string;
  setView: (view: View) => void;
  setPhone: (phone: string) => void;
}

export function RegisterView({ email, setView, setPhone }: RegisterViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof completeOnboardingSchema>>({
    resolver: zodResolver(completeOnboardingSchema),
    defaultValues: { name: "", phone: "", marketingOptOut: false },
  });

  async function onSubmit(values: z.infer<typeof completeOnboardingSchema>) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, email }),
      });

      if (res.ok) {
        setPhone(values.phone);
        const sendCodeRes = await fetch("/api/auth/send-verification-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: values.phone }),
        });
        if (sendCodeRes.ok) {
          setView("verify-phone");
        } else {
          toast.error("Failed to send verification code. Please try again.");
        }
      } else {
        const error = await res.json();
        toast.error(`Registration failed: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">Create Your Account</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input value={email} disabled />
            </FormControl>
          </FormItem>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First and Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Enter phone number"
                    {...field}
                    withCountryCallingCode
                    defaultCountry="IE"
                    countries={[
                      "IE",
                      "GB",
                      "ES",
                      "PL",
                      "FR",
                      "IT",
                      "PT",
                      "US",
                      "CA",
                      "BR",
                    ]}
                    inputComponent={Input}
                    countrySelectComponent={PhoneCountrySelect}
                    countryOptionsOrder={PHONE_COUNTRIES}
                  />
                </FormControl>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  We will send a confirmation code to your phone number.
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="marketingOptOut"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-2 space-y-0 !mt-6">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-xs text-muted-foreground leading-snug">
                  Opt out of receiving occasional offers and updates by email
                </FormLabel>
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
    </>
  );
}
