"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import "./checkout-two.css";

// Declare global DodoPaymentsCheckout type
declare global {
    interface Window {
        DodoPaymentsCheckout?: {
            DodoPayments: {
                Initialize: (config: {
                    mode: "live" | "test";
                    displayType: "inline" | "popup";
                    onEvent?: (event: DodoCheckoutEvent) => void;
                }) => void;
                Checkout: {
                    open: (config: {
                        checkoutUrl: string;
                        elementId: string;
                        options?: {
                            showTimer?: boolean;
                            showSecurityBadge?: boolean;
                            manualRedirect?: boolean;
                            payButtonText?: string;
                            fontSize?: "sm" | "md" | "lg";
                            fontWeight?: "normal" | "medium" | "semibold" | "bold";
                            themeConfig?: ThemeConfig;
                        };
                    }) => void;
                    close: () => void;
                };
            };
        };
    }
}

interface DodoCheckoutEvent {
    event_type: string;
    data?: {
        message?: string | Record<string, unknown>;
        type?: string;
        [key: string]: unknown;
    };
}

interface ThemeConfig {
    light: {
        bgPrimary: string;
        buttonPrimary: string;
        buttonPrimaryHover: string;
        inputFocusBorder: string;
        buttonTextPrimary: string;
    };
    radius: string;
}

/**
 * CheckoutTwoContent Component
 * Displays an inline checkout form using Dodo Payments SDK via CDN
 */
function CheckoutTwoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [sdkLoaded, setSdkLoaded] = useState(false);

    const initializedRef = useRef<string | null>(null);

    const checkoutUrl = searchParams.get("checkout_url");

    // Theme config for the checkout
    const themeConfig: ThemeConfig = {
        light: {
            bgPrimary: "#FFFFFF",
            buttonPrimary: "#DB2F60",
            buttonPrimaryHover: "#DB2F60",
            inputFocusBorder: "#D0D5DD",
            buttonTextPrimary: "#FFFFFF",
        },
        radius: "4px",
    };

    // Handle checkout events
    const handleCheckoutEvent = (event: DodoCheckoutEvent) => {
        console.log("Dodo Checkout Event:", event.event_type, event.data);

        switch (event.event_type) {
            case "checkout.opened":
                console.log("Checkout opened successfully");
                break;

            case "checkout.breakdown":
                console.log("Checkout breakdown:", event.data?.message);
                break;

            case "checkout.customer_details_submitted":
                console.log("Customer details submitted");
                break;

            case "checkout.redirect":
                if (event.data?.type === "success") {
                    console.log("Payment successful, redirecting...");
                    router.push("/dashboard");
                } else if (event.data?.type === "failure") {
                    console.log("Payment failed");
                }
                break;

            case "checkout.error":
                console.error("Checkout error:", event.data?.message);
                break;

            case "checkout.closed":
                console.log("Checkout closed");
                break;
        }
    };

    // Initialize SDK when loaded
    useEffect(() => {
        if (!sdkLoaded || !window.DodoPaymentsCheckout) {
            return;
        }

        if (!checkoutUrl) {
            router.push("/pricing");
            return;
        }

        if (initializedRef.current === checkoutUrl) {
            return;
        }

        initializedRef.current = checkoutUrl;

        // Initialize SDK
        try {
            window.DodoPaymentsCheckout.DodoPayments.Initialize({
                mode: "test",
                displayType: "inline",
                onEvent: handleCheckoutEvent,
            });
        } catch (initError) {
            initializedRef.current = null;
            console.error("SDK initialization error:", initError);
            return;
        }

        // Open checkout
        let retryCount = 0;
        const MAX_RETRIES = 50;

        const openCheckout = () => {
            if (checkoutUrl && window.DodoPaymentsCheckout) {
                const element = document.getElementById("dodo-inline-checkout");
                if (element) {
                    console.log("Opening checkout with URL:", checkoutUrl);
                    try {
                        window.DodoPaymentsCheckout.DodoPayments.Checkout.open({
                            checkoutUrl,
                            elementId: "dodo-inline-checkout",
                            options: {
                                showTimer: false,
                                showSecurityBadge: false,
                                manualRedirect: true,
                                payButtonText: "Grow My Instagram!",
                                fontSize: "lg",
                                fontWeight: "normal",
                                themeConfig: themeConfig,
                            },
                        });
                    } catch (error) {
                        console.error("Error opening checkout:", error);
                    }
                } else {
                    if (retryCount < MAX_RETRIES) {
                        retryCount++;
                        setTimeout(openCheckout, 100);
                    } else {
                        console.error(`Failed to find checkout element after ${MAX_RETRIES} attempts`);
                    }
                }
            }
        };

        setTimeout(openCheckout, 100);

        return () => {
            try {
                window.DodoPaymentsCheckout?.DodoPayments.Checkout.close();
            } catch {
                // Ignore cleanup errors
            }
        };
    }, [sdkLoaded, checkoutUrl, router]);

    return (
        <>
            {/* Load Dodo Payments SDK from CDN */}
            <Script
                src="https://cdn.jsdelivr.net/npm/dodopayments-checkout@1.7.1/dist/index.js"
                onLoad={() => {
                    console.log("Dodo Payments SDK loaded");
                    setSdkLoaded(true);
                }}
                onError={() => {
                    console.error("Failed to load Dodo Payments SDK");
                }}
            />

            <div className="checkout-two-container">
                <div className="checkout-two-content">
                    {/* Dodo Payments Inline Checkout Container */}
                    <div id="dodo-inline-checkout"></div>
                </div>
            </div>
        </>
    );
}

/**
 * CheckoutTwoPage Component
 * Wraps CheckoutTwoContent in Suspense boundary
 */
export default function CheckoutTwoPage() {
    return (
        <Suspense
            fallback={
                <div className="checkout-two-container">
                    <div className="checkout-two-content">
                        <div className="checkout-two-loading">
                            <div className="checkout-two-loading-spinner"></div>
                            <p className="checkout-two-loading-text">Loading...</p>
                        </div>
                    </div>
                </div>
            }
        >
            <CheckoutTwoContent />
        </Suspense>
    );
}
