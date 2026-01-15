import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const mode: "test" | "live" = body.mode;

        let bearerToken;
        if (mode === 'test') {
            bearerToken = process.env.DODO_PAYMENTS_PROD_TEST_API_KEY;
        } else {
            bearerToken = process.env.DODO_PAYMENTS_PROD_LIVE_API_KEY;
        }
        if (!bearerToken) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            )
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Build payload according to Create Checkout Session
        const payload: Record<string, unknown> = {
            product_cart: body.product_cart,
            return_url: body.return_url || `${appUrl}/pricing`,
            redirect_url: body.redirect_url,
            customization: {
                theme: 'light',
            },
            feature_flags: {
                redirect_immediately: true,
            },
        }

        const response = await fetch(`https://${mode}.dodopayments.com/checkouts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: 'Failed to create checkout session',
                    details: json,
                    status: response.status,
                    message: json?.message || json?.error || 'Unknown error from payment provider',
                },
                { status: response.status }
            )
        }

        return NextResponse.json({
            success: true,
            checkout_url: json.checkout_url,
            session_id: json.session_id,
            mode,
        })
    } catch (error) {
        console.error('Checkout session creation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}


