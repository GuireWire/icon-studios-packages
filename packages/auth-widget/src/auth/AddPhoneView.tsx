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
import { SubmitButton } from "../SubmitButtons";
import { View } from "../AuthModel";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { PhoneCountrySelect, PHONE_COUNTRIES } from "../PhoneCountrySelect";
import { toast } from "sonner";
import { useState } from "react";

const addPhoneSchema = z.object({
  phone: z.string().refine(isValidPhoneNumber, {
    message: "Please enter a valid phone number.",
  }),
});

interface AddPhoneViewProps {
  email: string;
  setView: (view: View) => void;
  setPhone: (phone: string) => void;
}

export function AddPhoneView({ email, setView, setPhone }: AddPhoneViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof addPhoneSchema>>({
    resolver: zodResolver(addPhoneSchema),
    defaultValues: { phone: "" },
  });

  async function onSubmit(values: z.infer<typeof addPhoneSchema>) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/add-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone: values.phone }),
      });

      if (res.ok) {
        setPhone(values.phone);
        setView("verify-phone");
      } else {
        const error = await res.json();
        toast.error(`Failed to add phone: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding phone:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">
          Enter your phone number
        </DialogTitle>
        <DialogDescription className="text-center">
          We will send a 4-digit code to verify your phone number in order to
          continue in accessing an account for <strong>{email}</strong>.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
    </>
  );
}
