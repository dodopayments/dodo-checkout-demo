"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DodoPayments } from "dodopayments-checkout";
import DemoBottomPopup from "@/components/ui/DemoBottomPopup";

/**
 * Interface for checkout breakdown data received from Dodo Payments SDK
 * All amounts are in cents (smallest currency unit)
 */
interface CheckoutBreakdownData {
  subTotal?: number;
  discount?: number;
  tax?: number;
  total?: number;
  currency?: string;
  finalTotal?: number;
  finalTotalCurrency?: string;
}

/**
 * CheckoutPageContent Component
 * Displays an inline checkout form using Dodo Payments SDK
 * Handles payment verification and redirects after successful payment
 */
function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // State for order breakdown (subtotal, tax, discount, total)
  const [breakdown, setBreakdown] = useState<Partial<CheckoutBreakdownData>>(
    {}
  );
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  // Ref to ensure SDK is only initialized once
  const initializedRef = useRef(false);

  // Get checkout URL from query params or sessionStorage
  // This allows the checkout to work both on direct navigation and after redirect
  const checkoutUrl =
    searchParams.get("checkout_url") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("pending_checkout_url")
      : null);

  /**
   * Handle return from redirect checkout (e.g., after 3DS authentication or bank redirect)
   * Verifies payment status when user returns with success/error query params
   */
  useEffect(() => {
    const success = searchParams.get("success");
    const errorParam = searchParams.get("error");
    // Retrieve stored session ID from localStorage
    const sessionId =
      typeof window !== "undefined"
        ? localStorage.getItem("pending_checkout_session_id")
        : null;

    // If payment was successful, verify it with the backend
    if (success === "true" && sessionId && session?.user?.email) {
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          sessionId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            router.push("/dashboard");
          } else {
            setError("Payment verification failed");
          }
        })
        .catch(() => {
          setError("Error verifying payment");
        });
    } else if (errorParam) {
      // Show error if payment failed
      setError("Payment failed. Please try again.");
    }
  }, [searchParams, router, session]);

  /**
   * Initialize Dodo Payments SDK and open inline checkout
   * This effect runs once when the component mounts and checkoutUrl is available
   */
  useEffect(() => {
    // Redirect to pricing if no checkout URL is available
    if (!checkoutUrl && typeof window !== "undefined") {
      router.push("/pricing");
      return;
    }

    // Prevent multiple initializations
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Set timeout to log warning if checkout doesn't open within 10 seconds
    const loadingTimeout = setTimeout(() => {
      console.warn("Checkout did not open within timeout period");
    }, 10000);

    // Initialize Dodo Payments SDK with inline display type
    DodoPayments.Initialize({
      mode: "test", // Change to "live" for production
      displayType: "inline", // Display checkout inline in the page
      onEvent: (event) => {
        console.log("Checkout event:", event.event_type, event.data);
        switch (event.event_type) {
          case "checkout.opened":
            // Checkout successfully opened
            clearTimeout(loadingTimeout);
            console.log("Checkout opened successfully");
            break;

          case "checkout.breakdown":
            // Update order breakdown when pricing details change
            const message = event.data?.message as CheckoutBreakdownData;
            if (message) {
              setBreakdown(message);
            }
            break;

          case "checkout.customer_details_submitted":
            // Customer has submitted their details (no action needed)
            break;

          case "checkout.redirect":
            // Handle redirect scenarios (e.g., 3DS authentication, bank pages)
            if (event.data?.type === "success") {
              // Payment was successful after redirect
              const sessionId =
                typeof window !== "undefined"
                  ? sessionStorage.getItem("pending_checkout_session_id")
                  : null;
              // Verify payment with backend if session ID and user email are available
              if (sessionId && session?.user?.email) {
                fetch("/api/verify-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: session.user.email,
                    sessionId,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data?.success) {
                      router.push("/dashboard");
                    } else {
                      setError(data?.message || "Payment verification failed");
                    }
                  })
                  .catch((err) => {
                    console.error("Error verifying payment:", err);
                    setError("Error verifying payment");
                  });
              } else {
                // Redirect to dashboard even without verification if no session data
                router.push("/dashboard");
              }
            } else if (event.data?.type === "failure") {
              // Payment failed after redirect
              setError("Payment failed. Please try again.");
            }
            break;

          case "checkout.error":
            // Handle checkout errors
            clearTimeout(loadingTimeout);
            console.error("Checkout error:", event.data?.message);
            const errorMessage =
              typeof event.data?.message === "string"
                ? event.data.message
                : "An error occurred during checkout";
            setError(errorMessage);
            break;

          case "checkout.closed":
            // Checkout was closed by user (no action needed)
            break;
        }
      },
    });

    /**
     * Function to open checkout in the inline element
     * Retries if DOM element is not ready yet
     */
    const openCheckout = () => {
      if (checkoutUrl) {
        const element = document.getElementById("dodo-inline-checkout");
        if (element) {
          console.log("Opening checkout with URL:", checkoutUrl);
          try {
            DodoPayments.Checkout.open({
              checkoutUrl,
              elementId: "dodo-inline-checkout",
            });
          } catch (error) {
            console.error("Error opening checkout:", error);
            setError("Failed to initialize checkout. Please try again.");
            clearTimeout(loadingTimeout);
          }
        } else {
          // Retry after 100ms if element is not found
          setTimeout(openCheckout, 100);
        }
      }
    };

    // Wait a bit for DOM to be ready before opening checkout
    setTimeout(openCheckout, 100);

    // Cleanup function
    return () => {
      clearTimeout(loadingTimeout);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pending_checkout_url");
      }
      try {
        DodoPayments.Checkout.close();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [checkoutUrl, router, session]);

  /**
   * Format currency amount from cents to readable format
   * @param amount - Amount in cents (smallest currency unit)
   * @param currency - Currency code (e.g., "USD", "EUR")
   * @returns Formatted currency string or "—" if invalid
   */
  const formatCurrency = (
    amount: number | null | undefined,
    currency: string | null | undefined
  ) => {
    if (amount == null || !currency) return "—";
    // Convert from cents to dollars/currency units
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount / 100);
    return formatted;
  };

  // Determine currency to use for display (prefer finalTotalCurrency, fallback to currency, then USD)
  const currency = breakdown.currency ?? breakdown.finalTotalCurrency ?? "USD";

  return (
    <>
      <DemoBottomPopup />
      <div className="mt-36 flex flex-col overflow-hidden px-3 pt-20">
        <div className="min-h-screen max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
              Complete Your Purchase
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enter your payment details to complete your order.
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/90">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white dark:bg-red-400 dark:text-gray-900">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                    Error
                  </h3>
                  <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Checkout Form Section */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                {!checkoutUrl && (
                  <div className="py-12 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      No checkout session found. Redirecting to pricing...
                    </p>
                  </div>
                )}

                {/* Dodo Payments inline checkout will be rendered here */}
                <div
                  id="dodo-inline-checkout"
                  className="w-full min-h-[600px]"
                />
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                  Order Summary
                </h2>

                {/* Order Breakdown */}
                <div className="mt-6 space-y-4">
                  {/* Subtotal */}
                  {breakdown.subTotal != null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-50">
                        {formatCurrency(breakdown.subTotal, currency)}
                      </span>
                    </div>
                  )}

                  {/* Discount */}
                  {breakdown.discount != null && breakdown.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        -{formatCurrency(breakdown.discount, currency)}
                      </span>
                    </div>
                  )}

                  {/* Tax */}
                  {breakdown.tax != null && breakdown.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-50">
                        {formatCurrency(breakdown.tax, currency)}
                      </span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900 dark:text-gray-50">
                        Total
                      </span>
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                        {formatCurrency(
                          breakdown.finalTotal ?? breakdown.total,
                          breakdown.finalTotalCurrency ?? currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Your payment information is securely processed by Dodo
                    Payments. All transactions are encrypted and PCI compliant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * CheckoutPage Component
 * Wraps CheckoutPageContent in Suspense boundary for useSearchParams
 */
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-36 flex flex-col overflow-hidden px-3 pt-20">
          <div className="min-h-screen max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                Complete Your Purchase
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Loading checkout...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
