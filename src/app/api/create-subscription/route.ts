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

    // Create subscription using Dodo Payments API
    const response = await fetch('https://test.dodopayments.com/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billing: body.billing,
        customer: body.customer,
        product_id: body.product_id,
        quantity: body.quantity || 1,
        payment_link: true, // Generate payment link
        return_url: body.return_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?subscription=success`,
        metadata: body.metadata || {},
        trial_period_days: body.trial_period_days,
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
          error: 'Failed to create subscription', 
          details: errorData,
          status: response.status,
          message: errorData.message || errorData.error || 'Unknown error from payment provider'
        },
        { status: response.status }
      )
    }

    const subscriptionData = await response.json()
    
    return NextResponse.json({
      success: true,
      subscription_id: subscriptionData.subscription_id,
      payment_id: subscriptionData.payment_id,
      payment_link: subscriptionData.payment_link,
      recurring_pre_tax_amount: subscriptionData.recurring_pre_tax_amount,
    })
  } catch (error) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


