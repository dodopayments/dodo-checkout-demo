"use client";

import { Button } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import React from "react";

interface AuthChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onContinueAsGuest: () => void;
  planName?: string;
}

export function AuthChoiceModal({
  isOpen,
  onClose,
  onSignIn,
  onContinueAsGuest,
  planName,
}: AuthChoiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {planName ? `Continue with ${planName}` : "Continue to Checkout"}
          </DialogTitle>
          <DialogDescription>
            Sign in to save your purchase history and access your account, or
            continue as a guest to checkout without creating an account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onContinueAsGuest}
            className="w-full sm:w-auto"
          >
            Continue as Guest
          </Button>
          <Button
            variant="primary"
            onClick={onSignIn}
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

