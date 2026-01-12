"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DodoPayments, CheckoutBreakdownData } from "dodopayments-checkout-apple";
import DemoBottomPopup from "@/components/ui/DemoBottomPopup";

/**
 * Verify payment with the backend API
 * @param email - User's email address
 * @param sessionId - Payment session ID
 * @returns Promise resolving to verification response with success status and optional message
 * @throws Error if the API request fails
 */
async function verifyPayment(
  email: string,
  sessionId: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, sessionId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Payment verification failed: ${res.status} ${res.statusText}${errorText ? ` - ${errorText}` : ""}`
    );
  }

  return res.json();
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
  // Ref to track if SDK has been initialized for the current checkout URL
  const initializedRef = useRef<string | null>(null);
  // Ref to track the loading timeout
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to store current session for use in SDK event callbacks
  const sessionRef = useRef(session);

  // Get checkout URL from query params only
  const checkoutUrl = searchParams.get("checkout_url");

  // Update session ref when session changes
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

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
      verifyPayment(session.user.email, sessionId)
        .then((data) => {
          if (data?.success) {
            router.push("/dashboard");
          } else {
            setError("Payment verification failed");
          }
        })
        .catch((err) => {
          const errorMessage =
            err instanceof Error ? err.message : "Error verifying payment";
          setError(errorMessage);
          if (process.env.NODE_ENV === "development") {
            console.error("Payment verification error:", err);
          }
        });
    } else if (errorParam) {
      // Show error if payment failed
      setError("Payment failed. Please try again.");
    }
  }, [searchParams, router, session]);

  /**
   * Initialize Dodo Payments SDK and open inline checkout
   * This effect runs when the component mounts and checkoutUrl is available
   * Re-initializes on refresh by checking if checkoutUrl has changed
   */
  useEffect(() => {
    // Redirect to pricing if no checkout URL is available
    if (!checkoutUrl && typeof window !== "undefined") {
      router.push("/pricing");
      return;
    }

    // Skip if already initialized for this checkout URL
    if (initializedRef.current === checkoutUrl) {
      return;
    }

    // Mark as initialized for this checkout URL
    initializedRef.current = checkoutUrl;

    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Set timeout to log warning if checkout doesn't open within 10 seconds
    loadingTimeoutRef.current = setTimeout(() => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Checkout did not open within timeout period");
      }
    }, 10000);

    // Initialize Dodo Payments SDK with inline display type
    // Note: SDK may need to be re-initialized on page refresh
    try {
      DodoPayments.Initialize({
        mode: "test", // Change to "live" for production
        displayType: "inline", // Display checkout inline in the page
        onEvent: (event) => {
          if (process.env.NODE_ENV === "development") {
            console.log("Checkout event:", event.event_type, event.data);
          }
          switch (event.event_type) {
            case "checkout.opened":
              // Checkout successfully opened
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
              if (process.env.NODE_ENV === "development") {
                console.log("Checkout opened successfully");
              }
              break;

            case "checkout.breakdown": {
              // Update order breakdown when pricing details change
              const message = event.data?.message as CheckoutBreakdownData;
              if (message) {
                setBreakdown(message);
              }
              break;
            }

            case "checkout.customer_details_submitted":
              // Customer has submitted their details (no action needed)
              break;

            case "checkout.redirect": {
              // Handle redirect scenarios (e.g., 3DS authentication, bank pages)
              if (event.data?.type === "success") {
                // Payment was successful after redirect
                const sessionId =
                  typeof window !== "undefined"
                    ? localStorage.getItem("pending_checkout_session_id")
                    : null;
                // Verify payment with backend if session ID and user email are available
                const currentSession = sessionRef.current;
                if (sessionId && currentSession?.user?.email) {
                  verifyPayment(currentSession.user.email, sessionId)
                    .then((data) => {
                      if (data?.success) {
                        router.push("/dashboard");
                      } else {
                        setError(
                          data?.message || "Payment verification failed"
                        );
                      }
                    })
                    .catch((err) => {
                      const errorMessage =
                        err instanceof Error
                          ? err.message
                          : "Error verifying payment";
                      setError(errorMessage);
                      if (process.env.NODE_ENV === "development") {
                        console.error("Error verifying payment:", err);
                      }
                    });
                } else {
                  // Show error if unable to verify payment
                  setError("Unable to verify payment. Please contact support.");
                }
              } else if (event.data?.type === "failure") {
                // Payment failed after redirect
                setError("Payment failed. Please try again.");
              }
              break;
            }

            case "checkout.error": {
              // Handle checkout errors
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
                loadingTimeoutRef.current = null;
              }
              if (process.env.NODE_ENV === "development") {
                console.error("Checkout error:", event.data?.message);
              }
              const errorMessage =
                typeof event.data?.message === "string"
                  ? event.data.message
                  : "An error occurred during checkout";
              setError(errorMessage);
              break;
            }

            case "checkout.closed":
              // Checkout was closed by user (no action needed)
              break;
          }
        },
      });
    } catch (initError) {
      // If initialization fails, reset the ref so it can be retried
      initializedRef.current = null;
      if (process.env.NODE_ENV === "development") {
        console.error("SDK initialization error:", initError);
      }
      setError("Failed to initialize payment SDK. Please refresh the page.");
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      return;
    }

    /**
     * Function to open checkout in the inline element
     * Retries if DOM element is not ready yet
     */
    let retryCount = 0;
    const MAX_RETRIES = 50; // 5 seconds max (50 * 100ms)
    const openCheckout = () => {
      if (checkoutUrl) {
        const element = document.getElementById("dodo-inline-checkout");
        if (element) {
          if (process.env.NODE_ENV === "development") {
            console.log("Opening checkout with URL:", checkoutUrl);
          }
          try {
            DodoPayments.Checkout.open({
              checkoutUrl,
              elementId: "dodo-inline-checkout",
            });
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("Error opening checkout:", error);
            }
            setError("Failed to initialize checkout. Please try again.");
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
          }
        } else {
          // Retry after 100ms if element is not found
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(openCheckout, 100);
          } else {
            // Max retries reached, stop retrying and show error
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
              loadingTimeoutRef.current = null;
            }
            setError("Failed to load checkout. Please refresh the page.");
            if (process.env.NODE_ENV === "development") {
              console.error(
                `Failed to find checkout element after ${MAX_RETRIES} attempts`
              );
            }
          }
        }
      }
    };

    // Wait a bit for DOM to be ready before opening checkout
    setTimeout(openCheckout, 100);

    // Cleanup function
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      try {
        // Always close on cleanup - the SDK will handle the case where it's already closed
        DodoPayments.Checkout.close();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [checkoutUrl, router]);

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
  const currency = breakdown.finalTotalCurrency ?? breakdown.currency ?? "USD";

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
