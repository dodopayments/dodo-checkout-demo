import { NextRequest, NextResponse } from 'next/server'

// POST /api/debit-credit
// Synchronously debits a credit entitlement via a ledger entry, rather than the
// events/ingest + meter pipeline (meters can't attach to the one-time Starter
// Credits product, and lag ~1 minute even where they do apply) — mobile's
// Generate flow needs the balance to reflect the debit immediately.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))

    const bearerToken = process.env.DODO_PAYMENTS_API_KEY
    if (!bearerToken) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const entitlementId = body?.type === 'starter-credits'
      ? process.env.CREDIT_ENTITLEMENT_ID_STARTER_CREDITS
      : process.env.CREDIT_ENTITLEMENT_ID

    if (!entitlementId) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
    }

    if (!body?.customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })
    }

    const response = await fetch(
      `https://test.dodopayments.com/credit-entitlements/${entitlementId}/balances/${body.customer_id}/ledger-entries`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: String(body.amount ?? 1),
          entry_type: 'debit',
          reason: body.reason ?? 'image_generation',
          idempotency_key: body.idempotency_key ?? null,
        }),
      }
    )

    const json = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Failed to debit credits',
          details: json,
          status: response.status,
          message: json?.message || json?.error || 'Unknown error from payment provider',
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, ledger: json })
  } catch (error) {
    console.error('Credit debit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
