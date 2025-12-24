"use client";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Label } from "@/components/Label";
import { Switch } from "@/components/Switch";
import { Tooltip } from "@/components/Tooltip";
import { ArrowAnimated } from "@/components/ui/ArrowAnimated";
import DemoBottomPopup from "@/components/ui/DemoBottomPopup";
import { Faqs } from "@/components/ui/Faqs";
import Testimonial from "@/components/ui/Testimonial";
import { cx } from "@/lib/utils";
import {
  RiCheckLine,
  RiCloudLine,
  RiInformationLine,
  RiSubtractLine,
  RiUserLine,
} from "@remixicon/react";
import Link from "next/link";
import React, { Fragment } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DodoPayments } from "dodopayments-checkout";
// Removed custom BillingAddressModal; unified Checkout Sessions will collect needed details

type FixedPrice = string;

interface VariablePrice {
  monthly: string;
  annually: string;
}

interface Plan {
  name: string;
  price: FixedPrice | VariablePrice;
  description: string;
  capacity: string[];
  features: string[];
  isStarter: boolean;
  isRecommended: boolean;
  buttonText: string;
  buttonLink: string;
}

const plans: Plan[] = [
  {
    name: "Pay Per Image",
    price: "$0.75",
    description:
      "Perfect for occasional creators. Pay only for what you generate.",
    capacity: ["No monthly commitment", "Pay as you go"],
    features: [
      "$0.50 - $1.00 per image",
      "Standard generation speed",
      "Basic art styles",
      "1024x1024 resolution",
      "Commercial license included",
    ],
    isStarter: true,
    isRecommended: false,
    buttonText: "Start generating",
    buttonLink: "#",
  },
  {
    name: "Credit Pack",
    price: { monthly: "$7", annually: "$7" },
    description: "One-time purchase for casual creators who want better value.",
    capacity: ["10 image credits", "Never expires"],
    features: [
      "10 high-quality images",
      "Premium art styles",
      "Up to 2048x2048 resolution",
      "Priority generation",
      "Advanced editing tools",
    ],
    isStarter: false,
    isRecommended: false,
    buttonText: "Buy credits",
    buttonLink: "#",
  },
  {
    name: "Unlimited Pro",
    price: { monthly: "$20", annually: "$16" },
    description:
      "For professional artists and content creators who need unlimited generation.",
    capacity: ["Unlimited image generation", "Commercial usage rights"],
    features: [
      "Unlimited high-quality images",
      "All premium art styles",
      "Up to 4096x4096 resolution",
      "Fastest generation speed",
      "Advanced AI models",
      "Priority customer support",
      "API access",
    ],
    isStarter: false,
    isRecommended: true,
    buttonText: "Start free trial",
    buttonLink: "#",
  },
];

interface Feature {
  name: string;
  plans: Record<string, boolean | string>;
  tooltip?: string;
}

interface Section {
  name: string;
  features: Feature[];
}

