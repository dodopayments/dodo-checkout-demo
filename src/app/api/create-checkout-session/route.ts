import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const bearerToken = process.env.DODO_PAYMENTS_API_KEY
    if (!bearerToken) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Build payload according to Create Checkout Session
    const payload: Record<string, unknown> = {
      product_cart: body.product_cart,
      // Always return back to pricing; hosted Checkout will append its own status or error
      return_url: body.return_url || `${appUrl}/pricing`,
      allowed_payment_method_types: body.allowed_payment_method_types || ['credit', 'debit'],
      customer: body.customer ?? null,
      billing_address: body.billing_address ?? null,
      billing_currency: body.billing_currency ?? null,
      confirm: body.confirm ?? true,
      customization: body.customization ?? {
        theme: 'system',
        show_order_details: true,
        show_on_demand_tag: true,
      },
      feature_flags: body.feature_flags ?? {
        allow_currency_selection: true,
        allow_discount_code: true,
        allow_phone_number_collection: true,
        allow_tax_id: true,
        always_create_new_customer: false,
      },
      force_3ds: body.force_3ds ?? null,
      metadata: body.metadata ?? null,
      show_saved_payment_methods: body.show_saved_payment_methods ?? true,
      subscription_data: body.subscription_data ?? null,
    }

    const response = await fetch('https://test.dodopayments.com/checkouts', {
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
    })
  } catch (error) {
    console.error('Checkout session creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


