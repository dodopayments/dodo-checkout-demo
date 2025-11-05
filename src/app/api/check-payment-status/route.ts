import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongo'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection('users')

    // Find user by email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      return NextResponse.json({
        hasPaid: false,
        message: 'User not found',
      })
    }

    // Check if user has paid
    const hasPaid = user.payment === 'paid'
    const paymentType = user.paymentType

    return NextResponse.json({
      hasPaid,
      paymentType,
      subscriptionStatus: user.subscriptionStatus,
      paymentDate: user.paymentDate,
      customerId: user.customerId, // Include customer ID for usage-based tracking
      // Usage statistics
      imagesGenerated: user.imagesGenerated || 0,
      totalUsageCost: user.totalUsageCost || 0,
      lastImageGenerated: user.lastImageGenerated,
      // Credit tracking for one-time purchases
      totalCredits: user.totalCredits || 0,
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

