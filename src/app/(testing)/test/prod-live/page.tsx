"use client";

import { useEffect, useState } from 'react';
import { DodoPayments, CheckoutBreakdownData } from 'dodopayments-checkout';

interface CheckoutSessionParams {
    mode: 'test' | 'live';
    product_cart: {
        product_id: string;
        quantity: number;
    }[];
}

const MODE: 'test' | 'live' = 'live';

export default function CheckoutPage() {
    const [breakdown, setBreakdown] = useState<Partial<CheckoutBreakdownData>>({});
    const [sessionId, setSessionId] = useState<string | null>(null);

    async function getCheckoutSession({ mode, product_cart }: CheckoutSessionParams) {
        const res = await fetch(`/api/create-checkout-session/prod`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mode, product_cart }),
        });
        const data = await res.json();
        return data.session_id;
    }

    async function main() {
        if (MODE === 'test') {
            const sessionId = await getCheckoutSession({ mode: 'test', product_cart: [] });
            setSessionId(sessionId);
        } else {
            const sessionId = await getCheckoutSession({
                mode: 'live',
                product_cart: [{
                    product_id: "pdt_0NUuDjiUjtIWiPSvVCHWZ",
                    quantity: 1,
                }]
            });
            setSessionId(sessionId);
        }
    }

    useEffect(() => {
        main();
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        DodoPayments.Initialize({
            mode: MODE,
            displayType: 'inline',
            onEvent: (event) => {
                // 2. Listen for the 'checkout.breakdown' event
                if (event.event_type === "checkout.breakdown") {
                    const message = event.data?.message as CheckoutBreakdownData;
                    if (message) setBreakdown(message);
                }
            }
        });
        DodoPayments.Checkout.open({
            checkoutUrl: `https://checkout.dodopayments.com/session/${sessionId}`,
            elementId: 'dodo-inline-checkout'
        });

        return () => DodoPayments.Checkout.close();
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
        </div>
    );
}