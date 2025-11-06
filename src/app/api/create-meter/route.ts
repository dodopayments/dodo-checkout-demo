import { NextRequest, NextResponse } from 'next/server'

// POST /api/create-meter
// Proxies meter creation to Dodo Payments API using the server-side API key.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    const bearerToken = process.env.DODO_PAYMENTS_API_KEY
    if (!bearerToken) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 },
      )
    }

    // Build payload from request or sensible defaults for image generation metering
    const payload = {
      aggregation: body?.aggregation ?? { type: 'count' },
      event_name: body?.event_name ?? 'image.generation',
      measurement_unit: body?.measurement_unit ?? 'image',
      name: body?.name ?? 'Image Generation Meter',
      description: body?.description ?? null,
      filter: body?.filter ?? null,
    }

    const response = await fetch('https://test.dodopayments.com/meters', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    let json
    try {
      json = text ? JSON.parse(text) : {}
    } catch {
      json = { message: text }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create meter',
          details: json,
          status: response.status,
          message: json?.message || json?.error || 'Unknown error from payment provider',
        },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, meter: json }, { status: 201 })
  } catch (error) {
    console.error('Create meter error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}