const sections: Section[] = [
  {
    name: "Generation Features",
    features: [
      {
        name: "Image Resolution",
        tooltip: "Maximum resolution available for your generated images.",
        plans: {
          "Pay Per Image": "1024x1024",
          "Credit Pack": "2048x2048",
          "Unlimited Pro": "4096x4096",
        },
      },
      {
        name: "Art Styles",
        tooltip: "Number and variety of artistic styles available.",
        plans: {
          "Pay Per Image": "Basic (10 styles)",
          "Credit Pack": "Premium (50+ styles)",
          "Unlimited Pro": "All styles (100+)",
        },
      },
      {
        name: "Generation Speed",
        tooltip: "How quickly your images are generated.",
        plans: {
          "Pay Per Image": "Standard",
          "Credit Pack": "Priority",
          "Unlimited Pro": "Fastest",
        },
      },
      {
        name: "Commercial License",
        tooltip: "Use generated images for commercial purposes.",
        plans: {
          "Pay Per Image": true,
          "Credit Pack": true,
          "Unlimited Pro": true,
        },
      },
    ],
  },
  {
    name: "Advanced Tools",
    features: [
      {
        name: "Image Editing Tools",
        tooltip: "Advanced editing capabilities for your generated art.",
        plans: {
          "Credit Pack": true,
          "Unlimited Pro": true,
        },
      },
      {
        name: "API Access",
        tooltip: "Programmatic access to generate images via API.",
        plans: { "Unlimited Pro": true },
      },
      {
        name: "Batch Generation",
        tooltip: "Generate multiple images at once.",
        plans: {
          "Credit Pack": "Up to 5",
          "Unlimited Pro": "Unlimited",
        },
      },
      {
        name: "Custom Models",
        tooltip: "Train and use your own AI models.",
        plans: { "Unlimited Pro": true },
      },
    ],
  },
  {
    name: "Usage & Storage",
    features: [
      {
        name: "Image History",
        tooltip: "How long your generated images are stored.",
        plans: {
          "Pay Per Image": "30 days",
          "Credit Pack": "1 year",
          "Unlimited Pro": "Forever",
        },
      },
      {
        name: "Monthly Generations",
        tooltip: "Number of images you can generate per month.",
        plans: {
          "Pay Per Image": "Pay as you go",
          "Credit Pack": "10 images",
          "Unlimited Pro": "Unlimited",
        },
      },
      {
        name: "Download Quality",
        tooltip: "Quality and format options for downloads.",
        plans: {
          "Pay Per Image": "Standard PNG",
          "Credit Pack": "High-quality PNG/JPG",
          "Unlimited Pro": "Lossless formats",
        },
      },
    ],
  },
  {
    name: "Support",
    features: [
      {
        name: "Community Support",
        plans: {
          "Pay Per Image": "Discord community",
          "Credit Pack": "Priority Discord",
          "Unlimited Pro": "Dedicated support",
        },
      },
      {
        name: "Response Time",
        plans: {
          "Pay Per Image": "48 hours",
          "Credit Pack": "24 hours",
          "Unlimited Pro": "4 hours",
        },
      },
    ],
  },
];

const isVariablePrice = (
  price: FixedPrice | VariablePrice
): price is VariablePrice => {
  return (price as VariablePrice).monthly !== undefined;
};

