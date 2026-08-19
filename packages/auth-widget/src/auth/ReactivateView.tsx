"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface ReactivateViewProps {
  setOpen: (open: boolean) => void;
}

// Design doc's Reactivation section: deliberately no dual-OTP gate here —
// the sign-in that got the user this far already proved channel ownership,
// and reactivation just restores an already-intact account. One click.
//
// Plain fetch to /api/auth/reactivate rather than a Server Action — this
// component ships in @iconstudios/auth-widget and renders inside other
// apps' own builds, where a "use server" action's id can't resolve. See
// Planning/V2/AuthModelPackagingImplementation.md.
export function ReactivateView({ setOpen }: ReactivateViewProps) {
  const { update } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleReactivate = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reactivate", { method: "POST" });
        if (!res.ok) {
          throw new Error("Failed to reactivate");
        }
        await update();
        toast.success("Welcome back! Your account has been reactivated.");
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Failed to reactivate your account. Please try again.");
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center">
          Your account is deactivated
        </DialogTitle>
        <DialogDescription className="text-center">
          Would you like to reactivate it? Everything will be exactly as you
          left it.
        </DialogDescription>
      </DialogHeader>
      <Button
        className="w-full mt-4"
        onClick={handleReactivate}
        disabled={isPending}
      >
        {isPending ? "Reactivating..." : "Reactivate My Account"}
      </Button>
    </>
  );
}
