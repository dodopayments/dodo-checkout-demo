"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DodoPayments, CheckoutBreakdownData } from 'dodopayments-checkout';
import { PRODUCT_IDS } from '@/lib/product-ids';

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
const CATEGORY: 'one' | 'sub' = 'sub';

function CheckoutPageContent() {
    const searchParams = useSearchParams();
    const [breakdown, setBreakdown] = useState<Partial<CheckoutBreakdownData>>({});
    const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const productId = PRODUCT_IDS[CATEGORY][ENV][MODE];
    const theme = searchParams.get('theme') || 'light';

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

    useEffect(() => {
        async function main() {
            if (MODE === 'test') {
                const sessionId = await getCheckoutSession({
                    mode: 'test',
                    product_cart: [{
                        product_id: productId,
                        quantity: 1,
                    }]
                });
                setSessionId(sessionId);
            } else {
                const sessionId = await getCheckoutSession({ mode: 'live', product_cart: [] });
                setSessionId(sessionId);
            }
        }
        main();
    }, [productId]);

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
        if (!sessionId) return;

        DodoPayments.Initialize({
            mode: MODE,
            displayType: 'inline',
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
            }
        });
        DodoPayments.Checkout.open({
            checkoutUrl: `https://${MODE}.checkout.dodopayments.com/session/${sessionId}`,
            elementId: 'dodo-inline-checkout',
            options: {
                manualRedirect: true,
            }
        });

        let iframeWindow: Window | null = null;

        // Opener: Get iframe reference once
        function opener() {
            console.log('[Opener] Getting iframe reference...');
            const checkoutElement = document.getElementById('dodo-inline-checkout');
            const iframe = checkoutElement?.querySelector('iframe') as HTMLIFrameElement | null;
            iframeWindow = iframe?.contentWindow || null;
            console.log('[Opener] Iframe found:', !!iframe, 'Window available:', !!iframeWindow);
        }

        // Receiver: Listen for messages and forward to iframe
        function receiver(event: MessageEvent) {
            console.log('[Receiver] Message received:', event.data, 'Source:', event.source);
            
            if (!iframeWindow) {
                console.log('[Receiver] No iframe window, skipping');
                return;
            }
            
            // Forward message to iframe (even if from iframe itself)
            console.log('[Receiver] Forwarding message to iframe');
            sender(event.data);
        }

        // Sender: Send message to iframe
        function sender(data: unknown) {
            console.log('[Sender] Sending message to iframe:', data);
            
            if (!iframeWindow) {
                console.log('[Sender] No iframe window, cannot send');
                return;
            }
            
            try {
                iframeWindow.postMessage(data, '*');
                console.log('[Sender] Message sent successfully');
            } catch (error) {
                console.error('[Sender] Error sending message to iframe:', error);
            }
        }

        // Set up after iframe is created
        const timeout = setTimeout(() => {
            console.log('[Setup] Initializing opener and receiver...');
            opener();
            window.addEventListener('message', receiver);
            console.log('[Setup] Message listener added');
        }, 500);

        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
            clearTimeout(timeout);
            window.removeEventListener('message', receiver);
            DodoPayments.Checkout.close();
        };
    }, [sessionId]);

    const format = (amt: number | null | undefined, curr: string | null | undefined) =>
        amt != null && curr ? `${curr} ${(amt / 100).toFixed(2)}` : '0.00';

    const currency = breakdown.currency ?? breakdown.finalTotalCurrency ?? '';

    return (
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
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <CheckoutPageContent />
        </Suspense>
    );
}
