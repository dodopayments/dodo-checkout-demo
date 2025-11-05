import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

// GET: fetch billing address for a user by email (query param)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const users = db.collection('users')

    const user = await users.findOne({ email }, { projection: { billingAddress: 1, customer: 1 } })

    return NextResponse.json({
      billingAddress: user?.billingAddress || null,
      customer: user?.customer || null,
    })
  } catch (error) {
    console.error('GET /api/billing-address error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: save/update billing address and customer details
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, billingAddress, customer } = body || {}

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!billingAddress || !billingAddress.address_line1 || !billingAddress.city || !billingAddress.country || !billingAddress.postal_code) {
      return NextResponse.json({ error: 'Incomplete billing address' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const users = db.collection('users')

    const update = await users.updateOne(
      { email },
      {
        $set: {
          billingAddress,
          customer: customer ? customer : undefined,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      } as any,
      { upsert: true } as any
    )

    return NextResponse.json({ success: true, upserted: update.upsertedCount > 0 })
  } catch (error) {
    console.error('POST /api/billing-address error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


