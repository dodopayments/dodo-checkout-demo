"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { CheckoutEvent, DodoPayments } from "dodopayments-checkout";
import Image from "next/image";
import { ITEMS_LIST } from "@/constants/Items";

interface CheckoutState {
  status: "idle" | "loading" | "open" | "error";
  error?: string;
}

function OverlayCheckout() {
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    status: "idle",
  });

  const [message, setMessage] = useState<string>("");

  const ListinEvents = (event: CheckoutEvent) => {
    console.log("Checkout event:", event);

    switch (event.event_type) {
      case "checkout.opened":
        setCheckoutState({ status: "open" });
        setMessage("Checkout opened");
        break;

      case "checkout.closed":
        setCheckoutState({ status: "idle" });
        setMessage("Checkout closed");
        break;

      case "checkout.redirect":
        setCheckoutState({ status: "loading" });
        window.location.href = event.data?.url as string;
        setMessage("Redirecting to payment page");
        break;

      case "checkout.error":
        setCheckoutState({
          status: "error",
          error: (event.data?.message as string) || "An error occurred",
        });
        setMessage("An error occurred");
        break;
    }
  };

  useEffect(() => {
    DodoPayments.Initialize({
      displayType: "overlay",
      linkType: "static",
      mode: "test",
      theme: "dark",
      onEvent: (event: CheckoutEvent) => {
        ListinEvents(event);
      },
    });
  }, []);

  const handleCheckout = useCallback(() => {
    try {
      setCheckoutState({ status: "loading" });
      DodoPayments.Checkout.open({
        redirectUrl: `${window.location.origin}/payment-status`,
        products: [
          {
            productId: "pdt_QWovnGwqARBqUQQbmlEI7",
            quantity: 1,
          },
        ],
      });
    } catch (error) {
      setCheckoutState({
        status: "error",
        error:
          error instanceof Error ? error.message : "Failed to open checkout",
      });
    }
  }, []);
  return (
    <section
      id="overlay-checkout"
      className="w-full py-16 bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="container px-4 mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-900">
          Experience Our Overlay Checkout
        </h2>

        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-2/5 h-64 md:h-80 relative">
            <div className="absolute inset-0 bg-gradient-to-r z-0" />
            <Image
              src={ITEMS_LIST[0].imageSrc || "/placeholder.svg"}
              alt={ITEMS_LIST[0].altText}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
            <div className="mb-2">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {ITEMS_LIST[0].title}
              </h3>
            </div>

            <p className="text-slate-700 mb-6">
              Click the button below and experience our seamless overlay
              checkout process. Fast, secure, and designed for the best checkout
              experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCheckout}
                disabled={
                  checkoutState.status === "loading" ||
                  checkoutState.status === "open"
                }
              >
                <span className="relative z-10 flex items-center gap-2">
                  {checkoutState.status === "loading" ? (
                    "Processing..."
                  ) : checkoutState.status === "open" ? (
                    "Checkout Open"
                  ) : (
                    <span>Buy Now</span>
                  )}
                </span>
              </Button>
              <Button variant="outline">Learn More</Button>
            </div>
            {message && (
              <div
                className={`mt-4 text-center ${
                  checkoutState.status === "error"
                    ? "text-red-400"
                    : checkoutState.status === "loading"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {message}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-4">
              Disclaimer: Overlay is checkout is in beta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OverlayCheckout;
