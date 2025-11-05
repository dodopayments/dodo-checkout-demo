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

    // Send usage event to Dodo Payments
    const response = await fetch('https://test.dodopayments.com/events/ingest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{
          event_id: body.event_id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customer_id: body.customer_id,
          event_name: body.event_name || 'image.generation',
          metadata: body.metadata || {},
        }]
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
      console.error('Dodo Payments Event Ingestion Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      })
      return NextResponse.json(
        { 
          error: 'Failed to send usage event', 
          details: errorData,
          status: response.status,
          message: errorData.message || errorData.error || 'Unknown error from payment provider'
        },
        { status: response.status }
      )
    }

    const eventData = await response.json()
    
    return NextResponse.json({
      success: true,
      event_data: eventData,
    })
  } catch (error) {
    console.error('Usage event ingestion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