export default function Pricing() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingFrequency, setBillingFrequency] = React.useState<
    "monthly" | "annually"
  >("monthly");
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [showSuccess] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [useOverlayCheckout, setUseOverlayCheckout] = React.useState(false);
  // Inline checkout state: when true, checkout is embedded in a dedicated page
  // When false, uses overlay (modal) or redirect checkout
  const [useInlineCheckout, setUseInlineCheckout] = React.useState(false);
  // Billing modal no longer used; checkout session collects details

  // Load checkout preference from localStorage
  React.useEffect(() => {
    const savedPreference = localStorage.getItem("checkout_preference");
    if (savedPreference !== null) {
      setUseOverlayCheckout(savedPreference === "overlay");
    }
  }, []);

  // Save checkout preference to localStorage
  const handleCheckoutPreferenceChange = (useOverlay: boolean) => {
    setUseOverlayCheckout(useOverlay);
    localStorage.setItem(
      "checkout_preference",
      useOverlay ? "overlay" : "redirect"
    );
  };

  // No-op: checkout collects billing/customer if not provided

  // Initialize Dodo Payments SDK
  React.useEffect(() => {
    DodoPayments.Initialize({
      mode: "test", // Change to 'live' for production
      onEvent: (event) => {
        switch (event.event_type) {
          case "checkout.opened":
            break;
          case "checkout.payment_page_opened":
            break;
          case "checkout.customer_details_submitted":
            break;
          case "checkout.closed":
            setIsLoading(null);
            break;
          case "checkout.redirect":
            // Handle successful payment
            if (event.data?.type === "success") {
              router.push("/dashboard");
            } else if (event.data?.type === "failure") {
              setShowError(true);
              setTimeout(() => setShowError(false), 5000);
            }
            break;
          case "checkout.error":
            console.error("Checkout error:", event.data?.message);
            setShowError(true);
            setIsLoading(null);
            setTimeout(() => setShowError(false), 5000);
            break;
        }
      },
    });
  }, [router]);

  // After returning from hosted checkout, verify payment using stored session id
  React.useEffect(() => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    const hasError = params.has("error");
    if (hasError) {
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }

    const sessionId =
      typeof window !== "undefined"
        ? localStorage.getItem("pending_checkout_session_id")
        : null;
    if (sessionId && session?.user?.email) {
      (async () => {
        try {
          const res = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user!.email, sessionId }),
          });
          const data = await res.json();
          if (res.ok && data?.success) {
            router.push("/dashboard");
          }
        } catch {
          // ignore
        } finally {
          localStorage.removeItem("pending_checkout_session_id");
        }
      })();
    }
  }, [router, session]);

  const handleBuyCredits = async (planName: string) => {
    if (planName !== "Credit Pack") return;

    // Check if user is logged in
    if (!session?.user?.email) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }

    setIsLoading(planName);

    try {
      // Create unified checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Let Checkout collect customer & billing details
          customer: { email: session.user.email },
          product_cart: [
            {
              product_id: "pdt_NdPHjHDApTZcOc9zBObJg", // Replace with your actual product ID
              quantity: 1,
            },
          ],
          metadata: {
            plan: "Credit Pack",
            credits: "10",
          },
          confirm: false,
          show_saved_payment_methods: false,
          return_url: useInlineCheckout
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/checkout`
            : undefined,
          customization: {
            theme: "system",
            show_order_details: true,
            show_on_demand_tag: true,
          },
          feature_flags: {
            allow_currency_selection: true,
            allow_discount_code: true,
            allow_phone_number_collection: true,
            allow_tax_id: true,
            always_create_new_customer: true,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.checkout_url) {
        // Store session for verification after redirect if needed
        if (data.session_id) {
          localStorage.setItem("pending_checkout_session_id", data.session_id);
        }
        const url = data.checkout_url;

        // Handle checkout based on user preference: inline, overlay, or redirect
        if (useInlineCheckout) {
          // INLINE CHECKOUT: Store checkout URL and navigate to dedicated checkout page
          // The checkout will be embedded inline on /checkout page
          sessionStorage.setItem("pending_checkout_url", url);
          router.push(`/checkout?checkout_url=${encodeURIComponent(url)}`);
        } else if (useOverlayCheckout) {
          DodoPayments.Checkout.open({
            checkoutUrl: url,
          });
        } else {
          // Traditional redirect checkout
          window.location.href = url;
        }
      } else {
        console.error("Checkout session creation failed:", data);
        const msg =
          data.message ||
          data.details?.message ||
          data.error ||
          "Failed to create checkout session";
        setErrorMessage(`Checkout Error: ${msg}`);
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setErrorMessage("An error occurred. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      setIsLoading(null);
    }
  };

  const handleSubscribe = async (planName: string) => {
    if (planName !== "Unlimited Pro") return;

    // Check if user is logged in
    if (!session?.user?.email) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }

    setIsLoading(planName);

    try {
      // Create unified checkout session for subscription
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Let Checkout collect customer & billing details
          customer: { email: session.user.email },
          product_cart: [
            {
              product_id:
                billingFrequency === "monthly"
                  ? "pdt_1F8PV7ODcdsDJlTQaKXKt" // monthly subscription product
                  : "pdt_3qxV3furVGegjEoJf5GcN", // annual subscription product
              quantity: 1,
            },
          ],
          subscription_data: { trial_period_days: 14 },
          metadata: {
            plan: "Unlimited Pro",
            billing_frequency: billingFrequency,
          },
          confirm: false,
          show_saved_payment_methods: false,
          // For inline checkout: set return_url to redirect to dedicated checkout page
          // For overlay/redirect: leave undefined to use default behavior
          return_url: useInlineCheckout
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/checkout`
            : undefined,
          customization: {
            theme: "system",
            show_order_details: true,
            show_on_demand_tag: true,
          },
          feature_flags: {
            allow_currency_selection: true,
            allow_discount_code: true,
            allow_phone_number_collection: true,
            allow_tax_id: true,
            always_create_new_customer: true,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.checkout_url) {
        if (data.session_id) {
          localStorage.setItem("pending_checkout_session_id", data.session_id);
        }
        const url = data.checkout_url;

        // Handle checkout based on user preference: inline, overlay, or redirect
        if (useInlineCheckout) {
          // INLINE CHECKOUT: Store checkout URL and navigate to dedicated checkout page
          // The checkout will be embedded inline on /checkout page
          sessionStorage.setItem("pending_checkout_url", url);
          router.push(`/checkout?checkout_url=${encodeURIComponent(url)}`);
        } else if (useOverlayCheckout) {
          // OVERLAY CHECKOUT: Open checkout in a modal overlay on current page
          DodoPayments.Checkout.open({
            checkoutUrl: url,
          });
        } else {
          // REDIRECT CHECKOUT: Navigate away to hosted checkout page
          window.location.href = url;
        }
      } else {
        console.error("Checkout session (subscription) failed:", data);
        const msg =
          data.message ||
          data.details?.message ||
          data.error ||
          "Failed to create subscription checkout session";
        setErrorMessage(`Subscription Error: ${msg}`);
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Error creating subscription checkout session:", error);
      setErrorMessage("An error occurred. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      setIsLoading(null);
    }
  };

  const handleUsageBased = async (planName: string) => {
    if (planName !== "Pay Per Image") return;

    // Check if user is logged in
    if (!session?.user?.email) {
      router.push("/auth/signin?callbackUrl=/pricing");
      return;
    }

    setIsLoading(planName);

    try {
      // Best-effort: ensure a meter exists for usage tracking
      // If it already exists, the backend will return an error which we ignore
      try {
        await fetch("/api/create-meter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aggregation: { type: "count" },
            event_name: "image.generation",
            measurement_unit: "image",
            name: "Image Generation Meter",
            description: "Counts images generated by users",
            filter: null,
          }),
        });
      } catch {
        // Non-blocking
      }

      // Create unified checkout session for usage-based product
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Let Checkout collect customer & billing details
          customer: { email: session.user.email },
          product_cart: [
            {
              product_id: "pdt_xUvseunSwnTJL42kAZPau", // usage-based product ID
              quantity: 1,
            },
          ],
          metadata: {
            plan: "Pay Per Image",
            billing_type: "usage_based",
          },
          confirm: false,
          show_saved_payment_methods: false,
          // For inline checkout: set return_url to redirect to dedicated checkout page
          // For overlay/redirect: leave undefined to use default behavior
          return_url: useInlineCheckout
            ? `${typeof window !== "undefined" ? window.location.origin : ""}/checkout`
            : undefined,
          customization: {
            theme: "system",
            show_order_details: true,
            show_on_demand_tag: true,
          },
          feature_flags: {
            allow_currency_selection: true,
            allow_discount_code: true,
            allow_phone_number_collection: true,
            allow_tax_id: true,
            always_create_new_customer: true,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.checkout_url) {
        if (data.session_id) {
          localStorage.setItem("pending_checkout_session_id", data.session_id);
        }
        const url = data.checkout_url;

        // Handle checkout based on user preference: inline, overlay, or redirect
        if (useInlineCheckout) {
          // INLINE CHECKOUT: Store checkout URL and navigate to dedicated checkout page
          // The checkout will be embedded inline on /checkout page
          sessionStorage.setItem("pending_checkout_url", url);
          router.push(`/checkout?checkout_url=${encodeURIComponent(url)}`);
        } else if (useOverlayCheckout) {
          // OVERLAY CHECKOUT: Open checkout in a modal overlay on current page
          DodoPayments.Checkout.open({
            checkoutUrl: url,
          });
        } else {
          // REDIRECT CHECKOUT: Navigate away to hosted checkout page
          window.location.href = url;
        }
      } else {
        console.error("Usage-based checkout session failed:", data);

        // Extract error message with better debugging
        let errorMessage = "Failed to create usage-based checkout session";
        if (data.message) errorMessage = data.message;
        else if (data.details?.message) errorMessage = data.details.message;
        else if (data.error) errorMessage = data.error;
        else if (data.details?.code)
          errorMessage = `Error code: ${data.details.code}`;

        setErrorMessage(`Usage-Based Billing Error: ${errorMessage}`);
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Error creating usage-based checkout session:", error);
      setErrorMessage("An error occurred. Please try again.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      setIsLoading(null);
    }
  };

  // Billing submission handler removed; checkout collects data

  return (
    <>
      <DemoBottomPopup />
      <div className="px-3 pt-20">
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 rounded-xl border-2 border-green-200 bg-green-50 p-6 shadow-lg dark:border-green-800 dark:bg-green-950/90">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white dark:bg-green-400 dark:text-gray-900">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Payment Successful!
                </h3>
                <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                  Thank you for your purchase. Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {showError && (
          <div className="fixed top-4 right-4 z-50 rounded-xl border-2 border-red-200 bg-red-50 p-6 shadow-lg dark:border-red-800 dark:bg-red-950/90">
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
                  Payment Failed
                </h3>
                <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                  {errorMessage ||
                    "There was an issue processing your payment. Please try again."}
                </p>
              </div>
            </div>
          </div>
        )}

        <section
          aria-labelledby="pricing-title"
          className="animate-slide-up-fade"
          style={{
            animationDuration: "600ms",
            animationFillMode: "backwards",
          }}
        >
          <Badge>Pricing</Badge>
          <h1 className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300">
            Choose your creative journey
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-400">
            Flexible pricing for every type of creator. From pay-per-image to
            unlimited generation, find the perfect plan for your artistic
            vision.
          </p>

          {/* Demo Banner */}
          <div className="mt-8 rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 dark:border-lime-800 dark:bg-lime-950/30">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime-600 text-white dark:bg-lime-400 dark:text-gray-900">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-lime-800 dark:text-lime-200">
                Dodo Payments Demo: Three billing models -{" "}
                <strong>Usage-Based</strong>, <strong>One-Time Payment</strong>,
                and <strong>Subscription</strong>. Try overlay and redirect
                checkout.
              </p>
            </div>
          </div>
        </section>
        <section
          id="pricing-overview"
          className="mt-12 animate-slide-up-fade"
          aria-labelledby="pricing-overview"
          style={{
            animationDuration: "600ms",
            animationDelay: "200ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8 mb-6">
            {/* Billing Frequency Toggle */}
            <div className="flex items-center gap-2">
              <Label
                htmlFor="billing-switch"
                className="text-sm font-medium dark:text-gray-400"
              >
                Monthly
              </Label>
              <Switch
                id="billing-switch"
                checked={billingFrequency === "annually"}
                onCheckedChange={() =>
                  setBillingFrequency(
                    billingFrequency === "monthly" ? "annually" : "monthly"
                  )
                }
              />
              <Label
                htmlFor="billing-switch"
                className="text-sm font-medium dark:text-gray-400"
              >
                Yearly (-20%)
              </Label>
            </div>

            {/* Vertical Divider - Hidden on mobile, shown on desktop */}
            <div className="hidden h-6 w-px bg-gray-300 sm:block dark:bg-gray-700" />

            {/* Checkout Experience Toggle */}
            <div className="flex items-center gap-2">
              <Label
                htmlFor="checkout-switch"
                className="text-sm font-medium dark:text-gray-400"
              >
                Redirect Checkout
              </Label>
              <Switch
                id="checkout-switch"
                checked={useOverlayCheckout}
                onCheckedChange={handleCheckoutPreferenceChange}
              />
              <Label
                htmlFor="checkout-switch"
                className="text-sm font-medium dark:text-gray-400"
              >
                Overlay Checkout
              </Label>
            </div>

            {/* Inline Checkout Toggle */}
            {/* When enabled: checkout is embedded inline on a dedicated /checkout page */}
            {/* When disabled: uses overlay (modal) or redirect checkout */}
            <div className="flex items-center gap-2">
              <Label
                htmlFor="inline-checkout-switch"
                className="text-sm font-medium dark:text-gray-400"
              >
                Redirect Checkout
              </Label>
              <Switch
                id="inline-checkout-switch"
                checked={useInlineCheckout}
                onCheckedChange={setUseInlineCheckout}
              />
              <Label
                htmlFor="inline-checkout-switch"
                className="text-sm font-medium dark:text-gray-400"
              >
                Inline Checkout
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-3">
            {plans.map((plan, planIdx) => (
              <div key={planIdx} className="mt-6">
                {plan.isRecommended ? (
                  <div className="flex h-4 items-center">
                    <div className="relative w-full">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-lime-600 dark:border-lime-400" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs font-medium text-lime-600 dark:bg-gray-950 dark:text-lime-400">
                          Subscription
                        </span>
                      </div>
                    </div>
                  </div>
                ) : plan.name === "Pay Per Image" ? (
                  <div className="flex h-4 items-center">
                    <div className="relative w-full">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-lime-600 dark:border-lime-400" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs font-medium text-lime-600 dark:bg-gray-950 dark:text-lime-400">
                          Usage-Based
                        </span>
                      </div>
                    </div>
                  </div>
                ) : plan.name === "Credit Pack" ? (
                  <div className="flex h-4 items-center">
                    <div className="relative w-full">
                      <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                      >
                        <div className="w-full border-t border-lime-600 dark:border-lime-400" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-xs font-medium text-lime-600 dark:bg-gray-950 dark:text-lime-400">
                          One-Time Payment
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-4 items-center">
                    <div className="h-px w-full bg-gray-200 dark:bg-gray-800" />
                  </div>
                )}
                <div className="mx-auto max-w-md">
                  <h2 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {plan.name}
                  </h2>
                  <div className="mt-3 flex items-center gap-x-3">
                    <span className="text-5xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">
                      {isVariablePrice(plan.price)
                        ? billingFrequency === "monthly"
                          ? plan.price.monthly
                          : plan.price.annually
                        : plan.price}
                    </span>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      per image <br />{" "}
                      {isVariablePrice(plan.price) ? "per month" : ""}
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col justify-between">
                    <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                    <div className="mt-6">
                      {plan.name === "Pay Per Image" ? (
                        <Button
                          variant="secondary"
                          className="group w-full"
                          onClick={() => handleUsageBased(plan.name)}
                          disabled={isLoading === plan.name}
                        >
                          {isLoading === plan.name
                            ? "Processing..."
                            : plan.buttonText}
                          {isLoading !== plan.name && <ArrowAnimated />}
                        </Button>
                      ) : plan.name === "Credit Pack" ? (
                        <Button
                          className="group w-full"
                          onClick={() => handleBuyCredits(plan.name)}
                          disabled={isLoading === plan.name}
                        >
                          {isLoading === plan.name
                            ? "Processing..."
                            : plan.buttonText}
                          {isLoading !== plan.name && <ArrowAnimated />}
                        </Button>
                      ) : plan.name === "Unlimited Pro" ? (
                        <Button
                          className="group w-full"
                          onClick={() => handleSubscribe(plan.name)}
                          disabled={isLoading === plan.name}
                        >
                          {isLoading === plan.name
                            ? "Processing..."
                            : plan.buttonText}
                          {isLoading !== plan.name && <ArrowAnimated />}
                        </Button>
                      ) : (
                        <Button asChild className="group">
                          <Link href={plan.buttonLink}>
                            {plan.buttonText}
                            <ArrowAnimated />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  <ul
                    role="list"
                    className="mt-8 text-sm text-gray-700 dark:text-gray-400"
                  >
                    {plan.capacity.map((feature, index) => (
                      <li
                        key={feature}
                        className="flex items-center gap-x-3 py-1.5"
                      >
                        {index === 0 && (
                          <RiUserLine
                            className="size-4 shrink-0 text-gray-500"
                            aria-hidden="true"
                          />
                        )}
                        {index === 1 && (
                          <RiCloudLine
                            className="size-4 shrink-0 text-gray-500"
                            aria-hidden="true"
                          />
                        )}
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ul
                    role="list"
                    className="mt-4 text-sm text-gray-700 dark:text-gray-400"
                  >
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-x-3 py-1.5"
                      >
                        <RiCheckLine
                          className="size-4 shrink-0 text-lime-600 dark:text-lime-400"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="testimonial"
          className="mx-auto mt-20 max-w-xl sm:mt-32 lg:max-w-6xl"
          aria-labelledby="testimonial"
        >
          <Testimonial />
        </section>

        {/* plan details (xs-lg)*/}
        <section
          id="pricing-details"
          className="mt-20 sm:mt-36"
          aria-labelledby="pricing-details"
        >
          <div className="mx-auto space-y-8 sm:max-w-md lg:hidden">
            {plans.map((plan) => (
              <div key={plan.name}>
                <div className="rounded-xl bg-gray-400/5 p-6 ring-1 ring-inset ring-gray-200 dark:ring-gray-800">
                  <h2
                    id={plan.name}
                    className="text-base font-semibold leading-6 text-gray-900 dark:text-gray-50"
                  >
                    {plan.name}
                  </h2>
                  <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    {isVariablePrice(plan.price)
                      ? `${
                          billingFrequency === "monthly"
                            ? plan.price.monthly
                            : plan.price.annually
                        } / per month`
                      : plan.price}
                  </p>
                </div>
                <ul
                  role="list"
                  className="mt-10 space-y-10 text-sm leading-6 text-gray-900 dark:text-gray-50"
                >
                  {sections.map((section) => (
                    <li key={section.name}>
                      <h3 className="font-semibold">{section.name}</h3>
                      <ul
                        role="list"
                        className="mt-2 divide-y divide-gray-200 dark:divide-gray-800"
                      >
                        {section.features.map((feature) =>
                          feature.plans[plan.name] ? (
                            <li
                              key={feature.name}
                              className="flex gap-x-3 py-2.5"
                            >
                              <RiCheckLine
                                className="size-5 flex-none text-lime-600 dark:text-lime-400"
                                aria-hidden="true"
                              />
                              <span>
                                {feature.name}{" "}
                                {typeof feature.plans[plan.name] ===
                                "string" ? (
                                  <span className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                                    ({feature.plans[plan.name]})
                                  </span>
                                ) : null}
                              </span>
                            </li>
                          ) : null
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* plan details (lg+) */}
        <section className="mx-auto mt-20">
          <div className="mt-20 hidden sm:mt-28 lg:block">
            <div className="relative">
              <div className="sticky top-0 z-20 h-28 w-full bg-white dark:bg-gray-950" />
              <table className="w-full table-fixed border-separate border-spacing-0 text-left">
                <caption className="sr-only">Pricing plan comparison</caption>
                <colgroup>
                  <col className="w-2/5" />
                  <col className="w-1/5" />
                  <col className="w-1/5" />
                  <col className="w-1/5" />
                </colgroup>
                <thead className="sticky top-28">
                  <tr>
                    <th
                      scope="col"
                      className="border-b border-gray-100 bg-white pb-8 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="font-semibold leading-7 text-gray-900 dark:text-gray-50">
                        Compare plans
                      </div>
                      <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        Choose the best plan for your needs
                      </div>
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.name}
                        scope="col"
                        className="border-b border-gray-100 bg-white px-6 pb-8 lg:px-8 dark:border-gray-800 dark:bg-gray-950"
                      >
                        <div
                          className={cx(
                            !plan.isStarter
                              ? "text-lime-600 dark:text-lime-400"
                              : "text-gray-900 dark:text-gray-50",
                            "font-semibold leading-7"
                          )}
                        >
                          {plan.name}
                        </div>
                        <div className="text-sm font-normal text-gray-600 dark:text-gray-400">
                          {isVariablePrice(plan.price)
                            ? `${
                                billingFrequency === "monthly"
                                  ? plan.price.monthly
                                  : plan.price.annually
                              } / per month`
                            : plan.price}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section, sectionIdx) => (
                    <Fragment key={section.name}>
                      <tr>
                        <th
                          scope="colgroup"
                          colSpan={4}
                          className={cx(
                            sectionIdx === 0 ? "pt-14" : "pt-10",
                            "border-b border-gray-100 pb-4 text-base font-semibold leading-6 text-gray-900 dark:border-gray-800 dark:text-gray-50"
                          )}
                        >
                          {section.name}
                        </th>
                      </tr>
                      {section.features.map((feature) => (
                        <tr
                          key={feature.name}
                          className="transition hover:bg-lime-50/30 dark:hover:bg-lime-800/5"
                        >
                          <th
                            scope="row"
                            className="flex items-center gap-2 border-b border-gray-100 py-4 text-sm font-normal leading-6 text-gray-900 dark:border-gray-800 dark:text-gray-50"
                          >
                            <span>{feature.name}</span>
                            {feature.tooltip ? (
                              <Tooltip side="right" content={feature.tooltip}>
                                <RiInformationLine
                                  className="size-4 shrink-0 text-gray-700 dark:text-gray-400"
                                  aria-hidden="true"
                                />
                              </Tooltip>
                            ) : null}
                          </th>
                          {plans.map((plan) => (
                            <td
                              key={plan.name}
                              className="border-b border-gray-100 px-6 py-4 lg:px-8 dark:border-gray-800"
                            >
                              {typeof feature.plans[plan.name] === "string" ? (
                                <div className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                                  {feature.plans[plan.name]}
                                </div>
                              ) : (
                                <>
                                  {feature.plans[plan.name] === true ? (
                                    <RiCheckLine
                                      className="h-5 w-5 text-lime-600 dark:text-lime-400"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <RiSubtractLine
                                      className="h-5 w-5 text-gray-400 dark:text-gray-600"
                                      aria-hidden="true"
                                    />
                                  )}

                                  <span className="sr-only">
                                    {feature.plans[plan.name] === true
                                      ? "Included"
                                      : "Not included"}{" "}
                                    in {plan.name}
                                  </span>
                                </>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                  <tr>
                    <th
                      scope="row"
                      className="pt-6 text-sm font-normal leading-6 text-gray-900 dark:text-gray-50"
                    >
                      <span className="sr-only">Link to activate plan</span>
                    </th>
                    {plans.map((plan) => (
                      <td key={plan.name} className="px-6 pt-6 lg:px-8">
                        {plan.name === "Pay Per Image" ? (
                          <Button
                            variant="light"
                            onClick={() => handleUsageBased(plan.name)}
                            disabled={isLoading === plan.name}
                            className="group bg-transparent px-0 text-base hover:bg-transparent dark:bg-transparent hover:dark:bg-transparent"
                          >
                            {isLoading === plan.name
                              ? "Processing..."
                              : plan.buttonText}
                            {isLoading !== plan.name && <ArrowAnimated />}
                          </Button>
                        ) : plan.name === "Credit Pack" ? (
                          <Button
                            variant="light"
                            onClick={() => handleBuyCredits(plan.name)}
                            disabled={isLoading === plan.name}
                            className="group bg-transparent px-0 text-base text-lime-600 hover:bg-transparent dark:bg-transparent dark:text-lime-400 hover:dark:bg-transparent"
                          >
                            {isLoading === plan.name
                              ? "Processing..."
                              : plan.buttonText}
                            {isLoading !== plan.name && <ArrowAnimated />}
                          </Button>
                        ) : plan.name === "Unlimited Pro" ? (
                          <Button
                            variant="light"
                            onClick={() => handleSubscribe(plan.name)}
                            disabled={isLoading === plan.name}
                            className="group bg-transparent px-0 text-base text-lime-600 hover:bg-transparent dark:bg-transparent dark:text-lime-400 hover:dark:bg-transparent"
                          >
                            {isLoading === plan.name
                              ? "Processing..."
                              : plan.buttonText}
                            {isLoading !== plan.name && <ArrowAnimated />}
                          </Button>
                        ) : (
                          <Button
                            variant="light"
                            asChild
                            className="group bg-transparent px-0 text-base text-lime-600 hover:bg-transparent dark:bg-transparent dark:text-lime-400 hover:dark:bg-transparent"
                          >
                            <Link href={plan.buttonLink}>
                              {plan.buttonText}
                              <ArrowAnimated />
                            </Link>
                          </Button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <Faqs />
      </div>
      {/* Billing modal removed; checkout handles data collection */}
    </>
  );
}
