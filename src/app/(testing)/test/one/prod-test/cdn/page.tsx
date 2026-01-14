"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from "next/script";
import { PRODUCT_IDS } from '@/lib/product-ids';

// Declare global DodoPaymentsCheckout type for CDN
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

interface CheckoutBreakdownData {
    subTotal?: number;
    tax?: number;
    discount?: number;
    total?: number;
    finalTotal?: number;
    currency?: string;
    finalTotalCurrency?: string;
}

interface CheckoutSessionParams {
    mode: 'test' | 'live';
    product_cart: {
        product_id: string;
        quantity: number;
    }[];
    redirect_url?: string;
}

const MODE: 'test' | 'live' = 'test';
const ENV: 'dev' | 'prod' = 'prod';
const CATEGORY: 'one' | 'sub' = 'one';

function CheckoutPageContent() {
    const searchParams = useSearchParams();
    const [breakdown, setBreakdown] = useState<Partial<CheckoutBreakdownData>>({});
    const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const initializedRef = useRef<boolean>(false);

    const productId = PRODUCT_IDS[CATEGORY][ENV][MODE];
    const theme = searchParams.get('theme') || 'light';

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

    async function getCheckoutSession({ mode, product_cart }: CheckoutSessionParams) {
        const themeParam = theme === 'dark' ? 'dark' : 'light';
        const res = await fetch(`/api/create-checkout-session/${ENV}?theme=${themeParam}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode,
                product_cart,
                redirect_url: window.location.origin + '/status'
            }),
        });
        const data = await res.json();
        return data.session_id;
    }

    async function main() {
        if (MODE === 'test') {
            const sid = await getCheckoutSession({ mode: 'test', product_cart: [] });
            setSessionId(sid);
        } else {
            const sid = await getCheckoutSession({
                mode: 'live',
                product_cart: [{
                    product_id: productId,
                    quantity: 1,
                }]
            });
            setSessionId(sid);
        }
    }

    useEffect(() => {
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

    // Initialize SDK and open checkout when both SDK is loaded and sessionId is available
    useEffect(() => {
        if (!sdkLoaded || !sessionId || !window.DodoPaymentsCheckout) return;
        if (initializedRef.current) return;

        initializedRef.current = true;

        window.DodoPaymentsCheckout.DodoPayments.Initialize({
            mode: MODE,
            displayType: 'inline',
            onEvent: (event) => {
                console.log("Dodo Checkout Event:", event.event_type, event.data);
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
            }
        });

        window.DodoPaymentsCheckout.DodoPayments.Checkout.open({
            checkoutUrl: `https://${MODE}.checkout.dodopayments.com/session/${sessionId}`,
            elementId: 'dodo-inline-checkout',
            options: {
                showTimer: false,
                showSecurityBadge: false,
                manualRedirect: true,
                payButtonText: "Grow My Instagram!",
                fontSize: "lg",
                fontWeight: "normal",
                themeConfig: themeConfig,
            }
        });

        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
            try {
                window.DodoPaymentsCheckout?.DodoPayments.Checkout.close();
            } catch {
                // Ignore cleanup errors
            }
        };
    }, [sdkLoaded, sessionId]);

    const format = (amt: number | null | undefined, curr: string | null | undefined) =>
        amt != null && curr ? `${curr} ${(amt / 100).toFixed(2)}` : '0.00';

    const currency = breakdown.currency ?? breakdown.finalTotalCurrency ?? '';

    return (
        <>
            {/* Load Dodo Payments SDK from CDN */}
            <Script
                src="https://cdn.jsdelivr.net/npm/dodopayments-checkout@1.7.1/dist/index.js"
                onLoad={() => {
                    console.log("Dodo Payments SDK loaded from CDN");
                    setSdkLoaded(true);
                }}
                onError={() => {
                    console.error("Failed to load Dodo Payments SDK from CDN");
                }}
            />

            <div className="flex flex-col md:flex-row min-h-screen">
                {/* Left Side - Checkout Form */}
                <div className="w-full md:w-1/2 flex items-center">
                    <div id="dodo-inline-checkout" className='w-full' />
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
                                <span>{format(breakdown.finalTotal ?? breakdown.total, breakdown.finalTotalCurrency ?? currency)}</span>
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
        </>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <CheckoutPageContent />
        </Suspense>
    );
}
