"use client";

import { Button } from "@/components/Button";
import { cx } from "@/lib/utils";
import { RiCloseLine } from "@remixicon/react";
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-choice-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-[dialogOverlayShow_150ms_cubic-bezier(0.16,1,0.3,1)]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cx(
          "relative z-50 w-full max-w-md mx-4 rounded-xl border border-gray-200 bg-white p-6 shadow-xl",
          "dark:border-gray-800 dark:bg-gray-950",
          "animate-[dialogContentShow_150ms_cubic-bezier(0.16,1,0.3,1)]"
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          <RiCloseLine className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="pr-8">
          <h2
            id="auth-choice-title"
            className="text-xl font-semibold text-gray-900 dark:text-gray-50"
          >
            {planName ? `Continue with ${planName}` : "Continue to Checkout"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to save your purchase history and access your account, or
            continue as a guest to checkout without creating an account.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
        </div>
      </div>
    </div>
  );
}

