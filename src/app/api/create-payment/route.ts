import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get bearer token from environment variable
    const bearerToken = process.env.DODO_PAYMENTS_API_KEY
    
    if (!bearerToken) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Create one-time payment using Dodo Payments API
    const response = await fetch('https://test.dodopayments.com/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billing: body.billing,
        customer: body.customer,
        product_cart: body.product_cart,
        payment_link: true, // Generate payment link
        return_url: body.return_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
        metadata: body.metadata || {},
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('Dodo Payments API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      return NextResponse.json(
        { 
          error: 'Failed to create payment', 
          details: errorData,
          status: response.status,
          message: errorData.message || errorData.error || 'Unknown error from payment provider'
        },
        { status: response.status }
      )
    }

    const paymentData = await response.json()
    
    return NextResponse.json({
      success: true,
      payment_id: paymentData.payment_id,
      payment_link: paymentData.payment_link,
      total_amount: paymentData.total_amount,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

