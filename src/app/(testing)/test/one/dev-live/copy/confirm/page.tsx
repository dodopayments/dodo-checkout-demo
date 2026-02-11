"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  DodoPayments,
  CheckoutBreakdownData,
} from "dodopayments-checkout-old-testing";
import { PRODUCT_IDS } from "@/lib/product-ids";

interface CheckoutSessionParams {
  mode: "test" | "live";
  product_cart: {
    product_id: string;
    quantity: number;
  }[];
  redirect_url?: string;
}

const MODE: "test" | "live" = "live";
const ENV: "dev" | "prod" = "dev";
const CATEGORY: "one" | "sub" = "one";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const [breakdown, setBreakdown] = useState<Partial<CheckoutBreakdownData>>(
    {},
  );
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const productId = PRODUCT_IDS[CATEGORY][ENV][MODE];
  const theme = searchParams.get("theme") || "light";

  async function getCheckoutSession({
    mode,
    product_cart,
  }: CheckoutSessionParams) {
    console.log("product_cart", product_cart);
    const themeParam = theme === "dark" ? "dark" : "light";
    const res = await fetch(
      `/api/create-checkout-session/${ENV}?theme=${themeParam}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          product_cart,
          redirect_url: window.location.origin + "/status",
          confirm: true,
          customer: {
            email: "customer@example.com",
            name: "John Doe",
            phone_number: "+919876543210",
          },
          billing_address: {
            country: "US",
            zipcode: "440032",
          },
          minimal_address: true,
        }),
      },
    );
    const data = await res.json();
    console.log("data", data);
    return data.checkout_url;
  }

  useEffect(() => {
    async function main() {
      console.log("productId", productId);
      console.log("MODE", MODE);
        const sessionUrl = await getCheckoutSession({
          mode: "live",
          product_cart: [{ product_id: productId, quantity: 1 }],
        });
        setSessionUrl(sessionUrl);
    }
    main();
  }, []);

  function handleImmediateRedirect() {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  }

  useEffect(() => {
    if (!sessionUrl) return;

    DodoPayments.Initialize({
      mode: MODE,
      displayType: "inline",
      onEvent: (event) => {
        console.log("event", event);
        if (event.event_type === "checkout.redirect_requested") {
          const message = event.data?.message as { redirect_to: string };
          if (message) {
            setRedirectUrl(message.redirect_to);
            window.location.href = message.redirect_to;
          }
        }
        if (event.event_type === "checkout.status") {
          const message = event.data?.message as { status: string };
          if (message) setCheckoutStatus(message.status);
        }
        if (event.event_type === "checkout.breakdown") {
          const message = event.data?.message as CheckoutBreakdownData;
          if (message) setBreakdown(message);
        }
      },
    });
    DodoPayments.Checkout.open({
      checkoutUrl: sessionUrl,
      elementId: "dodo-inline-checkout",
      options: {
        manualRedirect: true,
      },
    });

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      DodoPayments.Checkout.close();
    };
  }, [sessionUrl]);

  const format = (
    amt: number | null | undefined,
    curr: string | null | undefined,
  ) => (amt != null && curr ? `${curr} ${(amt / 100).toFixed(2)}` : "0.00");

  const currency = breakdown.currency ?? breakdown.finalTotalCurrency ?? "";

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Checkout Form */}
      <div className="w-full md:w-1/2 flex items-center">
        <div id="dodo-inline-checkout" className="w-full" />
      </div>

      {/* Right Side - Custom Order Summary */}
      <div className="w-full md:w-1/2 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-2">
          {breakdown.subTotal && (
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{format(breakdown.subTotal, currency)}</span>
            </div>
          )}
          {breakdown.discount && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>{format(breakdown.discount, currency)}</span>
            </div>
          )}
          {breakdown.tax != null && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{format(breakdown.tax, currency)}</span>
            </div>
          )}
          <hr />
          {(breakdown.finalTotal ?? breakdown.total) && (
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>
                {format(
                  breakdown.finalTotal ?? breakdown.total,
                  breakdown.finalTotalCurrency ?? currency,
                )}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="w-full md:w-1/2 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold mb-4">Latest Checkout Status</h2>
        <p>{checkoutStatus}</p>
      </div>
      {redirectUrl && (
        <div className="w-full md:w-1/2 p-8 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Redirect Request</h2>
          <p className="mb-4">{redirectUrl}</p>
          <button
            onClick={handleImmediateRedirect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Redirect Now
          </button>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
