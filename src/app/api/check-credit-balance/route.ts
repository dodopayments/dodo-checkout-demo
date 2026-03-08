import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/../auth'
import clientPromise from '@/lib/mongo'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bearerToken = process.env.DODO_PAYMENTS_API_KEY

    // Pick entitlement ID based on type query param
    const type = request.nextUrl.searchParams.get('type')
    const entitlementId = type === 'one-time'
      ? process.env.CREDIT_ENTITLEMENT_ID_ONE_TIME
      : process.env.CREDIT_ENTITLEMENT_ID

    if (!bearerToken || !entitlementId) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
    }

    const client = await clientPromise
    const db = client.db()
    const user = await db.collection('users').findOne({ email: session.user.email })

    if (!user?.dodoCustomerId) {
      return NextResponse.json({ balance: 0, subscribed: false })
    }

    const response = await fetch(
      `https://test.dodopayments.com/customers/${user.dodoCustomerId}/balances/${entitlementId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json({ balance: 0, subscribed: true })
    }

    const data = await response.json()
    return NextResponse.json({
      balance: parseFloat(data.balance ?? '0'),
      subscribed: true,
    })
  } catch (error) {
    console.error('Credit balance check error:', error)
    return NextResponse.json({ error: 'Failed to fetch credit balance' }, { status: 500 })
  }
}
